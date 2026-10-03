import logging
import re
import sys
from typing import Any

# Sensitive patterns to scrub from logs
SENSITIVE_PATTERNS = [
    (re.compile(r'(?i)(password|token|secret|key|bearer)\s*[:=]\s*["\']?([^"\'\s,]+)["\']?'), r'\1=[REDACTED]'),
    (re.compile(r'ey[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+'), '[JWT_REDACTED]'),
    (re.compile(r'gsk_[A-Za-z0-9]+'), '[GROQ_KEY_REDACTED]'),
    (re.compile(r'sk-[A-Za-z0-9]+'), '[API_KEY_REDACTED]'),
]

class SanitizedFormatter(logging.Formatter):
    """Logging formatter that scrubs API keys, JWT tokens, passwords, and sensitive strings."""
    def format(self, record: logging.LogRecord) -> str:
        original = super().format(record)
        sanitized = original
        for pattern, replacement in SENSITIVE_PATTERNS:
            sanitized = pattern.sub(replacement, sanitized)
        return sanitized

def setup_logger(name: str = "adhii_jarvis") -> logging.Logger:
    logger = logging.getLogger(name)
    if not logger.handlers:
        logger.setLevel(logging.INFO)
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(logging.INFO)
        formatter = SanitizedFormatter(
            fmt="%(asctime)s | %(levelname)-7s | %(name)s:%(funcName)s:%(lineno)d - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.propagate = False
    return logger

logger = setup_logger()
