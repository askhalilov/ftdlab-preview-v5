import gsap from 'gsap'

/** Display blink timing shared by the separate desktop/mobile renderers.
 * No alternate body, head pose, eyelid source or capsule mechanism is implied. */
export const mascotBlinkTiming = {
  firstMin: .4,
  firstMax: .8,
  intervalMin: 3,
  intervalMax: 5,
  doubleChance: .18,
  doubleGap: .16,
  close: .05,
  hold: .055,
  open: .095,
} as const

export interface MascotBlinkOptions {
  host: Element
  /** Return a fresh, paused, finite single blink ending in the open state.
   * The scheduler adopts the timeline and owns its pause/cleanup thereafter. */
  createBlink(): gsap.core.Timeline
  reset(): void
  canBlink?: () => boolean
  timing?: Partial<Record<keyof typeof mascotBlinkTiming, number>>
  random?: () => number
}

export interface MascotBlinkController {
  setPaused(paused: boolean): void
  previewBlink(double?: boolean): boolean
  dispose(): void
}

export function createMascotBlink(options: MascotBlinkOptions): MascotBlinkController {
  const { host } = options
  const timing = { ...mascotBlinkTiming, ...options.timing }
  const random = options.random ?? Math.random
  const attributes = ['data-blink-state', 'data-blink-count', 'data-blink-sequence', 'data-blink-paused']
  const original = attributes.map(name => [name, host.getAttribute(name)] as const)
  let paused = true
  let disposed = false
  let first = true
  let count = 0
  let wait: gsap.core.Tween | undefined
  let blink: gsap.core.Timeline | undefined

  function schedule(completedDuration = 0) {
    if (disposed || paused || wait || blink) return
    const min = first ? timing.firstMin : timing.intervalMin
    const max = first ? timing.firstMax : timing.intervalMax
    // Subsequent cluster STARTS are 3–5 seconds apart. A double includes its
    // own short gap, so subtract the completed cluster's running duration.
    const delay = Math.max(0, min + Math.min(1, Math.max(0, random())) * (max - min) - completedDuration)
    wait = gsap.delayedCall(delay, () => {
      wait = undefined
      if (!play(!first && random() < timing.doubleChance)) schedule()
    })
  }

  function play(double = false): boolean {
    if (disposed || paused || blink || options.canBlink?.() === false) return false
    wait?.kill(); wait = undefined
    first = false
    const sequence = gsap.timeline({
      paused: true,
      onComplete: () => {
        if (disposed || blink !== sequence) return
        blink = undefined
        options.reset()
        host.setAttribute('data-blink-state', 'open')
        schedule(sequence.totalDuration())
      },
    })
    blink = sequence
    host.setAttribute('data-blink-sequence', double ? 'double' : 'single')
    function add(at: number) {
      const single = options.createBlink()
      sequence.call(() => {
        if (disposed) return
        host.setAttribute('data-blink-state', 'blinking')
        host.setAttribute('data-blink-count', String(++count))
      }, [], at)
      sequence.add(single, at)
      single.paused(false)
      return single.totalDuration()
    }
    const duration = add(0)
    if (double) {
      sequence.call(() => host.setAttribute('data-blink-state', 'double-gap'), [], duration)
      add(duration + timing.doubleGap)
    }
    sequence.play(0)
    return true
  }

  options.reset()
  host.setAttribute('data-blink-state', 'open')
  host.setAttribute('data-blink-count', '0')
  host.setAttribute('data-blink-paused', 'true')

  return {
    setPaused(value) {
      if (disposed || paused === value) return
      paused = value
      host.setAttribute('data-blink-paused', String(value))
      if (paused) { wait?.pause(); blink?.pause() }
      else {
        if (wait) wait.resume()
        if (blink) blink.resume()
        schedule()
      }
    },
    previewBlink: play,
    dispose() {
      if (disposed) return
      disposed = true
      wait?.kill(); wait = undefined
      blink?.kill(); blink = undefined
      options.reset()
      original.forEach(([name, value]) => value === null ? host.removeAttribute(name) : host.setAttribute(name, value))
    },
  }
}
