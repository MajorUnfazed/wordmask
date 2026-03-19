import { useMemo } from 'react'
import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { RoomChatSheet } from '../../components/RoomChatSheet'
import { useOnlineMultiplayer } from '../../hooks/useOnlineMultiplayer'

export default function LobbyRoomScreen() {
  const { code } = useLocalSearchParams<{ code: string }>()
  const {
    players,
    localPlayerId,
    localPlayer,
    isHost,
    status,
    pendingJoinRequests,
    error,
    isBusy,
    connectedPlayers,
    canModeratePlayers,
    canStartRound,
    selectedCategories,
    onlineCategoryOptions,
    setSelectedCategories,
    setReady,
    startGame,
    kickPlayer,
    reviewJoinRequest,
    repairPresence,
    leaveLobby,
  } = useOnlineMultiplayer(code)

  const showRepairButton = useMemo(
    () =>
      isHost &&
      players.some(
        (player) =>
          player.presenceStatus === 'away' || player.presenceStatus === 'reconnecting',
      ),
    [isHost, players],
  )

  function toggleCategory(category: string) {
    const nextCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((value) => value !== category)
      : [...selectedCategories, category]

    void setSelectedCategories(nextCategories)
  }

  function getPresenceText(presenceStatus: 'active' | 'reconnecting' | 'away') {
    switch (presenceStatus) {
      case 'away':
        return 'Away'
      case 'reconnecting':
        return 'Reconnecting'
      default:
        return 'Active'
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.codeCard}>
        <Text style={styles.codeLabel}>Room code</Text>
        <Text style={styles.code}>{(code ?? '').toUpperCase()}</Text>
        <Text style={styles.youLabel}>
          {status === 'playing'
            ? 'A round is in progress.'
            : 'Share the code and wait for everyone to join.'}
        </Text>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.playerList}>
        {players.map((player) => (
          <View key={player.id} style={styles.playerRow}>
            <View style={styles.playerLeft}>
              <View
                style={[
                  styles.playerBadge,
                  player.id === localPlayerId && styles.playerBadgeYou,
                ]}
              >
                <Text style={styles.playerBadgeText}>{player.name[0]?.toUpperCase()}</Text>
              </View>
              <Text style={styles.playerName}>
                {player.name}
                {player.id === localPlayerId ? ' (you)' : ''}
              </Text>
            </View>
            <View style={styles.playerTags}>
              {player.isHost && <Text style={styles.hostTag}>Host</Text>}
              <Text style={[styles.tag, player.isReady ? styles.tagReady : styles.tagMuted]}>
                {player.isReady ? 'Ready' : 'Not Ready'}
              </Text>
              <Text
                style={[
                  styles.tag,
                  player.presenceStatus === 'away'
                    ? styles.tagAway
                    : player.presenceStatus === 'reconnecting'
                      ? styles.tagReconnect
                      : styles.tagActive,
                ]}
              >
                {getPresenceText(player.presenceStatus)}
              </Text>
              {canModeratePlayers && player.id !== localPlayerId && !player.isHost && (
                <Pressable
                  style={styles.removeTag}
                  onPress={() => {
                    void kickPlayer(player.id)
                  }}
                >
                  <Text style={styles.removeTagText}>Remove</Text>
                </Pressable>
              )}
            </View>
          </View>
        ))}
      </View>

      {isHost && pendingJoinRequests.length > 0 && (
        <View style={styles.categoryCard}>
          <Text style={styles.sectionLabel}>Pending Rejoin Requests</Text>
          <View style={styles.pendingList}>
            {pendingJoinRequests.map((request) => (
              <View key={request.id} style={styles.pendingRow}>
                <View>
                  <Text style={styles.pendingName}>{request.requestedName}</Text>
                  <Text style={styles.pendingMeta}>Waiting for approval</Text>
                </View>
                <View style={styles.pendingActions}>
                  <Pressable
                    style={styles.pendingSecondary}
                    onPress={() => {
                      void reviewJoinRequest(request.id, 'deny')
                    }}
                  >
                    <Text style={styles.pendingSecondaryText}>Deny</Text>
                  </Pressable>
                  <Pressable
                    style={styles.pendingPrimary}
                    onPress={() => {
                      void reviewJoinRequest(request.id, 'approve')
                    }}
                  >
                    <Text style={styles.pendingPrimaryText}>Approve</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.categoryCard}>
        <Text style={styles.sectionLabel}>Round Categories</Text>
        <Text style={styles.sectionTitle}>
          {selectedCategories.length === 1
            ? selectedCategories[0]
            : `${selectedCategories.length} categories selected`}
        </Text>
        <Text style={styles.sectionText}>
          {isHost
            ? 'Pick one or more categories. The round word will be drawn from that combined pool.'
            : 'The host controls the category pool. Everyone can see the current selection.'}
        </Text>

        <View style={styles.categoryWrap}>
          {selectedCategories.map((category) => (
            <View key={category} style={styles.categoryChip}>
              <Text style={styles.categoryChipText}>{category}</Text>
            </View>
          ))}
        </View>

        {isHost && status === 'waiting' && (
          <View style={styles.categoryGrid}>
            {onlineCategoryOptions.map((category) => {
              const isSelected = selectedCategories.includes(category.engineCategory)

              return (
                <Pressable
                  key={category.id}
                  style={[
                    styles.categoryOption,
                    isSelected && styles.categoryOptionSelected,
                  ]}
                  onPress={() => toggleCategory(category.engineCategory)}
                >
                  <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                  <Text style={styles.categoryName}>{category.name}</Text>
                </Pressable>
              )
            })}
          </View>
        )}
      </View>

      {status === 'waiting' && localPlayer && (
        <View style={styles.statusCard}>
          <View style={styles.statusCopy}>
            <Text style={styles.sectionLabel}>Your Status</Text>
            <Text style={styles.sectionTitle}>
              {localPlayer.isReady ? 'Ready to Play' : 'Waiting for You'}
            </Text>
            <Text style={styles.sectionText}>
              Connected players: {connectedPlayers.length}. Everyone who is not away must be ready before the host can start.
            </Text>
          </View>

          <Pressable
            style={[
              styles.primaryButton,
              localPlayer.isReady && styles.secondaryButton,
            ]}
            onPress={() => {
              void setReady(!localPlayer.isReady)
            }}
          >
            <Text
              style={[
                styles.primaryButtonText,
                localPlayer.isReady && styles.secondaryButtonText,
              ]}
            >
              {localPlayer.isReady ? 'Not Ready' : 'Ready Up'}
            </Text>
          </Pressable>
        </View>
      )}

      <View style={styles.actions}>
        {isHost ? (
          <Pressable
            style={[
              styles.primaryButton,
              (!canStartRound || isBusy || status !== 'waiting') && styles.buttonDisabled,
            ]}
            onPress={() => {
              void startGame()
            }}
            disabled={!canStartRound || isBusy || status !== 'waiting'}
          >
            <Text style={styles.primaryButtonText}>
              {isBusy ? 'Starting…' : 'Start Countdown'}
            </Text>
          </Pressable>
        ) : (
          <Text style={styles.waiting}>
            {status === 'waiting'
              ? 'Waiting for the host to start the round…'
              : 'Joining the active round…'}
          </Text>
        )}

        {showRepairButton && (
          <Pressable
            style={styles.secondaryButton}
            onPress={() => {
              void repairPresence()
            }}
          >
            <Text style={styles.secondaryButtonText}>Repair Room</Text>
          </Pressable>
        )}

        <Pressable style={styles.secondaryButton} onPress={() => void leaveLobby()}>
          <Text style={styles.secondaryButtonText}>Leave Lobby</Text>
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
    gap: 24,
    padding: 24,
    backgroundColor: '#0A0A14',
  },
  codeCard: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    padding: 24,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.4)',
    gap: 8,
  },
  codeLabel: {
    color: '#94a3b8',
    fontSize: 12,
  },
  code: {
    fontSize: 40,
    fontWeight: '900',
    color: '#a855f7',
    letterSpacing: 8,
    fontFamily: 'serif',
  },
  youLabel: {
    color: '#cbd5e1',
    fontSize: 14,
    textAlign: 'center',
  },
  error: {
    width: '100%',
    maxWidth: 360,
    color: '#fca5a5',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    backgroundColor: 'rgba(239,68,68,0.08)',
    padding: 16,
    overflow: 'hidden',
  },
  playerList: {
    width: '100%',
    maxWidth: 360,
    gap: 12,
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  playerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playerBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerBadgeYou: {
    backgroundColor: '#7c3aed',
  },
  playerBadgeText: {
    color: '#fff',
    fontWeight: '700',
  },
  playerName: {
    color: '#f8fafc',
    fontSize: 15,
  },
  playerTags: {
    alignItems: 'flex-end',
    gap: 6,
  },
  removeTag: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  removeTagText: {
    color: '#fecaca',
    fontSize: 11,
    fontWeight: '700',
  },
  hostTag: {
    color: '#c4b5fd',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  tag: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
  tagReady: {
    color: '#86efac',
    backgroundColor: 'rgba(34,197,94,0.16)',
  },
  tagMuted: {
    color: '#cbd5e1',
    backgroundColor: 'rgba(148,163,184,0.16)',
  },
  tagActive: {
    color: '#86efac',
    backgroundColor: 'rgba(34,197,94,0.16)',
  },
  tagReconnect: {
    color: '#fde68a',
    backgroundColor: 'rgba(234,179,8,0.16)',
  },
  tagAway: {
    color: '#fca5a5',
    backgroundColor: 'rgba(239,68,68,0.16)',
  },
  categoryCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 18,
    gap: 12,
  },
  sectionLabel: {
    color: '#94a3b8',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: '900',
    fontFamily: 'serif',
  },
  sectionText: {
    color: '#94a3b8',
    lineHeight: 20,
  },
  categoryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.35)',
    backgroundColor: 'rgba(124,58,237,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  categoryChipText: {
    color: '#ddd6fe',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pendingList: {
    gap: 10,
  },
  pendingRow: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(0,0,0,0.12)',
    padding: 14,
    gap: 12,
  },
  pendingName: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '700',
  },
  pendingMeta: {
    color: '#94a3b8',
    marginTop: 4,
  },
  pendingActions: {
    flexDirection: 'row',
    gap: 10,
  },
  pendingPrimary: {
    flex: 1,
    backgroundColor: '#7c3aed',
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  pendingPrimaryText: {
    color: '#fff',
    fontWeight: '700',
  },
  pendingSecondary: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 10,
    alignItems: 'center',
  },
  pendingSecondaryText: {
    color: '#e2e8f0',
    fontWeight: '600',
  },
  categoryOption: {
    width: '47%',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 14,
    gap: 8,
  },
  categoryOptionSelected: {
    borderColor: 'rgba(124,58,237,0.7)',
    backgroundColor: 'rgba(124,58,237,0.18)',
  },
  categoryEmoji: {
    fontSize: 18,
  },
  categoryName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  statusCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 18,
    gap: 16,
  },
  statusCopy: {
    gap: 6,
  },
  actions: {
    width: '100%',
    maxWidth: 360,
    gap: 12,
  },
  waiting: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
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
  buttonDisabled: {
    opacity: 0.45,
  },
})
