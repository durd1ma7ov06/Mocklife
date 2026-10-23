import unittest

from packages.ieltix_core.application.examiner import ExaminerService, SpeakingSession


class ExaminerTests(unittest.TestCase):
    def setUp(self) -> None:
        self.examiner = ExaminerService()

    def test_english_session_asks_one_english_question_at_a_time(self) -> None:
        session = SpeakingSession(id="s1", user_id=1, locale="en")

        turn = self.examiner.process_turn(
            session,
            "I live in Tashkent because it offers many educational opportunities.",
        )

        self.assertEqual(turn.detected_language, "en")
        self.assertEqual(turn.part, 1)
        self.assertTrue(turn.examiner_text.endswith("?"))

    def test_uzbek_input_gets_short_uzbek_support_then_english_question(self) -> None:
        session = SpeakingSession(id="s2", user_id=2, locale="uz")

        turn = self.examiner.process_turn(
            session,
            "Men savolni tushunmadim, o‘zbekcha tushuntirib bering.",
        )

        self.assertEqual(turn.detected_language, "uz")
        self.assertIn("Tushuntirish", turn.examiner_text)
        self.assertRegex(turn.examiner_text, r"(What|How|Why).+\?")

    def test_session_progresses_through_all_three_parts_and_returns_report(self) -> None:
        session = SpeakingSession(id="s3", user_id=3, locale="en")
        answer = "I believe this is important because communities benefit from better services."

        turns = [self.examiner.process_turn(session, answer) for _ in range(6)]

        self.assertTrue(turns[-1].completed)
        self.assertIsNotNone(turns[-1].report)
        self.assertEqual(
            set(turns[-1].report.criteria),
            {"fluency", "lexical", "grammar", "pronunciation"},
        )
