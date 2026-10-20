import unittest

from fastapi.testclient import TestClient

from apps.core_api.main import app


class HealthApiTests(unittest.TestCase):
    def test_health_reports_ieltix_core_ready(self) -> None:
        response = TestClient(app).get("/health")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(), {"status": "ok", "service": "ieltix-core"}
        )


if __name__ == "__main__":
    unittest.main()
