import unittest

from apps.telegram_bot.handlers.practice import exercise_prompt, feedback_text
from packages.ieltix_core.application.evaluation import EvaluationReport
from packages.ieltix_core.content.sample_exercises import EXERCISES


class PracticeBotPresentationTests(unittest.TestCase):
    def test_exercise_prompt_uses_selected_locale(self) -> None:
        exercise = EXERCISES["speaking-city-1"]

        self.assertIn("Ingliz tilida", exercise_prompt(exercise, "uz"))
        self.assertIn("Answer in English", exercise_prompt(exercise, "en"))

    def test_feedback_marks_score_as_estimate(self) -> None:
        report = EvaluationReport(
            band=6.5,
            criteria={"fluency": 6.5},
            strengths=["Clear idea"],
            improvements=["Add an example"],
        )

        rendered = feedback_text(report, "en")

        self.assertIn("6.5", rendered)
        self.assertIn("estimate", rendered.lower())
