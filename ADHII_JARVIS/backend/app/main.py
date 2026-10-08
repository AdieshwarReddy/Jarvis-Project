from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio

from app.core.config import settings
from app.core.logging import logger
from app.core.exceptions import AppException, app_exception_handler, generic_exception_handler
from app.services.scheduler_service import reminder_scheduler
from app.realtime.socket_manager import sio
import app.realtime.events  # Ensure Socket.IO events are registered

# Import API Routers
from app.api.auth import router as auth_router
from app.api.conversations import router as conversations_router
from app.api.documents import router as documents_router
from app.api.notes import router as notes_router
from app.api.tasks import router as tasks_router
from app.api.reminders import router as reminders_router
from app.api.tools import router as tools_router
from app.api.settings import router as settings_router
from app.api.voice import router as voice_router
from app.api.desktop import router as desktop_router
from app.api.spotify import router as spotify_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Start reminder background scheduler
    logger.info("Initializing Adhii Jarvis backend services...")
    reminder_scheduler.start()
    yield
    # Shutdown: Stop reminder scheduler
    logger.info("Shutting down Adhii Jarvis backend services...")
    reminder_scheduler.stop()

# Initialize FastAPI application
fastapi_app = FastAPI(
    title="Adhii Jarvis — Personal AI Workspace",
    description="Full-stack AI voice assistant and intelligent workspace backend.",
    version=settings.VERSION,
    lifespan=lifespan
)

# Exception handlers
fastapi_app.add_exception_handler(AppException, app_exception_handler)
fastapi_app.add_exception_handler(Exception, generic_exception_handler)

# CORS Middleware
fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
fastapi_app.include_router(auth_router)
fastapi_app.include_router(conversations_router)
fastapi_app.include_router(documents_router)
fastapi_app.include_router(notes_router)
fastapi_app.include_router(tasks_router)
fastapi_app.include_router(reminders_router)
fastapi_app.include_router(tools_router)
fastapi_app.include_router(settings_router)
fastapi_app.include_router(voice_router)
fastapi_app.include_router(desktop_router)
fastapi_app.include_router(spotify_router)

@fastapi_app.get("/api/health", tags=["Health"])
async def health_check():
    """System health check endpoint."""
    return {
        "status": "healthy",
        "service": "Adhii Jarvis Backend",
        "version": settings.VERSION,
        "environment": settings.APP_ENV,
        "database": "connected",
        "llm_provider": settings.LLM_PROVIDER,
        "stt_provider": settings.STT_PROVIDER,
        "tts_provider": settings.TTS_PROVIDER,
        "scheduler": "running" if reminder_scheduler.is_running else "stopped"
    }

from app.tools.app_launcher import get_system_telemetry, execute_open_app

@fastapi_app.get("/api/system/stats", tags=["System"])
async def system_stats():
    """Live hardware & system telemetry for Stark HUD."""
    return get_system_telemetry()

@fastapi_app.post("/api/system/launch", tags=["System"])
async def launch_app_endpoint(data: dict):
    """Launch local desktop application or URL from HUD."""
    app_name = data.get("app_name", "")
    return execute_open_app(app_name)

# Wrap FastAPI with python-socketio ASGI App
app = socketio.ASGIApp(sio, other_asgi_app=fastapi_app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.BACKEND_HOST, port=settings.BACKEND_PORT, reload=True)
