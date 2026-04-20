from __future__ import annotations

import math
from typing import Any

from ..common import clamp
from .bands import BAND_KEYS, BANDS, CHANNELS, FRONTAL_CHANNELS, POSTERIOR_CHANNELS


def _power_of_two_floor(value: int) -> int:
    if value < 1:
        return 0
    return 1 << (value.bit_length() - 1)


def _hamming_window(length: int) -> list[float]:
    if length <= 1:
        return [1.0] * max(1, length)
    return [0.54 - 0.46 * math.cos((2.0 * math.pi * index) / (length - 1)) for index in range(length)]


def welch_psd(
    samples: list[float],
    sample_rate_hz: float,
    segment_length: int | None = None,
    overlap: float = 0.5,
) -> tuple[list[float], list[float]]:
    if len(samples) < 64 or sample_rate_hz <= 0:
        return [], []

    if segment_length is None:
        segment_length = min(256, _power_of_two_floor(len(samples)))
    else:
        segment_length = min(segment_length, _power_of_two_floor(len(samples)))

    segment_length = int(clamp(float(segment_length), 0.0, float(len(samples))))
    if segment_length < 64:
        return [], []

    normalized_overlap = clamp(overlap, 0.0, 0.95)
    step = max(1, int(segment_length * (1.0 - normalized_overlap)))
    window = _hamming_window(segment_length)
    window_power = sum(value * value for value in window)
    segment_count = 0
    accumulator = [0.0] * (segment_length // 2 + 1)

    for start in range(0, len(samples) - segment_length + 1, step):
        segment = samples[start : start + segment_length]
        mean = sum(segment) / len(segment)
        windowed = [(value - mean) * coefficient for value, coefficient in zip(segment, window)]

        for bin_index in range(segment_length // 2 + 1):
            real = 0.0
            imaginary = 0.0
            for sample_index, value in enumerate(windowed):
                angle = (2.0 * math.pi * bin_index * sample_index) / segment_length
                real += value * math.cos(angle)
                imaginary -= value * math.sin(angle)

            power = (real * real + imaginary * imaginary) / (sample_rate_hz * window_power)
            if 0 < bin_index < segment_length // 2:
                power *= 2.0
            accumulator[bin_index] += power

        segment_count += 1

    if segment_count == 0:
        return [], []

    frequencies = [(sample_rate_hz * index) / segment_length for index in range(segment_length // 2 + 1)]
    psd = [value / segment_count for value in accumulator]
    return frequencies, psd


def _integrate_band_power(frequencies: list[float], psd: list[float], low_hz: float, high_hz: float) -> float:
    if len(frequencies) < 2:
        return 0.0

    total = 0.0
    for index in range(1, len(frequencies)):
        midpoint = (frequencies[index] + frequencies[index - 1]) / 2.0
        if low_hz <= midpoint < high_hz:
            width = frequencies[index] - frequencies[index - 1]
            total += ((psd[index] + psd[index - 1]) / 2.0) * width
    return total


def _safe_ratio(numerator: float, denominator: float) -> float:
    return numerator / denominator if denominator > 0 else 0.0


def summarize_spectral_features(
    channel_series: dict[str, list[float]],
    sample_rate_hz: float,
) -> dict[str, Any]:
    per_channel: dict[str, dict[str, Any]] = {}

    for channel in CHANNELS:
        frequencies, psd = welch_psd(channel_series[channel], sample_rate_hz)
        absolute = {band.key: _integrate_band_power(frequencies, psd, band.low_hz, band.high_hz) for band in BANDS}
        total = sum(absolute.values())
        relative = {key: _safe_ratio(value, total) for key, value in absolute.items()}

        peak_frequency_hz = 0.0
        peak_power = -1.0
        for frequency, power in zip(frequencies, psd):
            if 1.0 <= frequency <= 30.0 and power > peak_power:
                peak_power = power
                peak_frequency_hz = frequency

        per_channel[channel] = {
            "absolute": absolute,
            "relative": relative,
            "peak_frequency_hz": peak_frequency_hz,
        }

    global_absolute = {
        key: sum(per_channel[channel]["absolute"][key] for channel in CHANNELS) / len(CHANNELS)
        for key in BAND_KEYS
    }
    absolute_total = sum(global_absolute.values())
    global_relative = {key: _safe_ratio(value, absolute_total) for key, value in global_absolute.items()}

    regional_relative = {}
    for region_name, region_channels in (("frontal", FRONTAL_CHANNELS), ("posterior", POSTERIOR_CHANNELS)):
        regional_relative[region_name] = {
            key: sum(per_channel[channel]["relative"][key] for channel in region_channels) / len(region_channels)
            for key in BAND_KEYS
        }

    theta_beta_ratio = _safe_ratio(global_relative["theta"], global_relative["beta"])
    alpha_beta_ratio = _safe_ratio(global_relative["alpha"], global_relative["beta"])
    beta_alpha_ratio = _safe_ratio(global_relative["beta"], global_relative["alpha"])
    theta_alpha_ratio = _safe_ratio(global_relative["theta"], global_relative["alpha"])
    frontal_theta_beta_ratio = _safe_ratio(regional_relative["frontal"]["theta"], regional_relative["frontal"]["beta"])

    faa_alpha_log_ratio = 0.0
    left_alpha = per_channel["AF7"]["absolute"]["alpha"]
    right_alpha = per_channel["AF8"]["absolute"]["alpha"]
    if left_alpha > 0 and right_alpha > 0:
        faa_alpha_log_ratio = math.log(right_alpha) - math.log(left_alpha)

    dominant_band = max(BAND_KEYS, key=lambda key: global_relative[key])
    high_frequency_ratio = global_relative["gamma"]
    delta_ratio = global_relative["delta"]

    return {
        "per_channel": per_channel,
        "global_absolute": global_absolute,
        "global_relative": global_relative,
        "regional_relative": regional_relative,
        "ratios": {
            "theta_beta_ratio": theta_beta_ratio,
            "alpha_beta_ratio": alpha_beta_ratio,
            "beta_alpha_ratio": beta_alpha_ratio,
            "theta_alpha_ratio": theta_alpha_ratio,
            "frontal_theta_beta_ratio": frontal_theta_beta_ratio,
            "faa_alpha_log_ratio": faa_alpha_log_ratio,
        },
        "artifact_indicators": {
            "high_frequency_ratio": high_frequency_ratio,
            "delta_ratio": delta_ratio,
        },
        "dominant_band": dominant_band,
        "sample_rate_hz": sample_rate_hz,
    }
