from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.security import get_current_user
from app.models.schemas import (
    ConversationResponse,
    ConversationDetailResponse,
    ConversationCreate,
    ConversationUpdate,
    MessageCreate,
    MessageResponse
)
from app.services.conversation_service import conversation_service
from app.ai.orchestrator import orchestrator

router = APIRouter(prefix="/api/conversations", tags=["Conversations"])

@router.get("", response_model=List[ConversationResponse])
async def list_conversations(user: Dict[str, Any] = Depends(get_current_user)):
    """Retrieve all conversations for the authenticated user."""
    return conversation_service.get_user_conversations(user["id"])

@router.post("", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
async def create_conversation(body: ConversationCreate, user: Dict[str, Any] = Depends(get_current_user)):
    """Create a new conversation session."""
    return conversation_service.create_conversation(user["id"], title=body.title or "New Conversation")

@router.get("/{conversation_id}", response_model=ConversationDetailResponse)
async def get_conversation(conversation_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    """Retrieve conversation details including all messages."""
    return conversation_service.get_conversation_details(user["id"], conversation_id)

@router.patch("/{conversation_id}", response_model=ConversationResponse)
async def update_conversation(
    conversation_id: str,
    body: ConversationUpdate,
    user: Dict[str, Any] = Depends(get_current_user)
):
    """Rename or update conversation metadata."""
    return conversation_service.update_conversation(user["id"], conversation_id, body.model_dump(exclude_unset=True))

@router.delete("/{conversation_id}")
async def delete_conversation(conversation_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    """Delete conversation and all associated messages."""
    conversation_service.delete_conversation(user["id"], conversation_id)
    return {"status": "success", "message": "Conversation deleted"}

@router.post("/{conversation_id}/messages")
async def send_message(
    conversation_id: str,
    body: MessageCreate,
    user: Dict[str, Any] = Depends(get_current_user)
):
    """Send user message to assistant via REST and receive orchestrated response."""
    result = await orchestrator.process_message(
        user_id=user["id"],
        conversation_id=conversation_id,
        user_message=body.content
    )
    return result
