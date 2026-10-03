from typing import Dict, Any, List, Optional
from datetime import datetime
from app.database.repositories.tasks_repo import tasks_repo

def execute_create_task(user_id: str, title: str, description: Optional[str] = None,
                        priority: str = "medium", due_at: Optional[datetime] = None) -> Dict[str, Any]:
    """Create task in database after user confirmation."""
    task = tasks_repo.create(user_id=user_id, title=title, description=description, priority=priority, due_at=due_at)
    return {
        "status": "success",
        "message": f"Task '{title}' has been scheduled.",
        "task": task
    }

def execute_list_tasks(user_id: str, status: Optional[str] = None) -> Dict[str, Any]:
    """List tasks (read-only, does not require confirmation)."""
    tasks = tasks_repo.list(user_id=user_id, status=status)
    return {
        "status": "success",
        "count": len(tasks),
        "tasks": tasks
    }

def execute_complete_task(user_id: str, task_id: str) -> Dict[str, Any]:
    """Complete a task (requires confirmation when initiated through AI)."""
    updated = tasks_repo.update(user_id=user_id, task_id=task_id, updates={"status": "completed"})
    return {
        "status": "success",
        "message": f"Task marked as completed.",
        "task": updated
    }
