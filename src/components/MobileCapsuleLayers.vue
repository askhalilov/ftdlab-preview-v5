<script setup lang="ts">
import { mobileLivingAsset as source } from '../motion/mobileLivingConfig'
</script>
<template>
  <div class="mobile-capsule-layers" data-mobile-capsule data-capsule-state="closed" data-opening="0" aria-hidden="true">
    <div class="mobile-door-aperture" :style="{ maskImage: `url('${source('aperture-alpha.png')}')` }">
      <img class="mobile-motion-source mobile-door" data-mobile-door="upper" :src="source('door-upper-registered.png')" width="630" height="790" alt="" draggable="false" />
      <img class="mobile-motion-source mobile-door" data-mobile-door="lower" :src="source('door-lower-registered.png')" width="630" height="790" alt="" draggable="false" />
    </div>
    <img class="mobile-motion-source mobile-stationary-rim" data-mobile-frame :src="source('stationary-rim-approved-pixels.png')" width="630" height="790" alt="" draggable="false" />
    <!-- Decode hook: CSS masks must participate in the readiness contract. -->
    <img class="mobile-motion-source mobile-mask-preload" :src="source('aperture-alpha.png')" width="630" height="790" alt="" />
  </div>
</template>
<style scoped>
.mobile-capsule-layers, .mobile-door-aperture { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.mobile-capsule-layers { z-index: 5; }
.mobile-door-aperture { overflow: hidden; mask-size: 100% 100%; mask-repeat: no-repeat; }
.mobile-door, .mobile-stationary-rim { position: absolute; inset: 0; display: block; width: 100%; height: 100%; max-width: none; user-select: none; pointer-events: none; }
.mobile-stationary-rim { z-index: 2; }
.mobile-mask-preload { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }
@media (prefers-reduced-motion: reduce) { .mobile-capsule-layers { display: none; } }
</style>
