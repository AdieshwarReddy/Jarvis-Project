from typing import List, Dict, Any, Optional
from app.database.repositories.conversations_repo import conversations_repo

class ConversationService:
    def get_user_conversations(self, user_id: str) -> List[Dict[str, Any]]:
        return conversations_repo.list(user_id)

    def create_conversation(self, user_id: str, title: str = "New Conversation") -> Dict[str, Any]:
        return conversations_repo.create(user_id, title)

    def get_conversation_details(self, user_id: str, conv_id: str) -> Dict[str, Any]:
        return conversations_repo.get(user_id, conv_id)

    def update_conversation(self, user_id: str, conv_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        return conversations_repo.update(user_id, conv_id, updates)

    def delete_conversation(self, user_id: str, conv_id: str) -> bool:
        return conversations_repo.delete(user_id, conv_id)

conversation_service = ConversationService()
