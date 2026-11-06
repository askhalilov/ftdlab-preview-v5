<script setup lang="ts">
import { useId } from 'vue'
import { asset } from '../assets'

// Registered to the unchanged 630 × 790 pointing composite. These paths were
// measured around its actual cyan eye apertures, not around the whole face.
// The dark visor shutters and compressed same-source light are a local display
// simulation; original alternate mobile eye artwork has not been supplied.
const id = `mobile-eyes-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
const source = asset('temporary/mobile-scene.webp')
const link = (name: string) => `url(#${id}-${name})`
const eyes = [
  {
    side: 'left',
    bounds: { x: 200, y: 320, width: 122, height: 110 },
    patch: 'M 226 336 C 247 353 281 380 305 391 C 309 405 286 417 262 412 C 236 408 218 390 213 369 C 210 354 216 340 226 336 Z',
    aperture: 'M 228 342 C 244 361 273 382 298 395 C 288 405 267 405 251 398 C 230 390 220 376 223 356 C 224 349 226 345 228 342 Z',
    axis: 'translate(260 375) rotate(31)',
    inverseAxis: 'rotate(-31) translate(-260 -375)',
  },
  {
    side: 'right',
    bounds: { x: 350, y: 380, width: 135, height: 85 },
    patch: 'M 365 413 C 391 408 429 398 460 389 C 469 395 465 416 451 432 C 435 449 407 450 389 441 C 376 435 368 423 365 413 Z',
    aperture: 'M 373 417 C 401 413 433 405 458 397 C 460 410 452 424 438 432 C 419 443 394 440 383 431 C 378 427 375 422 373 417 Z',
    axis: 'translate(417 419) rotate(-13)',
    inverseAxis: 'rotate(13) translate(-417 -419)',
  },
] as const
</script>

<template>
  <svg class="mobile-mascot-eyes" data-mobile-eye-masks data-source-status="registered-eye-local-display-mask" viewBox="0 0 630 790" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <defs>
      <filter :id="`${id}-feather`" x="-25%" y="-35%" width="150%" height="170%" color-interpolation-filters="sRGB">
        <feGaussianBlur stdDeviation="3" />
      </filter>
      <linearGradient :id="`${id}-visor`" x1="0" y1="0" x2=".75" y2="1" gradientUnits="objectBoundingBox">
        <stop offset="0" stop-color="#000b10" />
        <stop offset=".55" stop-color="#00080c" />
        <stop offset="1" stop-color="#000609" />
      </linearGradient>
      <template v-for="eye in eyes" :key="eye.side">
        <mask :id="`${id}-${eye.side}-shutter`" x="0" y="0" width="630" height="790" maskUnits="userSpaceOnUse" style="mask-type: luminance">
          <path :d="eye.patch" fill="white" stroke="white" stroke-width="8" stroke-linejoin="round" :filter="link('feather')" />
        </mask>
        <clipPath :id="`${id}-${eye.side}-aperture`" clipPathUnits="userSpaceOnUse">
          <path :d="eye.aperture" />
        </clipPath>
      </template>
    </defs>

    <template v-for="eye in eyes" :key="eye.side">
      <g :data-phase1="`eye-mask-${eye.side}`" opacity="0" :mask="link(`${eye.side}-shutter`)">
        <rect v-bind="eye.bounds" :fill="link('visor')" />
      </g>
      <!-- Compress only the original cyan aperture in its own slanted axis.
           Neither helmet pixels nor the full composite receive this transform. -->
      <g :transform="eye.axis">
        <g :data-phase1="`eye-glow-${eye.side}`" class="mobile-eye-light" opacity="0" data-eye-axis-origin="0 0">
          <g :transform="eye.inverseAxis" :clip-path="link(`${eye.side}-aperture`)">
            <image :href="source" width="630" height="790" />
          </g>
        </g>
      </g>
    </template>
  </svg>
</template>

<style scoped>
.mobile-mascot-eyes { position: absolute; inset: 0; z-index: 3; display: block; width: 100%; height: 100%; overflow: visible; pointer-events: none; }
.mobile-eye-light { mix-blend-mode: screen; transform-origin: 0 0; }
@media (prefers-reduced-motion: reduce) {
  .mobile-mascot-eyes { display: none; }
}
</style>
