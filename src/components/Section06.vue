<script setup lang="ts">
import { defineAsyncComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usesNativeScroll } from '../mobileScroll'
import { copy } from '../i18n'
import '../section06.css'

gsap.registerPlugin(ScrollTrigger)
const root = ref<HTMLElement>()
const globeReady = ref(false)
const HolographicGlobe = defineAsyncComponent(() => import('./HolographicGlobe.vue'))
let globeObserver: IntersectionObserver | undefined
const openIndex = ref<number | null>(null)
let trigger: ScrollTrigger | undefined
let entrance: gsap.core.Timeline | undefined
let played = false
let motionQuery: MediaQueryList | undefined
const revealSelector = '.s06__meta,.s06__title,.s06__globe-slot,.s06__faq-item'
function reveal() {
  if (!root.value || played || motionQuery?.matches) return
  played = true
  const section = root.value
  if (usesNativeScroll()) {
    entrance = gsap.timeline().fromTo(section.querySelectorAll(revealSelector),
      { opacity: .65, y: 10 }, { opacity: 1, y: 0, duration: .42, ease: 'power2.out' })
    return
  }
  entrance = gsap.timeline()
    .to(section.querySelector('.s06__meta'), { opacity: 1, y: 0, duration: .36 }, 0)
    .to(section.querySelector('.s06__title'), { opacity: 1, y: 0, duration: .55, ease: 'power2.out' }, .14)
    .to(section.querySelector('.s06__globe-slot'), { opacity: 1, y: 0, duration: .7 }, .26)
    .to(section.querySelectorAll('.s06__faq-item'), { opacity: 1, y: 0, duration: .43, stagger: .1 }, .38)
}
function motionChange() {
  if (!root.value) return
  if (motionQuery?.matches) {
    entrance?.kill()
    played = true
    gsap.set(root.value.querySelectorAll(revealSelector), { opacity: 1, y: 0 })
  }
}
onMounted(() => {
  globeObserver = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) { globeReady.value = true; globeObserver?.disconnect() }
  }, { rootMargin: '600px 0px' })
  if (root.value) globeObserver.observe(root.value)
  motionQuery = matchMedia('(prefers-reduced-motion: reduce)')
  motionQuery.addEventListener('change', motionChange)
  if (!motionQuery.matches && root.value) {
    if (!usesNativeScroll()) gsap.set(root.value.querySelectorAll(revealSelector), { opacity: 0, y: 16 })
    trigger = ScrollTrigger.create({ trigger: root.value, start: 'top 77%', onEnter: reveal, onEnterBack: reveal })
  }
  ScrollTrigger.refresh()
})
onBeforeUnmount(() => {
  globeObserver?.disconnect()
  trigger?.kill()
  entrance?.kill()
  motionQuery?.removeEventListener('change', motionChange)
})
</script>

<template>
  <section id="section-06" ref="root" class="s06" aria-labelledby="s06-title">
    <div class="s06__transition" aria-hidden="true"></div>
    <div class="s06__floor" aria-hidden="true"></div>
    <div class="s06__layout">
      <div class="s06__left">
        <div class="s06__meta"><span>06.</span><i></i><small>FAQ</small></div>
        <h2 id="s06-title" class="s06__title">FAQ</h2>
        <div class="s06__globe-slot" aria-hidden="true"><HolographicGlobe v-if="globeReady" /></div>
      </div>
      <div class="s06__right" :aria-label="copy.s06.aria">
        <div v-for="(item, index) in copy.s06.items" :key="index" class="s06__faq-item" :class="{ 's06__faq-item--open': openIndex === index }">
          <button class="s06__faq-button" type="button" :aria-expanded="openIndex === index" :aria-controls="`s06-answer-${index}`" @click="openIndex = openIndex === index ? null : index">
            <span class="s06__faq-index">{{ String(index + 1).padStart(2, '0') }}</span>
            <span class="s06__faq-question">{{ item.question }}</span>
            <span class="s06__faq-toggle" aria-hidden="true"><span></span><span></span></span>
          </button>
          <div :id="`s06-answer-${index}`" class="s06__answer" role="region" :aria-label="item.question" :aria-hidden="openIndex !== index"><div><p>{{ item.answer }}</p></div></div>
        </div>
      </div>
    </div>
  </section>
</template>
