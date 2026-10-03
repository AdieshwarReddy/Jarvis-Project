from typing import Optional, List, Dict, Any, Literal
from datetime import datetime
from pydantic import BaseModel, Field

# -------------------------------------------------------------
# USER PROFILE SCHEMAS
# -------------------------------------------------------------
class ProfileBase(BaseModel):
    display_name: Optional[str] = None
    preferred_name: Optional[str] = None
    avatar_url: Optional[str] = None
    timezone: str = "UTC"
    preferred_language: str = "en"

class ProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    preferred_name: Optional[str] = None
    avatar_url: Optional[str] = None
    timezone: Optional[str] = None
    preferred_language: Optional[str] = None

class ProfileResponse(ProfileBase):
    id: str
    email: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

# -------------------------------------------------------------
# CONVERSATION & MESSAGE SCHEMAS
# -------------------------------------------------------------
class MessageCreate(BaseModel):
    role: Literal["user", "assistant", "system", "tool"]
    content: str
    message_type: Literal["text", "voice", "tool_call", "tool_result", "system"] = "text"
    tool_name: Optional[str] = None

class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    user_id: str
    role: Literal["user", "assistant", "system", "tool"]
    content: str
    message_type: str = "text"
    tool_name: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}

class ConversationCreate(BaseModel):
    title: Optional[str] = "New Conversation"

class ConversationUpdate(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None

class ConversationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    summary: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    message_count: Optional[int] = 0

    model_config = {"from_attributes": True}

class ConversationDetailResponse(ConversationResponse):
    messages: List[MessageResponse] = []

# -------------------------------------------------------------
# MEMORY SCHEMAS
# -------------------------------------------------------------
class MemoryCreate(BaseModel):
    memory_type: Literal["preference", "fact", "instruction", "context"] = "preference"
    content: str
    importance: int = Field(default=1, ge=1, le=5)

class MemoryResponse(BaseModel):
    id: str
    user_id: str
    memory_type: str
    content: str
    importance: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

# -------------------------------------------------------------
# DOCUMENT SCHEMAS
# -------------------------------------------------------------
class DocumentChunkResponse(BaseModel):
    id: str
    document_id: str
    content: str
    metadata: Dict[str, Any] = {}
    created_at: datetime

class DocumentResponse(BaseModel):
    id: str
    user_id: str
    filename: str
    file_type: str
    storage_path: Optional[str] = None
    processing_status: Literal["pending", "processing", "completed", "failed"] = "pending"
    chunk_count: Optional[int] = 0
    created_at: datetime

    model_config = {"from_attributes": True}

class DocumentAskRequest(BaseModel):
    question: str

class DocumentAskResponse(BaseModel):
    answer: str
    sources: List[Dict[str, Any]] = []

# -------------------------------------------------------------
# NOTE SCHEMAS
# -------------------------------------------------------------
class NoteCreate(BaseModel):
    title: str
    content: str

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None

class NoteResponse(BaseModel):
    id: str
    user_id: str
    title: str
    content: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

# -------------------------------------------------------------
# TASK SCHEMAS
# -------------------------------------------------------------
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: Literal["low", "medium", "high", "urgent"] = "medium"
    due_at: Optional[datetime] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[Literal["pending", "in_progress", "completed", "cancelled"]] = None
    priority: Optional[Literal["low", "medium", "high", "urgent"]] = None
    due_at: Optional[datetime] = None

class TaskResponse(BaseModel):
    id: str
    user_id: str
    title: str
    description: Optional[str] = None
    status: Literal["pending", "in_progress", "completed", "cancelled"]
    priority: Literal["low", "medium", "high", "urgent"]
    due_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

# -------------------------------------------------------------
# REMINDER SCHEMAS
# -------------------------------------------------------------
class ReminderCreate(BaseModel):
    title: str
    reminder_at: datetime

class ReminderResponse(BaseModel):
    id: str
    user_id: str
    title: str
    reminder_at: datetime
    status: Literal["pending", "triggered", "dismissed"]
    created_at: datetime

    model_config = {"from_attributes": True}

# -------------------------------------------------------------
# TOOL ACTIVITY SCHEMAS
# -------------------------------------------------------------
class ToolActivityResponse(BaseModel):
    id: str
    user_id: str
    conversation_id: Optional[str] = None
    tool_name: str
    request_summary: str
    status: Literal["pending", "executed", "rejected", "failed"]
    requires_confirmation: bool = False
    parameters: Optional[Dict[str, Any]] = None
    result: Optional[Any] = None
    created_at: datetime

    model_config = {"from_attributes": True}

class ToolConfirmRequest(BaseModel):
    tool_activity_id: str
    confirmed: bool

# -------------------------------------------------------------
# NOTIFICATION SCHEMAS
# -------------------------------------------------------------
class NotificationResponse(BaseModel):
    id: str
    user_id: str
    message: str
    read: bool
    created_at: datetime

    model_config = {"from_attributes": True}

# -------------------------------------------------------------
# TOOL INPUT / OUTPUT SCHEMAS
# -------------------------------------------------------------
class CalculatorRequest(BaseModel):
    expression: str

class CalculatorResponse(BaseModel):
    expression: str
    result: float
    formatted: str

class DatetimeRequest(BaseModel):
    timezone: Optional[str] = "UTC"

class DatetimeResponse(BaseModel):
    current_time: str
    current_date: str
    timezone: str
    iso: str

class WeatherRequest(BaseModel):
    location: str

class WeatherResponse(BaseModel):
    location: str
    temperature: Optional[float] = None
    unit: str = "C"
    condition: str
    humidity: Optional[int] = None
    wind_speed: Optional[float] = None
    source: str

class SearchResultItem(BaseModel):
    title: str
    snippet: str
    url: str

class SearchRequest(BaseModel):
    query: str

class SearchResponse(BaseModel):
    query: str
    results: List[SearchResultItem]

class VoiceTranscriptionResponse(BaseModel):
    text: str
    language: Optional[str] = "en"

class VoiceSynthesizeRequest(BaseModel):
    text: str
    voice: Optional[str] = None
    rate: Optional[str] = "+0%"
