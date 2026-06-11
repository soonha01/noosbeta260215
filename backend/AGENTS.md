# BACKEND KNOWLEDGE BASE

## OVERVIEW

`backend/` is a Spring Boot 3.4 API that owns HTTP routing, auth/board/chat persistence, Python AI orchestration, generated audio proxying, and WiZ UDP control.

## STRUCTURE

```text
backend/
+-- build.gradle
+-- src/main/java/com/noos/backend/
|   +-- ai/        # NOOS AI endpoints and Python/ACE-Step bridge
|   +-- eeg/       # EEG session/result endpoints and persistence
|   +-- lighting/  # WiZ apply/status/restore
|   +-- auth/      # auth, admin, OAuth/session support
|   +-- board/     # board posts/comments/likes
|   +-- chat/      # websocket/chat rooms
|   `-- config/    # CORS, security, websocket config
`-- src/main/resources/
    +-- application.properties
    +-- application-secret.properties  # ignored local secrets
    `-- mappers/
```

## WHERE TO LOOK

| Task | Location | Notes |
| --- | --- | --- |
| Boot entry | `src/main/java/com/noos/backend/BackendApplication.java` | Spring Boot main |
| Public API/security rules | `config/SecurityConfig.java`, `config/CorsConfig.java` | Local prototype access rules |
| AI endpoints | `ai/controller/NoosAiController.java` | `/api/ai/**`, audio stream |
| AI orchestration | `ai/service/NoosAiService.java` | Thin facade over Python CLI, ACE-Step, audio |
| Python CLI boundary | `ai/service/PythonCliClient.java` | Process execution |
| ACE-Step boundary | `ai/service/AceStepClient.java` | health, prewarm, generation materialization |
| Audio streaming | `ai/service/GeneratedAudioService.java`, `ai/service/NoosAiPaths.java` | Allowed generated audio roots |
| EEG endpoints | `eeg/controller/EegController.java` | `/api/eeg/**` |
| WiZ endpoints | `lighting/controller/WizLightingController.java` | `/api/lighting/wiz/**` |
| WiZ behavior | `lighting/service/WizLightingService.java` | UDP commands, snapshot restore |
| MyBatis SQL | `src/main/resources/mappers/**` | XML by domain |
| Runtime config | `src/main/resources/application.properties` | Current ACE-Step/WiZ truth |

## CONVENTIONS

- Java toolchain is 17; use the Gradle wrapper.
- Backend shells out to `python -m noos_ai.cli` in `../ai`; it does not import Python code.
- Generic `noos.ai.python-bin` may resolve through `ai/.venv` when present.
- Remote ACE-Step should not be auto-started as if it were localhost.
- WiZ session start snapshots current bulb pilot state; stop restores that snapshot.
- `application-secret.properties` is local and ignored. Do not read, print, or commit secrets.

## ANTI-PATTERNS

- Do not duplicate Python AI planning logic in Java; keep Java as orchestration and proxy layer.
- Do not widen public security rules without checking `SecurityConfig`.
- Do not make network-dependent unit tests for ACE-Step or WiZ. Mock those surfaces.
- Do not allow arbitrary audio paths. Keep generated audio streaming constrained to approved generated/vendor roots.

## COMMANDS

```bash
./gradlew bootRun
./gradlew test
```

## TESTING NOTES

- Existing tests are JUnit 5/Spring Boot with Mockito-style unit coverage.
- Prefer behavior-level seams over reflection for new tests.
- High-value tests: controller routing, WiZ service edge cases, audio path restrictions, AI fallback/error paths.
