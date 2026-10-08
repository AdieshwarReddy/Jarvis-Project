# Adhii Jarvis — Personal AI Workspace

<div align="center">

```
   ___    ____  __  ________     __ ___    ____ _    ___________
  /   |  / __ \/ / / /  _/ /    / //   |  / __ \ |  / /  _/ ___/
 / /| | / / / / /_/ // // /__  / // /| | / /_/ / | / // / \__ \ 
/ ___ |/ /_/ / __  // // / _ \/ // ___ |/ _, _/| |/ // / ___/ / 
/_/  |_/_____/_/ /_/___/_/\___/_//_/  |_/_/ |_| |___/___//____/  
```

### **Think. Speak. Act.**
*A full-stack, enterprise-grade personal AI assistant, sci-fi command center HUD, and intelligent workspace.*

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React 18](https://img.shields.io/badge/React-18.2.0-61DAFB.svg?logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.21-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.1-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7.5-010101.svg?logo=socketdotio&logoColor=white)](https://socket.io/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB.svg?logo=python&logoColor=white)](https://python.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20RLS-3ECF8E.svg?logo=supabase&logoColor=white)](https://supabase.com/)

[Live Workspace](http://127.0.0.1:5173/) • [Command Center HUD](http://127.0.0.1:5173/command-center) • [Interactive API Docs](http://127.0.0.1:8000/docs)

</div>

---

## 📑 Table of Contents
1. [Project Overview](#-project-overview)
2. [Dual-Interface Architecture](#-dual-interface-architecture)
   - [Interface 1: Primary Workspace](#interface-1-primary-workspace)
   - [Interface 2: MK-COMMAND Command Center HUD](#interface-2-mk-command-command-center-hud)
3. [Technology Stack](#-technology-stack)
4. [Key Features & Core Systems](#-key-features--core-systems)
   - [Authentic British Voice & Audio Engine](#1-authentic-british-voice--audio-engine)
   - [Desktop Companion & Windows Automation](#2-desktop-companion--windows-automation)
   - [Safe Tool Execution & Gated Confirmations](#3-safe-tool-execution--gated-confirmations)
   - [Productivity Suite: Notes, Tasks & Reminders](#4-productivity-suite-notes-tasks--reminders)
   - [Document Intelligence (RAG Pipeline)](#5-document-intelligence-rag-pipeline)
   - [Multi-Model LLM Orchestration](#6-multi-model-llm-orchestration)
   - [Spotify Playback Integration](#7-spotify-playback-integration)
5. [Repository Structure](#-repository-structure)
6. [Getting Started & Installation](#-getting-started--installation)
   - [One-Click Launch](#one-click-launch-windows)
   - [Manual Step-by-Step Setup](#manual-step-by-step-setup)
7. [Database Setup & Security](#-database-setup--security)
8. [API & WebSocket Specifications](#-api--websocket-specifications)
9. [Automated Testing & Verification](#-automated-testing--verification)
10. [Placement & Engineering Interview Guide](#-placement--engineering-interview-guide)

---

## 🌌 Project Overview

**Adhii Jarvis** is a production-ready, full-stack AI workspace and personal assistant designed to bridge conversational artificial intelligence with real local operating system control. 

Unlike conventional chatbots confined to text, **Adhii Jarvis**:
- **Listens and Speaks** with an authentic British neural voice ("Yes boss" persona).
- **Controls Windows directly** via an authenticated Desktop Companion (launching apps, querying live CPU/RAM telemetry, locking workstation, muting audio).
- **Organizes your workflow** through dedicated notes, prioritized tasks, and an automated background reminder scheduler.
- **Analyzes personal documents** (PDFs, DOCX, TXT) with semantic chunking and grounded citations (RAG).
- **Protects user intent** with a security gate requiring explicit human authorization before executing any destructive or state-changing action.

---

## 🖥️ Dual-Interface Architecture

The application is structured into two complementary user interfaces:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       INTERFACE 1: PRIMARY WORKSPACE                        │
│ ┌───────────────┬─────────────────────────────────────────────────────────┐ │
│ │ Left Sidebar  │ Main Workspace Area                                     │ │
│ │ • Dashboard   │ [ Chat Session / Conversations / Docs / Tasks / Notes ] │ │
│ │ • AI Chat     │                                                         │ │
│ │ • Notes       │ Header: Live AI Status Indicator                        │ │
│ │ • Tasks       │ ⚡ [ ACTIVATE JARVIS ] (Amber Glowing Button)            │ │
│ └───────────────┴───────────────────────────────┬─────────────────────────┘ │
└─────────────────────────────────────────────────┼───────────────────────────┘
                                                  │ Click "ACTIVATE JARVIS"
                                                  │ (Arc Reactor Wakeup Chime)
                                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                INTERFACE 2: MK-COMMAND COMMAND CENTER HUD                   │
│ ┌───────────────────┬───────────────────────────────┬─────────────────────┐ │
│ │ System Telemetry  │ Holographic Arc Reactor Core  │ System Control Grid │ │
│ │ • Date & Arc Clock│ • TAP TO SPEAK (Hands-Free)   │ • VS Code / Chrome  │ │
│ │ • Power & Storage │ • Waveform Audio Visualizer   │ • Spotify / WhatsApp│ │
│ │ • Hardware Load   │ • Realtime Speech Transcript  │ • Lock PC / Mute    │ │
│ │                   │ • Command Terminal Feed       │ • Notes Directives  │ │
│ └───────────────────┴───────────────────────────────┴─────────────────────┘ │
│ Header: AGENT • DB • AI • VOICE • AMBIENCE • SPOTIFY | [← WORKSPACE] (Esc)  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Interface 1: Primary Workspace
* **URL**: [`http://127.0.0.1:5173/`](http://127.0.0.1:5173/) or [`/chat`](http://127.0.0.1:5173/chat)
* **Design Philosophy**: High-productivity dark mode dashboard featuring glassmorphic panels, Google Fonts typography, responsive collapsible sidebar, and instant navigation.
* **Sections Included**:
  - `AI Workspace Chat`: Natural language multi-turn dialogues with streaming token animation and markdown rendering.
  - `Dashboard`: Consolidated widget overview of pending tasks, upcoming reminders, recent files, and quick prompts.
  - `Conversation History`: Full search and retrieval across historical conversation threads.
  - `Documents & RAG`: File drag-and-drop ingestor and semantic Q&A.
  - `Saved Notes`: Full-featured note-taking canvas with real-time text search.
  - `Tasks & Planner`: Priority-based task manager (`Urgent`, `High`, `Medium`, `Low`).
  - `Reminders`: Scheduled alerts with automatic background worker dispatch.
  - `Tool Activity`: Audit log of AI function executions and parameters.

### Interface 2: MK-COMMAND Command Center HUD
* **URL**: [`http://127.0.0.1:5173/command-center`](http://127.0.0.1:5173/command-center)
* **Design Philosophy**: Sci-fi Iron Man Mark-Command interface with holographic laser aesthetics, dynamic rotating degree rings (`000° ARC`, `180° PWR`, `270°`, `090°`), live audio waveform, and zero-distraction computer execution.
* **Activation**: Click **`⚡ ACTIVATE JARVIS`** in the top navigation bar.
* **Return**: Click **`← WORKSPACE`**, click the **`ADHII JARVIS`** logo, or press <kbd>Esc</kbd>.

---

## 🛠️ Technology Stack

| Domain | Technology | Purpose & Implementation |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 18.2** | Component architecture, Virtual DOM diffing, and reactive state management |
| **Build Tool** | **Vite 5.4** | Instant Hot Module Replacement (HMR) and optimized Rollup tree-shaking |
| **Language** | **TypeScript 5.2** | End-to-end type safety across API contracts, socket payloads, and UI props |
| **Styling** | **Tailwind CSS 3.4** | Utility-first glassmorphism, cyan/amber glowing accents, custom animations |
| **Icons** | **Lucide React** | Consistent, modern vector iconography |
| **Backend API** | **FastAPI 0.110** | High-throughput asynchronous Python ASGI server with automatic OpenAPI Swagger docs |
| **Realtime Gateway** | **Socket.IO (python-socketio)** | Bidirectional WebSockets for real-time token streaming and voice audio chunking |
| **Database & Auth** | **PostgreSQL + Supabase** | Row Level Security (RLS), `pgvector` embeddings storage, and JWT auth |
| **AI / LLMs** | **Groq Llama 3.3 70B** | Primary ultra-fast inference (also supports OpenAI GPT-4o & Anthropic Claude 3.5) |
| **Text-to-Speech (TTS)** | **Edge-TTS Neural Audio** | Authentic British Ryan/Thomas neural voice synthesis (`en-GB-RyanNeural`) |
| **Speech-to-Text (STT)** | **Whisper / Web Speech API** | Push-to-talk and continuous hands-free voice recognition with auto-silence timeout |
| **Audio Synthesizer** | **HTML5 Web Audio API** | Real-time procedural 55Hz Arc Reactor hum, repulsor sweeps, and chime SFX |
| **Desktop Automation** | **Python `os`, `subprocess`, `ctypes`** | Native Windows Win32 API execution for app launching, volume control, and screen lock |
| **Telemetry** | **`psutil`** | Hardware telemetry metrics (RAM GB, CPU load %, disk space, battery status) |
| **Scheduler** | **APScheduler 3.10** | Background Python daemon polling reminders every 15s |
| **Document Ingestion** | **`pypdf`, `python-docx`** | Extracting text from PDFs, Word docs, TXT, and Markdown files |

---

## 🚀 Key Features & Core Systems

### 1. Authentic British Voice & Audio Engine
* **Persona & Voice**: Powered by Microsoft's high-fidelity `en-GB-RyanNeural` model. Speaks naturally with polite British phrasing ("Yes boss", "Right away, boss").
* **Speech Sanitization**: Strips markdown symbols, asterisks, bullet points, headers, and code snippets before vocal synthesis so output sounds like pure spoken English.
* **Procedural Sound Engine (`jarvisSoundSystem.ts`)**: Built directly with the HTML5 Web Audio API (zero audio asset downloads required):
  - **Arc Reactor Ambience**: Warm 55Hz/110Hz sub-core drone with a gentle 0.15Hz breathing LFO.
  - **Audio Ducking**: Automatically attenuates background hum when Jarvis speaks.
  - **Mark Repulsor Wakeup Chime**: Rising pitch frequency sweep (160Hz → 640Hz → 880Hz).
  - **Directive Affirmation**: Harmonious dual-frequency chime (E5 659Hz + B5 987Hz).

### 2. Desktop Companion & Windows Automation
Integrated into the Command Center HUD grid and AI tool router:
- **`app_launcher.py`**: Launches native Windows executables (`code.exe` for VS Code, `chrome.exe`, `whatsapp.exe`, `calc.exe`, `explorer.exe`).
- **Media & System Controls**:
  - Web shortcuts (YouTube, Spotify Web).
  - Native Windows Master Mute (`win32` VK audio key simulation).
  - Workstation Lock (`ctypes.windll.user32.LockWorkStation()`).
- **Live Hardware Telemetry**: Live RAM usage (GB used / total), CPU %, disk space free, and battery status streamed to the left HUD panel.

### 3. Safe Tool Execution & Gated Confirmations
Adhii Jarvis divides tools into two strictly governed categories:
1. **Read-Only / Safe Tools (Instant Execution)**:
   - AST Math Evaluator (evaluates complex arithmetic safely without dangerous Python `eval()`).
   - Datetime & Relative Date Calculator.
   - Live Weather Service.
   - DuckDuckGo Web Search.
2. **State-Changing / Destructive Tools (Gated Execution)**:
   - Creating tasks, notes, or reminders.
   - Modifying system settings.
   - When triggered, Jarvis pauses execution and sends a **`tool_confirmation_required`** card. The action is only committed to the database after the user clicks **"Authorize & Execute"**.

### 4. Productivity Suite: Notes, Tasks & Reminders
* **Saved Notes**: Rich note editor with real-time text query filtering. Accessible both from the left sidebar and through vocal prompts (*"Jarvis, note that the project deadline is Friday"*).
* **Tasks & Planner**: Full priority matrix (`Urgent`, `High`, `Medium`, `Low`) with completion toggles and status filters (`All`, `Pending`, `Completed`).
* **Reminders**: Precision scheduled alerts with datetime picker. Handled by an asynchronous `APScheduler` background service that triggers alerts every 15 seconds.

### 5. Document Intelligence (RAG Pipeline)
* Ingests `.pdf`, `.docx`, `.txt`, and `.md` files.
* Chunks text into 500-token blocks with 50-token semantic overlap.
* Performs vector similarity matching against `pgvector` stored chunks.
* Injects grounded context chunks into the LLM system prompt, requiring exact source citations.

### 6. Multi-Model LLM Orchestration
Unified provider abstraction with automatic fallback:
- **Groq** (`llama-3.3-70b-versatile`): Default blazing-fast inference (~500 tokens/sec).
- **OpenAI** (`gpt-4o`): Complex analytical reasoning and structured extraction.
- **Anthropic** (`claude-3-5-sonnet`): High-context document analysis.
- **Local Mock**: Automatic offline fallback guaranteeing the application never crashes even without an active internet connection.

### 7. Spotify Playback Integration
- Dedicated Spotify playback card in the Command Center.
- Supports pause, resume, next track, previous track, and desktop application launching.

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
│   │   │   ├── desktop.py           # Desktop companion & telemetry
│   │   │   ├── documents.py         # Document upload and RAG Q&A
│   │   │   ├── notes.py             # Notes management
│   │   │   ├── reminders.py         # Scheduled reminder endpoints
│   │   │   ├── settings.py          # Profiles, memories, notifications, logs
│   │   │   ├── spotify.py           # Spotify controls
│   │   │   ├── tasks.py             # Tasks & priority planner
│   │   │   ├── tools.py             # Calculator, datetime, weather, search
│   │   │   └── voice.py             # Audio streaming and voice routes
│   │   ├── ai/                      # Orchestrator, prompt builder, providers
│   │   ├── companion/               # Native Windows agent (Win32 & psutil)
│   │   ├── core/                    # Config, security, logging, exceptions
│   │   ├── database/                # Supabase store & repositories
│   │   ├── models/                  # Pydantic request & response schemas
│   │   ├── rag/                     # Parser, chunker, embeddings, retriever
│   │   ├── realtime/                # Socket.IO manager & event handlers
│   │   ├── services/                # Background scheduler & Spotify service
│   │   ├── tools/                   # AST calculator, app launcher, task tools
│   │   └── voice/                   # Edge-TTS British neural voice provider
│   ├── tests/                       # Automated Pytest suite
│   ├── requirements.txt             # Python dependencies
│   ├── Dockerfile                   # Production container definition
│   └── .env.example                 # Backend environment variable template
│
├── frontend/
│   ├── src/
│   │   ├── api/                     # Typed REST API client
│   │   ├── components/              # ChatMessage, VoiceWaveform, Navbar, Sidebar...
│   │   │   └── command-center/      # MK-COMMAND HUD Subcomponents
│   │   │       ├── CommandTerminal.tsx
│   │   │       ├── JarvisCommandCenter.tsx
│   │   │       ├── JarvisCore.tsx
│   │   │       ├── NotesPanel.tsx
│   │   │       ├── SpotifyCard.tsx
│   │   │       ├── SystemControlGrid.tsx
│   │   │       ├── TelemetryPanel.tsx
│   │   │       └── TopStatusBar.tsx
│   │   ├── context/                 # AuthContext and SocketContext
│   │   ├── hooks/                   # useVoiceRecognition hook
│   │   ├── layouts/                 # Responsive MainLayout with sidebar & navbar
│   │   ├── pages/                   # Landing, Chat, Dashboard, Notes, Tasks, Reminders...
│   │   ├── utils/                   # jarvisSoundSystem.ts (Web Audio API Engine)
│   │   ├── App.tsx                  # Routing configuration
│   │   └── main.tsx                 # React entry point
│   ├── package.json                 # Frontend dependencies
│   ├── vite.config.ts               # Vite configuration
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
├── start_jarvis.bat                 # One-click Windows startup script
├── stop_jarvis.bat                  # One-click Windows shutdown script
├── docker-compose.yml               # Multi-container orchestration
├── render.yaml                      # Render cloud backend deployment config
└── README.md                        # Master Project Documentation
```

---

## ⚡ Getting Started & Installation

### One-Click Launch (Windows)
Double-click **`start_jarvis.bat`** in the root directory.  
This automatically starts both the Python FastAPI backend and the React Vite frontend, waits for initialization, and launches `http://127.0.0.1:5173/` in your default browser.

To stop the servers at any time, run **`stop_jarvis.bat`**.

---

### Manual Step-by-Step Setup

#### 1. Prerequisites
- **Python**: 3.11 or higher
- **Node.js**: 18.0 or higher (with npm)
- **Git**

#### 2. Backend Setup
```bash
# Navigate to the backend directory
cd ADHII_JARVIS/backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file from template
cp .env.example .env

# Start FastAPI and Socket.IO server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend will be running at **`http://127.0.0.1:8000`** with interactive API docs at **`http://127.0.0.1:8000/docs`**.

#### 3. Frontend Setup
```bash
# In a new terminal, navigate to the frontend directory
cd ADHII_JARVIS/frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
The frontend will be running at **`http://127.0.0.1:5173`**.

---

## 🔐 Database Setup & Security

The project uses PostgreSQL with Supabase for data persistence and authentication.

1. Create a project in [Supabase](https://supabase.com) named `adhii_jarvis`.
2. Open the **SQL Editor** in the Supabase Dashboard.
3. Run the SQL files in this exact sequence:
   - `database/schema.sql` (Creates all 11 tables, `pgvector` extension, and trigger functions).
   - `database/policies.sql` (Applies Row Level Security policies guaranteeing user data isolation).
   - `database/seed.sql` (Optional: Seeds starter data).
4. Copy your Supabase URL and keys into `backend/.env`:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

*Note: For local evaluation or placement demonstration, the project features built-in in-memory fallback stores and a 1-click Demo Sign In, allowing all features to be tested even without connecting an external database.*

---

## 📡 API & WebSocket Specifications

### Core REST Endpoints
* `GET  /api/conversations` — Retrieve conversation threads
* `POST /api/conversations` — Initialize a new conversation
* `POST /api/documents/upload` — Ingest document for semantic RAG
* `POST /api/documents/query` — Execute grounded Q&A with source citations
* `GET  /api/notes` — Retrieve user notes
* `POST /api/notes` — Create a new note
* `GET  /api/tasks` — List tasks filtered by status
* `POST /api/tasks` — Create a prioritized task
* `GET  /api/reminders` — List scheduled alerts
* `POST /api/reminders` — Schedule a new reminder
* `GET  /api/desktop/telemetry` — Live hardware metrics (RAM, CPU, disk, battery)
* `POST /api/desktop/launch` — Launch Windows desktop applications
* `POST /api/desktop/lock` — Secure lock workstation
* `POST /api/desktop/mute` — Toggle master audio mute

### Socket.IO Event Contract
* `join_conversation` (`client -> server`): Subscribe to a conversation channel.
* `send_message` (`client -> server`): Dispatch prompt with optional voice reply flag.
* `token_stream` (`server -> client`): Real-time token delivery for streaming text animation.
* `audio_stream` (`server -> client`): Base64 chunks of synthesized British neural audio.
* `tool_confirmation_required` (`server -> client`): Gated action approval request.
* `confirm_tool` (`client -> server`): User authorization grant/deny.
* `assistant_state_change` (`server -> client`): Real-time core state (`IDLE`, `LISTENING`, `PROCESSING`, `SPEAKING`).

---

## 🧪 Automated Testing & Verification

The codebase includes comprehensive test suites across both layers:

```bash
# Run Backend Test Suite (Pytest)
cd backend
pytest -v

# Run Frontend Test Suite (Vitest)
cd frontend
npm test

# Run Production Frontend Typecheck & Build
npm run build
```

| Test Suite | Total Tests | Status | Coverage Areas |
| :--- | :--- | :--- | :--- |
| **Backend (Pytest)** | 17 Tests | ✅ 100% Passed | AST Calculator, Tools Registry, Auth JWT, Telemetry, Scheduler, RAG |
| **Frontend (Vitest)** | 5 Tests | ✅ 100% Passed | Component rendering, Socket context, Navigation, State indicators |
| **Production Build** | `tsc && vite build` | ✅ Clean Build | Zero TypeScript errors, Rollup bundle optimization |

---

## 🎓 Placement & Engineering Interview Guide

If demonstrating this project for engineering placements, portfolios, or interviews, highlight these architectural talking points:

1. **Why not just call OpenAI directly?**  
   *Discuss the Provider Abstraction Pattern (`backend/app/ai/providers/`). The orchestrator decouples business logic from vendors, allowing zero-downtime switching between Groq, OpenAI, Anthropic, or local offline fallbacks.*

2. **Why is the AST Calculator important?**  
   *Explain the vulnerability of using Python's `eval()` for math tools (remote code execution risk). Adhii Jarvis parses mathematical expressions into an Abstract Syntax Tree using `ast.parse` and whitelist-validates operators (`ast.Add`, `ast.Mult`, etc.), eliminating code injection attacks.*

3. **How does the Tool Confirmation Gate ensure safety?**  
   *Describe the distinction between read-only tools and state-changing actions. When the LLM decides to create a task or modify data, the server emits a pending confirmation event and halts execution until the human user confirms.*

4. **How does the dual-interface switching work?**  
   *Explain the UX flow between the high-density productivity workspace (Interface 1) and the immersive Stark Command Center HUD (Interface 2), triggered via bidirectional routing and the procedural Web Audio SFX engine.*

---

<div align="center">

**Adhii Jarvis — Personal AI Workspace**  
*Crafted for high-performance software engineering, voice intelligence, and desktop execution.*

</div>
