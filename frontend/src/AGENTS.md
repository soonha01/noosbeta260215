# FRONTEND SRC KNOWLEDGE BASE

## OVERVIEW

`frontend/src` holds the active React app: route shells, Muse/auth flows, solar travel generation/player screens, and API helpers.

## STRUCTURE

```text
src/
+-- App.jsx              # top-level route map
+-- pages/               # route wrappers and page-level shells
+-- components/features/ # auth, Muse, board/chat, solar travel
+-- components/layout/   # iframe and transition wrappers
+-- components/ui/       # visual primitives and effects
+-- lib/                 # env, API clients, Muse helpers
`-- legacy/              # inactive Vite-native landing reference
```

## WHERE TO LOOK

| Task | Location | Notes |
| --- | --- | --- |
| Route changes | `App.jsx`, `pages/**` | Pages are mostly shells around feature components |
| Root login/landing state | `pages/root/NoosRootPage.jsx` | Jump, login, embedded landing iframe |
| AI Objet route | `pages/ai-objet/AIObjetPage.jsx` | Iframes embedded export |
| State survey | `components/features/auth/StateSurveyPage.jsx`, `lib/stateSurvey.js` | Survey scoring and UI |
| Muse connection | `components/features/auth/Login.jsx`, `lib/muse/**` | Web Bluetooth and live session buffer |
| Muse dashboard | `components/features/auth/MuseSignalDashboard.jsx` | EEG visual interpretation |
| Planet selection | `components/features/solar/SolarExplorer.jsx` | Uses gallery/media accents |
| Journey workflow | `components/features/solar/SpaceTravel.jsx` | Large generation/player controller |
| Player UI | `components/features/solar/travel/` | Subcomponents and local storage helpers |
| Backend API | `lib/noosAiApi.js`, `lib/eegAnalysisApi.js` | Fetch wrappers and fallbacks |

## CONVENTIONS

- Route components are lazy-loaded in `App.jsx`; keep route wrappers thin.
- Backend base URL comes from `lib/env.js`. This file normalizes `VITE_*` and `REACT_APP_*` values.
- NOOS AI generation calls should go through `lib/noosAiApi.js`; EEG submissions through `lib/eegAnalysisApi.js`.
- Muse live readings are shared through `lib/muse/liveMuseSession.js`; avoid parallel ad hoc global buffers.
- Generated journey UI combines AI output, static planet media, WiZ state, local records, and audio queue state. Edit `SpaceTravel.jsx` with narrow diffs.
- Korean user-facing strings are common in this surface; preserve existing tone when changing copy.

## ANTI-PATTERNS

- Do not copy current hardcoded `localhost` API constants from old auth/admin/chat files into new code.
- Do not make medical diagnosis claims in generated summaries or UI text.
- Do not put new production logic in `legacy/vite-landing`.
- Do not bypass `stopWizLighting` cleanup when leaving generated music/light sessions.
- Do not split `SpaceTravel.jsx` casually unless preserving queueing, crossfade, storage, and WiZ cleanup behavior is part of the change.

## TESTING NOTES

- No authored frontend tests currently exist.
- Good first test targets: `lib/stateSurvey.js`, `lib/eegAnalysisApi.js`, `lib/noosAiApi.js`, `lib/muse/signalProcessing.js`.
- Until tests exist, use `npm run build` as the primary frontend verification.
