from typing import List, Dict, Any
from fastapi import APIRouter, Depends, status
from app.core.security import get_current_user
from app.models.schemas import (
    ProfileResponse,
    ProfileUpdate,
    MemoryResponse,
    MemoryCreate,
    ToolActivityResponse,
    NotificationResponse
)
from app.database.repositories.profiles_repo import profiles_repo
from app.database.repositories.memories_repo import memories_repo
from app.database.repositories.tool_activity_repo import tool_activity_repo
from app.database.repositories.notifications_repo import notifications_repo

router = APIRouter(prefix="/api", tags=["Settings, Memory & Logs"])

# -------------------------------------------------------------
# PROFILE & SETTINGS
# -------------------------------------------------------------
@router.get("/profile", response_model=ProfileResponse)
async def get_profile(user: Dict[str, Any] = Depends(get_current_user)):
    """Get current user's profile and workspace settings."""
    return profiles_repo.get(user["id"])

@router.patch("/profile", response_model=ProfileResponse)
async def update_profile(
    body: ProfileUpdate,
    user: Dict[str, Any] = Depends(get_current_user)
):
    """Update user workspace settings (timezone, display name, preferred language)."""
    return profiles_repo.update(user["id"], body.model_dump(exclude_unset=True))

# -------------------------------------------------------------
# LONG-TERM MEMORIES
# -------------------------------------------------------------
@router.get("/memories", response_model=List[MemoryResponse])
async def list_memories(user: Dict[str, Any] = Depends(get_current_user)):
    """List all long-term memories and preferences stored for user."""
    return memories_repo.list(user["id"])

@router.post("/memories", response_model=MemoryResponse, status_code=status.HTTP_201_CREATED)
async def create_memory(body: MemoryCreate, user: Dict[str, Any] = Depends(get_current_user)):
    """Manually add a memory or preference rule."""
    return memories_repo.create(
        user_id=user["id"],
        memory_type=body.memory_type,
        content=body.content,
        importance=body.importance
    )

@router.delete("/memories/{memory_id}")
async def delete_memory(memory_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    """Delete a memory item."""
    memories_repo.delete(user["id"], memory_id)
    return {"status": "success", "message": "Memory deleted"}

# -------------------------------------------------------------
# TOOL ACTIVITY AUDIT LOG
# -------------------------------------------------------------
@router.get("/tool-activity", response_model=List[ToolActivityResponse])
async def list_tool_activity(user: Dict[str, Any] = Depends(get_current_user)):
    """Retrieve full audit log of executed and requested AI tools."""
    return tool_activity_repo.list(user["id"])

# -------------------------------------------------------------
# NOTIFICATIONS
# -------------------------------------------------------------
@router.get("/notifications", response_model=List[NotificationResponse])
async def list_notifications(user: Dict[str, Any] = Depends(get_current_user)):
    """Get in-app notifications."""
    return notifications_repo.list(user["id"])

@router.post("/notifications/read")
async def mark_notifications_read(user: Dict[str, Any] = Depends(get_current_user)):
    """Mark all user notifications as read."""
    notifications_repo.mark_all_read(user["id"])
    return {"status": "success", "message": "Notifications marked as read"}
