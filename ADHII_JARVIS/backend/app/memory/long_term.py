import re
from typing import Optional, Dict, Any, List
from app.database.repositories.memories_repo import memories_repo
from app.core.logging import logger

MEMORY_PATTERNS = [
    (re.compile(r'\b(my name is|call me)\s+([a-zA-Z\s]+)', re.I), "preference", 5),
    (re.compile(r'\b(i prefer|my preferred)\s+([^\.\,\n]+)', re.I), "preference", 4),
    (re.compile(r'\b(i usually use|i work with|i program in)\s+([^\.\,\n]+)', re.I), "fact", 4),
    (re.compile(r'\b(remember that|always remember|note that)\s+([^\.\n]+)', re.I), "instruction", 5),
    (re.compile(r'\b(my timezone is|i live in|i am located in)\s+([^\.\,\n]+)', re.I), "fact", 3),
    (re.compile(r'\b(i am a|my profession is)\s+([^\.\,\n]+)', re.I), "fact", 4),
]

class LongTermMemory:
    """Detects and stores meaningful long-term preferences, facts, and instructions."""
    
    def extract_and_store_memory(self, user_id: str, text: str) -> Optional[Dict[str, Any]]:
        """Scans user message for qualifying persistent facts or preferences."""
        cleaned = text.strip()
        for pattern, mem_type, importance in MEMORY_PATTERNS:
            match = pattern.search(cleaned)
            if match:
                content = cleaned[match.start():match.end()].strip()
                if len(content) > 10:
                    logger.info(f"Qualifying long-term memory identified for user {user_id[:8]}: {content}")
                    # Check if memory already exists
                    existing = memories_repo.list(user_id)
                    if not any(content.lower() in m["content"].lower() for m in existing):
                        return memories_repo.create(
                            user_id=user_id,
                            memory_type=mem_type,
                            content=content,
                            importance=importance
                        )
        return None

long_term_memory = LongTermMemory()
