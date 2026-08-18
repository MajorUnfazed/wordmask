/**
 * Haptic feedback via the Web Vibration API.
 *
 * A plain module (not a hook) so it can be called from anywhere — Zustand
 * actions, effects, event handlers. Every method no-ops unless the device
 * exposes `navigator.vibrate` AND the user has haptics enabled.
 *
 * Reality check: `navigator.vibrate` works on Android browsers only. iOS
 * Safari — and every iOS browser, since they are all WebKit — has never
 * shipped it, so iOS players silently get nothing. Desktop browsers accept
 * the call but have no vibration motor. Both are expected, not bugs.
 */
import { useSettingsStore } from '../store/settingsStore'

/** Whether this device/browser can actually vibrate. Drives the settings UI. */
export function canVibrate(): boolean {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator
}

function vibrate(pattern: number | number[]): void {
  if (!canVibrate()) return
  if (!useSettingsStore.getState().hapticsEnabled) return
  try {
    navigator.vibrate(pattern)
  } catch {
    // Some browsers throw without prior user activation — ignore.
  }
}

export const haptics = {
  /** Light tick — selections, minor confirmations. */
  light: () => vibrate(10),
  /** Medium tap — role reveal, vote confirmed. */
  medium: () => vibrate(25),
  /** Heavy buzz — elimination, loss, "you're caught", timer expiry. */
  heavy: () => vibrate([40, 20, 40]),
  /** Celebratory double-pulse — a win. */
  success: () => vibrate([10, 30, 10]),
}
