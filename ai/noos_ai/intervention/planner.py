from __future__ import annotations

from typing import Any

from ..common import clamp, now_utc_iso, round_float, unit_score
from .context import normalized_confidence_average
from .planet_profiles import CANONICAL_AXES, PlanetProfile


MIN_SESSION_DURATION_SEC = 10
MAX_DURATION_OVERRIDE_SEC = 600
MAX_SESSION_DURATION_SEC = 1800
MAX_FEEDBACK_DURATION_DELTA_SEC = 600


def _bounded_duration(value: int, minimum: int, maximum: int) -> int:
    return max(minimum, min(int(value), maximum))


def _transition_mode(current_axes: dict[str, float], target_axes: dict[str, float], planet: PlanetProfile) -> str:
    stress = current_axes["stress_load"]
    fatigue = current_axes["fatigue_risk"]
    current_arousal = current_axes["cortical_arousal"]
    target_arousal = target_axes["cortical_arousal"]
    current_focus = current_axes["focus_readiness"]
    target_focus = target_axes["focus_readiness"]

    if planet.slug == "pluto":
        return "downshift_and_restore"
    if stress >= 0.70:
        return "stabilize_then_activate" if target_arousal >= current_arousal else "stabilize_then_downshift"
    if fatigue >= 0.65 and target_focus >= 0.65:
        return "recover_then_focus"
    if current_focus < 0.45 and (target_focus - current_focus) >= 0.20:
        return "activate_and_narrow"
    return "maintain_and_refine" if average_delta_intensity(current_axes, target_axes) < 0.12 else "direct_transition"


def average_delta_intensity(current_axes: dict[str, float], target_axes: dict[str, float]) -> float:
    return sum(abs(target_axes[axis] - current_axes[axis]) for axis in CANONICAL_AXES) / len(CANONICAL_AXES)


def _phase(
    name: str,
    duration_sec: int,
    goals: list[str],
    emphasis: dict[str, float],
) -> dict[str, Any]:
    return {
        "name": name,
        "duration_sec": duration_sec,
        "goals": goals,
        "emphasis": {key: round_float(value, 3) for key, value in emphasis.items()},
    }


def _phase_plan(
    mode: str,
    planet: PlanetProfile,
    current_axes: dict[str, float],
    target_axes: dict[str, float],
    total_duration_sec: int,
) -> list[dict[str, Any]]:
    if mode == "downshift_and_restore":
        return [
            _phase(
                "decompress",
                int(total_duration_sec * 0.45),
                ["lower stress", "reduce arousal", "soften sensory load"],
                {"stress_load": -0.60, "cortical_arousal": -0.55, "relaxation_level": 0.45},
            ),
            _phase(
                "restore",
                total_duration_sec - int(total_duration_sec * 0.45),
                ["increase relaxation", "support recovery", "minimize workload"],
                {"relaxation_level": 0.70, "fatigue_risk": -0.25, "mental_workload": -0.40},
            ),
        ]

    if mode == "recover_then_focus":
        return [
            _phase(
                "recover",
                int(total_duration_sec * 0.35),
                ["reduce fatigue pressure", "smooth stress response", "stabilize baseline"],
                {"fatigue_risk": -0.45, "stress_load": -0.25, "relaxation_level": 0.24},
            ),
            _phase(
                "focus_ramp",
                total_duration_sec - int(total_duration_sec * 0.35),
                ["raise usable arousal", "narrow attention", "move into target focus"],
                {"focus_readiness": 0.50, "cortical_arousal": 0.32, "mental_workload": 0.20},
            ),
        ]

    if mode == "stabilize_then_activate":
        return [
            _phase(
                "stabilize",
                int(total_duration_sec * 0.30),
                ["lower acute stress", "reduce harshness", "hold attention gently"],
                {"stress_load": -0.42, "relaxation_level": 0.20, "focus_readiness": 0.12},
            ),
            _phase(
                "activate",
                total_duration_sec - int(total_duration_sec * 0.30),
                ["raise arousal safely", "increase drive", "enter target mode"],
                {"cortical_arousal": 0.40, "focus_readiness": 0.44, "mental_workload": 0.22},
            ),
        ]

    if mode == "stabilize_then_downshift":
        return [
            _phase(
                "stabilize",
                int(total_duration_sec * 0.40),
                ["lower stress", "reduce mental sharp edges", "stop escalation"],
                {"stress_load": -0.46, "mental_workload": -0.16, "relaxation_level": 0.22},
            ),
            _phase(
                "deepen",
                total_duration_sec - int(total_duration_sec * 0.40),
                ["narrow attention", "keep low distraction", "move into calm target"],
                {"focus_readiness": 0.36, "cortical_arousal": -0.18, "relaxation_level": 0.28},
            ),
        ]

    if mode == "activate_and_narrow":
        return [
            _phase(
                "ignite",
                int(total_duration_sec * 0.28),
                ["raise activation", "reduce start resistance", "establish pulse"],
                {"cortical_arousal": 0.38, "focus_readiness": 0.28},
            ),
            _phase(
                "narrow",
                total_duration_sec - int(total_duration_sec * 0.28),
                ["remove distraction", "increase focus", "hold target workload"],
                {"focus_readiness": 0.44, "mental_workload": 0.18, "stress_load": -0.12},
            ),
        ]

    if mode == "maintain_and_refine":
        return [
            _phase(
                "maintain",
                total_duration_sec,
                ["preserve current fit", "smooth small mismatches", "avoid overcorrection"],
                {"focus_readiness": 0.18, "stress_load": -0.08, "fatigue_risk": -0.08},
            )
        ]

    return [
        _phase(
            "direct_transition",
            total_duration_sec,
            ["move toward target state directly", "avoid unnecessary detours"],
            {axis: round_float(target_axes[axis] - current_axes[axis], 3) for axis in CANONICAL_AXES},
        )
    ]


def build_intervention_plan(
    planet: PlanetProfile,
    current_axes: dict[str, float],
    quality_score: float,
    confidence_by_axis: dict[str, float] | None = None,
    duration_override_sec: int | None = None,
    feedback_profile: dict[str, Any] | None = None,
    intent_context: dict[str, Any] | None = None,
) -> dict[str, Any]:
    target_axes = {axis: unit_score(planet.target_axes.get(axis), 0.5) for axis in CANONICAL_AXES}
    feedback_profile = feedback_profile or {}
    session_adjustments = feedback_profile.get("session_adjustments") if isinstance(feedback_profile, dict) else {}
    if not isinstance(session_adjustments, dict):
        session_adjustments = {}
    duration_delta_sec = _bounded_duration(
        int(session_adjustments.get("duration_delta_sec") or 0),
        -MAX_FEEDBACK_DURATION_DELTA_SEC,
        MAX_FEEDBACK_DURATION_DELTA_SEC,
    )
    intent_context = intent_context or {}
    delta_axes = {axis: round_float(target_axes[axis] - current_axes[axis]) for axis in CANONICAL_AXES}
    intensity = average_delta_intensity(current_axes, target_axes)
    if duration_override_sec is not None:
        bounded_override_sec = _bounded_duration(duration_override_sec, MIN_SESSION_DURATION_SEC, MAX_DURATION_OVERRIDE_SEC)
        total_duration_sec = bounded_override_sec + duration_delta_sec
    else:
        total_duration_sec = int(planet.session_duration_sec)
        if intensity >= 0.30:
            total_duration_sec += 180
        elif intensity >= 0.18:
            total_duration_sec += 90
        total_duration_sec += duration_delta_sec
    total_duration_sec = _bounded_duration(total_duration_sec, MIN_SESSION_DURATION_SEC, MAX_SESSION_DURATION_SEC)

    mode = _transition_mode(current_axes, target_axes, planet)
    phases = _phase_plan(mode, planet, current_axes, target_axes, total_duration_sec)
    ordered_axes = sorted(CANONICAL_AXES, key=lambda axis: abs(delta_axes[axis]), reverse=True)
    average_confidence = normalized_confidence_average(confidence_by_axis, quality_score)
    transition_reliability = round_float((quality_score * 0.6) + (average_confidence * 0.4), 3)

    if planet.slug == "pluto":
        direction = "downshift"
    elif delta_axes["focus_readiness"] > 0.20 and delta_axes["cortical_arousal"] > 0.15:
        direction = "activate"
    elif delta_axes["stress_load"] < -0.20 or delta_axes["relaxation_level"] > 0.20:
        direction = "stabilize"
    else:
        direction = "refine"

    return {
        "generated_at": now_utc_iso(),
        "planet": {
            "slug": planet.slug,
            "title": planet.title,
            "goal_label": planet.goal_label,
            "user_description": planet.user_description,
            "category": planet.category,
        },
        "current_axes": {axis: round_float(current_axes[axis]) for axis in CANONICAL_AXES},
        "target_axes": {axis: round_float(target_axes[axis]) for axis in CANONICAL_AXES},
        "delta_axes": delta_axes,
        "change_priority": ordered_axes,
        "transition_mode": mode,
        "intervention_direction": direction,
        "transition_intensity": round_float(intensity, 3),
        "recommended_duration_sec": total_duration_sec,
        "transition_reliability": transition_reliability,
        "phases": phases,
        "notes": [
            f"primary_axis={ordered_axes[0]}",
            f"mode={mode}",
            f"quality_score={round_float(quality_score, 3)}",
            f"duration_delta_sec={duration_delta_sec}",
            f"intent_tags={','.join(intent_context.get('intent_tags', [])) if isinstance(intent_context.get('intent_tags'), list) else ''}",
        ],
    }
