import { gsap } from 'gsap'
import { validateNaturalSize, type FrameLayer, type RegisteredFrame } from './registry'

/** Loads and decodes actual sources. A metadata-only approval cannot bypass size checks. */
export async function preloadFrame(frame: RegisteredFrame, label: string): Promise<HTMLImageElement> {
  const image = new Image()
  image.decoding = 'async'
  image.alt = ''
  image.setAttribute('aria-hidden', 'true')
  image.width = frame.width
  image.height = frame.height
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve()
    image.onerror = () => reject(new Error(`${label}: could not load ${frame.src}`))
    image.src = frame.src
  })
  image.onload = null
  image.onerror = null
  if (typeof image.decode === 'function') await image.decode()
  validateNaturalSize(frame, { width: image.naturalWidth, height: image.naturalHeight }, label)
  return image
}

export async function preloadSet(layer: FrameLayer, label: string): Promise<HTMLImageElement[]> {
  return Promise.all(layer.states.frames.map((frame, index) => preloadFrame(frame, `${label}[${index}]`)))
}

/** Discrete frame selection: opacity toggles only, no morph/crossfade/interpolation. */
export class FramePlayer {
  private index = -1
  private readonly images: HTMLImageElement[]

  constructor(private readonly layer: FrameLayer, images: HTMLImageElement[]) {
    this.images = images
    images.forEach((image) => {
      Object.assign(image.style, {
        position: 'absolute', inset: '0', width: '100%', height: '100%',
        objectFit: 'contain', opacity: '0', pointerEvents: 'none', userSelect: 'none',
      })
      layer.host.appendChild(image)
    })
    this.show(0)
  }

  show(index: number): void {
    if (!Number.isInteger(index) || index < 0 || index >= this.images.length) throw new Error(`Frame index ${index} is out of range`)
    if (index === this.index) return
    if (this.index >= 0) this.images[this.index].style.opacity = '0'
    this.images[index].style.opacity = '1'
    this.index = index
  }

  showOpen(): void { this.show(this.images.length - 1) }

  addOpening(timeline: gsap.core.Timeline, start: number): void {
    this.images.forEach((_, index) => timeline.call(() => this.show(index), [], start + index / 24))
  }

  dispose(): void {
    this.images.forEach((image) => { if (image.parentElement === this.layer.host) image.remove() })
    this.index = -1
  }
}
