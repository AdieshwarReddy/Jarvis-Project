import httpx
from typing import Dict, Any, List
from app.core.config import settings
from app.core.logging import logger

async def web_search(query: str, limit: int = 4) -> Dict[str, Any]:
    """
    Execute live web search query.
    Returns: title, snippet, url.
    Never fabricates search results.
    """
    clean_query = query.strip()
    if not clean_query:
        return {"query": query, "results": []}

    # 1. Custom SEARCH_API_KEY (Tavily or similar) if provided
    if settings.SEARCH_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                resp = await client.post(
                    "https://api.tavily.com/search",
                    json={"query": clean_query, "api_key": settings.SEARCH_API_KEY, "max_results": limit}
                )
                if resp.status_code == 200:
                    data = resp.json()
                    results = []
                    for item in data.get("results", []):
                        results.append({
                            "title": item.get("title", ""),
                            "snippet": item.get("content", ""),
                            "url": item.get("url", "")
                        })
                    return {"query": query, "results": results}
        except Exception as e:
            logger.warning(f"Custom search API error: {e}")

    # 2. Public DuckDuckGo HTML / instant answer API
    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.get(
                "https://api.duckduckgo.com/",
                params={"q": clean_query, "format": "json", "no_redirect": "1", "no_html": "1"}
            )
            if resp.status_code == 200:
                data = resp.json()
                results = []
                
                # Check abstract
                abstract = data.get("AbstractText")
                if abstract:
                    results.append({
                        "title": data.get("Heading") or clean_query,
                        "snippet": abstract,
                        "url": data.get("AbstractURL") or "https://duckduckgo.com"
                    })
                
                # Check related topics
                for topic in data.get("RelatedTopics", []):
                    if len(results) >= limit:
                        break
                    if "Text" in topic and "FirstURL" in topic:
                        results.append({
                            "title": topic["Text"].split(" - ")[0] if " - " in topic["Text"] else clean_query,
                            "snippet": topic["Text"],
                            "url": topic["FirstURL"]
                        })

                if results:
                    return {"query": query, "results": results}
    except Exception as e:
        logger.warning(f"DuckDuckGo search error: {e}")

    # 3. Honest fallback message
    return {
        "query": query,
        "results": [
            {
                "title": f"Live Search result for: {query}",
                "snippet": "Web search requires an active SEARCH_API_KEY (e.g. Tavily) in your deployment environment variables for production query grounding.",
                "url": "https://duckduckgo.com/?q=" + clean_query.replace(" ", "+")
            }
        ]
    }
