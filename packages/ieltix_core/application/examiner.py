from dataclasses import dataclass, field

from packages.ieltix_core.application.evaluation import EvaluationReport, EvaluationService


QUESTIONS = {
    1: (
        "What do you like most about your hometown?",
        "How often do you use public transport?",
    ),
    2: (
        "Describe a skill you would like to learn. Why is it important to you?",
        "How would learning this skill change your daily life?",
    ),
    3: (
        "Why do some people find it difficult to learn new skills as adults?",
        "How might technology change education in the next twenty years?",
    ),
}


@dataclass(slots=True)
class SpeakingSession:
    id: str
    user_id: int
    locale: str = "uz"
    answers: list[str] = field(default_factory=list)
    completed: bool = False


@dataclass(slots=True)
class ExaminerTurn:
    examiner_text: str
    detected_language: str
    part: int
    completed: bool = False
    report: EvaluationReport | None = None


def detect_language(text: str) -> str:
    lower = text.casefold()
    uzbek_markers = (
        "men ", "siz", "savol", "tushun", "o‘zbek", "o'zbek", "kerak", "uchun", "bilan",
    )
    return "uz" if any(marker in lower for marker in uzbek_markers) else "en"


class ExaminerService:
    def __init__(self, evaluation: EvaluationService | None = None) -> None:
        self.evaluation = evaluation or EvaluationService()

    def opening(self, session: SpeakingSession) -> ExaminerTurn:
        return ExaminerTurn(
            examiner_text=QUESTIONS[1][0],
            detected_language=session.locale,
            part=1,
        )

    def process_turn(self, session: SpeakingSession, transcript: str) -> ExaminerTurn:
        if session.completed:
            raise ValueError("speaking session is already complete")
        clean = transcript.strip()
        if not clean:
            raise ValueError("transcript must not be empty")
        language = detect_language(clean)
        session.answers.append(clean)
        answered = len(session.answers)
        if answered >= 6:
            session.completed = True
            report = self.evaluation.evaluate_speaking(" ".join(session.answers))
            closing = (
                "Speaking practice complete. Your estimated report is ready."
                if session.locale == "en"
                else "Speaking mashqi tugadi. Taxminiy hisobotingiz tayyor."
            )
            return ExaminerTurn(closing, language, part=3, completed=True, report=report)

        next_part = min(3, answered // 2 + 1)
        next_index = answered % 2
        question = QUESTIONS[next_part][next_index]
        if language == "uz":
            question = f"Tushuntirish: qisqa va aniq javob berishingiz mumkin. {question}"
        return ExaminerTurn(question, language, part=next_part)
