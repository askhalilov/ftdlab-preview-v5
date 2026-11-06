import { gsap } from 'gsap'
import { FramePlayer, preloadFrame, preloadSet } from './frame-player'
import {
  openingDuration, validateFrameSet, validateRegisteredFrame,
  type FrameLayer, type RegisteredLayer,
} from './registry'

export interface CommonMotionOptions {
  root: HTMLElement
  logo?: HTMLElement
  headline?: readonly HTMLElement[]
  cta?: readonly HTMLElement[]
  stats?: readonly HTMLElement[]
  mascot: RegisteredLayer
  /** Exactly [open, half-closed, closed], registered on one reviewed canvas. */
  eyes: FrameLayer
  /** Exactly ordered closed -> intermediate(s) -> open, 2..25 frames. */
  opening: FrameLayer
  /** Optional independently reviewed eye illumination overlay. */
  eyeLight?: RegisteredLayer
  autoPlay?: boolean
}

export interface DesktopMotionOptions extends CommonMotionOptions {
  /** Approved separate jet assets, left then right. Never use baked jets twice. */
  jets: readonly [RegisteredLayer, RegisteredLayer]
}

export type MobileMotionOptions = CommonMotionOptions

export interface MotionController {
  pause(): void
  resume(): void
  replay(): void
  dispose(): void
}

function targets(items?: readonly HTMLElement[]): HTMLElement[] { return items ? [...items] : [] }

export async function createMotion(options: CommonMotionOptions, profile: 'desktop' | 'mobile', jets: readonly RegisteredLayer[] = []): Promise<MotionController> {
  if (typeof window === 'undefined' || typeof document === 'undefined') throw new Error('Motion driver requires a mounted browser scene')
  const headline = targets(options.headline)
  const cta = targets(options.cta)
  const stats = targets(options.stats)
  if (headline.length > 4 || cta.length > 2 || stats.length > 3) throw new Error('The fixed 2.6s hero supports at most four headline lines, two CTA controls and three cards')
  const nodes = [options.mascot.element, options.eyes.host, options.opening.host, ...headline, ...cta, ...stats, ...jets.map((jet) => jet.element)]
  if (options.logo) nodes.push(options.logo)
  if (options.eyeLight) nodes.push(options.eyeLight.element)
  if (nodes.some((node) => !options.root.contains(node))) throw new Error('Every registered layer must be inside the scene root')
  if (options.eyes.host === options.opening.host) throw new Error('Eyes and capsule opening require independent layer hosts')
  if (options.eyes.host === options.mascot.element || !options.mascot.element.contains(options.eyes.host)) throw new Error('The blink frame host must be a child of the independent mascot wrapper')
  if (options.mascot.element.contains(options.opening.host)) throw new Error('The capsule opening host must be outside the mascot wrapper so the capsule cannot levitate')
  if (options.eyes.host.childElementCount || options.opening.host.childElementCount) throw new Error('Dedicated animation frame hosts must be empty; keep the static fallback in its own layer')
  validateFrameSet(options.eyes.states, 'blink', 3, 3)
  validateFrameSet(options.opening.states, 'opening', 2, 25)
  openingDuration(options.opening.states.frames.length)
  const staticLayers = [options.mascot, ...jets, ...(options.eyeLight ? [options.eyeLight] : [])]
  staticLayers.forEach((layer, index) => validateRegisteredFrame(layer.frame, layer.canvas, layer.frame.alignmentKey, `layer[${index}]`))
  if (profile === 'desktop' && jets.length !== 2) throw new Error('Desktop requires two independently registered jet layers')

  // No scene mutation happens until every image is loaded, decoded, and measured.
  const [eyesImages, openingImages] = await Promise.all([
    preloadSet(options.eyes, 'blink'), preloadSet(options.opening, 'opening'),
    ...staticLayers.map((layer, index) => preloadFrame(layer.frame, `layer[${index}]`)),
  ])
  const eyes = new FramePlayer(options.eyes, eyesImages)
  const opening = new FramePlayer(options.opening, openingImages)
  const media = window.matchMedia('(prefers-reduced-motion: reduce)')
  let reduced = media.matches
  let disposed = false
  let userPaused = options.autoPlay === false
  let hidden = document.hidden
  let introComplete = false
  let blinkTimer: ReturnType<typeof setTimeout> | undefined
  let blink: gsap.core.Timeline | undefined
  let intro!: gsap.core.Timeline
  let idle!: gsap.core.Timeline
  const canRun = () => !disposed && !userPaused && !hidden && !reduced
  const context = gsap.context(() => {}, options.root)

  function stopBlink(): void {
    if (blinkTimer !== undefined) clearTimeout(blinkTimer)
    blinkTimer = undefined
    blink?.kill()
    blink = undefined
    eyes.show(0)
  }

  function scheduleBlink(): void {
    if (!canRun() || !introComplete || blinkTimer !== undefined || blink) return
    const delay = profile === 'desktop' ? 3800 + Math.random() * 3700 : 4800 + Math.random() * 4100
    blinkTimer = setTimeout(() => {
      blinkTimer = undefined
      if (!canRun() || !introComplete) return
      blink = gsap.timeline({ paused: true, onComplete: () => { blink = undefined; scheduleBlink() } })
      blink.call(() => eyes.show(1), [], 0)
        .call(() => eyes.show(2), [], .045)
        .call(() => eyes.show(1), [], .130)
        .call(() => eyes.show(0), [], .175)
      blink.play(0)
    }, delay)
  }

  function setInitial(): void {
    context.add(() => {
      if (options.logo) gsap.set(options.logo, { autoAlpha: 0, y: -8 })
      if (headline.length) gsap.set(headline, { autoAlpha: 0, y: 16 })
      gsap.set(options.mascot.element, { autoAlpha: 0, y: 0 })
      if (options.eyeLight) gsap.set(options.eyeLight.element, { autoAlpha: 0 })
      if (cta.length) gsap.set(cta, { autoAlpha: 0, y: 8 })
      if (stats.length) gsap.set(stats, { autoAlpha: 0, x: profile === 'desktop' ? 10 : 0, y: profile === 'mobile' ? 6 : 0 })
      jets.forEach((jet) => gsap.set(jet.element, { autoAlpha: 0, scaleY: 1, transformOrigin: '50% 0%' }))
    })
    opening.show(0)
    eyes.show(0)
  }

  function setStaticOpen(): void {
    intro.pause()
    idle.pause(0, true)
    stopBlink()
    introComplete = true
    opening.showOpen()
    eyes.show(0)
    context.add(() => {
      const visible = [...headline, ...cta, ...stats, options.mascot.element, ...jets.map((jet) => jet.element)]
      if (options.logo) visible.push(options.logo)
      if (options.eyeLight) visible.push(options.eyeLight.element)
      gsap.set(visible, { autoAlpha: 1, x: 0, y: 0 })
      if (jets.length) gsap.set(jets.map((jet) => jet.element), { scaleY: 1, opacity: 1 })
    })
    idle.invalidate()
  }

  function synchronize(): void {
    if (disposed) return
    if (reduced) { setStaticOpen(); return }
    if (!canRun()) { intro.pause(); idle.pause(); stopBlink(); return }
    if (!introComplete) intro.resume()
    else { idle.resume(); scheduleBlink() }
  }

  context.add(() => {
    intro = gsap.timeline({ paused: true, onComplete: () => { introComplete = true; synchronize() } })
    idle = gsap.timeline({ paused: true })
    setInitial()
    if (profile === 'desktop') {
      if (options.logo) intro.to(options.logo, { autoAlpha: 1, y: 0, duration: .25, ease: 'power2.out' }, 0)
      if (headline.length) intro.to(headline, { autoAlpha: 1, y: 0, duration: .42, stagger: .12, ease: 'power2.out' }, .16)
      opening.addOpening(intro, .52)
      intro.to(options.mascot.element, { autoAlpha: 1, duration: .26, ease: 'power1.out' }, 1.58)
      if (options.eyeLight) intro.to(options.eyeLight.element, { autoAlpha: 1, duration: .16 }, 1.84)
      if (jets.length) intro.to(jets.map((jet) => jet.element), { autoAlpha: 1, duration: .19 }, 1.84)
      if (cta.length) intro.to(cta, { autoAlpha: 1, y: 0, duration: .3, stagger: .07, ease: 'power2.out' }, 1.98)
      if (stats.length) intro.to(stats, { autoAlpha: 1, x: 0, duration: .28, stagger: .07, ease: 'power2.out' }, 2.04)
      // Four continuous quarter-periods begin/end at baseline, avoiding an idle jump.
      idle.to(options.mascot.element, { keyframes: [
        { y: 3, duration: 1.2, ease: 'sine.out' }, { y: 0, duration: 1.2, ease: 'sine.in' },
        { y: -3, duration: 1.2, ease: 'sine.out' }, { y: 0, duration: 1.2, ease: 'sine.in' },
      ], repeat: -1 }, 0)
      jets.forEach((jet, index) => idle.to(jet.element, { scaleY: .98, opacity: .94, duration: index ? .31 : .27, repeat: -1, yoyo: true, ease: 'sine.inOut' }, 0))
    } else {
      if (options.logo) intro.to(options.logo, { autoAlpha: 1, y: 0, duration: .25, ease: 'power1.out' }, 0)
      opening.addOpening(intro, .32)
      intro.to(options.mascot.element, { autoAlpha: 1, duration: .28, ease: 'power1.out' }, 1.42)
      if (options.eyeLight) intro.to(options.eyeLight.element, { autoAlpha: 1, duration: .15 }, 1.65)
      if (headline.length) intro.to(headline, { autoAlpha: 1, y: 0, duration: .3, stagger: .06, ease: 'power1.out' }, 1.65)
      if (cta.length) intro.to(cta, { autoAlpha: 1, y: 0, duration: .3, stagger: .06, ease: 'power1.out' }, 2.08)
      if (stats.length) intro.to(stats, { autoAlpha: 1, y: 0, duration: .25, stagger: .05, ease: 'power1.out' }, 2.16)
      // Mobile idle deliberately contains no transform, jet, HUD, or parallax loop.
    }
    intro.call(() => {}, [], 2.6)
  })

  const onVisibility = () => { hidden = document.hidden; synchronize() }
  const onMotionPreference = (event: MediaQueryListEvent) => {
    reduced = event.matches
    // Preference changes do not replay the intro or create a sudden closed state.
    if (reduced) setStaticOpen()
    synchronize()
  }
  document.addEventListener('visibilitychange', onVisibility)
  media.addEventListener('change', onMotionPreference)
  synchronize()

  return {
    pause() { if (!disposed) { userPaused = true; synchronize() } },
    resume() { if (!disposed) { userPaused = false; synchronize() } },
    replay() {
      if (disposed) return
      stopBlink()
      intro.pause(0, true)
      idle.pause(0, true)
      introComplete = false
      setInitial()
      idle.invalidate()
      synchronize()
    },
    dispose() {
      if (disposed) return
      disposed = true
      stopBlink()
      intro.kill()
      idle.kill()
      document.removeEventListener('visibilitychange', onVisibility)
      media.removeEventListener('change', onMotionPreference)
      context.revert()
      eyes.dispose()
      opening.dispose()
    },
  }
}
