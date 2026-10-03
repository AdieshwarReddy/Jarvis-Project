from typing import List, Dict, Any, Optional
from app.database.repositories.base import BaseRepository

class ConversationsRepository(BaseRepository):
    def list(self, user_id: str) -> List[Dict[str, Any]]:
        return self.db.get_conversations(user_id)

    def create(self, user_id: str, title: str = "New Conversation") -> Dict[str, Any]:
        return self.db.create_conversation(user_id, title)

    def get(self, user_id: str, conv_id: str) -> Dict[str, Any]:
        return self.db.get_conversation(user_id, conv_id)

    def update(self, user_id: str, conv_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        return self.db.update_conversation(user_id, conv_id, updates)

    def delete(self, user_id: str, conv_id: str) -> bool:
        return self.db.delete_conversation(user_id, conv_id)

    def add_message(self, user_id: str, conv_id: str, role: str, content: str, 
                    message_type: str = "text", tool_name: Optional[str] = None) -> Dict[str, Any]:
        return self.db.add_message(user_id, conv_id, role, content, message_type, tool_name)

conversations_repo = ConversationsRepository()
