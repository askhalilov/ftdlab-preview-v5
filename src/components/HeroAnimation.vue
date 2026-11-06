<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, provide, ref, watch } from 'vue'
import gsap from 'gsap'
import HeroDesktop from './HeroDesktop.vue'
import HeroMobile from './HeroMobile.vue'
import PreHeroLoader from './PreHeroLoader.vue'
import { reference } from '../assets'
import { copy } from '../i18n'
import { createHeroTimeline, resetHeroTargets, type HeroView } from '../motion/heroTimelines'
import { prepareHeroReadiness } from '../motion/sceneReadiness'
import { createPhase1Motion, type Phase1Controller } from '../motion/phase1Motion'
import { createCapsuleMotion, type CapsuleController } from '../motion/capsuleMotion'
import { createLivingMascotMotion, type LivingMascotController } from '../motion/livingMascotMotion'
import { livingMascotKey, type RigEye } from '../motion/livingMascotContext'
import { capsuleMotionConfig } from '../motion/capsuleMotionConfig'
import { heroMotionConfig } from '../motion/heroMotionConfig'
import { mobileLivingConfig, mobileMotionKey } from '../motion/mobileLivingConfig'
import { createMobileLivingMotion, type MobileLivingController } from '../motion/mobileLivingMotion'
import { usesNativeScroll } from '../mobileScroll'

const props = withDefaults(defineProps<{
  view: HeroView; reduced: boolean; paused: boolean; referenceOpacity: number; menuOpen: boolean
  affiliateHref?: string; advertiserHref?: string; livingRig?: boolean
  limbAmplitude?: number; rigEye?: RigEye; rigJets?: boolean; rigPose?: number
}>(), { affiliateHref: '', advertiserHref: '', livingRig: true, limbAmplitude: .7, rigEye: 'open', rigJets: true })
const emit = defineEmits<{
  cta: [audience: 'affiliate' | 'advertiser']; menu: [event: MouseEvent]
  state: [value: string]; capsuleProgress: [percent: number]
}>()
const host = ref<HTMLElement>()
const failed = ref(false)
const rigReady = ref(false)
const rigFailed = ref(false)
const mobileFailed = ref(false)
const mobileEnabled = computed(() => mobileLivingConfig.enabled && props.view === 'mobile' && !mobileFailed.value)
provide(mobileMotionKey, mobileEnabled)
const activeLiving = computed(() => props.livingRig && props.view === 'desktop' && rigReady.value && !rigFailed.value)
provide(livingMascotKey, computed(() => ({
  enabled: props.livingRig && props.view === 'desktop', ready: rigReady.value,
  preload: props.livingRig && props.view === 'desktop' && !rigFailed.value,
  amplitude: props.limbAmplitude, eye: props.rigEye, jets: props.rigJets,
})))
const preparingIntro = ref(!props.reduced)
const loader = ref<InstanceType<typeof PreHeroLoader>>()
const loaderPlaying = ref(true)
const backgroundPaused = ref(document.hidden)
const loaderPaused = computed(() => props.paused || backgroundPaused.value)
const readinessState = ref<'loading' | 'ready' | 'failed'>('loading')
const readinessProgress = ref(0)
const readinessStage = ref('Preparing application')
const readyCount = ref(0)
const requiredCount = ref(0)
const failedCount = ref(0)
const loaderReason = ref('not-requested')
const motionState = ref(props.reduced ? 'Static' : 'Loading artwork')
const phase1State = ref<'off' | 'idle' | 'paused'>('off')
const component = computed(() => props.view === 'desktop' ? HeroDesktop : HeroMobile)
let context: gsap.Context | undefined
let timeline: gsap.core.Timeline | undefined
let decodeController: AbortController | undefined
let revision = 0
let mounted = false
let loaderPending = false
let startupComplete = false
let loaderRevision = 0
let pendingIntro: { version: number; element: HTMLElement; view: HeroView } | undefined
let phase1: Phase1Controller | undefined
let decodedScene: HTMLImageElement | undefined
let capsule: CapsuleController | undefined
let living: LivingMascotController | undefined
let mobile: MobileLivingController | undefined
let viewportObserver: IntersectionObserver | undefined
let heroVisible = true
let viewportWidth = innerWidth
const requestedProgress = new URLSearchParams(location.search).get('capsuleProgress')
let manualProgress: number | undefined = requestedProgress !== null && Number.isFinite(Number(requestedProgress)) ? Math.min(100, Math.max(0, Number(requestedProgress))) : undefined

function report(value: string) { motionState.value = value; emit('state', value) }
function ensureCapsule() {
  if (props.view === 'desktop' && host.value && !capsule) capsule = createCapsuleMotion(host.value, value => emit('capsuleProgress', value))
  return capsule
}
function ensureMobile() {
  if (mobileEnabled.value && host.value && !mobile) mobile = createMobileLivingMotion(host.value, value => emit('capsuleProgress', value))
  return mobile
}
function ensureLiving() {
  if (!living && activeLiving.value && host.value) {
    living = createLivingMascotMotion(host.value, { amplitude: props.limbAmplitude })
    living?.setPose(props.rigPose)
  }
  return living
}
function motionPaused() { return props.paused || document.hidden || !heroVisible }
function blinkPaused() {
  return motionPaused() || props.reduced || props.menuOpen
    || !!host.value?.matches(':focus-within') || manualProgress !== undefined
}
function mascotRevealed() {
  if (!mounted || props.reduced || failed.value || loaderPending || !host.value) return
  if (props.view === 'desktop') {
    capsule?.startIdle(!activeLiving.value)
    capsule?.setPaused(blinkPaused())
    ensureLiving()?.setPaused(blinkPaused())
    if (activeLiving.value) ensureLiving()?.startBlink(blinkPaused())
    else capsule?.startBlink(blinkPaused())
  } else {
    phase1 ??= createPhase1Motion(host.value, 'mobile')
    phase1?.reveal(); phase1?.setPaused(blinkPaused())
    ensureMobile()?.startIdle(); mobile?.setPaused(blinkPaused())
  }
}
function destroy() {
  mobile?.dispose(); mobile = undefined
  living?.dispose(); living = undefined
  capsule?.dispose(); capsule = undefined
  phase1?.dispose(); phase1 = undefined
  phase1State.value = 'off'
  timeline?.kill(); context?.revert(); context = undefined; timeline = undefined
}
function finishPresentation() {
  // Clear the parent gate before the synchronous child callback, so dismissal
  // cannot recursively complete/restart an intro.
  loaderPending = false
  loaderPlaying.value = false
  loader.value?.finish()
}
function cancelPreparation() {
  ++revision
  decodeController?.abort(); decodeController = undefined
  pendingIntro = undefined
  finishPresentation()
}
function startPhase1() {
  const element = host.value
  const image = element?.querySelector<HTMLImageElement>('img.approved-scene')
  if (!mounted || !element || props.reduced || failed.value || preparingIntro.value || loaderPending || props.menuOpen || element.matches(':focus-within') || manualProgress !== undefined) return
  if (readinessState.value !== 'ready' || !image || image !== decodedScene || !image.isConnected || timeline && timeline.progress() < 1) return
  if (props.view === 'desktop') {
    const controller = ensureCapsule()
    if (!controller) return
    if (activeLiving.value && props.rigPose !== undefined) { ensureLiving(); return }
    controller.startIdle(!activeLiving.value)
    mascotRevealed()
    const paused = motionPaused()
    controller.setPaused(paused); ensureLiving()?.setPaused(paused)
    phase1State.value = paused ? 'paused' : 'idle'
    return
  }
  phase1 ??= createPhase1Motion(element, props.view)
  if (!phase1) return
  const paused = motionPaused()
  phase1.startIdle()
  phase1.setPaused(paused); phase1State.value = paused ? 'paused' : 'idle'
  ensureMobile()?.startIdle(); mobile?.setPaused(paused)
}
function finalState(resumeIdle = true) {
  if (loaderPending && readinessState.value !== 'ready') return
  // Motion shortcuts may finish an entrance only after resource readiness.
  pendingIntro = undefined
  finishPresentation()
  destroy()
  if (host.value) resetHeroTargets(host.value)
  ensureCapsule()?.finishOpen()
  ensureMobile()?.finishOpen()
  if (manualProgress !== undefined) capsule?.setProgress(manualProgress / 100)
  if (manualProgress !== undefined) mobile?.setProgress(manualProgress / 100)
  if (activeLiving.value) ensureLiving()
  preparingIntro.value = false
  report(failed.value ? 'Scene unavailable' : props.reduced ? 'Static' : 'Ready')
  if (resumeIdle) void nextTick(() => { if (mounted) startPhase1() })
}
function resizeFinal() {
  if (usesNativeScroll() && viewportWidth === innerWidth) return
  viewportWidth = innerWidth
  if (loaderPending) return
  loaderReason.value = 'resize'; finalState()
}
function visibility() {
  backgroundPaused.value = document.hidden
  if (loaderPending) {
    report(loaderPaused.value ? document.hidden ? 'Paused in background' : 'Paused' : 'Loading experience')
    return
  }
  const paused = motionPaused()
  if (phase1) { phase1.setPaused(paused); phase1State.value = paused ? 'paused' : 'idle' }
  capsule?.setPaused(paused)
  mobile?.setPaused(blinkPaused())
  living?.setPaused(blinkPaused() || !!timeline && timeline.progress() < 1)
  living?.setBlinkPaused(blinkPaused())
  capsule?.setBlinkPaused(blinkPaused())
  if (phase1State.value !== 'off') { phase1State.value = paused ? 'paused' : 'idle'; report(paused ? document.hidden ? 'Paused in background' : 'Paused' : 'Ready') }
  if (!timeline || timeline.progress() === 1) return
  if (paused) { timeline.pause(); report(document.hidden ? 'Paused in background' : 'Paused') }
  else { timeline.resume(); report(props.view === 'desktop' ? 'Intro · diagonal opening' : 'Intro · temporary reveal') }
}
function startPreparedIntro() {
  const prepared = pendingIntro
  if (!mounted || !prepared || prepared.version !== revision || readinessState.value !== 'ready' || loaderPending) return
  if (props.reduced || failed.value) { finalState(); return }
  pendingIntro = undefined
  const element = prepared.element
  const desktopCapsule = ensureCapsule()
  const mobileCapsule = ensureMobile()
  context = gsap.context(() => {
    timeline = createHeroTimeline(element, prepared.view, () => { resetHeroTargets(element); report('Ready'); startPhase1() })
    desktopCapsule?.attachIntro(timeline)
    mobileCapsule?.attachIntro(timeline)
    const revealAt = prepared.view === 'desktop'
      ? capsuleMotionConfig.intro.openingAt + capsuleMotionConfig.intro.openingDuration
      : mobileCapsule ? mobileLivingConfig.intro.openingAt + mobileLivingConfig.intro.duration
      : heroMotionConfig.mobile.intro.sceneAt + heroMotionConfig.mobile.intro.sceneDuration
    timeline.call(mascotRevealed, [], revealAt)
    preparingIntro.value = false
    if (motionPaused()) { timeline.pause(0); report(document.hidden ? 'Paused in background' : 'Paused') }
    else { report(desktopCapsule || mobileCapsule ? 'Intro · diagonal opening' : 'Intro · temporary reveal'); timeline.play(0) }
  }, element)
}
function loaderDone(reason: 'complete' | 'cancelled') {
  if (!mounted || !loaderPending || loaderRevision !== revision) return
  if (readinessState.value !== 'ready') return
  startupComplete = true
  loaderPending = false; loaderPlaying.value = false
  loaderReason.value = reason
  if (reason === 'complete' && pendingIntro) startPreparedIntro()
  else finalState(false)
}
async function prepare(animate: boolean) {
  cancelPreparation(); destroy()
  const version = revision
  readinessState.value = 'loading'; readinessStage.value = 'Preparing application'; readinessProgress.value = 0
  readyCount.value = 0; requiredCount.value = 0; failedCount.value = 0
  const canIntro = animate && !props.reduced && manualProgress === undefined
  preparingIntro.value = canIntro
  loaderRevision = version
  // Every document load verifies resources, including repeat visits and reduced motion.
  loaderPending = !startupComplete
  loaderPlaying.value = loaderPending
  loaderReason.value = loaderPending ? 'first-visit' : 'not-requested'
  await nextTick()
  if (!mounted || version !== revision || !host.value) return
  const element = host.value
  const desktopCapsule = ensureCapsule()
  const mobileCapsule = ensureMobile()
  if (canIntro) desktopCapsule?.setProgress(0)
  else { desktopCapsule?.finishOpen(); if (manualProgress !== undefined) desktopCapsule?.setProgress(manualProgress / 100) }
  if (canIntro) mobileCapsule?.setProgress(0)
  else { mobileCapsule?.finishOpen(); if (manualProgress !== undefined) mobileCapsule?.setProgress(manualProgress / 100) }
  if (canIntro) pendingIntro = { version, element, view: props.view }
  report(loaderPending ? loaderPaused.value ? 'Paused' : 'Loading experience' : canIntro ? 'Loading artwork' : props.reduced ? 'Static' : 'Ready')
  const controller = new AbortController(); decodeController = controller
  const readiness = await prepareHeroReadiness(element, controller.signal, value => {
    if (!mounted || version !== revision) return
    readinessProgress.value = value.progress; readinessStage.value = value.stage
    readyCount.value = value.readyCount; requiredCount.value = value.requiredCount
    failedCount.value = value.failedCount
  })
  if (!mounted || version !== revision || readiness.status === 'aborted') return
  decodeController = undefined
  if (readiness.status === 'failed') {
    readinessState.value = 'failed'
    loaderReason.value = 'asset-failed'
    loaderPending = true; loaderPlaying.value = true
    console.warn('FTD.LAB assets unavailable:', readiness.failedAssets)
    return
  }
  decodedScene = element.querySelector<HTMLImageElement>('img.approved-scene') ?? undefined
  if (props.livingRig && props.view === 'desktop' && !rigFailed.value) {
    rigReady.value = true
    await nextTick()
    if (!mounted || version !== revision) return
  }
  readinessState.value = 'ready'
  if (pendingIntro) {
    if (loaderPending) report(loaderPaused.value ? 'Paused' : 'Loading experience')
    else startPreparedIntro()
  } else if (!loaderPending) finalState()
}
async function useRigFallback() {
  if (!mounted || rigFailed.value) return
  rigFailed.value = true; rigReady.value = false; decodedScene = undefined
  readinessState.value = 'failed'; loaderReason.value = 'rig-fallback'
  finalState(false)
  await nextTick()
  if (mounted) void prepare(false)
}
function replay() {
  if (!mounted) return
  manualProgress = undefined
  if (props.reduced || failed.value) finalState()
  else void prepare(true)
}
function imageFailed(event: Event) {
  if (!(event.target instanceof HTMLImageElement) || !event.target.closest('.composition')) return
  if (!startupComplete) return // Startup errors stay behind the retryable readiness gate.
  const image = event.target
  if (image.classList.contains('mobile-motion-source')) { void useMobileFallback(); return }
  if (image.classList.contains('phase4-source')) { void useRigFallback(); return }
  if (image.classList.contains('approved-scene')) { failed.value = true; decodedScene = undefined }
  readinessState.value = 'failed'; loaderReason.value = 'asset-failed'
  finalState(false)
}
async function useMobileFallback() {
  if (!mounted || mobileFailed.value) return
  mobileFailed.value = true
  finalState(false)
  await nextTick()
  if (mounted) void prepare(false)
}
function keyboardBypass(event: KeyboardEvent) {
  if (readinessState.value !== 'ready') return
  if (!loaderPending || !['Tab', 'Escape'].includes(event.key)) return
  if (event.key !== 'Tab' && (event.target as Element)?.closest?.('.loader-control')) return
  loaderReason.value = 'keyboard'; finalState()
}
function focusRevealsContent() {
  if (preparingIntro.value || loaderPending || phase1 || capsule || timeline && timeline.progress() < 1) { loaderReason.value = 'focus'; finalState(false) }
}
async function focusOutResumesIdle() { await nextTick(); if (mounted) startPhase1() }
function previewBlink() { return activeLiving.value ? living?.previewBlink() ?? false : props.view === 'desktop' ? capsule?.previewBlink() ?? false : phase1?.previewBlink() ?? false }
function setCapsuleProgress(percent: number) {
  if (!mounted) return false
  manualProgress = Math.min(100, Math.max(0, percent)); loaderReason.value = 'review-scrub'; finalState(false); return true
}
async function refreshSources() {
  cancelPreparation(); destroy(); decodedScene = undefined
  rigReady.value = false; rigFailed.value = false; failed.value = false
  preparingIntro.value = false
  await nextTick()
  if (mounted) void prepare(false)
}
watch(() => props.view, () => { if (mounted) void refreshSources() })
watch(() => props.livingRig, () => { if (mounted) void refreshSources() })
watch(() => props.limbAmplitude, value => living?.setAmplitude(value))
watch(() => props.rigPose, () => { if (mounted && props.livingRig) finalState() })
watch(() => props.reduced, () => { if (mounted) { loaderReason.value = 'reduced-motion'; finalState() } }, { flush: 'sync' })
watch(() => props.paused, visibility)
watch(() => props.menuOpen, open => { if (!mounted) return; if (open) finalState(false); else void nextTick(() => { if (mounted) startPhase1() }) })
onMounted(() => {
  mounted = true
  document.addEventListener('visibilitychange', visibility)
  document.addEventListener('keydown', keyboardBypass, true)
  window.addEventListener('resize', resizeFinal, { passive: true })
  if (host.value) {
    viewportObserver = new IntersectionObserver(entries => {
      heroVisible = !!entries[0]?.isIntersecting
      visibility()
    })
    viewportObserver.observe(host.value)
  }
  void prepare(!props.reduced)
})
onBeforeUnmount(() => {
  mounted = false; cancelPreparation(); destroy()
  document.removeEventListener('visibilitychange', visibility)
  document.removeEventListener('keydown', keyboardBypass, true)
  window.removeEventListener('resize', resizeFinal)
  viewportObserver?.disconnect()
})
defineExpose({ replay, finish: finalState, previewBlink, setCapsuleProgress })
</script>

<template>
  <div
    ref="host"
    class="animation-host"
    :class="{ 'intro-pending': preparingIntro, 'has-scene-error': failed }"
    data-animation-status="temporary-reveal"
    :data-motion-state="motionState"
    :data-phase1-state="phase1State"
    :data-capsule-status="view === 'desktop' ? 'diagonal-source-composite' : mobileEnabled ? 'registered-mobile-v2' : 'approved-mobile-fallback'"
    :data-living-status="!livingRig || view !== 'desktop' ? 'disabled' : rigFailed ? 'fallback' : rigReady ? 'ready' : 'loading'"
    :data-readiness-state="readinessState"
    :data-readiness-stage="readinessStage"
    :data-readiness-progress="readinessProgress"
    :data-critical-ready-count="readyCount"
    :data-critical-required-count="requiredCount"
    :data-loader-reason="loaderReason"
    @error.capture="imageFailed"
    @focusin="focusRevealsContent"
    @focusout="focusOutResumesIdle"
  >
    <component
      :is="component"
      :key="view"
      :menu-open="menuOpen"
      :affiliate-href="affiliateHref"
      :advertiser-href="advertiserHref"
      @cta="emit('cta', $event)"
      @menu="emit('menu', $event)"
    />
    <PreHeroLoader v-if="loaderPlaying" :key="loaderRevision" ref="loader" :play="loaderPlaying" :reduced="reduced" :paused="loaderPaused" :progress="readinessProgress" :ready="readinessState === 'ready'" :failed="failedCount > 0" :stage="readinessStage" :view="view" @done="loaderDone" />
    <div v-if="failed" :class="['scene-placeholder', `scene-placeholder-${view}`]" role="img" :aria-label="copy.hero.unavailable">
      <span>{{ copy.hero.unavailable }}</span>
    </div>
    <img v-if="referenceOpacity > 0" class="reference-overlay" :src="reference(view)" :style="{ opacity: referenceOpacity }" alt="" aria-hidden="true" />
  </div>
</template>

<style scoped>
/* The first rendered frame already has the intro state, avoiding a flash of
   final content while the scene bitmap decodes. Focus restores it immediately. */
.intro-pending :deep(.composition [data-intro]) { opacity: 0; }
.has-scene-error :deep(.approved-scene) { visibility: hidden; }
.has-scene-error :deep(.phase1-scene) { visibility: hidden; }
.has-scene-error :deep([data-capsule-scene]) { visibility: hidden; }
.scene-placeholder { position: absolute; z-index: 1; display: grid; place-items: center; padding: 12px; background: linear-gradient(160deg, #07181d, #02090c); color: #85acb3; font: 12px/1.5 Arial, sans-serif; text-align: center; pointer-events: none; }
.scene-placeholder-desktop { left: 53.23%; top: 4.25%; width: 23.33%; height: 89.27%; }
.scene-placeholder-mobile { left: 21.25%; top: 6.46%; width: 66.95%; height: 47.25%; }
</style>
