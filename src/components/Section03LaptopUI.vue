<script setup lang="ts">
import { copy, locale } from '../i18n'
defineProps<{ active: number }>()
const cards = [
  { shape: 'M739 345 L839 347 L864 516 L769 522 Z', cx: 803, number: '01', icon: 'M791 388 v13 m7 -20 v20 m7 -12 v12 m7 -23 v23' },
  { shape: 'M847 333 L954 334 L982 514 L878 520 Z', cx: 914, number: '02', icon: 'M897 395 l9 -12 8 5 12 -19' },
  { shape: 'M967 347 L1064 349 L1093 507 L994 516 Z', cx: 1029, number: '03', icon: 'M1014 390 a6 6 0 1 1 12 0 a6 6 0 1 1 -12 0 m18 0 a5 5 0 1 1 10 0 a5 5 0 1 1 -10 0' },
]
</script>

<template>
  <g class="s03-ui" aria-hidden="true">
    <defs>
      <clipPath id="s03-screen-clip"><path d="M695 282 L1122 289 L1147 537 L727 565 Z" /></clipPath>
      <linearGradient id="s03-screen-base" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#02090e" /><stop offset="1" stop-color="#041820" /></linearGradient>
      <linearGradient id="s03-ui-card-fill" x1="0" y1="0" x2=".3" y2="1"><stop stop-color="#102b35" /><stop offset=".62" stop-color="#071924" /><stop offset="1" stop-color="#0a3340" /></linearGradient>
      <linearGradient id="s03-ui-active-fill" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#092c39" /><stop offset=".55" stop-color="#04121a" /><stop offset="1" stop-color="#064456" /></linearGradient>
    </defs>
    <g clip-path="url(#s03-screen-clip)">
      <path d="M695 282 L1122 289 L1147 537 L727 565 Z" fill="url(#s03-screen-base)" />
      <path d="M705 306 L1074 313 M724 545 L1103 521" stroke="#115262" stroke-width=".8" opacity=".5" />
      <text x="710" y="316" class="s03-ui-brand">FTD.LAB</text>
      <path d="M1024 311 H1091" stroke="#436b76" stroke-width="1.7" />
      <circle v-for="(_, index) in cards" :key="`dot-${index}`" :cx="[1024,1056,1088][index]" cy="310" r="4" class="s03-ui-dot" :class="{ 'is-active': active === index }" />
      <g v-for="(card, index) in cards" :key="card.number" class="s03-ui-card" :class="{ 'is-active': active === index }">
        <path :d="card.shape" class="s03-ui-card-face" />
        <path :d="card.shape" class="s03-ui-card-border" />
        <path :d="`M${card.cx - 41} 474 C${card.cx - 12} 448 ${card.cx + 10} 450 ${card.cx + 48} 482`" class="s03-ui-card-planet" />
        <path v-if="index === 1" d="M876 496 L891 485 L900 491 L910 470 L922 477 L934 461 L946 466 L961 442" class="s03-ui-card-chart" />
        <circle :cx="card.cx" cy="391" r="19" class="s03-ui-icon-ring" />
        <path :d="card.icon" class="s03-ui-icon" />
        <text :x="card.cx" y="430" text-anchor="middle" class="s03-ui-card-title" :class="{ 's03-ui-card-title--ru': locale === 'ru' }"><tspan :x="card.cx">{{ copy.s03.laptop[index]![0] }}</tspan><tspan :x="card.cx" dy="18">{{ copy.s03.laptop[index]![1] }}</tspan></text>
        <text :x="card.cx + 15" :y="[542,538,532][index]" text-anchor="middle" class="s03-ui-number">{{ card.number }}</text>
        <path :d="`M${card.cx - 28} ${[554,550,544][index]} l56 -2`" class="s03-ui-progress" />
      </g>
    </g>
  </g>
</template>
