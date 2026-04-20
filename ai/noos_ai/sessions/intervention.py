from __future__ import annotations

from typing import Any, Mapping
from uuid import uuid4

from ..common import now_utc_iso
from ..integrations.ace_step import (
    DEFAULT_ACE_STEP_BASE_URL,
    DEFAULT_ACE_STEP_HOST,
    DEFAULT_ACE_STEP_PORT,
    build_local_server_command,
    get_vendor_repo_root,
)
from ..intervention.context import parse_intervention_context
from ..intervention.lighting import build_lighting_spec
from ..intervention.music import build_music_spec
from ..intervention.planner import build_intervention_plan
from .base import BaseSession


class InterventionSession(BaseSession):
    session_type = "intervention"

    def analyze_mapping(self, payload: Mapping[str, Any]) -> dict[str, Any]:
        context = parse_intervention_context(payload)
        plan = build_intervention_plan(
            planet=context.planet,
            current_axes=context.current_axes,
            quality_score=context.quality_score,
            confidence_by_axis=context.confidence_by_axis,
            duration_override_sec=context.duration_override_sec,
            feedback_profile=dict(context.feedback_profile),
            intent_context=dict(context.intent_context),
        )
        lighting_spec = build_lighting_spec(
            context.planet,
            plan,
            feedback_profile=dict(context.feedback_profile),
            intent_context=dict(context.intent_context),
        )
        music_spec = build_music_spec(
            context.planet,
            plan,
            candidate_count_override=context.candidate_count_override,
            feedback_profile=dict(context.feedback_profile),
            intent_context=dict(context.intent_context),
        )

        session_id = payload.get("session_id")
        if not isinstance(session_id, str) or not session_id:
            session_id = f"intervention-{uuid4().hex[:12]}"

        runtime_command = build_local_server_command()
        analyzed_at = now_utc_iso()

        return {
            "session_type": self.session_type,
            "session_id": session_id,
            "analyzed_at": analyzed_at,
            "session_partition": {
                "current": "intervention",
                "reserved_next": ["adaptation", "review"],
            },
            "input_summary": {
                "planet": context.planet.slug,
                "measured_state_label": context.measured_state_label,
                "quality_score": context.quality_score,
                "recognition_embedded": bool(context.recognition_result),
                "feedback_profile_embedded": bool(context.feedback_profile),
                "intent_context_embedded": bool(context.intent_context),
            },
            "planet_profile": plan["planet"],
            "current_state_axes": plan["current_axes"],
            "target_state_axes": plan["target_axes"],
            "delta_axes": plan["delta_axes"],
            "transition_plan": {
                "transition_mode": plan["transition_mode"],
                "intervention_direction": plan["intervention_direction"],
                "transition_intensity": plan["transition_intensity"],
                "transition_reliability": plan["transition_reliability"],
                "recommended_duration_sec": plan["recommended_duration_sec"],
                "change_priority": plan["change_priority"],
                "phases": plan["phases"],
                "notes": plan["notes"],
            },
            "lighting_spec": lighting_spec,
            "music_spec": music_spec,
            "feedback_profile": dict(context.feedback_profile),
            "intent_context": dict(context.intent_context),
            "ace_step_integration": {
                "vendor_repo_path": str(get_vendor_repo_root()),
                "api_runtime": {
                    "host": DEFAULT_ACE_STEP_HOST,
                    "port": DEFAULT_ACE_STEP_PORT,
                    "healthcheck_url": music_spec["ace_step"]["healthcheck_url"],
                    "api_base_url": DEFAULT_ACE_STEP_BASE_URL,
                    "start_command": runtime_command["command"],
                },
                "default_request": music_spec["ace_step"]["default_request"],
                "enhanced_request": music_spec["ace_step"]["enhanced_request"],
                "negative_prompt": music_spec["ace_step"]["negative_prompt"],
            },
            "notes": [
                "Intervention session does not generate audio by itself; it prepares a controlled spec for ACE-Step.",
                "Planet branding is separated from target state vector so music and lighting can be computed consistently.",
            ],
        }
