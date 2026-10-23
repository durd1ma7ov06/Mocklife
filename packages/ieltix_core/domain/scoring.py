from decimal import Decimal, ROUND_HALF_UP


def round_band(value: float) -> float:
    """Clamp an IELTS estimate to 0..9 and round to the nearest half band."""
    clamped = min(9.0, max(0.0, value))
    doubled = Decimal(str(clamped * 2)).quantize(Decimal("1"), rounding=ROUND_HALF_UP)
    return float(doubled / 2)
