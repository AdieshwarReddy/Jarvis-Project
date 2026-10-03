from app.core.config import settings
from app.core.logging import logger
from app.voice.providers.base import BaseSTTProvider
from app.voice.providers.whisper_provider import WhisperSTTProvider

class BrowserFallbackSTTProvider(BaseSTTProvider):
    async def transcribe(self, audio_bytes: bytes, filename: str = "audio.wav") -> str:
        # Browser STT fallback is handled on the client side via Web Speech API
        return ""

def get_stt_provider() -> BaseSTTProvider:
    if settings.STT_API_KEY or settings.OPENAI_API_KEY:
        key = settings.STT_API_KEY or settings.OPENAI_API_KEY
        return WhisperSTTProvider(api_key=key)
    logger.info("STT_API_KEY not configured. Browser Web Speech fallback active.")
    return BrowserFallbackSTTProvider()
