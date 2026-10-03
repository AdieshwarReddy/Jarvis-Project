import pytest

@pytest.mark.asyncio
async def test_health_check(async_client):
    resp = await async_client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"
    assert data["service"] == "Adhii Jarvis Backend"

@pytest.mark.asyncio
async def test_unauthenticated_request_rejected(async_client):
    resp = await async_client.get("/api/conversations")
    assert resp.status_code == 401

@pytest.mark.asyncio
async def test_authenticated_profile(async_client, auth_headers):
    resp = await async_client.get("/api/profile", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "email" in data
    assert "display_name" in data

@pytest.mark.asyncio
async def test_user_data_isolation(async_client, auth_headers, user2_headers):
    # User 1 creates a private note
    create_resp = await async_client.post(
        "/api/notes",
        headers=auth_headers,
        json={"title": "User1 Private Note", "content": "Confidential"}
    )
    assert create_resp.status_code == 201
    note_id = create_resp.json()["id"]

    # User 2 tries to update User 1's note -> 403 Forbidden
    hack_resp = await async_client.patch(
        f"/api/notes/{note_id}",
        headers=user2_headers,
        json={"title": "Hacked Title"}
    )
    assert hack_resp.status_code == 403

    # User 2 tries to delete User 1's note -> 403 Forbidden
    del_resp = await async_client.delete(f"/api/notes/{note_id}", headers=user2_headers)
    assert del_resp.status_code == 403
