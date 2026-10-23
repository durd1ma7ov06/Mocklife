import unittest

from packages.ieltix_core.application.evaluation import EvaluationService
from packages.ieltix_core.application.practice import PracticeService


class MemoryAttempts:
    def __init__(self) -> None:
        self.items = []

    async def save(self, attempt):
        attempt.id = len(self.items) + 1
        self.items.append(attempt)
        return attempt

    async def list_for_user(self, user_id):
        return [item for item in self.items if item.user_id == user_id]


class PracticeTests(unittest.IsolatedAsyncioTestCase):
    def test_reading_uses_the_exercise_answer_key(self) -> None:
        evaluation = EvaluationService()

        correct = evaluation.evaluate_reading("FALSE", "FALSE")
        incorrect = evaluation.evaluate_reading("TRUE", "FALSE")

        self.assertEqual(correct.band, 9.0)
        self.assertEqual(incorrect.band, 4.0)

    def test_writing_feedback_reports_underlength_response(self) -> None:
        report = EvaluationService().evaluate_writing("Technology is useful.")

        self.assertLess(report.band, 6.0)
        self.assertIn("250", " ".join(report.improvements))

    def test_speaking_feedback_has_all_four_ielts_criteria(self) -> None:
        transcript = (
            "In my opinion public transport is important because it reduces traffic. "
            "However, cities should improve reliability and provide safer stations."
        )

        report = EvaluationService().evaluate_speaking(transcript)

        self.assertEqual(
            set(report.criteria), {"fluency", "lexical", "grammar", "pronunciation"}
        )
        self.assertIn(report.band * 2, range(0, 19))

    async def test_attempt_is_persisted_and_appears_in_progress(self) -> None:
        attempts = MemoryAttempts()
        service = PracticeService(attempts, EvaluationService())

        await service.submit(user_id=7, exercise_id="reading-urban-1", answer="FALSE")
        progress = await service.progress(7)

        self.assertEqual(progress.completed, 1)
        self.assertEqual(progress.average_band, 9.0)
        self.assertEqual(progress.by_skill, {"reading": 9.0})
