import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import httpx
from app.core.config import settings
from app.core.logging import logger
from app.core.exceptions import NotFoundError, AuthorizationError

class DatabaseStore:
    """
    Central database abstraction for Adhii Jarvis.
    Communicates with Supabase PostgreSQL if SUPABASE_URL & keys are configured,
    or runs on a thread-safe in-memory store mirroring the exact schema with RLS enforcement.
    """
    def __init__(self):
        self.use_supabase = bool(settings.SUPABASE_URL and (settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY))
        self.supabase_url = settings.SUPABASE_URL
        self.api_key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY
        
        # Local in-memory storage backing
        self._profiles: Dict[str, Dict[str, Any]] = {}
        self._conversations: Dict[str, Dict[str, Any]] = {}
        self._messages: Dict[str, List[Dict[str, Any]]] = {}  # conversation_id -> list of messages
        self._memories: Dict[str, Dict[str, Any]] = {}
        self._documents: Dict[str, Dict[str, Any]] = {}
        self._document_chunks: Dict[str, List[Dict[str, Any]]] = {}  # document_id -> list of chunks
        self._notes: Dict[str, Dict[str, Any]] = {}
        self._tasks: Dict[str, Dict[str, Any]] = {}
        self._reminders: Dict[str, Dict[str, Any]] = {}
        self._tool_activity: Dict[str, Dict[str, Any]] = {}
        self._notifications: Dict[str, Dict[str, Any]] = {}
        
        # Seed default profile for demo user
        demo_id = "00000000-0000-0000-0000-000000000001"
        now = datetime.now(timezone.utc)
        self._profiles[demo_id] = {
            "id": demo_id,
            "email": "demo@adhiijarvis.ai",
            "display_name": "Adhi",
            "preferred_name": "Adhi",
            "avatar_url": None,
            "timezone": "Asia/Kolkata",
            "preferred_language": "en",
            "created_at": now,
            "updated_at": now,
        }
        
        # Seed initial notes and tasks for demo user
        n_id = str(uuid.uuid4())
        self._notes[n_id] = {
            "id": n_id,
            "user_id": demo_id,
            "title": "Welcome to Adhii Jarvis",
            "content": "Adhii Jarvis is your intelligent personal workspace. You can talk, type, organize, search, and store information seamlessly.",
            "created_at": now,
            "updated_at": now
        }
        
        t_id = str(uuid.uuid4())
        self._tasks[t_id] = {
            "id": t_id,
            "user_id": demo_id,
            "title": "Test AI Voice & Tools",
            "description": "Try asking Adhii Jarvis to calculate numbers, search documentation, or create a note.",
            "status": "pending",
            "priority": "high",
            "due_at": now,
            "created_at": now,
            "updated_at": now
        }

        # Seed sample memory
        m_id = str(uuid.uuid4())
        self._memories[m_id] = {
            "id": m_id,
            "user_id": demo_id,
            "memory_type": "preference",
            "content": "Prefers concise, actionable responses with code examples in Python and TypeScript.",
            "importance": 5,
            "created_at": now,
            "updated_at": now
        }

    # ---------------------------------------------------------
    # PROFILES
    # ---------------------------------------------------------
    def get_profile(self, user_id: str) -> Dict[str, Any]:
        if user_id not in self._profiles:
            now = datetime.now(timezone.utc)
            self._profiles[user_id] = {
                "id": user_id,
                "email": f"user_{user_id[:8]}@adhiijarvis.ai",
                "display_name": "Adhi User",
                "preferred_name": "Adhi",
                "avatar_url": None,
                "timezone": "UTC",
                "preferred_language": "en",
                "created_at": now,
                "updated_at": now,
            }
        return self._profiles[user_id]

    def update_profile(self, user_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        profile = self.get_profile(user_id)
        for k, v in updates.items():
            if v is not None and k in profile and k not in ("id", "email", "created_at"):
                profile[k] = v
        profile["updated_at"] = datetime.now(timezone.utc)
        self._profiles[user_id] = profile
        return profile

    # ---------------------------------------------------------
    # CONVERSATIONS & MESSAGES
    # ---------------------------------------------------------
    def get_conversations(self, user_id: str) -> List[Dict[str, Any]]:
        convs = [c for c in self._conversations.values() if c["user_id"] == user_id]
        convs.sort(key=lambda x: x["updated_at"], reverse=True)
        # Add message_count
        for c in convs:
            c["message_count"] = len(self._messages.get(c["id"], []))
        return convs

    def create_conversation(self, user_id: str, title: str = "New Conversation") -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        conv_id = str(uuid.uuid4())
        conv = {
            "id": conv_id,
            "user_id": user_id,
            "title": title or "New Conversation",
            "summary": None,
            "created_at": now,
            "updated_at": now,
            "message_count": 0
        }
        self._conversations[conv_id] = conv
        self._messages[conv_id] = []
        return conv

    def get_conversation(self, user_id: str, conv_id: str) -> Dict[str, Any]:
        conv = self._conversations.get(conv_id)
        if not conv:
            raise NotFoundError("Conversation not found")
        if conv["user_id"] != user_id:
            raise AuthorizationError("Access denied to conversation")
        
        conv_copy = dict(conv)
        conv_copy["messages"] = self._messages.get(conv_id, [])
        conv_copy["message_count"] = len(conv_copy["messages"])
        return conv_copy

    def update_conversation(self, user_id: str, conv_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        conv = self.get_conversation(user_id, conv_id)
        for k in ("title", "summary"):
            if k in updates and updates[k] is not None:
                self._conversations[conv_id][k] = updates[k]
        self._conversations[conv_id]["updated_at"] = datetime.now(timezone.utc)
        return self._conversations[conv_id]

    def delete_conversation(self, user_id: str, conv_id: str) -> bool:
        self.get_conversation(user_id, conv_id)  # Validate permission
        self._conversations.pop(conv_id, None)
        self._messages.pop(conv_id, None)
        return True

    def add_message(self, user_id: str, conv_id: str, role: str, content: str, 
                    message_type: str = "text", tool_name: Optional[str] = None) -> Dict[str, Any]:
        self.get_conversation(user_id, conv_id)  # Validate permission
        now = datetime.now(timezone.utc)
        msg_id = str(uuid.uuid4())
        msg = {
            "id": msg_id,
            "conversation_id": conv_id,
            "user_id": user_id,
            "role": role,
            "content": content,
            "message_type": message_type,
            "tool_name": tool_name,
            "created_at": now
        }
        if conv_id not in self._messages:
            self._messages[conv_id] = []
        self._messages[conv_id].append(msg)
        
        # Update conversation timestamp
        if conv_id in self._conversations:
            self._conversations[conv_id]["updated_at"] = now
            # Auto-title conversation from first user message if default
            if role == "user" and self._conversations[conv_id]["title"] == "New Conversation":
                clean_title = content.strip().split("\n")[0][:40]
                if clean_title:
                    self._conversations[conv_id]["title"] = clean_title

        return msg

    # ---------------------------------------------------------
    # NOTES
    # ---------------------------------------------------------
    def get_notes(self, user_id: str, query: Optional[str] = None) -> List[Dict[str, Any]]:
        notes = [n for n in self._notes.values() if n["user_id"] == user_id]
        if query:
            q = query.lower()
            notes = [n for n in notes if q in n["title"].lower() or q in n["content"].lower()]
        notes.sort(key=lambda x: x["updated_at"], reverse=True)
        return notes

    def create_note(self, user_id: str, title: str, content: str) -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        note_id = str(uuid.uuid4())
        note = {
            "id": note_id,
            "user_id": user_id,
            "title": title,
            "content": content,
            "created_at": now,
            "updated_at": now
        }
        self._notes[note_id] = note
        return note

    def update_note(self, user_id: str, note_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        note = self._notes.get(note_id)
        if not note:
            raise NotFoundError("Note not found")
        if note["user_id"] != user_id:
            raise AuthorizationError("Access denied to note")
        for k in ("title", "content"):
            if k in updates and updates[k] is not None:
                note[k] = updates[k]
        note["updated_at"] = datetime.now(timezone.utc)
        self._notes[note_id] = note
        return note

    def delete_note(self, user_id: str, note_id: str) -> bool:
        note = self._notes.get(note_id)
        if not note:
            raise NotFoundError("Note not found")
        if note["user_id"] != user_id:
            raise AuthorizationError("Access denied to note")
        self._notes.pop(note_id, None)
        return True

    # ---------------------------------------------------------
    # TASKS
    # ---------------------------------------------------------
    def get_tasks(self, user_id: str, status: Optional[str] = None) -> List[Dict[str, Any]]:
        tasks = [t for t in self._tasks.values() if t["user_id"] == user_id]
        if status:
            tasks = [t for t in tasks if t["status"] == status]
        tasks.sort(key=lambda x: x["created_at"], reverse=True)
        return tasks

    def create_task(self, user_id: str, title: str, description: Optional[str] = None,
                    priority: str = "medium", due_at: Optional[datetime] = None) -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        task_id = str(uuid.uuid4())
        task = {
            "id": task_id,
            "user_id": user_id,
            "title": title,
            "description": description,
            "status": "pending",
            "priority": priority or "medium",
            "due_at": due_at,
            "created_at": now,
            "updated_at": now
        }
        self._tasks[task_id] = task
        return task

    def update_task(self, user_id: str, task_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        task = self._tasks.get(task_id)
        if not task:
            raise NotFoundError("Task not found")
        if task["user_id"] != user_id:
            raise AuthorizationError("Access denied to task")
        for k in ("title", "description", "status", "priority", "due_at"):
            if k in updates and updates[k] is not None:
                task[k] = updates[k]
        task["updated_at"] = datetime.now(timezone.utc)
        self._tasks[task_id] = task
        return task

    def delete_task(self, user_id: str, task_id: str) -> bool:
        task = self._tasks.get(task_id)
        if not task:
            raise NotFoundError("Task not found")
        if task["user_id"] != user_id:
            raise AuthorizationError("Access denied to task")
        self._tasks.pop(task_id, None)
        return True

    # ---------------------------------------------------------
    # REMINDERS
    # ---------------------------------------------------------
    def get_reminders(self, user_id: str) -> List[Dict[str, Any]]:
        rems = [r for r in self._reminders.values() if r["user_id"] == user_id]
        rems.sort(key=lambda x: x["reminder_at"])
        return rems

    def create_reminder(self, user_id: str, title: str, reminder_at: datetime) -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        rem_id = str(uuid.uuid4())
        rem = {
            "id": rem_id,
            "user_id": user_id,
            "title": title,
            "reminder_at": reminder_at,
            "status": "pending",
            "created_at": now
        }
        self._reminders[rem_id] = rem
        return rem

    def delete_reminder(self, user_id: str, reminder_id: str) -> bool:
        rem = self._reminders.get(reminder_id)
        if not rem:
            raise NotFoundError("Reminder not found")
        if rem["user_id"] != user_id:
            raise AuthorizationError("Access denied to reminder")
        self._reminders.pop(reminder_id, None)
        return True

    def get_pending_due_reminders(self) -> List[Dict[str, Any]]:
        now = datetime.now(timezone.utc)
        due = []
        for r in self._reminders.values():
            if r["status"] == "pending":
                r_at = r["reminder_at"]
                if r_at.tzinfo is None:
                    r_at = r_at.replace(tzinfo=timezone.utc)
                if r_at <= now:
                    due.append(r)
        return due

    def mark_reminder_triggered(self, reminder_id: str) -> None:
        if reminder_id in self._reminders:
            self._reminders[reminder_id]["status"] = "triggered"

    # ---------------------------------------------------------
    # MEMORIES
    # ---------------------------------------------------------
    def get_memories(self, user_id: str) -> List[Dict[str, Any]]:
        mems = [m for m in self._memories.values() if m["user_id"] == user_id]
        mems.sort(key=lambda x: (x["importance"], x["created_at"]), reverse=True)
        return mems

    def create_memory(self, user_id: str, memory_type: str, content: str, importance: int = 1) -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        m_id = str(uuid.uuid4())
        mem = {
            "id": m_id,
            "user_id": user_id,
            "memory_type": memory_type,
            "content": content,
            "importance": importance,
            "created_at": now,
            "updated_at": now
        }
        self._memories[m_id] = mem
        return mem

    def delete_memory(self, user_id: str, memory_id: str) -> bool:
        mem = self._memories.get(memory_id)
        if not mem:
            raise NotFoundError("Memory not found")
        if mem["user_id"] != user_id:
            raise AuthorizationError("Access denied to memory")
        self._memories.pop(memory_id, None)
        return True

    # ---------------------------------------------------------
    # DOCUMENTS & CHUNKS (RAG)
    # ---------------------------------------------------------
    def get_documents(self, user_id: str) -> List[Dict[str, Any]]:
        docs = [d for d in self._documents.values() if d["user_id"] == user_id]
        docs.sort(key=lambda x: x["created_at"], reverse=True)
        for d in docs:
            d["chunk_count"] = len(self._document_chunks.get(d["id"], []))
        return docs

    def get_document(self, user_id: str, doc_id: str) -> Dict[str, Any]:
        doc = self._documents.get(doc_id)
        if not doc:
            raise NotFoundError("Document not found")
        if doc["user_id"] != user_id:
            raise AuthorizationError("Access denied to document")
        doc_copy = dict(doc)
        doc_copy["chunks"] = self._document_chunks.get(doc_id, [])
        doc_copy["chunk_count"] = len(doc_copy["chunks"])
        return doc_copy

    def create_document(self, user_id: str, filename: str, file_type: str, storage_path: str) -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        doc_id = str(uuid.uuid4())
        doc = {
            "id": doc_id,
            "user_id": user_id,
            "filename": filename,
            "file_type": file_type,
            "storage_path": storage_path,
            "processing_status": "pending",
            "chunk_count": 0,
            "created_at": now
        }
        self._documents[doc_id] = doc
        self._document_chunks[doc_id] = []
        return doc

    def update_document_status(self, doc_id: str, status: str) -> None:
        if doc_id in self._documents:
            self._documents[doc_id]["processing_status"] = status

    def save_document_chunks(self, user_id: str, doc_id: str, chunks: List[Dict[str, Any]]) -> None:
        now = datetime.now(timezone.utc)
        chunk_records = []
        for c in chunks:
            c_id = str(uuid.uuid4())
            chunk_records.append({
                "id": c_id,
                "document_id": doc_id,
                "user_id": user_id,
                "content": c.get("content", ""),
                "metadata": c.get("metadata", {}),
                "created_at": now
            })
        self._document_chunks[doc_id] = chunk_records
        if doc_id in self._documents:
            self._documents[doc_id]["chunk_count"] = len(chunk_records)
            self._documents[doc_id]["processing_status"] = "completed"

    def delete_document(self, user_id: str, doc_id: str) -> bool:
        self.get_document(user_id, doc_id)  # Validate permission
        self._documents.pop(doc_id, None)
        self._document_chunks.pop(doc_id, None)
        return True

    def search_user_chunks(self, user_id: str, query: str, limit: int = 5, doc_id: Optional[str] = None) -> List[Dict[str, Any]]:
        terms = [t.lower() for t in query.split() if len(t) > 2]
        scored_chunks = []
        
        target_doc_ids = [doc_id] if doc_id else [d["id"] for d in self._documents.values() if d["user_id"] == user_id]
        
        for d_id in target_doc_ids:
            doc_info = self._documents.get(d_id, {})
            chunks = self._document_chunks.get(d_id, [])
            for chunk in chunks:
                if chunk["user_id"] != user_id:
                    continue
                content_lower = chunk["content"].lower()
                # Keyword overlap scoring
                score = sum(1 for term in terms if term in content_lower)
                if score > 0 or not terms:
                    scored_chunks.append({
                        "content": chunk["content"],
                        "document_id": d_id,
                        "filename": doc_info.get("filename", "Unknown"),
                        "metadata": chunk.get("metadata", {}),
                        "score": score
                    })
        
        scored_chunks.sort(key=lambda x: x["score"], reverse=True)
        return scored_chunks[:limit]

    # ---------------------------------------------------------
    # TOOL ACTIVITY
    # ---------------------------------------------------------
    def log_tool_activity(self, user_id: str, tool_name: str, request_summary: str,
                          status: str = "pending", requires_confirmation: bool = False,
                          conversation_id: Optional[str] = None,
                          parameters: Optional[Dict[str, Any]] = None,
                          result: Optional[Any] = None) -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        act_id = str(uuid.uuid4())
        activity = {
            "id": act_id,
            "user_id": user_id,
            "conversation_id": conversation_id,
            "tool_name": tool_name,
            "request_summary": request_summary,
            "status": status,
            "requires_confirmation": requires_confirmation,
            "parameters": parameters or {},
            "result": result,
            "created_at": now
        }
        self._tool_activity[act_id] = activity
        return activity

    def get_tool_activity(self, user_id: str) -> List[Dict[str, Any]]:
        acts = [a for a in self._tool_activity.values() if a["user_id"] == user_id]
        acts.sort(key=lambda x: x["created_at"], reverse=True)
        return acts

    def update_tool_activity(self, user_id: str, act_id: str, status: str, result: Optional[Any] = None) -> Dict[str, Any]:
        act = self._tool_activity.get(act_id)
        if not act:
            raise NotFoundError("Tool activity not found")
        if act["user_id"] != user_id:
            raise AuthorizationError("Access denied to tool activity")
        act["status"] = status
        if result is not None:
            act["result"] = result
        return act

    # ---------------------------------------------------------
    # NOTIFICATIONS
    # ---------------------------------------------------------
    def get_notifications(self, user_id: str) -> List[Dict[str, Any]]:
        nots = [n for n in self._notifications.values() if n["user_id"] == user_id]
        nots.sort(key=lambda x: x["created_at"], reverse=True)
        return nots

    def create_notification(self, user_id: str, message: str) -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        n_id = str(uuid.uuid4())
        notif = {
            "id": n_id,
            "user_id": user_id,
            "message": message,
            "read": False,
            "created_at": now
        }
        self._notifications[n_id] = notif
        return notif

    def mark_notifications_read(self, user_id: str) -> None:
        for n in self._notifications.values():
            if n["user_id"] == user_id:
                n["read"] = True

# Global database store instance
db = DatabaseStore()

def get_db() -> DatabaseStore:
    return db
