<script setup lang="ts">
import { copy } from '../i18n'
const metrics = ['FAST', '1500+', 'GEO']
const classes = ['stat-one', 'stat-two', 'stat-three']
</script>
<template>
  <ul class="stats" :aria-label="copy.hero.metricsAria">
    <li v-for="(metric, index) in metrics" :key="metric" :class="['stat', classes[index]]" data-intro="card">
      <strong v-fit class="fit-box"><span class="fit-copy">{{ metric }}</span></strong>
      <span class="stat-label">{{ copy.hero.metrics[index] }}</span>
    </li>
  </ul>
</template>

