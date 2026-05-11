from __future__ import annotations

from typing import Any

from .lighting_research import hex_to_rgb_tuple


def _rgb_object(hex_value: str) -> dict[str, int]:
    red, green, blue = hex_to_rgb_tuple(hex_value)
    return {
        "r": red,
        "g": green,
        "b": blue,
    }


def build_hardware_handoff(phases: list[dict[str, Any]], final_scene: dict[str, Any]) -> dict[str, Any]:
    sequence = []
    for index, phase in enumerate(phases, start=1):
        pattern = phase.get("pattern_details") or {}
        sequence.append(
            {
                "scene_index": index,
                "scene_name": phase["name"],
                "duration_ms": int(phase["duration_sec"]) * 1000,
                "transition_ms": int(phase["transition_sec"]) * 1000,
                "channels": {
                    "primary_mode": phase.get("primary_mode", "cct"),
                    "primary_rgb": _rgb_object(phase["primary_hex"]),
                    "primary_cct_kelvin": int(phase.get("primary_cct_kelvin") or phase["cct_kelvin"]),
                    "secondary_rgb": _rgb_object(phase["secondary_hex"]),
                    "accent_rgb": _rgb_object(phase["accent_hex"]),
                },
                "white_reference": {
                    "cct_kelvin": int(phase["cct_kelvin"]),
                    "illuminance_lux_target": int(phase["illuminance_lux_target"]),
                },
                "dimming": {
                    "brightness_percent": int(phase["brightness_percent"]),
                },
                "animation": {
                    "pattern": phase["animation_pattern"],
                    "waveform": pattern.get("waveform"),
                    "cadence_bpm": pattern.get("cadence_bpm"),
                    "cycle_sec": pattern.get("cycle_sec"),
                    "amplitude_percent": pattern.get("amplitude_percent"),
                    "motion_intensity": phase["motion_intensity"],
                    "evidence_tier": pattern.get("evidence_tier"),
                },
                "research_anchor": phase["research_anchor"],
                "evidence_keys": list(phase.get("evidence_keys") or []),
            }
        )

    return {
        "protocol": "noos-lighting-handoff-v1",
        "device_profile": "cct-plus-rgb",
        "transport": {
            "implemented": False,
            "reserved_adapters": ["http", "mqtt", "serial", "wled"],
        },
        "sequence": sequence,
        "final_hold": {
            "scene_name": final_scene.get("name"),
            "brightness_percent": final_scene.get("brightness_percent"),
            "primary_mode": final_scene.get("primary_mode", "cct"),
            "primary_rgb": _rgb_object(str(final_scene.get("primary_hex", "#000000"))),
            "primary_cct_kelvin": int(final_scene.get("primary_cct_kelvin") or final_scene.get("cct_kelvin") or 0),
            "pattern": final_scene.get("animation_pattern"),
        },
        "notes": [
            "Handoff schema is implemented, but no physical device transport is attached yet.",
            "Each scene carries both RGB values and the research anchor CCT/lux target for calibration.",
        ],
    }
