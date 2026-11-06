import { animateMotionValue, cancelFrame, frame, motionValue, type MotionValue, type ValueAnimationTransition } from 'motion-dom'
import { interactionConfig as config } from './interactionConfig'

/**
 * The original portfolio uses motion/react's animate prop. Its numeric animation
 * implementation is motion-dom's animateMotionValue. Reuse that exact engine,
 * including velocity hand-off, analytic spring solver, thresholds and scheduler.
 * React is not required for this Vue rendering adapter.
 */
export function createPortfolioCursorMotion(
  dot: HTMLElement,
  ring: HTMLElement,
  onActivity: (active: boolean) => void,
) {
  const values = {
    dotX: motionValue(0), dotY: motionValue(0), dotScale: motionValue(1),
    ringX: motionValue(0), ringY: motionValue(0), ringScale: motionValue(1),
  }
  const targets = new Map<MotionValue<number>, number>()
  let disposed = false
  let enabled = false

  function render() {
    if (!enabled || disposed) return
    // Offsets and scale origins match the original fixed wrappers and their
    // 12px / 40px children; no extra translate(-50%) or interpolation is added.
    dot.style.transform = `translateX(${values.dotX.get()}px) translateY(${values.dotY.get()}px) scale(${values.dotScale.get()})`
    ring.style.transform = `translateX(${values.ringX.get()}px) translateY(${values.ringY.get()}px) scale(${values.ringScale.get()})`
    onActivity(Object.values(values).some(value => value.isAnimating()))
  }
  function scheduleRender() { if (enabled && !disposed) frame.render(render) }
  const unsubscribe = Object.values(values).map(value => value.on('change', scheduleRender))

  function set(value: MotionValue<number>, name: 'x' | 'y' | 'scale', target: number, transition: ValueAnimationTransition, instant: boolean) {
    if (instant) {
      targets.set(value, target)
      value.jump(target)
    } else if (targets.get(value) !== target) {
      targets.set(value, target)
      onActivity(true)
      void value.start(animateMotionValue(name, value, target, transition)).then(() => {
        if (!disposed && enabled) scheduleRender()
      })
    }
  }

  return {
    update(x: number, y: number, hovering: boolean, initial?: 'origin' | 'snap') {
      if (disposed) return
      // Motion's source wrappers have no initial transform. When they mount,
      // x/y therefore animate from 0 and scale from 1. Source mouseleave
      // unmounts them, so viewport re-entry repeats this same origin flight.
      if (initial === 'origin') {
        enabled = false
        values.dotX.jump(0); values.dotY.jump(0); values.dotScale.jump(1)
        values.ringX.jump(0); values.ringY.jump(0); values.ringScale.jump(1)
        targets.clear()
        targets.set(values.dotScale, 1); targets.set(values.ringScale, 1)
      }
      enabled = true
      if (initial === 'origin') render()
      const instant = initial === 'snap'
      set(values.dotX, 'x', x - config.dotDiameter / 2, config.dotSpring, instant)
      set(values.dotY, 'y', y - config.dotDiameter / 2, config.dotSpring, instant)
      set(values.dotScale, 'scale', hovering ? config.dotHoverScale : 1, config.dotSpring, instant)
      set(values.ringX, 'x', x - config.ringDiameter / 2, config.ringSpring, instant)
      set(values.ringY, 'y', y - config.ringDiameter / 2, config.ringSpring, instant)
      set(values.ringScale, 'scale', hovering ? config.ringHoverScale : 1, config.ringSpring, instant)
      if (instant) render()
    },
    stop() {
      enabled = false
      Object.values(values).forEach(value => value.stop())
      targets.clear()
      cancelFrame(render)
      onActivity(false)
    },
    destroy() {
      this.stop()
      disposed = true
      unsubscribe.forEach(remove => remove())
      Object.values(values).forEach(value => value.destroy())
      cancelFrame(render)
    },
  }
}
