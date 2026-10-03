from typing import List, Dict, Any, Optional
from app.database.repositories.documents_repo import documents_repo
from app.core.logging import logger

class DocumentRetriever:
    """Retrieves relevant document chunks and formats grounded context for the AI."""
    def retrieve(self, user_id: str, query: str, limit: int = 4, doc_id: Optional[str] = None) -> List[Dict[str, Any]]:
        return documents_repo.search_chunks(user_id=user_id, query=query, limit=limit, doc_id=doc_id)

    def build_rag_context(self, chunks: List[Dict[str, Any]]) -> str:
        if not chunks:
            return ""

        context_parts = []
        for i, chunk in enumerate(chunks, 1):
            source = chunk.get("filename", "Uploaded Document")
            context_parts.append(f"[Source {i}: {source}]\n{chunk.get('content', '')}")

        return "RELEVANT DOCUMENT CONTEXT (Use this verified information to answer the user):\n" + "\n\n".join(context_parts)

retriever = DocumentRetriever()
