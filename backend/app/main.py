from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import config
from app.utils.errors import generic_exception_handler
from app.api import health, chat, guardrail, attack, evaluation, demo, session
print("DEBUG: GROQ_API_KEY starts with:", config.GROQ_API_KEY[:6] if config.GROQ_API_KEY else "EMPTY")
app = FastAPI(
    title="AI Guardrails API",
    description="Backend for the AI Guardrails: Build, Attack, and Protect an AI Student Support Assistant project.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[config.FRONTEND_ORIGIN, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(Exception, generic_exception_handler)

app.include_router(health.router)
app.include_router(chat.router)
app.include_router(guardrail.router)
app.include_router(attack.router)
app.include_router(evaluation.router)
app.include_router(demo.router)
app.include_router(session.router)


@app.get("/")
async def root():
    return {"message": "AI Guardrails API is running. See /docs for API documentation."}
