# NOOS Backend

Spring Boot backend for the NOOS AI Module.

## Responsibilities

- Expose `/api/ai/**` and `/api/eeg/results`.
- Run the Python `noos_ai` CLI for recognition and intervention planning.
- Proxy generated audio files through `/api/ai/audio`.
- Prewarm and call the remote ACE-Step worker.
- Optionally call the local Gemma helper service.
- Control WiZ bulbs over local UDP.
- Keep frontend-facing endpoints unauthenticated for local prototype use.

## Important Files

- `src/main/java/com/noos/backend/BackendApplication.java`: Spring Boot entrypoint.
- `src/main/java/com/noos/backend/ai/controller/NoosAiController.java`: AI routes.
- `src/main/java/com/noos/backend/ai/service/NoosAiService.java`: Python CLI, ACE-Step, audio proxy, optional Gemma.
- `src/main/java/com/noos/backend/lighting/controller/WizLightingController.java`: WiZ routes.
- `src/main/java/com/noos/backend/lighting/service/WizLightingService.java`: WiZ CCT/RGB command execution.
- `src/main/resources/application.properties`: local runtime defaults.
- `src/main/resources/mappers/auth/AuthMapper.xml`: MyBatis auth mapper.

## Commands

```bash
./gradlew bootRun
./gradlew test
```

## Local Configuration

Current defaults:

- Frontend talks to backend at `http://localhost:8080`.
- Backend calls ACE-Step at `http://192.168.123.114:8011`.
- Gemma is disabled by default.
- WiZ auto-apply is enabled for the configured bulb IPs.

Use `application-secret.properties` for local-only secrets. Do not commit credentials.

## Endpoint Map

- `POST /api/eeg/results`: summarize Muse EEG/band data.
- `POST /api/ai/intervention/music`: build intervention, generate audio, apply lighting.
- `POST /api/ai/intervention/prewarm`: check/prewarm ACE-Step.
- `GET /api/ai/audio?path=...`: stream generated audio from allowed paths.
- `GET /api/lighting/wiz/status`: current WiZ sync job status.
- `GET /api/lighting/wiz/devices`: read configured WiZ bulb state.
- `POST /api/lighting/wiz/apply-plan`: start primary/secondary lighting alternation.
- `POST /api/lighting/wiz/stop`: stop the active lighting job and restore the WiZ state captured before the session started.
