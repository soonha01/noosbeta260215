# 백엔드 지식 베이스

## 한눈에 보기

`backend/`는 Spring Boot 3.4 기반 API입니다. HTTP 라우팅, 인증/게시판/채팅 저장, Python AI orchestration, 생성 오디오 프록시, WiZ UDP 제어를 담당합니다.

## 폴더 구조

```text
backend/
+-- build.gradle
+-- src/main/java/com/noos/backend/
|   +-- ai/        # NOOS AI 엔드포인트와 Python/ACE-Step 연결부입니다.
|   +-- eeg/       # EEG 세션/결과 엔드포인트와 저장소입니다.
|   +-- lighting/  # WiZ 적용, 상태 조회, 복구를 담당합니다.
|   +-- auth/      # 인증, 관리자, OAuth/session 지원 영역입니다.
|   +-- board/     # 게시글, 댓글, 좋아요를 담당합니다.
|   +-- chat/      # websocket과 채팅방을 담당합니다.
|   `-- config/    # CORS, security, websocket 설정입니다.
`-- src/main/resources/
    +-- application.properties
    +-- application-secret.properties  # Git에서 무시하는 로컬 secret입니다.
    `-- mappers/
```

## 어디를 보면 되는가

| 작업 | 위치 | 설명 |
| --- | --- | --- |
| Boot 진입점 | `src/main/java/com/noos/backend/BackendApplication.java` | Spring Boot main입니다. |
| 공개 API/security 규칙 | `config/SecurityConfig.java`, `config/CorsConfig.java` | 로컬 프로토타입 접근 규칙을 정의합니다. |
| AI 엔드포인트 | `ai/controller/NoosAiController.java` | `/api/ai/**`와 audio stream을 담당합니다. |
| AI orchestration | `ai/service/NoosAiService.java` | Python CLI, ACE-Step, audio 서비스를 묶는 얇은 facade입니다. |
| Python CLI 경계 | `ai/service/PythonCliClient.java` | 외부 Python process 실행을 담당합니다. |
| ACE-Step 경계 | `ai/service/AceStepClient.java` | health, prewarm, generation materialization을 담당합니다. |
| 오디오 스트리밍 | `ai/service/GeneratedAudioService.java`, `ai/service/NoosAiPaths.java` | 허용된 생성 오디오 root만 스트리밍합니다. |
| EEG 엔드포인트 | `eeg/controller/EegController.java` | `/api/eeg/**` 경로를 담당합니다. |
| WiZ 엔드포인트 | `lighting/controller/WizLightingController.java` | `/api/lighting/wiz/**` 경로를 담당합니다. |
| WiZ 동작 | `lighting/service/WizLightingService.java` | UDP 명령과 snapshot 복구를 조율합니다. |
| MyBatis SQL | `src/main/resources/mappers/**` | 도메인별 XML mapper입니다. |
| 런타임 설정 | `src/main/resources/application.properties` | 현재 ACE-Step/WiZ 설정의 기준입니다. |

## 작업 규칙

- Java toolchain은 17입니다. Gradle wrapper를 사용합니다.
- 백엔드는 `../ai`에서 `python -m noos_ai.cli`를 process로 실행합니다. Python 코드를 Java에서 직접 import하지 않습니다.
- 범용 `noos.ai.python-bin`은 `ai/.venv`가 있으면 그 Python으로 해석될 수 있습니다.
- 원격 ACE-Step을 localhost 프로세스처럼 자동 시작한다고 가정하지 않습니다.
- WiZ 세션 시작 시 현재 전구 pilot 상태를 snapshot으로 저장하고, stop 시 그 snapshot으로 복구합니다.
- `application-secret.properties`는 로컬 전용이며 Git에서 무시됩니다. secret 값을 읽거나 출력하거나 커밋하지 않습니다.

## 피해야 할 패턴

- Python AI planning 로직을 Java에 중복 구현하지 않습니다. Java는 orchestration과 proxy 계층으로 유지합니다.
- `SecurityConfig`를 확인하지 않고 공개 security 규칙을 넓히지 않습니다.
- ACE-Step이나 WiZ에 실제 네트워크로 의존하는 단위 테스트를 만들지 않습니다. 해당 표면은 mock 처리합니다.
- 임의 audio path를 허용하지 않습니다. 생성 오디오 streaming은 승인된 generated/vendor root로 제한합니다.

## 명령어

```bash
./gradlew bootRun
./gradlew test
```

## 테스트 참고

- 기존 테스트는 JUnit 5/Spring Boot 기반이며 Mockito 스타일 단위 coverage를 포함합니다.
- 새 테스트에서는 reflection보다 동작 수준 seam을 우선합니다.
- 우선순위가 높은 테스트는 controller routing, WiZ service edge case, audio path 제한, AI fallback/error path입니다.
