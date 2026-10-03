import pytest
from app.tools.calculator import evaluate_expression
from app.core.exceptions import ToolExecutionError
from app.tools.registry import tool_registry

def test_calculator_basic_arithmetic():
    res = evaluate_expression("25 * 4 + 10")
    assert res["result"] == 110.0

def test_calculator_percentage_phrasing():
    # 18% of 42,000
    res = evaluate_expression("18% of 42000")
    assert res["result"] == 7560.0
    assert res["formatted"] == "7,560"

def test_calculator_rejects_unsafe_eval():
    with pytest.raises(ToolExecutionError):
        evaluate_expression("__import__('os').system('dir')")

    with pytest.raises(ToolExecutionError):
        evaluate_expression("import sys")

def test_tool_registry_confirmation_rules():
    calc_tool = tool_registry.get("calculator")
    assert calc_tool is not None
    assert calc_tool.requires_confirmation is False

    task_tool = tool_registry.get("create_task")
    assert task_tool is not None
    assert task_tool.requires_confirmation is True

    note_tool = tool_registry.get("create_note")
    assert note_tool is not None
    assert note_tool.requires_confirmation is True

@pytest.mark.asyncio
async def test_tool_router_confirmation_trigger(async_client, auth_headers):
    # Create conversation
    c_resp = await async_client.post("/api/conversations", headers=auth_headers, json={"title": "Tool Test"})
    conv_id = c_resp.json()["id"]

    # Send state-changing message: "Create a task to practice Python tomorrow"
    msg_resp = await async_client.post(
        f"/api/conversations/{conv_id}/messages",
        headers=auth_headers,
        json={"role": "user", "content": "Create a task to practice Python tomorrow"}
    )
    assert msg_resp.status_code == 200
    data = msg_resp.json()
    assert data["tool_confirmation_required"] is True
    assert data["tool_activity"]["requires_confirmation"] is True
    assert data["tool_activity"]["status"] == "pending"

    # Confirm the tool action
    act_id = data["tool_activity"]["id"]
    confirm_resp = await async_client.post(
        "/api/tools/confirm",
        headers=auth_headers,
        json={"tool_activity_id": act_id, "confirmed": True}
    )
    assert confirm_resp.status_code == 200
    assert confirm_resp.json()["confirmed"] is True

    # Verify task was actually created on Tasks page/API
    tasks_resp = await async_client.get("/api/tasks", headers=auth_headers)
    assert tasks_resp.status_code == 200
    tasks = tasks_resp.json()
    assert any("practice Python" in t["title"] for t in tasks)
