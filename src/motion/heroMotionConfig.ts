export type HeroView = 'desktop' | 'mobile'
export interface SourceRegion { x: number; y: number; width: number; height: number }

// Coordinates refer to the existing combined WebP, not newly extracted layers.
// These are display-effect masks, not source anchors or physical animation data.
export const heroMotionConfig = {
  desktop: {
    canvasWidth: 1672,
    source: { width: 390, height: 840 },
    placement: { x: 890, y: 40 },
    intro: { duration: 2.4, sceneAt: .25, sceneDuration: .85, sceneScale: .992, blurPx: 2, headlineAt: .15, headlineDuration: .75, headlineStagger: .08, copyAt: 1.05, copyDuration: .4, ctaAt: 1.2, ctaDuration: .45, cardsAt: 1.4, cardsDuration: .52, cardsStagger: .19, ease: 'power2.out' },
    float: { yPx: 2, xPx: .35, rotationDeg: .035, cycleSeconds: 7.6, ease: 'sine.inOut' },
    blink: { intervalMin: 7, intervalMax: 11, closeSeconds: .055, holdSeconds: .055, openSeconds: .10, maskOpacity: .91, compressedGlowOpacity: .18, glowScaleY: .16 },
    glow: { cycleSeconds: 6.8, opacity: .045, brightness: 1.14, blurPx: .45 },
    thrusters: { cycleSeconds: [3.2, 3.7], opacity: .105, spillOpacity: .035, scaleY: 1.025, brightness: 1.18, blurPx: .55 },
    regions: {
      eyeLeft: { x: 153, y: 242, width: 41, height: 30 },
      eyeRight: { x: 215, y: 242, width: 37, height: 30 },
      glowTop: { x: 157, y: 76, width: 75, height: 34 },
      glowSideLeft: { x: 14, y: 278, width: 29, height: 260 },
      glowSideRight: { x: 338, y: 184, width: 34, height: 198 },
      thrusterLeft: { x: 90, y: 663, width: 86, height: 104 },
      thrusterRight: { x: 176, y: 682, width: 83, height: 88 },
      thrusterSpill: { x: 72, y: 735, width: 205, height: 44 },
    },
  },
  mobile: {
    canvasWidth: 941,
    source: { width: 630, height: 790 },
    placement: { x: 200, y: 108 },
    intro: { duration: 2, sceneAt: 0, sceneDuration: .8, sceneScale: .996, blurPx: 1.2, headlineAt: .65, headlineDuration: .54, headlineStagger: .11, copyAt: 1.15, copyDuration: .45, ctaAt: 1.01, ctaDuration: .44, cardsAt: 1.2, cardsDuration: .46, cardsStagger: .17, ease: 'power2.out' },
    float: { yPx: 1, xPx: .18, rotationDeg: .016, cycleSeconds: 9.2, ease: 'sine.inOut' },
    blink: { intervalMin: 9, intervalMax: 14, closeSeconds: .055, holdSeconds: .06, openSeconds: .11, maskOpacity: .90, compressedGlowOpacity: .15, glowScaleY: .18 },
    glow: { cycleSeconds: 8.2, opacity: .032, brightness: 1.12, blurPx: .5 },
    // Feet and flame are outside this approved crop. Do not invent mobile jets.
    thrusters: null,
    regions: {
      eyeLeft: { x: 216, y: 334, width: 87, height: 77 },
      eyeRight: { x: 363, y: 388, width: 106, height: 61 },
      glowTop: { x: 206, y: 61, width: 226, height: 62 },
      glowSideLeft: { x: 20, y: 210, width: 36, height: 316 },
      glowSideRight: { x: 560, y: 208, width: 40, height: 456 },
    },
  },
} as const
