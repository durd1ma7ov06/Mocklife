import hashlib
import hmac
import json
import time
from typing import Any

from packages.ieltix_core.adapters.database import Database, SubscriptionRecord
from packages.ieltix_core.adapters.repositories import SqlAlchemySubscriptionRepository


class SubscriptionError(Exception):
    pass


class InvalidPayloadError(SubscriptionError):
    pass


class DuplicateChargeError(SubscriptionError):
    pass


class SubscriptionService:
    def __init__(self, database: Database, secret: str) -> None:
        self.database = database
        self.secret = secret.encode("utf-8")

    def create_invoice_payload(self, user_id: int, plan: str = "premium_monthly") -> str:
        data = {
            "user_id": user_id,
            "plan": plan,
            "ts": int(time.time()),
        }
        encoded = json.dumps(data, separators=(",", ":"), sort_keys=True)
        sig = hmac.new(self.secret, encoded.encode("utf-8"), hashlib.sha256).hexdigest()[:16]
        return f"{encoded}|{sig}"

    def validate_payload(self, payload: str) -> dict[str, Any]:
        if not payload or "|" not in payload:
            raise InvalidPayloadError("Malformed payment payload")
        encoded, sig = payload.rsplit("|", 1)
        expected_sig = hmac.new(self.secret, encoded.encode("utf-8"), hashlib.sha256).hexdigest()[:16]
        if not hmac.compare_digest(sig, expected_sig):
            raise InvalidPayloadError("Invalid payment payload signature")
        try:
            data = json.loads(encoded)
            if not isinstance(data, dict) or "user_id" not in data or "plan" not in data:
                raise InvalidPayloadError("Incomplete payment payload")
            return data
        except json.JSONDecodeError as exc:
            raise InvalidPayloadError("Invalid json payload") from exc

    async def complete_payment(
        self,
        user_id: int,
        telegram_charge_id: str,
        payload: str,
        amount: int,
        currency: str = "XTR",
        provider_charge_id: str | None = None,
    ) -> SubscriptionRecord:
        parsed = self.validate_payload(payload)
        if parsed["user_id"] != user_id:
            raise InvalidPayloadError("Payload user mismatch")

        async with self.database.session() as session:
            repo = SqlAlchemySubscriptionRepository(session)
            existing = await repo.get_payment_by_charge_id(telegram_charge_id)
            if existing is not None:
                raise DuplicateChargeError(f"Charge ID {telegram_charge_id} was already processed")

            await repo.record_payment(
                user_id=user_id,
                telegram_charge_id=telegram_charge_id,
                payload=payload,
                amount=amount,
                currency=currency,
                provider_charge_id=provider_charge_id,
            )
            plan_name = parsed.get("plan", "plus_monthly")
            duration_days = 7 if "week" in plan_name.lower() else 30
            sub = await repo.activate_or_extend(user_id=user_id, plan=plan_name, duration_days=duration_days)
            return sub

