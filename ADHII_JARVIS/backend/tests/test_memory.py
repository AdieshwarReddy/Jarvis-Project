import pytest
from app.memory.long_term import long_term_memory
from app.memory.retrieval import memory_retriever

@pytest.mark.asyncio
async def test_memory_creation_and_retrieval(async_client, auth_headers):
    # Create memory via REST
    resp = await async_client.post(
        "/api/memories",
        headers=auth_headers,
        json={"memory_type": "preference", "content": "Prefers dark mode and concise summaries", "importance": 4}
    )
    assert resp.status_code == 201
    mem = resp.json()
    assert mem["content"] == "Prefers dark mode and concise summaries"

    # List memories
    list_resp = await async_client.get("/api/memories", headers=auth_headers)
    assert list_resp.status_code == 200
    mems = list_resp.json()
    assert len(mems) >= 1

    # Delete memory
    del_resp = await async_client.delete(f"/api/memories/{mem['id']}", headers=auth_headers)
    assert del_resp.status_code == 200

def test_long_term_memory_extraction():
    demo_user = "00000000-0000-0000-0000-000000000001"
    # Extraction rule test
    extracted = long_term_memory.extract_and_store_memory(
        demo_user,
        "Remember that I am preparing for software engineering placement interviews."
    )
    assert extracted is not None
    assert "placement interviews" in extracted["content"]
