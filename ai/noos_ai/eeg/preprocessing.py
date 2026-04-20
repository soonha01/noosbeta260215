from __future__ import annotations

from dataclasses import dataclass
import statistics
from typing import Any

from ..common import clamp
from ..contracts import ChannelReading
from .bands import CHANNELS


@dataclass(slots=True)
class PreparedSignal:
    sample_rate_hz: float
    timestamps: list[float]
    channel_series: dict[str, list[float]]
    quality: dict[str, Any]
def _median(values: list[float]) -> float:
    return statistics.median(values) if values else 0.0


def _mad(values: list[float], center: float | None = None) -> float:
    if not values:
        return 0.0
    origin = _median(values) if center is None else center
    return statistics.median(abs(value - origin) for value in values)


def _estimate_sample_rate(timestamps: list[float], requested_sample_rate: float | None) -> float:
    if requested_sample_rate and requested_sample_rate > 0:
        fallback = requested_sample_rate
    else:
        fallback = 256.0

    if len(timestamps) < 4:
        return fallback

    deltas = [
        current - previous
        for previous, current in zip(timestamps, timestamps[1:])
        if current > previous
    ]
    if not deltas:
        return fallback

    median_delta = statistics.median(deltas)
    if median_delta <= 0:
        return fallback

    inferred = 1000.0 / median_delta if median_delta > 0.25 else 1.0 / median_delta
    if inferred < 50 or inferred > 1024:
        return fallback
    return inferred


def _channel_quality(samples: list[float]) -> dict[str, float | bool]:
    if len(samples) < 4:
        return {
            "variance": 0.0,
            "mad": 0.0,
            "outlier_ratio": 1.0,
            "jump_ratio": 1.0,
            "flatline_ratio": 1.0,
            "usable": False,
        }

    center = _median(samples)
    mad = max(_mad(samples, center), 1e-6)
    diffs = [current - previous for previous, current in zip(samples, samples[1:])]
    diff_center = _median(diffs)
    diff_mad = max(_mad(diffs, diff_center), 1e-6)
    variance = statistics.pvariance(samples)

    outlier_threshold = max(6.0 * mad, 120.0)
    jump_threshold = max(8.0 * diff_mad, 100.0)

    outlier_ratio = sum(1 for value in samples if abs(value - center) > outlier_threshold) / len(samples)
    jump_ratio = sum(1 for value in diffs if abs(value - diff_center) > jump_threshold) / max(1, len(diffs))
    flatline_ratio = sum(1 for value in diffs if abs(value) < 1e-9) / max(1, len(diffs))
    usable = variance > 1e-6 and outlier_ratio < 0.35

    return {
        "variance": variance,
        "mad": mad,
        "outlier_ratio": outlier_ratio,
        "jump_ratio": jump_ratio,
        "flatline_ratio": flatline_ratio,
        "usable": usable,
    }


def prepare_signal(
    readings: list[ChannelReading],
    requested_sample_rate: float | None = None,
) -> PreparedSignal | None:
    if not readings:
        return None

    timestamps: list[float] = []
    channel_series = {channel: [] for channel in CHANNELS}

    for index, reading in enumerate(readings):
        if len(reading.channels) != len(CHANNELS):
            continue

        timestamp = reading.timestamp if reading.timestamp is not None else float(index)
        timestamps.append(timestamp)

        for channel in CHANNELS:
            channel_series[channel].append(reading.channels[channel])

    if not timestamps:
        return None

    sample_rate_hz = _estimate_sample_rate(timestamps, requested_sample_rate)
    per_channel = {channel: _channel_quality(samples) for channel, samples in channel_series.items()}
    mean_outlier = statistics.mean(float(metrics["outlier_ratio"]) for metrics in per_channel.values())
    mean_jump = statistics.mean(float(metrics["jump_ratio"]) for metrics in per_channel.values())
    mean_flatline = statistics.mean(float(metrics["flatline_ratio"]) for metrics in per_channel.values())

    sample_count = len(timestamps)
    warnings: list[str] = []
    if sample_count < 256:
        warnings.append("sample_count is below 256, so spectral confidence is reduced.")
    if mean_outlier > 0.10:
        warnings.append("gross artifact ratio is elevated.")
    if mean_jump > 0.08:
        warnings.append("sudden jumps suggest motion or contact noise.")
    if mean_flatline > 0.10:
        warnings.append("flat segments were detected in multiple channels.")

    penalty = 0.0
    penalty += min(mean_outlier * 1.6, 0.25)
    penalty += min(mean_jump * 1.2, 0.18)
    penalty += min(mean_flatline * 1.5, 0.15)
    penalty += 0.18 if sample_count < 128 else 0.08 if sample_count < 256 else 0.0

    score = clamp(1.0 - penalty, 0.05, 1.0)
    usable = sample_count >= 64 and score >= 0.35

    quality = {
        "usable": usable,
        "score": score,
        "sample_count": sample_count,
        "sample_rate_hz": sample_rate_hz,
        "warnings": warnings,
        "per_channel": per_channel,
        "mean_outlier_ratio": mean_outlier,
        "mean_jump_ratio": mean_jump,
        "mean_flatline_ratio": mean_flatline,
    }

    return PreparedSignal(
        sample_rate_hz=sample_rate_hz,
        timestamps=timestamps,
        channel_series=channel_series,
        quality=quality,
    )
