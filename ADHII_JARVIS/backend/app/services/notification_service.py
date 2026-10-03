from typing import List, Dict, Any
from app.database.repositories.notifications_repo import notifications_repo

class NotificationService:
    def list(self, user_id: str) -> List[Dict[str, Any]]:
        return notifications_repo.list(user_id)

    def create(self, user_id: str, message: str) -> Dict[str, Any]:
        return notifications_repo.create(user_id, message)

    def mark_read(self, user_id: str) -> None:
        notifications_repo.mark_all_read(user_id)

notification_service = NotificationService()
