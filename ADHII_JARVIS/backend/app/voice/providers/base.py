from abc import ABC, abstractmethod
from typing import Optional

class BaseSTTProvider(ABC):
    """Abstract interface for Speech-to-Text providers."""
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key

    @abstractmethod
    async def transcribe(self, audio_bytes: bytes, filename: str = "audio.wav") -> str:
        """Convert recorded voice audio into text transcript."""
        pass

class BaseTTSProvider(ABC):
    """Abstract interface for Text-to-Speech providers."""
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key

    @abstractmethod
    async def synthesize(self, text: str, voice: Optional[str] = None) -> bytes:
        """Convert response text into audio bytes."""
        pass
