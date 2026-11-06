import { createMotion, type DesktopMotionOptions, type MotionController } from '../shared/driver'

/** Gated production driver. Does not run on the kit's unapproved prototype layers. */
export function createDesktopMotion(options: DesktopMotionOptions): Promise<MotionController> {
  return createMotion(options, 'desktop', options.jets)
}

export type { DesktopMotionOptions, MotionController }
