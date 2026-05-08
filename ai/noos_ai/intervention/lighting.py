from __future__ import annotations

from typing import Any

from ..common import clamp, round_float
from .lighting_hardware import build_hardware_handoff
from .lighting_research import (
    get_lighting_citation,
    get_lighting_pattern,
    get_lighting_program,
    get_planet_tone_profile,
)
from .planet_profiles import PlanetProfile


def _phase_adjustment(name: str) -> tuple[int, int, float]:
    if name in {"decompress", "recover", "restore"}:
        return -2, -80, 0.92
    if name in {"stabilize", "deepen", "narrow", "maintain"}:
        return 0, -40, 0.85
    if name in {"ignite", "activate", "focus_ramp"}:
        return 4, 180, 1.08
    return 0, 0, 1.0

def _phase_scene(
    planet: PlanetProfile,
    plan: dict[str, Any],
    phase: dict[str, Any],
    feedback_profile: dict[str, Any],
    intent_context: dict[str, Any],
) -> dict[str, Any]:
    program = get_lighting_program(planet.slug)
    scene = dict(program.baseline_scene)
    scene.update(program.phase_overrides.get(phase["name"], {}))
    current = plan["current_axes"]
    target = plan["target_axes"]

    brightness_delta, cct_delta, motion_multiplier = _phase_adjustment(phase["name"])
    brightness = int(scene["brightness_percent"]) + brightness_delta
    cct_kelvin = int(scene["cct_kelvin"]) + cct_delta
    lux_target = int(scene["illuminance_lux_target"])
    motion = float(scene["motion_intensity"]) * motion_multiplier

    if current["stress_load"] >= 0.70:
        brightness -= 6
        cct_kelvin -= 180
        lux_target -= 60
        motion *= 0.75

    if current["fatigue_risk"] >= 0.65 and target["focus_readiness"] >= 0.65 and phase["name"] in {"ignite", "activate", "focus_ramp", "narrow"}:
        brightness += 5
        cct_kelvin += 220
        lux_target += 90
        motion *= 1.08

    if plan["transition_mode"] == "downshift_and_restore" and phase["name"] in {"restore", "recover"}:
        cct_kelvin -= 120
        brightness -= 2
        lux_target -= 20

    if planet.slug == "pluto" and phase["name"] == "decompress":
        brightness = min(brightness, 20)
        lux_target = min(lux_target, 100)

    lighting_adjustments = feedback_profile.get("lighting_adjustments") if isinstance(feedback_profile, dict) else {}
    if not isinstance(lighting_adjustments, dict):
        lighting_adjustments = {}
    brightness += int(lighting_adjustments.get("brightness_delta") or 0)
    cct_kelvin += int(lighting_adjustments.get("cct_delta") or 0)
    lux_target += int(lighting_adjustments.get("lux_delta") or 0)
    motion += float(lighting_adjustments.get("motion_delta") or 0)

    intent_tags = intent_context.get("intent_tags") if isinstance(intent_context.get("intent_tags"), list) else []
    if "creative" in intent_tags:
        motion += 0.02
    if "deep_work" in intent_tags:
        motion -= 0.03
    if "recovery" in intent_tags:
        brightness -= 4
        cct_kelvin -= 120

    cct_kelvin = int(clamp(cct_kelvin, 2400, 6500))
    lux_target = int(clamp(lux_target, 60, 1000))
    brightness = int(clamp(brightness, 10, 88))
    motion = round_float(clamp(motion, 0.0, 0.35))

    pattern = get_lighting_pattern(str(scene["pattern"]))
    pattern_citations = tuple(pattern.evidence_keys)
    evidence_keys = tuple(dict.fromkeys(tuple(scene.get("evidence_keys") or ()) + pattern_citations + program.direct_evidence_keys))
    citation_list = [get_lighting_citation(key) for key in evidence_keys]
    planet_tones = get_planet_tone_profile(planet.slug)
    primary_mode = str(planet_tones.get("primary_mode") or "cct")
    primary_cct_kelvin = int(planet_tones.get("primary_cct_kelvin") or cct_kelvin)

    return {
        "name": phase["name"],
        "label": scene.get("label") or phase["name"].replace("_", " ").title(),
        "duration_sec": phase["duration_sec"],
        "primary_hex": planet_tones["primary_hex"],
        "primary_mode": primary_mode,
        "primary_cct_kelvin": primary_cct_kelvin,
        "secondary_hex": planet_tones["secondary_hex"],
        "accent_hex": scene["accent_hex"],
        "brightness_percent": brightness,
        "cct_kelvin": cct_kelvin,
        "illuminance_lux_target": lux_target,
        "animation_pattern": pattern.slug,
        "motion_intensity": motion,
        "pulse_bpm": round_float(pattern.cadence_bpm),
        "transition_sec": int(pattern.transition_sec),
        "pattern_details": {
            "label": pattern.label,
            "description": pattern.description,
            "evidence_tier": pattern.evidence_tier,
            "waveform": pattern.waveform,
            "cycle_sec": pattern.cycle_sec,
            "cadence_bpm": round_float(pattern.cadence_bpm),
            "amplitude_percent": pattern.amplitude_percent,
        },
        "research_anchor": program.research_anchor,
        "evidence_keys": list(evidence_keys),
        "evidence_titles": [citation.title for citation in citation_list],
    }


def build_lighting_spec(
    planet: PlanetProfile,
    plan: dict[str, Any],
    feedback_profile: dict[str, Any] | None = None,
    intent_context: dict[str, Any] | None = None,
) -> dict[str, Any]:
    program = get_lighting_program(planet.slug)
    feedback_profile = feedback_profile or {}
    intent_context = intent_context or {}
    phases = [_phase_scene(planet, plan, phase, feedback_profile, intent_context) for phase in plan["phases"]]
    final_scene = phases[-1] if phases else {}

    direct_citations = [get_lighting_citation(key) for key in program.direct_evidence_keys]
    inferred_citations = [get_lighting_citation(key) for key in program.inferred_evidence_keys]

    return {
        "engine": "noos-lighting-spec-v2",
        "program": {
            "slug": program.slug,
            "label": program.label,
            "intent": program.intent,
            "research_anchor": program.research_anchor,
        },
        "global_intent": plan["intervention_direction"],
        "device_profile": "cct-plus-rgb",
        "phases": phases,
        "final_scene": final_scene,
        "research_basis": {
            "direct_evidence": [
                {
                    "slug": citation.slug,
                    "title": citation.title,
                    "url": citation.url,
                    "finding": citation.finding,
                }
                for citation in direct_citations
            ],
            "inferred_pattern_evidence": [
                {
                    "slug": citation.slug,
                    "title": citation.title,
                    "url": citation.url,
                    "finding": citation.finding,
                }
                for citation in inferred_citations
            ],
            "limits": [
                "CCT and illuminance anchors are directly literature-backed; temporal patterning is weaker and explicitly labeled as inferred where applicable.",
                "RGB output can approximate the target scene, but exact melanopic/photopic delivery still depends on fixture spectrum and room geometry.",
            ],
        },
        "safety_limits": {
            "max_brightness_percent": 88,
            "min_brightness_percent": 10,
            "max_cct_kelvin": 6500,
            "min_cct_kelvin": 2400,
            "rapid_flash_allowed": False,
            "recommended_max_pattern_hz": 0.2,
        },
        "hardware_handoff": build_hardware_handoff(phases, final_scene),
        "adaptation_hooks": {
            "stress_spike": {
                "brightness_delta": -8,
                "motion_multiplier": 0.72,
                "cct_delta": -220,
                "lux_delta": -70,
            },
            "fatigue_spike_during_focus": {
                "brightness_delta": 5,
                "cct_delta": 220,
                "lux_delta": 90,
            },
            "overactivation": {
                "brightness_delta": -6,
                "motion_multiplier": 0.75,
                "cct_delta": -180,
                "lux_delta": -50,
            },
        },
        "notes": [
            f"planet={planet.slug}",
            f"lighting_program={program.label}",
            f"primary_delta_axis={plan['change_priority'][0]}",
            "tone_lock=planet_primary_secondary",
            "hardware transport intentionally deferred; schema is ready for device integration.",
            f"intent_tags={','.join(intent_context.get('intent_tags', [])) if isinstance(intent_context.get('intent_tags'), list) else ''}",
        ],
    }
