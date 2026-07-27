import { create } from 'zustand'
import type { ReactNode } from 'react'

interface UIState {
  mobileHeaderTitle?: ReactNode
  mobileHeaderAction?: ReactNode
  setMobileHeader: (header: { title?: ReactNode; action?: ReactNode }) => void
  clearMobileHeader: () => void
}

export const useUIStore = create<UIState>((set) => ({
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
