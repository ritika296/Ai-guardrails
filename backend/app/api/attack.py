from fastapi import APIRouter, HTTPException
from app.schemas.api import AttackRunRequest, AttackRunResponse, AttackRunResult
from app.evaluation.dataset import TEST_CASES
from app.services.pipeline import run_pipeline, record_global

router = APIRouter()


async def _run_case(case) -> AttackRunResult:
    trace = await run_pipeline(case.input, mode="protected")
    record_global(trace)
    actual = trace.router.decision
    passed = actual == case.expected_decision
    return AttackRunResult(
        case=case,
        actual_decision=actual,
        actual_category=trace.router.category,
        actual_reason=trace.router.reason,
        triggered_layer=trace.router.triggered_layer,
        passed=passed,
        trace=trace,
    )


@router.post("/api/attack/run", response_model=AttackRunResponse)
async def run_attack(req: AttackRunRequest):
    if req.attack_id:
        case = next((c for c in TEST_CASES if c.id == req.attack_id), None)
        if not case:
            raise HTTPException(status_code=404, detail="Unknown attack_id")
        return AttackRunResponse(results=[await _run_case(case)])

    results = [await _run_case(case) for case in TEST_CASES]
    return AttackRunResponse(results=results)


@router.get("/api/attack/cases")
async def list_cases():
    return {"cases": TEST_CASES}
