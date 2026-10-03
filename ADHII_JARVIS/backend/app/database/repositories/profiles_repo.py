from typing import Dict, Any
from app.database.repositories.base import BaseRepository

class ProfilesRepository(BaseRepository):
    def get(self, user_id: str) -> Dict[str, Any]:
        return self.db.get_profile(user_id)

    def update(self, user_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        return self.db.update_profile(user_id, updates)

profiles_repo = ProfilesRepository()
