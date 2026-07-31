"""
Async database session and engine configuration.
Supports SQLite (default) and PostgreSQL (via DATABASE_URL change).
"""

import asyncio
from typing import AsyncGenerator

from sqlalchemy import event, text
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.pool import StaticPool

from core.config import settings
from database.base import Base

_is_sqlite = "sqlite" in settings.DATABASE_URL

# ── Engine ───────────────────────────────────────────────────────────────────
# SQLite: use StaticPool so only ONE physical connection is ever created.
# This is the correct async pattern for aiosqlite — it prevents concurrent
# writers from racing for the write lock (which causes "database is locked").
if _is_sqlite:
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=settings.DEBUG,
        future=True,
        connect_args={"check_same_thread": False},
        # One connection shared across all async tasks — safe with aiosqlite
        poolclass=StaticPool,
    )

    @event.listens_for(engine.sync_engine, "connect")
    def _set_sqlite_wal_mode(dbapi_conn, connection_record):
        """Enable WAL journal mode so reads never block writes."""
        dbapi_conn.execute("PRAGMA journal_mode=WAL")
        dbapi_conn.execute("PRAGMA synchronous=NORMAL")
        dbapi_conn.execute("PRAGMA busy_timeout=30000")  # 30 s wait on lock
else:
    # PostgreSQL (or other) — standard pool
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=settings.DEBUG,
        future=True,
    )

# ── Session factory ──────────────────────────────────────────────────────────
async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    """Yield an async database session for dependency injection."""
    async with async_session_factory() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def create_tables():
    """Create all database tables. Used for development/testing."""
    import models  # Ensure all model classes register with Base.metadata
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def drop_tables():
    """Drop all database tables. Used for testing only."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
