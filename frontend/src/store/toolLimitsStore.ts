import { create } from 'zustand'

interface ToolLimit {
  slug: string
  used: number
  limit: number
  credits: number
  extraCostXp: number
  resetAt: string
}

interface ToolLimitsState {
  premiumTier: string
  dayPassActiveUntil: string | null
  tools: ToolLimit[]
  userXp: number
  setLimits: (limits: Partial<Omit<ToolLimitsState, 'setLimits'>>) => void
}

export const useToolLimitsStore = create<ToolLimitsState>((set) => ({
  premiumTier: 'none',
  dayPassActiveUntil: null,
  tools: [],
  userXp: 0,
  setLimits: (limits) => set((state) => ({ ...state, ...limits })),
}))
