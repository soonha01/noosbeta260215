from __future__ import annotations

from dataclasses import dataclass
import math
from typing import Any


@dataclass(frozen=True, slots=True)
class LightingCitation:
    slug: str
    title: str
    url: str
    finding: str


@dataclass(frozen=True, slots=True)
class LightingPattern:
    slug: str
    label: str
    description: str
    evidence_tier: str
    waveform: str
    cycle_sec: float
    cadence_bpm: float
    amplitude_percent: int
    transition_sec: int
    evidence_keys: tuple[str, ...] = ()


@dataclass(frozen=True, slots=True)
class LightingProgram:
    slug: str
    label: str
    intent: str
    research_anchor: str
    direct_evidence_keys: tuple[str, ...]
    inferred_evidence_keys: tuple[str, ...]
    baseline_scene: dict[str, Any]
    phase_overrides: dict[str, dict[str, Any]]


def _clamp_channel(value: float) -> int:
    return max(0, min(255, int(round(value))))


def kelvin_to_rgb_tuple(kelvin: int) -> tuple[int, int, int]:
    temperature = max(1000, min(40000, int(kelvin))) / 100.0

    if temperature <= 66:
        red = 255
        green = 99.4708025861 * math.log(max(temperature, 1.0)) - 161.1195681661
        if temperature <= 19:
            blue = 0
        else:
            blue = 138.5177312231 * math.log(temperature - 10.0) - 305.0447927307
    else:
        red = 329.698727446 * ((temperature - 60.0) ** -0.1332047592)
        green = 288.1221695283 * ((temperature - 60.0) ** -0.0755148492)
        blue = 255

    return (
        _clamp_channel(red),
        _clamp_channel(green),
        _clamp_channel(blue),
    )


def rgb_tuple_to_hex(rgb: tuple[int, int, int]) -> str:
    return "#{:02x}{:02x}{:02x}".format(*rgb)


def hex_to_rgb_tuple(hex_value: str) -> tuple[int, int, int]:
    stripped = str(hex_value or "").strip().lstrip("#")
    if len(stripped) != 6:
        raise ValueError(f"invalid hex value: {hex_value}")
    return (
        int(stripped[0:2], 16),
        int(stripped[2:4], 16),
        int(stripped[4:6], 16),
    )


def blend_hex(base_hex: str, mix_hex: str, ratio: float) -> str:
    base = hex_to_rgb_tuple(base_hex)
    mix = hex_to_rgb_tuple(mix_hex)
    alpha = max(0.0, min(1.0, float(ratio)))
    blended = tuple(
        _clamp_channel((base[index] * (1.0 - alpha)) + (mix[index] * alpha))
        for index in range(3)
    )
    return rgb_tuple_to_hex(blended)


def _scene(
    *,
    cct_kelvin: int,
    lux_anchor: int,
    brightness_percent: int,
    secondary_hex: str,
    accent_hex: str,
    pattern: str,
    motion_intensity: float,
    pulse_bpm: float,
    theme_mix_hex: str | None = None,
    theme_mix_ratio: float = 0.0,
    evidence_keys: tuple[str, ...] = (),
    label: str | None = None,
) -> dict[str, Any]:
    primary_hex = rgb_tuple_to_hex(kelvin_to_rgb_tuple(cct_kelvin))
    if theme_mix_hex:
        primary_hex = blend_hex(primary_hex, theme_mix_hex, theme_mix_ratio)
    return {
        "label": label,
        "primary_hex": primary_hex,
        "secondary_hex": secondary_hex,
        "accent_hex": accent_hex,
        "brightness_percent": brightness_percent,
        "cct_kelvin": cct_kelvin,
        "illuminance_lux_target": lux_anchor,
        "pattern": pattern,
        "motion_intensity": motion_intensity,
        "pulse_bpm": pulse_bpm,
        "theme_mix_hex": theme_mix_hex,
        "theme_mix_ratio": theme_mix_ratio,
        "evidence_keys": evidence_keys,
    }


LIGHTING_CITATIONS: dict[str, LightingCitation] = {
    "zhou_2021": LightingCitation(
        slug="zhou_2021",
        title="Does Bright Light Counteract the Post-lunch Dip in Subjective States and Cognitive Performance Among Undergraduate Students?",
        url="https://pubmed.ncbi.nlm.nih.gov/34164367/",
        finding="1000 lx, 6500 K blue-enriched bright light improved sleepiness, negative mood, and working-memory performance compared with 100 lx, 4000 K normal light.",
    ),
    "bao_2021": LightingCitation(
        slug="bao_2021",
        title="Effect of lighting illuminance and colour temperature on mental workload in an office setting",
        url="https://www.nature.com/articles/s41598-021-94795-0",
        finding="Across 3000-6500 K and 300-1000 lx, 3000 K with 750 lx produced the lowest measured mental workload, while 6500 K with higher illuminance shortened response time.",
    ),
    "ishii_2015": LightingCitation(
        slug="ishii_2015",
        title="Effect of Light Color Temperature on Human Concentration and Creativity",
        url="https://pubmed.ncbi.nlm.nih.gov/26098084/",
        finding="At 1000 lux, creativity was better under 3000 K while concentration was best under 6000 K.",
    ),
    "choi_2014": LightingCitation(
        slug="choi_2014",
        title="Effects of Color Temperature and Brightness on Electroencephalogram Alpha Activity in a Polychromatic Light-emitting Diode",
        url="https://pmc.ncbi.nlm.nih.gov/articles/PMC3897760/",
        finding="Participants felt more relaxed in warm color temperature conditions, while cool high-light and warm low-light pairings were perceived as more pleasing than mismatched combinations.",
    ),
    "mdpi_cct_productivity": LightingCitation(
        slug="mdpi_cct_productivity",
        title="Effect of Color Temperature and Illuminance on Psychology, Physiology, and Productivity: An Experimental Study",
        url="https://www.mdpi.com/1685704",
        finding="Warm 3000 K at about 590 lux was the most comfortable and relaxed; after self-adjustment, participants preferred intermediate CCT around 4200 K and bright illumination around 500 lux.",
    ),
    "castillo_2017": LightingCitation(
        slug="castillo_2017",
        title="Blue lighting accelerates post-stress relaxation: Results of a preliminary study",
        url="https://pmc.ncbi.nlm.nih.gov/articles/PMC5648169/",
        finding="Blue lighting accelerated objective post-stress relaxation compared with conventional white light, with the strongest benefit in the first roughly 1-5 minutes.",
    ),
    "laborde_2021": LightingCitation(
        slug="laborde_2021",
        title="Integrating Breathing Techniques Into Psychotherapy to Improve HRV: Which Approach Is Best?",
        url="https://pubmed.ncbi.nlm.nih.gov/33658964/",
        finding="Breathing at about 6 breaths per minute using a pacer increased HRV-related regulation more than a passive control condition.",
    ),
}


LIGHTING_PATTERNS: dict[str, LightingPattern] = {
    "focus-static": LightingPattern(
        slug="focus-static",
        label="Static Focus Hold",
        description="Temporal variation is intentionally minimized to avoid distraction during sustained work.",
        evidence_tier="direct_values",
        waveform="static",
        cycle_sec=0.0,
        cadence_bpm=0.0,
        amplitude_percent=0,
        transition_sec=8,
    ),
    "ignite-ramp": LightingPattern(
        slug="ignite-ramp",
        label="Cool Ramp",
        description="A short cool-bright ramp helps reduce task-entry friction before settling into work light.",
        evidence_tier="inferred",
        waveform="asymmetric_ramp",
        cycle_sec=90.0,
        cadence_bpm=0.67,
        amplitude_percent=8,
        transition_sec=6,
    ),
    "warm-bloom": LightingPattern(
        slug="warm-bloom",
        label="Warm Bloom",
        description="Slow warmth-preserving blooming pattern intended to keep the scene expressive without adding sharp transients.",
        evidence_tier="inferred",
        waveform="sine",
        cycle_sec=180.0,
        cadence_bpm=0.33,
        amplitude_percent=6,
        transition_sec=10,
    ),
    "steady-balance": LightingPattern(
        slug="steady-balance",
        label="Balanced Hold",
        description="Nearly static neutral light intended for long-duration comfort and sustained attention.",
        evidence_tier="direct_values",
        waveform="static",
        cycle_sec=0.0,
        cadence_bpm=0.0,
        amplitude_percent=0,
        transition_sec=8,
    ),
    "command-wave": LightingPattern(
        slug="command-wave",
        label="Command Wave",
        description="Slow low-amplitude wave to preserve presence and momentum without introducing aggressive pulsing.",
        evidence_tier="inferred",
        waveform="sine",
        cycle_sec=150.0,
        cadence_bpm=0.4,
        amplitude_percent=7,
        transition_sec=8,
    ),
    "contrast-drift": LightingPattern(
        slug="contrast-drift",
        label="Contrast Drift",
        description="A slow warm-cool drift used to support perspective shifts in creative states.",
        evidence_tier="inferred",
        waveform="triangle",
        cycle_sec=120.0,
        cadence_bpm=0.5,
        amplitude_percent=9,
        transition_sec=8,
    ),
    "resonance-breath": LightingPattern(
        slug="resonance-breath",
        label="Resonance Breath",
        description="Breath-synced expansion/contraction around 6 breaths per minute, used only for low-motion calming scenes.",
        evidence_tier="inferred",
        waveform="breath",
        cycle_sec=10.0,
        cadence_bpm=6.0,
        amplitude_percent=12,
        transition_sec=4,
        evidence_keys=("laborde_2021",),
    ),
}


LIGHTING_PROGRAMS: dict[str, LightingProgram] = {
    "mercury": LightingProgram(
        slug="mercury",
        label="Ignition Focus Lighting",
        intent="Short cool-bright ramp for task entry, then hold a still focus scene.",
        research_anchor="6500 K class cool-bright light for alerting; concentration favors colder light while static hold limits distraction.",
        direct_evidence_keys=("zhou_2021", "ishii_2015", "bao_2021"),
        inferred_evidence_keys=(),
        baseline_scene=_scene(
            cct_kelvin=6200,
            lux_anchor=850,
            brightness_percent=72,
            secondary_hex="#ffb34d",
            accent_hex="#ffe28e",
            pattern="ignite-ramp",
            motion_intensity=0.20,
            pulse_bpm=1.0,
            theme_mix_hex="#ffd36b",
            theme_mix_ratio=0.16,
            label="Ignition hold",
        ),
        phase_overrides={
            "ignite": _scene(
                cct_kelvin=6500,
                lux_anchor=1000,
                brightness_percent=78,
                secondary_hex="#ffb34d",
                accent_hex="#fff1c6",
                pattern="ignite-ramp",
                motion_intensity=0.24,
                pulse_bpm=1.0,
                theme_mix_hex="#ffd36b",
                theme_mix_ratio=0.12,
                label="Entry ramp",
            ),
            "narrow": _scene(
                cct_kelvin=5800,
                lux_anchor=700,
                brightness_percent=64,
                secondary_hex="#ffc46d",
                accent_hex="#fff3d2",
                pattern="focus-static",
                motion_intensity=0.0,
                pulse_bpm=0.0,
                theme_mix_hex="#ffcf72",
                theme_mix_ratio=0.1,
                label="Focus hold",
            ),
        },
    ),
    "venus": LightingProgram(
        slug="venus",
        label="Warm Creativity Lighting",
        intent="Warm, comfortable light with enough brightness to keep ideation awake without pushing arousal too high.",
        research_anchor="Creativity improved under 3000 K; comfort and relaxation were strongest around 3000 K with roughly 590 lx.",
        direct_evidence_keys=("ishii_2015", "mdpi_cct_productivity", "choi_2014"),
        inferred_evidence_keys=(),
        baseline_scene=_scene(
            cct_kelvin=3000,
            lux_anchor=590,
            brightness_percent=56,
            secondary_hex="#ffb8c8",
            accent_hex="#ffd7a8",
            pattern="warm-bloom",
            motion_intensity=0.10,
            pulse_bpm=0.33,
            theme_mix_hex="#ffcabd",
            theme_mix_ratio=0.18,
            label="Creative warm field",
        ),
        phase_overrides={},
    ),
    "earth": LightingProgram(
        slug="earth",
        label="Balanced Sustain Lighting",
        intent="Neutral-bright comfort lighting for long sessions without the harsher feel of high-CCT activation scenes.",
        research_anchor="Intermediate CCT around 4200 K and bright 500 lx were preferred after self-adjustment for productive work.",
        direct_evidence_keys=("mdpi_cct_productivity", "bao_2021"),
        inferred_evidence_keys=(),
        baseline_scene=_scene(
            cct_kelvin=4200,
            lux_anchor=500,
            brightness_percent=58,
            secondary_hex="#8fe3c2",
            accent_hex="#8db5ff",
            pattern="steady-balance",
            motion_intensity=0.0,
            pulse_bpm=0.0,
            theme_mix_hex="#8fe3c2",
            theme_mix_ratio=0.1,
            label="Balanced focus field",
        ),
        phase_overrides={},
    ),
    "mars": LightingProgram(
        slug="mars",
        label="Action Drive Lighting",
        intent="High-activation, cool-bright scene for decisive action and execution bursts.",
        research_anchor="1000 lx at 6500 K improved post-lunch alertness and working-memory performance relative to dimmer normal office light.",
        direct_evidence_keys=("zhou_2021", "ishii_2015", "bao_2021"),
        inferred_evidence_keys=(),
        baseline_scene=_scene(
            cct_kelvin=6500,
            lux_anchor=1000,
            brightness_percent=82,
            secondary_hex="#ff7459",
            accent_hex="#ffc08a",
            pattern="ignite-ramp",
            motion_intensity=0.24,
            pulse_bpm=1.0,
            theme_mix_hex="#ff9e78",
            theme_mix_ratio=0.14,
            label="Execution field",
        ),
        phase_overrides={
            "activate": _scene(
                cct_kelvin=6500,
                lux_anchor=1000,
                brightness_percent=84,
                secondary_hex="#ff7459",
                accent_hex="#ffd8ad",
                pattern="ignite-ramp",
                motion_intensity=0.28,
                pulse_bpm=1.0,
                theme_mix_hex="#ff8e69",
                theme_mix_ratio=0.16,
                label="Action push",
            ),
        },
    ),
    "jupiter": LightingProgram(
        slug="jupiter",
        label="Strategic Presence Lighting",
        intent="A cooler, moderately bright scene that supports alert composure rather than all-out activation.",
        research_anchor="Combines cool-light alerting findings with the intermediate-CCT productivity preference literature to avoid over-harshness.",
        direct_evidence_keys=("zhou_2021", "bao_2021", "mdpi_cct_productivity"),
        inferred_evidence_keys=(),
        baseline_scene=_scene(
            cct_kelvin=5000,
            lux_anchor=650,
            brightness_percent=66,
            secondary_hex="#f0c46a",
            accent_hex="#d7b0ff",
            pattern="command-wave",
            motion_intensity=0.10,
            pulse_bpm=0.4,
            theme_mix_hex="#e1c18b",
            theme_mix_ratio=0.12,
            label="Strategic field",
        ),
        phase_overrides={},
    ),
    "saturn": LightingProgram(
        slug="saturn",
        label="Deliberate Thinking Lighting",
        intent="Warm, cognitively light scene for longer analytical or reflective work.",
        research_anchor="3000 K with 750 lx produced the lowest measured mental workload in the office EEG study.",
        direct_evidence_keys=("bao_2021", "choi_2014"),
        inferred_evidence_keys=(),
        baseline_scene=_scene(
            cct_kelvin=3000,
            lux_anchor=750,
            brightness_percent=62,
            secondary_hex="#c9d0ff",
            accent_hex="#f0debd",
            pattern="focus-static",
            motion_intensity=0.0,
            pulse_bpm=0.0,
            theme_mix_hex="#e1c7a6",
            theme_mix_ratio=0.12,
            label="Low-workload reasoning field",
        ),
        phase_overrides={},
    ),
    "uranus": LightingProgram(
        slug="uranus",
        label="Perspective Shift Lighting",
        intent="Warm creative base with a subtle cool accent drift for deliberate perspective changes.",
        research_anchor="Warm light favors creativity; the cool accent drift is an explicit lower-evidence stylistic inference, not a direct lighting claim.",
        direct_evidence_keys=("ishii_2015", "mdpi_cct_productivity"),
        inferred_evidence_keys=("laborde_2021",),
        baseline_scene=_scene(
            cct_kelvin=3200,
            lux_anchor=620,
            brightness_percent=60,
            secondary_hex="#7ddff2",
            accent_hex="#e8fff7",
            pattern="contrast-drift",
            motion_intensity=0.12,
            pulse_bpm=0.5,
            theme_mix_hex="#9fe3d8",
            theme_mix_ratio=0.14,
            label="Creative contrast field",
        ),
        phase_overrides={},
    ),
    "neptune": LightingProgram(
        slug="neptune",
        label="Deep Work Lighting",
        intent="Cool-neutral, low-motion light for long uninterrupted concentration.",
        research_anchor="Concentration is strongest under colder light, but the final scene stays below extreme brightness to reduce distraction during long sessions.",
        direct_evidence_keys=("ishii_2015", "bao_2021", "zhou_2021"),
        inferred_evidence_keys=(),
        baseline_scene=_scene(
            cct_kelvin=5000,
            lux_anchor=650,
            brightness_percent=48,
            secondary_hex="#6ecbff",
            accent_hex="#dff4ff",
            pattern="focus-static",
            motion_intensity=0.0,
            pulse_bpm=0.0,
            theme_mix_hex="#7bc9ff",
            theme_mix_ratio=0.1,
            label="Deep focus field",
        ),
        phase_overrides={
            "deepen": _scene(
                cct_kelvin=4800,
                lux_anchor=550,
                brightness_percent=44,
                secondary_hex="#78c9ff",
                accent_hex="#edf8ff",
                pattern="focus-static",
                motion_intensity=0.0,
                pulse_bpm=0.0,
                theme_mix_hex="#79c1ff",
                theme_mix_ratio=0.1,
                label="Deepen hold",
            ),
        },
    ),
    "pluto": LightingProgram(
        slug="pluto",
        label="Recovery Reset Lighting",
        intent="Short blue decompression window after stress, then a warm dim recovery hold with resonance-breath pacing.",
        research_anchor="Blue light is used only as a short post-stress decompression cue; the sustained recovery scene stays warm and dim.",
        direct_evidence_keys=("castillo_2017", "choi_2014"),
        inferred_evidence_keys=("laborde_2021",),
        baseline_scene=_scene(
            cct_kelvin=2700,
            lux_anchor=120,
            brightness_percent=16,
            secondary_hex="#c9d1f2",
            accent_hex="#f2f4fb",
            pattern="resonance-breath",
            motion_intensity=0.08,
            pulse_bpm=6.0,
            theme_mix_hex="#d1c7bb",
            theme_mix_ratio=0.18,
            label="Warm recovery hold",
        ),
        phase_overrides={
            "decompress": _scene(
                cct_kelvin=5000,
                lux_anchor=80,
                brightness_percent=18,
                secondary_hex="#84c6ff",
                accent_hex="#dff4ff",
                pattern="resonance-breath",
                motion_intensity=0.16,
                pulse_bpm=6.0,
                theme_mix_hex="#7ab5ff",
                theme_mix_ratio=0.24,
                evidence_keys=("castillo_2017",),
                label="Post-stress decompression",
            ),
            "restore": _scene(
                cct_kelvin=2700,
                lux_anchor=120,
                brightness_percent=16,
                secondary_hex="#d8d9e8",
                accent_hex="#f6efe8",
                pattern="resonance-breath",
                motion_intensity=0.08,
                pulse_bpm=6.0,
                theme_mix_hex="#d8c9bb",
                theme_mix_ratio=0.18,
                label="Recovery hold",
            ),
        },
    ),
}


def get_lighting_program(planet_slug: str) -> LightingProgram:
    slug = str(planet_slug or "").strip().lower()
    if slug not in LIGHTING_PROGRAMS:
        raise ValueError(f"unsupported lighting program: {planet_slug}")
    return LIGHTING_PROGRAMS[slug]


def get_lighting_pattern(pattern_slug: str) -> LightingPattern:
    slug = str(pattern_slug or "").strip().lower()
    if slug not in LIGHTING_PATTERNS:
        raise ValueError(f"unsupported lighting pattern: {pattern_slug}")
    return LIGHTING_PATTERNS[slug]


def get_lighting_citation(citation_slug: str) -> LightingCitation:
    slug = str(citation_slug or "").strip().lower()
    if slug not in LIGHTING_CITATIONS:
        raise ValueError(f"unsupported lighting citation: {citation_slug}")
    return LIGHTING_CITATIONS[slug]
