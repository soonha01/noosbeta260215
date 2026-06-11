from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys

from .integrations.ace_step import AceStepApiError, AceStepClient, DEFAULT_ACE_STEP_BASE_URL
from .sessions.registry import analyze_session


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Run NOOS AI sessions from JSON input.")
    parser.add_argument("input_json", help="Path to recognition/intervention input JSON")
    parser.add_argument("--output-json", help="Optional path to save the resulting JSON")
    parser.add_argument(
        "--generate-ace-step",
        action="store_true",
        help="After intervention planning, submit the generated request to a running ACE-Step API server.",
    )
    parser.add_argument(
        "--use-enhanced-request",
        action="store_true",
        help="Use the enhanced ACE-Step request with LM planning when available.",
    )
    parser.add_argument(
        "--api-base-url",
        help="Override ACE-Step API base URL. Defaults to the URL embedded in the intervention output.",
    )
    parser.add_argument("--poll-interval-sec", type=float, default=2.0, help="ACE-Step result polling interval.")
    parser.add_argument("--timeout-sec", type=float, default=900.0, help="ACE-Step generation timeout.")
    return parser


def _write_output(path: str | None, payload: dict[str, object]) -> None:
    rendered = json.dumps(payload, ensure_ascii=False, indent=2)
    if path:
        output_path = Path(path).expanduser().resolve()
        output_path.write_text(rendered + "\n", encoding="utf-8")
        return
    print(rendered)


def _generate_with_ace_step(
    result: dict[str, object],
    *,
    api_base_url: str | None,
    use_enhanced_request: bool,
    poll_interval_sec: float,
    timeout_sec: float,
) -> dict[str, object]:
    if result.get("session_type") != "intervention":
        raise ValueError("--generate-ace-step is only supported for intervention sessions")

    ace_integration = result.get("ace_step_integration")
    if not isinstance(ace_integration, dict):
        raise ValueError("intervention output does not contain ace_step_integration")

    request_key = "enhanced_request" if use_enhanced_request else "default_request"
    request_payload = ace_integration.get(request_key)
    if not isinstance(request_payload, dict):
        raise ValueError(f"intervention output does not contain {request_key}")

    api_runtime = ace_integration.get("api_runtime")
    runtime_base_url = None
    if isinstance(api_runtime, dict):
        runtime_base_url = api_runtime.get("api_base_url")

    client = AceStepClient(
        base_url=(api_base_url or runtime_base_url or DEFAULT_ACE_STEP_BASE_URL),
        timeout_sec=max(timeout_sec, 3600.0),
    )
    health = client.health()
    health_data = health.get("data") if isinstance(health.get("data"), dict) else {}
    requested_model = request_payload.get("model") if isinstance(request_payload.get("model"), str) else None
    requested_lm_model = request_payload.get("lm_model_path") if isinstance(request_payload.get("lm_model_path"), str) else None
    wants_lm = bool(request_payload.get("thinking"))

    needs_model_init = not bool((health_data or {}).get("models_initialized"))
    if requested_model and (health_data or {}).get("loaded_model") != requested_model:
        needs_model_init = True

    needs_lm_init = wants_lm and not bool((health_data or {}).get("llm_initialized"))
    if wants_lm and requested_lm_model and (health_data or {}).get("loaded_lm_model") != requested_lm_model:
        needs_lm_init = True

    if needs_model_init or needs_lm_init:
        client.init_model(
            model=requested_model,
            init_llm=wants_lm,
            lm_model_path=requested_lm_model,
            timeout_sec=max(timeout_sec, 3600.0),
        )
    task_result = client.generate(request_payload, poll_interval_sec=poll_interval_sec, timeout_sec=timeout_sec)
    parsed_entries = client.parse_result_entries(task_result)
    result["ace_step_job"] = {
        "request_key": request_key,
        "api_base_url": client.base_url,
        "task_result": task_result,
        "parsed_entries": parsed_entries,
    }
    return result


def main(argv: list[str] | None = None) -> int:
    parser = _build_parser()
    args = parser.parse_args(sys.argv[1:] if argv is None else argv)

    input_path = Path(args.input_json).expanduser().resolve()
    payload = json.loads(input_path.read_text(encoding="utf-8"))
    result = analyze_session(payload)

    if args.generate_ace_step:
        try:
            result = _generate_with_ace_step(
                result,
                api_base_url=args.api_base_url,
                use_enhanced_request=args.use_enhanced_request,
                poll_interval_sec=args.poll_interval_sec,
                timeout_sec=args.timeout_sec,
            )
        except AceStepApiError as error:
            print(f"ACE-Step generation failed: {error}", file=sys.stderr)
            return 1

    _write_output(args.output_json, result)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
