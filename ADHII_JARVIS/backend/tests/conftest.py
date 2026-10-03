import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import fastapi_app
from app.core.security import DEMO_USER, TEST_USER_2

@pytest.fixture
def auth_headers():
    return {"Authorization": "Bearer demo-token"}

@pytest.fixture
def user2_headers():
    return {"Authorization": "Bearer user2-token"}

@pytest_asyncio.fixture
async def async_client():
    transport = ASGITransport(app=fastapi_app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client
