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

    async def test_full_diagnostic_quiz_flow_and_callback_data_lengths(self) -> None:
        from apps.telegram_bot.keyboards.main import onboarding_keyboard
        service = await self._service()
        await service.begin(404, "Sardor", "uz")

        await service.answer(404, "name", "Sardor")
        await service.answer(404, "phone", "+998901234567")
        await service.answer(404, "target_band", "7.5")
        await service.answer(404, "exam_type", "academic")
        await service.answer(404, "weak_skills", "reading,listening")

        # Questions 1 to 10
        quiz_answers = [
            ("quiz_1", "opt_a"),
            ("quiz_2", "opt_a"),
            ("quiz_3", "opt_a"),
            ("quiz_4", "opt_a"),
            ("quiz_5", "opt_a"),
            ("quiz_6", "opt_a"),
            ("quiz_7", "opt_a"),
            ("quiz_8", "opt_a"),
            ("quiz_9", "opt_a"),
            ("quiz_10", "opt_a"),
        ]

        expected_next = [
            "quiz_2", "quiz_3", "quiz_4", "quiz_5", "quiz_6",
            "quiz_7", "quiz_8", "quiz_9", "quiz_10", "quiz_speaking"
        ]

        for (q, ans), exp in zip(quiz_answers, expected_next):
            res = await service.answer(404, q, ans)
            self.assertEqual(res.step, exp)
            kb = onboarding_keyboard(res.step, "uz")
            self.assertIsNotNone(kb)
            for row in kb.inline_keyboard:
                for btn in row:
                    # Telegram limits callback_data to 64 bytes
                    self.assertLessEqual(len(btn.callback_data.encode("utf-8")), 64)

        # Speaking step
        final_res = await service.answer(404, "quiz_speaking", "I live in Samarkand. It is an ancient and historical city with remarkable monuments.")
        self.assertTrue(final_res.profile.is_complete)
        self.assertEqual(final_res.step, "complete")
        self.assertGreaterEqual(final_res.profile.current_band, 7.0)
