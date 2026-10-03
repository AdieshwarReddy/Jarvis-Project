from typing import List, Dict, Any, Optional
from datetime import datetime
from app.database.repositories.base import BaseRepository

class TasksRepository(BaseRepository):
    def list(self, user_id: str, status: Optional[str] = None) -> List[Dict[str, Any]]:
        return self.db.get_tasks(user_id, status)

    def create(self, user_id: str, title: str, description: Optional[str] = None,
               priority: str = "medium", due_at: Optional[datetime] = None) -> Dict[str, Any]:
        return self.db.create_task(user_id, title, description, priority, due_at)

    def update(self, user_id: str, task_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        return self.db.update_task(user_id, task_id, updates)

    def delete(self, user_id: str, task_id: str) -> bool:
        return self.db.delete_task(user_id, task_id)

tasks_repo = TasksRepository()
