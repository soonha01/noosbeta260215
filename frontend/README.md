# NOOS Frontend

NOOS의 단일 실행 프론트엔드입니다. 로컬에서는 이 폴더의 Vite 앱만 `localhost:3000`으로 실행합니다. 기존 Next 기반 랜딩 페이지와 AI Objet 제품 설명 페이지는 정적 산출물로 변환되어 Vite 안에 포함됩니다.

## 실행

```bash
npm install
npm start
```

- 실행 포트: `http://localhost:3000`
- 기존 점프 페이지: `http://localhost:3000/`
- 점프 이후 랜딩 페이지: `http://localhost:3000/` 안에서 `public/embedded/noos-landing/index.html`을 임베드
- 제품 설명 페이지: `http://localhost:3000/ai-objet`
- 로그인 시작 링크: `http://localhost:3000/?login=start`

`localhost:3001`, `localhost:3002`는 더 이상 프론트 런타임으로 사용하지 않습니다.

## 빌드

```bash
npm run build
```

빌드는 아래 순서로 동작합니다.

1. `scripts/sync-embedded-sites.mjs`가 두 Next 앱을 정적 export로 빌드합니다.
2. 산출물을 `public/embedded/noos-landing`, `public/embedded/ai-objet`에 복사합니다.
3. Vite가 최종 앱을 빌드합니다.

Next 쪽 페이지를 수정한 뒤 개발 서버를 이미 켜둔 상태라면 아래 명령으로 정적 산출물만 다시 동기화할 수 있습니다.

```bash
npm run sync:embedded
```

## 폴더 구조

```text
frontend/
  README.md
  package.json
  scripts/
    sync-embedded-sites.mjs      # Next 정적 페이지를 Vite public으로 동기화
  public/
    embedded/
      noos-landing/              # 3002에서 쓰던 메인 랜딩 정적 산출물
      ai-objet/                  # 3001에서 쓰던 제품 설명 정적 산출물
    media/                       # Vite 앱에서 직접 쓰는 이미지, 폰트, 오디오
  src/
    index.jsx                    # React mount 전용 진입점
    App.jsx                      # Router, route lazy loading, route fallback
    components/
      brand/                     # NOOS 로고
      features/                  # 로그인, 측정, 행성 선택, 음악/조명 세션
      layout/                    # 공통 레이아웃, iframe 래퍼, 화면 전환 overlay
      navigation/                # Vite 앱 고정 내비게이션
      ui/                        # 버튼, 텍스트, 시각 효과 컴포넌트
    lib/                         # API 클라이언트, 환경값, Muse 유틸
    pages/
      root/                      # / 라우트: 점프, 로그인, 메인 랜딩 iframe 상태 관리
      home/                      # 점프 페이지 전용 화면
      about/                     # /about 라우트
      ai-objet/                  # /ai-objet 라우트
      solar/                     # /solar-explorer, /space-travel route wrappers
```

## 관련 소스 위치

Vite에서 실행되는 실제 프론트는 이 폴더입니다.

```text
noosbeta260215/frontend
```

정적 산출물의 원본 Next 프로젝트는 아래에 남아 있습니다. 이 둘은 백업 겸 원본 편집 위치이며 직접 실행하지 않습니다.

```text
compute-the-platform-to-build-and-ship-ai-agents
noosbeta260215/ai-objet-next
```

두 백업 프로젝트의 `npm run dev`, `npm start`는 의도적으로 막아두었습니다. 수정이 필요하면 원본 파일을 편집한 뒤 `frontend`에서 `npm run sync:embedded` 또는 `npm run build`를 실행하세요.

## 주요 파일

- `src/index.jsx`: React 앱을 DOM에 mount하는 최소 진입점
- `src/App.jsx`: `/`, `/about`, `/ai-objet`, `/solar-explorer`, `/space-travel` 라우팅
- `src/pages/root/NoosRootPage.jsx`: 기존 점프 페이지, 로그인 화면, 점프 이후 랜딩 iframe 전환
- `src/components/layout/EmbeddedSiteFrame.jsx`: 정적 Next 페이지를 전체 화면으로 임베드
- `src/components/layout/FadeTransitionOverlay.jsx`: 로그인/AI Objet 등 화면 이동 시 쓰는 공통 fade overlay
- `src/pages/ai-objet/AIObjetPage.jsx`: 제품 설명 페이지 라우트
- `src/pages/about/AboutUsPage.jsx`: About 페이지 라우트
- `src/pages/solar/SolarExplorerPage.jsx`: 행성 선택 라우트 wrapper
- `src/pages/solar/SpaceTravelPage.jsx`: 우주여행 세션 라우트 wrapper
- `src/lib/env.js`: 백엔드 URL, 공개 asset 경로, AI Objet 내부 링크 기본값
- `src/lib/noosAiApi.js`: NOOS AI 개입 API 클라이언트
- `src/lib/eegAnalysisApi.js`: EEG 분석 API 클라이언트
## 백엔드 연결

백엔드 주소는 Vite 환경값으로 관리합니다. 프론트 컴포넌트 안에 `localhost`를 직접 하드코딩하지 않습니다.

```bash
VITE_API_BASE_URL=http://localhost:8080
VITE_BACKEND_URL=http://localhost:8080
```

Spring Boot CORS도 `http://localhost:3000` 기준으로 맞춰져 있습니다.
