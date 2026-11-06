import gsap from 'gsap'
import { clampLivingAmplitude, clampLivingWave, livingMascotAngles, livingMascotIdleAngles, livingMascotConfig as c, type LivingMascotPart } from './livingMascotConfig'
import { createMascotBlink, mascotBlinkTiming } from './mascotBlink'

export interface LivingMascotController {
  setAmplitude(amplitude: number): void
  setPaused(paused: boolean): void
  /** A signed review pose freezes the sine wave; undefined resumes idle from
   * the same wave value, subject to the parent's pause state. */
  setPose(pose?: number): void
  /** Start the eye clock at the actual full-open cue without starting body idle. */
  startBlink(paused?: boolean): void
  setBlinkPaused(paused: boolean): void
  previewBlink(double?: boolean): boolean
  dispose(): void
}

export interface LivingMascotOptions {
  amplitude?: number
}

/** One scalar loop owns review-only body float, independent joint follow and
 * source-light pulses. The capsule controller skips only its mascot float for
 * this mode; its opening and stationary structure keep their existing owner. */
export function createLivingMascotMotion(host: Element, options: LivingMascotOptions = {}): LivingMascotController | undefined {
  const root = host.matches('[data-living-rig]') ? host : host.querySelector('[data-living-rig]')
  if (!root) return
  const names = Object.keys(c.parts) as LivingMascotPart[]
  const parts = names.map(name => ({ name, node: root.querySelector<SVGGElement>(`g[data-rig-part="${name}"]`) }))
  if (parts.some(part => !part.node)) return
  const joints = parts.map(part => ({ ...part, node: part.node!, originalTransform: part.node!.getAttribute('transform') }))
  const originalWave = root.getAttribute('data-living-wave')
  const originalMotion = root.getAttribute('data-living-motion')
  const blinkLayer = root.querySelector<SVGImageElement>('[data-rig-blink-layer]')
  const originalBlinkOpacity = blinkLayer?.getAttribute('opacity') ?? null
  const originalBlinkStyle = blinkLayer?.getAttribute('style') ?? null
  const float = root.closest<SVGGElement>('[data-capsule="mascot"]')
  const originalFloat = float?.getAttribute('transform') ?? null
  const pulses = Array.from(root.querySelectorAll<SVGGElement>('[data-rig-jet-pulse]')).map(node => ({ node, originalTransform: node.getAttribute('transform'), originalOpacity: node.getAttribute('opacity'), originalStyle: node.getAttribute('style') }))
  const phase = { value: 0 }
  const turn = Math.PI * 2
  let amplitude = clampLivingAmplitude(options.amplitude ?? c.initialAmplitude)
  let paused = true
  let blinkStarted = false
  let blinkPaused = true
  let pose: number | undefined
  let disposed = false
  const blinking = blinkLayer ? createMascotBlink({
    host: root,
    canBlink: () => root.getAttribute('data-rig-eye') === 'open',
    reset: () => { blinkLayer.setAttribute('opacity', '0'); blinkLayer.style.removeProperty('opacity') },
    createBlink: () => gsap.timeline({ paused: true })
      .to(blinkLayer, { opacity: 1, duration: mascotBlinkTiming.close, ease: 'power2.in' })
      .to(blinkLayer, { opacity: 0, duration: mascotBlinkTiming.open, ease: 'power2.out' }, mascotBlinkTiming.close + mascotBlinkTiming.hold),
  }) : undefined

  function number(value: number) {
    // Avoid -0 and machine-precision tails in deterministic review attributes.
    return String(Number(value.toFixed(6)))
  }

  function paint() {
    if (disposed) return
    const wave = pose ?? Math.sin(phase.value)
    const angles = pose === undefined ? livingMascotIdleAngles(phase.value, amplitude) : livingMascotAngles(pose, amplitude)
    joints.forEach(({ name, node }) => {
      const joint = c.parts[name]
      node.setAttribute('transform', `rotate(${number(angles[name])} ${joint.x} ${joint.y})`)
    })
    if (float) {
      const sway = pose ?? (.8 * Math.sin(phase.value) + .2 * Math.sin(phase.value * 2))
      float.setAttribute('transform', `translate(${number(c.float.x * amplitude * sway)} ${number(-c.float.y * amplitude * wave)}) rotate(${number(c.float.tilt * amplitude * sway)} ${c.float.pivotX} ${c.float.pivotY})`)
    }
    pulses.forEach(({ node }, index) => {
      const left = node.dataset.rigJetPulse === 'left'
      const x = left ? 563 : 680, y = left ? 872 : 899
      const pulse = pose === undefined ? (1 - Math.cos(phase.value * (index + 2))) / 2 : Math.abs(pose)
      const length = 1 + c.jets.length * amplitude * pulse
      node.setAttribute('opacity', number(c.jets.opacity * amplitude * pulse))
      node.setAttribute('transform', `translate(${x} ${y}) scale(1 ${number(length)}) translate(${-x} ${-y})`)
      node.style.filter = `blur(${number(c.jets.blur * amplitude * pulse)}px)`
    })
    root!.setAttribute('data-living-wave', number(wave))
  }

  const loop = gsap.to(phase, {
    value: turn,
    duration: c.cycle,
    ease: 'none',
    repeat: -1,
    paused: true,
    onUpdate: paint,
  })

  function sync() {
    if (disposed) return
    const manual = pose !== undefined
    const running = !paused && !manual && amplitude > 0
    if (running) loop.resume(); else loop.pause()
    // Eye life is independent of body amplitude. Deterministic review poses,
    // reduced motion and parent lifecycle pauses keep all eye motion stopped.
    blinking?.setPaused(!blinkStarted || blinkPaused || manual)
    paint()
    root!.setAttribute('data-living-motion', manual ? 'pose' : amplitude === 0 ? 'off' : paused ? 'paused' : 'idle')
  }

  function restore(element: Element, attribute: string, value: string | null) {
    if (value === null) element.removeAttribute(attribute)
    else element.setAttribute(attribute, value)
  }

  sync()
  return {
    setAmplitude(value) {
      if (disposed) return
      amplitude = clampLivingAmplitude(value)
      sync()
    },
    setPaused(value) {
      if (disposed) return
      paused = value
      blinkPaused = value
      sync()
    },
    setPose(value) {
      if (disposed) return
      if (value === undefined) {
        pose = undefined
      } else {
        pose = clampLivingWave(value)
        const radians = Math.asin(pose)
        // Align the existing loop's clock to the manual wave, so clearing the
        // review pose cannot jump back to its earlier pre-scrub limb position.
        loop.pause().time((radians < 0 ? radians + turn : radians) / turn * c.cycle, true)
      }
      sync()
    },
    startBlink(value = false) {
      if (disposed || blinkStarted) return
      blinkStarted = true
      blinkPaused = value
      blinking?.setPaused(blinkPaused || pose !== undefined)
    },
    setBlinkPaused(value) {
      if (disposed) return
      blinkPaused = value
      blinking?.setPaused(!blinkStarted || blinkPaused || pose !== undefined)
    },
    previewBlink(double = false) { return blinking?.previewBlink(double) ?? false },
    dispose() {
      if (disposed) return
      disposed = true
      loop.kill()
      blinking?.dispose()
      if (blinkLayer) {
        restore(blinkLayer, 'opacity', originalBlinkOpacity)
        restore(blinkLayer, 'style', originalBlinkStyle)
      }
      joints.forEach(({ node, originalTransform }) => restore(node, 'transform', originalTransform))
      if (float) restore(float, 'transform', originalFloat)
      pulses.forEach(({ node, originalTransform, originalOpacity, originalStyle }) => {
        restore(node, 'transform', originalTransform)
        restore(node, 'opacity', originalOpacity)
        restore(node, 'style', originalStyle)
      })
      restore(root!, 'data-living-wave', originalWave)
      restore(root!, 'data-living-motion', originalMotion)
    },
  }
}
