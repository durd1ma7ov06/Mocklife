import unittest
from datetime import UTC, datetime, timedelta
from types import SimpleNamespace

from apps.telegram_bot.handlers.profile import (
    change_target_keyboard,
    profile_inline_keyboard,
    render_profile_card,
    subscription_plans_keyboard,
)


class ProfileFlowTests(unittest.TestCase):
    def setUp(self) -> None:
        self.user = SimpleNamespace(
            full_name="Shaxzod Bek",
            telegram_id=98765432,
            phone_number="+998901234567",
            locale="uz",
        )
        self.profile = SimpleNamespace(
            target_band=7.5,
            current_band=6.0,
            exam_type="academic",
        )
        self.summary = SimpleNamespace(
            completed=12,
            average_band=6.5,
            by_skill={"reading": 6.5, "listening": 7.0, "writing": 6.0, "speaking": 6.5},
        )
        self.active_sub = SimpleNamespace(
            valid_until=datetime.now(UTC) + timedelta(days=25),
            plan="premium_monthly",
            status="active",
        )

    def test_render_profile_card_uzbek_with_active_sub(self) -> None:
        text = render_profile_card(self.user, self.profile, self.summary, self.active_sub, "uz")

        self.assertIn("Shaxzod Bek", text)
        self.assertIn("98765432", text)
        self.assertIn("+998901234567", text)
        self.assertIn("7.5", text)
        self.assertIn("6.0", text)
        self.assertIn("12 ta", text)
        self.assertIn("VIP Faol", text)

    def test_render_profile_card_english_free(self) -> None:
        text = render_profile_card(self.user, self.profile, self.summary, None, "en")

        self.assertIn("Candidate Profile", text)
        self.assertIn("Free Account", text)
        self.assertIn("Reading: Band 6.5", text)

    def test_profile_keyboards_structure(self) -> None:
        pk = profile_inline_keyboard("uz")
        self.assertTrue(len(pk.inline_keyboard) >= 2)

        sp = subscription_plans_keyboard("uz")
        self.assertTrue(any("249 Stars" in btn.text for row in sp.inline_keyboard for btn in row))
        self.assertTrue(any("49 Stars" in btn.text for row in sp.inline_keyboard for btn in row))


        ct = change_target_keyboard("uz")
        self.assertTrue(any("7.5" in btn.text for row in ct.inline_keyboard for btn in row))
