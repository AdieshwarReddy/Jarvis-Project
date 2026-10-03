from typing import List, Dict, Any
from fastapi import APIRouter, Depends, status
from app.core.security import get_current_user
from app.models.schemas import ReminderResponse, ReminderCreate
from app.database.repositories.reminders_repo import reminders_repo

router = APIRouter(prefix="/api/reminders", tags=["Reminders"])

@router.get("", response_model=List[ReminderResponse])
async def list_reminders(user: Dict[str, Any] = Depends(get_current_user)):
    """List all scheduled reminders for user."""
    return reminders_repo.list(user["id"])

@router.post("", response_model=ReminderResponse, status_code=status.HTTP_201_CREATED)
async def create_reminder(body: ReminderCreate, user: Dict[str, Any] = Depends(get_current_user)):
    """Schedule a new reminder."""
    return reminders_repo.create(user["id"], title=body.title, reminder_at=body.reminder_at)

@router.delete("/{reminder_id}")
async def delete_reminder(reminder_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    """Delete a reminder."""
    reminders_repo.delete(user["id"], reminder_id)
    return {"status": "success", "message": "Reminder deleted"}
