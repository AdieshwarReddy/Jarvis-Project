# Adhii Jarvis — REST API Specification

Base URL: `http://localhost:8000` (or configured Render/production domain)

All protected endpoints require an `Authorization: Bearer <token>` header containing a valid Supabase JWT or authorized demo token.

---

## 1. System Health
### `GET /api/health`
Check server and subsystem status.
- **Auth**: None
- **Response**:
```json
{
  "status": "healthy",
  "service": "Adhii Jarvis Backend",
  "version": "1.0.0",
  "environment": "development",
  "database": "connected",
  "llm_provider": "groq",
  "stt_provider": "whisper",
  "tts_provider": "edge-tts",
  "scheduler": "running"
}
```

---

## 2. Authentication
### `POST /api/auth/signup`
Register a new user account.
- **Request**:
```json
{
  "email": "user@example.com",
  "password": "SecretPassword123",
  "display_name": "Adhi User"
}
```
- **Response**: `201 Created` with `access_token` and `user` object.

### `POST /api/auth/login`
Authenticate existing account.
- **Request**:
```json
{
  "email": "demo@adhiijarvis.ai",
  "password": "demo"
}
```
- **Response**: `200 OK` with `access_token` and `user` object.

### `GET /api/auth/me`
Retrieve authenticated caller profile.
- **Auth**: Bearer Token
- **Response**: `200 OK` with user and profile objects.

---

## 3. Conversations & Messages
### `GET /api/conversations`
List user conversations sorted by `updated_at DESC`.

### `POST /api/conversations`
Create a new conversation session.
- **Request**: `{"title": "System Architecture Review"}`
- **Response**: `201 Created` with conversation record.

### `GET /api/conversations/{id}`
Retrieve conversation details including all message history.

### `PATCH /api/conversations/{id}`
Update conversation title or summary.

### `DELETE /api/conversations/{id}`
Permanently delete conversation and its messages.

### `POST /api/conversations/{id}/messages`
Synchronous REST chat endpoint executing the full orchestrator pipeline.
- **Request**:
```json
{
  "role": "user",
  "content": "What is 18% of 42,000?"
}
```
- **Response**:
```json
{
  "message": {
    "id": "...",
    "role": "assistant",
    "content": "18% of 42,000 is 7,560."
  },
  "tool_confirmation_required": false,
  "tool_activity": null
}
```

---

## 4. Document Intelligence & RAG
### `GET /api/documents`
List user's uploaded documents with chunk counts.

### `POST /api/documents/upload`
Upload and index document (`multipart/form-data`).
- **Form Field**: `file` (PDF, DOCX, TXT, MD)
- **Response**: `201 Created` with document metadata and chunk count.

### `DELETE /api/documents/{id}`
Delete document and its indexed chunks.

### `POST /api/documents/{id}/ask`
Perform grounded RAG Q&A on a specific document.
- **Request**: `{"question": "What are the core requirements?"}`
- **Response**: `{"answer": "...", "sources": [{"filename": "...", "score": 3, "snippet": "..."}]}`

---

## 5. Notes
### `GET /api/notes?query={search}`
List or filter notes by keyword.

### `POST /api/notes`
Create a new note.
- **Request**: `{"title": "FastAPI Notes", "content": "ASGI server benefits..."}`

### `PATCH /api/notes/{id}`
Update existing note title or content.

### `DELETE /api/notes/{id}`
Delete a note.

---

## 6. Tasks
### `GET /api/tasks?status={pending|completed}`
List user tasks with optional status filter.

### `POST /api/tasks`
Create a task.
- **Request**:
```json
{
  "title": "Practice LeetCode DP",
  "description": "Solve 3 medium problems",
  "priority": "high",
  "due_at": "2026-10-05T00:00:00Z"
}
```

### `PATCH /api/tasks/{id}`
Update task status, priority, or details.

### `DELETE /api/tasks/{id}`
Delete a task.

---

## 7. Reminders
### `GET /api/reminders`
List scheduled reminders.

### `POST /api/reminders`
Schedule reminder.
- **Request**:
```json
{
  "title": "Placement Mock Interview",
  "reminder_at": "2026-10-04T14:30:00Z"
}
```

### `DELETE /api/reminders/{id}`
Delete a reminder.

---

## 8. Safe Tool Execution
### `GET /api/tools`
List registered tools, schemas, and confirmation requirements.

### `POST /api/tools/calculate`
Safe AST calculation without eval.
- **Request**: `{"expression": "18% of 42000"}`
- **Response**: `{"expression": "18% of 42000", "result": 7560.0, "formatted": "7,560"}`

### `POST /api/tools/datetime`
Timezone-aware datetime.
- **Request**: `{"timezone": "Asia/Kolkata"}`

### `POST /api/tools/weather`
Live weather report.
- **Request**: `{"location": "Bengaluru"}`

### `POST /api/tools/search`
Web search query.
- **Request**: `{"query": "FastAPI python-socketio"}`

### `POST /api/tools/confirm`
Authorize or reject state-changing tool call.
- **Request**: `{"tool_activity_id": "...", "confirmed": true}`

---

## 9. Settings, Memory & Logs
### `GET /api/profile` & `PATCH /api/profile`
View and update user workspace profile.

### `GET /api/memories` & `DELETE /api/memories/{id}`
Inspect and purge stored long-term preferences.

### `GET /api/tool-activity`
Audit log of all tool executions.

### `GET /api/notifications` & `POST /api/notifications/read`
List and acknowledge in-app alerts.
