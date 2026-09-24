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
- `npm run start:vite` — opens the Vite-powered `dev/` workbench with HMR. It imports `src/` directly, defaults to a short Mux HLS with four in-range chapters, and provides live source, preview-size, accent, volume, speed, and chapter controls plus a collapsible state inspector. No prior `dist/` build is required. Keep an explicit size or `aspect-ratio` on `.player-host`: the player's `.ig-container` fills its host with `height: 100%` and otherwise collapses to zero height.
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

## iOS / Safari playback gotchas (hard-won — read before "improving" the player on iOS)

On iOS/Safari the player **deliberately uses the browser's native `<video>` controls**, not the custom React UI:

- `HTML5Player.load()` sets the native `controls` attribute when `ui.showControls`, and `UiExtension`'s constructor `return`s early for `isSafari || isIOS` so the custom UI is **not** rendered. HLS also plays **natively** on these platforms (`HlsMediaLoader.isSupported` returns `false` for iOS → `BaseMedia` does `video.src = m3u8`).
- **Why:** iOS Safari does not support the Fullscreen API on a container `<div>` (only `video.webkitEnterFullscreen()`), and the player is embedded in an **iframe** (AccelSite `client/site`) without `allowfullscreen`, so `screenfull.isEnabled` is `false`. The custom UI's fullscreen button is then `disabled` (`ControlsView` → `disabled={!isFullscreenSupported}`), which looks broken to users. The native player has its own working fullscreen.
- A June 2026 commit (`be7bfb5`) tried to switch iOS to the custom UI and regressed both fullscreen (greyed-out button) and audio for course students. It was reverted. **Do not switch iOS to the custom UI** unless you also solve native fullscreen and audio on real devices first.
- **Do NOT set `crossOrigin='anonymous'` on the `<video>` element on iOS/Safari.** With native HLS + an alternate audio rendition (Accel's transcoded HLS has one), it forces CORS on the audio segments and **audio drops when entering native fullscreen** (sound works inline, dies in fullscreen). Nothing in the player needs CORS media access — the watermark is a DOM overlay, thumbnails are a separate BIF sprite, there is no canvas frame capture. `crossOrigin` is only set off-iOS now.

## What NOT to do without asking

- **Do not change the public API of `Player` / module lifecycle hooks** without coordinating with the consumers — every consumer would need a matched update.
- **Do not add runtime dependencies casually** — this module is loaded inside performance-sensitive contexts (lessons, webinars). Measure first.
- **Do not remove the dynamic bundle-loading behavior** to "simplify" the build — it is a deliberate performance choice.
- **Do not bump `hls.js` / `shaka-player` majors** without testing against a representative playlist set; stream-format regressions are common.
- **Do not push commits directly to the submodule's default branch** — it is a separate repo with its own PR process, and upstream sync from `matvp91/indigo-player` is a periodic manual task.

## The subtitles button rendered as a 2-px dash (fixed 2026-09-11)

`src/ui/theme/svg/icons.scss` declared the `cc` glyph as `.igui_icon_cc:before { content: url(...) }` while every other icon puts the SVG on the element itself (`.igui_icon_settings { content: … }`); the `Icon` component renders the glyph from the element's own `content`, so the CC button showed nothing but the `.igui_button_name-subtitle:before` underline bar — the «_» left of the gear. The rule is `.igui_icon_cc { … }` now. The button itself (`ControlsView`, `showSubtitlesToggle` = the stream has subtitle tracks, key `c`) and the Subtitles tab in the settings menu were always there. This is a change INSIDE the submodule — it needs its own commit/PR in the indigo-player repository; the outer repo only moves the submodule pointer.

## A dead source url is refreshed, not retried forever (2026-09-17)

`src/media/SourceRecovery.ts` is the retry/refresh POLICY both media modules run their errors through, and
`Config.sourceRefresh` (`SourceRefreshConfig` in `src/types`) is how a host plugs in a fresh url. Why: an AXL
video plays from a signed url whose grant runs out (`/v/hls/{token}/…` plus the CDN segment tokens beside it),
and a student who paused longer than the grant resumed into a 404 on every playlist — while `HlsMedia.onError`
answered EVERY fatal network error with `startLoad()`, so one tab hit the proxy every ~9 s for hours (New Relic,
2026-09-17: 35 % of the site's playlist requests were 404s, every one an expired token). Facts to keep straight:

- **hls.js 1.6 never retries a 4xx** (`retryForHttpStatus`); it walks the renditions instead — which is why the
  loop showed up as `v_360p/v_720p/v_480p.m3u8` — and then goes fatal `NETWORK_ERROR` with the HTTP status in
  `data.response.code`. `SourceRecovery.classify` turns that into `refresh` (a definitive status 400/401/403/404/410,
  a status 0, or a url known to be past its `expiresAt`) when the host offers a refresher, at most `maxAttempts`
  (default 2) failed rebuilds in a row; without a refresher a definitive status is retried twice and then fails;
  anything else is retried with exponential pacing (1 s → 30 s), offline for as long as it takes; a `MEDIA_ERROR`
  gets `recoverMediaError()` three times. `markRecovered()` (`FRAG_BUFFERED` / `loadedmetadata`) resets every budget.
- **A refresh rebuilds the pipeline; it does not `detachMedia` around it.** `HlsMedia.rebuild` destroys the hls.js
  instance and creates a new one on the fresh url with `startLoad(position)`, re-picks a hand-chosen quality by
  HEIGHT once `MANIFEST_PARSED` (level indexes are not stable across playlists), restores
  `defaultPlaybackRate`/`playbackRate` (`media.load()` inside a detach resets them) and calls `play()` only if it
  was playing. `BaseMedia` (native HLS on Safari/iOS, plain files) does the same through `setSource` + `loadedmetadata`.
- **Expiry is a server-provided RELATIVE number, turned into an instant by the host** (`expiresAt = Date.now() +
  urlExpiresInSec * 1000`) — a wrong client clock cannot make the player believe a live grant is dead, and no
  token is decoded in the browser. With it the player refreshes BEFORE the first fetch after a long pause
  (`shouldRefreshBeforePlay`, 60 s lead) and prefetches a fresh url when the tab becomes visible while paused
  (`media/visibility.ts`; nothing runs in a hidden tab, no timers). Without it the recovery is error-driven only.
- **The host decides what a refusal means**: `refresh()` resolving `null` = the video cannot be had (gone, access
  revoked) → `ErrorCodes.HLSJS_CRITICAL_ERROR` / `MEDIA_SOURCE_ERROR` (1003) with `failedMessage` as the text;
  rejecting = transport trouble, retried at 1.5 s and 4 s before it counts as one failed attempt. Nothing in the
  player knows what a playback token is — the hosts do (`client/site/src/player`, the admin `VideoPlayer`, the
  scene editor's `PlaybackSource.refreshUrl`).
- **Tests: `npx jest tests/SourceRecovery.test.ts` from this folder** — pure policy, no DOM. The docblock
  `@jest-environment node` is load-bearing: the default jsdom environment requires the `canvas` native module,
  which has no Node 22 binary in this workspace, so a jsdom test file cannot even start; a test that needs
  `navigator` stubs it.
- Consumers ship the player from `dist/`, which is gitignored and rebuilt by turbo (`build:admin`, site
  `build:deps`); this is a submodule commit — push it to the indigo-player remote BEFORE the pointer commit
  (root CLAUDE.md → submodules).

## Chapters and the YouTube-like chrome (2026-09-24)

YouTube-style chapters and a rebuilt control bar. Done in the working tree; the submodule commit and push are the owner's.

- **Data**: `config.chapters: Chapter[]` (`{ title, startSec }`, each lasting until the next) and `api.setChapters(list)` to replace them live — the admin editor previews every edit this way without re-creating the player. `Instance.setChapters` also writes `config.chapters`, so a call made while the player is still starting (no modules yet) is not lost: the extension and the UI take their first list from the config.
- **The math is pure** — `src/extensions/ChaptersExtension/chapters.ts` (`resolveChapters`, `layoutSegments`, `positionToTime`, `timeToPosition`, `segmentFill`, previous / next), tested by `tests/Chapters.test.ts`. `CHAPTER_GAP_PX` there and `$seekbar-chapter-gap` in `element-seekbar.scss` are ONE number: the pointer-to-time mapping lays the segments out with the gap the browser draws (`display: flex; gap`, `flex-grow` = the chapter's length, `flex-basis: 0`). Change one without the other and a click lands beside where the viewer pointed. Fewer than 2 chapters that fit the duration = no chapters (the plain bar).
- **What the viewer gets**: the bar cut into segments (the one under the pointer drawn thicker, its title above the time in the tooltip), the current chapter beside the time («• Title ›») which opens `ChaptersPanel` over the right side of the picture, and Ctrl/Alt+←/→ to jump between chapters (`KeyboardNavigationExtension`).
- **Two rows of controls now**: the progress bar across the whole width and one row of buttons under it — play, ±10 s, volume, time, chapter on the left; CC, settings, miniplayer, full screen on the right. Sizes are CSS variables on `.igui` (`--igui-row-height`, `--igui-button-size`, `--igui-icon-size`, `--igui-seekbar-height`, `--igui-edge`, `--igui-controls-height`), swapped in full screen; the button tooltips, the settings menu and the chapters panel position themselves off them. Change a size there, not in a rule.
- **The accent is our blue `#1890ff`** (`--igui-accent` on `.ig-container`; owner 2026-09-24: «не бери красный цвет YouTube, пусть будет наш синий»): progress, scrubber, the CC underline, the chapter playing now in the panel, the HD badge, the start button under the pointer. A host may override the variable; admin and site do not.
- **The settings menu is YouTube's**: rows «icon · name · value ›», each opening a panel with a back header and a check at the selected option; a pick returns to the main panel. `speed`, `quality`, `check` and `close` icons were added to `svg/icons.scss` as `content: url()` on the element, like every other icon (see the `cc` gotcha above). The settings button's tooltip is hidden while the menu is open — it peeked out from under the menu.
- **Narrow players**: `Main` sets `igui_size-small` (< 560 px) and `igui_size-tiny` (< 400 px) from `Events.DIMENSIONS_CHANGE`; small drops the ±10 s buttons and the miniplayer and tightens the sizes, tiny drops the chapter title too. Without it the row overflowed at 420 px and the chapter title slid under the CC button.
- **Subtitles lift by the measured controls height** (`triggerEvent.ts` → `subtitlesOffset`, 42 px as the floor), not a constant — the controls grew.
- **i18n**: `Chapters`, `Close`, `Playback speed`, `Off`, `Back`, `Options`, `No settings available` in all 7 locales, plus the subtitle-style keys the five locales beyond en/ru never got, so `tests/verify-i18n.test.ts` passes again. `Speed` and `No subtitles` are unused now but kept: the test wants the same key set everywhere. Run: `npx jest tests/Chapters.test.ts tests/verify-i18n.test.ts --env=node`.
- **Checking the look without a host**: `dist/index.mjs` is self-contained, so a static page that imports it (plus `window.process = { env: { NODE_ENV: 'development' } }` before the import — the bundle leaves that to the host's bundler) and headless Chrome over CDP can photograph every state. That is how this pass was checked, at 960 / 420 / 360 px.
