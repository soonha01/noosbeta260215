# NOOS AI Package

`ai/` is the local Python engine for NOOS recognition and intervention planning. It is intentionally runnable without the frontend or backend so behavior can be tested from the CLI.

## Responsibilities

- Parse EEG readings or band summaries into stable session contracts.
- Produce a recognition profile with state label, axes, confidence, and limitations.
- Build an intervention bundle for a selected planet target.
- Generate lighting specs, WiZ hardware handoff payloads, and ACE-Step music request specs.
- Call the remote ACE-Step API when available, while keeping deterministic fallback output for tests and offline use.

## Layout

```text
ai/
+-- noos_ai/
|   +-- cli.py
|   +-- contracts.py
|   +-- eeg/
|   +-- intervention/
|   +-- integrations/
|   `-- sessions/
+-- examples/
+-- tests/
+-- docs/
+-- scripts/
+-- generated/      # ignored runtime output
`-- vendor/         # ignored ACE-Step checkout
```

## Key Files

- `noos_ai/cli.py`: JSON-in, JSON-out CLI entrypoint used by the backend.
- `noos_ai/contracts.py`: input parsing and normalized reading contracts.
- `noos_ai/sessions/registry.py`: dispatch for `recognition` and `intervention` sessions.
- `noos_ai/sessions/recognition.py`: EEG/band summary to current state.
- `noos_ai/sessions/intervention.py`: state plus target planet to a complete intervention bundle.
- `noos_ai/intervention/planet_profiles.py`: planet target axes and copy.
- `noos_ai/intervention/lighting_research.py`: CCT/RGB profile data.
- `noos_ai/intervention/lighting.py`: final lighting spec generation.
- `noos_ai/intervention/lighting_hardware.py`: WiZ handoff payload.
- `noos_ai/intervention/music.py`: ACE-Step prompt and request construction.
- `noos_ai/integrations/ace_step.py`: remote ACE-Step API wrapper.

## Install

```bash
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install -e .
```

The package has no required third-party runtime dependencies in the core path.

## Run

Recognition example:

```bash
python3 -m noos_ai.cli examples/recognition_input.json
```

Intervention example:

```bash
python3 -m noos_ai.cli examples/intervention_input.json
```

Tests:

```bash
python3 -m unittest discover -s tests
```

## ACE-Step Worker

The Python package can prepare ACE-Step request payloads and can call a remote worker when the request includes an enabled `ace_step` config. The default development worker is documented in `docs/windows-codex-ace-step-handoff.md`.

Generated audio and runtime cache must stay under `generated/`. This directory is ignored and should not be treated as source.

## Contract Shape

Recognition input:

```json
{
  "session_type": "recognition",
  "readings": [
    {
      "timestamp": 0,
      "channels": {
        "TP9": 1.0,
        "AF7": 1.1,
        "AF8": 0.9,
        "TP10": 1.0
      }
    }
  ]
}
```

Intervention input:

```json
{
  "session_type": "intervention",
  "current_state": {
    "label": "calm",
    "axes": {
      "valence": 0.2,
      "arousal": -0.1,
      "focus": 0.4
    }
  },
  "target_planet": "mars"
}
```

The CLI prints JSON to stdout and writes diagnostic failures to stderr. Backend code should treat the CLI as a process boundary, not as imported Python modules.
