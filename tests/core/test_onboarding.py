import tempfile
import unittest
from pathlib import Path

from packages.ieltix_core.adapters.database import Database
from packages.ieltix_core.adapters.repositories import (
    SqlAlchemyProfileRepository,
    SqlAlchemyUserRepository,
)
from packages.ieltix_core.application.onboarding import OnboardingError, OnboardingService


class OnboardingTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        path = Path(self.temp_dir.name) / "onboarding.db"
        self.database = Database(f"sqlite+aiosqlite:///{path.as_posix()}")
        await self.database.create_schema()
        self.session_context = self.database.session()
        self.session = await self.session_context.__aenter__()

    async def asyncTearDown(self) -> None:
        await self.session_context.__aexit__(None, None, None)
        await self.database.dispose()
        self.temp_dir.cleanup()

    async def _service(self):
        return OnboardingService(
            SqlAlchemyUserRepository(self.session),
            SqlAlchemyProfileRepository(self.session),
        )

    async def test_begins_uzbek_onboarding_and_persists_resume_step(self) -> None:
        service = await self._service()

        result = await service.begin(101, "Aziza", "uz")
        resumed = await service.begin(101, "Aziza", "uz")

        self.assertEqual(result.step, "name")
        self.assertEqual(resumed.step, "name")
        self.assertEqual(resumed.user.id, result.user.id)

    async def test_english_onboarding_rejects_invalid_target_band(self) -> None:
        service = await self._service()
        await service.begin(202, "John", "en")

        with self.assertRaisesRegex(OnboardingError, "between 4.0 and 9.0"):
            await service.answer(202, "target_band", "10")

    async def test_completes_profile_after_required_answers(self) -> None:
        service = await self._service()
        await service.begin(303, "Kamola", "uz")

        await service.answer(303, "target_band", "7.5")
        await service.answer(303, "exam_type", "academic")
        await service.answer(303, "weak_skills", "writing,speaking")
        result = await service.answer(303, "daily_minutes", "45")

        self.assertTrue(result.profile.is_complete)
        self.assertEqual(result.step, "complete")
        self.assertEqual(result.profile.weak_skills, ["writing", "speaking"])
