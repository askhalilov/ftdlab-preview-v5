<script setup lang="ts">
import { computed, inject } from 'vue'
import CapsuleScene from './CapsuleScene.vue'
import MobileMascotEyes from './MobileMascotEyes.vue'
import MobileCapsuleLayers from './MobileCapsuleLayers.vue'
import { mobileMotionKey } from '../motion/mobileLivingConfig'
import MobilePointingArm from './MobilePointingArm.vue'
import { asset } from '../assets'
import { heroMotionConfig, type HeroView, type SourceRegion } from '../motion/heroMotionConfig'
const props = defineProps<{ view: HeroView }>()
const mobileMotion = inject(mobileMotionKey, undefined)
const config = computed(() => heroMotionConfig[props.view])
const source = computed(() => asset(`temporary/${props.view}-scene.webp`))
const frameStyle = computed(() => ({
  left: `calc(${config.value.placement.x} * var(--u))`,
  top: `calc(${config.value.placement.y} * var(--u))`,
  width: `calc(${config.value.source.width} * var(--u))`,
  height: `calc(${config.value.source.height} * var(--u))`,
}))
function regionStyle(region: SourceRegion, image = true) {
  const { width, height } = config.value.source
  return {
    left: `${region.x / width * 100}%`, top: `${region.y / height * 100}%`,
    width: `${region.width / width * 100}%`, height: `${region.height / height * 100}%`,
    ...(image ? {
      backgroundImage: `url("${source.value}")`,
      backgroundSize: `calc(${width} * var(--u)) calc(${height} * var(--u))`,
      backgroundPosition: `calc(${-region.x} * var(--u)) calc(${-region.y} * var(--u))`,
    } : {}),
  }
}
</script>
<template>
  <!-- Original approved image and eye-local effects remain the resting source.
       Registered mobile doors and the connected arm field are independent. -->
  <CapsuleScene v-if="view === 'desktop'" />
  <div v-else class="phase1-scene" data-intro="scene" :style="frameStyle" aria-hidden="true">
    <div class="phase1-float" data-phase1="float" :data-mobile-rig="mobileMotion ? 'true' : undefined">
      <img class="approved-scene temporary-scene" data-source-status="temporary-composite" :src="source" :width="config.source.width" :height="config.source.height" alt="" aria-hidden="true" fetchpriority="high" decoding="async" draggable="false" />
      <MobilePointingArm v-if="mobileMotion" />
      <MobileMascotEyes />
      <span class="phase1-source-pass phase1-light" data-phase1="glow-top" :style="regionStyle(config.regions.glowTop)" />
      <span class="phase1-source-pass phase1-light" data-phase1="glow-side-left" :style="regionStyle(config.regions.glowSideLeft)" />
      <span class="phase1-source-pass phase1-light" data-phase1="glow-side-right" :style="regionStyle(config.regions.glowSideRight)" />
    </div>
    <MobileCapsuleLayers v-if="mobileMotion" />
  </div>
</template>
<style scoped>
.phase1-scene { position: absolute; z-index: 1; pointer-events: none; transform-origin: 50% 50%; }
.phase1-float { position: relative; width: 100%; height: 100%; transform-origin: 50% 50%; }
.phase1-scene .approved-scene { inset: 0; width: 100%; height: 100%; }
.phase1-float[data-mobile-rig="true"] { z-index: 6; }
.phase1-source-pass { position: absolute; display: block; opacity: 0; pointer-events: none; }
.phase1-source-pass { z-index: 2; background-repeat: no-repeat; mix-blend-mode: screen; }
.phase1-light { mask-image: radial-gradient(ellipse at center, #000 12%, rgb(0 0 0 / 70%) 48%, transparent 100%); }
.phase1-jet { transform-origin: 50% 0%; mask-image: linear-gradient(90deg, transparent, #000 20%, #000 80%, transparent); }
@media (prefers-reduced-motion: reduce) {
  .phase1-source-pass { display: none; }
}
</style>

