# 프로젝트 지식 베이스

**생성일:** 2026-06-10 KST

## 한눈에 보기

NOOS는 로컬에서 실행되는 멀티모달 프로토타입입니다. React/Vite 프론트엔드, Spring Boot 백엔드, Python EEG 인식/개입 엔진, 원격 ACE-Step 음악 생성, WiZ 조명 제어가 하나의 흐름으로 연결됩니다.

## 폴더 구조

```text
noosbeta260215/
+-- frontend/        # 실제 브라우저 런타임입니다. Vite가 :3000에서 실행됩니다.
+-- backend/         # Spring Boot API, Python CLI 연결, 오디오 프록시, WiZ 제어를 담당합니다.
+-- ai/              # EEG 인식과 개입 명세를 만드는 Python 패키지입니다.
+-- ai-objet-next/   # 임베디드 AI Objet 정적 페이지의 원본 Next 프로젝트입니다.
+-- docs/            # 시스템 전체 런타임과 아키텍처 문서를 둡니다.
`-- ai/vendor/       # 무시되는 upstream ACE-Step 체크아웃입니다. 앱 소스가 아닙니다.
```

## 어디를 보면 되는가

| 작업 | 위치 | 설명 |
| --- | --- | --- |
| 프론트엔드 라우트 지도 | `frontend/src/App.jsx` | 루트, AI Objet, solar, profile, records 라우트를 lazy route로 묶습니다. |
| 루트 진입/랜딩 흐름 | `frontend/src/pages/root/NoosRootPage.jsx` | 정적 랜딩 export를 iframe으로 보여줍니다. |
| 여행 생성/플레이어 흐름 | `frontend/src/components/features/solar/SpaceTravel.jsx` | 여정 상태, 오디오 큐, 기록 저장, 종료 정리를 조율합니다. |
| 여행 하위 컴포넌트 | `frontend/src/components/features/solar/travel/` | 플레이어, 생성 화면, 대시보드 UI, 관련 훅이 있습니다. |
| 프론트엔드 API/env | `frontend/src/lib/env.js`, `frontend/src/lib/noosAiApi.js`, `frontend/src/lib/eegAnalysisApi.js` | 백엔드 URL과 API 호출 규칙은 이 계층에 모읍니다. |
| Muse 브라우저 연동 | `frontend/src/lib/muse/` | Web Bluetooth 연결과 라이브 세션 버퍼를 관리합니다. |
| 백엔드 AI 엔드포인트 | `backend/src/main/java/com/noos/backend/ai/controller/NoosAiController.java` | `/api/ai/**` 경로를 담당합니다. |
| EEG 엔드포인트 | `backend/src/main/java/com/noos/backend/eeg/controller/EegController.java` | `/api/eeg/**` 경로를 담당합니다. |
| Python 연결부 | `backend/src/main/java/com/noos/backend/ai/service/NoosAiService.java` | `python -m noos_ai.cli`를 별도 프로세스로 실행합니다. |
| WiZ 조명 | `backend/src/main/java/com/noos/backend/lighting/service/WizLightingService.java` | WiZ 적용, 교대 실행, 복구를 제공하는 facade입니다. |
| AI 세션 라우팅 | `ai/noos_ai/sessions/registry.py` | `recognition`, `intervention` 세션을 매핑합니다. |
| 개입 명세 | `ai/noos_ai/intervention/` | 행성 목표, 조명, 음악, 계획 로직이 있습니다. |
| ACE-Step 클라이언트 | `ai/noos_ai/integrations/ace_step.py` | 요청 payload와 원격 API 호출을 담당합니다. |

## 작업 규칙

- `frontend/`만 실제 프론트엔드 런타임입니다. 예전 대체 프론트엔드 dev 포트는 사용하지 않습니다.
- `frontend npm run build`는 Vite 빌드 전에 `sync:embedded`를 먼저 실행합니다.
- 메인 랜딩 원본은 이 저장소 밖의 `../compute-the-platform-to-build-and-ship-ai-agents`에 있습니다.
- `ai-objet-next/`는 임베디드 정적 export 원본입니다. 실수로 dev 서버를 띄우지 않도록 `dev`, `start` 스크립트는 의도적으로 실패합니다.
- 백엔드 설정은 `spring.profiles.include=secret`을 포함합니다. 로컬 자격 증명은 Git에서 무시되는 `application-secret.properties`에만 둡니다.
- 백엔드는 temp JSON과 `python -m noos_ai.cli`로 Python 패키지를 실행합니다. Java가 AI Python 모듈을 직접 import하지 않습니다.
- 시스템 전체 문서는 `docs/`에 둡니다. AI 연구 문서와 Windows/ACE 인수인계 문서는 `ai/docs/`에 둡니다.

## 피해야 할 패턴

- `frontend/public/embedded/**`를 손으로 수정하지 않습니다. 원본 Next 프로젝트에서 다시 생성합니다.
- 프론트엔드 컴포넌트에 `http://localhost:8080` 같은 하드코딩을 복사하지 않습니다. `frontend/src/lib/env.js`를 사용합니다.
- `ai-objet-next npm run dev`나 `npm start`를 실행하지 않습니다. 임베디드 산출물이 필요하면 `build:embedded`를 사용합니다.
- `ai/generated`, `.venv`, `.cache`, `build`, `.gradle`, `.next`, `out`, `node_modules`는 소스가 아닙니다.
- `application-secret.properties`의 값을 출력하거나 커밋하지 않습니다.
- EEG에서 나온 설명을 진단이나 의료 조언처럼 표현하지 않습니다.
- Mac 백엔드 기준에서 원격 ACE-Step host가 localhost라고 가정하지 않습니다. 설정된 host와 port를 확인합니다.
- `ai/vendor/ACE-Step-1.5/AGENTS.md`를 NOOS 루트 지침으로 취급하지 않습니다.

## 명령어

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

## 참고

- 이 저장소에는 자체 CI workflow나 Makefile이 없습니다. 검증은 하위 프로젝트별로 수동 실행합니다.
- 프론트엔드 테스트는 Vitest입니다. 공개 UI/API 표면을 중심으로 동작 테스트를 작성합니다.
- 백엔드 테스트는 JUnit 5/Spring Boot 기반이며, Mockito 스타일 단위 테스트와 controller 테스트를 함께 사용합니다.
- AI 테스트는 pytest가 아니라 표준 `unittest`를 사용합니다.
