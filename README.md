# NOOS AI Module

NOOS AI Module is a local multimodal prototype for Muse EEG state recognition, planet-based intervention planning, ACE-Step music generation, and WiZ lighting control.

The project is split into three runtime areas:

- `frontend/`: React/Vite app for Muse connection, survey, planet selection, travel player, and lighting preview.
- `backend/`: Spring Boot API that proxies frontend requests to the Python AI CLI, ACE-Step, generated audio, and WiZ bulbs.
- `ai/`: Python package for EEG recognition, intervention planning, lighting specs, music specs, ACE-Step request construction, and optional Gemma helper tasks.

## Start Here

Read these documents first when onboarding:

- [docs/PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md): folder map and file responsibility guide.
- [docs/RUNTIME_AND_OPERATIONS.md](./docs/RUNTIME_AND_OPERATIONS.md): local runtime layout, ports, startup commands, and common checks.
- [ai/README.md](./ai/README.md): Python AI engine details.
- [frontend/README.md](./frontend/README.md): React app structure.
- [backend/README.md](./backend/README.md): Spring Boot API structure.

## Current Runtime Shape

```text
Browser / React frontend
  -> Spring Boot backend on localhost:8080
    -> Python noos_ai CLI for recognition/intervention specs
    -> Windows 4080 ACE-Step API for music generation
    -> WiZ bulbs over local UDP for lighting
```

Gemma is currently disabled by default in `backend/src/main/resources/application.properties` because it is optional and can block music generation if the local service is slow.

## Common Commands

Frontend:

```bash
cd frontend
npm install
npm run start
npm run build
```

Backend:

```bash
cd backend
./gradlew bootRun
./gradlew test
```

AI:

```bash
cd ai
python3 -m venv .venv
source .venv/bin/activate
pip install -e .
python3 -m unittest discover -s tests
```

## Important Ports

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`
- Optional Gemma service: `http://127.0.0.1:8091`
- ACE-Step worker: configured in `backend/src/main/resources/application.properties`

## Development Rule Of Thumb

- UI-only behavior belongs in `frontend/src`.
- API routing, file proxying, and hardware control belong in `backend/src/main/java/com/noos/backend`.
- EEG, intervention, music, and lighting spec logic belongs in `ai/noos_ai`.
- Runtime documentation belongs in `docs/`.
- Research/background documents stay in `ai/docs/` unless they describe whole-system operations.

