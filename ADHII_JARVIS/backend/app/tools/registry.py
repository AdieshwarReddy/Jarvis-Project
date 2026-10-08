import inspect
from typing import Dict, Any, Callable, List, Optional
from app.core.exceptions import ToolExecutionError
from app.tools.calculator import evaluate_expression
from app.tools.datetime_tool import get_current_datetime, calculate_relative_date
from app.tools.weather import get_weather
from app.tools.search import web_search
from app.tools.notes_tool import execute_create_note, execute_search_notes
from app.tools.tasks_tool import execute_create_task, execute_list_tasks, execute_complete_task
from app.tools.reminders_tool import execute_create_reminder, execute_list_reminders
from app.tools.app_launcher import execute_open_app
from app.database.repositories.documents_repo import documents_repo

class ToolDefinition:
    def __init__(
        self,
        name: str,
        description: str,
        input_schema: Dict[str, Any],
        handler: Callable,
        requires_confirmation: bool = False
    ):
        self.name = name
        self.description = description
        self.input_schema = input_schema
        self.handler = handler
        self.requires_confirmation = requires_confirmation

    async def execute(self, user_id: str, **kwargs) -> Any:
        # Check if handler accepts user_id
        sig = inspect.signature(self.handler)
        call_kwargs = dict(kwargs)
        if "user_id" in sig.parameters:
            call_kwargs["user_id"] = user_id

        if inspect.iscoroutinefunction(self.handler):
            return await self.handler(**call_kwargs)
        return self.handler(**call_kwargs)

class ToolRegistry:
    def __init__(self):
        self._tools: Dict[str, ToolDefinition] = {}
        self._register_default_tools()

    def register(self, tool: ToolDefinition):
        self._tools[tool.name] = tool

    def get(self, name: str) -> Optional[ToolDefinition]:
        return self._tools.get(name)

    def list_tools(self) -> List[Dict[str, Any]]:
        return [
            {
                "name": t.name,
                "description": t.description,
                "input_schema": t.input_schema,
                "requires_confirmation": t.requires_confirmation
            }
            for t in self._tools.values()
        ]

    def _register_default_tools(self):
        # 1. Calculator (Read-only)
        self.register(ToolDefinition(
            name="calculator",
            description="Safely evaluate arithmetic expressions, calculations, and percentages.",
            input_schema={
                "type": "object",
                "properties": {
                    "expression": {"type": "string", "description": "The math expression (e.g. '18% of 42000' or '25 * 4')"}
                },
                "required": ["expression"]
            },
            handler=lambda expression: evaluate_expression(expression),
            requires_confirmation=False
        ))

        # 2. Date & Time (Read-only)
        self.register(ToolDefinition(
            name="current_datetime",
            description="Get current date and time for a given timezone.",
            input_schema={
                "type": "object",
                "properties": {
                    "timezone": {"type": "string", "description": "Timezone name (e.g. 'UTC', 'Asia/Kolkata', 'America/New_York')"}
                }
            },
            handler=lambda timezone="UTC": get_current_datetime(timezone),
            requires_confirmation=False
        ))

        # 3. Weather (Read-only)
        self.register(ToolDefinition(
            name="weather",
            description="Get live weather forecast and temperature for any city.",
            input_schema={
                "type": "object",
                "properties": {
                    "location": {"type": "string", "description": "City or location name"}
                },
                "required": ["location"]
            },
            handler=get_weather,
            requires_confirmation=False
        ))

        # 4. Search (Read-only)
        self.register(ToolDefinition(
            name="search",
            description="Search the web for up-to-date facts, documentation, and external information.",
            input_schema={
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Search query text"}
                },
                "required": ["query"]
            },
            handler=web_search,
            requires_confirmation=False
        ))

        # 5. Document Search / RAG (Read-only)
        self.register(ToolDefinition(
            name="document_search",
            description="Search through user uploaded documents and return relevant context chunks.",
            input_schema={
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Search query for uploaded documents"}
                },
                "required": ["query"]
            },
            handler=lambda user_id, query: documents_repo.search_chunks(user_id=user_id, query=query),
            requires_confirmation=False
        ))

        # 6. Notes Search (Read-only)
        self.register(ToolDefinition(
            name="search_notes",
            description="Search existing notes in the user's workspace.",
            input_schema={
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Search keyword for notes"}
                }
            },
            handler=execute_search_notes,
            requires_confirmation=False
        ))

        # 7. Create Note (Write / Action -> Requires Confirmation)
        self.register(ToolDefinition(
            name="create_note",
            description="Create and save a new note in the workspace.",
            input_schema={
                "type": "object",
                "properties": {
                    "title": {"type": "string", "description": "Title of the note"},
                    "content": {"type": "string", "description": "Body text or content of the note"}
                },
                "required": ["title", "content"]
            },
            handler=execute_create_note,
            requires_confirmation=True
        ))

        # 8. Create Task (Write / Action -> Requires Confirmation)
        self.register(ToolDefinition(
            name="create_task",
            description="Create and schedule a new task in the workspace.",
            input_schema={
                "type": "object",
                "properties": {
                    "title": {"type": "string", "description": "Title of the task"},
                    "description": {"type": "string", "description": "Optional details"},
                    "priority": {"type": "string", "enum": ["low", "medium", "high", "urgent"]},
                    "due_at": {"type": "string", "description": "Due date ISO string"}
                },
                "required": ["title"]
            },
            handler=execute_create_task,
            requires_confirmation=True
        ))

        # 9. Complete Task (Write / Action -> Requires Confirmation)
        self.register(ToolDefinition(
            name="complete_task",
            description="Mark a task as completed in the user's workspace.",
            input_schema={
                "type": "object",
                "properties": {
                    "task_id": {"type": "string", "description": "UUID of the task"}
                },
                "required": ["task_id"]
            },
            handler=execute_complete_task,
            requires_confirmation=True
        ))

        # 10. Create Reminder (Write / Action -> Requires Confirmation)
        self.register(ToolDefinition(
            name="create_reminder",
            description="Schedule a timely reminder in the workspace.",
            input_schema={
                "type": "object",
                "properties": {
                    "title": {"type": "string", "description": "Reminder description"},
                    "reminder_at": {"type": "string", "description": "Reminder target time ISO string"}
                },
                "required": ["title", "reminder_at"]
            },
            handler=execute_create_reminder,
            requires_confirmation=True
        ))

        # 11. Open App Tool (Immediate execution / Read-only action)
        self.register(ToolDefinition(
            name="open_app",
            description="Launch or open a desktop application on Windows (e.g. VS Code, WhatsApp, Chrome, Notepad, Spotify, Calculator).",
            input_schema={
                "type": "object",
                "properties": {
                    "app_name": {"type": "string", "description": "Name of the application to launch (e.g. 'vs code', 'whatsapp', 'chrome')"}
                },
                "required": ["app_name"]
            },
            handler=lambda app_name: execute_open_app(app_name),
            requires_confirmation=False
        ))

        # 12. Spotify Play Tool (Immediate execution with desktop fallback)
        from app.services.spotify_service import spotify_service
        self.register(ToolDefinition(
            name="spotify_play",
            description="Play music or search tracks on Spotify with desktop application fallback.",
            input_schema={
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Song title or artist to play on Spotify"}
                },
                "required": ["query"]
            },
            handler=lambda query: spotify_service.play(query),
            requires_confirmation=False
        ))

# Global tool registry
tool_registry = ToolRegistry()
