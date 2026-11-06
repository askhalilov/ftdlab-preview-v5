<script setup lang="ts">
import { asset } from '../assets'
import HeroBrand from './HeroBrand.vue'
import HeroCta from './HeroCta.vue'
import HeroMetrics from './HeroMetrics.vue'
import HeroScene from './HeroScene.vue'
import { copy } from '../i18n'
defineProps<{ menuOpen: boolean; affiliateHref?: string; advertiserHref?: string }>()
defineEmits<{ cta: [audience: 'affiliate' | 'advertiser']; menu: [event: MouseEvent] }>()
function explore() { window.dispatchEvent(new CustomEvent('ftdlab:navigate', { detail: 'section-02' })) }
</script>

<template>
  <section class="composition hero-desktop" :aria-label="copy.hero.ariaDesktop">
    <img class="art background-art" :src="asset('desktop/background/hero-background.svg')" alt="" />
    <img class="art ambient-art" :src="asset('desktop/background/ambient-cyan-glow.svg')" alt="" />
    <img class="art beam-art" :src="asset('desktop/background/diagonal-light-beam.svg')" alt="" />
    <img class="art hud-art" :src="asset('shared/hud/desktop-hud.svg')" alt="" />

    <HeroBrand />
    <button class="menu-trigger" type="button" :aria-label="copy.nav.toggle" aria-haspopup="menu" :aria-expanded="menuOpen" aria-controls="hero-navigation" @click="$emit('menu', $event)">
      <img :src="asset('shared/icons/menu-desktop.svg')" alt="" />
    </button>

    <h1 class="headline" :aria-label="copy.hero.headline">
      <span v-fit class="fit-box line-one" data-intro="headline"><span class="fit-copy">TURN TRAFFIC</span></span>
      <span v-fit class="fit-box line-two cyan" data-intro="headline"><span class="fit-copy">INTO RESULTS.</span></span>
      <span v-fit class="fit-box line-three" data-intro="headline"><span class="fit-copy">WE HANDLE</span></span>
      <span v-fit class="fit-box line-four" data-intro="headline"><span class="fit-copy">THE REST<span class="cyan">.</span></span></span>
    </h1>
    <p class="hero-description" data-intro="copy">{{ copy.hero.description }}</p>
    <HeroCta :affiliate-href="affiliateHref" :advertiser-href="advertiserHref" @cta="$emit('cta', $event)" />
    <HeroScene view="desktop" />
    <HeroMetrics />
    <a class="hero-scroll-cue" href="#section-02" @click.prevent="explore">{{ copy.hero.scroll }} <span aria-hidden="true">↓</span></a>
  </section>
</template>
