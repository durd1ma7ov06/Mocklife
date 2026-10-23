import io
import tempfile
import unittest
from pathlib import Path

from fastapi.testclient import TestClient

from apps.core_api.main import create_app
from packages.ieltix_core.adapters.database import Database
from packages.ieltix_core.config import Settings


class VoiceTurnsApiTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        db_path = Path(self.temp_dir.name) / "voice.db"
        self.settings = Settings(
            database_url=f"sqlite+aiosqlite:///{db_path.as_posix()}",
            call_token_secret="test-secret-with-more-than-32-characters",
        )
        self.database = Database(self.settings.database_url)
        self.client_context = TestClient(create_app(self.settings, self.database))
        self.client = self.client_context.__enter__()

        session_res = self.client.post(
            "/api/live-call/sessions",
            headers={"X-Internal-Key": self.settings.call_token_secret},
            json={"user_id": 101, "locale": "uz"},
        )
        self.assertEqual(session_res.status_code, 201)
        self.session_data = session_res.json()
        self.token = self.session_data["token"]

    def tearDown(self) -> None:
        self.client_context.__exit__(None, None, None)
        self.temp_dir.cleanup()

    def test_audio_turn_with_unsupported_mime_type_returns_415(self) -> None:
        response = self.client.post(
            "/api/live-call/turns/audio",
            data={"token": self.token, "user_id": 101},
            files={"audio": ("sample.exe", b"fake binary", "application/x-msdownload")},
        )
        self.assertEqual(response.status_code, 415)

    def test_audio_turn_with_invalid_token_returns_401(self) -> None:
        response = self.client.post(
            "/api/live-call/turns/audio",
            data={"token": "invalid-token-here-1234567890", "user_id": 101},
            files={"audio": ("sample.wav", b"dummy wav", "audio/wav")},
        )
        self.assertEqual(response.status_code, 401)

    def test_audio_turn_oversize_payload_returns_413(self) -> None:
        huge_bytes = b"0" * (10 * 1024 * 1024 + 1024)
        response = self.client.post(
            "/api/live-call/turns/audio",
            data={"token": self.token, "user_id": 101},
            files={"audio": ("sample.wav", huge_bytes, "audio/wav")},
        )
        self.assertEqual(response.status_code, 413)

    def test_audio_turn_with_plain_text_dev_stt_returns_turn(self) -> None:
        response = self.client.post(
            "/api/live-call/turns/audio",
            data={"token": self.token, "user_id": 101},
            files={"audio": ("speech.txt", b"I really enjoy living in my hometown because it is historic.", "text/plain")},
        )
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["transcript"], "I really enjoy living in my hometown because it is historic.")
        self.assertEqual(payload["detected_language"], "en")
        self.assertTrue(payload["examiner_text"].endswith("?"))
