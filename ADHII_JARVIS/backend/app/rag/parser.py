import os
import io
import asyncio
import concurrent.futures
from typing import Optional
import pypdf
import docx
from app.core.exceptions import FileSecurityError, ValidationError
from app.core.logging import logger

def _extract_ocr_from_scanned_pdf(file_path: str) -> str:
    """Run Windows native OCR on pages of scanned PDFs without selectable text."""
    try:
        import winocr
        from PIL import Image

        async def _ocr_all():
            reader = pypdf.PdfReader(file_path)
            extracted_pages = []
            for i, page in enumerate(reader.pages):
                page_texts = []
                for img in page.images:
                    try:
                        pil_img = Image.open(io.BytesIO(img.data))
                        res = await winocr.recognize_pil(pil_img, 'en')
                        if res.text and res.text.strip():
                            page_texts.append(res.text.strip())
                    except Exception as img_err:
                        logger.warning(f"Error OCRing image on page {i}: {img_err}")
                if page_texts:
                    extracted_pages.append(f"[Page {i+1} - Scanned OCR]\n" + "\n".join(page_texts))
            return "\n\n".join(extracted_pages)

        with concurrent.futures.ThreadPoolExecutor() as pool:
            return pool.submit(lambda: asyncio.run(_ocr_all())).result()
    except Exception as e:
        logger.warning(f"Native OCR fallback failed: {e}")
        return ""

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
            extracted = "\n\n".join(pages).strip()
            if not extracted:
                logger.info(f"PDF {filename} has no embedded text layer. Running Windows OCR...")
                extracted = _extract_ocr_from_scanned_pdf(file_path)
            return extracted
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
