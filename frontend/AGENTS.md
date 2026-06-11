# 프론트엔드 지식 베이스

## 한눈에 보기

`frontend/`는 이 저장소의 유일한 실제 브라우저 앱입니다. Vite/React가 `3000`번 포트에서 실행되며, 두 개의 Next 정적 export가 `public/embedded` 아래로 복사됩니다.

## 폴더 구조

```text
frontend/
+-- src/                 # 실제 React 소스입니다.
+-- scripts/             # 임베디드 Next export 동기화 스크립트입니다.
+-- public/embedded/     # Git에서 무시하는 생성 정적 export입니다.
+-- public/media/        # Vite 앱이 사용하는 원본 media asset입니다.
+-- build/               # Vite 빌드 결과물입니다. Git에서 무시합니다.
`-- package.json         # Vite 스크립트와 임베디드 sync 스크립트를 정의합니다.
```

## 어디를 보면 되는가

| 작업 | 위치 | 설명 |
| --- | --- | --- |
| 개발/빌드 스크립트 | `package.json` | `build`는 `sync:embedded && vite build`를 실행합니다. |
| Vite 설정 | `vite.config.js` | 포트 `3000`, output `build`, `@` alias를 설정합니다. |
| 임베디드 sync | `scripts/sync-embedded-sites.mjs` | Next export를 빌드/복사하고 asset URL을 고칩니다. |
| 런타임 앱 | `src/` | 자세한 규칙은 `src/AGENTS.md`를 봅니다. |
| 정적 랜딩 output | `public/embedded/noos-landing/` | sibling workspace에서 생성됩니다. |
| 정적 AI Objet output | `public/embedded/ai-objet/` | `../ai-objet-next`에서 생성됩니다. |

## 작업 규칙

- 로컬 프론트엔드 작업은 여기서 `npm run start`를 사용합니다. 예전 `localhost:3001` 또는 `localhost:3002` dev 서버를 되살리지 않습니다.
- Vite는 `VITE_*`와 legacy `REACT_APP_*` env 이름을 모두 받습니다.
- production build output은 `dist`가 아니라 `build`입니다.
- Vite build plugin은 `build/mock-data`를 제거합니다.
- `npm run build`는 `public/embedded/**` 아래의 무시된 생성 파일을 다시 만듭니다.
- 메인 랜딩 원본은 `../../compute-the-platform-to-build-and-ship-ai-agents`이고, AI Objet 원본은 `../ai-objet-next`입니다.

## 피해야 할 패턴

- `public/embedded/**`를 손으로 수정하지 않습니다. 원본 Next 앱을 고친 뒤 `npm run sync:embedded`를 다시 실행합니다.
- 컴포넌트에서 백엔드 URL을 직접 만들지 않습니다. 환경값 해석은 `src/lib/env.js`에 둡니다.
- `src/legacy/vite-landing`을 활성 UI로 취급하지 않습니다.
- 기존 Vitest coverage를 제거하지 않습니다. `npm test`는 작성된 테스트를 실제로 실행해야 합니다.

## 명령어

```bash
npm run start
npm run sync:embedded
npm run build
npm run test
```

## 참고

- `sync:embedded`를 실행하려면 두 Next 원본 프로젝트의 dependency가 준비되어 있어야 합니다.
- `public/embedded/**`는 원본 프로젝트에서 생성되는 결과물이므로 손으로 수정하지 않습니다.
