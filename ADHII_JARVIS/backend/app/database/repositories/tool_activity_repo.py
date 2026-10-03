from typing import List, Dict, Any, Optional
from app.database.repositories.base import BaseRepository

class ToolActivityRepository(BaseRepository):
    def list(self, user_id: str) -> List[Dict[str, Any]]:
        return self.db.get_tool_activity(user_id)

    def log(self, user_id: str, tool_name: str, request_summary: str,
            status: str = "pending", requires_confirmation: bool = False,
            conversation_id: Optional[str] = None,
            parameters: Optional[Dict[str, Any]] = None,
            result: Optional[Any] = None) -> Dict[str, Any]:
        return self.db.log_tool_activity(user_id, tool_name, request_summary,
                                         status, requires_confirmation, conversation_id, parameters, result)

    def update(self, user_id: str, act_id: str, status: str, result: Optional[Any] = None) -> Dict[str, Any]:
        return self.db.update_tool_activity(user_id, act_id, status, result)

tool_activity_repo = ToolActivityRepository()
