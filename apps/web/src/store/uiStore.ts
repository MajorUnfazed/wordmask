import { create } from 'zustand'

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

interface UIStore {
  screen: AppScreen
  setScreen: (screen: AppScreen) => void
  tension: number // 0.0 to 1.0, drives background urgency
  setTension: (tension: number) => void
}

export const useUIStore = create<UIStore>((set) => ({
  screen: 'home',
  setScreen: (screen) => set({ screen }),
  tension: 0,
  setTension: (tension) => set({ tension })
}))
