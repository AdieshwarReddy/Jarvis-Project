import pytest

@pytest.mark.asyncio
async def test_conversation_lifecycle(async_client, auth_headers):
    # 1. Create conversation
    create_resp = await async_client.post(
        "/api/conversations",
        headers=auth_headers,
        json={"title": "Test AI Chat"}
    )
    assert create_resp.status_code == 201
    conv = create_resp.json()
    conv_id = conv["id"]
    assert conv["title"] == "Test AI Chat"

    # 2. Send message
    msg_resp = await async_client.post(
        f"/api/conversations/{conv_id}/messages",
        headers=auth_headers,
        json={"role": "user", "content": "Hello Adhii Jarvis!"}
    )
    assert msg_resp.status_code == 200
    res_data = msg_resp.json()
    assert "message" in res_data
    assert res_data["message"]["role"] == "assistant"

    # 3. Retrieve conversation details
    detail_resp = await async_client.get(f"/api/conversations/{conv_id}", headers=auth_headers)
    assert detail_resp.status_code == 200
    detail = detail_resp.json()
    assert len(detail["messages"]) >= 2

    # 4. Update title
    update_resp = await async_client.patch(
        f"/api/conversations/{conv_id}",
        headers=auth_headers,
        json={"title": "Updated Title"}
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["title"] == "Updated Title"

    # 5. Delete conversation
    del_resp = await async_client.delete(f"/api/conversations/{conv_id}", headers=auth_headers)
    assert del_resp.status_code == 200

    # 6. Verify deleted
    get_again = await async_client.get(f"/api/conversations/{conv_id}", headers=auth_headers)
    assert get_again.status_code == 404
