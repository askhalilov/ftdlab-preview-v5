/** Approved word/brand presentation. Progress is actual resource readiness. */
export const loaderMotionConfig = {
  progressDuration: .1,
  wordIntervalMs: 800,
  wordDuration: .5,
  wordOffset: 20,
  completionHold: .2,
  // Source App directly unmounts Loader; its nested exit never plays.
  fadeDuration: 0,
  words: ['FTD.LAB', 'TRAFFIC', 'RESULTS'],
} as const
