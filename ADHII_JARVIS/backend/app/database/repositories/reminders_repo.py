from typing import List, Dict, Any
from datetime import datetime
from app.database.repositories.base import BaseRepository

class RemindersRepository(BaseRepository):
    def list(self, user_id: str) -> List[Dict[str, Any]]:
        return self.db.get_reminders(user_id)

    def create(self, user_id: str, title: str, reminder_at: datetime) -> Dict[str, Any]:
        return self.db.create_reminder(user_id, title, reminder_at)

    def delete(self, user_id: str, reminder_id: str) -> bool:
        return self.db.delete_reminder(user_id, reminder_id)

    def get_pending_due(self) -> List[Dict[str, Any]]:
        return self.db.get_pending_due_reminders()

    def mark_triggered(self, reminder_id: str) -> None:
        self.db.mark_reminder_triggered(reminder_id)

reminders_repo = RemindersRepository()
