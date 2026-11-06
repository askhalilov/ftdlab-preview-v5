<script setup lang="ts">
import { asset } from '../assets'
import HeroBrand from './HeroBrand.vue'
import HeroCta from './HeroCta.vue'
import HeroMetrics from './HeroMetrics.vue'
import HeroScene from './HeroScene.vue'
import { copy } from '../i18n'
defineProps<{ menuOpen: boolean; affiliateHref?: string; advertiserHref?: string }>()
defineEmits<{ cta: [audience: 'affiliate' | 'advertiser']; menu: [event: MouseEvent] }>()
</script>

<template>
  <section class="composition hero-mobile" :aria-label="copy.hero.ariaMobile">
    <img class="art background-art" :src="asset('mobile/background/mobile-background.svg')" alt="" />
    <img class="art hud-art" :src="asset('shared/hud/mobile-hud.svg')" alt="" />
    <HeroBrand />
    <button class="menu-trigger" type="button" :aria-label="copy.nav.toggle" aria-haspopup="menu" :aria-expanded="menuOpen" aria-controls="hero-navigation" @click="$emit('menu', $event)">
      <img :src="asset('shared/icons/menu-mobile.svg')" alt="" />
    </button>

    <HeroScene view="mobile" />
    <h1 class="headline" :aria-label="copy.hero.headline">
      <span v-fit class="fit-box line-one" data-intro="headline"><span class="fit-copy">TURN TRAFFIC</span></span>
      <span v-fit class="fit-box line-two cyan" data-intro="headline"><span class="fit-copy">INTO RESULTS.</span></span>
      <span v-fit class="fit-box line-three" data-intro="headline"><span class="fit-copy">WE HANDLE THE REST</span></span>
    </h1>
    <HeroCta uppercase :affiliate-href="affiliateHref" :advertiser-href="advertiserHref" @cta="$emit('cta', $event)" />
    <div class="mobile-details">
      <div class="network-note" data-intro="copy">
        <span class="note-number">[ 01 ]</span>
        <p>{{ copy.hero.mobileNote1 }}</p>
        <p>{{ copy.hero.mobileNote2 }}</p>
        <span class="note-flourish" aria-hidden="true">/// <span></span></span>
      </div>
      <HeroMetrics />
    </div>
  </section>
</template>
