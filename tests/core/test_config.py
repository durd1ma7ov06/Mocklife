from pathlib import Path
import unittest

from packages.ieltix_core.config import Settings


class ConfigContractTests(unittest.TestCase):
    def test_env_example_matches_settings_fields(self) -> None:
        example_path = Path(__file__).resolve().parent.parent.parent / ".env.bot.example"
        self.assertTrue(example_path.exists(), ".env.bot.example must exist")

        lines = example_path.read_text(encoding="utf-8").splitlines()
        example_keys = set()
        for line in lines:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key = line.split("=", 1)[0].strip().lower()
                example_keys.add(key)

        settings_fields = set(Settings.model_fields.keys())
        missing_in_settings = example_keys - settings_fields
        self.assertEqual(
            missing_in_settings,
            set(),
            f"Keys in .env.bot.example not recognized in Settings: {missing_in_settings}",
        )
