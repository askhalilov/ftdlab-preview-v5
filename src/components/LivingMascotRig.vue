<script setup lang="ts">
import { asset } from '../assets'
import { useId } from 'vue'
import { livingMascotSeams } from '../motion/livingMascotSeams'
const seamMask = `rig-overlap-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`

defineProps<{
  amplitude: number
  eye: 'open' | 'half' | 'closed'
  jets: boolean
}>()

const source = (name: string) => asset(`mascot-phase4/${name}.png`)
</script>

<template>
  <!-- Opt-in technical pixel-partition rig. The parent mascot group owns
       overall levitation; the controller owns all five local joint transforms.
       Original-source overlap bands cover the full internal partition cuts. -->
  <g data-living-rig data-source-status="technical-pixel-partition" :data-rig-amplitude="amplitude" :data-rig-eye="eye" aria-hidden="true">
    <defs>
      <mask :id="seamMask" x="0" y="0" width="1254" height="1254" maskUnits="userSpaceOnUse" style="mask-type: luminance">
        <rect width="1254" height="1254" fill="black" />
        <path v-for="seam in livingMascotSeams" :key="seam.id" :data-joint-region="seam.id" :d="seam.path" fill="none" stroke="white" :stroke-width="seam.width" stroke-linecap="round" stroke-linejoin="round" />
      </mask>
      <!-- Bound the existing registered closure patch to its actual eye alpha
           region; automatic blinking never replaces the full head or body. -->
      <clipPath :id="`${seamMask}-eyes`" clipPathUnits="userSpaceOnUse"><rect x="568" y="309" width="155" height="74" /></clipPath>
    </defs>
    <!-- The PNG's original alpha bounds each cover to the approved silhouette.
         At amplitude zero omit the overlap pass for exact neutral assembly. -->
    <g v-if="amplitude > 0" data-joint-cover :mask="`url(#${seamMask})`">
      <image :href="asset('capsule-phase3/mascot-registered.png')" x="0" y="0" width="1254" height="1254" />
    </g>
    <image data-rig-body :href="source('mascot-body-base')" x="0" y="0" width="1254" height="1254" />

    <g data-rig-part="leg-left" data-anchor-x="594" data-anchor-y="611">
      <image :href="source('mascot-leg-left')" x="0" y="0" width="1254" height="1254" />
      <g data-rig-jet="left" data-anchor-x="563" data-anchor-y="872" :visibility="jets ? 'visible' : 'hidden'">
        <image :href="source('jet-left')" x="0" y="0" width="1254" height="1254" />
        <g data-rig-jet-pulse="left" opacity="0" style="mix-blend-mode: screen"><image :href="source('jet-left')" width="1254" height="1254" /></g>
      </g>
    </g>
    <g data-rig-part="leg-right" data-anchor-x="672" data-anchor-y="616">
      <image :href="source('mascot-leg-right')" x="0" y="0" width="1254" height="1254" />
      <g data-rig-jet="right" data-anchor-x="680" data-anchor-y="899" :visibility="jets ? 'visible' : 'hidden'">
        <image :href="source('jet-right')" x="0" y="0" width="1254" height="1254" />
        <g data-rig-jet-pulse="right" opacity="0" style="mix-blend-mode: screen"><image :href="source('jet-right')" width="1254" height="1254" /></g>
      </g>
    </g>

    <g data-rig-part="arm-left" data-anchor-x="524" data-anchor-y="427">
      <image :href="source('mascot-arm-left')" x="0" y="0" width="1254" height="1254" />
    </g>
    <g data-rig-part="arm-right" data-anchor-x="711" data-anchor-y="430">
      <image :href="source('mascot-arm-right')" x="0" y="0" width="1254" height="1254" />
    </g>

    <g data-rig-part="head" data-anchor-x="622" data-anchor-y="390">
      <!-- The source head already contains the approved original open eyes.
           An additional open patch would double-composite its edge alpha. -->
      <image :href="source('mascot-head')" x="0" y="0" width="1254" height="1254" />
      <image v-if="eye !== 'open'" data-rig-eye-layer data-source-status="derived-eye-prototype-not-approved" :href="source(`mascot-eyes-${eye}`)" x="0" y="0" width="1254" height="1254" />
      <!-- Fast display-only LED closure from the supplied registered prototype.
           Original source-authored eyelids/clean visor masters remain missing. -->
      <image data-rig-blink-layer data-source-status="derived-registered-led-closure" :href="source('mascot-eyes-closed')" :clip-path="`url(#${seamMask}-eyes)`" :visibility="eye === 'open' ? 'visible' : 'hidden'" opacity="0" x="0" y="0" width="1254" height="1254" />
    </g>
  </g>
</template>
