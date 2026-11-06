<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { copy, locale, setLocale, type Locale } from '../i18n'
import connectLogo from '../../assets/section04/connect-logo-reference.png'
import '../site-nav.css'

const links = [
  { key: 'home', id: 'home' },
  { key: 'performance', id: 'section-02' },
  { key: 'what', id: 'section-03' },
  { key: 'connect', id: 'section-04' },
  { key: 'partnerships', id: 'section-05' },
  { key: 'faq', id: 'section-06' },
  { key: 'contact', id: 'section-07' },
] as const
const open = ref(false)
const current = ref<(typeof links)[number]['id']>('home')
const currentIndex = computed(() => Math.max(0, links.findIndex(link => link.id === current.value)))
const trigger = ref<HTMLButtonElement>()
const stepTrigger = ref<HTMLButtonElement>()
let frame = 0
function updateCurrent() {
  frame = 0
  const threshold = Math.min(innerHeight * .34, 280)
  let selected: (typeof links)[number]['id'] = 'home'
  for (const link of links) {
    const section = document.getElementById(link.id)
    if (section && section.getBoundingClientRect().top <= threshold) selected = link.id
  }
  // The approved Connect logo belongs to its full-screen composition; restore
  // the standard navigation as the next section enters the viewport.
  if (selected === 'section-04' && innerWidth > 900 &&
      (document.getElementById('section-05')?.getBoundingClientRect().top ?? Infinity) <= innerHeight * .64) selected = 'section-05'
  if (current.value !== selected) open.value = false
  current.value = selected
}
function queueUpdate() { if (!frame) frame = requestAnimationFrame(updateCurrent) }
function navigate(id: string, record = true) {
  open.value = false
  const target = document.getElementById(id)
  if (!target) return
  if (record) history.pushState(null, '', `#${id}`)
  target.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
  current.value = id as typeof current.value
}
function select(event: MouseEvent, id: string) {
  if (event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  navigate(id)
}
function onNavigate(event: Event) { navigate((event as CustomEvent<string>).detail) }
function onHistory() {
  const id = decodeURIComponent(location.hash.slice(1)) || 'home'
  navigate(id, false)
}
function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape' && open.value) { open.value = false; (current.value === 'section-04' && innerWidth > 900 ? stepTrigger.value : trigger.value)?.focus(); return }
}
function changeLanguage(next: Locale) { setLocale(next); open.value = false; queueUpdate() }
onMounted(() => {
  addEventListener('scroll', queueUpdate, { passive: true })
  addEventListener('resize', queueUpdate)
  addEventListener('ftdlab:navigate', onNavigate)
  addEventListener('popstate', onHistory)
  addEventListener('keydown', onKey)
  queueUpdate()
  if (location.hash) requestAnimationFrame(onHistory)
})
onBeforeUnmount(() => {
  removeEventListener('scroll', queueUpdate)
  removeEventListener('resize', queueUpdate)
  removeEventListener('ftdlab:navigate', onNavigate)
  removeEventListener('popstate', onHistory)
  removeEventListener('keydown', onKey)
  if (frame) cancelAnimationFrame(frame)
})
</script>

<template>
  <header class="site-nav" :data-current-section="current">
    <a class="site-nav__logo" href="#home" :aria-label="`FTD.LAB — ${copy.nav.home}`" @click="select($event, 'home')"><span class="site-nav__logo-standard">FTD.<span>LAB</span></span><img class="site-nav__connect-logo" :src="connectLogo" alt="" aria-hidden="true" /></a>
    <button ref="stepTrigger" type="button" class="site-nav__mobile-step" :aria-expanded="open" aria-controls="site-nav-links" :aria-label="`${copy.nav.toggle}; ${copy.nav.current}: ${copy.nav[links[currentIndex]!.key]}`" @click="open = !open">{{ String(currentIndex + 1).padStart(2, '0') }} / 07</button>
    <nav id="site-nav-links" class="site-nav__links" :class="{ 'site-nav__links--open': open }" :aria-label="copy.nav.main">
      <a v-for="link in links" :key="link.id" :href="`#${link.id}`" :aria-current="current === link.id ? 'location' : undefined" @click="select($event, link.id)">{{ copy.nav[link.key] }}</a>
      <div class="site-nav__language site-nav__language--mobile" :aria-label="copy.nav.language" role="group">
        <button v-for="language in (['en', 'ru'] as const)" :key="language" type="button" :lang="language" :aria-pressed="locale === language" @click="changeLanguage(language)">{{ language.toUpperCase() }}</button>
      </div>
    </nav>
    <div class="site-nav__language site-nav__language--desktop" :aria-label="copy.nav.language" role="group">
      <button v-for="language in (['en', 'ru'] as const)" :key="language" type="button" :lang="language" :aria-pressed="locale === language" @click="changeLanguage(language)">{{ language.toUpperCase() }}</button>
    </div>
    <button ref="trigger" type="button" class="site-nav__toggle" :aria-expanded="open" aria-controls="site-nav-links" :aria-label="copy.nav.toggle" @click="open = !open"><span></span><span></span><span></span></button>
  </header>
</template>
