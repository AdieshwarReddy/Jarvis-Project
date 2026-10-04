import base64
from pydantic import BaseModel
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from app.voice.tts_service import get_tts_provider
from app.core.security import get_current_user
from app.core.logging import logger

router = APIRouter(prefix="/api/voice", tags=["Voice"])

class TTSRequest(BaseModel):
    text: str
    voice: Optional[str] = None

@router.post("/tts")
async def text_to_speech(body: TTSRequest, user=Depends(get_current_user)):
    """Convert text to neural speech audio (Edge-TTS / ElevenLabs)."""
    if not body.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    try:
        tts = get_tts_provider()
        audio_bytes = await tts.synthesize(body.text[:1000], voice=body.voice)
        b64_audio = base64.b64encode(audio_bytes).decode("utf-8")
        return {
            "status": "success",
            "format": "mp3",
            "audio": b64_audio
        }
    except Exception as e:
        logger.error(f"TTS synthesis error: {e}")
        raise HTTPException(status_code=500, detail=f"TTS synthesis failed: {str(e)}")
