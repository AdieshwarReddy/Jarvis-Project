# Adhii Jarvis — Security, Privacy & Safety Architecture

## 1. Zero Trust Credential Isolation
- **Backend Key Storage**: Provider API keys (`GROQ_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `ELEVENLABS_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) are kept exclusively on the server.
- **Client Bundling**: The Vite frontend environment contains zero provider secret keys. Only `VITE_SUPABASE_ANON_KEY` and public gateway URLs are exposed.
- **Log Sanitization**: The structured logger in `app/core/logging.py` regex-scrubs all API keys, bearer tokens, passwords, and JWT credentials before writing to stdout.

---

## 2. Row Level Security & User Isolation
- PostgreSQL Row Level Security is enforced on all 11 core tables (`profiles`, `conversations`, `messages`, `memories`, `documents`, `document_chunks`, `notes`, `tasks`, `reminders`, `tool_activity`, `notifications`).
- Every query enforces `auth.uid() = user_id`. User A can never query, update, or delete records belonging to User B.
- Validated with automated pytest test suite (`tests/test_auth.py:test_user_data_isolation`).

---

## 3. Defense Against Prompt Injection & Untrusted Content
1. **Untrusted Data Isolation**: Document text, web search snippets, and tool outputs are marked as untrusted data in the context builder.
2. **Permission Boundary**: The system prompt instructs the model that uploaded documents cannot authorize or alter tool permissions.
3. **Hard Application Gating**: Tool execution permissions are hardcoded into Python application logic (`requires_confirmation=True`), completely independent of LLM whims or injected document instructions.

---

## 4. Safe Tool Execution (No `eval`)
- **AST-Based Parser**: The calculator tool (`app/tools/calculator.py`) evaluates mathematical expressions using Python's `ast.NodeVisitor`.
- **Arbitrary Code Execution Prevention**: Strings containing letters, identifiers, `import`, `__builtins__`, or unauthorized syntax are rejected with `ToolExecutionError`.
- **Division by Zero & Exponent Caps**: Division by zero and exponential denial-of-service (`2**9999999`) are proactively blocked.

---

## 5. File Upload Security
- **Strict Allowed Extensions**: Only `.pdf`, `.docx`, `.txt`, `.md` are accepted.
- **Payload Size Caps**: Enforced 10 MB maximum file size limit in streaming chunks.
- **Safe Filenames**: Uploaded filenames are sanitized and prepended with random UUIDs to prevent directory traversal (`../../`).
- **No Execution**: Uploaded files are stored in a dedicated `/uploads` directory with execute permissions stripped.

---

## 6. Privacy & Data Ownership
- **Microphone Audio**: Raw audio bytes are held strictly in memory buffers during speech-to-text transcription. They are never written to persistent disk storage or uploaded to public buckets.
- **Right to Erasure**: Users have one-click deletion capabilities for conversations, documents, memories, notes, and tasks via protected REST endpoints.
