<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import gsap from 'gsap'
import { animateMotionValue, motionValue } from 'motion-dom'
import HeroBrand from './HeroBrand.vue'
import { copy } from '../i18n'
import { loaderMotionConfig as motion } from '../motion/loaderMotionConfig'

// Portfolio Loader.tsx presentation with corporate copy/logo and the existing
// FTD readiness, session and accessibility contracts. No byte percentage.
const props = withDefaults(defineProps<{
  play: boolean; reduced?: boolean; paused?: boolean; progress: number
  ready: boolean; failed?: boolean; view: 'desktop' | 'mobile'; stage?: string
}>(), { reduced: false, paused: false })
const emit = defineEmits<{ done: [reason: 'complete' | 'cancelled'] }>()
const surface = ref<HTMLElement>()
const visible = ref(props.play)
const displayed = ref(0), currentWord = ref(0), wordOpacity = ref(0)
const wordY = ref<number>(motion.wordOffset)
const phase = ref<'progress' | 'complete'>('progress')
const confirmed = computed(() => Number.isFinite(props.progress) ? Math.max(0, Math.min(props.ready ? 100 : 99, props.progress)) : 0)
const percentage = confirmed
const bar = motionValue(0), opacity = motionValue(0), y = motionValue<number>(motion.wordOffset)
const values = [bar, opacity, y]
let started = false, settled = false, exitingWord = false
let appWasInert = false
let nextWord = 0, wordRevision = 0
let hold: gsap.core.Tween | undefined
const subscriptions = [
  bar.on('change', value => { if (!settled) displayed.value = value }),
  opacity.on('change', value => { if (!settled) wordOpacity.value = value }),
  y.on('change', value => { if (!settled) wordY.value = value }),
]

// Source setInterval clocks, extended to retain elapsed phase across pause.
type Clock = { period: number; remaining: number; due: number; id?: number; active: boolean; run: () => void }
const clocks: Clock[] = []
function schedule(clock: Clock) {
  if (settled || props.paused || !clock.active || clock.id !== undefined) return
  clock.due = performance.now() + clock.remaining
  clock.id = window.setTimeout(() => {
    clock.id = undefined; clock.remaining = clock.period
    if (settled || props.paused || !clock.active) return
    clock.run(); schedule(clock)
  }, clock.remaining)
}
function every(period: number, run: () => void) {
  const clock: Clock = { period, remaining: period, due: 0, active: true, run }
  clocks.push(clock); schedule(clock); return clock
}
function tween(value: typeof bar, target: number, duration: number, onComplete?: () => void) {
  const completed = value.start(animateMotionValue('value', value, target, { duration }))
  if (onComplete) void completed.then(() => { if (!settled) onComplete() })
  if (props.paused) value.animation?.pause()
}
function clearMotion() {
  wordRevision++
  clocks.forEach(clock => { clock.active = false; if (clock.id !== undefined) clearTimeout(clock.id) })
  values.forEach(value => value.stop()); hold?.kill(); hold = undefined
}
function finish(reason: 'complete' | 'cancelled' = 'cancelled') {
  if (settled) return
  settled = true; clearMotion()
  // Source App switches directly to content. Remove obstruction before the
  // unchanged closed-capsule intro is allowed to start.
  if (surface.value) {
    surface.value.style.opacity = '0'; surface.value.style.visibility = 'hidden'
    surface.value.style.pointerEvents = 'none'
  }
  visible.value = false; emit('done', reason)
}
function completeWhenReady() {
  if (settled || hold || !props.ready || props.failed || percentage.value < 100) return
  phase.value = 'complete'
  hold = gsap.delayedCall(motion.completionHold, () => finish('complete'))
  if (props.paused) hold.pause()
}
function updateProgress() {
  if (!started || settled) return
  if (props.reduced) bar.jump(percentage.value)
  else tween(bar, percentage.value, motion.progressDuration)
  completeWhenReady()
}
function enterWord() {
  opacity.jump(0); y.jump(motion.wordOffset)
  tween(opacity, 1, motion.wordDuration); tween(y, 0, motion.wordDuration)
}
function changeWord() {
  nextWord = (nextWord + 1) % motion.words.length
  // AnimatePresence mode="wait": finish the old key before mounting the
  // latest pending key. A new key during entry interrupts that entry.
  if (exitingWord) return
  exitingWord = true
  const revision = ++wordRevision
  tween(y, -motion.wordOffset, motion.wordDuration)
  tween(opacity, 0, motion.wordDuration, () => {
    if (settled || revision !== wordRevision) return
    currentWord.value = nextWord; exitingWord = false; enterWord()
  })
}
function begin() {
  if (started || settled) return
  started = true
  if (!props.play || !surface.value) { finish(); return }
  const app = document.getElementById('app')
  appWasInert = app?.inert ?? false
  if (app) app.inert = true
  document.documentElement.classList.add('ftd-is-loading')
  if (props.reduced) { opacity.jump(1); y.jump(0) }
  else { enterWord(); every(motion.wordIntervalMs, changeWord) }
  updateProgress()
}
watch(percentage, updateProgress, { flush: 'sync' })
watch(() => props.ready, completeWhenReady, { flush: 'sync' })
watch(() => props.play, play => { if (!play) finish() }, { flush: 'sync' })
watch(() => props.reduced, reduced => {
  if (!reduced || settled) return
  clocks.forEach(clock => { clock.active = false; if (clock.id !== undefined) clearTimeout(clock.id) })
  wordRevision++; currentWord.value = 0; opacity.jump(1); y.jump(0); bar.jump(percentage.value)
}, { flush: 'sync' })
watch(() => props.paused, paused => {
  if (settled) return
  for (const clock of clocks) {
    if (paused && clock.id !== undefined) {
      clock.remaining = Math.max(0, clock.due - performance.now()); clearTimeout(clock.id); clock.id = undefined
    } else if (!paused) schedule(clock)
  }
  values.forEach(value => paused ? value.animation?.pause() : value.animation?.play())
  if (paused) hold?.pause(); else hold?.resume()
}, { flush: 'sync' })
onMounted(begin)
onBeforeUnmount(() => {
  settled = true; clearMotion(); subscriptions.forEach(unsubscribe => unsubscribe()); values.forEach(value => value.destroy())
  const app = document.getElementById('app')
  if (app) app.inert = appWasInert
  document.documentElement.classList.remove('ftd-is-loading')
})
function retry() { location.reload() }
defineExpose({ finish })
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" ref="surface" class="ftd-prehero-loader" :class="`loader-${view}`"
      :data-loader-phase="phase" :data-loader-progress="percentage" :data-loader-displayed="displayed"
      :data-loader-ready="ready" :data-loader-failed="failed" :data-loader-stage="stage" :data-loader-word="motion.words[currentWord]">
      <div class="loader-presentation">
        <div class="loader-word-slot" aria-hidden="true">
          <div class="loader-word-motion" :style="{ opacity: wordOpacity, transform: `translateY(${wordY}px)` }">
            <HeroBrand v-if="currentWord === 0" class="loader-brand" :data-intro="undefined" />
            <div v-else class="loader-word">{{ motion.words[currentWord] }}</div>
          </div>
        </div>
        <div class="loader-readiness" role="progressbar" :aria-label="copy.loader.aria" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="percentage" :aria-valuetext="`${copy.loader.readiness} ${percentage}%`">
          <div class="loader-track" aria-hidden="true"><span class="loader-fill" :style="{ width: `${displayed}%` }" /></div>
          <div class="loader-label" aria-hidden="true">{{ copy.loader.label }}</div>
        </div>
        <div v-if="failed" class="loader-recovery" role="alert">
          <p>Some files could not be loaded. Check your connection and try again.</p>
          <button type="button" @click="retry">Try again</button>
          <a href="mailto:ftd.lab.traffic@gmail.com">Contact FTD.LAB</a>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
@font-face { font-family: 'FTD Loader Montserrat'; src: url('../../assets/fonts/portfolio-loader/montserrat-latin-900.woff2') format('woff2'); font-weight: 900; font-style: normal; font-display: swap; }
@font-face { font-family: 'FTD Loader Inter'; src: url('../../assets/fonts/portfolio-loader/inter-latin-400.woff2') format('woff2'); font-weight: 400; font-style: normal; font-display: swap; }
.ftd-prehero-loader { position: fixed; inset: 0; z-index: 100; display: flex; align-items: center; justify-content: center; overflow: hidden; background: #000; color: rgb(255 255 255 / 98%); }
.loader-presentation { text-align: center; max-width: 100vw; }
.loader-word-slot { height: 128px; display: flex; align-items: center; justify-content: center; margin-bottom: 48px; }
.loader-word-motion { display: flex; align-items: center; justify-content: center; }
.loader-word { margin: 0; font-family: 'FTD Loader Montserrat', sans-serif; font-size: 60px; font-weight: 900; line-height: 1.6; letter-spacing: -.05em; }
.loader-brand { position: relative; left: auto; top: auto; width: min(312px, calc(100vw - 32px)); height: auto; aspect-ratio: 240 / 33; --u: 1px; opacity: 1; }
.loader-mobile .loader-brand :deep(.fit-copy) { font-style: italic; font-synthesis: style; }
.loader-readiness { width: 256px; margin-inline: auto; }
.loader-track { height: 4px; background: rgb(255 255 255 / 12%); border-radius: 9999px; overflow: hidden; }
.loader-fill { display: block; height: 100%; width: 0; background: #00dcec; }
.loader-label { margin-top: 16px; font: 400 12px/16px 'FTD Loader Inter', sans-serif; color: rgb(255 255 255 / 40%); }
@media (min-width: 768px) { .loader-word { font-size: 96px; }.loader-brand { width: 499px; } }
.loader-recovery { max-width: min(340px, calc(100vw - 40px)); margin: 24px auto 0; font: 14px/1.5 Arial,sans-serif; color: #c1d6da; }
.loader-recovery button { border: 1px solid #00dcec; border-radius: 24px; background: #00dcec; color: #001015; padding: 10px 20px; font: inherit; cursor: pointer; }
.loader-recovery a { display: block; margin-top: 14px; color: #00dcec; }
.loader-recovery button:focus-visible,.loader-recovery a:focus-visible { outline: 2px solid white; outline-offset: 5px; }
</style>
<style>
html.ftd-is-loading, html.ftd-is-loading body { overflow: hidden; }
</style>
