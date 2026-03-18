import { create } from 'zustand'
import type {
  OnlineRolePayload,
  OnlineRoundResult,
  OnlineRoundSnapshot,
} from '../lib/online'

interface OnlineRoundStore {
  round: OnlineRoundSnapshot | null
  role: OnlineRolePayload | null
  submittedVoteTargetId: string | null
  result: OnlineRoundResult | null
  hasAcknowledgedReadyToDiscuss: boolean

  setRound: (round: OnlineRoundSnapshot | null) => void
  setRole: (role: OnlineRolePayload | null) => void
  setSubmittedVoteTargetId: (targetId: string | null) => void
  setResult: (result: OnlineRoundResult | null) => void
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

export const useOnlineRoundStore = create<OnlineRoundStore>((set) => ({
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
