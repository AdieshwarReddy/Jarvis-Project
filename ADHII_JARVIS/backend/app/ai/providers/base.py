from abc import ABC, abstractmethod
from typing import List, Dict, Any, AsyncGenerator, Optional

class BaseLLMProvider(ABC):
    """
    Abstract base class for all LLM providers in Adhii Jarvis.
    Enforces unified interfaces for single completion generation, token streaming,
    and tool compatibility across Groq, OpenAI, Anthropic, and local/mock fallbacks.
    """
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key
        self.model = model

    @abstractmethod
    async def generate(self, messages: List[Dict[str, str]], temperature: float = 0.7, **kwargs) -> str:
        """Generate complete LLM response."""
        pass

    @abstractmethod
    async def stream(self, messages: List[Dict[str, str]], temperature: float = 0.7, **kwargs) -> AsyncGenerator[str, None]:
        """Stream response tokens incrementally."""
        pass

    @abstractmethod
    def supports_tools(self) -> bool:
        """Indicate whether the provider supports native JSON tool calling."""
        pass
