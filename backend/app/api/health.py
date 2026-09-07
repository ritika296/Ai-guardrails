from fastapi import APIRouter
from app.schemas.api import HealthResponse
from app import config

router = APIRouter()


@router.get("/api/health", response_model=HealthResponse)
async def health():
    return HealthResponse(
        status="ok",
        grok_configured=config.grok_configured(),
        guardrails_status="active",
    )
