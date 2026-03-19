import { View, Text, StyleSheet, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { RoomChatSheet } from '../../components/RoomChatSheet'
import { useOnlineMultiplayer } from '../../hooks/useOnlineMultiplayer'

export default function DiscussionScreen() {
  const router = useRouter()
  const { round, isHost, isBusy, error, startVoting } = useOnlineMultiplayer()

  if (!round) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Discuss!</Text>
        <Text style={styles.subtitle}>Who is the impostor?</Text>
        <Pressable style={styles.primaryButton} onPress={() => router.push('/(game)/voting')}>
          <Text style={styles.primaryButtonText}>Vote Now</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Round {round.roundNumber}</Text>
      <Text style={styles.title}>Discussion Open</Text>
      <Text style={styles.subtitle}>Trade clues and pressure the room.</Text>
      <Text style={styles.helper}>
        Category pool: {round.sourceCategories.join(' • ')}
      </Text>
      <Text style={styles.progress}>
        {round.readyToDiscussCount}/{round.readyToDiscussTotal} players revealed
      </Text>

      {error && <Text style={styles.error}>{error}</Text>}

      {isHost ? (
        <Pressable
          style={[styles.primaryButton, isBusy && styles.buttonDisabled]}
          onPress={() => {
            void startVoting()
          }}
          disabled={isBusy}
        >
          <Text style={styles.primaryButtonText}>
            {isBusy ? 'Opening…' : 'Open Voting'}
          </Text>
        </Pressable>
      ) : (
        <Text style={styles.helper}>Host opening voting soon…</Text>
      )}

      <RoomChatSheet />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  helper: {
    color: '#94a3b8',
    textAlign: 'center',
  },
  progress: {
    color: '#e2e8f0',
    fontSize: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.06)',
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
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.45,
  },
})
