<script setup lang="ts">
import { asset } from '../assets'
import { desktopHorizonPath, mobileHorizonPath } from '../section02Horizon'
</script>

<template>
  <div class="s02-horizon" aria-hidden="true">
    <picture>
      <source media="(max-width: 900px) and (orientation: portrait)" :srcset="asset('section02/section02-background-mobile.png')">
      <img :src="asset('section02/section02-background-desktop.png')" alt="" draggable="false" loading="lazy" decoding="async">
    </picture>
    <svg class="s02-horizon-svg s02-horizon-desktop" viewBox="0 0 1672 941" preserveAspectRatio="xMidYMid meet">
      <path class="s02-energy-tail" :d="desktopHorizonPath" />
      <path class="s02-energy-front" :d="desktopHorizonPath" />
    </svg>
    <svg class="s02-horizon-svg s02-horizon-mobile" viewBox="0 0 941 1672" preserveAspectRatio="xMidYMid meet">
      <path class="s02-energy-tail" :d="mobileHorizonPath" />
      <path class="s02-energy-front" :d="mobileHorizonPath" />
    </svg>
  </div>
</template>
