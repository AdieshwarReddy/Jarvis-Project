import httpx
from typing import Optional
from app.voice.providers.base import BaseSTTProvider
from app.core.logging import logger
from app.core.exceptions import ProviderError

class WhisperSTTProvider(BaseSTTProvider):
    """Whisper API adapter for voice speech-to-text."""
    def __init__(self, api_key: Optional[str] = None):
        super().__init__(api_key=api_key)

    async def transcribe(self, audio_bytes: bytes, filename: str = "audio.wav") -> str:
        if not self.api_key:
            raise ProviderError("Whisper STT API key not configured")

        headers = {"Authorization": f"Bearer {self.api_key}"}
        files = {"file": (filename, audio_bytes, "audio/wav")}
        data = {"model": "whisper-1"}

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(
                    "https://api.openai.com/v1/audio/transcriptions",
                    headers=headers,
                    files=files,
                    data=data
                )
                if resp.status_code != 200:
                    logger.error(f"Whisper API error: {resp.status_code} - {resp.text}")
                    raise ProviderError(f"Whisper STT returned status {resp.status_code}")
                return resp.json().get("text", "")
        except httpx.RequestError as e:
            logger.error(f"Whisper connection error: {e}")
            raise ProviderError(f"Whisper connection error: {e}")
