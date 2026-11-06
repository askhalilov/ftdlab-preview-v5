<template>
  <div class="s03-atmosphere" aria-hidden="true">
    <div class="s03-atmosphere-glow"></div>
    <div class="s03-grid"></div>
    <svg class="s03-atmosphere-svg" viewBox="0 0 1672 941" preserveAspectRatio="none">
      <defs><linearGradient id="s03-planet-shade" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#002c3a" stop-opacity=".44" /><stop offset=".3" stop-color="#02151d" stop-opacity=".78" /><stop offset="1" stop-color="#01080b" /></linearGradient></defs>
      <path d="M0 742 C330 644 640 579 900 551 S1390 529 1672 553 L1672 941 H0 Z" fill="url(#s03-planet-shade)" />
      <path class="s03-horizon-glow" d="M0 742 C330 644 640 579 900 551 S1390 529 1672 553" />
      <path class="s03-horizon" d="M0 742 C330 644 640 579 900 551 S1390 529 1672 553" />
      <path class="s03-horizon-pulse" d="M0 742 C330 644 640 579 900 551 S1390 529 1672 553" />
      <g class="s03-hud"><path d="M712 395 A565 565 0 0 1 1642 85" /><path d="M845 445 A445 445 0 0 1 1512 137" /><path d="M955 489 A337 337 0 0 1 1451 221" /><path class="s03-hud-dash" d="M160 0 A630 630 0 0 0 835 106" /></g>
      <g class="s03-hud-marker"><path d="M1515 138 l8 0 m-4 -4 v8 M878 259 h6 m-3 -3 v6 M1600 329 h6 m-3 -3 v6" /><circle cx="832" cy="68" r="2" /><circle cx="37" cy="102" r="2" /></g>
    </svg>
  </div>
</template>
