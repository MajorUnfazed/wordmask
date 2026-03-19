import { useEffect, useMemo, useState } from 'react'
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { RoleCardNative } from '../../components/RoleCard.native'
import { useOnlineMultiplayer } from '../../hooks/useOnlineMultiplayer'

export default function RoleRevealScreen() {
  const router = useRouter()
  const {
    players,
    localPlayerId,
    round,
    role,
    isHost,
    isBusy,
    error,
    hasAcknowledgedReadyToDiscuss,
    loadRole,
    markReadyToDiscuss,
    startDiscussion,
  } = useOnlineMultiplayer()
  const [revealed, setRevealed] = useState(false)
  const playerName = useMemo(
    () => players.find((player) => player.id === localPlayerId)?.name ?? 'Player',
    [localPlayerId, players],
  )

  useEffect(() => {
    if (!role) {
      void loadRole()
    }
  }, [loadRole, role])

  if (!round) {
    return (
      <View style={styles.container}>
        <Text style={styles.subtitle}>Press and hold to reveal your role</Text>
        <RoleCardNative playerName="Player" role="CREWMATE" word="Pizza" hint="Italian baked dish" />
        <Pressable style={styles.primaryButton} onPress={() => router.push('/(game)/discussion')}>
          <Text style={styles.primaryButtonText}>Next Player</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Round {round.roundNumber}</Text>
      <Text style={styles.title}>Private Role Reveal</Text>
      <Text style={styles.subtitle}>
        Press and hold to reveal your role on your own device.
      </Text>
      <Text style={styles.helper}>
        Category pool: {round.sourceCategories.join(' • ')}
      </Text>

      {error && <Text style={styles.error}>{error}</Text>}

      {role ? (
        <RoleCardNative
          playerName={playerName}
          role={role.role}
          word={role.word}
          hint={role.hint}
          revealed={revealed}
          onReveal={() => setRevealed(true)}
        />
      ) : (
        <Text style={styles.helper}>Loading your role…</Text>
      )}

      {revealed && (
        <Text style={styles.helper}>
          Ready check-ins: {round.readyToDiscussCount}/{round.readyToDiscussTotal}
        </Text>
      )}

      {revealed && !hasAcknowledgedReadyToDiscuss ? (
        <Pressable
          style={styles.primaryButton}
          onPress={() => {
            void markReadyToDiscuss()
          }}
        >
          <Text style={styles.primaryButtonText}>Ready to Discuss</Text>
        </Pressable>
      ) : revealed && isHost ? (
        <View style={styles.actions}>
          <Pressable
            style={[styles.primaryButton, isBusy && styles.buttonDisabled]}
            onPress={() => {
              void startDiscussion()
            }}
            disabled={isBusy}
          >
            <Text style={styles.primaryButtonText}>
              {isBusy
                ? 'Opening…'
                : round.readyToDiscussCount >= round.readyToDiscussTotal
                  ? 'Open Discussion'
                  : 'Open Discussion Anyway'}
            </Text>
          </Pressable>
          <Text style={styles.helper}>
            {round.readyToDiscussCount}/{round.readyToDiscussTotal} players have finished revealing.
          </Text>
        </View>
      ) : revealed ? (
        <Text style={styles.helper}>Waiting for the host to open the discussion…</Text>
      ) : null}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    minHeight: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    padding: 24,
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
    fontSize: 40,
    fontWeight: '900',
    fontFamily: 'serif',
    textAlign: 'center',
  },
  subtitle: {
    color: '#cbd5e1',
    textAlign: 'center',
    maxWidth: 320,
  },
  helper: {
    color: '#94a3b8',
    textAlign: 'center',
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
  actions: {
    width: '100%',
    maxWidth: 340,
    gap: 12,
  },
  primaryButton: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#7c3aed',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.45,
  },
})
