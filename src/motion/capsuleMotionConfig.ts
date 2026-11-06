/** Native coordinates in the supplied 1254px registered desktop source.
 * Mobile intentionally keeps heroMotionConfig.mobile and its pointing artwork. */
export const capsuleMotionConfig = {
  canvas: 1254,
  aperture: { x: 407, y: 140, width: 423, height: 988, radius: 113 },
  split: { coefficient: .30915645449977047, limit: 814.5051921528545 },
  travel: { upper: { x: -440, y: -220 }, lower: { x: 440, y: 220 } },
  intro: { lightAt: .08, unlockAt: .36, unlockDuration: .16, unlockProgress: .012, openingAt: .62, openingDuration: 1.45, openingEase: 'power3.inOut', jetsAt: 2.07, jetsDuration: .26 },
  idle: { y: 2.6, x: .35, rotation: .025, cycle: 7.6, glowOpacity: .045, glowCycle: 6.8, jetOpacity: .09, jetCycle: 3.4 },
  blink: { min: 7, max: 11, close: .055, hold: .055, open: .10, opacity: .72 },
} as const
