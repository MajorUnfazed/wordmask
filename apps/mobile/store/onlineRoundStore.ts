import { create } from 'zustand'
import type {
  MobileRolePayload,
  MobileRoundResult,
  MobileRoundSnapshot,
} from '../lib/online'

interface MobileOnlineRoundStore {
  round: MobileRoundSnapshot | null
  role: MobileRolePayload | null
  submittedVoteTargetId: string | null
  result: MobileRoundResult | null
  hasAcknowledgedReadyToDiscuss: boolean

  setRound: (round: MobileRoundSnapshot | null) => void
  setRole: (role: MobileRolePayload | null) => void
  setSubmittedVoteTargetId: (targetId: string | null) => void
  setResult: (result: MobileRoundResult | null) => void
  setHasAcknowledgedReadyToDiscuss: (value: boolean) => void
  clearRound: () => void
}

const initialState = {
  round: null,
  role: null,
  submittedVoteTargetId: null,
  result: null,
  hasAcknowledgedReadyToDiscuss: false,
}

export const useMobileOnlineRoundStore = create<MobileOnlineRoundStore>((set) => ({
  ...initialState,

  setRound(round) {
    set({ round })
  },

  setRole(role) {
    set({ role })
  },

  setSubmittedVoteTargetId(targetId) {
    set({ submittedVoteTargetId: targetId })
  },

  setResult(result) {
    set({ result })
  },

  setHasAcknowledgedReadyToDiscuss(value) {
    set({ hasAcknowledgedReadyToDiscuss: value })
  },

  clearRound() {
    set(initialState)
  },
}))
