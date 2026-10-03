from typing import List, Dict, Any

def chunk_text(text: str, chunk_size: int = 600, overlap: int = 100) -> List[Dict[str, Any]]:
    """Split text into overlapping semantic chunks with metadata."""
    cleaned = text.strip()
    if not cleaned:
        return []

    chunks = []
    start = 0
    total_len = len(cleaned)
    index = 0

    while start < total_len:
        end = min(start + chunk_size, total_len)
        # Attempt to split on newline or period near end to avoid breaking words
        if end < total_len:
            split_candidate = cleaned.rfind("\n", start, end)
            if split_candidate == -1 or split_candidate < start + (chunk_size // 2):
                split_candidate = cleaned.rfind(". ", start, end)
            if split_candidate != -1 and split_candidate > start + (chunk_size // 2):
                end = split_candidate + 1

        chunk_str = cleaned[start:end].strip()
        if chunk_str:
            chunks.append({
                "chunk_index": index,
                "content": chunk_str,
                "metadata": {
                    "start_char": start,
                    "end_char": end,
                    "length": len(chunk_str)
                }
            })
            index += 1

        start = end - overlap if end < total_len else total_len
        if start >= total_len:
            break

    return chunks
