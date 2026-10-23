import unittest

from apps.telegram_bot.handlers.start import main_menu_text, welcome_text
from apps.telegram_bot.keyboards.main import main_menu_labels


class StartFlowTests(unittest.TestCase):
    def test_welcome_prompts_for_language_in_both_languages(self) -> None:
        text = welcome_text("Aziza")

        self.assertIn("Tilni tanlang", text)
        self.assertIn("Choose your language", text)
        self.assertIn("Aziza", text)

    def test_english_main_menu_exposes_learning_and_live_call(self) -> None:
        labels = main_menu_labels("en")

        self.assertIn("Practice", labels["practice"])
        self.assertIn("AI Live", labels["live_call"])
        self.assertIn("Profile", labels["profile"])
        self.assertIn("Website", labels["website"])
        self.assertIn("target", main_menu_text("en", 7.5).lower())

    def test_uzbek_main_menu_exposes_learning_and_live_call(self) -> None:
        labels = main_menu_labels("uz")

        self.assertIn("Mashq qilish", labels["practice"])
        self.assertIn("AI live", labels["live_call"])
        self.assertIn("Profil", labels["profile"])
        self.assertIn("Web saytda tayyorlanish", labels["website"])

    def test_main_menu_has_exactly_four_buttons(self) -> None:
        from apps.telegram_bot.keyboards.main import main_menu
        kb = main_menu("uz")
        # 2 rows of 2 buttons each = 4 buttons total
        self.assertEqual(len(kb.keyboard), 2)
        total_buttons = sum(len(row) for row in kb.keyboard)
        self.assertEqual(total_buttons, 4)
