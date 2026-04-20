from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Mapping
from uuid import uuid4

from .common import as_mapping, safe_float


SUPPORTED_CHANNELS = ("TP9", "AF7", "AF8", "TP10")


@dataclass(slots=True)
class ChannelReading:
    timestamp: float | None
    channels: dict[str, float]
    source: str | None = None

    @classmethod
    def from_mapping(cls, payload: Mapping[str, Any]) -> "ChannelReading | None":
        channels_payload = as_mapping(payload.get("channels"))
        channels: dict[str, float] = {}

        for channel in SUPPORTED_CHANNELS:
            value = safe_float(channels_payload.get(channel))
            if value is None:
                return None
            channels[channel] = value

        timestamp = safe_float(payload.get("timestamp"))
        source = payload.get("source")
        return cls(timestamp=timestamp, channels=channels, source=source if isinstance(source, str) else None)


@dataclass(slots=True)
class BandSummary:
    values: dict[str, float]
    dominant_band: str | None = None
    sample_count: int = 0

    @classmethod
    def from_mapping(cls, payload: Mapping[str, Any] | None) -> "BandSummary | None":
        if not payload:
            return None

        values: dict[str, float] = {}
        band_powers = payload.get("bandPowers")

        if isinstance(band_powers, list):
            for item in band_powers:
                if not isinstance(item, Mapping):
                    continue
                key = item.get("key")
                if not isinstance(key, str):
                    continue
                percent_value = safe_float(item.get("percent"))
                power_value = safe_float(item.get("power"))
                if percent_value is not None:
                    values[key] = percent_value
                elif power_value is not None:
                    values[key] = power_value

        for key in ("delta", "theta", "alpha", "beta", "gamma"):
            if key not in values:
                maybe = safe_float(payload.get(key))
                if maybe is not None:
                    values[key] = maybe

        if not values:
            return None

        dominant_band = payload.get("dominantBand")
        if not isinstance(dominant_band, str):
            dominant_band = None

        sample_count = int(safe_float(payload.get("sampleCount"), 0) or 0)
        return cls(values=values, dominant_band=dominant_band, sample_count=sample_count)

    def as_relative(self) -> dict[str, float]:
        total = sum(max(0.0, value) for value in self.values.values())
        if total <= 0:
            return {key: 0.0 for key in ("delta", "theta", "alpha", "beta", "gamma")}

        if total > 1.5:
            return {key: max(0.0, self.values.get(key, 0.0)) / 100.0 for key in ("delta", "theta", "alpha", "beta", "gamma")}

        return {key: max(0.0, self.values.get(key, 0.0)) / total for key in ("delta", "theta", "alpha", "beta", "gamma")}


@dataclass(slots=True)
class BaselineProfile:
    features: dict[str, float] = field(default_factory=dict)
    generated_at: str | None = None

    @classmethod
    def from_mapping(cls, payload: Mapping[str, Any] | None) -> "BaselineProfile | None":
        if not payload:
            return None

        features_payload = payload.get("features")
        features: dict[str, float] = {}

        if isinstance(features_payload, Mapping):
            for key, value in features_payload.items():
                numeric = safe_float(value)
                if numeric is not None and isinstance(key, str):
                    features[key] = numeric

        generated_at = payload.get("generated_at")
        return cls(features=features, generated_at=generated_at if isinstance(generated_at, str) else None)


@dataclass(slots=True)
class RecognitionRequest:
    session_type: str
    session_id: str
    measured_at: str | None
    device_type: str
    sample_rate_hz: float | None
    readings: list[ChannelReading]
    band_summary: BandSummary | None
    baseline: BaselineProfile | None
    context: dict[str, Any]

    @classmethod
    def from_mapping(cls, payload: Mapping[str, Any]) -> "RecognitionRequest":
        session_type = payload.get("session_type")
        if not isinstance(session_type, str) or not session_type:
            session_type = "recognition"

        session_id = payload.get("session_id")
        if not isinstance(session_id, str) or not session_id:
            session_id = f"{session_type}-{uuid4().hex[:12]}"

        measured_at = payload.get("measured_at")
        if not isinstance(measured_at, str):
            measured_at = None

        device_type = payload.get("device_type")
        if not isinstance(device_type, str) or not device_type:
            device_type = "Muse S Athena"

        sample_rate_hz = safe_float(payload.get("sample_rate_hz"))

        readings_payload = payload.get("readings")
        readings: list[ChannelReading] = []
        if isinstance(readings_payload, list):
            for item in readings_payload:
                if not isinstance(item, Mapping):
                    continue
                reading = ChannelReading.from_mapping(item)
                if reading is not None:
                    readings.append(reading)

        band_summary = BandSummary.from_mapping(as_mapping(payload.get("band_summary")))
        baseline = BaselineProfile.from_mapping(as_mapping(payload.get("baseline")))
        context = dict(as_mapping(payload.get("context")))

        return cls(
            session_type=session_type,
            session_id=session_id,
            measured_at=measured_at,
            device_type=device_type,
            sample_rate_hz=sample_rate_hz,
            readings=readings,
            band_summary=band_summary,
            baseline=baseline,
            context=context,
        )
