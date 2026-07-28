"""
Application configuration using Pydantic BaseSettings.
All settings are loaded from environment variables or .env file.
"""

from pathlib import Path
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


# Base directory for the backend project
BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    """Application settings with environment variable support."""

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Application ──────────────────────────────────────────────
    APP_NAME: str = "YouTube Learning Assistant"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:3001"

    # ── Database ─────────────────────────────────────────────────
    DATABASE_URL: str = f"sqlite+aiosqlite:///{BASE_DIR / 'data' / 'app.db'}"

    # ── JWT Authentication ───────────────────────────────────────
    SECRET_KEY: str = "change-this-to-a-very-long-random-secret-key-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # ── LLM Providers ───────────────────────────────────────────
    OPENAI_API_KEY: Optional[str] = None
    GOOGLE_API_KEY: Optional[str] = None
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    DEFAULT_LLM_PROVIDER: str = "openai"  # openai | google | ollama
    DEFAULT_MODEL: str = "gpt-4.1"

    # ── Ollama ───────────────────────────────────────────────────
    OLLAMA_MODELS: str = "llama3,mistral,mixtral,codellama"

    # ── ChromaDB ─────────────────────────────────────────────────
    CHROMA_PERSIST_DIR: str = str(BASE_DIR / "data" / "chroma")
    CHROMA_COLLECTION_PREFIX: str = "yt_learning"

    # ── Embeddings ───────────────────────────────────────────────
    EMBEDDING_MODEL: str = "BAAI/bge-small-en"
    EMBEDDING_DEVICE: str = "cpu"

    # ── Whisper ──────────────────────────────────────────────────
    WHISPER_MODEL: str = "base"
    AUDIO_DOWNLOAD_DIR: str = str(BASE_DIR / "data" / "audio")

    # ── Rate Limiting ────────────────────────────────────────────
    RATE_LIMIT: str = "30/minute"

    # ── Export ───────────────────────────────────────────────────
    EXPORT_DIR: str = str(BASE_DIR / "data" / "exports")

    @property
    def allowed_origins_list(self) -> list[str]:
        """Parse comma-separated origins into a list."""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

    @property
    def ollama_models_list(self) -> list[str]:
        """Parse comma-separated Ollama models into a list."""
        return [model.strip() for model in self.OLLAMA_MODELS.split(",")]

    @property
    def available_providers(self) -> list[str]:
        """Return list of available LLM providers based on configured keys."""
        providers = []
        if self.OPENAI_API_KEY:
            providers.append("openai")
        if self.GOOGLE_API_KEY:
            providers.append("google")
        # Ollama is always potentially available (local)
        providers.append("ollama")
        return providers


# Singleton settings instance
settings = Settings()
