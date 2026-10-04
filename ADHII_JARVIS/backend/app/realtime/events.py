import asyncio
import base64
import uuid
from datetime import datetime, date
from typing import Dict, Any
from app.realtime.socket_manager import socket_manager, sio
from app.core.security import verify_supabase_token, DEMO_USER
from app.core.logging import logger
from app.ai.orchestrator import orchestrator
from app.voice.stt_service import get_stt_provider
from app.voice.tts_service import get_tts_provider
from app.database.repositories.conversations_repo import conversations_repo
from app.database.repositories.tool_activity_repo import tool_activity_repo

def serialize_for_socket(obj: Any) -> Any:
    """Recursively convert datetime and UUID objects to JSON-serializable types."""
    if isinstance(obj, dict):
        return {k: serialize_for_socket(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [serialize_for_socket(i) for i in obj]
    elif isinstance(obj, (datetime, date)):
        return obj.isoformat()
    elif isinstance(obj, uuid.UUID):
        return str(obj)
    return obj

async def safe_emit(event: str, data: Any = None, room: str = None):
    """Safely emit an event over Socket.IO with guaranteed JSON serialization."""
    serialized = serialize_for_socket(data) if data is not None else None
    await sio.emit(event, serialized, room=room)


def register_socket_events():
    """Register all Socket.IO client and server lifecycle event listeners."""

    @sio.event
    async def connect(sid, environ, auth):
        token = None
        if auth and isinstance(auth, dict):
            token = auth.get("token")
        if not token:
            query = environ.get("QUERY_STRING", "")
            for param in query.split("&"):
                if param.startswith("token="):
                    token = param.split("=", 1)[1]
                    break

        try:
            if token:
                user = await verify_supabase_token(token)
            else:
                user = DEMO_USER
            socket_manager.user_sessions[sid] = user
            socket_manager.audio_buffers[sid] = bytearray()
            logger.info(f"Socket connected: sid={sid}, user_id={user['id'][:8]}")
            return True
        except Exception as e:
            logger.warning(f"Socket connection rejected: {e}")
            return False

    @sio.event
    async def disconnect(sid):
        socket_manager.cancel_task(sid)
        socket_manager.user_sessions.pop(sid, None)
        socket_manager.audio_buffers.pop(sid, None)
        logger.info(f"Socket disconnected: sid={sid}")

    @sio.event
    async def chat_send(sid, data):
        # Support both 'chat:send' and 'chat_send'
        await handle_chat_send(sid, data)

    @sio.on("chat:send")
    async def on_chat_send(sid, data):
        await handle_chat_send(sid, data)

    async def handle_chat_send(sid, data):
        user = await socket_manager.get_user_from_sid(sid)
        if not user:
            await safe_emit("assistant:error", {"error": "Unauthorized socket session"}, room=sid)
            return

        conv_id = data.get("conversation_id")
        user_msg = data.get("message", "").strip()
        voice_mode = bool(data.get("voice_response", False))

        if not user_msg:
            return

        # Ensure conversation exists or create one
        if not conv_id:
            new_conv = conversations_repo.create(user["id"], title="New Conversation")
            conv_id = new_conv["id"]

        # Cancel any ongoing generation for this client
        socket_manager.cancel_task(sid)

        async def run_pipeline():
            accumulated_response = ""
            try:
                async for item in orchestrator.stream_message(
                    user_id=user["id"],
                    conversation_id=conv_id,
                    user_message=user_msg
                ):
                    event_name = item["event"]
                    event_data = item["data"]
                    await safe_emit(event_name, event_data, room=sid)

                    if event_name == "assistant:token":
                        accumulated_response += event_data.get("token", "")

                # If voice mode enabled and text was generated, trigger TTS
                if voice_mode and accumulated_response.strip():
                    try:
                        await safe_emit("tts:start", {"conversation_id": conv_id}, room=sid)
                        tts = get_tts_provider()
                        audio_bytes = await tts.synthesize(accumulated_response[:600])
                        b64_audio = base64.b64encode(audio_bytes).decode("utf-8")
                        await safe_emit("tts:audio", {"audio": b64_audio, "format": "mp3"}, room=sid)
                        await safe_emit("tts:end", {"conversation_id": conv_id}, room=sid)
                    except Exception as tts_err:
                        logger.warning(f"TTS synthesis error: {tts_err}")
                        await safe_emit("tts:end", {"error": str(tts_err)}, room=sid)

            except asyncio.CancelledError:
                logger.info(f"Stream cancelled by client: sid={sid}")
                await safe_emit("assistant:stopped", {"conversation_id": conv_id}, room=sid)
            except Exception as e:
                logger.error(f"Error in chat streaming pipeline: {e}", exc_info=True)
                err_text = "I encountered a brief rate limit from the AI model. Please wait a moment and try asking again." if "429" in str(e) else f"Error: {e}"
                try:
                    msg = conversations_repo.add_message(
                        user_id=user["id"],
                        conv_id=conv_id,
                        role="assistant",
                        content=err_text,
                        message_type="text"
                    )
                    await safe_emit("assistant:complete", {
                        "conversation_id": conv_id,
                        "message_id": msg["id"],
                        "content": err_text
                    }, room=sid)
                except Exception:
                    await safe_emit("assistant:error", {"error": str(e)}, room=sid)


        task = asyncio.create_task(run_pipeline())
        socket_manager.active_tasks[sid] = task

    @sio.on("chat:stop")
    async def on_chat_stop(sid, data=None):
        socket_manager.cancel_task(sid)
        await safe_emit("assistant:stopped", {"status": "stopped"}, room=sid)

    @sio.on("voice:start")
    async def on_voice_start(sid, data=None):
        socket_manager.audio_buffers[sid] = bytearray()
        logger.info(f"Voice recording started for sid {sid}")

    @sio.on("voice:audio")
    async def on_voice_audio(sid, data):
        chunk_b64 = data.get("chunk")
        if chunk_b64 and sid in socket_manager.audio_buffers:
            try:
                raw_bytes = base64.b64decode(chunk_b64)
                socket_manager.audio_buffers[sid].extend(raw_bytes)
            except Exception as e:
                logger.warning(f"Invalid voice audio chunk: {e}")

    @sio.on("voice:end")
    async def on_voice_end(sid, data=None):
        user = await socket_manager.get_user_from_sid(sid)
        if not user:
            return

        audio_bytes = bytes(socket_manager.audio_buffers.get(sid, bytearray()))
        socket_manager.audio_buffers[sid] = bytearray()

        transcript = ""
        # If client passed client-side speech transcript directly (Web Speech API)
        if data and data.get("transcript"):
            transcript = data.get("transcript").strip()
        elif len(audio_bytes) > 1000:
            stt = get_stt_provider()
            try:
                transcript = await stt.transcribe(audio_bytes)
            except Exception as e:
                logger.warning(f"Voice STT failed: {e}")
                await safe_emit("assistant:error", {"error": f"Speech transcription failed: {e}"}, room=sid)
                return

        if transcript:
            await safe_emit("voice:transcript", {"transcript": transcript}, room=sid)
            # Automatically feed into chat pipeline with voice response enabled
            conv_id = (data or {}).get("conversation_id")
            await handle_chat_send(sid, {
                "conversation_id": conv_id,
                "message": transcript,
                "voice_response": True
            })

    @sio.on("tool:confirm")
    async def on_tool_confirm(sid, data):
        user = await socket_manager.get_user_from_sid(sid)
        if not user:
            return

        tool_act_id = data.get("tool_activity_id")
        conv_id = data.get("conversation_id")
        confirmed = data.get("confirmed", True)

        if not tool_act_id:
            return

        if confirmed:
            try:
                result = await orchestrator.execute_confirmed_tool(user_id=user["id"], tool_activity_id=tool_act_id)
                await safe_emit("tool:completed", {
                    "tool_activity_id": tool_act_id,
                    "result": result
                }, room=sid)

                # Append success message to conversation
                success_text = f"Action confirmed and completed successfully: {result.get('result', {}).get('message', 'Completed')}"
                msg = conversations_repo.add_message(
                    user_id=user["id"],
                    conv_id=conv_id,
                    role="assistant",
                    content=success_text,
                    message_type="tool_result"
                )
                await safe_emit("assistant:complete", {
                    "conversation_id": conv_id,
                    "message_id": msg["id"],
                    "content": success_text
                }, room=sid)

            except Exception as e:
                await safe_emit("tool:error", {"tool_activity_id": tool_act_id, "error": str(e)}, room=sid)
        else:
            tool_activity_repo.update(user["id"], tool_act_id, status="rejected")
            cancel_text = "Action was cancelled. No changes were made."
            if conv_id:
                msg = conversations_repo.add_message(
                    user_id=user["id"],
                    conv_id=conv_id,
                    role="assistant",
                    content=cancel_text,
                    message_type="text"
                )
                await safe_emit("assistant:complete", {
                    "conversation_id": conv_id,
                    "message_id": msg["id"],
                    "content": cancel_text
                }, room=sid)

# Register handlers immediately
register_socket_events()
