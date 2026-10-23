from contextlib import asynccontextmanager
from typing import AsyncIterator

from sqlalchemy import JSON, BigInteger, Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

from packages.ieltix_core.domain.models import utc_now


class Base(DeclarativeBase):
    pass


class UserRecord(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    telegram_id: Mapped[int] = mapped_column(BigInteger, unique=True, index=True)
    username: Mapped[str | None] = mapped_column(String(64), nullable=True)
    full_name: Mapped[str] = mapped_column(String(255))
    phone_number: Mapped[str | None] = mapped_column(String(32), nullable=True)
    locale: Mapped[str] = mapped_column(String(2), default="uz")
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    is_blocked: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[object] = mapped_column(DateTime(timezone=True), default=utc_now)


class LearnerProfileRecord(Base):
    __tablename__ = "learner_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True)
    target_band: Mapped[float] = mapped_column(Float, default=7.0)
    current_band: Mapped[float] = mapped_column(Float, default=5.5)
    diagnostic_score: Mapped[int] = mapped_column(Integer, default=0)
    exam_type: Mapped[str] = mapped_column(String(32), default="academic")
    exam_date: Mapped[str | None] = mapped_column(String(32), nullable=True)
    weak_skills: Mapped[list[str]] = mapped_column(JSON, default=list)
    daily_minutes: Mapped[int] = mapped_column(Integer, default=30)
    onboarding_step: Mapped[str] = mapped_column(String(64), default="language")
    is_complete: Mapped[bool] = mapped_column(Boolean, default=False)


class AttemptRecord(Base):
    __tablename__ = "attempts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    exercise_id: Mapped[str | None] = mapped_column(String(128), nullable=True)
    skill: Mapped[str] = mapped_column(String(32), index=True)
    answer: Mapped[str] = mapped_column(Text)
    score_band: Mapped[float] = mapped_column(Float)
    feedback: Mapped[dict] = mapped_column(JSON, default=dict)
    duration_seconds: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[object] = mapped_column(DateTime(timezone=True), default=utc_now)


class LearningSessionRecord(Base):
    __tablename__ = "learning_sessions"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    kind: Mapped[str] = mapped_column(String(32))
    state: Mapped[str] = mapped_column(String(32), default="active")
    locale: Mapped[str] = mapped_column(String(2), default="uz")
    metadata_json: Mapped[dict] = mapped_column("metadata", JSON, default=dict)
    created_at: Mapped[object] = mapped_column(DateTime(timezone=True), default=utc_now)
    completed_at: Mapped[object | None] = mapped_column(DateTime(timezone=True), nullable=True)


class SpeakingTurnRecord(Base):
    __tablename__ = "speaking_turns"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[str] = mapped_column(ForeignKey("learning_sessions.id", ondelete="CASCADE"), index=True)
    speaker: Mapped[str] = mapped_column(String(16))
    transcript: Mapped[str] = mapped_column(Text)
    detected_language: Mapped[str] = mapped_column(String(8))
    audio_mime: Mapped[str | None] = mapped_column(String(64), nullable=True)
    created_at: Mapped[object] = mapped_column(DateTime(timezone=True), default=utc_now)


class SpeakingReportRecord(Base):
    __tablename__ = "speaking_reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[str] = mapped_column(ForeignKey("learning_sessions.id", ondelete="CASCADE"), unique=True)
    fluency: Mapped[float] = mapped_column(Float)
    lexical: Mapped[float] = mapped_column(Float)
    grammar: Mapped[float] = mapped_column(Float)
    pronunciation: Mapped[float] = mapped_column(Float)
    overall: Mapped[float] = mapped_column(Float)
    feedback: Mapped[dict] = mapped_column(JSON, default=dict)


class SubscriptionRecord(Base):
    __tablename__ = "subscriptions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True)
    plan: Mapped[str] = mapped_column(String(64))
    status: Mapped[str] = mapped_column(String(32), default="active")
    valid_until: Mapped[object] = mapped_column(DateTime(timezone=True))


class PaymentRecord(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    telegram_charge_id: Mapped[str] = mapped_column(String(255), unique=True)
    provider_charge_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    payload: Mapped[str] = mapped_column(String(255))
    amount: Mapped[int] = mapped_column(Integer)
    currency: Mapped[str] = mapped_column(String(8), default="XTR")
    status: Mapped[str] = mapped_column(String(32), default="completed")
    created_at: Mapped[object] = mapped_column(DateTime(timezone=True), default=utc_now)


class UsageEventRecord(Base):
    __tablename__ = "usage_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    provider: Mapped[str] = mapped_column(String(64))
    operation: Mapped[str] = mapped_column(String(64))
    latency_ms: Mapped[int] = mapped_column(Integer, default=0)
    success: Mapped[bool] = mapped_column(Boolean, default=True)
    cost_metadata: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[object] = mapped_column(DateTime(timezone=True), default=utc_now)


class ApiKeyRecord(Base):
    __tablename__ = "api_keys"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    provider: Mapped[str] = mapped_column(String(32), index=True)  # "groq" or "gemini"
    api_key: Mapped[str] = mapped_column(String(255), unique=True)
    label: Mapped[str | None] = mapped_column(String(64), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    total_calls: Mapped[int] = mapped_column(Integer, default=0)
    failed_calls: Mapped[int] = mapped_column(Integer, default=0)
    last_used_at: Mapped[object | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[object] = mapped_column(DateTime(timezone=True), default=utc_now)



class Database:
    def __init__(self, url: str) -> None:
        self.engine = create_async_engine(url, pool_pre_ping=True)
        self.session_factory = async_sessionmaker(self.engine, expire_on_commit=False)

    async def create_schema(self) -> None:
        async with self.engine.begin() as connection:
            await connection.run_sync(Base.metadata.create_all)

    @asynccontextmanager
    async def session(self) -> AsyncIterator[AsyncSession]:
        async with self.session_factory() as session:
            yield session

    async def dispose(self) -> None:
        await self.engine.dispose()
