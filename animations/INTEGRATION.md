# Production animation drivers

These drivers are implemented and type-checkable. They have **not passed visual acceptance with approved animation artwork**. The kit currently has one baked reference pose per composition and explicitly marked generated candidates. Do not set `approved: true` merely to bypass these gates.

The current Vue preview uses its own labelled prototype reveal. It is not connected to these production drivers and does not imply that the capsule opening or separate mascot layers are ready.

## Registration and mounting

Import `createDesktopMotion` from `animations/desktop/createDesktopMotion.ts`, or `createMobileMotion` from `animations/mobile/createMobileMotion.ts`. Each returns `Promise<MotionController>` after every registered image loads, decodes and passes size checks. The controller exposes `pause()`, `resume()`, `replay()`, and idempotent `dispose()`.

Reserve the layout in CSS before mounting. Every host must be inside `root`, positioned independently, with a fixed aspect ratio matching its registered canvas. The two dedicated frame hosts must be empty; retain the static fallback in its own layer and hide it only after creation succeeds. Use `position: relative` on each frame host; the frame player adds absolute images at `inset: 0` with `width/height: 100%` and `object-fit: contain`. Put the blink host inside the independently positioned mascot wrapper, so desktop levitation moves the mascot only. The capsule host must remain outside that wrapper. Use the mobile composition's own registered source set.

```ts
import { createDesktopMotion } from './animations/desktop/createDesktopMotion'
import type { FrameSet, RegisteredLayer } from './animations/shared/registry'

// These records come from the reviewed final manifest, never from a filename guess.
const blink: FrameSet = {
  canvas: { width: 600, height: 900 },
  alignmentKey: 'reviewed-desktop-mascot-v1',
  frames: [approvedOpen, approvedHalfClosed, approvedClosed],
}
const opening: FrameSet = {
  canvas: { width: 420, height: 840 },
  alignmentKey: 'reviewed-desktop-capsule-v1',
  frames: [approvedCapsuleClosed, ...approvedOpeningFrames, approvedCapsuleOpen],
}
const mascot: RegisteredLayer = {
  element: mascotWrapper,
  canvas: blink.canvas,
  frame: approvedOpen,
}
const motion = await createDesktopMotion({
  root: heroRoot,
  mascot,
  eyes: { host: mascotFramesHost, states: blink },
  opening: { host: capsuleFramesHost, states: opening },
  jets: [approvedLeftJetLayer, approvedRightJetLayer],
  logo: logoElement,
  headline: headlineLineElements,
  cta: ctaElements,
  stats: statCardElements,
})
// Vue onBeforeUnmount: motion.dispose()
```

Each frame record contains `src`, positive integer `width/height`, `approved: true`, and the exact matching `alignmentKey`. Blink order must be **open, half-closed, closed**. Opening order must be **closed, approved intermediates, open**, with 2–25 frames. At 24fps, 25 frames use a one-second interval between first and last; longer openings need an explicitly revised intro timing before integration. No frames are interpolated or morphed. One fully decoded image is shown per frame.

The dimensions and alignment key are readiness gates, not an image-content validator. A reviewer must still confirm identical identity, pose, framing, registration, alpha edges, and seamless intermediate capsule motion. A same-size render with a different coat or helmet fails approval even if code can display it.

Static mascot, both desktop jets, and optional eye light also need approved registration records. Register real separated artwork; do not layer synthetic jets over boots that already contain baked flames. Do not feed reference composite posters to a player intended for separate capsule or mascot layers.

If creation rejects, retain the existing static fallback and report the missing/rejected source. No DOM image layers or animation styles are added before all preloads pass. Await creation in the mounted scene, and dispose the returned controller when that scene is removed; if unmounted during the async preload, dispose it immediately on resolution.

## Playback

The implemented production intro is 2.6 seconds; its actual cues are in `timeline-spec.json` (desktop mascot starts at **1.58s**, mobile mascot at **1.42s**). This implementation allows a full one-second frame opening before the mascot appears, and is distinct from the target editorial timing in `ANIMATION_SPEC.md`. Its fixed UI slots are at most four headline lines, two CTA controls and three cards. Desktop mascot motion starts and ends at the baseline over a 4.8-second loop with ±3 CSS px displacement. Jets are independent `scaleY`/opacity loops. The capsule and HUD are static after opening. Mobile has only an occasional blink after the intro.

Blink intervals are randomized: desktop **3.8–7.5s**, mobile **4.8–8.9s**; one blink is half-closed 45ms, closed 85ms, half-closed 45ms, then open. `pause()` and hidden-tab events cancel the timer and reset open eyes, so no accumulated blink queue plays after resuming. Intro and idle timelines pause at their current positions. `resume()` preserves an explicit user pause until called. `replay()` resets the intro while honoring that pause state.

`prefers-reduced-motion: reduce` shows the final open capsule, open eyes, mascot and HTML UI immediately. No intro or idle animation runs. Preference changes preserve the open state without automatically replaying the intro. Resizing is handled by reserved CSS host geometry; the drivers do not query or mutate layout dimensions. CTA uses visibility as well as opacity during entry so hidden controls are not keyboard-focusable, and returns them to visible state before interaction.

## Validation

From the kit root, run `npx tsc --noEmit -p animations/tsconfig.json`. On Node 22.18+ run `node --experimental-strip-types animations/tests/registry.test.ts`. These checks validate the production gate and TypeScript integration; visual animation acceptance remains `NEEDS_SOURCE` until approved matching artwork exists.
