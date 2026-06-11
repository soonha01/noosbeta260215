# PROJECT KNOWLEDGE BASE

**Generated:** 2026-06-10 KST

## OVERVIEW

NOOS is a local multimodal prototype: React/Vite UI, Spring Boot API, Python EEG/intervention engine, remote ACE-Step audio generation, and WiZ lighting.

## STRUCTURE

```text
noosbeta260215/
+-- frontend/        # only live browser runtime, Vite on :3000
+-- backend/         # Spring Boot API, Python CLI orchestration, audio proxy, WiZ
+-- ai/              # Python package for recognition/intervention specs
+-- ai-objet-next/   # source for embedded AI Objet static export
+-- docs/            # cross-system runtime and architecture docs
`-- ai/vendor/       # ignored upstream ACE-Step checkout, not app source
```

## WHERE TO LOOK

| Task | Location | Notes |
| --- | --- | --- |
| Frontend route map | `frontend/src/App.jsx` | Lazy routes for root, AI Objet, solar, profile, records |
| Root jump/landing flow | `frontend/src/pages/root/NoosRootPage.jsx` | Iframes the static landing export |
| Travel generation/player flow | `frontend/src/components/features/solar/SpaceTravel.jsx` | Journey state, audio queue, records, cleanup |
| Travel subcomponents | `frontend/src/components/features/solar/travel/` | Player/generation/dashboard UI and hooks |
| Frontend API/env | `frontend/src/lib/env.js`, `frontend/src/lib/noosAiApi.js`, `frontend/src/lib/eegAnalysisApi.js` | Backend URLs belong here |
| Muse browser integration | `frontend/src/lib/muse/` | Web Bluetooth and live session buffer |
| Backend AI endpoints | `backend/src/main/java/com/noos/backend/ai/controller/NoosAiController.java` | `/api/ai/**` |
| EEG endpoints | `backend/src/main/java/com/noos/backend/eeg/controller/EegController.java` | `/api/eeg/**` |
| Python bridge | `backend/src/main/java/com/noos/backend/ai/service/NoosAiService.java` | Shells out to `python -m noos_ai.cli` |
| WiZ lighting | `backend/src/main/java/com/noos/backend/lighting/service/WizLightingService.java` | WiZ apply/alternate/restore facade |
| AI session dispatch | `ai/noos_ai/sessions/registry.py` | `recognition`, `intervention` |
| Intervention specs | `ai/noos_ai/intervention/` | planet targets, lighting, music, planner |
| ACE-Step client | `ai/noos_ai/integrations/ace_step.py` | Request payload and remote API calls |

## CONVENTIONS

- `frontend/` is the only live frontend runtime. Old alternate frontend dev ports are retired.
- `frontend npm run build` runs `sync:embedded` first, then Vite.
- Main landing source is outside this repo at `../compute-the-platform-to-build-and-ship-ai-agents`.
- `ai-objet-next/` is an embedded static export source. Its `dev` and `start` scripts intentionally fail.
- Backend config includes `spring.profiles.include=secret`; local credentials stay in ignored `application-secret.properties`.
- Backend invokes the Python package via temp JSON and `python -m noos_ai.cli`; Java does not import AI modules.
- Cross-system docs live in `docs/`; AI research and Windows/ACE handoff docs live in `ai/docs/`.

## ANTI-PATTERNS

- Do not hand-edit `frontend/public/embedded/**`; regenerate from the source Next projects.
- Do not copy hardcoded `http://localhost:8080` patterns in frontend components. Use `frontend/src/lib/env.js`.
- Do not run `ai-objet-next npm run dev` or `npm start`; use `build:embedded`.
- Do not treat `ai/generated`, `.venv`, `.cache`, `build`, `.gradle`, `.next`, `out`, or `node_modules` as source.
- Do not print or commit values from `application-secret.properties`.
- Do not present EEG-derived text as diagnosis or medical advice.
- Do not assume the remote ACE-Step host is localhost from the Mac backend; verify configured host and port.
- Do not treat `ai/vendor/ACE-Step-1.5/AGENTS.md` as root NOOS guidance.

## COMMANDS

```bash
cd frontend && npm run start
cd frontend && npm run build
cd frontend && npm run test

cd backend && ./gradlew bootRun
cd backend && ./gradlew test

cd ai && python3 -m venv .venv
cd ai && source .venv/bin/activate && python3 -m pip install -e .
cd ai && python3 -m unittest discover -s tests
cd ai && python3 -m noos_ai.cli examples/recognition_input.json
cd ai && python3 -m noos_ai.cli examples/intervention_input.json
```

## NOTES

- There is no first-party CI workflow or Makefile; verification is manual and split by subproject.
- Frontend tests are Vitest; keep behavior tests focused on public UI/API surfaces.
- Backend tests are JUnit 5/Spring Boot with Mockito-style unit and controller coverage.
- AI tests are `unittest`, not pytest.
