# NOOS 프론트엔드

NOOS AI 모듈의 React/Vite 프론트엔드입니다.

## 담당 역할

- Muse 연결과 브라우저 측 신호 처리
- 상태 설문과 사용자가 이해하기 쉬운 현재 상태 요약
- 행성 선택과 여행 세션 흐름
- 음악 생성 진행 화면, 플레이어, 대시보드 UI
- 연구 기반 CCT와 secondary RGB 조명 미리보기
- Spring Boot 백엔드 API 호출

## 명령

```bash
npm install
npm run start
npm run build
npm run test
```

## 주요 파일

- `src/App.jsx`: 라우트 단위 앱 구성
- `src/index.jsx`: 프론트엔드 진입점과 브라우저 호환성 설정
- `src/lib/env.js`: 백엔드 URL 해석
- `src/lib/eegAnalysisApi.js`: Muse/EEG 백엔드 API 클라이언트
- `src/lib/noosAiApi.js`: NOOS AI 개입과 보조 API 클라이언트
- `src/lib/muse/`: Muse 브라우저 클라이언트와 신호 처리
- `src/components/features/auth/Login.jsx`: Muse 로그인/측정 흐름
- `src/components/features/auth/MuseSignalDashboard.jsx`: 읽기 쉬운 EEG 상태 대시보드
- `src/components/features/solar/SolarExplorer.jsx`: 행성 선택
- `src/components/features/solar/SpaceTravel.jsx`: 생성/플레이어/대시보드 상태 머신
- `src/components/features/solar/travel/lightingPreview.js`: 정적 조명 미리보기 대체값
- `src/components/features/solar/travel/TravelLightingPreview.jsx`: 조명 표시 컴포넌트

## 백엔드 URL

백엔드 URL은 `src/lib/env.js`와 Vite 환경 설정에서 가져와야 합니다. 기능 컴포넌트 안에 `localhost`를 직접 하드코딩하지 않습니다.

## 조명 표시

현재 조명 모델은 아래 구조입니다.

- Primary: CCT 값이며 화면에는 `Primary CCT`로 표시됩니다.
- Secondary: 행성 RGB 톤이며 화면에는 `Secondary tone`으로 표시됩니다.

백엔드에서 생성된 응답은 `src/lib/noosAiApi.js`에서 정규화합니다. 정적 대체값은 `src/components/features/solar/travel/lightingPreview.js`에 있습니다.
