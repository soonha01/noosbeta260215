from __future__ import annotations

import json
import os
import platform
import unittest
from unittest.mock import patch

from noos_ai.intervention.lighting_research import PLANET_TONE_PROFILES, hex_to_rgb_tuple
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

    def test_lighting_phases_use_exact_planet_primary_and_secondary_tones(self) -> None:
        current_state = {
            "focus_readiness": 0.44,
            "stress_load": 0.44,
            "fatigue_risk": 0.44,
            "relaxation_level": 0.5,
            "cortical_arousal": 0.5,
            "mental_workload": 0.5,
        }

        for planet_slug, tones in PLANET_TONE_PROFILES.items():
            with self.subTest(planet=planet_slug):
                result = analyze_session(
                    {
                        "session_type": "intervention",
                        "planet": planet_slug,
                        "duration_sec": 20,
                        "candidate_count_override": 1,
                        "current_state": current_state,
                        "quality_score": 0.7,
                    }
                )

                expected_primary_rgb = dict(zip(("r", "g", "b"), hex_to_rgb_tuple(tones["primary_hex"])))
                expected_secondary_rgb = dict(zip(("r", "g", "b"), hex_to_rgb_tuple(tones["secondary_hex"])))
                lighting_spec = result["lighting_spec"]

                self.assertEqual(lighting_spec["device_profile"], "cct-plus-rgb")
                self.assertEqual(lighting_spec["hardware_handoff"]["device_profile"], "cct-plus-rgb")
                self.assertEqual(lighting_spec["final_scene"]["primary_hex"], tones["primary_hex"])
                self.assertEqual(lighting_spec["final_scene"]["secondary_hex"], tones["secondary_hex"])
                for phase in lighting_spec["phases"]:
                    self.assertEqual(phase["primary_hex"], tones["primary_hex"])
                    self.assertEqual(phase["primary_mode"], "cct")
                    self.assertEqual(phase["primary_cct_kelvin"], phase["cct_kelvin"])
                    self.assertEqual(phase["secondary_hex"], tones["secondary_hex"])

                for scene in lighting_spec["hardware_handoff"]["sequence"]:
                    channels = scene["channels"]
                    self.assertEqual(channels["primary_rgb"], expected_primary_rgb)
                    self.assertEqual(channels["primary_mode"], "cct")
                    self.assertEqual(channels["primary_cct_kelvin"], scene["white_reference"]["cct_kelvin"])
                    self.assertEqual(channels["secondary_rgb"], expected_secondary_rgb)

    def test_duration_override_is_respected_without_intensity_bonus(self) -> None:
        with patch.dict(os.environ, {"NOOS_ACE_STEP_INFERENCE_STEPS": "8"}):
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
        self.assertEqual(result["music_spec"]["ace_step"]["default_request"]["inference_steps"], 8)

    def test_inference_steps_override_is_clamped(self) -> None:
        with patch.dict(os.environ, {"NOOS_ACE_STEP_INFERENCE_STEPS": "999"}):
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

        self.assertEqual(result["music_spec"]["ace_step"]["default_request"]["inference_steps"], 20)

    def test_configured_ace_model_and_lm_are_used_for_enhanced_request(self) -> None:
        with patch.dict(
            os.environ,
            {
                "NOOS_ACE_STEP_MODEL": "acestep-v15-turbo",
                "NOOS_ACE_STEP_LM_MODEL": "acestep-5Hz-lm-1.7B",
                "NOOS_ACE_STEP_ENABLE_LM": "true",
            },
        ):
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

        enhanced = result["music_spec"]["ace_step"]["enhanced_request"]
        self.assertEqual(enhanced["model"], "acestep-v15-turbo")
        self.assertTrue(enhanced["thinking"])
        self.assertEqual(enhanced["lm_model_path"], "acestep-5Hz-lm-1.7B")

    def test_duration_override_is_capped_for_direct_cli_use(self) -> None:
        result = analyze_session(
            {
                "session_type": "intervention",
                "planet": "Neptune",
                "duration_sec": 999999,
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

        self.assertEqual(result["transition_plan"]["recommended_duration_sec"], 600)
        self.assertEqual(result["music_spec"]["render_plan"]["target_total_duration_sec"], 600)

    def test_local_server_command_targets_vendor_repo(self) -> None:
        command = build_local_server_command()
        self.assertIn("acestep-api", command["command"])
        self.assertIn("ACE-Step-1.5", command["cwd"])
        if platform.system() == "Darwin" and platform.machine() == "arm64":
            self.assertEqual(command["env"]["ACESTEP_OFFLOAD_TO_CPU"], "false")
            self.assertEqual(command["env"]["ACESTEP_OFFLOAD_DIT_TO_CPU"], "false")

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

    def test_ace_step_client_derives_gemma_unload_url_from_worker_host(self) -> None:
        with patch.dict(os.environ, {"NOOS_GEMMA_UNLOAD_URL": "", "NOOS_GEMMA_UNLOAD_PORT": "8012"}):
            client = AceStepClient("http://100.120.77.82:8011")
            self.assertEqual(client.gemma_unload_url(), "http://100.120.77.82:8012/v1/unload")

    def test_release_task_unloads_gemma_before_music_generation(self) -> None:
        call_order: list[str] = []
        client = AceStepClient("http://100.120.77.82:8011")

        def unload() -> bool:
            call_order.append("unload")
            return True

        def request(method: str, path: str, payload: dict[str, object]) -> dict[str, object]:
            call_order.append(path)
            return {"data": {"task_id": "demo-task"}}

        with patch.object(client, "unload_gemma_before_music", side_effect=unload), patch.object(
            client,
            "_request",
            side_effect=request,
        ):
            response = client.release_task({"prompt": "deep work ambient"})

        self.assertEqual(response["data"]["task_id"], "demo-task")
        self.assertEqual(call_order, ["unload", "/release_task"])


if __name__ == "__main__":
    unittest.main()
