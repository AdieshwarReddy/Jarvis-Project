from typing import List, Dict, Any, Optional
from app.database.repositories.base import BaseRepository

class DocumentsRepository(BaseRepository):
    def list(self, user_id: str) -> List[Dict[str, Any]]:
        return self.db.get_documents(user_id)

    def get(self, user_id: str, doc_id: str) -> Dict[str, Any]:
        return self.db.get_document(user_id, doc_id)

    def create(self, user_id: str, filename: str, file_type: str, storage_path: str) -> Dict[str, Any]:
        return self.db.create_document(user_id, filename, file_type, storage_path)

    def update_status(self, doc_id: str, status: str) -> None:
        self.db.update_document_status(doc_id, status)

    def save_chunks(self, user_id: str, doc_id: str, chunks: List[Dict[str, Any]]) -> None:
        self.db.save_document_chunks(user_id, doc_id, chunks)

    def delete(self, user_id: str, doc_id: str) -> bool:
        return self.db.delete_document(user_id, doc_id)

    def search_chunks(self, user_id: str, query: str, limit: int = 5, doc_id: Optional[str] = None) -> List[Dict[str, Any]]:
        return self.db.search_user_chunks(user_id, query, limit, doc_id)

documents_repo = DocumentsRepository()
