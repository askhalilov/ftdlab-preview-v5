<script setup lang="ts">
import { mobileLivingAsset } from '../motion/mobileLivingConfig'
</script>
<template>
  <canvas class="mobile-pointing-arm" data-mobile-arm data-source-status="original-pixels-continuous-arm-field" width="630" height="790" aria-hidden="true" />
  <img class="mobile-motion-source mobile-arm-preload" data-mobile-arm-map :src="mobileLivingAsset('pointing-arm-displacement.png')" width="630" height="790" alt="" />
</template>
<style scoped>
.mobile-pointing-arm { position: absolute; inset: 0; width: 100%; height: 100%; display: block; visibility: hidden; pointer-events: none; clip-path: inset(54% 53% 0 9%); }
.mobile-arm-preload { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }
</style>
