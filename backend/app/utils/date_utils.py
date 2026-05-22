from datetime import datetime, timezone


def count_nights(check_in: datetime, check_out: datetime) -> int:
    return max(1, (check_out - check_in).days)


def calc_subtotal(price_per_night: float, nights: int) -> float:
    return round(price_per_night * nights, 2)


def calc_discount(subtotal: float, discount_percent: float) -> float:
    return round(subtotal * discount_percent / 100, 2)


def calc_tax(subtotal: float, discount: float, tax_rate: float = 0.12) -> float:
    return round((subtotal - discount) * tax_rate, 2)


def calc_total(subtotal: float, discount: float, tax: float) -> float:
    return round(subtotal - discount + tax, 2)
