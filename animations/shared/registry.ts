/** A production registry is an explicit approval record, not automatic visual approval. */
export interface CanvasSize {
  width: number
  height: number
}

export interface RegisteredFrame extends CanvasSize {
  src: string
  approved: boolean
  /** Shared key identifies a reviewed coordinate system, framing, and object identity. */
  alignmentKey: string
}

export interface FrameSet {
  canvas: CanvasSize
  alignmentKey: string
  frames: readonly RegisteredFrame[]
}

export interface FrameLayer {
  /** Caller reserves this host's size and position before the driver mounts images. */
  host: HTMLElement
  states: FrameSet
}

export interface RegisteredLayer {
  element: HTMLElement
  canvas: CanvasSize
  frame: RegisteredFrame
}

export function validateCanvas(canvas: CanvasSize, label: string): void {
  if (!Number.isInteger(canvas.width) || !Number.isInteger(canvas.height) || canvas.width <= 0 || canvas.height <= 0) {
    throw new Error(`${label}: canvas must have positive integer dimensions`)
  }
}

export function validateRegisteredFrame(frame: RegisteredFrame, canvas: CanvasSize, key: string, label: string): void {
  validateCanvas(canvas, label)
  if (frame.approved !== true) throw new Error(`${label}: production asset is not approved=true`)
  if (frame.width !== canvas.width || frame.height !== canvas.height) {
    throw new Error(`${label}: ${frame.width}x${frame.height} does not match registered canvas ${canvas.width}x${canvas.height}`)
  }
  if (typeof key !== 'string' || !key.trim() || frame.alignmentKey !== key) throw new Error(`${label}: reviewed alignment key does not match`)
  if (typeof frame.src !== 'string' || !frame.src.trim()) throw new Error(`${label}: source URL is empty`)
}

export function validateFrameSet(states: FrameSet, label: string, minimumFrames = 1, maximumFrames = Infinity): void {
  validateCanvas(states.canvas, label)
  if (states.frames.length < minimumFrames || states.frames.length > maximumFrames) {
    throw new Error(`${label}: expected ${minimumFrames}..${maximumFrames} frames, got ${states.frames.length}`)
  }
  states.frames.forEach((frame, index) => validateRegisteredFrame(frame, states.canvas, states.alignmentKey, `${label}[${index}]`))
}

export function validateNaturalSize(frame: RegisteredFrame, natural: CanvasSize, label: string): void {
  if (natural.width !== frame.width || natural.height !== frame.height) {
    throw new Error(`${label}: decoded image ${natural.width}x${natural.height} differs from declared ${frame.width}x${frame.height}`)
  }
}

/** 25 frames is the largest set that fits the 1s opening window at 24fps. */
export function openingDuration(frameCount: number): number {
  if (!Number.isInteger(frameCount) || frameCount < 2 || frameCount > 25) {
    throw new Error('Opening requires 2..25 reviewed frames for the fixed 2.6s intro')
  }
  return (frameCount - 1) / 24
}
