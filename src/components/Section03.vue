<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Section02To03Bridge from './Section02To03Bridge.vue'
import Section03Atmosphere from './Section03Atmosphere.vue'
import Section03Mascot from './Section03Mascot.vue'
import { copy } from '../i18n'
import '../section03.css'

gsap.registerPlugin(ScrollTrigger)
const root = ref<HTMLElement>()
const activeCard = ref(1)
let trigger: ScrollTrigger | undefined
let reveal: gsap.core.Timeline | undefined
let carousel: gsap.core.Timeline | undefined
let horizon: gsap.core.Tween | undefined
let hud: gsap.core.Tween | undefined
let breathing: gsap.core.Tween | undefined
let motionQuery: MediaQueryList | undefined
let active = false
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches

function stopLoops() {
  carousel?.kill(); horizon?.kill(); hud?.kill(); breathing?.kill()
  carousel = undefined; horizon = undefined; hud = undefined; breathing = undefined
}
function startLoops() {
  stopLoops()
  if (!active || document.hidden || reduced() || !root.value) return
  activeCard.value = 0
  carousel = gsap.timeline({ repeat: -1 })
  ;[0, 1, 2].forEach((index, step) => carousel!.call(() => { activeCard.value = index }, [], step * 2.5))
  carousel.to({}, { duration: 7.5 }, 0)
  const pulse = root.value.querySelector('.s03-horizon-pulse')
  if (pulse) horizon = gsap.fromTo(pulse, { strokeDashoffset: 240 }, { strokeDashoffset: -1900, duration: 8.5, ease: 'none', repeat: -1 })
  const rings = root.value.querySelector('.s03-hud')
  if (rings) hud = gsap.to(rings, { x: 7, y: -4, duration: 12, ease: 'sine.inOut', yoyo: true, repeat: -1 })
  const coatLight = root.value.querySelector('.s03-mascot-breath')
  if (coatLight) breathing = gsap.fromTo(coatLight, { opacity: .07 }, { opacity: .32, duration: 3.7, ease: 'sine.inOut', yoyo: true, repeat: -1 })
}
function enter() {
  active = true
  if (reduced()) { activeCard.value = 1; return }
  reveal?.kill()
  const section = root.value
  if (!section) return
  reveal = gsap.timeline({ onComplete: startLoops })
    .fromTo(section.querySelector('.s03-copy'), { x: -42, opacity: .2 }, { x: 0, opacity: 1, duration: .8, ease: 'power2.out' }, 0)
    .fromTo(section.querySelector('.s03-mascot'), { x: 56, opacity: .4 }, { x: 0, opacity: 1, duration: .94, ease: 'power2.out' }, .04)
    .fromTo(section.querySelector('.s03-bridge-scan'), { xPercent: -85, opacity: .22 }, { xPercent: 85, opacity: 0, duration: .2, ease: 'power1.out' }, .05)
}
function leave() { active = false; reveal?.kill(); stopLoops() }
function visibility() {
  if (document.hidden) { carousel?.pause(); horizon?.pause(); hud?.pause(); breathing?.pause() }
  else if (active && !reduced()) {
    if (carousel) { carousel.resume(); horizon?.resume(); hud?.resume(); breathing?.resume() }
    else startLoops()
  }
}
function setup() {
  trigger?.kill(); trigger = undefined
  reveal?.kill(); stopLoops()
  if (!root.value) return
  active = false
  activeCard.value = 1
  root.value.classList.toggle('s03-reduced', reduced())
  if (reduced()) return
  trigger = ScrollTrigger.create({
    trigger: root.value,
    start: 'top 85%',
    end: 'bottom top',
    invalidateOnRefresh: true,
    onEnter: enter,
    onEnterBack: enter,
    onLeave: leave,
    onLeaveBack: leave,
  })
}
onMounted(() => {
  motionQuery = matchMedia('(prefers-reduced-motion: reduce)')
  motionQuery.addEventListener('change', setup)
  document.addEventListener('visibilitychange', visibility)
  setup()
  ScrollTrigger.refresh()
})
onBeforeUnmount(() => {
  motionQuery?.removeEventListener('change', setup)
  document.removeEventListener('visibilitychange', visibility)
  trigger?.kill(); reveal?.kill(); stopLoops()
})
</script>

<template>
  <section id="section-03" ref="root" class="s03" aria-labelledby="s03-title">
    <Section03Atmosphere />
    <Section02To03Bridge />
    <div class="s03-layout">
      <div class="s03-copy">
        <div class="s03-eyebrow"><strong>03</strong><span></span><small>{{ copy.s03.eyebrow }}</small></div>
        <h2 id="s03-title">WHAT<br><em>WE DO.</em></h2>
        <p>{{ copy.s03.description }}</p>
      </div>
      <Section03Mascot :active="activeCard" />
      <div class="s03-platform" aria-hidden="true"></div>
    </div>
    <span class="s03-sr-only">{{ copy.s03.services }}</span>
  </section>
</template>
