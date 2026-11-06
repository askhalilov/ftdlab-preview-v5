/** Review-only 2D partition rig. Coordinates are native pixels on the supplied
 * 1254px canvas; left/right name image sides rather than anatomical sides.
 * Most anchors retain registration.json; the right shoulder is refined to its
 * attachment edge. Larger review angles are supported by source seam overlaps. */
export const livingMascotConfig = {
  canvas: 1254,
  cycle: 6.8,
  initialAmplitude: 0,
  float: { x: 1.2, y: 7, tilt: .55, pivotX: 623, pivotY: 602 },
  jets: { opacity: .36, length: .075, blur: .7 },
  parts: {
    head: { x: 622, y: 390, rotation: -2.2, phase: -.35 },
    'arm-left': { x: 524, y: 427, rotation: 5.2, phase: .18 },
    'arm-right': { x: 711, y: 430, rotation: -4.4, phase: -.58 },
    'leg-left': { x: 594, y: 611, rotation: 2.8, phase: -.78 },
    'leg-right': { x: 672, y: 616, rotation: -2.4, phase: .72 },
  },
} as const

export type LivingMascotPart = keyof typeof livingMascotConfig.parts

export function clampLivingAmplitude(value: number): number {
  return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0
}

export function clampLivingWave(value: number): number {
  return Number.isFinite(value) ? Math.min(1, Math.max(-1, value)) : 0
}

/** Deterministic diagnostic poses. Autonomous idle adds joint-specific follow;
 * the same review controller owns body float and source jet-light pulses. */
export function livingMascotAngles(wave: number, amplitude: number): Record<LivingMascotPart, number> {
  const scale = clampLivingWave(wave) * clampLivingAmplitude(amplitude)
  return Object.fromEntries(Object.entries(livingMascotConfig.parts).map(([part, joint]) => [part, joint.rotation * scale])) as Record<LivingMascotPart, number>
}

/** Different harmonic phases keep the joints from swinging as one rigid
 * pendulum, while all pass through the unchanged neutral pose at cycle zero. */
export function livingMascotIdleAngles(phase: number, amplitude: number): Record<LivingMascotPart, number> {
  const a = clampLivingAmplitude(amplitude)
  return Object.fromEntries(Object.entries(livingMascotConfig.parts).map(([name, joint]) => {
    const normalizer = Math.abs(Math.cos(joint.phase)) + .3 * Math.abs(Math.sin(joint.phase))
    const wave = (Math.sin(phase) * Math.cos(joint.phase) + .3 * Math.sin(phase * 2) * Math.sin(joint.phase)) / normalizer
    return [name, joint.rotation * a * wave]
  })) as Record<LivingMascotPart, number>
}
