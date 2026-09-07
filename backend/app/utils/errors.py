"""
Ensures raw exceptions/stack traces never reach the frontend — every
unhandled error is translated into a safe, generic JSON error shape.
"""
import logging
from fastapi import Request
from fastapi.responses import JSONResponse

logger = logging.getLogger("ai_guardrails")


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled error on %s", request.url.path)
    return JSONResponse(
        status_code=500,
        content={"error": "Something went wrong processing your request. Please try again."},
    )
