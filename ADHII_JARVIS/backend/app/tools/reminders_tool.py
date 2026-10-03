from typing import Dict, Any, List
from datetime import datetime, timezone, timedelta
from app.database.repositories.reminders_repo import reminders_repo

def execute_create_reminder(user_id: str, title: str, reminder_at: datetime) -> Dict[str, Any]:
    """Create reminder in database after user confirmation."""
    rem = reminders_repo.create(user_id=user_id, title=title, reminder_at=reminder_at)
    return {
        "status": "success",
        "message": f"Reminder for '{title}' created.",
        "reminder": rem
    }

def execute_list_reminders(user_id: str) -> Dict[str, Any]:
    """List reminders (read-only)."""
    rems = reminders_repo.list(user_id=user_id)
    return {
        "status": "success",
        "count": len(rems),
        "reminders": rems
    }
