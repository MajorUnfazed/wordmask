import { useMemo, useState } from 'react'
import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { RoomChatSheet } from '../../components/RoomChatSheet'
import { useOnlineMultiplayer } from '../../hooks/useOnlineMultiplayer'

export default function VotingScreen() {
  const router = useRouter()
  const {
    players,
    localPlayerId,
    round,
    submittedVoteTargetId,
    isHost,
    isBusy,
    error,
    submitVote,
    finishRound,
  } = useOnlineMultiplayer()
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(
    submittedVoteTargetId,
  )
  const availableTargets = useMemo(
    () => players.filter((player) => player.id !== localPlayerId),
    [localPlayerId, players],
  )

  if (!round) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Vote</Text>
        <Text style={styles.subtitle}>Who is the impostor?</Text>
        <Pressable style={styles.primaryButton} onPress={() => router.push('/(game)/results')}>
          <Text style={styles.primaryButtonText}>Reveal Results</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Round {round.roundNumber}</Text>
      <Text style={styles.title}>Vote</Text>
      <Text style={styles.subtitle}>Choose the player you suspect.</Text>
      <Text style={styles.helper}>
        Category pool: {round.sourceCategories.join(' • ')}
      </Text>

      {round.voteProgress && (
        <Text style={styles.progress}>
          {round.voteProgress.submitted}/{round.voteProgress.total} votes submitted
        </Text>
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.voteList}>
        {availableTargets.map((player) => {
          const isSelected = selectedTargetId === player.id

          return (
            <Pressable
              key={player.id}
              style={[styles.voteCard, isSelected && styles.voteCardSelected]}
              onPress={() => setSelectedTargetId(player.id)}
            >
              <View style={styles.voteBadge}>
                <Text style={styles.voteBadgeText}>{player.name[0]?.toUpperCase()}</Text>
              </View>
              <View style={styles.voteCopy}>
                <Text style={styles.voteName}>{player.name}</Text>
                <Text style={styles.voteHint}>{isSelected ? 'Selected' : 'Tap to vote'}</Text>
              </View>
            </Pressable>
          )
        })}
      </View>

      <Pressable
        style={[styles.primaryButton, !selectedTargetId && styles.buttonDisabled]}
        onPress={() => {
          if (selectedTargetId) {
            void submitVote(selectedTargetId)
          }
        }}
        disabled={!selectedTargetId}
      >
        <Text style={styles.primaryButtonText}>
          {submittedVoteTargetId ? 'Update Vote' : 'Submit Vote'}
        </Text>
      </Pressable>

      {isHost ? (
        <Pressable
          style={[styles.secondaryButton, isBusy && styles.buttonDisabled]}
          onPress={() => {
            void finishRound()
          }}
          disabled={isBusy}
        >
          <Text style={styles.secondaryButtonText}>
            {isBusy
              ? 'Revealing…'
              : round.voteProgress &&
                  round.voteProgress.submitted >= round.voteProgress.total
                ? 'Reveal Results'
                : 'Reveal Anyway'}
          </Text>
        </Pressable>
      ) : (
        <Text style={styles.helper}>Waiting for the host to reveal the results…</Text>
      )}

      <RoomChatSheet />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    minHeight: '100%',
    alignItems: 'center',
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
  voteList: {
    width: '100%',
    maxWidth: 340,
    gap: 12,
  },
  voteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 16,
  },
  voteCardSelected: {
    borderColor: 'rgba(124,58,237,0.7)',
    backgroundColor: 'rgba(124,58,237,0.18)',
  },
  voteBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voteBadgeText: {
    color: '#fff',
    fontWeight: '700',
  },
  voteCopy: {
    gap: 4,
  },
  voteName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  voteHint: {
    color: '#94a3b8',
    fontSize: 12,
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
  secondaryButtonText: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.45,
  },
})
