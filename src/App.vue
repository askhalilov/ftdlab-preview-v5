<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import HeroAnimation from './components/HeroAnimation.vue'
import SiteNav from './components/SiteNav.vue'
import Section02 from './components/Section02.vue'
import HeroSectionBridge from './components/HeroSectionBridge.vue'
import Section03 from './components/Section03.vue'
import Section04 from './components/Section04.vue'
import Section05 from './components/Section05.vue'
import Section06 from './components/Section06.vue'
import Section07 from './components/Section07.vue'
import SiteFooter from './components/SiteFooter.vue'
import InteractionFeedback from './components/InteractionFeedback.vue'
import { heroConfig } from './config'
import { copy } from './i18n'
import type { RigEye } from './motion/livingMascotContext'
type View = 'auto' | 'desktop' | 'mobile'
const query = new URLSearchParams(location.search)
const choice = ref<View>(['auto', 'desktop', 'mobile'].includes(query.get('view') ?? '') ? query.get('view') as View : 'auto')
const review = query.get('review') === '1'
// Preserve the horizontal canvas on landscape screens. Compact portrait
// windows keep the vertical composition instead of a half-empty viewport.
const compositionQuery = '(max-width: 900px), (max-width: 1199px) and (max-aspect-ratio: 4/3)'
const isNarrow = ref(matchMedia(compositionQuery).matches)
const reduced = ref(matchMedia('(prefers-reduced-motion: reduce)').matches)
const paused = ref(false)
const state = ref('Ready')
const overlay = ref(0)
const capsuleProgress = ref(100)
const view = computed(() => choice.value === 'auto' ? (isNarrow.value ? 'mobile' : 'desktop') : choice.value)
// The refined rig is the desktop default. The original artwork remains an
// explicit configuration/query fallback; mobile never mounts the desktop rig.
const livingOverride = query.get('livingMascot')
const livingRequested = ref(livingOverride === '0' ? false : livingOverride === '1' ? true : heroConfig.desktopMascot === 'living')
const livingEnabled = computed(() => view.value === 'desktop' && livingRequested.value)
const amplitudeQuery = Number(review ? query.get('rigAmplitude') ?? 70 : 70)
const limbAmplitude = ref(Number.isFinite(amplitudeQuery) ? Math.min(100, Math.max(0, amplitudeQuery)) : 70)
const eyeQuery = review ? query.get('rigEye') : null
const rigEye = ref<RigEye>(eyeQuery === 'half' || eyeQuery === 'closed' ? eyeQuery : 'open')
const rigJets = ref(!review || query.get('rigJets') !== '0')
const poseQuery = review ? query.get('rigPose') : null
const rigPose = ref<number | undefined>(poseQuery !== null && Number.isFinite(Number(poseQuery)) ? Math.min(1, Math.max(-1, Number(poseQuery))) : undefined)
function neutralRig() { limbAmplitude.value = 0; rigEye.value = 'open'; rigJets.value = true; rigPose.value = 0 }
const animation = ref<InstanceType<typeof HeroAnimation>>()
const replayControl = ref<HTMLButtonElement>()
const menu = ref<HTMLElement>()
const menuOpen = ref(false)
const media = matchMedia(compositionQuery)
const motion = matchMedia('(prefers-reduced-motion: reduce)')
const mediaChange = () => { isNarrow.value = media.matches }
const motionChange = () => { reduced.value = motion.matches }
function selectView() { closeMenu(false) }
function replayFromMenu() {
  closeMenu(false)
  // Keep focus on the review control. Restoring it inside the hero would
  // immediately finish the new intro via the keyboard visibility safeguard.
  replayControl.value?.focus()
  animation.value?.replay()
}
async function openMenu(event: MouseEvent) {
  menuOpen.value = !menuOpen.value
  await nextTick()
  if (menuOpen.value) menu.value?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()
}
function closeMenu(restoreFocus = true) {
  if (!menuOpen.value) return
  menuOpen.value = false
  if (restoreFocus) void nextTick(() => document.querySelector<HTMLElement>('.menu-trigger')?.focus())
}
function menuKeys(event: KeyboardEvent) {
  if (event.key === 'Escape') { event.preventDefault(); closeMenu(); return }
  if (event.key === 'Tab') { closeMenu(false); return }
  const items = Array.from(menu.value?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])
  const index = items.indexOf(document.activeElement as HTMLElement)
  const next = event.key === 'ArrowDown' ? (index + 1) % items.length : event.key === 'ArrowUp' ? (index + items.length - 1) % items.length : event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : -1
  if (next >= 0) { event.preventDefault(); items[next]?.focus() }
}
function openCta(value: 'affiliate' | 'advertiser', source = 'hero', partnership?: string) {
  closeMenu(false)
  window.dispatchEvent(new CustomEvent('ftdlab:cta', { detail: { audience: value, source, partnership } }))
  window.dispatchEvent(new CustomEvent('ftdlab:navigate', { detail: value === 'affiliate' ? 'section-07' : 'section-05' }))
  if (value === 'advertiser') window.setTimeout(() => document.querySelector<HTMLElement>('.s05__card:first-child .s05__card-heading')?.focus({ preventScroll: true }), 850)
}
function partnershipContact(partnership?: string) {
  window.dispatchEvent(new CustomEvent('ftdlab:cta', { detail: { audience: 'advertiser', source: 'section05', partnership } }))
  window.dispatchEvent(new CustomEvent('ftdlab:navigate', { detail: 'section-07' }))
}
function menuCta(event: MouseEvent, value: 'affiliate' | 'advertiser') {
  const href = value === 'affiliate' ? heroConfig.affiliateHref : heroConfig.advertiserHref
  if (!href) { event.preventDefault(); openCta(value) }
  else closeMenu(false)
}
function outsideMenu(event: PointerEvent) {
  if (menuOpen.value && !menu.value?.contains(event.target as Node) && !(event.target as HTMLElement).closest('.menu-trigger')) closeMenu(false)
}
onMounted(() => {
  media.addEventListener('change', mediaChange)
  motion.addEventListener('change', motionChange)
  document.addEventListener('pointerdown', outsideMenu)
})
onBeforeUnmount(() => {
  media.removeEventListener('change', mediaChange)
  motion.removeEventListener('change', motionChange)
  document.removeEventListener('pointerdown', outsideMenu)
})
</script>
<template>
  <SiteNav v-if="!review" />
  <main :class="['preview', { 'preview-clean': !review }, `preview-${view}`]">
    <header v-if="review" class="preview-toolbar">
      <div><strong>FTD.LAB · Hero review</strong><p>Desktop: diagonal source-panel opening with the refined living mascot. Mobile: registered diagonal doors, original pointing pose and eye-local blinking.</p></div>
      <div class="preview-controls">
        <label>Composition <select v-model="choice" @change="selectView"><option value="auto">Auto</option><option value="desktop">Desktop</option><option value="mobile">Mobile</option></select></label>
        <button ref="replayControl" type="button" @click="animation?.replay()" :disabled="reduced">Replay intro</button>
        <button type="button" @click="paused = !paused" :disabled="reduced" :aria-pressed="paused">{{ paused ? 'Resume' : 'Pause' }}</button>
        <button type="button" @click="animation?.previewBlink()" :disabled="reduced || paused">Preview blink</button>
        <label>Capsule opening <input aria-label="Capsule opening" type="range" min="0" max="100" step="1" :value="capsuleProgress" @input="animation?.setCapsuleProgress(Number(($event.target as HTMLInputElement).value))" /><output>{{ Math.round(capsuleProgress) }}%</output></label>
        <span class="motion-state" role="status">{{ reduced ? 'Reduced motion · static' : state }}</span>
      </div>
      <div class="preview-controls" aria-label="Living mascot prototype review">
        <label><input v-model="livingRequested" aria-label="Living rig" type="checkbox" :disabled="view !== 'desktop'" /> Living rig · refined</label>
        <label>Limb amplitude <input v-model.number="limbAmplitude" aria-label="Limb amplitude" type="range" min="0" max="100" :disabled="!livingEnabled" /><output>{{ limbAmplitude }}%</output></label>
        <label>Eye preview <select v-model="rigEye" aria-label="Eye preview" :disabled="!livingEnabled"><option value="open">Original open</option><option value="half">Half · prototype</option><option value="closed">Closed · prototype</option></select></label>
        <label><input v-model="rigJets" aria-label="Rig jets" type="checkbox" :disabled="!livingEnabled" /> Jets</label>
        <label>Rig pose <select v-model="rigPose" aria-label="Rig pose" :disabled="!livingEnabled"><option :value="undefined">Idle</option><option :value="-1">Negative extreme</option><option :value="0">Neutral</option><option :value="1">Positive extreme</option></select></label>
        <button type="button" :disabled="!livingEnabled" @click="neutralRig">Reset rig neutral</button>
        <span>Desktop rig is enabled by default. Alternate eye states remain prototype artwork.</span>
      </div>
    </header>
    <div id="home" class="hero-boundary-host">
      <div class="preview-stage">
        <HeroAnimation ref="animation" :view="view" :reduced="reduced" :paused="paused" :reference-opacity="overlay" :menu-open="menuOpen" :affiliate-href="review ? heroConfig.affiliateHref : ''" :advertiser-href="review ? heroConfig.advertiserHref : ''" :living-rig="livingEnabled" :limb-amplitude="limbAmplitude / 100" :rig-eye="rigEye" :rig-jets="rigJets" :rig-pose="livingEnabled ? rigPose : undefined" @state="state = $event" @capsule-progress="capsuleProgress = $event" @cta="openCta" @menu="openMenu" />
      </div>
      <HeroSectionBridge />
    </div>
    <Section02 />
    <div class="section-stitch section-stitch--02-03" aria-hidden="true"></div>
    <Section03 />
    <div class="section-stitch section-stitch--03-04" aria-hidden="true"></div>
    <Section04 />
    <div class="section-stitch section-stitch--04-05" aria-hidden="true"></div>
    <Section05 @contact="partnershipContact" />
    <div class="section-stitch section-stitch--05-06" aria-hidden="true"></div>
    <Section06 />
    <div class="section-stitch section-stitch--06-07" aria-hidden="true"></div>
    <Section07 />
    <SiteFooter />
    <footer v-if="review" class="preview-footer">
      <label>Reference overlay <input v-model.number="overlay" type="range" min="0" max="1" step="0.01" /><output>{{ Math.round(overlay * 100) }}%</output></label>
      <p>Headline, copy, CTAs and metrics are live HTML. Desktop uses supplied registered capsule layers and complementary SVG panel masks. Mobile uses registered reconstructed doors and a continuous arm field over the approved pointing artwork. Jets remain baked into the desktop mascot; blinking is simulated.</p>
      <a href="./docs/ASSET_READINESS.md" target="_blank" rel="noopener">Asset readiness</a> · <a href="./docs/MISSING_SOURCES.md" target="_blank" rel="noopener">Missing sources</a>
    </footer>
    <nav v-if="menuOpen" id="hero-navigation" ref="menu" class="preview-menu" role="menu" :aria-label="copy.nav.main" @keydown="menuKeys">
      <a role="menuitem" :href="heroConfig.affiliateHref || '#get-started'" @click="menuCta($event, 'affiliate')">{{ copy.hero.getStarted }}</a>
      <a role="menuitem" :href="heroConfig.advertiserHref || '#advertisers'" @click="menuCta($event, 'advertiser')">{{ copy.hero.advertisers }}</a>
      <button v-if="review" type="button" role="menuitem" @click="replayFromMenu">Replay intro</button>
    </nav>
  </main>
  <InteractionFeedback :paused="paused" />
</template>

