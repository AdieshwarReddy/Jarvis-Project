from typing import List, Dict, Any
from app.database.repositories.memories_repo import memories_repo

class MemoryRetriever:
    """Retrieves relevant user memories to inject into LLM system context."""
    def retrieve_relevant_memories(self, user_id: str, query: str, limit: int = 4) -> List[Dict[str, Any]]:
        memories = memories_repo.list(user_id)
        if not memories:
            return []

        q_terms = [t.lower() for t in query.split() if len(t) > 2]
        scored = []
        for m in memories:
            content_lower = m["content"].lower()
            score = sum(1 for term in q_terms if term in content_lower)
            # Add base score from importance
            total_score = score * 2 + m.get("importance", 1)
            scored.append((total_score, m))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in scored[:limit]]

memory_retriever = MemoryRetriever()
