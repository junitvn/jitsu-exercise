import { create } from 'zustand'
import type { ReactNode } from 'react'

interface UIState {
  sidebarOpen: boolean
  mobileHeaderTitle?: ReactNode
  mobileHeaderAction?: ReactNode
  toggleSidebar: () => void
  setMobileHeader: (header: { title?: ReactNode; action?: ReactNode }) => void
  clearMobileHeader: () => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setMobileHeader: ({ title, action }) =>
    set({
      mobileHeaderTitle: title,
      mobileHeaderAction: action,
    }),
  clearMobileHeader: () =>
    set({
      mobileHeaderTitle: undefined,
      mobileHeaderAction: undefined,
    }),
}))
