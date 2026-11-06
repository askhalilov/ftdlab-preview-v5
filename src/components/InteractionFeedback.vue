<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { interactionConfig as config } from '../motion/interactionConfig'
import { createPortfolioCursorMotion } from '../motion/portfolioCursorMotion'

const props = withDefaults(defineProps<{ paused?: boolean }>(), { paused: false })
const surface = ref<HTMLElement>()
const dot = ref<HTMLElement>()
const ring = ref<HTMLElement>()

const interactiveSelector = 'a[href],button,[role="button"],[role="link"],summary,[tabindex]:not([tabindex="-1"]),[data-cursor-interactive]'
const nativeSelector = 'input,textarea,select,option,[contenteditable]:not([contenteditable="false"]),[data-native-cursor],iframe,video[controls],audio[controls]'
const textSelector = 'p,h1,h2,h3,h4,h5,h6,blockquote,label,li,dt,dd,figcaption'
const brightControlSelector = '.cta-primary,.dialog-close,.s05__cta,.s05__card[data-revealed="true"],.s07__contact-link--telegram,.site-nav__language button[aria-pressed="true"]'
const navigationKeys = new Set(['Tab', 'Escape', 'Enter', ' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'])

let capability: MediaQueryList | undefined
let motion: MediaQueryList | undefined
let observer: MutationObserver | undefined
let mounted = false
let visible = false
let lastHideReason = 'initial'
let loaderVisible = false
let mouseDown = false
let selecting = false
let keyboardActive = false
let pointer = 'none'
let cursorMotion: ReturnType<typeof createPortfolioCursorMotion> | undefined
let touch: { element: HTMLElement; id: number; x: number; y: number; started: number; original: string | null } | undefined
let touchTimer: ReturnType<typeof setTimeout> | undefined

function attribute(name: string, value: string) {
  surface.value?.setAttribute(`data-cursor-${name}`, value)
}

function syncNativeCursor() {
  document.documentElement.classList.toggle('ftd-cursor-ready', Boolean(cursorMotion && capability?.matches && !motion?.matches))
}

function hide(reason: string) {
  visible = false
  lastHideReason = reason
  document.documentElement.classList.remove('ftd-cursor-active')
  if (surface.value) surface.value.hidden = true
  attribute('state', 'hidden')
  attribute('reason', reason)
  cursorMotion?.stop()
}

function clearTouch() {
  if (touchTimer) clearTimeout(touchTimer)
  touchTimer = undefined
  if (touch) {
    if (touch.original === null) touch.element.removeAttribute('data-ftd-touch')
    else touch.element.setAttribute('data-ftd-touch', touch.original)
  }
  touch = undefined
}

function hasOpenModal() {
  // A body overlay cannot paint above a native top-layer dialog/popover.
  if (document.querySelector('dialog[open]')) return true
  try { return Boolean(document.querySelector('[popover]:popover-open')) } catch { return false }
}

function unavailableReason() {
  if (loaderVisible) return 'loader'
  if (props.paused) return 'paused'
  if (motion?.matches) return 'reduced-motion'
  if (!capability?.matches) return 'pointer-capability'
  if (document.hidden) return 'hidden'
  if (document.fullscreenElement) return 'fullscreen'
  if (hasOpenModal()) return 'dialog'
  return ''
}

function elementTarget(target: EventTarget | null) {
  return target instanceof Element ? target : undefined
}

function disabled(element: Element | undefined) {
  return Boolean(element?.closest(':disabled,[aria-disabled="true"],[inert]'))
}

function interactive(target: Element | undefined) {
  const control = target?.closest<HTMLElement>(interactiveSelector)
  return control && !disabled(control) && !control.closest(nativeSelector) ? control : undefined
}

function needsNative(target: Element | undefined) {
  if (!target || disabled(target) || target.closest(nativeSelector)) return true
  if (interactive(target)) return false
  if (target.closest(textSelector) && !target.closest('.site-nav__mobile-step')) return true
  const cursor = getComputedStyle(target).cursor
  return cursor === 'text' || cursor === 'vertical-text' || cursor === 'grab' || cursor === 'grabbing'
    || cursor.endsWith('-resize') || cursor === 'wait' || cursor === 'progress' || cursor === 'crosshair'
}

function show(event: PointerEvent) {
  const reason = unavailableReason()
  if (reason) { hide(reason); return }
  if (event.clientX < 0 || event.clientY < 0 || event.clientX >= innerWidth || event.clientY >= innerHeight) { hide('viewport'); return }
  if (selecting) { hide('selection'); return }
  const target = elementTarget(event.target)
  if (needsNative(target)) { hide('native'); return }
  if (!cursorMotion) { hide('initialization-failed'); return }
  const hovering = Boolean(interactive(target) || target?.closest('.s05__card'))
  const overConnectNav = target?.closest('.site-nav[data-current-section="section-04"]')
  attribute('theme', target?.closest('.s04') || overConnectNav || target?.closest(brightControlSelector) ? 'bright' : 'dark')
  const initial = visible ? undefined : ['initial', 'viewport', 'loader'].includes(lastHideReason) ? 'origin' : 'snap'
  try { cursorMotion.update(event.clientX, event.clientY, hovering, initial) }
  catch { cursorMotion.stop(); cursorMotion = undefined; hide('initialization-failed'); syncNativeCursor(); return }
  visible = true
  if (surface.value) surface.value.hidden = false
  document.documentElement.classList.add('ftd-cursor-active')
  attribute('state', hovering ? 'hover' : 'default')
  attribute('reason', '')
}

function pointerKind(event: PointerEvent) {
  pointer = event.pointerType || 'mouse'
  attribute('pointer', pointer)
  if (pointer !== 'mouse') hide(pointer === 'touch' ? 'touch' : 'pen')
  return pointer
}

function onMove(event: PointerEvent) {
  if (pointerKind(event) !== 'mouse') {
    if (touch && touch.id === event.pointerId && Math.hypot(event.clientX - touch.x, event.clientY - touch.y) > config.touchMoveTolerance) clearTouch()
    return
  }
  keyboardActive = false
  if (!event.buttons) { mouseDown = false; selecting = false }
  show(event)
}

function onOver(event: PointerEvent) {
  // Hover state updates immediately when moving between nested controls.
  if (pointerKind(event) === 'mouse' && visible && !selecting && !keyboardActive) show(event)
}

function onDown(event: PointerEvent) {
  if (pointerKind(event) === 'mouse') {
    keyboardActive = false
    mouseDown = event.button === 0
    if (visible) show(event)
    return
  }
  clearTouch()
  if (!event.isPrimary || loaderVisible || props.paused || document.hidden) return
  const element = interactive(elementTarget(event.target))
  if (!element) return
  touch = { element, id: event.pointerId, x: event.clientX, y: event.clientY, started: performance.now(), original: element.getAttribute('data-ftd-touch') }
  element.setAttribute('data-ftd-touch', 'pressed')
  touchTimer = setTimeout(clearTouch, config.touchSafetyMs)
}

function onUp(event: PointerEvent) {
  if (pointerKind(event) === 'mouse') {
    const wasSelecting = selecting
    mouseDown = false
    selecting = false
    if (!wasSelecting && visible) show(event)
    return
  }
  if (touch?.id !== event.pointerId) return
  if (touchTimer) clearTimeout(touchTimer)
  touchTimer = setTimeout(clearTouch, Math.max(0, config.touchMinimumMs - (performance.now() - touch.started)))
}

function onCancel() { mouseDown = false; selecting = false; clearTouch(); hide('cancelled') }
function onExit(event: PointerEvent) { if (!event.relatedTarget) { mouseDown = false; selecting = false; hide('viewport') } }
function onBlur() { mouseDown = false; selecting = false; clearTouch(); hide('blur') }
function onVisibility() { if (document.hidden) { clearTouch(); hide('hidden') } }
function onResize() { clearTouch(); hide('resize') }
function onFullscreen() { clearTouch(); hide('fullscreen') }
function onCapabilityChange() { clearTouch(); hide(unavailableReason() || 'pointer-change'); syncNativeCursor() }
function onKeyboard(event: KeyboardEvent) { if (navigationKeys.has(event.key) || event.key.length === 1) { keyboardActive = true; clearTouch(); hide('keyboard') } }
function onContextMenu() { mouseDown = false; selecting = false; clearTouch(); hide('native') }
function onSelectStart() { if (mouseDown) { selecting = true; hide('selection') } }
function onFocus(event: FocusEvent) { if (needsNative(elementTarget(event.target))) hide('native') }
function onTopLayer(event: Event) {
  const target = elementTarget(event.target)
  if (target?.matches('dialog,[popover]')) hide('dialog')
}
function observeLoader() {
  loaderVisible = Boolean(document.querySelector('.ftd-prehero-loader'))
  if (loaderVisible) { clearTouch(); hide('loader') }
}

watch(() => props.paused, (paused) => { if (mounted && paused) { clearTouch(); hide('paused') } })

onMounted(() => {
  mounted = true
  try { if (dot.value && ring.value) cursorMotion = createPortfolioCursorMotion(dot.value, ring.value, active => attribute('loop', active ? 'running' : 'idle')) }
  catch { hide('initialization-failed') }
  capability = matchMedia('(pointer: fine) and (hover: hover)')
  motion = matchMedia('(prefers-reduced-motion: reduce)')
  syncNativeCursor()
  capability.addEventListener('change', onCapabilityChange)
  motion.addEventListener('change', onCapabilityChange)
  observeLoader()
  // The loader teleports directly to body. Avoid observing mascot/style changes.
  observer = new MutationObserver(observeLoader)
  observer.observe(document.body, { childList: true })
  document.addEventListener('pointermove', onMove, { passive: true })
  document.addEventListener('pointerover', onOver, { passive: true })
  document.addEventListener('pointerdown', onDown, { passive: true })
  document.addEventListener('pointerup', onUp, { passive: true })
  document.addEventListener('pointercancel', onCancel, { passive: true })
  document.addEventListener('pointerout', onExit, { passive: true })
  document.addEventListener('keydown', onKeyboard)
  document.addEventListener('contextmenu', onContextMenu)
  document.addEventListener('selectstart', onSelectStart)
  document.addEventListener('focusin', onFocus)
  document.addEventListener('beforetoggle', onTopLayer, true)
  document.addEventListener('toggle', onTopLayer, true)
  document.addEventListener('visibilitychange', onVisibility)
  document.addEventListener('fullscreenchange', onFullscreen)
  window.addEventListener('blur', onBlur)
  window.addEventListener('resize', onResize, { passive: true })
  window.addEventListener('scroll', clearTouch, { passive: true })
})

onBeforeUnmount(() => {
  mounted = false
  clearTouch()
  hide('unmounted')
  document.documentElement.classList.remove('ftd-cursor-ready')
  cursorMotion?.destroy()
  cursorMotion = undefined
  observer?.disconnect()
  capability?.removeEventListener('change', onCapabilityChange)
  motion?.removeEventListener('change', onCapabilityChange)
  document.removeEventListener('pointermove', onMove)
  document.removeEventListener('pointerover', onOver)
  document.removeEventListener('pointerdown', onDown)
  document.removeEventListener('pointerup', onUp)
  document.removeEventListener('pointercancel', onCancel)
  document.removeEventListener('pointerout', onExit)
  document.removeEventListener('keydown', onKeyboard)
  document.removeEventListener('contextmenu', onContextMenu)
  document.removeEventListener('selectstart', onSelectStart)
  document.removeEventListener('focusin', onFocus)
  document.removeEventListener('beforetoggle', onTopLayer, true)
  document.removeEventListener('toggle', onTopLayer, true)
  document.removeEventListener('visibilitychange', onVisibility)
  document.removeEventListener('fullscreenchange', onFullscreen)
  window.removeEventListener('blur', onBlur)
  window.removeEventListener('resize', onResize)
  window.removeEventListener('scroll', clearTouch)
})
</script>

<template>
  <Teleport to="body">
    <div ref="surface" class="ftd-interaction-feedback" hidden aria-hidden="true" data-cursor-state="hidden" data-cursor-theme="dark" data-cursor-loop="idle" data-cursor-pointer="none" data-cursor-reason="initial">
      <span ref="ring" class="ftd-tech-crosshair">
        <span class="ftd-tech-crosshair__marks">
          <i class="ftd-tech-crosshair__corner ftd-tech-crosshair__corner--tl" />
          <i class="ftd-tech-crosshair__corner ftd-tech-crosshair__corner--tr" />
          <i class="ftd-tech-crosshair__corner ftd-tech-crosshair__corner--bl" />
          <i class="ftd-tech-crosshair__corner ftd-tech-crosshair__corner--br" />
        </span>
      </span>
      <span ref="dot" class="ftd-tech-crosshair__center">
        <i class="ftd-tech-crosshair__dot" />
      </span>
    </div>
  </Teleport>
</template>

<style>
/* Keep the native arrow hidden from mount to the first pointer movement. */
html.ftd-cursor-ready, html.ftd-cursor-ready * { cursor: none !important; }
html.ftd-cursor-ready :is(input,textarea,[contenteditable]:not([contenteditable="false"]),p,h1,h2,h3,h4,h5,h6,blockquote,label,li,dt,dd,figcaption),
html.ftd-cursor-ready :is([contenteditable]:not([contenteditable="false"]),p,h1,h2,h3,h4,h5,h6,blockquote,label,li,dt,dd,figcaption) * { cursor: text !important; }
html.ftd-cursor-ready :is(select,option,[data-native-cursor],iframe,video[controls],audio[controls]) { cursor: auto !important; }
.ftd-interaction-feedback { display: contents; pointer-events: none; user-select: none; }
.ftd-interaction-feedback[hidden] { display: none !important; }
.ftd-tech-crosshair, .ftd-tech-crosshair__center { position: fixed; left: 0; top: 0; z-index: 9999; color: #00e7ef; pointer-events: none; will-change: transform; transition: color .16s ease; }
.ftd-tech-crosshair { width: 40px; height: 40px; }
.ftd-tech-crosshair__center { width: 12px; height: 12px; }
.ftd-interaction-feedback[data-cursor-theme="bright"] .ftd-tech-crosshair,
.ftd-interaction-feedback[data-cursor-theme="bright"] .ftd-tech-crosshair__center { color: #020609; }
.ftd-tech-crosshair__marks { position: absolute; top: 8px; left: 8px; width: 24px; height: 24px; }
.ftd-tech-crosshair__corner { position: absolute; width: 7px; height: 7px; border-color: currentColor; border-style: solid; border-width: 0; }
.ftd-tech-crosshair__corner--tl { top: 2px; left: 2px; border-top-width: 1px; border-left-width: 1px; }
.ftd-tech-crosshair__corner--tr { top: 2px; right: 2px; border-top-width: 1px; border-right-width: 1px; }
.ftd-tech-crosshair__corner--bl { bottom: 2px; left: 2px; border-bottom-width: 1px; border-left-width: 1px; }
.ftd-tech-crosshair__corner--br { bottom: 2px; right: 2px; border-bottom-width: 1px; border-right-width: 1px; }
.ftd-tech-crosshair__dot { position: absolute; top: 4.5px; left: 4.5px; width: 3px; height: 3px; border-radius: 50%; background: currentColor; }
[data-ftd-touch="pressed"] { filter: brightness(1.1); }
@media (prefers-reduced-motion: reduce) {
  .ftd-interaction-feedback { display: none !important; }
}
@media (hover: none), (pointer: coarse) {
  .ftd-interaction-feedback { display: none !important; }
}
</style>
