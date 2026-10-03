from app.database.supabase import get_db, DatabaseStore

class BaseRepository:
    def __init__(self, db: DatabaseStore = None):
        self.db = db or get_db()
