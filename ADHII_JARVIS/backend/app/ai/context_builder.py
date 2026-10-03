from typing import List, Dict, Any, Optional
from app.ai.prompts import build_system_message
from app.memory.short_term import short_term_memory
from app.memory.retrieval import memory_retriever
from app.rag.retriever import retriever

class ContextBuilder:
    """Constructs prompt message list with short-term history, memory, and RAG grounding."""

    def build_context(
        self,
        user_id: str,
        user_message: str,
        history: List[Dict[str, Any]],
        summary: Optional[str] = None,
        profile: Optional[Dict[str, Any]] = None,
        rag_chunks: Optional[List[Dict[str, Any]]] = None,
        response_style: str = "Balanced"
    ) -> List[Dict[str, str]]:

        user_name = (profile or {}).get("preferred_name") or "Adhi"
        user_tz = (profile or {}).get("timezone") or "UTC"

        # 1. Retrieve long-term memories
        memories = memory_retriever.retrieve_relevant_memories(user_id=user_id, query=user_message)
        memories_text = "\n".join(f"- {m['content']}" for m in memories) if memories else ""

        # 2. Build RAG context if chunks provided
        rag_context = retriever.build_rag_context(rag_chunks) if rag_chunks else ""

        # 3. Build system message
        system_content = build_system_message(
            user_name=user_name,
            user_timezone=user_tz,
            response_style=response_style,
            memories_text=memories_text,
            rag_context=rag_context
        )

        messages: List[Dict[str, str]] = [{"role": "system", "content": system_content}]

        # 4. Add formatted short-term conversation turns
        formatted_history = short_term_memory.format_history(history, summary=summary)
        messages.extend(formatted_history)

        # 5. Add current user message
        messages.append({"role": "user", "content": user_message})

        return messages

context_builder = ContextBuilder()
