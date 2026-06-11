# AI OBJET NEXT KNOWLEDGE BASE

## OVERVIEW

`ai-objet-next/` is the source project for the embedded AI Objet static page. It is not a live dev server in this repo.

## STRUCTURE

```text
ai-objet-next/
+-- app/              # Next app router entry
+-- components/       # sections and UI components
+-- hooks/
+-- lib/
+-- public/           # source static assets
+-- styles/
+-- out/              # static export output, ignored
`-- package.json
```

## WHERE TO LOOK

| Task | Location | Notes |
| --- | --- | --- |
| Page entry | `app/page.tsx` | Main AI Objet content |
| Layout metadata | `app/layout.tsx` | Static page frame |
| Shared UI | `components/ui/` | Large shadcn-style component set |
| Sections | `components/sections/` | Product page sections |
| Export config | `next.config.mjs` | Static export, basePath, unoptimized images |
| Embedded build script | `package.json` | `build:embedded` only |

## CONVENTIONS

- `dev` and `start` intentionally exit with an error. This prevents accidental `:3001`/`:3002` revival.
- Use `npm run build:embedded` with `NOOS_STATIC_EXPORT=true` and `NOOS_EMBED_BASE_PATH=/embedded/ai-objet`.
- `frontend/scripts/sync-embedded-sites.mjs` is the normal caller; it copies `out/` to `frontend/public/embedded/ai-objet`.
- `next.config.mjs` ignores TypeScript build errors and disables image optimization for static export.
- Asset paths must work under `/embedded/ai-objet`, not site root.

## ANTI-PATTERNS

- Do not run this as the user-facing frontend.
- Do not hand-edit the copied files under `frontend/public/embedded/ai-objet`.
- Do not add runtime-only dependencies that break static export.
- Do not assume optimized Next image serving; exports use static assets.

## COMMANDS

```bash
npm run build:embedded
npm run lint
```

## NOTES

- The other embedded landing page source is not here; it lives in sibling workspace `../compute-the-platform-to-build-and-ship-ai-agents`.
