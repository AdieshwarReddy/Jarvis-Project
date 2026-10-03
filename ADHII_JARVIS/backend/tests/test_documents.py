import pytest
import io
from app.rag.chunker import chunk_text
from app.rag.retriever import retriever

def test_chunk_text():
    sample = "Adhii Jarvis is an intelligent personal workspace. " * 30
    chunks = chunk_text(sample, chunk_size=200, overlap=50)
    assert len(chunks) > 1
    assert "content" in chunks[0]
    assert "metadata" in chunks[0]

@pytest.mark.asyncio
async def test_document_upload_and_rag(async_client, auth_headers):
    # Upload text document
    file_content = b"Adhii Jarvis Architecture Overview: The frontend is built in React Vite and communicates with FastAPI using Socket.IO."
    files = {"file": ("architecture.txt", io.BytesIO(file_content), "text/plain")}

    upload_resp = await async_client.post("/api/documents/upload", headers=auth_headers, files=files)
    assert upload_resp.status_code == 201
    doc = upload_resp.json()
    assert doc["filename"] == "architecture.txt"
    assert doc["chunk_count"] >= 1
    doc_id = doc["id"]

    # Ask grounded question via RAG endpoint
    ask_resp = await async_client.post(
        f"/api/documents/{doc_id}/ask",
        headers=auth_headers,
        json={"question": "What is the frontend built in?"}
    )
    assert ask_resp.status_code == 200
    res = ask_resp.json()
    assert "answer" in res
    assert len(res["sources"]) >= 1

    # Cleanup document
    del_resp = await async_client.delete(f"/api/documents/{doc_id}", headers=auth_headers)
    assert del_resp.status_code == 200
