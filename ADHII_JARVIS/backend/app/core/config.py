import os
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    # App
    APP_NAME: str = "Adhii Jarvis"
    APP_ENV: str = "development"
    DEBUG: bool = True
    VERSION: str = "1.0.0"
    
    # Network / Server
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000
    FRONTEND_URL: str = "http://localhost:5173"
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]
    
    # Supabase (identifier: adhii_jarvis)
    SUPABASE_URL: Optional[str] = None
    SUPABASE_ANON_KEY: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None
    SUPABASE_JWT_SECRET: Optional[str] = None
    
    # LLM Provider Configuration
    LLM_PROVIDER: str = "groq"  # "groq", "openai", "anthropic", "mock"
    LLM_MODEL: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    
    # Voice STT / TTS
    STT_PROVIDER: str = "whisper"  # "whisper", "browser"
    STT_API_KEY: Optional[str] = None
    TTS_PROVIDER: str = "edge-tts"  # "edge-tts", "elevenlabs", "browser"
    ELEVENLABS_API_KEY: Optional[str] = None
    ELEVENLABS_VOICE_ID: str = "21m00Tcm4TlvDq8ikWAM"
    
    # External Tools
    WEATHER_API_KEY: Optional[str] = None
    SEARCH_API_KEY: Optional[str] = None
    
    # Storage / Uploads
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "uploads")
    MAX_UPLOAD_SIZE_BYTES: int = 10 * 1024 * 1024  # 10 MB
    ALLOWED_EXTENSIONS: List[str] = [".pdf", ".docx", ".txt", ".md"]

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
        "extra": "ignore"
    }

settings = Settings()

# Ensure uploads directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
