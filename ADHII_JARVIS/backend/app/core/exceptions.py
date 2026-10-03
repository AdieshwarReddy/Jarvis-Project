from fastapi import Request, status
from fastapi.responses import JSONResponse
from app.core.logging import logger

class AppException(Exception):
    def __init__(self, message: str, status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR, details: dict = None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.details = details or {}

class AuthenticationError(AppException):
    def __init__(self, message: str = "Invalid or expired authentication credentials", details: dict = None):
        super().__init__(message=message, status_code=status.HTTP_401_UNAUTHORIZED, details=details)

class AuthorizationError(AppException):
    def __init__(self, message: str = "Permission denied for this resource", details: dict = None):
        super().__init__(message=message, status_code=status.HTTP_403_FORBIDDEN, details=details)

class NotFoundError(AppException):
    def __init__(self, message: str = "Requested resource was not found", details: dict = None):
        super().__init__(message=message, status_code=status.HTTP_404_NOT_FOUND, details=details)

class ValidationError(AppException):
    def __init__(self, message: str = "Validation failed", details: dict = None):
        super().__init__(message=message, status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, details=details)

class ToolExecutionError(AppException):
    def __init__(self, message: str = "Tool execution failed", details: dict = None):
        super().__init__(message=message, status_code=status.HTTP_400_BAD_REQUEST, details=details)

class ProviderError(AppException):
    def __init__(self, message: str = "AI or Voice provider error", details: dict = None):
        super().__init__(message=message, status_code=status.HTTP_502_BAD_GATEWAY, details=details)

class FileSecurityError(AppException):
    def __init__(self, message: str = "File validation failed", details: dict = None):
        super().__init__(message=message, status_code=status.HTTP_400_BAD_REQUEST, details=details)

async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    logger.warning(f"AppException: {exc.message} on {request.method} {request.url.path}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "message": exc.message,
            "details": exc.details,
            "path": str(request.url.path),
        }
    )

async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.error(f"Unhandled Exception: {str(exc)} on {request.method} {request.url.path}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": True,
            "message": "An unexpected internal server error occurred.",
            "path": str(request.url.path),
        }
    )
