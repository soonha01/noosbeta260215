from __future__ import annotations

from dataclasses import dataclass
import math
from typing import Any, Mapping

from ..common import as_mapping, clamp, coerce_int, round_float, unit_score
from .planet_profiles import CANONICAL_AXES, PlanetProfile, get_planet_profile


@dataclass(frozen=True, slots=True)
class InterventionContext:
    planet: PlanetProfile
    current_axes: dict[str, float]
    quality_score: float
    confidence_by_axis: dict[str, float]
    duration_override_sec: int | None
    candidate_count_override: int | None
    recognition_result: Mapping[str, Any]
    measured_state_label: str | None
    feedback_profile: Mapping[str, Any]
    intent_context: Mapping[str, Any]


def _extract_current_axes(payload: Mapping[str, Any]) -> dict[str, float]:
    current_state = as_mapping(payload.get("current_state"))
    if current_state:
        return {axis: unit_score(current_state.get(axis), 0.5) for axis in CANONICAL_AXES}

    recognition_result = as_mapping(payload.get("recognition_result"))
    if not recognition_result:
        recognition_result = payload

    dimensions = as_mapping(as_mapping(as_mapping(recognition_result.get("state_profile")).get("dimensions")))
    if dimensions:
        return {
            axis: unit_score(as_mapping(dimensions.get(axis)).get("score"), 0.5)
            for axis in CANONICAL_AXES
        }

    raise ValueError("intervention session requires current_state or recognition_result.state_profile.dimensions")


def _extract_quality_score(payload: Mapping[str, Any]) -> float:
    quality = as_mapping(as_mapping(payload.get("recognition_result")).get("quality"))
    if quality:
        return unit_score(quality.get("score"), 0.5)
    return unit_score(payload.get("quality_score"), 0.5)


def _extract_dimension_confidences(payload: Mapping[str, Any]) -> dict[str, float]:
    recognition_result = as_mapping(payload.get("recognition_result"))
    dimensions = as_mapping(as_mapping(as_mapping(recognition_result.get("state_profile")).get("dimensions")))
    return {
        axis: unit_score(as_mapping(dimensions.get(axis)).get("confidence"), 0.5)
        for axis in CANONICAL_AXES
    }


def normalized_confidence_average(confidence_by_axis: Mapping[str, float] | None, fallback: float) -> float:
    confidence_map = confidence_by_axis or {axis: fallback for axis in CANONICAL_AXES}
    numeric = []

    for axis in CANONICAL_AXES:
        value = confidence_map.get(axis, fallback)
        try:
            number = float(value)
        except (TypeError, ValueError):
            number = fallback
        if not math.isfinite(number):
            number = fallback
        numeric.append(clamp(number, 0.0, 1.0))

    if not numeric:
        return fallback
    return round_float(sum(numeric) / len(numeric), 4)


def parse_intervention_context(payload: Mapping[str, Any]) -> InterventionContext:
    planet_name = payload.get("planet")
    if not isinstance(planet_name, str) or not planet_name.strip():
        raise ValueError("intervention session requires a planet")

    recognition_result = as_mapping(payload.get("recognition_result"))
    measured_state_label = as_mapping(recognition_result.get("state_profile")).get("label")
    if not isinstance(measured_state_label, str):
        measured_state_label = None

    return InterventionContext(
        planet=get_planet_profile(planet_name),
        current_axes=_extract_current_axes(payload),
        quality_score=_extract_quality_score(payload),
        confidence_by_axis=_extract_dimension_confidences(payload),
        duration_override_sec=coerce_int(payload.get("duration_sec")),
        candidate_count_override=coerce_int(payload.get("candidate_count_override")),
        recognition_result=recognition_result,
        measured_state_label=measured_state_label,
        feedback_profile=as_mapping(payload.get("feedback_profile")),
        intent_context=as_mapping(payload.get("intent_context")),
    )
