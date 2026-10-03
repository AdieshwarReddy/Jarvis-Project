from typing import List, Dict, Any
from fastapi import APIRouter, Depends, status
from app.core.security import get_current_user
from app.models.schemas import (
    CalculatorRequest,
    CalculatorResponse,
    DatetimeRequest,
    DatetimeResponse,
    WeatherRequest,
    WeatherResponse,
    SearchRequest,
    SearchResponse,
    ToolConfirmRequest
)
from app.tools.registry import tool_registry
from app.tools.calculator import evaluate_expression
from app.tools.datetime_tool import get_current_datetime
from app.tools.weather import get_weather
from app.tools.search import web_search
from app.ai.orchestrator import orchestrator
from app.database.repositories.tool_activity_repo import tool_activity_repo

router = APIRouter(prefix="/api/tools", tags=["Tools"])

@router.get("")
async def list_tools():
    """List all registered tools in Adhii Jarvis and their execution rules."""
    return tool_registry.list_tools()

@router.post("/calculate", response_model=CalculatorResponse)
async def calculate_endpoint(body: CalculatorRequest):
    """Execute safe mathematical calculation without unsafe eval."""
    res = evaluate_expression(body.expression)
    return CalculatorResponse(
        expression=res["expression"],
        result=res["result"],
        formatted=res["formatted"]
    )

@router.post("/datetime", response_model=DatetimeResponse)
async def datetime_endpoint(body: DatetimeRequest):
    """Get timezone-aware current time and date."""
    res = get_current_datetime(body.timezone)
    return DatetimeResponse(
        current_time=res["current_time"],
        current_date=res["current_date"],
        timezone=res["timezone"],
        iso=res["iso"]
    )

@router.post("/weather", response_model=WeatherResponse)
async def weather_endpoint(body: WeatherRequest):
    """Get live weather information for location."""
    res = await get_weather(body.location)
    return WeatherResponse(
        location=res.get("location", body.location),
        temperature=res.get("temperature"),
        unit=res.get("unit", "C"),
        condition=res.get("condition", "Clear"),
        humidity=res.get("humidity"),
        wind_speed=res.get("wind_speed"),
        source=res.get("source", "WeatherAPI")
    )

@router.post("/search", response_model=SearchResponse)
async def search_endpoint(body: SearchRequest):
    """Execute live web search."""
    res = await web_search(body.query)
    return SearchResponse(query=res["query"], results=res["results"])

@router.post("/confirm")
async def confirm_tool_action(
    body: ToolConfirmRequest,
    user: Dict[str, Any] = Depends(get_current_user)
):
    """Confirm or reject a pending state-changing tool action."""
    if body.confirmed:
        result = await orchestrator.execute_confirmed_tool(
            user_id=user["id"],
            tool_activity_id=body.tool_activity_id
        )
        return {"status": "success", "confirmed": True, "result": result}
    else:
        tool_activity_repo.update(user["id"], body.tool_activity_id, status="rejected")
        return {"status": "success", "confirmed": False, "message": "Action rejected"}
