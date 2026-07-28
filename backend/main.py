"""
YouTube Learning Assistant — FastAPI Application Entry Point.

Production-ready API server with CORS, rate limiting, and structured logging.
"""

import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from core.config import settings, BASE_DIR
from core.logging_config import get_logger
from database.session import create_tables

logger = get_logger(__name__)

# Ensure data directories exist
for directory in ["data", "data/audio", "data/exports", "data/chroma", "data/logs"]:
    (BASE_DIR / directory).mkdir(parents=True, exist_ok=True)


# ── Rate Limiter ─────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address, default_limits=[settings.RATE_LIMIT])


# ── Application Lifespan ────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    logger.info("🚀 Starting YouTube Learning Assistant API v{}", settings.APP_VERSION)

    # Create database tables on startup
    await create_tables()
    logger.info("✅ Database tables created/verified")

    yield

    logger.info("🛑 Shutting down YouTube Learning Assistant API")


# ── FastAPI Application ─────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "AI-powered YouTube video analysis tool that generates study materials, "
        "flashcards, quizzes, mind maps, and more using LLMs."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Global Exception Handler ────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch-all exception handler for unhandled errors."""
    logger.error("Unhandled exception: {} - {}", type(exc).__name__, str(exc))
    return JSONResponse(
        status_code=500,
        content={
            "detail": "An internal server error occurred. Please try again later.",
            "error_type": type(exc).__name__,
        },
    )


# ── Register Routers ────────────────────────────────────────────
from routers import analyze, content, chat, export, auth, history

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(analyze.router, prefix="/api", tags=["Analysis"])
app.include_router(content.router, prefix="/api", tags=["Content"])
app.include_router(chat.router, prefix="/api", tags=["Chat"])
app.include_router(export.router, prefix="/api", tags=["Export"])
app.include_router(history.router, prefix="/api", tags=["History"])


# ── Health Check ─────────────────────────────────────────────────
@app.get("/api/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "app": settings.APP_NAME,
        "available_providers": settings.available_providers,
    }


from llm.factory import get_available_providers


@app.get("/api/providers", tags=["Configuration"])
async def get_providers():
    """Get available LLM providers and their models."""
    providers = get_available_providers()
    return {"providers": providers, "default": settings.DEFAULT_LLM_PROVIDER}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="debug" if settings.DEBUG else "info",
    )
