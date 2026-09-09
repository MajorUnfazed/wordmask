import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Difficulty } from '@impostor/core'

/**
 * User preferences that persist across sessions. Kept separate from uiStore
 * (navigation state) so preferences have a stable home as more are added.
 */
interface SettingsStore {
  /** Whether haptic (vibration) feedback fires on supported devices. Default on. */
  hapticsEnabled: boolean
  setHapticsEnabled: (enabled: boolean) => void
  /**
   * Last-used hint difficulty, reused as the default for both offline setup and
   * the online host's round pool. The engine's per-game GameConfig.difficulty
   * stays authoritative at runtime — this is just the persisted seed/default.
   */
  difficulty: Difficulty
  setDifficulty: (difficulty: Difficulty) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      hapticsEnabled: true,
      setHapticsEnabled: (enabled) => set({ hapticsEnabled: enabled }),
      difficulty: 'BALANCED',
      setDifficulty: (difficulty) => set({ difficulty }),
    }),
    {
      name: 'wordmask-settings',
      version: 1,
      partialize: (state) => ({
        hapticsEnabled: state.hapticsEnabled,
        difficulty: state.difficulty,
      }),
    },
  ),
)
