import tempfile
import unittest
from pathlib import Path

from fastapi.testclient import TestClient

from apps.core_api.main import create_app
from packages.ieltix_core.adapters.database import Database
from packages.ieltix_core.config import Settings


class LiveCallApiTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        db_path = Path(self.temp_dir.name) / "calls.db"
        self.settings = Settings(
            database_url=f"sqlite+aiosqlite:///{db_path.as_posix()}",
            call_token_secret="test-secret-with-more-than-32-characters",
        )
        self.database = Database(self.settings.database_url)
        self.client_context = TestClient(create_app(self.settings, self.database))
        self.client = self.client_context.__enter__()

    def tearDown(self) -> None:
        self.client_context.__exit__(None, None, None)
        self.temp_dir.cleanup()

    def test_session_creation_requires_internal_bot_secret(self) -> None:
        response = self.client.post(
            "/api/live-call/sessions", json={"user_id": 42, "locale": "uz"}
        )

        self.assertEqual(response.status_code, 401)

    def test_valid_session_accepts_a_text_turn(self) -> None:
        created = self.client.post(
            "/api/live-call/sessions",
            headers={"X-Internal-Key": self.settings.call_token_secret},
            json={"user_id": 42, "locale": "uz"},
        )
        self.assertEqual(created.status_code, 201)
        payload = created.json()
        self.assertIn("token", payload)
        self.assertTrue(payload["opening"].endswith("?"))

        turn = self.client.post(
            "/api/live-call/turns/text",
            json={
                "token": payload["token"],
                "user_id": 42,
                "text": "I enjoy my hometown because my family and friends live there.",
            },
        )

        self.assertEqual(turn.status_code, 200)
        self.assertEqual(turn.json()["detected_language"], "en")
        self.assertTrue(turn.json()["examiner_text"].endswith("?"))

    def test_call_token_cannot_be_replayed_by_another_user(self) -> None:
        payload = self.client.post(
            "/api/live-call/sessions",
            headers={"X-Internal-Key": self.settings.call_token_secret},
            json={"user_id": 42, "locale": "en"},
        ).json()

        response = self.client.post(
            "/api/live-call/turns/text",
            json={"token": payload["token"], "user_id": 99, "text": "Hello"},
        )

        self.assertEqual(response.status_code, 401)
