from dataclasses import dataclass

from packages.ieltix_core.application.evaluation import EvaluationReport, EvaluationService
from packages.ieltix_core.content.sample_exercises import EXERCISES, Exercise
from packages.ieltix_core.domain.models import Attempt
from packages.ieltix_core.domain.scoring import round_band
from packages.ieltix_core.ports.repositories import AttemptRepository


@dataclass(slots=True)
class ProgressSummary:
    completed: int
    average_band: float
    by_skill: dict[str, float]


class PracticeService:
    def __init__(self, attempts: AttemptRepository, evaluation: EvaluationService) -> None:
        self.attempts = attempts
        self.evaluation = evaluation

    def start(self, exercise_id: str) -> Exercise:
        try:
            return EXERCISES[exercise_id]
        except KeyError as exc:
            raise ValueError("exercise not found") from exc

    async def submit(self, user_id: int, exercise_id: str, answer: str) -> Attempt:
        exercise = self.start(exercise_id)
        if not answer.strip():
            raise ValueError("answer must not be empty")
        report = self._evaluate(exercise, answer)
        return await self.attempts.save(
            Attempt(
                user_id=user_id,
                exercise_id=exercise.id,
                skill=exercise.skill,
                answer=answer,
                score_band=report.band,
                feedback=report.as_feedback(),
            )
        )

    async def progress(self, user_id: int) -> ProgressSummary:
        attempts = await self.attempts.list_for_user(user_id)
        if not attempts:
            return ProgressSummary(completed=0, average_band=0.0, by_skill={})
        grouped: dict[str, list[float]] = {}
        for attempt in attempts:
            grouped.setdefault(attempt.skill, []).append(attempt.score_band)
        return ProgressSummary(
            completed=len(attempts),
            average_band=round_band(sum(a.score_band for a in attempts) / len(attempts)),
            by_skill={
                skill: round_band(sum(values) / len(values))
                for skill, values in grouped.items()
            },
        )

    def _evaluate(self, exercise: Exercise, answer: str) -> EvaluationReport:
        if exercise.skill == "reading":
            return self.evaluation.evaluate_reading(answer, exercise.answer_key or "")
        if exercise.skill == "listening":
            return self.evaluation.evaluate_listening(
                answer,
                exercise.answer_key or "",
                exercise.acceptable_answers,
            )
        if exercise.skill == "writing":
            return self.evaluation.evaluate_writing(answer)
        return self.evaluation.evaluate_speaking(answer)
