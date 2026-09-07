from fastapi import APIRouter
from app.services.pipeline import get_history, clear_history, get_all_traces

router = APIRouter()


@router.get("/api/session/{session_id}/history")
async def history(session_id: str):
    return {"history": get_history(session_id)}


@router.delete("/api/session/{session_id}/history")
async def clear(session_id: str):
    clear_history(session_id)
    return {"cleared": True}


@router.get("/api/dashboard/stats")
async def dashboard_stats():
    traces = get_all_traces()
    total = len(traces)
    allow = sum(1 for t in traces if t.router.decision == "ALLOW")
    block = sum(1 for t in traces if t.router.decision == "BLOCK")
    escalate = sum(1 for t in traces if t.router.decision == "ESCALATE")
    return {
        "total_requests": total,
        "allow_count": allow,
        "block_count": block,
        "escalate_count": escalate,
    }
