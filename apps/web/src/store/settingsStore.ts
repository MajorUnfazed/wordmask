import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * User preferences that persist across sessions. Kept separate from uiStore
 * (navigation state) so preferences have a stable home as more are added.
 */
interface SettingsStore {
  /** Whether haptic (vibration) feedback fires on supported devices. Default on. */
  hapticsEnabled: boolean
  setHapticsEnabled: (enabled: boolean) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      hapticsEnabled: true,
      setHapticsEnabled: (enabled) => set({ hapticsEnabled: enabled }),
    }),
    {
      name: 'wordmask-settings',
      version: 1,
      partialize: (state) => ({ hapticsEnabled: state.hapticsEnabled }),
    },
  ),
)
