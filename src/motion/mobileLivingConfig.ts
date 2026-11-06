import type { ComputedRef, InjectionKey } from 'vue'

export const mobileMotionKey: InjectionKey<ComputedRef<boolean>> = Symbol('mobile-living-enabled')
export const mobileLivingConfig = {
  enabled: true,
  // V2 candidates promoted after browser endpoint / shoulder acceptance.
  assetRoot: 'assets/mobile-living/v2',
  canvas: { width: 630, height: 790 },
  intro: { openingAt: .85, duration: 1.7, ease: 'power3.inOut' },
  doors: { x: 81.9, y: 687.3 },
  // Geometry is registered in the field PNG / registration.json. Strength
  // scales that field; timings can be tuned without regenerating artwork.
  arm: { strength: 1,
    firstDelay: 1.05, intervalMin: 3, intervalMax: 5, out: .65, hold: .12, back: .9 },
} as const

export const mobileLivingAsset = (name: string) => `${import.meta.env.BASE_URL}${mobileLivingConfig.assetRoot}/${name}`
