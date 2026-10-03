import pytest
from app.ai.providers.mock_provider import MockLLMProvider
from app.ai.providers import get_llm_provider

@pytest.mark.asyncio
async def test_mock_provider_generate():
    provider = MockLLMProvider()
    resp = await provider.generate([{"role": "user", "content": "Hello Jarvis"}])
    assert "Adhii Jarvis" in resp

@pytest.mark.asyncio
async def test_mock_provider_streaming():
    provider = MockLLMProvider()
    tokens = []
    async for token in provider.stream([{"role": "user", "content": "Who are you?"}]):
        tokens.append(token)
    full_text = "".join(tokens)
    assert len(tokens) > 1
    assert "Adhii Jarvis" in full_text

def test_provider_factory_fallback():
    provider = get_llm_provider("unconfigured_provider")
    assert provider is not None
