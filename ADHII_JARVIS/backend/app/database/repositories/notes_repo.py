from typing import List, Dict, Any, Optional
from app.database.repositories.base import BaseRepository

class NotesRepository(BaseRepository):
    def list(self, user_id: str, query: Optional[str] = None) -> List[Dict[str, Any]]:
        return self.db.get_notes(user_id, query)

    def create(self, user_id: str, title: str, content: str) -> Dict[str, Any]:
        return self.db.create_note(user_id, title, content)

    def update(self, user_id: str, note_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        return self.db.update_note(user_id, note_id, updates)

    def delete(self, user_id: str, note_id: str) -> bool:
        return self.db.delete_note(user_id, note_id)

notes_repo = NotesRepository()
