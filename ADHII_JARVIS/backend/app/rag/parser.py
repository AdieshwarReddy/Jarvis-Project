import os
from typing import Optional
import pypdf
import docx
from app.core.exceptions import FileSecurityError, ValidationError
from app.core.logging import logger

def parse_file(file_path: str, filename: str) -> str:
    """Extract clean text content from PDF, DOCX, TXT, or MD documents."""
    if not os.path.exists(file_path):
        raise FileSecurityError("File not found on storage")

    ext = os.path.splitext(filename)[1].lower()

    if ext == ".pdf":
        try:
            reader = pypdf.PdfReader(file_path)
            pages = []
            for i, page in enumerate(reader.pages):
                text = page.extract_text()
                if text:
                    pages.append(f"[Page {i+1}]\n{text}")
            return "\n\n".join(pages)
        except Exception as e:
            logger.error(f"PDF extraction error: {e}")
            raise ValidationError(f"Failed to extract text from PDF: {str(e)}")

    elif ext == ".docx":
        try:
            doc = docx.Document(file_path)
            paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
            return "\n\n".join(paragraphs)
        except Exception as e:
            logger.error(f"DOCX extraction error: {e}")
            raise ValidationError(f"Failed to extract text from DOCX: {str(e)}")

    elif ext in (".txt", ".md"):
        try:
            with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                return f.read()
        except Exception as e:
            logger.error(f"Text file read error: {e}")
            raise ValidationError(f"Failed to read text file: {str(e)}")

    else:
        raise FileSecurityError(f"Unsupported file format '{ext}'. Supported: .pdf, .docx, .txt, .md")
