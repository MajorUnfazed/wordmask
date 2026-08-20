import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type AppScreen =
  | 'home'
  | 'mode'
  | 'setup'
  | 'category'
  | 'round-transition'
  | 'role-reveal'
  | 'discussion'
  | 'voting'
  | 'results'
  | 'online-create'
  | 'online-lobby'
  | 'online-pending-approval'
  | 'online-round-starting'
  | 'online-role-reveal'
  | 'online-discussion'
  | 'online-voting'
  | 'online-final-guess'
  | 'online-results'
  | 'pass-the-phone-resolve'
  | 'online-spectator'
  | 'tv-host'
  | 'profile'
  | 'pack-browser'
  | 'pack-creator'

interface UIStore {
  screen: AppScreen
  setScreen: (screen: AppScreen) => void

  // For resume capability
  savedScreen: AppScreen | null
  setSavedScreen: (screen: AppScreen | null) => void
  restoreSavedScreen: () => void

  /**
   * A custom pack id the user chose to "Play" from the pack browser. Consumed by the
   * category screen once the offline game is set up, then cleared. Not persisted.
   */
  pendingPlayPackId: string | null
  setPendingPlayPackId: (packId: string | null) => void

  tension: number
  setTension: (tension: number) => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      screen: 'home',
      setScreen: (screen) => {
        set({ screen })
        // Whenever we navigate to a playable screen, save it so we can resume
        if (screen !== 'home' && screen !== 'mode' && screen !== 'setup') {
          set({ savedScreen: screen })
        } else if (screen === 'home') {
          // If we explicitly go home, we might want to clear or keep it
        }
      },
      
      savedScreen: null,
      setSavedScreen: (screen) => set({ savedScreen: screen }),
      restoreSavedScreen: () => {
        const { savedScreen } = get()
        if (savedScreen) {
          set({ screen: savedScreen })
        }
      },

      pendingPlayPackId: null,
      setPendingPlayPackId: (packId) => set({ pendingPlayPackId: packId }),

      tension: 0,
      setTension: (tension) => set({ tension })
    }),
    {
      name: 'wordmask-ui-storage',
      version: 1,
      partialize: (state) => ({
        // Only persist the savedScreen, not the current screen. 
        // This forces the user to start at 'home' on refresh, 
        // allowing them to click "Resume" to restore savedScreen.
        savedScreen: state.screen !== 'home' && state.screen !== 'mode' && state.screen !== 'setup' 
           ? state.screen 
           : state.savedScreen
      }),
    }
  )
)
