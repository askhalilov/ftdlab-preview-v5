import type { ObjectDirective } from 'vue'

// Text remains selectable HTML. Only its ink box is fitted to the reference.
// The approved commercial font was not supplied; this uses a system fallback.
const observers = new WeakMap<HTMLElement, ResizeObserver>()
const pending = new WeakMap<HTMLElement, number>()
const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')!

function fit(el: HTMLElement) {
  const copy = el.querySelector<HTMLElement>('.fit-copy')
  if (!copy || !el.clientWidth || !el.clientHeight) return
  const style = getComputedStyle(copy)
  // Measure the same tracking that the live span renders. Reset for every
  // element so headline tracking never leaks into logo or card measurements.
  ctx.letterSpacing = style.letterSpacing === 'normal' ? '0px' : style.letterSpacing
  ctx.wordSpacing = style.wordSpacing === 'normal' ? '0px' : style.wordSpacing
  const atSize = (size: number) => `${style.fontStyle} ${style.fontWeight} ${size}px ${style.fontFamily}`
  ctx.font = atSize(100)
  const sample = ctx.measureText(copy.textContent ?? '')
  const inkHeight = sample.actualBoundingBoxAscent + sample.actualBoundingBoxDescent
  const size = el.clientHeight / Math.max(1, inkHeight) * 100
  ctx.font = atSize(size)
  const measure = ctx.measureText(copy.textContent ?? '')
  const inkWidth = measure.actualBoundingBoxLeft + measure.actualBoundingBoxRight
  const scale = el.clientWidth / Math.max(1, inkWidth)
  const fontAscent = measure.fontBoundingBoxAscent ?? size * .9
  const fontDescent = measure.fontBoundingBoxDescent ?? size * .2
  const baseline = (size - fontAscent - fontDescent) / 2 + fontAscent
  copy.style.fontSize = `${size}px`
  copy.style.left = `${measure.actualBoundingBoxLeft * scale}px`
  copy.style.top = `${measure.actualBoundingBoxAscent - baseline}px`
  copy.style.transform = `scaleX(${scale})`
}

function schedule(el: HTMLElement) {
  const old = pending.get(el)
  if (old) cancelAnimationFrame(old)
  pending.set(el, requestAnimationFrame(() => { fit(el); pending.delete(el) }))
}

export const fitText: ObjectDirective<HTMLElement> = {
  mounted(el) {
    fit(el)
    const observer = new ResizeObserver(() => schedule(el))
    observer.observe(el)
    observers.set(el, observer)
    void document.fonts.ready.then(() => schedule(el))
  },
  updated: schedule,
  beforeUnmount(el) {
    observers.get(el)?.disconnect()
    const frame = pending.get(el)
    if (frame) cancelAnimationFrame(frame)
    observers.delete(el)
    pending.delete(el)
  },
}
