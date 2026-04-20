from __future__ import annotations

import json
import unittest

from noos_ai.integrations.ace_step import AceStepClient, build_local_server_command
from noos_ai.sessions.registry import analyze_session


class InterventionSessionTests(unittest.TestCase):
    def test_neptune_plan_builds_music_and_lighting_specs(self) -> None:
        result = analyze_session(
            {
                "session_type": "intervention",
                "planet": "Neptune",
                "recognition_result": {
                    "quality": {"score": 0.72},
                    "state_profile": {
                        "dimensions": {
                            "mental_workload": {"score": 0.61, "confidence": 0.71},
                            "fatigue_risk": {"score": 0.34, "confidence": 0.65},
                            "stress_load": {"score": 0.76, "confidence": 0.72},
                            "relaxation_level": {"score": 0.22, "confidence": 0.61},
                            "cortical_arousal": {"score": 0.68, "confidence": 0.70},
                            "focus_readiness": {"score": 0.42, "confidence": 0.63},
                        }
                    },
                },
            }
        )

        self.assertEqual(result["planet_profile"]["slug"], "neptune")
        self.assertIn(result["transition_plan"]["transition_mode"], {"stabilize_then_downshift", "stabilize_then_activate"})
        self.assertEqual(result["music_spec"]["mode"], "instrumental_only")
        self.assertTrue(result["lighting_spec"]["phases"])
        self.assertEqual(result["lighting_spec"]["program"]["slug"], "neptune")
        self.assertTrue(result["lighting_spec"]["research_basis"]["direct_evidence"])
        self.assertEqual(
            len(result["lighting_spec"]["hardware_handoff"]["sequence"]),
            len(result["lighting_spec"]["phases"]),
        )
        self.assertIn("default_request", result["ace_step_integration"])
        self.assertEqual(result["music_spec"]["render_plan"]["mode"], "segmented_render")
        self.assertLessEqual(result["music_spec"]["ace_step"]["default_request"]["audio_duration"], 600)
        self.assertLessEqual(result["music_spec"]["ace_step"]["default_request"]["batch_size"], 4)

    def test_pluto_uses_downshift_and_restore(self) -> None:
        result = analyze_session(
            {
                "session_type": "intervention",
                "planet": "Pluto",
                "current_state": {
                    "focus_readiness": 0.32,
                    "stress_load": 0.82,
                    "fatigue_risk": 0.72,
                    "relaxation_level": 0.12,
                    "cortical_arousal": 0.79,
                    "mental_workload": 0.58,
                },
                "quality_score": 0.6,
            }
        )

        self.assertEqual(result["transition_plan"]["transition_mode"], "downshift_and_restore")
        self.assertLess(result["lighting_spec"]["final_scene"]["brightness_percent"], 30)
        self.assertLess(result["lighting_spec"]["final_scene"]["cct_kelvin"], 3200)
        self.assertIn("castillo_2017", result["lighting_spec"]["phases"][0]["evidence_keys"])
        self.assertEqual(
            result["lighting_spec"]["phases"][0]["pattern_details"]["evidence_tier"],
            "inferred",
        )
        self.assertLess(result["music_spec"]["bpm_target"], 60)

    def test_duration_override_is_respected_without_intensity_bonus(self) -> None:
        result = analyze_session(
            {
                "session_type": "intervention",
                "planet": "Neptune",
                "duration_sec": 10,
                "candidate_count_override": 1,
                "current_state": {
                    "focus_readiness": 0.35,
                    "stress_load": 0.74,
                    "fatigue_risk": 0.42,
                    "relaxation_level": 0.2,
                    "cortical_arousal": 0.7,
                    "mental_workload": 0.61,
                },
                "quality_score": 0.7,
            }
        )

        self.assertEqual(result["transition_plan"]["recommended_duration_sec"], 10)
        self.assertEqual(result["music_spec"]["ace_step"]["default_request"]["audio_duration"], 10)
        self.assertEqual(result["music_spec"]["ace_step"]["default_request"]["batch_size"], 1)

    def test_local_server_command_targets_vendor_repo(self) -> None:
        command = build_local_server_command()
        self.assertIn("acestep-api", command["command"])
        self.assertIn("ACE-Step-1.5", command["cwd"])

    def test_parse_result_entries_decodes_query_result_payload(self) -> None:
        task_result = {
            "task_id": "demo-task",
            "status": 1,
            "result": json.dumps(
                [
                    {
                        "file": "/v1/audio?path=/tmp/demo.mp3",
                        "status": 1,
                        "prompt": "deep work ambient",
                    }
                ]
            ),
        }
        parsed = AceStepClient.parse_result_entries(task_result)
        self.assertEqual(len(parsed), 1)
        self.assertEqual(parsed[0]["status"], 1)
        self.assertIn("/v1/audio", parsed[0]["file"])


if __name__ == "__main__":
    unittest.main()
