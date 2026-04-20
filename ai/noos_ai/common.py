from __future__ import annotations

from datetime import datetime, timezone
import math
from typing import Any, Iterable, Mapping, TypeVar


T = TypeVar("T")


def clamp(value: float, lower: float = 0.0, upper: float = 1.0) -> float:
    return max(lower, min(upper, value))


def round_float(value: float, digits: int = 4) -> float:
    return round(float(value), digits)


def now_utc_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def as_mapping(value: Any) -> Mapping[str, Any]:
    if isinstance(value, Mapping):
        return value
    return {}


def safe_float(value: Any, default: float | None = None) -> float | None:
    try:
        if value is None or value == "":
            return default
        number = float(value)
        if not math.isfinite(number):
            return default
        return number
    except (TypeError, ValueError):
        return default


def unit_score(value: Any, default: float = 0.5) -> float:
    number = safe_float(value, default)
    if number is None:
        return default
    return clamp(number, 0.0, 1.0)


def coerce_int(value: Any) -> int | None:
    number = safe_float(value)
    if number is None:
        return None
    return int(number)


def dedupe_preserve_order(values: Iterable[T]) -> list[T]:
    deduped: list[T] = []
    seen: set[T] = set()

    for value in values:
        if value in seen:
            continue
        deduped.append(value)
        seen.add(value)

    return deduped
