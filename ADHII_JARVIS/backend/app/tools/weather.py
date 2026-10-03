import httpx
from typing import Dict, Any, Optional
from app.core.config import settings
from app.core.logging import logger

async def get_weather(location: str) -> Dict[str, Any]:
    """
    Retrieve live weather for a given city or location.
    Uses OpenWeatherMap if WEATHER_API_KEY is configured,
    or falls back to public weather service wttr.in.
    Never fabricates weather.
    """
    cleaned_loc = location.strip()
    if not cleaned_loc:
        return {
            "error": True,
            "message": "Please specify a location for the weather query."
        }

    # 1. OpenWeatherMap if key is configured
    if settings.WEATHER_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                url = f"https://api.openweathermap.org/data/2.5/weather?q={cleaned_loc}&appid={settings.WEATHER_API_KEY}&units=metric"
                resp = await client.get(url)
                if resp.status_code == 200:
                    data = resp.json()
                    return {
                        "location": f"{data.get('name')}, {data.get('sys', {}).get('country')}",
                        "temperature": data.get("main", {}).get("temp"),
                        "unit": "°C",
                        "condition": data.get("weather", [{}])[0].get("description", "Unknown").capitalize(),
                        "humidity": data.get("main", {}).get("humidity"),
                        "wind_speed": data.get("wind", {}).get("speed"),
                        "source": "OpenWeatherMap"
                    }
                elif resp.status_code == 404:
                    return {
                        "error": True,
                        "message": f"Location '{cleaned_loc}' was not found."
                    }
        except Exception as e:
            logger.warning(f"OpenWeatherMap request failed: {e}")

    # 2. Public live weather fallback wttr.in JSON API
    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.get(
                f"https://wttr.in/{cleaned_loc}?format=j1",
                headers={"User-Agent": "curl/7.68.0"}
            )
            if resp.status_code == 200:
                data = resp.json()
                current = data["current_condition"][0]
                area = data.get("nearest_area", [{}])[0]
                city = area.get("areaName", [{}])[0].get("value", cleaned_loc)
                country = area.get("country", [{}])[0].get("value", "")
                return {
                    "location": f"{city}, {country}".strip(", "),
                    "temperature": float(current.get("temp_C", 0)),
                    "unit": "°C",
                    "condition": current.get("weatherDesc", [{}])[0].get("value", "Clear"),
                    "humidity": int(current.get("humidity", 0)),
                    "wind_speed": float(current.get("windspeedKmph", 0)),
                    "source": "wttr.in Live Weather"
                }
    except Exception as e:
        logger.warning(f"wttr.in weather fallback failed: {e}")

    # 3. Honest fallback if network is unreachable
    return {
        "error": True,
        "message": f"Live weather service is currently unreachable for '{cleaned_loc}'. Please configure WEATHER_API_KEY in backend settings."
    }
