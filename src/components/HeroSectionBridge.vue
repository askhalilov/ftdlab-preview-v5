<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MOBILE_SCROLL_QUERY, usesNativeScroll } from '../mobileScroll'
import '../heroSectionBridge.css'

gsap.registerPlugin(ScrollTrigger)
const bridge = ref<HTMLElement>()
let trigger: ScrollTrigger | undefined
let motion: MediaQueryList | undefined
let scrollQuery: MediaQueryList | undefined
let resizeObserver: ResizeObserver | undefined
function setup() {
  trigger?.kill()
  trigger = undefined
  if (!bridge.value || motion?.matches || usesNativeScroll()) {
    bridge.value?.style.setProperty('--bridge-strength', '0')
    return
  }
  const section = document.getElementById('section-02')
  if (!section) return
  trigger = ScrollTrigger.create({
    trigger: section,
    start: 'top bottom',
    end: 'top top',
    invalidateOnRefresh: true,
    onUpdate(self) {
      // The visual layer peaks as the physical boundary crosses mid-viewport,
      // then clears completely for the approved Scene 01 endpoint.
      const smooth = (value: number) => value * value * (3 - 2 * value)
      const rise = smooth(Math.min(1, self.progress / .28))
      const fall = smooth(Math.min(1, (1 - self.progress) / .12))
      const strength = rise * fall
      bridge.value?.style.setProperty('--bridge-strength', strength.toFixed(4))
    },
  })
  trigger.refresh()
}
onMounted(() => {
  motion = matchMedia('(prefers-reduced-motion: reduce)')
  motion.addEventListener('change', setup)
  scrollQuery = matchMedia(MOBILE_SCROLL_QUERY)
  scrollQuery.addEventListener('change', setup)
  resizeObserver = new ResizeObserver(() => trigger?.refresh())
  const stage = bridge.value?.parentElement
  const section = document.getElementById('section-02')
  if (stage) resizeObserver.observe(stage)
  if (section) resizeObserver.observe(section)
  setup()
})
onBeforeUnmount(() => {
  motion?.removeEventListener('change', setup)
  scrollQuery?.removeEventListener('change', setup)
  resizeObserver?.disconnect()
  trigger?.kill()
})
</script>

<template>
  <div ref="bridge" class="hero-section-bridge" aria-hidden="true">
    <div class="hero-section-bridge__veil"></div>
    <div class="hero-section-bridge__glow"></div>
  </div>
</template>
