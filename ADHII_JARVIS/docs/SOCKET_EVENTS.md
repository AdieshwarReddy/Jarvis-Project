# Adhii Jarvis — Socket.IO Real-Time Event Protocols

Adhii Jarvis utilizes `python-socketio` in ASGI mode mounted alongside FastAPI on port 8000. All socket connections authenticate on the initial handshake using query or auth dict JWT tokens.

---

## 1. Connection & Authentication Handshake
```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:8000', {
  auth: { token: 'eyJhbGci...' },
  query: { token: 'eyJhbGci...' },
  transports: ['websocket', 'polling']
});
```

---

## 2. Client → Server Events

| Event | Payload Structure | Description |
| :--- | :--- | :--- |
| `chat:send` | `{ conversation_id: string, message: string, voice_response?: boolean }` | Initiates streaming AI response. If `voice_response: true`, generates TTS audio upon completion. |
| `chat:stop` | `{ conversation_id?: string }` | Aborts ongoing LLM token generation immediately. |
| `voice:start` | `null` | Clears audio chunk buffer on server for a new voice turn. |
| `voice:audio` | `{ chunk: string }` | Base64-encoded audio chunk (250ms chunks from MediaRecorder). |
| `voice:end` | `{ conversation_id?: string, transcript?: string }` | Ends recording, triggers Whisper STT (or uses browser transcript), and launches `chat:send`. |
| `tool:confirm` | `{ tool_activity_id: string, conversation_id: string, confirmed: boolean }` | Authorizes or rejects state-changing tool action. |

---

## 3. Server → Client Events

| Event | Payload Structure | Description |
| :--- | :--- | :--- |
| `assistant:start` | `{ conversation_id: string }` | Emitted when generation begins; triggers UI state to `THINKING`. |
| `assistant:token` | `{ conversation_id: string, token: string }` | Incremental streaming token delivered in real time. |
| `assistant:complete`| `{ conversation_id: string, message_id: string, content: string }` | Full completed response; updates conversation message in database. |
| `assistant:stopped` | `{ conversation_id: string, status: "stopped" }` | Emitted when generation is stopped by client request. |
| `assistant:error` | `{ error: string }` | Emitted on unrecoverable model or server errors. |
| `tool:requested` | `{ tool_activity_id: string, tool_name: string, summary: string, parameters: any }` | Asks client to render a `ToolConfirmationCard`. |
| `tool:started` | `{ tool_name: string, summary: string }` | Tool execution initiated. |
| `tool:completed` | `{ tool_activity_id: string, result: any }` | Tool executed successfully. |
| `tool:error` | `{ error: string }` | Tool execution failure. |
| `voice:transcript`| `{ transcript: string }` | Transcription returned from Whisper STT. |
| `tts:start` | `{ conversation_id: string }` | Text-to-speech audio synthesis initiated. |
| `tts:audio` | `{ audio: string, format: "mp3" }` | Base64-encoded audio stream for browser playback. |
| `tts:end` | `{ conversation_id: string }` | TTS synthesis completed. |

---

## 4. Example Event Exchange

### Streaming Calculation
```
Client  -->  chat:send { conversation_id: "123", message: "What is 18% of 42000?" }
Server  -->  tool:started { tool_name: "calculator" }
Server  -->  tool:completed { result: { result: 7560.0 } }
Server  -->  assistant:start
Server  -->  assistant:token { token: "18%" }
Server  -->  assistant:token { token: " of 42,000" }
Server  -->  assistant:token { token: " is 7,560." }
Server  -->  assistant:complete { message_id: "...", content: "18% of 42,000 is 7,560." }
```

### State-Changing Tool Confirmation
```
Client  -->  chat:send { conversation_id: "123", message: "Create a task to study DSA" }
Server  -->  tool:requested { tool_activity_id: "act-456", tool_name: "create_task", summary: "Create task 'study DSA'" }
[User clicks "Authorize & Execute" on UI Card]
Client  -->  tool:confirm { tool_activity_id: "act-456", conversation_id: "123", confirmed: true }
Server  -->  tool:completed { tool_activity_id: "act-456", result: { status: "success" } }
Server  -->  assistant:complete { content: "Action confirmed and completed successfully: Task scheduled." }
```
