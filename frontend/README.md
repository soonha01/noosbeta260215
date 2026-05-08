# NOOS Frontend

React/Vite frontend for the NOOS AI Module.

## Responsibilities

- Muse connection and browser-side signal processing.
- State survey and readable user state summary.
- Planet selection and travel session flow.
- Music generation progress/player/dashboard UI.
- Lighting preview for research CCT and secondary RGB.
- API calls to the Spring Boot backend.

## Commands

```bash
npm install
npm run start
npm run build
npm run test
```

## Important Files

- `src/App.jsx`: route-level app composition.
- `src/index.jsx`: frontend entrypoint and browser compatibility setup.
- `src/lib/env.js`: backend URL resolution.
- `src/lib/eegAnalysisApi.js`: Muse/EEG backend API client.
- `src/lib/noosAiApi.js`: NOOS AI intervention and copilot API client.
- `src/lib/muse/`: Muse browser client and signal processing.
- `src/components/features/auth/Login.jsx`: Muse login/measurement flow.
- `src/components/features/auth/MuseSignalDashboard.jsx`: readable EEG state dashboard.
- `src/components/features/solar/SolarExplorer.jsx`: planet selection.
- `src/components/features/solar/SpaceTravel.jsx`: generation/player/dashboard state machine.
- `src/components/features/solar/travel/lightingPreview.js`: static lighting preview fallback.
- `src/components/features/solar/travel/TravelLightingPreview.jsx`: lighting display component.

## Backend URL

The backend URL should come from `src/lib/env.js` and Vite env configuration. Avoid hardcoding `localhost` directly inside feature components.

## Lighting Display

The current lighting model is:

- Primary: CCT value, shown as `Primary CCT`.
- Secondary: RGB planet tone, shown as `Secondary tone`.

Generated backend responses are normalized in `src/lib/noosAiApi.js`. Static fallback values live in `src/components/features/solar/travel/lightingPreview.js`.

