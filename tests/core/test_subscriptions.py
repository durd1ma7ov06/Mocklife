from datetime import UTC, datetime, timedelta
import tempfile
import unittest
from pathlib import Path

from packages.ieltix_core.adapters.database import Database
from packages.ieltix_core.adapters.repositories import SqlAlchemyUserRepository
from packages.ieltix_core.application.subscriptions import (
    DuplicateChargeError,
    InvalidPayloadError,
    SubscriptionService,
)
from packages.ieltix_core.domain.models import User


class SubscriptionServiceTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        db_path = Path(self.temp_dir.name) / "sub.db"
        self.database = Database(f"sqlite+aiosqlite:///{db_path.as_posix()}")
        await self.database.create_schema()

        async with self.database.session() as session:
            user_repo = SqlAlchemyUserRepository(session)
            self.user = await user_repo.save(User(telegram_id=123456, full_name="Mansur"))
            self.user_id = self.user.id

        self.service = SubscriptionService(self.database, secret="sub-secret-key-32-chars-at-least")

    async def asyncTearDown(self) -> None:
        await self.database.dispose()
        self.temp_dir.cleanup()

    async def test_invoice_payload_creation_and_validation(self) -> None:
        payload = self.service.create_invoice_payload(self.user_id, plan="premium_monthly")
        parsed = self.service.validate_payload(payload)
        self.assertEqual(parsed["user_id"], self.user_id)
        self.assertEqual(parsed["plan"], "premium_monthly")

    async def test_invalid_payload_rejected(self) -> None:
        with self.assertRaises(InvalidPayloadError):
            self.service.validate_payload("corrupted_payload_string")

    async def test_complete_payment_activates_subscription(self) -> None:
        payload = self.service.create_invoice_payload(self.user_id, plan="premium_monthly")
        sub = await self.service.complete_payment(
            user_id=self.user_id,
            telegram_charge_id="tg_charge_001",
            payload=payload,
            amount=250,
            currency="XTR",
        )
        self.assertEqual(sub.plan, "premium_monthly")
        self.assertEqual(sub.status, "active")
        self.assertGreater(sub.valid_until, datetime.now(UTC) + timedelta(days=25))

    async def test_duplicate_charge_id_is_rejected_idempotently(self) -> None:
        payload = self.service.create_invoice_payload(self.user_id, plan="premium_monthly")
        await self.service.complete_payment(
            user_id=self.user_id,
            telegram_charge_id="tg_charge_duplicate",
            payload=payload,
            amount=250,
            currency="XTR",
        )
        with self.assertRaises(DuplicateChargeError):
            await self.service.complete_payment(
                user_id=self.user_id,
                telegram_charge_id="tg_charge_duplicate",
                payload=payload,
                amount=250,
                currency="XTR",
            )

    async def test_complete_payment_activates_weekly_subscription(self) -> None:
        payload = self.service.create_invoice_payload(self.user_id, plan="plus_weekly")
        sub = await self.service.complete_payment(
            user_id=self.user_id,
            telegram_charge_id="tg_charge_weekly",
            payload=payload,
            amount=49,
            currency="XTR",
        )
        self.assertEqual(sub.plan, "plus_weekly")
        self.assertEqual(sub.status, "active")
        now = datetime.now(UTC)
        # Should be between 6 and 8 days from now
        self.assertGreater(sub.valid_until, now + timedelta(days=6))
        self.assertLess(sub.valid_until, now + timedelta(days=8))

