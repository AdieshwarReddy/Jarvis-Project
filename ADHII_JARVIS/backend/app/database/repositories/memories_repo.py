from typing import List, Dict, Any
from app.database.repositories.base import BaseRepository

class MemoriesRepository(BaseRepository):
    def list(self, user_id: str) -> List[Dict[str, Any]]:
        return self.db.get_memories(user_id)

    def create(self, user_id: str, memory_type: str, content: str, importance: int = 1) -> Dict[str, Any]:
        return self.db.create_memory(user_id, memory_type, content, importance)

    def delete(self, user_id: str, memory_id: str) -> bool:
        return self.db.delete_memory(user_id, memory_id)

memories_repo = MemoriesRepository()
