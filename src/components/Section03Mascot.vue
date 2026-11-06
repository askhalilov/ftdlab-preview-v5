<script setup lang="ts">
import { asset } from '../assets'
import Section03LaptopUI from './Section03LaptopUI.vue'
import { copy } from '../i18n'
defineProps<{ active: number }>()
</script>

<template>
  <div class="s03-mascot" :aria-label="copy.s03.mascotAria" role="img">
    <svg viewBox="625 0 1047 941" preserveAspectRatio="xMidYMid meet" class="s03-mascot-svg" aria-hidden="true">
      <defs><clipPath id="s03-foreground-clip"><path d="M650 230 L820 0 H1672 V941 H625 V700 L712 615 Z" /></clipPath></defs>
      <image :href="asset('section03/mascot-laptop-alpha.png')" x="0" y="0" width="1672" height="941" clip-path="url(#s03-foreground-clip)" />
      <Section03LaptopUI :active="active" />
      <ellipse class="s03-mascot-breath" cx="1340" cy="568" rx="170" ry="150" fill="url(#s03-breath-light)" />
      <defs><radialGradient id="s03-breath-light"><stop stop-color="#00deff" stop-opacity=".14" /><stop offset="1" stop-color="#00deff" stop-opacity="0" /></radialGradient></defs>
    </svg>
  </div>
</template>
