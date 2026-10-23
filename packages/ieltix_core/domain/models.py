from dataclasses import dataclass, field
from datetime import UTC, datetime
from typing import Any


def utc_now() -> datetime:
    return datetime.now(UTC)


@dataclass(slots=True)
class User:
    telegram_id: int
    full_name: str
    locale: str = "uz"
    username: str | None = None
    phone_number: str | None = None
    id: int | None = None
    is_admin: bool = False
    is_blocked: bool = False
    created_at: datetime = field(default_factory=utc_now)


@dataclass(slots=True)
class LearnerProfile:
    user_id: int
    target_band: float = 7.0
    current_band: float = 5.5
    diagnostic_score: int = 0
    exam_type: str = "academic"
    exam_date: str | None = None
    weak_skills: list[str] = field(default_factory=list)
    daily_minutes: int = 30
    onboarding_step: str = "language"
    is_complete: bool = False
    id: int | None = None


@dataclass(slots=True)
class Attempt:
    user_id: int
    skill: str
    answer: str
    score_band: float
    feedback: dict[str, Any]
    exercise_id: str | None = None
    duration_seconds: int = 0
    id: int | None = None
    created_at: datetime = field(default_factory=utc_now)

