# Embedded Static Sites

`frontend/public/embedded/**` is generated output and is not source of truth.

Source projects:

- `../compute-the-platform-to-build-and-ship-ai-agents` -> `frontend/public/embedded/noos-landing`
- `ai-objet-next` -> `frontend/public/embedded/ai-objet`

Generation path:

```bash
cd frontend
npm run sync:embedded
```

`npm run build` runs `sync:embedded` before `vite build`, so embedded assets should only be refreshed through `frontend/scripts/sync-embedded-sites.mjs`.

Acceptance:

- Do not hand-edit files under `frontend/public/embedded/**`.
- A clean checkout should not track generated embedded diffs after `npm run build`.
- If embedded output changes are needed, change the source project first, then regenerate through `npm run sync:embedded`.
