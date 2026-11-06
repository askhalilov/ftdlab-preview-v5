<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usesNativeScroll } from '../mobileScroll'
import { copy } from '../i18n'
import '../section07.css'

gsap.registerPlugin(ScrollTrigger)
const root = ref<HTMLElement>()
let trigger: ScrollTrigger | undefined
let entrance: gsap.core.Timeline | undefined
let motionQuery: MediaQueryList | undefined
let played = false
const reveal = '.s07__meta,.s07__heading,.s07__intro,.s07__contact-link,.s07__planet,.s07__side-copy'

function enter() {
  if (!root.value || played || motionQuery?.matches) return
  played = true
  if (usesNativeScroll()) {
    entrance = gsap.timeline().fromTo(root.value.querySelectorAll(reveal),
      { opacity: .65, y: 10 }, { opacity: 1, y: 0, duration: .42, ease: 'power2.out' })
    return
  }
  entrance = gsap.timeline()
    .to(root.value.querySelector('.s07__meta'), { opacity: 1, y: 0, duration: .35 }, 0)
    .to(root.value.querySelector('.s07__heading'), { opacity: 1, y: 0, duration: .65, ease: 'power2.out' }, .12)
    .to(root.value.querySelector('.s07__intro'), { opacity: 1, y: 0, duration: .45 }, .33)
    .to(root.value.querySelectorAll('.s07__contact-link'), { opacity: 1, y: 0, duration: .48, stagger: .12 }, .46)
    .to(root.value.querySelector('.s07__planet'), { opacity: 1, duration: .8 }, .22)
    .to(root.value.querySelector('.s07__side-copy'), { opacity: 1, y: 0, duration: .45 }, .65)
}
function motionChange() {
  if (!root.value || !motionQuery?.matches) return
  entrance?.kill()
  played = true
  gsap.set(root.value.querySelectorAll(reveal), { opacity: 1, y: 0 })
}
onMounted(() => {
  motionQuery = matchMedia('(prefers-reduced-motion: reduce)')
  motionQuery.addEventListener('change', motionChange)
  if (!motionQuery.matches && root.value) {
    if (!usesNativeScroll()) gsap.set(root.value.querySelectorAll(reveal), { opacity: 0, y: 14 })
    trigger = ScrollTrigger.create({ trigger: root.value, start: 'top 78%', onEnter: enter, onEnterBack: enter })
  }
  ScrollTrigger.refresh()
})
onBeforeUnmount(() => {
  trigger?.kill()
  entrance?.kill()
  motionQuery?.removeEventListener('change', motionChange)
})
</script>

<template>
  <section id="section-07" ref="root" class="s07" aria-labelledby="s07-title">
    <div class="s07__planet" aria-hidden="true">
      <div class="s07__planet-sphere"></div>
    </div>
    <div class="s07__content">
      <div class="s07__meta">
        <span>FTD.LAB <b>/</b> <em>07</em></span>
        <span class="s07__meta-contact"><i></i>{{ copy.s07.eyebrow }}</span>
      </div>
      <h2 id="s07-title" class="s07__heading"><span>LET'S TALK </span><span>BUSINESS.</span></h2>
      <p class="s07__intro">{{ copy.s07.intro }}</p>
      <div class="s07__contacts">
        <a class="s07__contact-link s07__contact-link--telegram" href="https://t.me/artemftdlab" target="_blank" rel="noopener noreferrer" :aria-label="copy.s07.telegramAria">
          <svg class="s07__contact-icon" viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M27.8 5.4 3.6 14.7c-1.5.6-1.5 1.4-.3 1.8l6.2 1.9 2.4 7.5c.3.9.2 1.3 1.1 1.3.7 0 1-.3 1.4-.8l3-2.9 6.2 4.6c1.2.7 2 .3 2.3-1.1l4.1-19.4c.4-1.7-.6-2.5-2.2-1.8ZM10.5 18l14.1-8.9c.7-.4 1.3-.2.8.3L13.8 20l-.5 5.1L10.5 18Z" fill="currentColor"/></svg>
          <span class="s07__contact-text"><strong>{{ copy.s07.telegram }}</strong><small>{{ copy.s07.telegramNote }}</small></span>
          <svg class="s07__arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M8 5h11v11" stroke="currentColor" stroke-width="2"/></svg>
        </a>
        <a class="s07__contact-link s07__contact-link--email" href="mailto:ftd.lab.traffic@gmail.com" :aria-label="copy.s07.emailAria">
          <svg class="s07__contact-icon" viewBox="0 0 32 32" fill="none" aria-hidden="true"><rect x="2.5" y="5.5" width="27" height="21" rx="2" stroke="currentColor" stroke-width="2.5"/><path d="m4 8 12 10L28 8" stroke="currentColor" stroke-width="2.5"/></svg>
          <span class="s07__contact-text"><strong>{{ copy.s07.email }}</strong><small>ftd.lab.traffic@gmail.com</small></span>
          <svg class="s07__arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M8 5h11v11" stroke="currentColor" stroke-width="2"/></svg>
        </a>
      </div>
      <p class="s07__side-copy"><template v-for="(line, index) in copy.s07.side" :key="index">{{ line }}<br v-if="index < 3" /></template></p>
    </div>
  </section>
</template>
