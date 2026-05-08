# NOOS System Flow Diagrams

이 폴더는 NOOS 프로젝트의 전체 작동 구조를 처음 보는 사람이 이해할 수 있게 정리한 도식 모음입니다.

## Files

- `01-overall-system.mmd`: 전체 시스템 큰 그림
- `02-user-session-flow.mmd`: 사용자가 세션을 시작해서 종료하기까지의 흐름
- `03-module-responsibilities.mmd`: Frontend, Backend, Python AI, ACE-Step, WiZ의 역할 분리
- `04-music-generation-flow.mmd`: 음악 생성 세부 흐름
- `05-lighting-sync-restore.mmd`: 조명 동기화와 원상복구 흐름
- `06-current-runtime-layout.mmd`: 현재 Mac/Windows/전구 실행 배치
- `07-file-responsibility-map.mmd`: 주요 파일 책임 지도

## 1. Overall System

```mermaid
flowchart LR
  U["사용자"] --> F["Frontend React<br/>화면, Muse 연결, 행성 선택, 플레이어"]
  F --> B["Backend Spring Boot<br/>API 관문, 생성 orchestration, 파일 제공"]
  B --> AI["Python AI Engine<br/>상태 분석, 음악/조명 계획 생성"]
  AI --> ACE["Windows 4080 ACE-Step<br/>실제 음악 mp3 생성"]
  B --> WIZ["WiZ 전구 4개<br/>로컬 UDP 조명 제어"]
  B --> G["generated 폴더<br/>생성된 mp3 저장"]
  G --> F
```

## 2. User Session Flow

```mermaid
flowchart TD
  A["1. 사용자가 Muse 측정 또는 설문 입력"] --> B["2. 현재 상태 분석<br/>집중도, 긴장도, 피로도 등"]
  B --> C["3. 행성 선택<br/>행성은 목표 상태 프리셋"]
  C --> D["4. 세션 생성 요청"]
  D --> E["5. AI가 음악 스펙과 조명 스펙 생성"]
  E --> F["6. ACE-Step이 음악 생성"]
  E --> G["7. WiZ 조명이 primary/secondary 값으로 전환"]
  F --> H["8. 플레이어에서 음악 재생"]
  G --> H
  H --> I["9. 사용자가 페이지를 나가면 조명 원래대로 복구"]
  H --> J["10. 피드백 저장 후 다음 세션 개선"]
```

## 3. Module Responsibilities

```mermaid
flowchart TB
  FE["Frontend"] --> FE1["Muse 연결<br/>브라우저 Web Bluetooth"]
  FE --> FE2["상태 화면<br/>사용자가 지금 어떤 상태인지 설명"]
  FE --> FE3["행성 선택과 여행 화면"]
  FE --> FE4["음악 플레이어와 조명 미리보기"]
  FE --> FE5["페이지 이탈 시 조명 복구 요청"]

  BE["Backend"] --> BE1["프론트 요청 접수"]
  BE --> BE2["Python AI CLI 실행"]
  BE --> BE3["ACE-Step 생성 결과 mp3 다운로드"]
  BE --> BE4["생성 mp3를 프론트에 제공"]
  BE --> BE5["WiZ 전구에 UDP 명령 전송"]

  AI["Python AI"] --> AI1["뇌파/설문 상태를 정규화"]
  AI --> AI2["행성 목표 상태와 현재 상태 비교"]
  AI --> AI3["음악 프롬프트와 ACE-Step 요청 생성"]
  AI --> AI4["논문 기반 조명 CCT/RGB 계획 생성"]
```

## 4. Music Generation Flow

```mermaid
sequenceDiagram
  participant F as Frontend
  participant B as Backend
  participant P as Python AI
  participant A as ACE-Step 4080 PC
  participant G as generated folder

  F->>B: POST /api/ai/intervention/music
  B->>P: 현재 상태, 행성, duration 전달
  P-->>B: interventionResult, music_spec, lighting_spec, ace_step_request
  B->>A: ACE-Step 생성 요청
  A-->>B: 생성된 audio 결과
  B->>G: mp3 저장
  B-->>F: audioUrl, interventionResult, wizLighting 상태
  F->>F: 플레이어에서 생성 음악 재생
```

## 5. Lighting Sync And Restore

```mermaid
sequenceDiagram
  participant B as Backend
  participant W as WiZ bulbs
  participant F as Frontend page

  B->>W: 세션 시작 전 getPilot 상태 저장
  B->>W: primary 조명 적용, 색온도 CCT
  B->>W: secondary 조명 적용, RGB 색상
  B->>W: 10초 간격 반복
  F->>B: 사용자가 페이지 이탈, POST /api/lighting/wiz/stop
  B->>W: 저장해둔 원래 상태 복구
```

## 6. Current Runtime Layout

```mermaid
flowchart LR
  MAC["MacBook"] --> V["Frontend<br/>localhost:3000"]
  MAC --> S["Backend<br/>localhost:8080"]
  S --> PY["Python noos_ai CLI<br/>Mac local"]
  S --> WIN["Windows RTX 4080<br/>ACE-Step API :8011"]
  S --> BULB["WiZ bulbs<br/>UDP 38899"]
  GEM["Gemma<br/>127.0.0.1:8091<br/>현재 기본 비활성"] -. optional .-> S
```

## 7. File Responsibility Map

```mermaid
flowchart TD
  A["frontend/src/components/features/auth/MuseSignalDashboard.jsx<br/>Muse 측정 결과를 사용자가 이해하기 쉽게 표시"]
  B["frontend/src/components/features/solar/SpaceTravel.jsx<br/>세션 생성, 플레이어, 조명 복구 흐름 제어"]
  C["frontend/src/lib/noosAiApi.js<br/>백엔드 API 호출 helper"]
  D["backend/.../NoosAiController.java<br/>/api/ai 엔드포인트"]
  E["backend/.../NoosAiService.java<br/>Python, ACE-Step, mp3 저장 orchestration"]
  F["backend/.../WizLightingService.java<br/>WiZ 조명 제어와 원상복구"]
  G["ai/noos_ai/sessions/recognition.py<br/>현재 상태 분석"]
  H["ai/noos_ai/sessions/intervention.py<br/>세션 전체 설계 묶음 생성"]
  I["ai/noos_ai/intervention/music.py<br/>ACE-Step 음악 요청 생성"]
  J["ai/noos_ai/intervention/lighting.py<br/>조명 스펙 생성"]
  K["ai/noos_ai/integrations/ace_step.py<br/>ACE-Step API 통신"]

  A --> B --> C --> D --> E
  E --> G
  E --> H
  H --> I
  H --> J
  E --> K
  E --> F
```

