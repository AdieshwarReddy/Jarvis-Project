from typing import List, Dict, Any
from app.database.repositories.base import BaseRepository

class NotificationsRepository(BaseRepository):
    def list(self, user_id: str) -> List[Dict[str, Any]]:
        return self.db.get_notifications(user_id)

    def create(self, user_id: str, message: str) -> Dict[str, Any]:
        return self.db.create_notification(user_id, message)

    def mark_all_read(self, user_id: str) -> None:
        self.db.mark_notifications_read(user_id)

notifications_repo = NotificationsRepository()
