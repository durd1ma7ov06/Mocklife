import base64
from dataclasses import dataclass
from datetime import UTC, datetime
import hashlib
import hmac
import json
from collections.abc import Callable


class CallTokenError(ValueError):
    pass


@dataclass(frozen=True, slots=True)
class CallClaims:
    user_id: int
    session_id: str
    purpose: str
    expires_at: int


def _encode(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode("ascii")


def _decode(value: str) -> bytes:
    return base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))


class CallTokenService:
    def __init__(
        self,
        secret: str,
        ttl_seconds: int = 900,
        now: Callable[[], datetime] | None = None,
    ) -> None:
        if len(secret) < 16:
            raise ValueError("call token secret must contain at least 16 characters")
        self.secret = secret.encode("utf-8")
        self.ttl_seconds = ttl_seconds
        self.now = now or (lambda: datetime.now(UTC))

    def issue(self, user_id: int, session_id: str) -> str:
        expires_at = int(self.now().timestamp()) + self.ttl_seconds
        payload = json.dumps(
            {"uid": user_id, "sid": session_id, "purpose": "live_call", "exp": expires_at},
            separators=(",", ":"),
            sort_keys=True,
        ).encode("utf-8")
        encoded = _encode(payload)
        signature = _encode(hmac.new(self.secret, encoded.encode("ascii"), hashlib.sha256).digest())
        return f"{encoded}.{signature}"

    def verify(self, token: str, expected_user_id: int | None = None) -> CallClaims:
        try:
            encoded, supplied_signature = token.split(".", 1)
            expected_signature = _encode(
                hmac.new(self.secret, encoded.encode("ascii"), hashlib.sha256).digest()
            )
            if not hmac.compare_digest(supplied_signature, expected_signature):
                raise CallTokenError("invalid token signature")
            raw = json.loads(_decode(encoded))
            claims = CallClaims(
                user_id=int(raw["uid"]),
                session_id=str(raw["sid"]),
                purpose=str(raw["purpose"]),
                expires_at=int(raw["exp"]),
            )
        except CallTokenError:
            raise
        except (ValueError, KeyError, TypeError, json.JSONDecodeError) as exc:
            raise CallTokenError("malformed call token") from exc
        if claims.purpose != "live_call":
            raise CallTokenError("invalid token purpose")
        if claims.expires_at < int(self.now().timestamp()):
            raise CallTokenError("call token expired")
        if expected_user_id is not None and claims.user_id != expected_user_id:
            raise CallTokenError("call token belongs to another user")
        return claims
