import { useEffect, useMemo, useState } from 'react'
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useOnlineMultiplayer } from '../hooks/useOnlineMultiplayer'

const REACTIONS = ['👍', '😂', '😬', '🔥', '👀', '❓'] as const

export function RoomChatSheet() {
  const {
    isHost,
    messages,
    chatUnreadCount,
    markChatRead,
    sendMessage,
    toggleMessageReaction,
    deleteMessage,
  } = useOnlineMultiplayer()
  const [isOpen, setIsOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const reversedMessages = useMemo(() => [...messages].reverse(), [messages])

  useEffect(() => {
    if (isOpen) {
      markChatRead()
    }
  }, [isOpen, markChatRead])

  return (
    <>
      <Pressable style={styles.fab} onPress={() => setIsOpen(true)}>
        <Text style={styles.fabText}>Chat{chatUnreadCount > 0 ? ` (${chatUnreadCount})` : ''}</Text>
      </Pressable>

      <Modal visible={isOpen} transparent animationType="slide" onRequestClose={() => setIsOpen(false)}>
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setIsOpen(false)} />
          <View style={styles.sheet}>
            <View style={styles.header}>
              <View>
                <Text style={styles.label}>Room Chat</Text>
                <Text style={styles.subLabel}>Lobby + shared phases</Text>
              </View>
              <Pressable style={styles.closeButton} onPress={() => setIsOpen(false)}>
                <Text style={styles.closeText}>Close</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.messages} contentContainerStyle={styles.messagesContent}>
              {reversedMessages.map((message) => (
                <View key={message.id} style={styles.messageCard}>
                  <View style={styles.messageHeader}>
                    <Text style={styles.messageAuthor}>
                      {message.kind === 'system' ? 'System' : message.playerName || 'Player'}
                    </Text>
                    {isHost && message.kind === 'text' && (
                      <Pressable
                        style={styles.deleteButton}
                        onPress={() => {
                          void deleteMessage(message.id)
                        }}
                      >
                        <Text style={styles.deleteText}>Delete</Text>
                      </Pressable>
                    )}
                  </View>
                  <Text style={styles.messageBody}>{message.body}</Text>

                  {message.kind === 'text' && (
                    <View style={styles.reactionRow}>
                      {REACTIONS.map((emoji) => {
                        const reaction = message.reactions.find((item) => item.emoji === emoji)
                        return (
                          <Pressable
                            key={`${message.id}-${emoji}`}
                            style={[
                              styles.reactionChip,
                              reaction?.reactedByMe && styles.reactionChipActive,
                            ]}
                            onPress={() => {
                              void toggleMessageReaction(message.id, emoji)
                            }}
                          >
                            <Text
                              style={[
                                styles.reactionText,
                                reaction?.reactedByMe && styles.reactionTextActive,
                              ]}
                            >
                              {emoji} {reaction?.count ?? 0}
                            </Text>
                          </Pressable>
                        )
                      })}
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>

            <View style={styles.composer}>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                maxLength={280}
                multiline
                placeholder="Send a message to the room…"
                placeholderTextColor="#64748b"
                style={styles.input}
              />
              <View style={styles.composeFooter}>
                <Text style={styles.counter}>{draft.trim().length}/280</Text>
                <Pressable
                  style={[styles.sendButton, !draft.trim() && styles.disabledButton]}
                  disabled={!draft.trim()}
                  onPress={() => {
                    const message = draft.trim()
                    if (!message) {
                      return
                    }
                    setDraft('')
                    void sendMessage(message)
                  }}
                >
                  <Text style={styles.sendText}>Send</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    zIndex: 40,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.35)',
    backgroundColor: 'rgba(124,58,237,0.16)',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  fabText: {
    color: '#ddd6fe',
    fontWeight: '700',
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    maxHeight: '78%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: '#111225',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: '#94a3b8',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  subLabel: {
    color: '#cbd5e1',
    marginTop: 4,
  },
  closeButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  closeText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
  },
  messages: {
    flexGrow: 0,
  },
  messagesContent: {
    gap: 10,
    paddingBottom: 8,
  },
  messageCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 12,
    gap: 10,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageAuthor: {
    color: '#94a3b8',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  messageBody: {
    color: '#f8fafc',
    lineHeight: 20,
  },
  reactionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reactionChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  reactionChipActive: {
    borderColor: 'rgba(124,58,237,0.7)',
    backgroundColor: 'rgba(124,58,237,0.18)',
  },
  reactionText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
  },
  reactionTextActive: {
    color: '#ddd6fe',
  },
  deleteButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  deleteText: {
    color: '#fecaca',
    fontSize: 12,
  },
  composer: {
    gap: 10,
    paddingTop: 4,
  },
  input: {
    minHeight: 80,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#f8fafc',
    textAlignVertical: 'top',
  },
  composeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  counter: {
    color: '#64748b',
    fontSize: 12,
  },
  sendButton: {
    borderRadius: 999,
    backgroundColor: '#7c3aed',
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  sendText: {
    color: '#fff',
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.45,
  },
})
