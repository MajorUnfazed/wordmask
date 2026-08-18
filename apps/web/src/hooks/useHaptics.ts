/**
 * useHaptics — React-hook accessor for the shared, settings-gated haptics module.
 *
 * Kept for components that prefer a hook; the actual gating and vibration live
 * in `lib/haptics.ts`, a plain module also callable from non-React code (store
 * actions, effects). No-ops gracefully where the Vibration API is unsupported.
 */
import { haptics } from '../lib/haptics'

export function useHaptics() {
  return haptics
}
