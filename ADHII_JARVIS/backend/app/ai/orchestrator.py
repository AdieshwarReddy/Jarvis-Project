import asyncio
from typing import Dict, Any, List, Optional, AsyncGenerator
from app.ai.providers import get_llm_provider
from app.ai.context_builder import context_builder
from app.ai.tool_router import tool_router
from app.tools.registry import tool_registry
from app.memory.long_term import long_term_memory
from app.memory.summarizer import summarizer
from app.database.repositories.conversations_repo import conversations_repo
from app.database.repositories.profiles_repo import profiles_repo
from app.database.repositories.tool_activity_repo import tool_activity_repo
from app.database.repositories.documents_repo import documents_repo
from app.core.logging import logger

class AIOrchestrator:
    """
    Central AI workflow orchestrator for Adhii Jarvis.
    Directs conversation flow, memory retrieval, tool execution, confirmation gates,
    and LLM streaming delivery.
    """

    async def process_message(
        self,
        user_id: str,
        conversation_id: str,
        user_message: str,
        stream: bool = True
    ) -> Dict[str, Any]:
        """
        Non-streaming orchestration entry point.
        Returns final assistant response and any tool actions.
        """
        # 1. Fetch user profile
        profile = profiles_repo.get(user_id)
        
        # 2. Save user message to database
        user_msg_rec = conversations_repo.add_message(
            user_id=user_id,
            conv_id=conversation_id,
            role="user",
            content=user_message,
            message_type="text"
        )

        # 3. Check for qualifying long-term memory
        long_term_memory.extract_and_store_memory(user_id, user_message)

        # 4. Check for tool invocation
        tool_intent = tool_router.identify_tool(user_message, user_profile=profile)
        
        # 5. If write-tool requiring confirmation:
        if tool_intent and tool_intent["requires_confirmation"]:
            # Log pending activity
            act = tool_activity_repo.log(
                user_id=user_id,
                tool_name=tool_intent["tool_name"],
                request_summary=tool_intent["summary"],
                status="pending",
                requires_confirmation=True,
                conversation_id=conversation_id,
                parameters=tool_intent["parameters"]
            )
            
            prompt_content = f"I have prepared to {tool_intent['summary'].lower()}. Please confirm below to proceed with this action."
            asst_msg_rec = conversations_repo.add_message(
                user_id=user_id,
                conv_id=conversation_id,
                role="assistant",
                content=prompt_content,
                message_type="tool_call",
                tool_name=tool_intent["tool_name"]
            )
            return {
                "message": asst_msg_rec,
                "tool_confirmation_required": True,
                "tool_activity": act
            }

        # 6. If read-only tool: execute directly
        tool_result_context = ""
        if tool_intent and not tool_intent["requires_confirmation"]:
            tool_def = tool_registry.get(tool_intent["tool_name"])
            if tool_def:
                try:
                    tool_res = await tool_def.execute(user_id=user_id, **tool_intent["parameters"])
                    tool_activity_repo.log(
                        user_id=user_id,
                        tool_name=tool_intent["tool_name"],
                        request_summary=tool_intent["summary"],
                        status="executed",
                        requires_confirmation=False,
                        conversation_id=conversation_id,
                        parameters=tool_intent["parameters"],
                        result=tool_res
                    )
                    tool_result_context = f"\n[TOOL RESULT FOR {tool_intent['tool_name']}]:\n{tool_res}"
                except Exception as e:
                    logger.error(f"Safe tool execution error: {e}")
                    tool_result_context = f"\n[TOOL ERROR]: {e}"

        # 7. Check for document context if relevant
        doc_chunks = documents_repo.search_chunks(user_id=user_id, query=user_message, limit=3)

        # 8. Load conversation history
        conv_data = conversations_repo.get(user_id=user_id, conv_id=conversation_id)
        history = conv_data.get("messages", [])
        summary = conv_data.get("summary")

        # 9. Build context
        full_query = user_message + tool_result_context
        messages = context_builder.build_context(
            user_id=user_id,
            user_message=full_query,
            history=history[:-1],  # Exclude latest message just added
            summary=summary,
            profile=profile,
            rag_chunks=doc_chunks,
            response_style=profile.get("preferred_language", "Balanced")
        )

        # 10. Generate response
        llm = get_llm_provider()
        response_text = await llm.generate(messages)

        # 11. Save assistant message
        asst_msg_rec = conversations_repo.add_message(
            user_id=user_id,
            conv_id=conversation_id,
            role="assistant",
            content=response_text,
            message_type="text"
        )

        # 12. Update conversation summary if threshold met
        if summarizer.should_summarize(len(history)):
            new_summary = summarizer.create_summary(history, summary)
            conversations_repo.update(user_id, conversation_id, {"summary": new_summary})

        return {
            "message": asst_msg_rec,
            "tool_confirmation_required": False,
            "tool_activity": None
        }

    async def stream_message(
        self,
        user_id: str,
        conversation_id: str,
        user_message: str
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Streaming orchestration pipeline yielding tokens and tool events.
        """
        profile = profiles_repo.get(user_id)

        # Save user message
        user_msg = conversations_repo.add_message(
            user_id=user_id,
            conv_id=conversation_id,
            role="user",
            content=user_message,
            message_type="text"
        )

        long_term_memory.extract_and_store_memory(user_id, user_message)

        # Check for tool intent
        tool_intent = tool_router.identify_tool(user_message, user_profile=profile)

        # Handle write tool requiring confirmation
        if tool_intent and tool_intent["requires_confirmation"]:
            act = tool_activity_repo.log(
                user_id=user_id,
                tool_name=tool_intent["tool_name"],
                request_summary=tool_intent["summary"],
                status="pending",
                requires_confirmation=True,
                conversation_id=conversation_id,
                parameters=tool_intent["parameters"]
            )
            
            prompt_content = f"I am ready to {tool_intent['summary'].lower()}. Please confirm below to proceed."
            asst_msg = conversations_repo.add_message(
                user_id=user_id,
                conv_id=conversation_id,
                role="assistant",
                content=prompt_content,
                message_type="tool_call",
                tool_name=tool_intent["tool_name"]
            )
            
            yield {
                "event": "tool:requested",
                "data": {
                    "tool_activity_id": act["id"],
                    "tool_name": tool_intent["tool_name"],
                    "summary": tool_intent["summary"],
                    "parameters": tool_intent["parameters"],
                    "message": asst_msg
                }
            }
            return

        # Execute safe tool if requested
        tool_result_context = ""
        if tool_intent and not tool_intent["requires_confirmation"]:
            yield {
                "event": "tool:started",
                "data": {"tool_name": tool_intent["tool_name"], "summary": tool_intent["summary"]}
            }
            tool_def = tool_registry.get(tool_intent["tool_name"])
            if tool_def:
                try:
                    tool_res = await tool_def.execute(user_id=user_id, **tool_intent["parameters"])
                    act = tool_activity_repo.log(
                        user_id=user_id,
                        tool_name=tool_intent["tool_name"],
                        request_summary=tool_intent["summary"],
                        status="executed",
                        requires_confirmation=False,
                        conversation_id=conversation_id,
                        parameters=tool_intent["parameters"],
                        result=tool_res
                    )
                    yield {
                        "event": "tool:completed",
                        "data": {"tool_activity_id": act["id"], "result": tool_res}
                    }
                    tool_result_context = f"\n[TOOL RESULT FOR {tool_intent['tool_name']}]:\n{tool_res}"
                except Exception as e:
                    logger.error(f"Safe tool error: {e}")
                    yield {"event": "tool:error", "data": {"error": str(e)}}
                    tool_result_context = f"\n[TOOL ERROR]: {e}"

        # Fetch RAG context
        doc_chunks = documents_repo.search_chunks(user_id=user_id, query=user_message, limit=3)

        # Conversation history
        conv_data = conversations_repo.get(user_id=user_id, conv_id=conversation_id)
        history = conv_data.get("messages", [])
        summary = conv_data.get("summary")

        # Build context
        full_query = user_message + tool_result_context
        messages = context_builder.build_context(
            user_id=user_id,
            user_message=full_query,
            history=history[:-1],
            summary=summary,
            profile=profile,
            rag_chunks=doc_chunks
        )

        llm = get_llm_provider()
        accumulated_text = ""

        yield {"event": "assistant:start", "data": {"conversation_id": conversation_id}}

        async for token in llm.stream(messages):
            accumulated_text += token
            yield {
                "event": "assistant:token",
                "data": {"conversation_id": conversation_id, "token": token}
            }

        # Persist full assistant response
        saved_msg = conversations_repo.add_message(
            user_id=user_id,
            conv_id=conversation_id,
            role="assistant",
            content=accumulated_text,
            message_type="text"
        )

        yield {
            "event": "assistant:complete",
            "data": {
                "conversation_id": conversation_id,
                "message_id": saved_msg["id"],
                "content": accumulated_text
            }
        }

        # Summarize if needed
        if summarizer.should_summarize(len(history)):
            new_summary = summarizer.create_summary(history, summary)
            conversations_repo.update(user_id, conversation_id, {"summary": new_summary})

    async def execute_confirmed_tool(self, user_id: str, tool_activity_id: str) -> Dict[str, Any]:
        """Execute a tool action after explicit user confirmation."""
        acts = tool_activity_repo.list(user_id)
        act = next((a for a in acts if a["id"] == tool_activity_id), None)
        if not act:
            raise NotFoundError("Tool activity record not found")

        tool_name = act["tool_name"]
        params = act.get("parameters", {})
        tool_def = tool_registry.get(tool_name)
        if not tool_def:
            raise NotFoundError(f"Tool {tool_name} not registered")

        try:
            result = await tool_def.execute(user_id=user_id, **params)
            tool_activity_repo.update(user_id, tool_activity_id, status="executed", result=result)
            return {"status": "success", "result": result}
        except Exception as e:
            logger.error(f"Confirmed tool execution failed: {e}")
            tool_activity_repo.update(user_id, tool_activity_id, status="failed", result=str(e))
            raise e

orchestrator = AIOrchestrator()
