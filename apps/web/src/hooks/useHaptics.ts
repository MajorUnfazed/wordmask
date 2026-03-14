/**
 * useHaptics — provides haptic feedback on web via the Vibration API.
 * No-ops gracefully on browsers that don't support it.
 */
export function useHaptics() {
  const vibrate = (pattern: number | number[]) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }

  return {
    light: () => vibrate(10),
    medium: () => vibrate(25),
    heavy: () => vibrate([40, 20, 40]),
    success: () => vibrate([10, 30, 10]),
  }
}
