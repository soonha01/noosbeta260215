# 프로젝트 구조

이 문서는 코드를 수정하기 전에 어느 폴더와 파일을 먼저 봐야 하는지 설명합니다. 기능이 여러 런타임에 걸쳐 있기 때문에, 수정 위치를 잘못 잡으면 프론트엔드, 백엔드, Python AI, 하드웨어 제어가 서로 어긋날 수 있습니다.

## 최상위 구조

```text
noosbeta260215/
├── README.md
├── docs/
├── ai/
├── backend/
└── frontend/
```

## `ai/`

Python AI 엔진입니다. 프론트엔드나 백엔드 없이도 CLI 테스트에서 독립 실행될 수 있어야 합니다. 이 계층은 EEG/설문 입력을 해석하고, 현재 상태와 목표 행성 사이의 개입 계획을 만들어 냅니다.

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
    ├── integrations/
    ├── intervention/
    └── sessions/
```

주요 책임:

- `noos_ai/sessions/recognition.py`: Muse EEG 또는 band summary를 현재 상태로 변환합니다.
- `noos_ai/sessions/intervention.py`: 현재 상태와 목표 행성을 받아 intervention bundle을 만듭니다.
- `noos_ai/intervention/planner.py`: 전환 방식, phase, 세션 길이를 계획합니다.
- `noos_ai/intervention/lighting_research.py`: 연구 기반 조명 program과 행성별 tone profile을 보관합니다.
- `noos_ai/intervention/lighting.py`: 최종 `lighting_spec`을 생성합니다.
- `noos_ai/intervention/lighting_hardware.py`: 하드웨어 전달 payload를 만듭니다.
- `noos_ai/intervention/music.py`: 음악 명세와 ACE-Step request payload를 구성합니다.
- `noos_ai/integrations/ace_step.py`: ACE-Step API client입니다.

테스트:

- `ai/tests/test_recognition_session.py`
- `ai/tests/test_intervention_session.py`

## `backend/`

Spring Boot API입니다. HTTP endpoint, 로컬 process 실행, 생성 오디오 proxy, WiZ 장치 명령을 담당합니다. 프론트엔드와 Python AI/ACE-Step/WiZ 사이의 orchestration 계층으로 보면 됩니다.

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

주요 책임:

- `ai/controller/NoosAiController.java`: `/api/ai/**`와 `/api/eeg/results`를 제공합니다.
- `ai/service/NoosAiService.java`: Python CLI 실행, ACE-Step prewarm/generation, 생성 오디오 proxy를 조율합니다.
- `lighting/controller/WizLightingController.java`: `/api/lighting/wiz/**`를 제공합니다.
- `lighting/service/WizLightingService.java`: WiZ UDP 명령, primary CCT와 secondary RGB 교대 적용을 담당합니다.
- `config/SecurityConfig.java`: 공개 API 접근 규칙을 정의합니다.
- `config/CorsConfig.java`: 프론트엔드/백엔드 로컬 CORS를 설정합니다.

테스트:

- `backend/src/test/java/com/noos/backend/ai/service/NoosAiServiceTest.java`
- `backend/src/test/java/com/noos/backend/auth/service/AuthServiceTest.java`

## `frontend/`

React/Vite 앱입니다. UI 상태, Muse 브라우저 연동, 행성/여행 화면, 백엔드 API 호출을 담당합니다. 사용자가 실제로 조작하는 흐름은 대부분 이 계층에서 시작합니다.

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

주요 책임:

- `src/lib/env.js`: 백엔드 URL과 공개 asset 경로를 해석합니다.
- `src/lib/eegAnalysisApi.js`: EEG 분석 API client입니다.
- `src/lib/noosAiApi.js`: intervention, dashboard, lighting preview API helper입니다.
- `src/lib/muse/`: Web Bluetooth Muse client와 signal processing을 둡니다.
- `src/components/features/auth/`: 로그인, Muse 연결, 상태 설문, 상태 해석 UI를 담당합니다.
- `src/components/features/solar/SolarExplorer.jsx`: 행성 선택 화면입니다.
- `src/components/features/solar/SpaceTravel.jsx`: 생성, 플레이어, 대시보드 흐름을 제어하는 controller입니다.
- `src/components/features/solar/travel/`: 여행 페이지 하위 컴포넌트와 상수를 둡니다.

## 런타임이 소유하는 폴더

아래 폴더는 소스 코드가 아닙니다. 빌드, 실행, dependency 설치 과정에서 생기는 결과물이므로 기능 수정 대상으로 보지 않습니다.

- `ai/generated/`: 생성된 오디오와 출력 artifact입니다.
- `ai/.cache/`, `ai/.venv/`: 로컬 Python 런타임 상태입니다.
- `backend/build/`, `backend/.gradle/`: Gradle output/cache입니다.
- `frontend/build/`, `frontend/node_modules/`: 프론트엔드 output/dependency입니다.

## 수정 위치 가이드

- 행성 목표 축을 바꾸려면 `ai/noos_ai/intervention/planet_profiles.py`를 수정합니다.
- 조명 연구 기반 CCT/lux/pattern을 바꾸려면 `ai/noos_ai/intervention/lighting_research.py`를 수정합니다.
- WiZ 장치 동작을 바꾸려면 `backend/src/main/java/com/noos/backend/lighting/service/WizLightingService.java`를 수정합니다.
- 음악 prompt/render planning을 바꾸려면 `ai/noos_ai/intervention/music.py`를 수정합니다.
- ACE-Step model/API 동작을 바꾸려면 `ai/noos_ai/integrations/ace_step.py`와 백엔드 `application.properties`를 함께 확인합니다.
- 생성된 여행 UI를 바꾸려면 `frontend/src/components/features/solar/SpaceTravel.jsx`와 `frontend/src/components/features/solar/travel/`를 수정합니다.
- Muse 상태 설명 UI를 바꾸려면 `frontend/src/components/features/auth/MuseSignalDashboard.jsx`를 수정합니다.
