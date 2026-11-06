# FTD.LAB responsive Hero

**Current delivery — 23 October 2026.** Mobile V2 native scrolling is retained. The loader now verifies all scene assets on every page load, with recovery for failed requests. Mobile Section 04 has scroll-linked convergence; Hero CTAs stay in English. See [final loading and mobile Connect QA](docs/QA_FINAL_LOADING_MOBILE_CONNECT.md), [screenshots and recording](qa/final-loading-connect), and `../FTDLAB_MOBILE_V2_FINAL_VERIFIED.zip`. Run `npm ci`, `npm run build`, `npm run preview`, or `launch-preview.cmd`. The milestone descriptions below are historical. No remote deployment was performed.

**Previous handoff — 22 October 2026.** The approved desktop/mobile LET'S CONNECT composition, targeted Section 02/03/05 fixes, and first-paint branded loader are in the current source. The seven-dot floating rail has been removed; Section 02's local three-stage timeline remains. Run `npm ci` and `npm run build`, then read [current visual QA](docs/QA_FINAL_VISUAL_APPROVED_CONNECT.md) and [current screenshots](qa/approved-connect). The runnable delivery archive is `../FTDLAB_APPROVED_CONNECT_FINAL_POLISH.zip`. Entries below describe earlier milestones.

**Previous handoff — 22 October 2026.** The seven-section site added RU/EN localization, the then-current global progress navigation, and a softer Hero-to-Section 02 scroll. Section 02 gained a minimal dark/cyan background, GEO phone, connected TRAFFIC diagram, and transparent chart; Section 03 copy gained a dark translucent plaque. See [short visual QA](docs/QA_LATEST_VISUAL.md), [previous i18n and navigation QA](docs/QA_FINAL_I18N_SNAP.md), and [desktop/mobile screenshots](qa/latest-visual). These describe the previous milestone; the seven-dot rail has since been removed.

**Current pre-release handoff — 22 October 2026.** This project now contains the fixed seven-destination navigation, targeted corrections across Sections 01–07, simplified FTD.LAB favicons, staging-aware SEO, and a GitHub Pages test workflow. Run `npm ci` and `npm run build` to validate TypeScript and create `dist/`. See [deployment instructions](docs/DEPLOYMENT_PRE_RELEASE.md), [final QA and screenshot issue map](docs/QA_PRE_RELEASE.md), [checklist](docs/PRE_RELEASE_CHECKLIST.md), and [current screenshots/recording](qa/pre-release). The historical milestone descriptions below document earlier states and may mention controls or files removed in this handoff. No remote deployment was performed.

**Hero → Section 02 cinematic seam — 20 October 2026.** A visual-only `HeroSectionBridge` now blends the approved Hero glow into Scene 01 near their document boundary. Its one ScrollTrigger reads vertical scroll progress and clears at the exact approved Scene 01 endpoint. The existing Section 02 wheel/touch/keyboard step controller remains the sole gesture owner. See [transition QA and visual comparison](docs/HERO_SECTION02_TRANSITION_QA.md), [screenshots and recordings](qa/hero-section-seam), and `../FTDLAB_HERO_SECTION02_CINEMATIC_TRANSITION_FINAL.zip`.

**Section 02 final background refactor — 20 October 2026.** The supplied desktop and portrait planetary images now form each full-screen scene's background. A measured SVG light front follows each original horizon. GEO, TRAFFIC, chart, and horizon loops run only in their active scene. The desktop GEO card is larger and right aligned; mobile GEO, network labels, and GROWTH card were refined. The Hero remains unchanged. See [final Section 02 QA](docs/SECTION02_BACKGROUND_REFACTOR_QA.md), [screenshots and recordings](qa/section02-background), and `../FTDLAB_SECTION02_BACKGROUND_REFACTOR_FINAL.zip`.

**Section 02 refined — 20 October 2026.** Discrete wheel/swipe/keyboard gestures now activate one full-screen scene at a time. GEO, TRAFFIC, growth-chart and cyan-curve animations complete automatically after activation. The supplied corporate fonts are bundled for Section 02 only. See [refined QA and recordings](docs/SECTION02_REFINED_QA.md). The prior Section 02 handoff below is historical.

**Section 02 — 20 October 2026.** Three full-screen compositions follow the approved Hero in a pinned vertical-to-horizontal scroll. The responsive GEO reel, TRAFFIC connection sequence, growth chart and shared cyan light curve are implemented with live HTML/CSS/SVG and GSAP. See [Section 02 QA](docs/SECTION02_QA.md), [desktop/mobile screenshots and recordings](qa/section02), and the [approved reference](references/section02-approved-reference.png). The Hero implementation below remains unchanged.

**Current: production mobile opening and connected pointing emphasis — 20 October 2026.** Verified registered V2 doors reveal the original downward-pointing mascot. Existing eye-local blinking and a small continuous deformation of the original arm pixels begin after opening. The capsule frame stays stationary. Desktop, portfolio loader/cursor, sound and live HTML layouts are preserved. See [implementation and limitations](docs/MOBILE_LIVING_IMPLEMENTATION.md), [production QA](docs/MOBILE_LIVING_QA.md) and [asset manifest](assets/mobile-living/v2/manifest.json). This is a restrained 2D composition; original 3D layers, a separated mobile character and authored eyelid frames remain missing.

**Previous milestone — 19 October 2026.** Desktop/mobile reveal-gated blinks were integrated. Desktop-door reuse for the mobile camera was rejected. Those results remain in [previous QA](docs/MOBILE_CAPSULE_BLINK_QA.md); they predate the registered mobile V2 candidate family.

**Preserved: Portfolio source migration — 18 October 2026.** The original portfolio's compact rotating-word loader and two-spring, difference-blended cursor run in Vue using the original Motion engine. FTD branding, confirmed readiness, activation sound and accessibility controls are retained. See [migration QA and browser recording](docs/PORTFOLIO_MIGRATION_QA.md) and [source implementation comparison](docs/PORTFOLIO_IMPLEMENTATION_COMPARISON.md).

**Previous delivery: Phase 6 final — 17 October 2026.** The wide-loader and cyan-cursor refinement is preserved as milestone history in [its QA report](docs/PHASE6_FINAL_QA.md). The source migration replaces that loader and cursor presentation.

**Previous milestone: Phase 6 cursor and touch feedback.** An isolated interaction component adds a restrained cyan cursor for eligible mouse input and temporary feedback for touch controls. The Phase 5 loader, hero layouts, artwork and motion remain unchanged. See [Phase 6 QA](docs/PHASE6_QA.md) and [implementation](docs/PHASE6_IMPLEMENTATION.md).

**Previous milestone: Phase 5 cinematic loading.** The refined living mascot is now the default desktop character, with the original whole-body source retained as a configurable fallback. A branded fullscreen first-visit loader uses confirmed weighted readiness, holds the capsule closed, then hands off to the unchanged diagonal opening and living idle. Mobile keeps its approved pointing artwork and Phase 1 composition. See [Phase 5 implementation](docs/PHASE5_IMPLEMENTATION.md), [QA and full intro recordings](docs/PHASE5_QA.md), and [asset manifest](docs/PHASE5_ASSET_MANIFEST.json).

**Previous milestone: Phase 4 refined living-mascot review.** At that milestone, the normal hero used the approved Phase 3 desktop / Phase 1 mobile. Review motion now uses source-textured joint overlaps, stronger float/sway, independent limb follow and visible jet pulses. See [refinement QA and real playback](docs/PHASE4_REFINEMENT_QA.md). At that milestone, a desktop-only technical rig was available at `/?review=1&livingMascot=1&view=desktop` without automatic production promotion. Phase 5 now enables that refined rig by default. Review controls expose limb amplitude, deterministic poses, prototype eye states and leg-attached jet visibility. All-state decode, original-mascot fallback and the existing loader/readiness/lifecycle are retained. See [Phase 4 implementation](docs/PHASE4_IMPLEMENTATION.md), [source manifest](docs/PHASE4_ASSET_MANIFEST.json), [missing artwork](docs/PHASE4_MISSING_ASSETS.md), and [Phase 4 QA](docs/PHASE4_QA.md).

**Production baseline: Phase 3 diagonal capsule integration.** Desktop uses the supplied registered layers with a stationary frame, diagonally retracting source-texture panels, geometric occlusion and independent mascot idle after opening. Mobile keeps its approved pointing artwork and Phase 1 animations exactly. No UI layout, typography, spacing, buttons or cards were redesigned. See [implementation and timing](docs/PHASE3_IMPLEMENTATION.md), [current missing assets](docs/PHASE3_MISSING_ASSETS.md), and [browser QA](docs/PHASE3_QA.md).

**14 October 2026: first-visit loader integrated.** The 0.6s live-text loader runs once per tab session, concurrently with scene decode, before the unchanged hero intro. The 700ms scene-readiness deadline, reduced motion, keyboard focus, pause and cleanup are covered by production QA. Resize, breakpoint changes and hero replay never replay the loader. Approved layout/style/artwork files and dependencies are unchanged. See [loader integration QA and screenshots](docs/LOADER_INTEGRATION_QA.md) for results and Windows commands. Earlier handoff documents describe the pre-integration state.

Working Vue 3 / Vite / TypeScript / GSAP project, improved from the supplied asset kit. The default page shows the hero without review controls. Desktop and mobile use independent compositions.

**Delivery status:** desktop opening/living rig and the registered mobile V2 2D opening/pointing emphasis are implemented. Authored eye states, independently separated mobile body/clean chamber, clean jets-off ignition and true3D door thickness remain source-limited. Earlier audits are milestone history.

The current runnable archive is `../FTDLAB_HERO_MOBILE_LIVING_FINAL.zip`. It includes the current production source, assets, build, documentation and current mobile browser evidence.

## Windows launch

Use Node.js 22.12 or newer. In PowerShell:

```powershell
Set-Location 'C:\Users\Askar\Documents\Codex\2026-10-12\implement-the-ftd-lab-responsive-hero\outputs\ftdlab-hero'
npm.cmd ci
npm.cmd run dev
```

Open http://127.0.0.1:5173/. Stop with Ctrl+C. Using npm.cmd avoids PowerShell script execution-policy restrictions. Alternatively, double-click launch-dev.cmd.

For the production build:

```powershell
npm.cmd run build
npm.cmd run preview
```

Open http://127.0.0.1:4173/. launch-preview.cmd installs dependencies when needed, builds and starts this preview. Serve dist over HTTP; opening dist/index.html directly is not supported by ES modules.

## Review views

- Default: vertical composition up to 900px, also in compact portrait windows up to 1199px with aspect ratio at most 4:3; horizontal composition otherwise.
- /?view=desktop: force the horizontal composition.
- /?view=mobile: force the vertical composition; use 941×1672 for native comparison.
- /?review=1: composition selector, explicit replay/pause, pseudo-blink preview, desktop/mobile capsule opening range and reference-opacity slider.
- /?view=mobile&capsuleProgress=25: deterministic frozen mobile panel travel (0–100); also available for view=desktop.
- /?review=1&view=desktop: desktop review. References are never overlaid by default.

The native canvases remain 1672×941 and 941×1672. At widths up to 600px, mobile keeps the upper scene and hand/headline geometry while extending the lower canvas for 44px CTA controls, 13–15px editorial copy and 14px card labels. This intentionally improves phone readability rather than proportionally shrinking every control. HUD coordinates remain tied to the native canvas.

## Configure destinations and licensed fonts

Copy .env.example to .env.local and set:

```dotenv
VITE_AFFILIATE_URL=https://your-approved-affiliate-destination.example/
VITE_ADVERTISER_URL=https://your-approved-advertiser-destination.example/
VITE_DRUK_FONT_URL=
VITE_HELVETICA_FONT_URL=
```

Restart Vite after changing env values. URLs above are examples, not shipped destinations. Empty CTA values open a local preview dialog and emit ftdlab:cta with the audience. Configured values become actual accessible links. No destination is invented.

The Hero retains its original configurable font loading. src/fontLoader.ts loads configured, licensed files only; place Hero font files in assets/fonts and use relative assets/fonts/filename.woff2 URLs. Section 02 separately bundles the user-supplied Druk Wide and Helvetica Neue files. The Hero fallback is Arial Black / Arial for headings, Helvetica / Arial for body and Consolas for editorial copy. Ink boxes and headline tracking are measured for selectable live text. src/typography.ts centralizes Hero font URLs. Original upright/italic logo masters remain missing; HeroBrand is a live approximation.

## Reusable implementation

- src/components/HeroAnimation.vue: host, image readiness, intro lifecycle, preference changes, focus, background pause and cleanup.
- src/components/HeroDesktop.vue and HeroMobile.vue: independent compositions and headline/copy markup.
- HeroBrand.vue, HeroCta.vue, HeroMetrics.vue and HeroScene.vue: shared reusable pieces. HeroAnimation accepts view, reduced, paused, referenceOpacity, menuOpen, affiliateHref and advertiserHref props; emits cta, menu and state.
- src/motion/heroTimelines.ts: separate 2.4s desktop and 2.0s mobile GSAP timelines.
- src/motion/mascotBlink.ts: shared randomized timing, pause/resume and cleanup; renderers remain independent.
- src/components/MobileMascotEyes.vue: eye-local masks and same-source cyan aperture compression registered to the original 630×790 mobile image.
- src/fitText.ts: reference-space text fitting with ResizeObserver and measured tracking.
- assets/capsule-phase3 and CapsuleScene.vue: registered desktop sources, tangent panel clips, reveal masks, fixed frame and depth cues.
- src/motion/capsuleMotion.ts and capsuleMotionConfig.ts: desktop mechanism/idle, travel and timing.
- assets/temporary: approved mobile composite remains active; the original desktop composite is retained as baseline evidence.
- assets/reference-derived: original kit opaque crops, alpha derivatives and matte sources retained for provenance.
- assets/desktop/background, assets/mobile/background, assets/shared/hud and icons: editable reconstructed decoration.
- animations/: inherited future production frame-registration/driver utilities. They are typechecked, preserved and not mounted with missing source sets.
- docs/source-manifests: original manifests retained as historical evidence; docs/ASSET_MANIFEST.json is the current authority.
- docs/source-specs: handoff manifest, region map and animation spec retained for review.
- references/: unchanged strict visual targets, used only for comparison.
- qa/: fresh browser checks, native/mobile/desktop screenshots, side-by-side comparisons and difference images.

Reduced motion shows the final readable state and creates no persistent motion. Keyboard focus finishes the intro and suspends idle while focus remains inside the hero. Resize or view changes finalize without replay. Mobile retains its minimal Phase 1 composite float, pseudo-blink and glow. Desktop moves only its source doors and independent mascot; the structure stays fixed. On slow connections, live UI appears by a 700ms deadline and artwork loads in place without a late replay. Failed scene artwork gets a neutral placeholder while live UI remains available.

## Verification

```powershell
npm.cmd run build
npm.cmd run check:animations
npm.cmd run assets:audit
npm.cmd audit
```

With the dev server running, browser QA can be rerun:

```powershell
npm.cmd run qa:responsive
npm.cmd run qa:motion
npm.cmd run qa:compare
```

Playwright is external QA tooling, not a project dependency. The scripts use installed Chrome and accept PLAYWRIGHT_MODULE, CHROME_EXECUTABLE and HERO_QA_URL overrides. Set PLAYWRIGHT_MODULE to an existing Playwright module directory if the machine differs. With the production preview running, npm.cmd run qa:production verifies the built UI. qa:compare uses the kit's existing Sharp development dependency and the screenshots from qa:responsive.

See [latest visual refinement QA](docs/VISUAL_REFINEMENT_QA.md) and the preserved [initial QA report](docs/QA_REPORT.md). Functional QA does not certify exact font matching or unblock missing animation sources. The supplied handoff prompt documents were treated as reference metadata; this user's request governs implementation and completion claims.

The inherited Vue and Vite versions were updated within their existing major versions: [Vue 3.5.43](https://github.com/vuejs/core/releases/tag/v3.5.43), [Vite 7.3.7](https://github.com/vitejs/vite/releases/tag/v7.3.7), and existing image tooling [Sharp 0.35.5](https://github.com/lovell/sharp/releases/tag/v0.35.5). The saved dependency audit reports zero vulnerabilities. Runtime dependencies remain Vue and GSAP.




## Current refinement QA

The original screenshots and missing-source document are preserved. New before/after captures and regression evidence are in qa/refinement. Use node scripts/refinement-qa.mjs with the dev server running and node scripts/refinement-production-qa.mjs with the production preview running. These compare the refined revision and leave the original QA screenshots intact.

## Phase 3 verification

With a production preview running at port 4175:

```powershell
npm.cmd run build
npm.cmd run check:animations
node scripts/phase3-motion-qa.mjs
node scripts/phase3-visual-qa.mjs
```

The Phase 3 scripts use external Playwright, accept `PLAYWRIGHT_MODULE` / `HERO_QA_URL`, and write only `qa/phase3`. They use existing before captures rather than regenerating approved QA. Results: [Phase 3 QA](docs/PHASE3_QA.md).

## Phase 4 review

The feature requires both `review=1` and `livingMascot=1`, and is disabled in the mobile composition. Example: `http://127.0.0.1:4175/?review=1&livingMascot=1&view=desktop`. Use `rigAmplitude=0&rigPose=0&capsuleProgress=100` for a frozen neutral review; `rigPose=-1` / `1` inspect swing extremes. `rigEye=half` / `closed` are explicitly prototype eye patches; `rigJets=0` hides the extracted flame pixels. Normal page requests mount no Phase 4 parts or asset requests.

`src/motion/livingMascotConfig.ts` holds native joint anchors, maximum angles and cycle timing. The component and one limb timeline nest inside the existing Phase 3 mascot float root. The stationary capsule geometry and opening controller are unchanged. Hidden-joint source art, clean boots, real eye states and mobile layers remain missing; synthetic pads and reconstructed visor are not used to hide seams.

With production preview running, use `node scripts/phase4-refinement-qa.mjs` for the current motion/coverage checks. Results and captures go only to `qa/phase4-refinement`. The earlier Phase 4 runner/report describe the original prototype settings and remain as historical evidence.

## Phase 5 launch and configuration

```powershell
npm.cmd ci
npm.cmd run build
npm.cmd run preview -- --port 4175 --strictPort
```

Open `http://127.0.0.1:4175/`. First visit means once per tab session; an existing `ftdlab:prehero-loader:v1=seen` entry is retained. Use a fresh tab/browser context for a full first-visit review. `?review=1` keeps the existing motion controls; Replay never repeats the loader.

Set `VITE_DESKTOP_MASCOT=whole-body` for the original fallback, or use `?livingMascot=0` for a runtime review. Default is `living`. The normal fast-ready loader lasts about 2.05 seconds. Pending critical readiness at700ms releases usable content early without showing a false100%; late current assets never restart the entrance. Full weighted-stage, accessibility and pause behavior is documented in Phase 5 implementation.

Current browser QA: `node scripts/phase5-qa.mjs` with preview running. This writes `qa/phase5`; older milestone reports remain historical evidence. No custom cursor is included.

## Section 03 — What We Do

Section 03 follows the existing three-scene Section 02 pin. It uses the approved mascot artwork, a perspective-clipped three-state laptop interface, a subtle horizon and coat-light idle, and an adapted single-card mobile layout. No Section 01 or 02 source was changed; `src/App.vue` only mounts the new component below Section 02.

Run `npm run build`, then with the dev server on port 5182 run `node scripts/section03-visual-qa.mjs` and `node scripts/section03-transition-qa.mjs`. Screenshots, two-cycle laptop recordings, and Section 02 handoff recordings are in `qa/section03`. See [Section 03 QA](docs/SECTION03_QA.md) for asset comparison and limitations.
