import httpx
from typing import Optional
from app.voice.providers.base import BaseTTSProvider
from app.core.logging import logger
from app.core.exceptions import ProviderError

class ElevenLabsTTSProvider(BaseTTSProvider):
    """ElevenLabs TTS provider adapter."""
    def __init__(self, api_key: Optional[str] = None, voice_id: Optional[str] = None):
        super().__init__(api_key=api_key)
        self.voice_id = voice_id or "21m00Tcm4TlvDq8ikWAM"

    async def synthesize(self, text: str, voice: Optional[str] = None) -> bytes:
        if not self.api_key:
            raise ProviderError("ElevenLabs API key is not configured")

        voice_target = voice or self.voice_id
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_target}"
        headers = {
            "xi-api-key": self.api_key,
            "Content-Type": "application/json",
            "Accept": "audio/mpeg"
        }
        payload = {
            "text": text,
            "model_id": "eleven_monolingual_v1",
            "voice_settings": {"stability": 0.5, "similarity_boost": 0.75}
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(url, headers=headers, json=payload)
                if resp.status_code != 200:
                    logger.error(f"ElevenLabs error: {resp.status_code} - {resp.text}")
                    raise ProviderError(f"ElevenLabs returned status {resp.status_code}")
                return resp.content
        except httpx.RequestError as e:
            logger.error(f"ElevenLabs connection failure: {e}")
            raise ProviderError(f"ElevenLabs connection error: {e}")
