from fastapi import APIRouter
from app.schemas.api import ChatRequest, ChatResponse
from app.services.pipeline import run_pipeline, record_history, record_global

router = APIRouter()


@router.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    trace = await run_pipeline(req.message, mode=req.mode)
    record_history(req.session_id, trace)
    record_global(trace)
    return ChatResponse(trace=trace)
