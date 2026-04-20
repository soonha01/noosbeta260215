from __future__ import annotations

import math
import unittest

from noos_ai.sessions.registry import analyze_session


CHANNELS = ("TP9", "AF7", "AF8", "TP10")


def build_readings(
    sample_rate_hz: int,
    duration_sec: int,
    per_channel_amplitudes: dict[str, dict[str, float]],
) -> list[dict[str, object]]:
    readings: list[dict[str, object]] = []
    total_samples = sample_rate_hz * duration_sec
    frequency_map = {
        "delta": 2.0,
        "theta": 6.0,
        "alpha": 10.0,
        "beta": 20.0,
        "gamma": 35.0,
    }
    phase_offset = {
        "TP9": 0.1,
        "AF7": 0.4,
        "AF8": 0.8,
        "TP10": 1.2,
    }

    for sample_index in range(total_samples):
        timestamp = sample_index * (1000.0 / sample_rate_hz)
        channels: dict[str, float] = {}

        for channel in CHANNELS:
            amplitudes = per_channel_amplitudes[channel]
            value = 0.0
            for band_key, amplitude in amplitudes.items():
                frequency = frequency_map[band_key]
                value += amplitude * math.sin((2.0 * math.pi * frequency * sample_index / sample_rate_hz) + phase_offset[channel])
            value += 0.8 * math.sin((2.0 * math.pi * 1.1 * sample_index / sample_rate_hz) + phase_offset[channel] / 2.0)
            channels[channel] = value

        readings.append({"timestamp": timestamp, "channels": channels})

    return readings


class RecognitionSessionTests(unittest.TestCase):
    def test_relaxed_profile_scores_relaxation_above_stress(self) -> None:
        readings = build_readings(
            sample_rate_hz=256,
            duration_sec=8,
            per_channel_amplitudes={
                "TP9": {"alpha": 28.0, "theta": 10.0, "beta": 8.0, "gamma": 2.0, "delta": 4.0},
                "AF7": {"alpha": 24.0, "theta": 9.0, "beta": 8.0, "gamma": 2.0, "delta": 4.0},
                "AF8": {"alpha": 24.0, "theta": 9.0, "beta": 8.0, "gamma": 2.0, "delta": 4.0},
                "TP10": {"alpha": 28.0, "theta": 10.0, "beta": 8.0, "gamma": 2.0, "delta": 4.0},
            },
        )

        result = analyze_session({"session_type": "recognition", "session_id": "relaxed", "readings": readings})
        dimensions = result["state_profile"]["dimensions"]

        self.assertGreater(dimensions["relaxation_level"]["score"], 0.55)
        self.assertGreater(dimensions["relaxation_level"]["score"], dimensions["stress_load"]["score"])

    def test_workload_profile_scores_workload_above_relaxation(self) -> None:
        readings = build_readings(
            sample_rate_hz=256,
            duration_sec=8,
            per_channel_amplitudes={
                "TP9": {"alpha": 10.0, "theta": 14.0, "beta": 14.0, "gamma": 3.0, "delta": 4.0},
                "AF7": {"alpha": 7.0, "theta": 24.0, "beta": 13.0, "gamma": 3.0, "delta": 4.0},
                "AF8": {"alpha": 7.0, "theta": 24.0, "beta": 13.0, "gamma": 3.0, "delta": 4.0},
                "TP10": {"alpha": 10.0, "theta": 14.0, "beta": 14.0, "gamma": 3.0, "delta": 4.0},
            },
        )

        result = analyze_session({"session_type": "recognition", "session_id": "workload", "readings": readings})
        dimensions = result["state_profile"]["dimensions"]

        self.assertGreater(dimensions["mental_workload"]["score"], 0.55)
        self.assertGreater(dimensions["mental_workload"]["score"], dimensions["relaxation_level"]["score"])

    def test_fatigue_profile_scores_fatigue_above_workload(self) -> None:
        readings = build_readings(
            sample_rate_hz=256,
            duration_sec=8,
            per_channel_amplitudes={
                "TP9": {"alpha": 24.0, "theta": 20.0, "beta": 6.0, "gamma": 2.0, "delta": 6.0},
                "AF7": {"alpha": 22.0, "theta": 18.0, "beta": 6.0, "gamma": 2.0, "delta": 6.0},
                "AF8": {"alpha": 22.0, "theta": 18.0, "beta": 6.0, "gamma": 2.0, "delta": 6.0},
                "TP10": {"alpha": 24.0, "theta": 20.0, "beta": 6.0, "gamma": 2.0, "delta": 6.0},
            },
        )

        result = analyze_session({"session_type": "recognition", "session_id": "fatigue", "readings": readings})
        dimensions = result["state_profile"]["dimensions"]

        self.assertGreater(dimensions["fatigue_risk"]["score"], 0.55)
        self.assertGreater(dimensions["fatigue_risk"]["score"], dimensions["mental_workload"]["score"])

    def test_band_summary_mode_returns_limited_but_valid_output(self) -> None:
        result = analyze_session(
            {
                "session_type": "recognition",
                "session_id": "summary-only",
                "band_summary": {
                    "delta": 10.0,
                    "theta": 20.0,
                    "alpha": 35.0,
                    "beta": 25.0,
                    "gamma": 10.0,
                },
            }
        )

        self.assertEqual(result["input_summary"]["feature_source"], "band-summary")
        self.assertIn("limitations", result)
        self.assertIn("mental_workload", result["state_profile"]["dimensions"])


if __name__ == "__main__":
    unittest.main()
