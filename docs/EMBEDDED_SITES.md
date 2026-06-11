# 임베디드 정적 사이트

`frontend/public/embedded/**`는 생성된 결과물입니다. 실제 원본(source of truth)이 아니므로 직접 수정하지 않습니다.

원본 프로젝트:

- `../compute-the-platform-to-build-and-ship-ai-agents` -> `frontend/public/embedded/noos-landing`
- `ai-objet-next` -> `frontend/public/embedded/ai-objet`

생성 경로:

```bash
cd frontend
npm run sync:embedded
```

`npm run build`는 `vite build` 전에 `sync:embedded`를 실행합니다. 따라서 임베디드 asset은 `frontend/scripts/sync-embedded-sites.mjs`를 통해서만 새로 고쳐야 합니다.

완료 기준:

- `frontend/public/embedded/**` 아래 파일을 손으로 수정하지 않습니다.
- clean checkout에서 `npm run build`를 실행한 뒤 생성된 embedded diff가 Git에 잡히지 않아야 합니다.
- 임베디드 output 변경이 필요하면 먼저 원본 프로젝트를 수정하고, 그 다음 `npm run sync:embedded`로 다시 생성합니다.
