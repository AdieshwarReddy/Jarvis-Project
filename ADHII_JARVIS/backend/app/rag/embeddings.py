import math
import hashlib
from typing import List, Optional
from app.core.config import settings

def generate_local_embedding(text: str, dim: int = 1536) -> List[float]:
    """
    Generate deterministic normalized embedding vector.
    Enables offline vector similarity without requiring external paid API keys.
    """
    words = text.lower().split()
    vector = [0.0] * dim
    if not words:
        return vector

    for w in words:
        # Hash word to dimension index
        idx = int(hashlib.md5(w.encode("utf-8")).hexdigest(), 16) % dim
        vector[idx] += 1.0

    # L2 normalize
    norm = math.sqrt(sum(x * x for x in vector))
    if norm > 0:
        vector = [x / norm for x in vector]

    return vector

async def get_embedding(text: str) -> List[float]:
    """Retrieve embedding vector for text."""
    return generate_local_embedding(text)
