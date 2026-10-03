from app.core.config import settings
from app.core.logging import logger
from app.ai.providers.base import BaseLLMProvider
from app.ai.providers.groq_provider import GroqProvider
from app.ai.providers.openai_provider import OpenAIProvider
from app.ai.providers.anthropic_provider import AnthropicProvider
from app.ai.providers.mock_provider import MockLLMProvider

def get_llm_provider(provider_name: str = None) -> BaseLLMProvider:
    name = (provider_name or settings.LLM_PROVIDER or "groq").lower()

    if name == "groq":
        if settings.GROQ_API_KEY:
            return GroqProvider(api_key=settings.GROQ_API_KEY, model=settings.LLM_MODEL)
        logger.info("GROQ_API_KEY not configured. Falling back to MockLLMProvider.")
        return MockLLMProvider()

    elif name == "openai":
        if settings.OPENAI_API_KEY:
            return OpenAIProvider(api_key=settings.OPENAI_API_KEY, model=settings.LLM_MODEL)
        logger.info("OPENAI_API_KEY not configured. Falling back to MockLLMProvider.")
        return MockLLMProvider()

    elif name == "anthropic":
        if settings.ANTHROPIC_API_KEY:
            return AnthropicProvider(api_key=settings.ANTHROPIC_API_KEY, model=settings.LLM_MODEL)
        logger.info("ANTHROPIC_API_KEY not configured. Falling back to MockLLMProvider.")
        return MockLLMProvider()

    elif name == "mock":
        return MockLLMProvider()

    logger.warning(f"Unknown LLM provider '{name}', defaulting to MockLLMProvider")
    return MockLLMProvider()
