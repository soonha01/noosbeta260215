# FRONTEND KNOWLEDGE BASE

## OVERVIEW

`frontend/` is the single live browser app: Vite/React on port `3000`, with two embedded Next static exports copied into `public/embedded`.

## STRUCTURE

```text
frontend/
+-- src/                 # active React source
+-- scripts/             # embedded Next export sync
+-- public/embedded/     # ignored generated static exports
+-- public/media/        # source media assets used by Vite
+-- build/               # Vite output, ignored
`-- package.json         # Vite scripts plus embedded sync
```

## WHERE TO LOOK

| Task | Location | Notes |
| --- | --- | --- |
| Dev/build scripts | `package.json` | `build` runs `sync:embedded && vite build` |
| Vite settings | `vite.config.js` | Port `3000`, output `build`, `@` alias |
| Embedded sync | `scripts/sync-embedded-sites.mjs` | Builds/copies Next exports and rewrites asset URLs |
| Runtime app | `src/` | See `src/AGENTS.md` |
| Static landing output | `public/embedded/noos-landing/` | Generated from sibling workspace |
| Static AI Objet output | `public/embedded/ai-objet/` | Generated from `../ai-objet-next` |

## CONVENTIONS

- Use `npm run start` here for local frontend work. Do not revive old `localhost:3001` or `localhost:3002` dev servers.
- Vite accepts both `VITE_*` and legacy `REACT_APP_*` env names.
- Production build output is `build`, not `dist`.
- The Vite build plugin removes `build/mock-data`.
- `npm run build` regenerates ignored files under `public/embedded/**`.
- Main landing source is `../../compute-the-platform-to-build-and-ship-ai-agents`; AI Objet source is `../ai-objet-next`.

## ANTI-PATTERNS

- Do not hand-edit `public/embedded/**`; edit the source Next app and rerun `npm run sync:embedded`.
- Do not use direct backend URLs in components. Put environment resolution in `src/lib/env.js`.
- Do not treat `src/legacy/vite-landing` as active UI.
- Do not remove existing Vitest coverage; `npm test` should exercise authored tests.

## COMMANDS

```bash
npm run start
npm run sync:embedded
npm run build
npm run test
```

## NOTES

- `sync:embedded` requires both Next source projects to have their dependencies available.
- `public/embedded/**` is generated from source projects and should not be edited by hand.
