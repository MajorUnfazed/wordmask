import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { GlowButton } from '../components/ui/GlowButton'
import { useLobby } from '../hooks/useLobby'

export default function OnlinePendingApprovalScreen() {
  const {
    code,
    displayName,
    accessState,
    pendingJoinRequestId,
    error,
    isBusy,
    refreshPendingJoinRequest,
    requestRejoinApproval,
    disconnectLobby,
  } = useLobby()

  useEffect(() => {
    if (accessState !== 'pending_approval' || !pendingJoinRequestId) {
      return
    }

    void refreshPendingJoinRequest()
    const interval = window.setInterval(() => {
      void refreshPendingJoinRequest()
    }, 3000)

    return () => {
      window.clearInterval(interval)
    }
  }, [accessState, pendingJoinRequestId, refreshPendingJoinRequest])

  const isPending = accessState === 'pending_approval'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-12 text-center">
      <motion.div
        className="max-w-2xl"
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-sm uppercase tracking-[0.25em] text-white/45">Room Access</p>
        <h2 className="mt-3 font-display text-4xl font-bold">
          {isPending ? 'Waiting for Host Approval' : 'Removed from Room'}
        </h2>
        <p className="mt-3 text-white/60">
          {isPending
            ? `Your rejoin request for ${code ?? 'this room'} is pending approval.`
            : 'The host removed you from the room. You can request to rejoin when ready.'}
        </p>
      </motion.div>

      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 text-left">
        <p className="text-sm uppercase tracking-[0.2em] text-white/40">Details</p>
        <div className="mt-4 space-y-3 text-sm text-white/70">
          <p>Room code: <span className="font-semibold text-white">{code ?? 'Unknown'}</span></p>
          <p>Display name: <span className="font-semibold text-white">{displayName ?? 'Unknown'}</span></p>
          {pendingJoinRequestId && (
            <p>
              Request id: <span className="font-mono text-xs text-white/55">{pendingJoinRequestId}</span>
            </p>
          )}
        </div>
      </div>

      {error && (
        <div
          className="w-full max-w-md rounded-2xl border px-4 py-3 text-sm"
          style={{
            borderColor: 'rgba(239,68,68,0.3)',
            background: 'rgba(239,68,68,0.08)',
            color: 'rgb(252,165,165)',
          }}
        >
          {error}
        </div>
      )}

      <div className="flex w-full max-w-md flex-col gap-3">
        {isPending ? (
          <GlowButton
            variant="secondary"
            onClick={() => {
              void refreshPendingJoinRequest()
            }}
            disabled={isBusy}
          >
            {isBusy ? 'Checking…' : 'Check Status'}
          </GlowButton>
        ) : (
          <GlowButton
            onClick={() => {
              void requestRejoinApproval()
            }}
            disabled={isBusy}
          >
            {isBusy ? 'Requesting…' : 'Request Rejoin'}
          </GlowButton>
        )}

        <GlowButton variant="secondary" onClick={disconnectLobby}>
          Back
        </GlowButton>
      </div>
    </div>
  )
}
