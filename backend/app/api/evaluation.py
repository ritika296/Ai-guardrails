from fastapi import APIRouter, HTTPException
from app.schemas.api import EvaluationRunResponse
from app.evaluation.dataset import TEST_CASES
from app.evaluation.metrics import compute_metrics
from app.api.attack import _run_case

router = APIRouter()

_last_results = []


@router.post("/api/evaluation/run", response_model=EvaluationRunResponse)
async def run_evaluation():
    global _last_results
    results = [await _run_case(case) for case in TEST_CASES]
    _last_results = results
    metrics = compute_metrics(results)
    return EvaluationRunResponse(metrics=metrics, results=results)


@router.get("/api/evaluation/results", response_model=EvaluationRunResponse)
async def get_evaluation_results():
    if not _last_results:
        raise HTTPException(status_code=404, detail="No evaluation has been run yet. POST /api/evaluation/run first.")
    metrics = compute_metrics(_last_results)
    return EvaluationRunResponse(metrics=metrics, results=_last_results)
