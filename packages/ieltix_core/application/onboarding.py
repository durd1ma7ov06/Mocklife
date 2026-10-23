from dataclasses import dataclass

from packages.ieltix_core.domain.models import LearnerProfile, User
from packages.ieltix_core.i18n.catalog import text
from packages.ieltix_core.ports.repositories import ProfileRepository, UserRepository


class OnboardingError(ValueError):
    pass


@dataclass(slots=True)
class OnboardingResult:
    user: User
    profile: LearnerProfile
    step: str
    prompt: str


class OnboardingService:
    _next_step = {
        "name": "phone",
        "phone": "target_band",
        "target_band": "exam_type",
        "exam_type": "weak_skills",
        "weak_skills": "quiz_1",
        "quiz_1": "quiz_2",
        "quiz_2": "quiz_3",
        "quiz_3": "quiz_4",
        "quiz_4": "quiz_5",
        "quiz_5": "quiz_6",
        "quiz_6": "quiz_7",
        "quiz_7": "quiz_8",
        "quiz_8": "quiz_9",
        "quiz_9": "quiz_10",
        "quiz_10": "quiz_speaking",
        "quiz_speaking": "complete",
        "quiz_10_speaking": "complete",
        "daily_minutes": "complete",
    }

    def __init__(
        self,
        users: UserRepository,
        profiles: ProfileRepository,
    ) -> None:
        self.users = users
        self.profiles = profiles

    async def begin(
        self,
        telegram_id: int,
        full_name: str,
        locale: str,
        username: str | None = None,
    ) -> OnboardingResult:
        if locale not in {"uz", "en"}:
            raise OnboardingError("locale must be 'uz' or 'en'")
        user = await self.users.get_by_telegram_id(telegram_id)
        if user is None:
            user = await self.users.save(
                User(
                    telegram_id=telegram_id,
                    full_name=full_name.strip() or "IELTIX Learner",
                    username=username,
                    locale=locale,
                )
            )
        elif user.locale != locale:
            user.locale = locale
            user = await self.users.save(user)
        profile = await self.profiles.get_by_user_id(user.id or 0)
        if profile is None:
            profile = await self.profiles.save(
                LearnerProfile(user_id=user.id or 0, onboarding_step="name")
            )
        return self._result(user, profile)

    async def answer(self, telegram_id: int, field: str, value: str) -> OnboardingResult:
        user = await self.users.get_by_telegram_id(telegram_id)
        if user is None or user.id is None:
            raise OnboardingError("start onboarding first")
        profile = await self.profiles.get_by_user_id(user.id)
        if profile is None:
            raise OnboardingError("learner profile not found")

        clean = value.strip()
        clean_lower = clean.lower()

        if field == "name":
            if clean_lower != "confirm" and len(clean) >= 2:
                user.full_name = clean
                await self.users.save(user)
        elif field == "phone":
            user.phone_number = clean
            await self.users.save(user)
        elif field == "target_band":
            try:
                band = float(clean_lower)
            except ValueError as exc:
                raise OnboardingError("target band must be a number") from exc
            if not 4.0 <= band <= 9.0 or band * 2 != int(band * 2):
                raise OnboardingError("target band must be between 4.0 and 9.0 in half bands")
            profile.target_band = band
        elif field == "exam_type":
            if clean_lower not in {"academic", "general"}:
                raise OnboardingError("exam type must be academic or general")
            profile.exam_type = clean_lower
        elif field == "weak_skills":
            skills = [item.strip() for item in clean_lower.split(",") if item.strip()]
            allowed = {"reading", "listening", "writing", "speaking"}
            if not skills or any(skill not in allowed for skill in skills):
                raise OnboardingError("choose reading, listening, writing, or speaking")
            profile.weak_skills = list(dict.fromkeys(skills))
        elif field == "quiz_1":
            if clean_lower in {"opt_a", "adopt", "adopt / implement"}:
                profile.diagnostic_score = (profile.diagnostic_score or 0) + 1
        elif field == "quiz_2":
            if clean_lower in {"opt_a", "would have taken"}:
                profile.diagnostic_score = (profile.diagnostic_score or 0) + 1
        elif field == "quiz_3":
            if clean_lower in {"opt_a", "due to neural adaptation", "neural adaptation"}:
                profile.diagnostic_score = (profile.diagnostic_score or 0) + 1
        elif field == "quiz_4":
            if clean_lower in {"opt_a", "because of", "due to", "because of / due to"}:
                profile.diagnostic_score = (profile.diagnostic_score or 0) + 1
        elif field == "quiz_5":
            if clean_lower in {"opt_a", "friday", "friday morning at 9:30 am in auditorium b"}:
                profile.diagnostic_score = (profile.diagnostic_score or 0) + 1
        elif field == "quiz_6":
            if clean_lower in {"opt_a", "cost", "the project costs too much for the municipal budget"}:
                profile.diagnostic_score = (profile.diagnostic_score or 0) + 1
        elif field == "quiz_7":
            if clean_lower in {"opt_a", "nevertheless", "nevertheless / however", "however"}:
                profile.diagnostic_score = (profile.diagnostic_score or 0) + 1
        elif field == "quiz_8":
            if clean_lower in {"opt_a", "paramount", "paramount / indispensable", "indispensable"}:
                profile.diagnostic_score = (profile.diagnostic_score or 0) + 1
        elif field == "quiz_9":
            if clean_lower in {"opt_a", "have scientists made", "breakthrough"}:
                profile.diagnostic_score = (profile.diagnostic_score or 0) + 1
        elif field == "quiz_10":
            if clean_lower in {"opt_a", "curb", "curb / reduce", "reduce"}:
                profile.diagnostic_score = (profile.diagnostic_score or 0) + 1
        elif field in {"quiz_speaking", "quiz_10_speaking"}:
            score = profile.diagnostic_score or 0
            if score >= 9:
                quiz_band = 7.5
            elif score >= 7:
                quiz_band = 7.0
            elif score >= 5:
                quiz_band = 6.5
            elif score >= 3:
                quiz_band = 6.0
            else:
                quiz_band = 5.5

            if clean_lower in {"skip", "opt_skip", "opt_voice", "hint"}:
                speaking_band = quiz_band
            else:
                words_count = len(clean.split())
                if words_count >= 20:
                    speaking_band = min(8.5, quiz_band + 0.5)
                elif words_count >= 8:
                    speaking_band = quiz_band
                else:
                    speaking_band = max(5.0, quiz_band)

            overall = round((quiz_band + speaking_band) / 2 * 2) / 2
            profile.current_band = max(5.0, min(8.5, overall))

        profile.onboarding_step = self._next_step.get(field, "complete")
        profile.is_complete = profile.onboarding_step == "complete"
        profile = await self.profiles.save(profile)
        return self._result(user, profile)

    @staticmethod
    def _result(user: User, profile: LearnerProfile) -> OnboardingResult:
        return OnboardingResult(
            user=user,
            profile=profile,
            step=profile.onboarding_step,
            prompt=text(user.locale, profile.onboarding_step),
        )
