<script setup lang="ts">
import { inject, useId } from 'vue'
import { asset } from '../assets'
import LivingMascotRig from './LivingMascotRig.vue'
import { livingMascotFiles, livingMascotKey } from '../motion/livingMascotContext'
const rig = inject(livingMascotKey, undefined)

// All source images retain their shared 1254px registration. Only the viewing
// window is cropped to the existing desktop scene slot; the artwork is uniform
// in scale and the fixed capsule never receives an animation transform.
const id = `capsule-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
const link = (name: string) => `url(#${id}-${name})`
const sources = {
  closed: asset('capsule-phase3/capsule-closed-reference.png'),
  frame: asset('capsule-phase3/capsule-static-frame.png'),
  interior: asset('capsule-phase3/capsule-interior-static.png'),
  mascot: asset('capsule-phase3/mascot-registered.png'),
}

// A complementary tangent split of the SAME closed-source pixels. The old
// near-parallel S split exposed the original rectangular aperture crop as the
// doors translated. This seam ends at the aperture's curved tangent points, so
// those inherited crop edges remain hidden behind the stationary structure.
const upperPlane = 'M 0 0 H 814.5051921528545 L 426.8229982101424 1254 H 0 Z'
const lowerPlane = 'M 814.5051921528545 0 H 1254 V 1254 H 426.8229982101424 Z'
const seam = 'M 767.5359081287747 151.9281837424506 L 469.4640918712253 1116.0718162575494'
</script>

<template>
  <div class="phase3-scene" data-capsule-scene data-source-status="provided-registered-layers" aria-hidden="true">
    <!-- Decode hooks share the SVG URLs and never participate in layout. -->
    <img v-for="(source, name) in sources" :key="name" class="approved-scene phase3-source" data-scene-source :data-capsule-source="name" :src="source" width="1254" height="1254" alt="" fetchpriority="high" decoding="async" draggable="false" />
    <template v-if="rig?.preload">
      <img v-for="file in livingMascotFiles" :key="file" class="approved-scene phase3-source phase4-source" data-scene-source :src="asset(`mascot-phase4/${file}`)" width="1254" height="1254" alt="" decoding="async" />
    </template>

    <svg class="phase3-capsule-svg" data-capsule-svg viewBox="330 -19 582.2142857 1254" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">
      <defs>
        <clipPath :id="`${id}-aperture`" clipPathUnits="userSpaceOnUse">
          <rect x="407" y="140" width="423" height="988" rx="113" />
        </clipPath>
        <clipPath :id="`${id}-upper-plane`" clipPathUnits="userSpaceOnUse">
          <path :d="upperPlane" />
        </clipPath>
        <clipPath :id="`${id}-lower-plane`" clipPathUnits="userSpaceOnUse">
          <path :d="lowerPlane" />
        </clipPath>

        <!-- Contents are revealed by actual door footprints, not opacity.
             Their masks move with the corresponding full-opacity panels. -->
        <mask :id="`${id}-reveal`" x="0" y="0" width="1254" height="1254" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" style="mask-type: luminance">
          <rect x="0" y="0" width="1254" height="1254" fill="black" />
          <rect x="407" y="140" width="423" height="988" rx="113" fill="white" />
          <g data-capsule="mask-upper">
            <g :clip-path="link('aperture')"><path :d="upperPlane" fill="black" /></g>
          </g>
          <g data-capsule="mask-lower">
            <g :clip-path="link('aperture')"><path :d="lowerPlane" fill="black" /></g>
          </g>
        </mask>

        <radialGradient :id="`${id}-soft-eye`">
          <stop offset="0" stop-color="#00070a" />
          <stop offset="0.64" stop-color="#00070a" stop-opacity=".96" />
          <stop offset="1" stop-color="#00070a" stop-opacity="0" />
        </radialGradient>
        <radialGradient :id="`${id}-soft-light`">
          <stop offset="0" stop-color="white" />
          <stop offset=".65" stop-color="white" stop-opacity=".75" />
          <stop offset="1" stop-color="black" />
        </radialGradient>
        <mask :id="`${id}-jet-region`" x="0" y="0" width="1254" height="1254" maskUnits="userSpaceOnUse">
          <rect width="1254" height="1254" fill="black" />
          <ellipse cx="562" cy="927" rx="66" ry="79" :fill="link('soft-light')" />
          <ellipse cx="685" cy="948" rx="61" ry="68" :fill="link('soft-light')" />
        </mask>
        <mask :id="`${id}-light-region`" x="0" y="0" width="1254" height="1254" maskUnits="userSpaceOnUse">
          <rect width="1254" height="1254" fill="black" />
          <ellipse cx="621" cy="1049" rx="216" ry="85" :fill="link('soft-light')" />
          <ellipse cx="622" cy="168" rx="153" ry="70" :fill="link('soft-light')" />
        </mask>
        <filter :id="`${id}-seam-bloom`" x="-35%" y="-15%" width="170%" height="130%" color-interpolation-filters="sRGB">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <filter :id="`${id}-edge-shadow`" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      <g data-capsule="mechanism" visibility="hidden">
        <!-- This outer clip stays fixed while the two inner clips travel. -->
        <g :clip-path="link('aperture')">
          <g :mask="link('reveal')">
            <image data-capsule="interior" :href="sources.interior" width="1254" height="1254" />
            <g data-capsule="glow" class="phase3-accent" opacity="0" :mask="link('light-region')">
              <image :href="sources.interior" width="1254" height="1254" />
            </g>
            <g data-capsule="mascot">
              <LivingMascotRig v-if="rig?.enabled && rig.ready" :amplitude="rig.amplitude" :eye="rig.eye" :jets="rig.jets" />
              <template v-else>
              <image :href="sources.mascot" width="1254" height="1254" />
              <!-- A same-source light pass. The supplied mascot still has
                   baked jets; this does not pretend they are separate art. -->
              <g data-capsule="jets" class="phase3-accent" opacity="0" :mask="link('jet-region')">
                <image :href="sources.mascot" width="1254" height="1254" />
              </g>
              <!-- Pseudo-blink overlays, not newly invented eye frames. -->
              <ellipse data-capsule="eye-left" cx="606" cy="346" rx="31" ry="16" transform="rotate(22 606 346)" :fill="link('soft-eye')" opacity="0" />
              <ellipse data-capsule="eye-right" cx="685" cy="346" rx="30" ry="16" transform="rotate(-22 685 346)" :fill="link('soft-eye')" opacity="0" />
              </template>
            </g>
            <!-- Door silhouettes cast only into the geometrically uncovered
                 chamber. They cannot darken the closed source or the frame. -->
            <g opacity=".46">
              <g data-capsule="shadow-upper" :filter="link('edge-shadow')"><g :clip-path="link('aperture')"><path :d="upperPlane" fill="#00050a" /></g></g>
              <g data-capsule="shadow-lower" :filter="link('edge-shadow')"><g :clip-path="link('aperture')"><path :d="lowerPlane" fill="#00050a" /></g></g>
            </g>
          </g>

          <g data-capsule="upper">
            <g :clip-path="link('aperture')">
              <image :clip-path="link('upper-plane')" :href="sources.closed" width="1254" height="1254" />
              <path :d="seam" fill="none" stroke="#a9e8ef" stroke-opacity=".38" stroke-width="1.1" />
            </g>
          </g>
          <g data-capsule="lower">
            <g :clip-path="link('aperture')">
              <image :clip-path="link('lower-plane')" :href="sources.closed" width="1254" height="1254" />
              <path :d="seam" fill="none" stroke="#a9e8ef" stroke-opacity=".32" stroke-width="1.1" />
            </g>
          </g>
        </g>

        <image data-capsule="frame" :href="sources.frame" width="1254" height="1254" />
      </g>

      <!-- A literal source-image endpoint avoids a complementary SVG seam or
           near-opaque source alpha changing the approved fully closed art. -->
      <image data-capsule="closed" :href="sources.closed" width="1254" height="1254" />
      <g data-capsule="seams" :clip-path="link('aperture')" opacity="0">
        <path :d="seam" fill="none" stroke="#00dcec" stroke-width="9" :filter="link('seam-bloom')" />
        <path :d="seam" fill="none" stroke="#b9ffff" stroke-width="1.5" />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.phase3-scene { position: absolute; z-index: 1; left: calc(890 * var(--u)); top: calc(40 * var(--u)); width: calc(390 * var(--u)); height: calc(840 * var(--u)); pointer-events: none; }
.phase3-capsule-svg { display: block; width: 100%; height: 100%; overflow: hidden; }
.phase3-scene .phase3-source { display: none; }
.phase3-accent { mix-blend-mode: screen; pointer-events: none; }
</style>
