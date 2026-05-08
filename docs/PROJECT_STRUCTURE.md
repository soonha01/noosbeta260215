# Project Structure

This document explains where to look before changing code.

## Top-Level Layout

```text
noosbeta260215/
├── README.md
├── docs/
├── ai/
├── backend/
└── frontend/
```

## `ai/`

Python AI engine. It should stay independent enough to run from CLI tests without the frontend or backend.

```text
ai/
├── README.md
├── pyproject.toml
├── docs/
├── examples/
├── scripts/
├── tests/
└── noos_ai/
    ├── cli.py
    ├── contracts.py
    ├── eeg/
    ├── gemma/
    ├── integrations/
    ├── intervention/
    └── sessions/
```

Key responsibilities:

- `noos_ai/sessions/recognition.py`: Muse EEG or band summary to current state.
- `noos_ai/sessions/intervention.py`: state plus planet target to intervention bundle.
- `noos_ai/intervention/planner.py`: transition mode, phases, and duration.
- `noos_ai/intervention/lighting_research.py`: research-backed lighting programs and planet tone profiles.
- `noos_ai/intervention/lighting.py`: final `lighting_spec` generation.
- `noos_ai/intervention/lighting_hardware.py`: hardware handoff payload.
- `noos_ai/intervention/music.py`: music spec and ACE-Step request payload.
- `noos_ai/integrations/ace_step.py`: ACE-Step API client.
- `noos_ai/gemma/`: optional Gemma helper service and task templates.

Tests:

- `ai/tests/test_recognition_session.py`
- `ai/tests/test_intervention_session.py`

## `backend/`

Spring Boot API. It owns HTTP endpoints, local process execution, audio proxying, and WiZ device commands.

```text
backend/
├── README.md
├── build.gradle
├── src/main/java/com/noos/backend/
│   ├── BackendApplication.java
│   ├── ai/
│   ├── auth/
│   ├── config/
│   └── lighting/
└── src/main/resources/
    ├── application.properties
    └── mappers/
```

Key responsibilities:

- `ai/controller/NoosAiController.java`: `/api/ai/**` and `/api/eeg/results`.
- `ai/service/NoosAiService.java`: Python CLI orchestration, ACE-Step prewarm/generation, generated audio proxy, optional Gemma calls.
- `lighting/controller/WizLightingController.java`: `/api/lighting/wiz/**`.
- `lighting/service/WizLightingService.java`: WiZ UDP commands, primary CCT and secondary RGB alternation.
- `config/SecurityConfig.java`: public API access rules.
- `config/CorsConfig.java`: frontend/backend local CORS.

Tests:

- `backend/src/test/java/com/noos/backend/ai/service/NoosAiServiceTest.java`
- `backend/src/test/java/com/noos/backend/auth/service/AuthServiceTest.java`

## `frontend/`

React/Vite app. It owns UI state, Muse browser integration, planet/travel screens, and backend API calls.

```text
frontend/
├── README.md
├── package.json
├── vite.config.js
├── public/
└── src/
    ├── App.jsx
    ├── index.jsx
    ├── lib/
    ├── pages/
    └── components/
        ├── features/
        ├── navigation/
        └── ui/
```

Key responsibilities:

- `src/lib/env.js`: backend URL resolution.
- `src/lib/eegAnalysisApi.js`: EEG analysis API client.
- `src/lib/noosAiApi.js`: intervention, dashboard, and lighting preview API helpers.
- `src/lib/muse/`: Web Bluetooth Muse client and signal processing.
- `src/components/features/auth/`: login, Muse connection, state survey, state interpretation UI.
- `src/components/features/solar/SolarExplorer.jsx`: planet selection.
- `src/components/features/solar/SpaceTravel.jsx`: generation/player/dashboard flow controller.
- `src/components/features/solar/travel/`: travel page subcomponents and constants.

## Runtime-Owned Folders

Do not treat these as source code:

- `ai/generated/`: generated audio/output artifacts.
- `ai/.cache/`, `ai/.venv/`: local Python runtime state.
- `backend/build/`, `backend/.gradle/`: Gradle output/cache.
- `frontend/build/`, `frontend/node_modules/`: frontend output/dependencies.

## Change Ownership Guide

- Change planet target axes: `ai/noos_ai/intervention/planet_profiles.py`.
- Change lighting research CCT/lux/patterns: `ai/noos_ai/intervention/lighting_research.py`.
- Change WiZ device behavior: `backend/src/main/java/com/noos/backend/lighting/service/WizLightingService.java`.
- Change music prompt/render planning: `ai/noos_ai/intervention/music.py`.
- Change ACE-Step model/API behavior: `ai/noos_ai/integrations/ace_step.py` and backend `application.properties`.
- Change generated travel UI: `frontend/src/components/features/solar/SpaceTravel.jsx` and `frontend/src/components/features/solar/travel/`.
- Change Muse state explanation UI: `frontend/src/components/features/auth/MuseSignalDashboard.jsx`.

