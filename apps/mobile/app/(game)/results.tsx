import { useEffect } from 'react'
import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { RoomChatSheet } from '../../components/RoomChatSheet'
import { useOnlineMultiplayer } from '../../hooks/useOnlineMultiplayer'

export default function ResultsScreen() {
  const router = useRouter()
  const {
    round,
    result,
    players,
    error,
    isHost,
    loadRoundResult,
    returnToLobby,
    startNextRound,
  } = useOnlineMultiplayer()

  useEffect(() => {
    if (!result && round?.id) {
      void loadRoundResult(round.id)
    }
  }, [loadRoundResult, result, round?.id])

  if (!result && !round) {
    return (
      <View style={styles.container}>
        <Text style={styles.icon}>🎉</Text>
        <Text style={styles.title}>Caught!</Text>
        <Text style={styles.subtitle}>The impostor has been found</Text>
        <View style={styles.actions}>
          <Pressable style={styles.primaryButton} onPress={() => router.push('/(game)/offline-setup')}>
            <Text style={styles.primaryButtonText}>Next Round</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => router.push('/')}>
            <Text style={styles.secondaryButtonText}>End Game</Text>
          </Pressable>
        </View>
      </View>
    )
  }

  if (!result) {
    return (
      <View style={styles.container}>
        <Text style={styles.helper}>Preparing results…</Text>
      </View>
    )
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.icon}>{result.impostorsCaught ? '🎉' : '😈'}</Text>
      <Text style={styles.title}>
        {result.impostorsCaught ? 'Caught!' : result.isTie ? 'Stalemate' : 'Escaped!'}
      </Text>
      <Text style={styles.subtitle}>
        {result.impostorsCaught
          ? `The impostor was ${result.impostors.map((player) => player.name).join(', ')}.`
          : result.isTie
            ? 'The room tied and nobody was eliminated.'
            : `${result.impostors.map((player) => player.name).join(', ')} fooled the room.`}
      </Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.card}>
        <Text style={styles.cardLabel}>The word was</Text>
        <Text style={styles.cardWord}>{result.word}</Text>
        <Text style={styles.cardHint}>{result.hint}</Text>
        <Text style={styles.cardHint}>
          {result.eliminatedPlayerName
            ? `Eliminated player: ${result.eliminatedPlayerName}`
            : 'Nobody was eliminated.'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Vote Summary</Text>
        {result.voteSummary.length === 0 ? (
          <Text style={styles.helper}>No votes were recorded.</Text>
        ) : (
          result.voteSummary.map((item) => {
            const targetName = players.find((player) => player.id === item.targetId)?.name
            return (
              <View key={item.targetId} style={styles.voteRow}>
                <Text style={styles.voteName}>{targetName || item.targetId}</Text>
                <Text style={styles.voteCount}>{item.voteCount}</Text>
              </View>
            )
          })
        )}
      </View>

      <View style={styles.actions}>
        {isHost && (
          <Pressable
            style={styles.primaryButton}
            onPress={() => {
              void startNextRound()
            }}
          >
            <Text style={styles.primaryButtonText}>Next Round</Text>
          </Pressable>
        )}
        <Pressable style={styles.secondaryButton} onPress={() => void returnToLobby()}>
          <Text style={styles.secondaryButtonText}>Back to Lobby</Text>
        </Pressable>
      </View>

      <RoomChatSheet />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    minHeight: '100%',
    alignItems: 'center',
    gap: 20,
    padding: 24,
    backgroundColor: '#0A0A14',
  },
  icon: {
    fontSize: 60,
  },
  title: {
    color: '#f8fafc',
    fontSize: 42,
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
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 18,
    gap: 10,
  },
  cardLabel: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  cardWord: {
    color: '#a855f7',
    fontSize: 34,
    fontWeight: '900',
    fontFamily: 'serif',
    textAlign: 'center',
  },
  cardHint: {
    color: '#cbd5e1',
    textAlign: 'center',
  },
  cardTitle: {
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: '900',
    fontFamily: 'serif',
  },
  voteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  voteName: {
    color: '#f8fafc',
    fontSize: 15,
  },
  voteCount: {
    color: '#a855f7',
    fontSize: 20,
    fontWeight: '900',
    fontFamily: 'serif',
  },
  actions: {
    width: '100%',
    maxWidth: 340,
    gap: 12,
  },
  primaryButton: {
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
  secondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '600',
  },
})
