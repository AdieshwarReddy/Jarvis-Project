from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, Query, status
from app.core.security import get_current_user
from app.models.schemas import TaskResponse, TaskCreate, TaskUpdate
from app.database.repositories.tasks_repo import tasks_repo

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])

@router.get("", response_model=List[TaskResponse])
async def list_tasks(
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status"),
    user: Dict[str, Any] = Depends(get_current_user)
):
    """List tasks with optional status filter."""
    return tasks_repo.list(user["id"], status=status_filter)

@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(body: TaskCreate, user: Dict[str, Any] = Depends(get_current_user)):
    """Create a new task."""
    return tasks_repo.create(
        user_id=user["id"],
        title=body.title,
        description=body.description,
        priority=body.priority,
        due_at=body.due_at
    )

@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    body: TaskUpdate,
    user: Dict[str, Any] = Depends(get_current_user)
):
    """Update task status, priority, or details."""
    return tasks_repo.update(user["id"], task_id, body.model_dump(exclude_unset=True))

@router.delete("/{task_id}")
async def delete_task(task_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    """Delete task from workspace."""
    tasks_repo.delete(user["id"], task_id)
    return {"status": "success", "message": "Task deleted"}
