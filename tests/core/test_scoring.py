import unittest

from packages.ieltix_core.domain.scoring import round_band


class BandScoringTests(unittest.TestCase):
    def test_rounds_to_nearest_ielts_half_band(self) -> None:
        cases = {
            6.24: 6.0,
            6.25: 6.5,
            6.74: 6.5,
            6.75: 7.0,
            9.4: 9.0,
            -1.0: 0.0,
        }

        for raw, expected in cases.items():
            with self.subTest(raw=raw):
                self.assertEqual(round_band(raw), expected)
