// Direct port of CustomCursor.tsx at portfolio commit 2292cf8baffc83472efff92140ce0ae98af978d8.
// Keep the two original Motion springs; these are not exponential follow constants.
export const interactionConfig = {
  dotDiameter: 12,
  ringDiameter: 40,
  dotHoverScale: 0.5,
  ringHoverScale: 1.5,
  dotSpring: { type: 'spring', stiffness: 500, damping: 28, mass: 0.5 },
  ringSpring: { type: 'spring', stiffness: 150, damping: 15, mass: 0.1 },
  touchMoveTolerance: 10,
  touchMinimumMs: 90,
  touchSafetyMs: 700,
} as const
