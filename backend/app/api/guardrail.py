from fastapi import APIRouter
from app.schemas.api import GuardrailCheckRequest
from app.schemas.guardrail import PipelineTrace
from app.services.pipeline import run_pipeline

router = APIRouter()


@router.post("/api/guardrail/check", response_model=PipelineTrace)
async def guardrail_check(req: GuardrailCheckRequest):
    """
    Runs the full pipeline (same real code path as /api/chat) so the Pipeline
    visualizer and Request Inspector show genuine per-layer results.
    """
    return await run_pipeline(req.message, mode="protected")
