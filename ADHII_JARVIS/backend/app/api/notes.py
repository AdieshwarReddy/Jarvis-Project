from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, Query, status
from app.core.security import get_current_user
from app.models.schemas import NoteResponse, NoteCreate, NoteUpdate
from app.database.repositories.notes_repo import notes_repo

router = APIRouter(prefix="/api/notes", tags=["Notes"])

@router.get("", response_model=List[NoteResponse])
async def list_notes(
    query: Optional[str] = Query(None, description="Search keyword"),
    user: Dict[str, Any] = Depends(get_current_user)
):
    """List notes with optional search filter."""
    return notes_repo.list(user["id"], query=query)

@router.post("", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
async def create_note(body: NoteCreate, user: Dict[str, Any] = Depends(get_current_user)):
    """Create a new note in workspace."""
    return notes_repo.create(user["id"], title=body.title, content=body.content)

@router.patch("/{note_id}", response_model=NoteResponse)
async def update_note(
    note_id: str,
    body: NoteUpdate,
    user: Dict[str, Any] = Depends(get_current_user)
):
    """Update note title or content."""
    return notes_repo.update(user["id"], note_id, body.model_dump(exclude_unset=True))

@router.delete("/{note_id}")
async def delete_note(note_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    """Delete note."""
    notes_repo.delete(user["id"], note_id)
    return {"status": "success", "message": "Note deleted"}
