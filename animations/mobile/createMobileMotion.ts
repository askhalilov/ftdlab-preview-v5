import { createMotion, type MobileMotionOptions, type MotionController } from '../shared/driver'

/** Lightweight production driver: discrete approved blink frames, no continuous motion. */
export function createMobileMotion(options: MobileMotionOptions): Promise<MotionController> {
  return createMotion(options, 'mobile')
}

export type { MobileMotionOptions, MotionController }
