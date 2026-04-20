from __future__ import annotations

from functools import lru_cache
from math import ceil
import os
from typing import Any

from ..common import clamp, round_float
from ..integrations.ace_step import DEFAULT_ACE_STEP_BASE_URL, DEFAULT_ACE_STEP_HEALTHCHECK_URL
from .planet_profiles import PlanetProfile

ACE_STEP_MIN_DURATION_SEC = 10
ACE_STEP_MAX_DURATION_SEC = 600
ACE_STEP_MAX_BATCH_SIZE = 4


def _ace_request_duration_cap_sec() -> int:
    override = os.getenv("NOOS_ACE_STEP_REQUEST_DURATION_CAP_SEC", "").strip()
    if override:
        try:
            return max(ACE_STEP_MIN_DURATION_SEC, min(int(override), ACE_STEP_MAX_DURATION_SEC))
        except ValueError:
            pass

    if hasattr(os, "uname"):
        uname = os.uname()
        if uname.sysname == "Darwin" and uname.machine == "arm64":
            return 30

    return 120


@lru_cache(maxsize=1)
def _system_memory_gb() -> float:
    try:
        if hasattr(os, "sysconf"):
            if "SC_PAGE_SIZE" in os.sysconf_names and "SC_PHYS_PAGES" in os.sysconf_names:
                page_size = os.sysconf("SC_PAGE_SIZE")
                pages = os.sysconf("SC_PHYS_PAGES")
                return (page_size * pages) / (1024 ** 3)
    except (ValueError, OSError):
        pass
    return 16.0


def _ace_prompt(planet: PlanetProfile, plan: dict[str, Any], spec: dict[str, Any]) -> str:
    instruments = ", ".join(spec["primary_instruments"])
    styles = ", ".join(spec["style_tags"])
    focus_axis = plan["change_priority"][0]
    return (
        f"Instrumental only. {planet.title} environment for NOOS. "
        f"Goal state: {planet.goal_label}. "
        f"Category: {planet.category}. "
        f"Use {styles}. "
        f"Primary instruments: {instruments}. "
        f"Tempo around {spec['bpm_target']} BPM, key {spec['key_scale']}, time signature {spec['time_signature']}/4. "
        f"Energy {round_float(spec['energy'])}, rhythmic density {round_float(spec['rhythmic_density'])}, "
        f"spectral brightness {round_float(spec['spectral_brightness'])}, harmonic tension {round_float(spec['harmonic_tension'])}, "
        f"repetition {round_float(spec['repetition'])}, texture density {round_float(spec['texture_density'])}. "
        f"Transition mode: {plan['transition_mode']}. "
        f"Prioritize adjustment on {focus_axis}. "
        "No vocals, no lyrics, no abrupt transitions, no comedic effects, no EDM drop."
    )


def _ace_negative_prompt(spec: dict[str, Any]) -> str:
    avoided = ", ".join(spec["avoid_elements"])
    return (
        "vocal lead, spoken word, rap, crowd noise, jump scare, glitch burst, harsh cymbal wash, "
        f"{avoided}"
    )


def _build_render_plan(total_duration_sec: int) -> dict[str, Any]:
    bounded_total = max(ACE_STEP_MIN_DURATION_SEC, int(total_duration_sec))
    segment_count = max(1, ceil(bounded_total / ACE_STEP_MAX_DURATION_SEC))
    request_duration_cap_sec = _ace_request_duration_cap_sec()
    segments = []
    remaining = bounded_total
    start_sec = 0
    for index in range(segment_count):
        segment_duration = min(ACE_STEP_MAX_DURATION_SEC, remaining)
        segment_end = start_sec + segment_duration
        segments.append(
            {
                "index": index + 1,
                "start_sec": start_sec,
                "end_sec": segment_end,
                "duration_sec": segment_duration,
            }
        )
        remaining -= segment_duration
        start_sec = segment_end

    return {
        "mode": "single_pass" if segment_count == 1 else "segmented_render",
        "ace_step_max_duration_sec": ACE_STEP_MAX_DURATION_SEC,
        "segment_count": segment_count,
        "target_total_duration_sec": bounded_total,
        "request_duration_sec": min(segments[0]["duration_sec"], request_duration_cap_sec),
        "request_duration_cap_sec": request_duration_cap_sec,
        "crossfade_sec": 8 if segment_count > 1 else 0,
        "segments": segments,
    }


def _build_ace_step_requests(spec: dict[str, Any], prompt: str, negative_prompt: str, memory_gb: float) -> dict[str, Any]:
    render_plan = spec["render_plan"]
    default_request = {
        "model": "acestep-v15-turbo",
        "prompt": prompt,
        "lyrics": "",
        "thinking": False,
        "audio_format": "mp3",
        "bpm": int(spec["bpm_target"]),
        "key_scale": spec["key_scale"],
        "time_signature": spec["time_signature"],
        "audio_duration": int(render_plan["request_duration_sec"]),
        "task_type": "text2music",
        "inference_steps": 8,
        "batch_size": min(int(spec["candidate_count"]), ACE_STEP_MAX_BATCH_SIZE),
        "use_random_seed": True,
        "seed": -1,
        "vocal_language": "en",
        "negative_prompt": negative_prompt,
    }

    enhanced_request = dict(default_request)
    enhanced_request.update(
        {
            "thinking": memory_gb >= 16.0,
            "lm_model_path": "acestep-5Hz-lm-0.6B" if memory_gb >= 16.0 else None,
            "use_cot_caption": True,
            "use_cot_language": False,
            "constrained_decoding": True,
        }
    )

    if enhanced_request["lm_model_path"] is None:
        enhanced_request.pop("lm_model_path")

    return {
        "default_request": default_request,
        "enhanced_request": enhanced_request,
        "recommended_model": default_request["model"],
        "recommended_lm_model": "acestep-5Hz-lm-0.6B" if memory_gb >= 16.0 else None,
        "healthcheck_url": DEFAULT_ACE_STEP_HEALTHCHECK_URL,
        "api_base_url": DEFAULT_ACE_STEP_BASE_URL,
    }


def build_music_spec(
    planet: PlanetProfile,
    plan: dict[str, Any],
    candidate_count_override: int | None = None,
    feedback_profile: dict[str, Any] | None = None,
    intent_context: dict[str, Any] | None = None,
) -> dict[str, Any]:
    defaults = planet.music_defaults
    current = plan["current_axes"]
    target = plan["target_axes"]
    intensity = float(plan["transition_intensity"])
    feedback_profile = feedback_profile or {}
    intent_context = intent_context or {}
    music_adjustments = feedback_profile.get("music_adjustments") if isinstance(feedback_profile, dict) else {}
    if not isinstance(music_adjustments, dict):
        music_adjustments = {}
    intent_tags = intent_context.get("intent_tags") if isinstance(intent_context.get("intent_tags"), list) else []

    bpm_target = float(defaults["bpm_target"])
    energy = float(defaults["energy"])
    rhythmic_density = float(defaults["rhythmic_density"])
    spectral_brightness = float(defaults["spectral_brightness"])
    harmonic_tension = float(defaults["harmonic_tension"])
    repetition = float(defaults["repetition"])
    texture_density = float(defaults["texture_density"])
    dynamic_range = float(defaults["dynamic_range"])
    attack_softness = float(defaults["attack_softness"])

    if current["stress_load"] >= 0.70:
        bpm_target -= 4
        spectral_brightness -= 0.08
        harmonic_tension -= 0.08
        dynamic_range -= 0.04
        attack_softness += 0.10

    if current["fatigue_risk"] >= 0.65 and target["focus_readiness"] >= 0.65:
        bpm_target += 4
        energy += 0.06
        rhythmic_density += 0.04

    if planet.slug == "pluto":
        energy -= 0.03
        rhythmic_density -= 0.03
        spectral_brightness -= 0.03
        repetition += 0.04

    if plan["transition_mode"] in {"stabilize_then_downshift", "downshift_and_restore"}:
        harmonic_tension -= 0.04
        texture_density -= 0.03
    elif plan["transition_mode"] in {"activate_and_narrow", "stabilize_then_activate"}:
        energy += 0.05
        rhythmic_density += 0.03

    bpm_target += float(music_adjustments.get("tempo_delta") or 0)
    energy += float(music_adjustments.get("energy_delta") or 0)
    rhythmic_density += float(music_adjustments.get("density_delta") or 0)
    spectral_brightness += float(music_adjustments.get("brightness_delta") or 0)
    harmonic_tension += float(music_adjustments.get("tension_delta") or 0)
    texture_density += float(music_adjustments.get("texture_delta") or 0)

    if "deep_work" in intent_tags:
        repetition += 0.04
        texture_density -= 0.02
    if "creative" in intent_tags:
        harmonic_tension += 0.03
        spectral_brightness += 0.03
    if "recovery" in intent_tags:
        bpm_target -= 3
        attack_softness += 0.06
    if "execution" in intent_tags:
        bpm_target += 4
        energy += 0.05

    if candidate_count_override is not None:
        candidate_count = max(1, min(int(candidate_count_override), ACE_STEP_MAX_BATCH_SIZE))
    else:
        candidate_count = 5 if intensity >= 0.22 else 4
    memory_gb = _system_memory_gb()
    render_plan = _build_render_plan(int(plan["recommended_duration_sec"]))

    spec = {
        "engine": "noos-music-spec-v1",
        "mode": "instrumental_only",
        "planet": planet.slug,
        "goal_label": planet.goal_label,
        "duration_sec": int(plan["recommended_duration_sec"]),
        "render_plan": render_plan,
        "bpm_target": int(round(bpm_target)),
        "bpm_range": [int(defaults["bpm_min"]), int(defaults["bpm_max"])],
        "key_scale": str(defaults["key_scale"]),
        "time_signature": str(defaults["time_signature"]),
        "energy": round_float(clamp(energy)),
        "rhythmic_density": round_float(clamp(rhythmic_density)),
        "spectral_brightness": round_float(clamp(spectral_brightness)),
        "harmonic_tension": round_float(clamp(harmonic_tension)),
        "repetition": round_float(clamp(repetition)),
        "texture_density": round_float(clamp(texture_density)),
        "dynamic_range": round_float(clamp(dynamic_range)),
        "attack_softness": round_float(clamp(attack_softness)),
        "candidate_count": candidate_count,
        "primary_instruments": list(defaults["instruments"]),
        "avoid_elements": list(defaults["avoid"]),
        "style_tags": [
            planet.category.replace("-", " "),
            "therapeutic ambient",
            "non-vocal",
            "state-guided",
            f"transition mode {plan['transition_mode'].replace('_', ' ')}",
        ],
        "phase_structure": [
            {
                "name": phase["name"],
                "duration_sec": phase["duration_sec"],
                "energy_bias": max(0.0, max(phase["emphasis"].values()) if phase["emphasis"] else 0.0),
            }
            for phase in plan["phases"]
        ],
        "ranking_rules": {
            "prefer_low_abruptness": True,
            "prefer_stable_loudness": True,
            "prefer_prompt_alignment": True,
            "reject_vocals": True,
        },
        "notes": [
            f"system_memory_gb={round_float(memory_gb, 1)}",
            f"transition_mode={plan['transition_mode']}",
            f"candidate_count={min(candidate_count, ACE_STEP_MAX_BATCH_SIZE)}",
            f"render_mode={render_plan['mode']}",
            f"intent_tags={','.join(intent_tags)}",
        ],
    }

    prompt = _ace_prompt(planet, plan, spec)
    negative_prompt = _ace_negative_prompt(spec)
    spec["ace_step"] = {
        "prompt": prompt,
        "negative_prompt": negative_prompt,
        **_build_ace_step_requests(spec, prompt, negative_prompt, memory_gb),
    }
    return spec
