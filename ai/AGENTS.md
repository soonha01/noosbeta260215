# AI PACKAGE KNOWLEDGE BASE

## OVERVIEW

`ai/` is an editable Python package for EEG recognition and intervention planning. It outputs explainable state, lighting, music, and ACE-Step request specs.

## STRUCTURE

```text
ai/
+-- noos_ai/
|   +-- cli.py
|   +-- contracts.py
|   +-- eeg/
|   +-- sessions/
|   +-- intervention/
|   `-- integrations/
+-- examples/
+-- tests/
+-- docs/
+-- scripts/
+-- generated/      # ignored runtime output/cache
`-- vendor/         # ignored ACE-Step checkout
```

## WHERE TO LOOK

| Task | Location | Notes |
| --- | --- | --- |
| CLI entry | `noos_ai/cli.py` | Use `python -m noos_ai.cli` |
| Input contracts | `noos_ai/contracts.py` | Dataclasses/parsing for readings and bands |
| Session routing | `noos_ai/sessions/registry.py` | Maps `recognition` and `intervention` |
| EEG preprocessing | `noos_ai/eeg/` | Bands, spectral summaries, quality |
| Recognition state | `noos_ai/sessions/recognition.py` | Label, axes, limitations |
| Intervention session | `noos_ai/sessions/intervention.py` | Builds complete intervention bundle |
| Planet targets | `noos_ai/intervention/planet_profiles.py` | Target axes and labels |
| Lighting specs | `noos_ai/intervention/lighting*.py` | Research CCT/RGB and hardware handoff |
| Music specs | `noos_ai/intervention/music.py` | ACE-Step prompt/request construction |
| ACE-Step client | `noos_ai/integrations/ace_step.py` | Remote API wrapper |

## CONVENTIONS

- Python requirement is `>=3.11`; install with `python3 -m pip install -e .`.
- Tests use standard `unittest`, not pytest.
- Session inputs can use raw `readings` or `band_summary`; raw readings take priority.
- Recognition/intervention must remain CLI-runnable without frontend/backend.
- ACE-Step is an optional external runtime. Keep graceful fallback behavior.
- Generated audio and runtime cache live under `generated/`.
- AI-specific runtime handoffs and research notes belong in `ai/docs/`, not root `docs/`.

## ANTI-PATTERNS

- Do not write generated audio/cache into source directories.
- Do not edit `vendor/ACE-Step-1.5` unless the task is explicitly vendor integration or patch maintenance.
- Do not make diagnosis or treatment claims from EEG state axes.
- Do not require ACE-Step to pass unit tests.
- Do not move hardware control into Python; final WiZ commands are backend-owned.

## COMMANDS

```bash
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install -e .
python3 -m unittest discover -s tests
python3 -m noos_ai.cli examples/recognition_input.json
python3 -m noos_ai.cli examples/intervention_input.json
bash ./scripts/start_acestep_api.sh
```

## TESTING NOTES

- Existing tests are session-level and deterministic.
- High-value gaps: contract parsing errors, EEG edge cases, CLI behavior, invalid payloads.
