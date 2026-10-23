import unittest
from datetime import UTC, datetime, timedelta

from packages.ieltix_core.security.tokens import CallTokenError, CallTokenService


class CallTokenTests(unittest.TestCase):
    def setUp(self) -> None:
        self.now = datetime(2026, 10, 21, 12, 0, tzinfo=UTC)
        self.tokens = CallTokenService(
            "a-secret-long-enough-for-tests",
            ttl_seconds=900,
            now=lambda: self.now,
        )

    def test_valid_token_is_bound_to_user_session_and_purpose(self) -> None:
        token = self.tokens.issue(user_id=42, session_id="call-123")

        claims = self.tokens.verify(token, expected_user_id=42)

        self.assertEqual(claims.session_id, "call-123")
        self.assertEqual(claims.purpose, "live_call")

    def test_expired_token_is_rejected(self) -> None:
        token = self.tokens.issue(user_id=42, session_id="call-123")
        self.now += timedelta(minutes=16)

        with self.assertRaisesRegex(CallTokenError, "expired"):
            self.tokens.verify(token, expected_user_id=42)

    def test_token_cannot_be_used_by_another_user(self) -> None:
        token = self.tokens.issue(user_id=42, session_id="call-123")

        with self.assertRaisesRegex(CallTokenError, "user"):
            self.tokens.verify(token, expected_user_id=99)

    def test_tampered_token_is_rejected(self) -> None:
        token = self.tokens.issue(user_id=42, session_id="call-123")
        tampered = token[:-2] + "aa"

        with self.assertRaises(CallTokenError):
            self.tokens.verify(tampered, expected_user_id=42)
