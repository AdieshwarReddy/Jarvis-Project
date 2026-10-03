import os
import uuid
import shutil
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from app.core.config import settings
from app.core.security import get_current_user
from app.core.exceptions import FileSecurityError, ValidationError
from app.models.schemas import DocumentResponse, DocumentAskRequest, DocumentAskResponse
from app.database.repositories.documents_repo import documents_repo
from app.rag.parser import parse_file
from app.rag.chunker import chunk_text
from app.rag.retriever import retriever
from app.ai.providers import get_llm_provider
from app.ai.prompts import BASE_SYSTEM_PROMPT

router = APIRouter(prefix="/api/documents", tags=["Documents & RAG"])

@router.get("", response_model=List[DocumentResponse])
async def list_documents(user: Dict[str, Any] = Depends(get_current_user)):
    """List all uploaded documents for the user."""
    return documents_repo.list(user["id"])

@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Secure document upload endpoint.
    Validates file extension, size, extracts text, chunks content, and stores for RAG.
    """
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise FileSecurityError(f"Unsupported file extension '{ext}'. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}")

    # Create safe unique filename
    safe_filename = f"{uuid.uuid4()}_{os.path.basename(file.filename)}"
    destination = os.path.join(settings.UPLOAD_DIR, safe_filename)

    # Save to disk
    file_size = 0
    with open(destination, "wb") as buffer:
        while chunk := await file.read(1024 * 1024):  # 1MB chunks
            file_size += len(chunk)
            if file_size > settings.MAX_UPLOAD_SIZE_BYTES:
                buffer.close()
                os.remove(destination)
                raise FileSecurityError(f"File size exceeds limit of {settings.MAX_UPLOAD_SIZE_BYTES / 1024 / 1024}MB")
            buffer.write(chunk)

    # Record document in database
    doc = documents_repo.create(
        user_id=user["id"],
        filename=file.filename,
        file_type=ext.replace(".", ""),
        storage_path=destination
    )

    try:
        # Extract and parse content
        extracted_text = parse_file(destination, file.filename)
        # Chunk text
        chunks = chunk_text(extracted_text, chunk_size=600, overlap=100)
        # Save chunks
        documents_repo.save_chunks(user_id=user["id"], doc_id=doc["id"], chunks=chunks)
        # Refresh doc record
        doc = documents_repo.get(user["id"], doc["id"])
        return doc
    except Exception as e:
        documents_repo.update_status(doc["id"], "failed")
        raise ValidationError(f"Document processing failed: {str(e)}")

@router.get("/{document_id}")
async def get_document(document_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    """Retrieve document details and chunk previews."""
    return documents_repo.get(user["id"], document_id)

@router.delete("/{document_id}")
async def delete_document(document_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    """Delete document and its stored chunks."""
    doc = documents_repo.get(user["id"], document_id)
    if doc.get("storage_path") and os.path.exists(doc["storage_path"]):
        try:
            os.remove(doc["storage_path"])
        except Exception:
            pass
    documents_repo.delete(user["id"], document_id)
    return {"status": "success", "message": "Document removed"}

@router.post("/{document_id}/ask", response_model=DocumentAskResponse)
async def ask_document(
    document_id: str,
    body: DocumentAskRequest,
    user: Dict[str, Any] = Depends(get_current_user)
):
    """Grounded question answering against a specific document using RAG."""
    chunks = retriever.retrieve(user_id=user["id"], query=body.question, limit=4, doc_id=document_id)
    if not chunks:
        return DocumentAskResponse(
            answer="No relevant content found in this document to answer your question.",
            sources=[]
        )

    rag_text = retriever.build_rag_context(chunks)
    system_prompt = f"{BASE_SYSTEM_PROMPT}\n\nYou must ground your answer strictly in the provided document context. Cite facts accurately.\n\n{rag_text}"
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": body.question}
    ]

    llm = get_llm_provider()
    answer = await llm.generate(messages)

    return DocumentAskResponse(
        answer=answer,
        sources=[{"filename": c.get("filename"), "score": c.get("score"), "snippet": c.get("content")[:150]} for c in chunks]
    )
