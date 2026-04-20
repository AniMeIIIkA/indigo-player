# client/packages/indigo-player/CLAUDE.md

Claude Code guide for the vendored video player. **Read the monorepo root [`../../../CLAUDE.md`](../../../CLAUDE.md) and [`../../CLAUDE.md`](../../CLAUDE.md) first.** Upstream project documentation is in `README.md`, `docs/`, and on [the original author's docs site](https://matvp91.github.io/indigo-player).

## Golden rule

**Do not assume how something works or should work. Ask the user.** This is a fork of an open-source player that AXL consumes across admin, school, and webinar apps for course videos and live streams. Breaking the module/plugin API silently regresses video playback for every learner. Confirm before touching `src/core/`, the module registry, or the public API surface in `src/index.ts`.

## What this is

**Git submodule** maintained at `https://github.com/AniMeIIIkA/indigo-player.git`, branch `feature/master`. Originally [`matvp91/indigo-player`](https://github.com/matvp91/indigo-player) (MIT), extended for AXL's needs. Published into the outer pnpm workspace as `@axl/indigo-player` and consumed by the client apps (admin, webinar, custom-school through `ez-editor-viewer-for-school`, etc.).

- **Strict, documented module API** — plugins attach to the player without modifying core.
- **Dynamic bundle loading** — only the modules needed for the requested stream are pulled in.
- **Out of the box:** HLS (`hls.js`), DASH (`shaka-player`), subtitles, thumbnails, quality selection, captions.
- **React UI** — the default UI is React-based and ships with the player.

## Layout

- `src/` — TypeScript source (core engine, modules, types, React UI).
- `lib/` — compiled intermediate artifacts.
- `dist/` — distribution bundle (`dist/index.mjs`, `dist/index.d.ts`). This is what consumers import.
- `dev/` — development harness / playground.
- `tests/` — Jest test suite.
- `docs/` — upstream documentation (Markdown, served through docsify in the original project).
- `vite.config.js`, `webpack.config.js`, `tsconfig.json`, `tslint.json`, `jest.config.js` — toolchain.

## Commands

From `client/packages/indigo-player/`:

- `npm start` — `npm run build:vite` (the default `start` script builds; there is no dev-server entry here — use `start:vite` below for HMR in `dev/`).
- `npm run start:vite` — `vite` (dev server for the `dev/` harness).
- `npm run build` / `npm run build:vite` — `vite build` → populates `dist/`.
- `npm run turbo:start` / `turbo:build` / `turbo:clean` — turbo wrappers for the outer monorepo pipeline.
- `npm run lint` — `prettier-tslint fix '**/*.ts{,x}'`.
- `npm test` — Jest.

Consumers depend on `dist/index.mjs` + `dist/index.d.ts`; regenerate them whenever `src/` changes.

## Playback stack

- **HLS:** `hls.js` ^1.5.
- **DASH / CMAF:** `shaka-player` ^4.16.
- **Subtitles / captions:** `subtitle`, `vtt-to-json` (WebVTT parsing).
- **Autoplay policy:** `can-autoplay`.
- **Resize observers / fullscreen:** `screenfull`, `simple-element-resize-detector`.
- **Events:** `eventemitter3`.
- **State:** `immer` for immutable patches inside the core reducer.

## What NOT to do without asking

- **Do not change the public API of `Player` / module lifecycle hooks** without coordinating with the consumers — every consumer would need a matched update.
- **Do not add runtime dependencies casually** — this module is loaded inside performance-sensitive contexts (lessons, webinars). Measure first.
- **Do not remove the dynamic bundle-loading behavior** to "simplify" the build — it is a deliberate performance choice.
- **Do not bump `hls.js` / `shaka-player` majors** without testing against a representative playlist set; stream-format regressions are common.
- **Do not push commits directly to the submodule's default branch** — it is a separate repo with its own PR process, and upstream sync from `matvp91/indigo-player` is a periodic manual task.
