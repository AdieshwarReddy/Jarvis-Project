import io
import edge_tts
from typing import Optional
from app.voice.providers.base import BaseTTSProvider
from app.core.logging import logger
from app.core.exceptions import ProviderError

class EdgeTTSProvider(BaseTTSProvider):
    """
    High-fidelity neural text-to-speech calibrated to British actor Paul Bettany's
    iconic J.A.R.V.I.S. voice in the Marvel Cinematic Universe.
    """
    DEFAULT_VOICE = "en-GB-RyanNeural"  # Authentic British RP male voice

    def __init__(self, voice: Optional[str] = None):
        super().__init__(api_key=None)
        self.default_voice = voice or self.DEFAULT_VOICE

    async def synthesize(self, text: str, voice: Optional[str] = None) -> bytes:
        selected_voice = voice or self.default_voice
        try:
            # Calibrated specifically for Paul Bettany's calm, measured, baritone British RP delivery
            communicate = edge_tts.Communicate(text, selected_voice, pitch="-4Hz", rate="-3%")
            buffer = io.BytesIO()
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    buffer.write(chunk["data"])
            buffer.seek(0)
            return buffer.read()
        except Exception as e:
            logger.error(f"EdgeTTS generation error: {e}")
            raise ProviderError(f"TTS synthesis failed: {e}")
