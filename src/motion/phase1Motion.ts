import gsap from 'gsap'
import { heroMotionConfig, type HeroView } from './heroMotionConfig'
import { createMascotBlink, mascotBlinkTiming } from './mascotBlink'

export interface Phase1Controller {
  reveal(): void
  startIdle(): void
  setPaused(paused: boolean): void
  previewBlink(): boolean
  dispose(): void
}

/** Display-only simulations on the unchanged combined asset. No isolated
 * character, real eye states, capsule mechanism or flame frames are implied. */
export function createPhase1Motion(host: HTMLElement, view: HeroView): Phase1Controller | undefined {
  const c = heroMotionConfig[view]
  const scale = host.clientWidth / c.canvasWidth
  const find = (name: string) => host.querySelector<HTMLElement>(`[data-phase1="${name}"]`)
  const float = find('float')
  if (!float) return
  const masks = [find('eye-mask-left'), find('eye-mask-right')].filter((e): e is HTMLElement => !!e)
  const eyes = [find('eye-glow-left'), find('eye-glow-right')].filter((e): e is HTMLElement => !!e)
  const glows = [find('glow-top'), find('glow-side-left'), find('glow-side-right')].filter((e): e is HTMLElement => !!e)
  const jets = [find('thruster-left'), find('thruster-right')].filter((e): e is HTMLElement => !!e)
  const spill = find('thruster-spill')
  const loops: gsap.core.Animation[] = []
  let paused = true
  let disposed = false
  let revealed = false, idleStarted = false
  function paintEyes(closure: number) {
    masks.forEach(mask => { mask.style.opacity = String(closure) })
    eyes.forEach(eye => {
      eye.style.opacity = String(.3 * closure)
      // The SVG parent already defines each eye's measured slanted axis.
      // An explicit local transform avoids a global SVG-origin conversion.
      if (view === 'mobile') eye.setAttribute('transform', `scale(1 ${1 - .88 * closure})`)
      else gsap.set(eye, { scaleY: 1 - .84 * closure, force3D: false })
    })
  }
  const blinking = createMascotBlink({
    host: float,
    canBlink: () => revealed && masks.length === 2,
    reset: () => paintEyes(0),
    createBlink: () => {
      const closure = { value: 0 }
      return gsap.timeline({ paused: true, onUpdate: () => paintEyes(closure.value) })
        .to(closure, { value: 1, duration: mascotBlinkTiming.close, ease: 'power2.in' })
        .to(closure, { value: 0, duration: mascotBlinkTiming.open, ease: 'power2.out' }, mascotBlinkTiming.close + mascotBlinkTiming.hold)
    },
  })
  function sync() {
    loops.forEach(loop => paused || !idleStarted ? loop.pause() : loop.resume())
    blinking.setPaused(paused || !revealed)
  }

  const context = gsap.context(() => {
    gsap.set(float, { x: 0, y: 0, rotation: 0, force3D: false })
    gsap.set([...masks, ...eyes, ...glows, ...jets, ...(spill ? [spill] : [])], { opacity: 0 })
    const duration = c.float.cycleSeconds
    // A registered mobile arm replaces whole-composite floating so the
    // capsule rim remains completely stationary during and after opening.
    if (float.dataset.mobileRig !== 'true') loops.push(gsap.timeline({ paused: true, repeat: -1, defaults: { ease: c.float.ease, force3D: false } })
      .to(float, { x: c.float.xPx * scale, y: -c.float.yPx * scale, rotation: c.float.rotationDeg, duration: duration / 4 })
      .to(float, { x: -c.float.xPx * scale, y: c.float.yPx * scale, rotation: -c.float.rotationDeg, duration: duration / 2 })
      .to(float, { x: 0, y: 0, rotation: 0, duration: duration / 4 }))
    for (const [i, glow] of glows.entries()) {
      loops.push(gsap.fromTo(glow,
        { opacity: 0, filter: `brightness(1) blur(${.15 * scale}px)` },
        { opacity: c.glow.opacity, filter: `brightness(${c.glow.brightness}) blur(${c.glow.blurPx * scale}px)`, duration: c.glow.cycleSeconds / 2, delay: i * .16, yoyo: true, repeat: -1, paused: true, ease: 'sine.inOut' }))
    }
    if (c.thrusters) {
      const jet = c.thrusters
      for (const [i, element] of jets.entries()) {
        loops.push(gsap.fromTo(element,
          { opacity: 0, scaleY: 1, filter: `brightness(1) blur(${.2 * scale}px)` },
          { opacity: jet.opacity, scaleY: jet.scaleY, filter: `brightness(${jet.brightness}) blur(${jet.blurPx * scale}px)`, duration: jet.cycleSeconds[i] / 2, yoyo: true, repeat: -1, paused: true, ease: 'sine.inOut', force3D: false }))
      }
      if (spill) loops.push(gsap.to(spill, { opacity: jet.spillOpacity, duration: 2.2, yoyo: true, repeat: -1, paused: true, ease: 'sine.inOut' }))
    }
  }, float)

  return {
    reveal() { if (!disposed) { revealed = true; sync() } },
    startIdle() { if (!disposed) { idleStarted = true; revealed = true; sync() } },
    setPaused(value) {
      if (disposed) return
      paused = value
      sync()
    },
    previewBlink() { return blinking.previewBlink() },
    dispose() {
      if (disposed) return
      disposed = true
      blinking.dispose()
      loops.forEach(loop => loop.kill())
      context.revert()
      // Keep the original image and its Vue-authored placement untouched.
      gsap.set(float, { clearProps: 'transform' })
      gsap.set([...masks, ...eyes, ...glows, ...jets, ...(spill ? [spill] : [])], { clearProps: 'opacity,transform,filter' })
      if (view === 'mobile') eyes.forEach(eye => eye.removeAttribute('transform'))
    },
  }
}
