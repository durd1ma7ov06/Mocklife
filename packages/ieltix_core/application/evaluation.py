from dataclasses import dataclass
import re

from packages.ieltix_core.domain.scoring import round_band


@dataclass(slots=True)
class EvaluationReport:
    band: float
    criteria: dict[str, float]
    strengths: list[str]
    improvements: list[str]

    def as_feedback(self) -> dict:
        return {
            "criteria": self.criteria,
            "strengths": self.strengths,
            "improvements": self.improvements,
            "notice": "IELTIX estimate; this is not an official IELTS result.",
        }


class EvaluationService:
    def evaluate_reading(self, answer: str, answer_key: str) -> EvaluationReport:
        correct = answer.strip().casefold() == answer_key.strip().casefold()
        return EvaluationReport(
            band=9.0 if correct else 4.0,
            criteria={"accuracy": 9.0 if correct else 4.0},
            strengths=["To'g'ri javob va aniq o'qish (Correct answer and careful reading)."] if correct else [],
            improvements=[] if correct else [f"Matnga qayta qarang; kutilgan to'g'ri javob: {answer_key}."],
        )

    def evaluate_listening(
        self,
        answer: str,
        answer_key: str,
        acceptable_answers: tuple[str, ...] | list[str] | None = None,
    ) -> EvaluationReport:
        clean_ans = answer.strip().casefold()
        valid_keys = [answer_key.strip().casefold()]
        if acceptable_answers:
            valid_keys.extend(a.strip().casefold() for a in acceptable_answers)
        correct = clean_ans in valid_keys
        return EvaluationReport(
            band=9.0 if correct else 4.0,
            criteria={"accuracy": 9.0 if correct else 4.0},
            strengths=["To'g'ri javob va aniq eshitish (Correct answer and accurate listening)."] if correct else [],
            improvements=[] if correct else [f"Audio transkriptiga qarang; kutilgan to'g'ri javob: {answer_key}."],
        )

    def evaluate_writing(self, answer: str) -> EvaluationReport:
        words = re.findall(r"[A-Za-zÀ-ÿ']+", answer)
        paragraphs = [p for p in re.split(r"\n\s*\n", answer.strip()) if p]
        lower = answer.casefold()
        connectors = sum(
            marker in lower
            for marker in ("however", "moreover", "therefore", "on the other hand", "although")
        )
        task = 5.0 if len(words) < 250 else 6.5
        cohesion = 5.5 + (0.5 if len(paragraphs) >= 4 else 0) + (0.5 if connectors >= 2 else 0)
        lexical = 5.5 + (0.5 if len(set(w.casefold() for w in words)) >= 120 else 0)
        grammar = 5.5 + (0.5 if any(m in lower for m in ("although", "whereas", "which")) else 0)
        band = round_band((task + cohesion + lexical + grammar) / 4)
        improvements = []
        if len(words) < 250:
            improvements.append(f"Write at least 250 words; this response has {len(words)}.")
        if len(paragraphs) < 4:
            improvements.append("Use a clear introduction, two body paragraphs, and conclusion.")
        return EvaluationReport(
            band=band,
            criteria={
                "task_response": task,
                "coherence": round_band(cohesion),
                "lexical": round_band(lexical),
                "grammar": round_band(grammar),
            },
            strengths=["The response addresses the selected topic."],
            improvements=improvements,
        )

    def evaluate_speaking(self, transcript: str) -> EvaluationReport:
        words = re.findall(r"[A-Za-z']+", transcript)
        lower = transcript.casefold()
        fluency = 5.0 + min(1.5, len(words) / 40)
        lexical = 5.5 + (0.5 if len(set(w.casefold() for w in words)) >= 18 else 0)
        grammar = 5.5 + (0.5 if any(x in lower for x in ("because", "although", "which", "if ")) else 0)
        pronunciation = 5.5
        criteria = {
            "fluency": round_band(fluency),
            "lexical": round_band(lexical),
            "grammar": round_band(grammar),
            "pronunciation": pronunciation,
        }
        return EvaluationReport(
            band=round_band(sum(criteria.values()) / 4),
            criteria=criteria,
            strengths=["The answer communicates a clear main idea."],
            improvements=[
                "Extend the answer with a specific example.",
                "Pronunciation is provisional until audio analysis is enabled.",
            ],
        )
