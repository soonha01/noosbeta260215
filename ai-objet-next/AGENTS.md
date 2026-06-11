# AI OBJET NEXT 지식 베이스

## 한눈에 보기

`ai-objet-next/`는 프론트엔드 안에 임베드되는 AI Objet 정적 페이지의 원본 프로젝트입니다. 이 저장소에서 사용자-facing 프론트엔드 dev 서버로 실행하는 프로젝트가 아닙니다.

## 폴더 구조

```text
ai-objet-next/
+-- app/              # Next app router 진입점입니다.
+-- components/       # 섹션과 UI 컴포넌트를 둡니다.
+-- hooks/
+-- lib/
+-- public/           # 원본 정적 asset을 둡니다.
+-- styles/
+-- out/              # 정적 export 결과물입니다. Git에서 무시합니다.
`-- package.json
```

## 어디를 보면 되는가

| 작업 | 위치 | 설명 |
| --- | --- | --- |
| 페이지 진입점 | `app/page.tsx` | AI Objet 본문을 구성합니다. |
| 레이아웃 metadata | `app/layout.tsx` | 정적 페이지의 공통 frame을 정의합니다. |
| 공통 UI | `components/ui/` | shadcn 스타일의 큰 공통 컴포넌트 묶음입니다. |
| 섹션 | `components/sections/` | 제품 페이지의 주요 섹션을 나눠 둡니다. |
| export 설정 | `next.config.mjs` | 정적 export, basePath, 이미지 최적화 비활성화를 설정합니다. |
| 임베디드 빌드 스크립트 | `package.json` | `build:embedded`만 정상 사용 대상으로 봅니다. |

## 작업 규칙

- `dev`와 `start`는 의도적으로 오류를 내고 종료합니다. 예전 `:3001`/`:3002` dev 서버가 실수로 되살아나는 것을 막기 위한 장치입니다.
- 임베디드 산출물을 만들 때는 `NOOS_STATIC_EXPORT=true`, `NOOS_EMBED_BASE_PATH=/embedded/ai-objet`와 함께 `npm run build:embedded`를 사용합니다.
- 일반적인 호출자는 `frontend/scripts/sync-embedded-sites.mjs`입니다. 이 스크립트가 `out/`을 `frontend/public/embedded/ai-objet`로 복사합니다.
- `next.config.mjs`는 정적 export를 위해 TypeScript 빌드 오류를 무시하고 이미지 최적화를 끕니다.
- asset 경로는 사이트 루트가 아니라 `/embedded/ai-objet` 아래에서 정상 동작해야 합니다.

## 피해야 할 패턴

- 이 프로젝트를 사용자-facing 프론트엔드로 직접 실행하지 않습니다.
- `frontend/public/embedded/ai-objet` 아래에 복사된 파일을 손으로 수정하지 않습니다.
- 정적 export를 깨뜨리는 런타임 전용 dependency를 추가하지 않습니다.
- Next 이미지 최적화 서버가 있다고 가정하지 않습니다. export 결과는 정적 asset으로 동작합니다.

## 명령어

```bash
npm run build:embedded
npm run lint
```

## 참고

- 다른 임베디드 랜딩 페이지의 원본은 이 폴더가 아닙니다. sibling workspace인 `../compute-the-platform-to-build-and-ship-ai-agents`에 있습니다.
