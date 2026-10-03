# Adhii Jarvis — Personal AI Workspace

> **Think. Speak. Act.**  
> A full-stack, enterprise-grade AI voice assistant and productivity workspace built for high-performance software engineering, document intelligence, and real-time execution.

---

## 🌟 Key Highlights & Capabilities
- **Real-Time Dual Channel Communication**: Asynchronous token streaming and voice chunks via **FastAPI** and **Socket.IO**.
- **Voice AI Pipeline**: Push-to-talk speech recognition (Whisper / Web Speech API) + high-fidelity neural text-to-speech (**Edge-TTS** / ElevenLabs).
- **Safe Tool Execution & Gating**: Read-only tools (AST-safe calculator, date/time, weather, web search) execute instantly. State-changing actions (creating tasks, notes, reminders) require user confirmation cards.
- **Document Intelligence (RAG)**: Ingests PDF, DOCX, TXT, and Markdown documents into overlapping semantic chunks for grounded Q&A with exact source citations.
- **Smart Memory Architecture**: Sliding-window short-term memory with auto-summaries + persistent long-term preference retention.
- **Enterprise Security**: Supabase JWT authentication, PostgreSQL Row Level Security (RLS) policies on all tables, and zero client-exposed secrets.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend** | Python 3.11+, FastAPI, Uvicorn, Pydantic v2, APScheduler, pypdf, python-docx |
| **Real-time Engine** | python-socketio (ASGI mode), WebSockets |
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, React Router v6 |
| **Database & Auth** | PostgreSQL with `pgvector`, Supabase Auth, Row Level Security (`adhii_jarvis`) |
| **AI Providers** | Groq (Llama 3.3 70B), OpenAI (GPT-4o), Anthropic (Claude 3.5), Local Mock |
| **Voice Audio** | Whisper STT, Edge-TTS Neural Audio, Web Speech API fallback |
| **Testing** | Pytest (Backend: 17 tests), Vitest (Frontend: 5 tests), Custom E2E suite |
| **Deployment** | Docker, Docker Compose, Render (Backend), Vercel (Frontend) |

---

## 📁 Repository Structure

```
ADHII_JARVIS/
├── backend/
│   ├── app/
│   │   ├── main.py                  # ASGI server mounting FastAPI & Socket.IO
│   │   ├── api/                     # REST API route handlers
│   │   │   ├── auth.py              # Supabase & demo authentication
│   │   │   ├── conversations.py     # Conversation and message endpoints
│   │   │   ├── documents.py         # Document upload and RAG Q&A
│   │   │   ├── notes.py             # Notes management
│   │   │   ├── tasks.py             # Tasks & priority planner
│   │   │   ├── reminders.py         # Scheduled reminder endpoints
│   │   │   ├── tools.py             # Calculator, datetime, weather, search
│   │   │   └── settings.py          # Profiles, memories, notifications, logs
│   │   ├── core/                    # Config, security, logging, exceptions
│   │   ├── database/                # Supabase store & repositories
│   │   ├── models/                  # Pydantic request & response schemas
│   │   ├── ai/                      # Orchestrator, prompt builder, providers
│   │   ├── voice/                   # STT and TTS provider adapters
│   │   ├── memory/                  # Short-term, long-term, summarizer
│   │   ├── rag/                     # Parser, chunker, embeddings, retriever
│   │   ├── tools/                   # Safe AST calculator, weather, tasks tool
│   │   ├── realtime/                # Socket.IO manager & event handlers
│   │   └── services/                # Background scheduler & notification queue
│   ├── tests/                       # 17 automated Pytest unit & integration tests
│   ├── requirements.txt             # Python dependencies
│   ├── Dockerfile                   # Production container definition
│   └── .env.example                 # Backend environment variable template
│
├── frontend/
│   ├── src/
│   │   ├── api/                     # Typed REST API client
│   │   ├── components/              # ChatMessage, VoiceWaveform, ToolConfirmationCard
│   │   ├── context/                 # AuthContext and SocketContext
│   │   ├── hooks/                   # useVoiceRecognition hook
│   │   ├── layouts/                 # Responsive MainLayout with sidebar & navbar
│   │   ├── pages/                   # Landing, Chat, Dashboard, Documents, Notes, Tasks...
│   │   ├── App.tsx                  # Master routing configuration
│   │   └── main.tsx                 # React entry point
│   ├── package.json                 # Frontend dependencies
│   ├── vite.config.ts               # Vite configuration with proxy rules
│   └── tailwind.config.js           # Theme tokens and custom glassmorphism styles
│
├── database/
│   ├── schema.sql                   # 11 relational tables with pgvector & triggers
│   ├── policies.sql                 # Row Level Security (RLS) data isolation policies
│   └── seed.sql                     # Starter demo data
│
├── docs/
│   ├── ARCHITECTURE.md              # Mermaid diagrams & complete lifecycle walkthrough
│   ├── API.md                       # Full REST API endpoints documentation
│   ├── SOCKET_EVENTS.md             # Socket.IO real-time event schemas
│   ├── SECURITY.md                  # Security, prompt injection & privacy protocols
│   └── INTERVIEW_GUIDE.md           # 32 beginner-friendly placement interview Q&As
│
├── docker-compose.yml               # Multi-container orchestration
├── render.yaml                      # Render cloud backend deployment config
└── README.md                        # Project documentation
```

---

## ⚡ Quick Start & Run Commands

### 1. Backend Setup & Run
```bash
# Navigate to backend directory
cd ADHII_JARVIS/backend

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend automated test suite (17 tests)
pytest -v

# Start FastAPI and Socket.IO server on port 8000
uvicorn app.main:app --port 8000 --reload
```

### 2. Frontend Setup & Run
```bash
# Open a new terminal and navigate to frontend directory
cd ADHII_JARVIS/frontend

# Install dependencies
npm install

# Run frontend tests (Vitest)
npm test

# Build production bundle
npm run build

# Start Vite development server on port 5173
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 🗄️ Database Setup (Supabase: `adhii_jarvis`)
1. Create a project in [Supabase](https://supabase.com) named `adhii_jarvis`.
2. Open the **SQL Editor** in the Supabase Dashboard.
3. Run the SQL files in this exact sequence:
   - `database/schema.sql` (Creates all 11 tables, pgvector extensions, and user creation triggers)
   - `database/policies.sql` (Applies Row Level Security policies)
   - `database/seed.sql` (Optional: Seeds starter data)

---

## 🧪 Test Results Summary

| Test Suite | Total Tests | Passed | Result |
| :--- | :--- | :--- | :--- |
| **Backend (Pytest)** | 17 | 17 | 100% Passed (0 warnings) |
| **Frontend (Vitest)** | 5 | 5 | 100% Passed |
| **End-to-End Verification** | 10 Flows | 10 | 100% Verified against live server |

---

## 📋 5-Minute Placement Demo Script
1. **Intro & Landing Page (1 min)**:
   - Navigate to `http://localhost:5173/`. Showcase the futuristic Adhii Jarvis branding ("Think. Speak. Act.") and explain the full-stack architecture.
2. **One-Click Sign In & Dashboard (30 sec)**:
   - Click "Start Jarvis" or "Sign In as Demo User". Highlight the clean dashboard showing recent conversations, pending tasks, and active reminders.
3. **Safe Tool Calling & AST Calculator (1 min)**:
   - Navigate to `/chat`. Ask: *"What is 18% of 42,000?"*.
   - Point out that the AST safe math parser calculated **7,560** instantly without unsafe Python `eval()`.
4. **State-Changing Tool Confirmation Gate (1 min)**:
   - Type: *"Create a task to practice Python tomorrow"*.
   - Show the **Action Confirmation Required card**. Explain to the interviewer that state-mutating actions require user authorization before database insertion. Click **"Authorize & Execute"** and open the Tasks page to show the newly created task.
5. **Document Intelligence & RAG (1 min)**:
   - Open `/documents`. Upload a file and ask a grounded question. Show how chunks are cited with source filenames.
6. **Architecture & RLS Security (30 sec)**:
   - Conclude by referencing `docs/ARCHITECTURE.md` and explaining how PostgreSQL Row Level Security guarantees complete user data isolation.

---

## 📚 Study Order for Placements
Study the modules in `docs/INTERVIEW_GUIDE.md` in this recommended order:
1. FastAPI Basics & Async Event Loop
2. REST API Design & Pydantic Validation
3. Database Schema & PostgreSQL
4. Supabase Auth & JWT Verification
5. Row Level Security (RLS) Policies
6. Socket.IO & Streaming Token Delivery
7. LLM Provider Abstraction Pattern
8. AI Orchestrator & Dynamic Context Builder
9. Safe Tool Calling & Confirmation Gates
10. Speech-to-Text (STT) & Text-to-Speech (TTS) Pipeline
11. Short-Term & Long-Term Memory Architectures
12. Text Embeddings & Retrieval-Augmented Generation (RAG)
13. React 18 & Vite Frontend Architecture
14. Security & Prompt Injection Defenses
15. Docker Containerization & Cloud Deployment
