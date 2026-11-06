import type { ComputedRef, InjectionKey } from 'vue'

export type RigEye = 'open' | 'half' | 'closed'
export interface LivingMascotState {
  enabled: boolean
  ready: boolean
  preload: boolean
  amplitude: number
  eye: RigEye
  jets: boolean
}
export const livingMascotKey: InjectionKey<ComputedRef<LivingMascotState>> = Symbol('living-mascot-review')
// Decode every mounted state before replacing the Phase 3 fallback. Unused
// synthetic pads, reconstructed visor and derived glow are never loaded.
export const livingMascotFiles = [
  'mascot-body-base.png', 'mascot-head.png', 'mascot-arm-left.png', 'mascot-arm-right.png',
  'mascot-leg-left.png', 'mascot-leg-right.png', 'jet-left.png', 'jet-right.png',
  'mascot-eyes-half.png', 'mascot-eyes-closed.png',
] as const
