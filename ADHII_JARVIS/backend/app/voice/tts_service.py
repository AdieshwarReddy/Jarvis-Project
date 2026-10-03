from app.core.config import settings
from app.core.logging import logger
from app.voice.providers.base import BaseTTSProvider
from app.voice.providers.edge_tts_provider import EdgeTTSProvider
from app.voice.providers.elevenlabs_provider import ElevenLabsTTSProvider

def get_tts_provider(provider_name: str = None) -> BaseTTSProvider:
    name = (provider_name or settings.TTS_PROVIDER or "edge-tts").lower()

    if name == "elevenlabs" and settings.ELEVENLABS_API_KEY:
        return ElevenLabsTTSProvider(
            api_key=settings.ELEVENLABS_API_KEY,
            voice_id=settings.ELEVENLABS_VOICE_ID
        )

    # Edge-TTS works out-of-the-box with neural voices and no API key
    return EdgeTTSProvider()
