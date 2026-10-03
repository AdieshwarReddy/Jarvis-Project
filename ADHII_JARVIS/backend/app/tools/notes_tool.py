from typing import Dict, Any, List, Optional
from app.database.repositories.notes_repo import notes_repo

def execute_create_note(user_id: str, title: str, content: str) -> Dict[str, Any]:
    """Create note in database after user confirmation."""
    note = notes_repo.create(user_id=user_id, title=title, content=content)
    return {
        "status": "success",
        "message": f"Note '{title}' successfully created.",
        "note": note
    }

def execute_search_notes(user_id: str, query: Optional[str] = None) -> Dict[str, Any]:
    """Search user notes (read-only, does not require confirmation)."""
    notes = notes_repo.list(user_id=user_id, query=query)
    return {
        "status": "success",
        "count": len(notes),
        "notes": notes
    }
