import { useEffect } from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { useOnlineMultiplayer } from '../../hooks/useOnlineMultiplayer'

export default function PendingLobbyApprovalScreen() {
  const {
    code,
    displayName,
    accessState,
    pendingJoinRequestId,
    error,
    isBusy,
    refreshPendingJoinRequest,
    requestRejoinApproval,
    leaveLobby,
  } = useOnlineMultiplayer()

  useEffect(() => {
    if (accessState !== 'pending_approval' || !pendingJoinRequestId) {
      return
    }

    void refreshPendingJoinRequest()
    const interval = setInterval(() => {
      void refreshPendingJoinRequest()
    }, 3000)

    return () => clearInterval(interval)
  }, [accessState, pendingJoinRequestId, refreshPendingJoinRequest])

  const isPending = accessState === 'pending_approval'

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Room Access</Text>
      <Text style={styles.title}>
        {isPending ? 'Waiting for Host Approval' : 'Removed from Room'}
      </Text>
      <Text style={styles.subtitle}>
        {isPending
          ? `Your rejoin request for ${code} is pending approval.`
          : 'The host removed you from the room. You can request to rejoin when ready.'}
      </Text>

      <View style={styles.card}>
        <Text style={styles.detail}>Room code: {code || 'Unknown'}</Text>
        <Text style={styles.detail}>Display name: {displayName || 'Unknown'}</Text>
        {pendingJoinRequestId && <Text style={styles.detail}>Request id: {pendingJoinRequestId}</Text>}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      {isPending ? (
        <Pressable
          style={[styles.primaryButton, isBusy && styles.buttonDisabled]}
          onPress={() => {
            void refreshPendingJoinRequest()
          }}
          disabled={isBusy}
        >
          <Text style={styles.primaryText}>{isBusy ? 'Checking…' : 'Check Status'}</Text>
        </Pressable>
      ) : (
        <Pressable
          style={[styles.primaryButton, isBusy && styles.buttonDisabled]}
          onPress={() => {
            void requestRejoinApproval()
          }}
          disabled={isBusy}
        >
          <Text style={styles.primaryText}>{isBusy ? 'Requesting…' : 'Request Rejoin'}</Text>
        </Pressable>
      )}

      <Pressable style={styles.secondaryButton} onPress={() => void leaveLobby()}>
        <Text style={styles.secondaryText}>Back</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 18,
    backgroundColor: '#0A0A14',
  },
  label: {
    color: '#94a3b8',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  title: {
    color: '#f8fafc',
    fontSize: 34,
    fontWeight: '900',
    fontFamily: 'serif',
    textAlign: 'center',
  },
  subtitle: {
    color: '#cbd5e1',
    textAlign: 'center',
    maxWidth: 320,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 18,
    gap: 8,
  },
  detail: {
    color: '#e2e8f0',
    fontSize: 14,
  },
  error: {
    width: '100%',
    maxWidth: 340,
    color: '#fca5a5',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    backgroundColor: 'rgba(239,68,68,0.08)',
    padding: 16,
    overflow: 'hidden',
  },
  primaryButton: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#7c3aed',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryText: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
})
