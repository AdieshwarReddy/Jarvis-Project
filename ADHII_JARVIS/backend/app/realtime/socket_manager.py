import asyncio
import base64
from typing import Dict, Any, Optional
import socketio
from app.core.config import settings
from app.core.logging import logger
from app.core.security import verify_supabase_token, DEMO_USER

class SocketManager:
    """Manages Socket.IO ASGI server, active client sessions, and generation jobs."""
    def __init__(self):
        self.sio = socketio.AsyncServer(
            async_mode="asgi",
            cors_allowed_origins="*",
            logger=False,
            engineio_logger=False
        )
        self.active_tasks: Dict[str, asyncio.Task] = {}  # sid -> running asyncio Task
        self.user_sessions: Dict[str, Dict[str, Any]] = {}  # sid -> user dict
        self.audio_buffers: Dict[str, bytearray] = {}  # sid -> recorded audio buffer

    async def get_user_from_sid(self, sid: str) -> Optional[Dict[str, Any]]:
        return self.user_sessions.get(sid)

    def cancel_task(self, sid: str):
        if sid in self.active_tasks:
            task = self.active_tasks[sid]
            if not task.done():
                task.cancel()
                logger.info(f"Cancelled active streaming task for sid {sid}")
            del self.active_tasks[sid]

socket_manager = SocketManager()
sio = socket_manager.sio
