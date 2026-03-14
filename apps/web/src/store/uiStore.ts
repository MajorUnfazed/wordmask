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
}

export const useUIStore = create<UIStore>((set) => ({
  screen: 'home',
  setScreen: (screen) => set({ screen }),
}))
