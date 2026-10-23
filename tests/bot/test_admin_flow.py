import io
import unittest
from openpyxl import load_workbook

from packages.ieltix_core.config import Settings


class AdminFlowTests(unittest.TestCase):
    def test_admin_ids_includes_configured_owner(self) -> None:
        settings = Settings(admin_telegram_ids="6956456422")
        self.assertIn(6956456422, settings.admin_ids)

    def test_excel_export_creates_valid_workbook(self) -> None:
        import openpyxl
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Foydalanuvchilar"
        ws.append(["№", "Telegram ID", "Ism", "Band", "Obuna"])
        ws.append([1, 6956456422, "Admin Owner", 7.5, "Plus"])

        buf = io.BytesIO()
        wb.save(buf)
        file_bytes = buf.getvalue()
        buf.close()

        loaded_wb = load_workbook(io.BytesIO(file_bytes))
        sheet = loaded_wb["Foydalanuvchilar"]
        self.assertEqual(sheet.cell(row=2, column=2).value, 6956456422)
        self.assertEqual(sheet.cell(row=2, column=3).value, "Admin Owner")

    def test_api_key_masking(self) -> None:
        from packages.ieltix_core.application.key_pool import mask_api_key

        self.assertEqual(mask_api_key("gsk_testdummykey1234567890abcdefwiT6"), "gsk_test...wiT6")
        self.assertEqual(mask_api_key("AIzaSyB1234567890abcdef"), "AIzaSyB1...cdef")
        self.assertEqual(mask_api_key(""), "mavjud emas")

    def test_key_pool_round_robin_and_failover(self) -> None:
        from packages.ieltix_core.application.key_pool import LLMKeyPool

        pool = LLMKeyPool(database=None)
        pool._groq_keys = ["gsk_key_1", "gsk_key_2", "gsk_key_3"]
        pool._gemini_keys = ["gem_key_1", "gem_key_2"]

        # Round robin ordering
        keys_first = pool.get_groq_keys()
        self.assertEqual(len(keys_first), 3)

        # Mark key 1 as rate limited
        pool.mark_rate_limited("groq", "gsk_key_1", cooldown_seconds=60)
        keys_after_cooldown = pool.get_groq_keys()
        # Cooled-down keys are prioritized first
        self.assertIn("gsk_key_2", keys_after_cooldown[:2])
        self.assertIn("gsk_key_3", keys_after_cooldown[:2])

