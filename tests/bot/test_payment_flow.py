import unittest

from apps.telegram_bot.handlers.subscription import (
    invoice_title_and_description,
    payment_success_message,
    subscription_menu_text,
)


class PaymentFlowTests(unittest.TestCase):
    def test_subscription_menu_text_bilingual(self) -> None:
        uz_text = subscription_menu_text("uz")
        self.assertIn("129", uz_text)
        self.assertIn("Telegram Stars", uz_text)

        en_text = subscription_menu_text("en")
        self.assertIn("129", en_text)
        self.assertIn("Telegram Stars", en_text)

    def test_invoice_title_and_description(self) -> None:
        title, desc = invoice_title_and_description("uz")
        self.assertIn("MockLife Web Platform", title)
        self.assertIn("to'liq kirish", desc.lower())

        title_en, desc_en = invoice_title_and_description("en")
        self.assertIn("MockLife Web Platform", title_en)
        self.assertIn("access", desc_en.lower())

    def test_payment_success_message_bilingual(self) -> None:
        msg_uz = payment_success_message("uz")
        self.assertIn("faollashtirildi", msg_uz.lower())

        msg_en = payment_success_message("en")
        self.assertIn("activated", msg_en.lower())
