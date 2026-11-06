import gsap from 'gsap'
import { capsuleMotionConfig as c } from './capsuleMotionConfig'
import { createMascotBlink, mascotBlinkTiming, type MascotBlinkController } from './mascotBlink'

export interface CapsuleController {
  attachIntro(timeline: gsap.core.Timeline): void
  setProgress(progress: number): void
  finishOpen(): void
  startIdle(animateMascot?: boolean): void
  startBlink(paused?: boolean): void
  setBlinkPaused(paused: boolean): void
  setPaused(paused: boolean): void
  previewBlink(): boolean
  dispose(): void
}

/** The frame never moves. Only original-source door pixels and their matching
 * reveal footprints translate. No content fade is used to conceal panel edges. */
export function createCapsuleMotion(host: HTMLElement, onProgress: (percent: number) => void): CapsuleController | undefined {
  const scene = host.querySelector<HTMLElement>('[data-capsule-scene]')
  if (!scene) return
  const find = (name: string) => scene.querySelector<SVGElement>(`[data-capsule="${name}"]`)
  const upper = find('upper'), lower = find('lower')
  const maskUpper = find('mask-upper'), maskLower = find('mask-lower')
  const closed = find('closed'), mechanism = find('mechanism')
  const mascot = find('mascot'), jets = find('jets'), glow = find('glow'), seams = find('seams')
  const eyes = [find('eye-left'), find('eye-right')].filter((e): e is SVGElement => !!e)
  if (!upper || !lower || !maskUpper || !maskLower || !closed || !mechanism || !mascot) return
  let disposed = false, paused = true, idleStarted = false
  let blinkStarted = false, blinkPaused = true
  const loops: gsap.core.Animation[] = []
  const progress = { value: 1 }
  // The configurable whole-body fallback keeps its existing local soft masks.
  // This is a cyan-light dimming simulation, not a newly authored eyelid state.
  let blinking: MascotBlinkController | undefined
  function ensureBlink() {
    // The rig can replace the initial fallback while its sources decode.
    // Create no fallback scheduler/metadata for disconnected fallback eyes.
    if (!blinking && eyes.length && eyes.every(eye => eye.isConnected)) blinking = createMascotBlink({
      host: scene!,
      canBlink: () => progress.value >= 1 && eyes.every(eye => eye.isConnected),
      reset: () => { gsap.set(eyes, { opacity: 0 }) },
      createBlink: () => gsap.timeline({ paused: true })
        .to(eyes, { opacity: c.blink.opacity, duration: mascotBlinkTiming.close, ease: 'power2.in' })
        .to(eyes, { opacity: 0, duration: mascotBlinkTiming.open, ease: 'power2.out' }, mascotBlinkTiming.close + mascotBlinkTiming.hold),
    })
    return blinking
  }

  function setProgress(value: number) {
    if (disposed) return
    progress.value = Math.min(1, Math.max(0, Number.isFinite(value) ? value : 1))
    const p = progress.value
    for (const [elements, travel] of [[[upper, maskUpper, find('shadow-upper')], c.travel.upper], [[lower, maskLower, find('shadow-lower')], c.travel.lower]] as const) {
      elements.forEach(element => element?.setAttribute('transform', `translate(${travel.x * p} ${travel.y * p})`))
    }
    // Exactly 0 uses the unchanged reference itself: it also preserves its
    // original translucent alpha and avoids complementary SVG antialias seams.
    closed!.setAttribute('visibility', p === 0 ? 'visible' : 'hidden')
    mechanism!.setAttribute('visibility', p === 0 ? 'hidden' : 'visible')
    scene!.dataset.capsuleProgress = String(Number((p * 100).toFixed(4)))
    scene!.dataset.capsuleState = p === 0 ? 'closed' : p === 1 ? 'open' : 'opening'
    onProgress(p * 100)
  }
  function previewBlink() {
    return !disposed && blinkStarted ? blinking?.previewBlink() ?? false : false
  }
  function startIdle(animateMascot = true) {
    if (disposed || idleStarted || progress.value < 1) return
    idleStarted = true
    scene!.dataset.capsuleIdle = 'active'
    if (animateMascot) loops.push(gsap.timeline({ paused: true, repeat: -1, defaults: { ease: 'sine.inOut', force3D: false } })
      .to(mascot!, { x: c.idle.x, y: -c.idle.y, rotation: c.idle.rotation, svgOrigin: '623 700', duration: c.idle.cycle / 4 })
      .to(mascot!, { x: -c.idle.x, y: c.idle.y, rotation: -c.idle.rotation, duration: c.idle.cycle / 2 })
      .to(mascot!, { x: 0, y: 0, rotation: 0, duration: c.idle.cycle / 4 }))
    if (glow) loops.push(gsap.fromTo(glow, { opacity: 0 }, { opacity: c.idle.glowOpacity, duration: c.idle.glowCycle / 2, paused: true, repeat: -1, yoyo: true, ease: 'sine.inOut' }))
    if (jets) loops.push(gsap.fromTo(jets, { opacity: 0 }, { opacity: c.idle.jetOpacity, duration: c.idle.jetCycle / 2, paused: true, repeat: -1, yoyo: true, ease: 'sine.inOut' }))
    if (!paused) loops.forEach(loop => loop.resume())
  }
  function finishOpen() {
    setProgress(1)
    gsap.set([seams, jets, glow].filter(Boolean), { opacity: 0 })
  }
  const controller: CapsuleController = {
    attachIntro(timeline) {
      setProgress(0)
      gsap.set([seams, jets, glow].filter(Boolean), { opacity: 0 })
      if (seams) timeline.to(seams, { opacity: .32, duration: .24, ease: 'sine.inOut' }, c.intro.lightAt)
      timeline.to(progress, { value: c.intro.unlockProgress, duration: c.intro.unlockDuration, ease: 'power2.inOut', onUpdate: () => setProgress(progress.value) }, c.intro.unlockAt)
      timeline.to(progress, { value: 1, duration: c.intro.openingDuration, ease: c.intro.openingEase, onUpdate: () => setProgress(progress.value) }, c.intro.openingAt)
      if (seams) timeline.to(seams, { opacity: 0, duration: .35 }, c.intro.openingAt + .2)
      // The supplied mascot already includes jets. This activates only an
      // additive light pass after opening, never claims source flame ignition.
      if (jets) timeline.to(jets, { opacity: .09, duration: c.intro.jetsDuration }, c.intro.jetsAt)
    },
    setProgress,
    finishOpen,
    startIdle,
    startBlink(value = false) {
      if (disposed || blinkStarted || progress.value < 1) return
      if (!ensureBlink()) return
      blinkStarted = true
      blinkPaused = value
      blinking?.setPaused(blinkPaused)
    },
    setBlinkPaused(value) {
      if (disposed) return
      blinkPaused = value
      blinking?.setPaused(!blinkStarted || blinkPaused)
    },
    setPaused(value) {
      if (disposed) return
      paused = value
      blinkPaused = value
      loops.forEach(loop => value ? loop.pause() : loop.resume())
      scene!.dataset.capsuleIdle = idleStarted ? value ? 'paused' : 'active' : 'off'
      blinking?.setPaused(!blinkStarted || blinkPaused)
    },
    previewBlink,
    dispose() {
      if (disposed) return
      blinking?.dispose()
      loops.forEach(loop => loop.kill())
      gsap.set(mascot!, { clearProps: 'transform,transformOrigin' })
      mascot!.removeAttribute('transform')
      gsap.set([jets, glow, seams, ...eyes].filter(Boolean), { clearProps: 'opacity' })
      scene!.dataset.capsuleIdle = 'off'
      disposed = true
    },
  }
  finishOpen()
  return controller
}
