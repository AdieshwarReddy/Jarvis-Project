import io
import edge_tts
from typing import Optional
from app.voice.providers.base import BaseTTSProvider
from app.core.logging import logger
from app.core.exceptions import ProviderError

class EdgeTTSProvider(BaseTTSProvider):
    """
    High-fidelity neural text-to-speech using Edge-TTS.
    Operates without paid API keys, providing fast, clear speech audio.
    """
    DEFAULT_VOICE = "en-GB-RyanNeural"

    def __init__(self, voice: Optional[str] = None):
        super().__init__(api_key=None)
        self.default_voice = voice or self.DEFAULT_VOICE

    async def synthesize(self, text: str, voice: Optional[str] = None) -> bytes:
        selected_voice = voice or self.default_voice
        try:
            communicate = edge_tts.Communicate(text, selected_voice, pitch="-2Hz", rate="+1%")
            buffer = io.BytesIO()
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    buffer.write(chunk["data"])
            buffer.seek(0)
            return buffer.read()
        except Exception as e:
            logger.error(f"EdgeTTS generation error: {e}")
            raise ProviderError(f"TTS synthesis failed: {e}")
