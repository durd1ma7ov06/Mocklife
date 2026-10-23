from datetime import UTC, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from packages.ieltix_core.adapters.database import (
    ApiKeyRecord,
    AttemptRecord,
    LearnerProfileRecord,
    LearningSessionRecord,
    PaymentRecord,
    SpeakingReportRecord,
    SpeakingTurnRecord,
    SubscriptionRecord,
    UserRecord,
)
from packages.ieltix_core.application.examiner import SpeakingSession
from packages.ieltix_core.domain.models import Attempt, LearnerProfile, User, utc_now


def _user(record: UserRecord) -> User:
    return User(
        id=record.id,
        telegram_id=record.telegram_id,
        username=record.username,
        full_name=record.full_name,
        phone_number=record.phone_number,
        locale=record.locale,
        is_admin=record.is_admin,
        is_blocked=record.is_blocked,
        created_at=record.created_at,
    )


class SqlAlchemyUserRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_telegram_id(self, telegram_id: int) -> User | None:
        record = (
            await self.session.execute(
                select(UserRecord).where(UserRecord.telegram_id == telegram_id)
            )
        ).scalar_one_or_none()
        return _user(record) if record else None

    async def get_by_id(self, user_id: int) -> User | None:
        record = await self.session.get(UserRecord, user_id)
        return _user(record) if record else None

    async def save(self, user: User) -> User:
        record = await self.session.get(UserRecord, user.id) if user.id else None
        if record is None:
            record = UserRecord(telegram_id=user.telegram_id, full_name=user.full_name)
            self.session.add(record)
        record.username = user.username
        record.full_name = user.full_name
        record.phone_number = user.phone_number
        record.locale = user.locale
        record.is_admin = user.is_admin
        record.is_blocked = user.is_blocked
        await self.session.commit()
        await self.session.refresh(record)
        return _user(record)

    async def get_all_users(self) -> list[User]:
        records = (await self.session.execute(select(UserRecord).order_by(UserRecord.id.desc()))).scalars().all()
        return [_user(r) for r in records]

    async def get_all_admin_ids(self) -> set[int]:
        records = (await self.session.execute(select(UserRecord.telegram_id).where(UserRecord.is_admin.is_(True)))).scalars().all()
        return set(records)

    async def set_admin_by_telegram_id(self, telegram_id: int, is_admin: bool = True) -> bool:
        record = (await self.session.execute(select(UserRecord).where(UserRecord.telegram_id == telegram_id))).scalar_one_or_none()
        if not record:
            return False
        record.is_admin = is_admin
        await self.session.commit()
        return True


class SqlAlchemyProfileRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_user_id(self, user_id: int) -> LearnerProfile | None:
        record = (
            await self.session.execute(
                select(LearnerProfileRecord).where(LearnerProfileRecord.user_id == user_id)
            )
        ).scalar_one_or_none()
        if not record:
            return None
        return LearnerProfile(
            id=record.id,
            user_id=record.user_id,
            target_band=record.target_band,
            current_band=record.current_band,
            diagnostic_score=getattr(record, "diagnostic_score", 0),
            exam_type=record.exam_type,
            exam_date=record.exam_date,
            weak_skills=list(record.weak_skills or []),
            daily_minutes=record.daily_minutes,
            onboarding_step=record.onboarding_step,
            is_complete=record.is_complete,
        )

    async def save(self, profile: LearnerProfile) -> LearnerProfile:
        record = await self.session.get(LearnerProfileRecord, profile.id) if profile.id else None
        if record is None:
            record = LearnerProfileRecord(user_id=profile.user_id)
            self.session.add(record)
        for name in (
            "target_band", "current_band", "diagnostic_score", "exam_type", "exam_date", "weak_skills",
            "daily_minutes", "onboarding_step", "is_complete",
        ):
            if hasattr(record, name):
                setattr(record, name, getattr(profile, name))
        await self.session.commit()
        await self.session.refresh(record)
        profile.id = record.id
        return profile


class SqlAlchemyAttemptRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def save(self, attempt: Attempt) -> Attempt:
        record = AttemptRecord(
            user_id=attempt.user_id,
            exercise_id=attempt.exercise_id,
            skill=attempt.skill,
            answer=attempt.answer,
            score_band=attempt.score_band,
            feedback=attempt.feedback,
            duration_seconds=attempt.duration_seconds,
        )
        self.session.add(record)
        await self.session.commit()
        await self.session.refresh(record)
        attempt.id = record.id
        attempt.created_at = record.created_at
        return attempt

    async def list_for_user(self, user_id: int) -> list[Attempt]:
        records = (
            await self.session.execute(
                select(AttemptRecord)
                .where(AttemptRecord.user_id == user_id)
                .order_by(AttemptRecord.created_at.desc())
            )
        ).scalars().all()
        return [
            Attempt(
                id=r.id,
                user_id=r.user_id,
                exercise_id=r.exercise_id,
                skill=r.skill,
                answer=r.answer,
                score_band=r.score_band,
                feedback=r.feedback,
                duration_seconds=r.duration_seconds,
                created_at=r.created_at,
            )
            for r in records
        ]


class SqlAlchemyLiveCallRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(self, call: SpeakingSession) -> SpeakingSession:
        self.session.add(
            LearningSessionRecord(
                id=call.id,
                user_id=call.user_id,
                kind="live_call",
                state="active",
                locale=call.locale,
                metadata_json={"answers": []},
            )
        )
        await self.session.commit()
        return call

    async def get(self, session_id: str) -> SpeakingSession | None:
        record = await self.session.get(LearningSessionRecord, session_id)
        if record is None or record.kind != "live_call":
            return None
        metadata = dict(record.metadata_json or {})
        return SpeakingSession(
            id=record.id,
            user_id=record.user_id,
            locale=record.locale,
            answers=list(metadata.get("answers", [])),
            completed=record.state == "completed",
        )

    async def save_turn(
        self,
        call: SpeakingSession,
        user_text: str,
        examiner_text: str,
        detected_language: str,
        audio_mime: str | None = None,
    ) -> None:
        record = await self.session.get(LearningSessionRecord, call.id)
        if record is None:
            raise ValueError("live call session not found")
        record.metadata_json = {"answers": list(call.answers)}
        record.state = "completed" if call.completed else "active"
        self.session.add_all(
            [
                SpeakingTurnRecord(
                    session_id=call.id,
                    speaker="learner",
                    transcript=user_text,
                    detected_language=detected_language,
                    audio_mime=audio_mime,
                ),
                SpeakingTurnRecord(
                    session_id=call.id,
                    speaker="examiner",
                    transcript=examiner_text,
                    detected_language="en" if "?" in examiner_text else call.locale,
                ),
            ]
        )
        await self.session.commit()

    async def save_report(self, session_id: str, report) -> None:
        self.session.add(
            SpeakingReportRecord(
                session_id=session_id,
                fluency=report.criteria["fluency"],
                lexical=report.criteria["lexical"],
                grammar=report.criteria["grammar"],
                pronunciation=report.criteria["pronunciation"],
                overall=report.band,
                feedback=report.as_feedback(),
            )
        )
        await self.session.commit()


class SqlAlchemySubscriptionRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_active(self, user_id: int) -> SubscriptionRecord | None:
        now = utc_now()
        result = await self.session.execute(
            select(SubscriptionRecord).where(
                SubscriptionRecord.user_id == user_id,
                SubscriptionRecord.status == "active",
            )
        )
        sub = result.scalar_one_or_none()
        if sub and sub.valid_until:
            vu = sub.valid_until if sub.valid_until.tzinfo is not None else sub.valid_until.replace(tzinfo=UTC)
            if vu > now:
                return sub
        return None

    async def get_payment_by_charge_id(self, telegram_charge_id: str) -> PaymentRecord | None:
        result = await self.session.execute(
            select(PaymentRecord).where(PaymentRecord.telegram_charge_id == telegram_charge_id)
        )
        return result.scalar_one_or_none()

    async def record_payment(
        self,
        user_id: int,
        telegram_charge_id: str,
        payload: str,
        amount: int,
        currency: str = "XTR",
        provider_charge_id: str | None = None,
    ) -> PaymentRecord:
        record = PaymentRecord(
            user_id=user_id,
            telegram_charge_id=telegram_charge_id,
            provider_charge_id=provider_charge_id,
            payload=payload,
            amount=amount,
            currency=currency,
            status="completed",
        )
        self.session.add(record)
        await self.session.commit()
        await self.session.refresh(record)
        return record

    async def activate_or_extend(self, user_id: int, plan: str, duration_days: int = 30) -> SubscriptionRecord:
        now = utc_now()
        result = await self.session.execute(
            select(SubscriptionRecord).where(SubscriptionRecord.user_id == user_id)
        )
        sub = result.scalar_one_or_none()
        if sub is None:
            sub = SubscriptionRecord(
                user_id=user_id,
                plan=plan,
                status="active",
                valid_until=now + timedelta(days=duration_days),
            )
            self.session.add(sub)
        else:
            vu = sub.valid_until if sub.valid_until.tzinfo is not None else sub.valid_until.replace(tzinfo=UTC)
            base_time = vu if vu > now else now
            sub.valid_until = base_time + timedelta(days=duration_days)
            sub.plan = plan
            sub.status = "active"
        await self.session.commit()
        await self.session.refresh(sub)
        if sub.valid_until and sub.valid_until.tzinfo is None:
            sub.valid_until = sub.valid_until.replace(tzinfo=UTC)
        return sub


class SqlAlchemyApiKeyRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_all(self, provider: str | None = None) -> list[ApiKeyRecord]:
        query = select(ApiKeyRecord).order_by(ApiKeyRecord.created_at.asc())
        if provider:
            query = query.where(ApiKeyRecord.provider == provider)
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get_active(self, provider: str | None = None) -> list[ApiKeyRecord]:
        query = select(ApiKeyRecord).where(ApiKeyRecord.is_active == True).order_by(ApiKeyRecord.created_at.asc())
        if provider:
            query = query.where(ApiKeyRecord.provider == provider)
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get_by_key(self, api_key: str) -> ApiKeyRecord | None:
        result = await self.session.execute(
            select(ApiKeyRecord).where(ApiKeyRecord.api_key == api_key)
        )
        return result.scalar_one_or_none()

    async def add_key(self, provider: str, api_key: str, label: str | None = None) -> ApiKeyRecord:
        existing = await self.get_by_key(api_key)
        if existing:
            existing.is_active = True
            if label:
                existing.label = label
            await self.session.commit()
            await self.session.refresh(existing)
            return existing
        record = ApiKeyRecord(
            provider=provider,
            api_key=api_key,
            label=label or f"{provider.capitalize()} Key",
            is_active=True,
            total_calls=0,
            failed_calls=0,
        )
        self.session.add(record)
        await self.session.commit()
        await self.session.refresh(record)
        return record

    async def delete_key(self, key_id: int) -> bool:
        result = await self.session.execute(
            select(ApiKeyRecord).where(ApiKeyRecord.id == key_id)
        )
        record = result.scalar_one_or_none()
        if record:
            await self.session.delete(record)
            await self.session.commit()
            return True
        return False

    async def toggle_active(self, key_id: int) -> bool:
        result = await self.session.execute(
            select(ApiKeyRecord).where(ApiKeyRecord.id == key_id)
        )
        record = result.scalar_one_or_none()
        if record:
            record.is_active = not record.is_active
            await self.session.commit()
            return record.is_active
        return False

    async def record_usage(self, api_key: str, success: bool) -> None:
        result = await self.session.execute(
            select(ApiKeyRecord).where(ApiKeyRecord.api_key == api_key)
        )
        record = result.scalar_one_or_none()
        if record:
            record.total_calls += 1
            if not success:
                record.failed_calls += 1
            record.last_used_at = utc_now()
            await self.session.commit()
