import { useEffect, useMemo, useRef, useState } from 'react'
import { GlowButton } from '../ui/GlowButton'
import { useLobby } from '../../hooks/useLobby'
import { colorForPlayerId, emojiForPlayerId } from '../../lib/customization'
import { haptics } from '../../lib/haptics'

const REACTIONS = ['👍', '😂', '😬', '🔥', '👀', '❓'] as const

export function RoomChatPanel() {
  const {
    isHost,
    localPlayerId,
    round,
    messages,
    chatUnreadCount,
    markChatRead,
    sendMessage,
    toggleMessageReaction,
    deleteMessage,
  } = useLobby()
  const [isOpen, setIsOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [showAllHistory, setShowAllHistory] = useState(false)
  // Floating preview of the newest message, shown only while the panel is closed.
  const [preview, setPreview] = useState<{
    id: string
    playerId: string | null
    name: string
    body: string
  } | null>(null)
  const lastSeenMessageIdRef = useRef<string | null>(null)
  const hasBaselineRef = useRef(false)
  const previewTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // "Clear the chat each round": while a round is live, default to hiding chatter
  // from before it began. Nothing is deleted — "Show all" brings the history back.
  // A small negative buffer keeps a message sent the instant the round started.
  const roundStartedAt = round?.startedAt ?? null
  const visibleMessages = useMemo(() => {
    if (showAllHistory || !roundStartedAt) return messages
    const cutoff = new Date(roundStartedAt).getTime() - 1500
    if (Number.isNaN(cutoff)) return messages
    return messages.filter((message) => {
      const sentAt = new Date(message.createdAt).getTime()
      return Number.isNaN(sentAt) || sentAt >= cutoff
    })
  }, [messages, roundStartedAt, showAllHistory])
  const hiddenCount = messages.length - visibleMessages.length
  const reversedMessages = useMemo(() => [...visibleMessages].reverse(), [visibleMessages])

  useEffect(() => {
    if (isOpen) {
      markChatRead()
      setPreview(null)
    }
  }, [isOpen, markChatRead])

  // New-message alert: while the panel is closed, buzz + float a short preview so
  // players don't miss chatter mid-round. The first sighting of the list only sets a
  // baseline (pre-existing history must never fire an alert); after that we alert once
  // per genuinely new message from another player.
  useEffect(() => {
    const latest = messages[messages.length - 1]
    if (!latest) return

    if (!hasBaselineRef.current) {
      hasBaselineRef.current = true
      lastSeenMessageIdRef.current = latest.id
      return
    }

    if (latest.id === lastSeenMessageIdRef.current) return
    lastSeenMessageIdRef.current = latest.id

    const isMine = latest.playerId != null && latest.playerId === localPlayerId
    if (isOpen || isMine || latest.kind === 'system') return

    haptics.light()
    setPreview({
      id: latest.id,
      playerId: latest.playerId,
      name: latest.playerName ?? 'Player',
      body: latest.body,
    })
    if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current)
    previewTimeoutRef.current = setTimeout(() => setPreview(null), 4500)
  }, [messages, isOpen, localPlayerId])

  useEffect(() => {
    return () => {
      if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current)
    }
  }, [])

  function handleSend() {
    const message = draft.trim()
    if (!message) return
    setDraft('')
    void sendMessage(message)
  }

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="pointer-events-auto flex h-[70vh] w-[360px] max-w-[calc(100vw-2rem)] flex-col rounded-[28px] border border-white/10 bg-[#0f1020]/95 shadow-2xl backdrop-blur">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/35">Room Chat</p>
              <p className="text-sm text-white/55">
                {roundStartedAt && !showAllHistory ? 'This round' : 'Lobby + shared phases'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {roundStartedAt && (hiddenCount > 0 || showAllHistory) && (
                <button
                  type="button"
                  onClick={() => setShowAllHistory((current) => !current)}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70 transition hover:bg-white/10"
                >
                  {showAllHistory ? 'This round' : `Show all${hiddenCount > 0 ? ` (${hiddenCount})` : ''}`}
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70"
              >
                Close
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            {reversedMessages.length === 0 ? (
              <div className="flex h-full items-center justify-center px-6 text-center text-sm text-white/35">
                {roundStartedAt && !showAllHistory
                  ? 'No messages yet this round. Say something!'
                  : 'No messages yet. Say something!'}
              </div>
            ) : (
              <div className="flex flex-col-reverse gap-3">
                {reversedMessages.map((message) => {
                  const isSystem = message.kind === 'system'

                  if (isSystem) {
                    return (
                      <p
                        key={message.id}
                        className="mx-auto max-w-[90%] text-center text-xs text-white/40"
                      >
                        {message.body}
                      </p>
                    )
                  }

                  const isMine = message.playerId != null && message.playerId === localPlayerId
                  const color = colorForPlayerId(message.playerId)
                  const playerEmoji = emojiForPlayerId(message.playerId)

                  return (
                    <div
                      key={message.id}
                      className="flex"
                      style={{ justifyContent: isMine ? 'flex-end' : 'flex-start' }}
                    >
                      <div
                        className="max-w-[88%] rounded-2xl border p-3"
                        style={{
                          borderColor: `${color}59`,
                          borderLeft: `3px solid ${color}`,
                          background: `${color}1f`,
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p
                              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.15em]"
                              style={{ color }}
                            >
                              <span className="text-sm" aria-hidden>
                                {playerEmoji}
                              </span>
                              {isMine ? 'You' : message.playerName ?? 'Player'}
                            </p>
                            <p className="mt-1 text-sm text-white/85">{message.body}</p>
                          </div>
                          {isHost && message.kind === 'text' && (
                            <button
                              type="button"
                              onClick={() => {
                                void deleteMessage(message.id)
                              }}
                              className="rounded-full border border-red-400/25 px-2 py-1 text-[11px] text-red-200"
                            >
                              Delete
                            </button>
                          )}
                        </div>

                        {message.kind === 'text' && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {REACTIONS.map((emoji) => {
                              const reaction = message.reactions.find(
                                (item) => item.emoji === emoji,
                              )

                              return (
                                <button
                                  key={`${message.id}-${emoji}`}
                                  type="button"
                                  onClick={() => {
                                    void toggleMessageReaction(message.id, emoji)
                                  }}
                                  className="rounded-full border px-2 py-1 text-xs transition"
                                  style={{
                                    borderColor: reaction?.reactedByMe
                                      ? 'rgba(124,58,237,0.6)'
                                      : 'rgba(255,255,255,0.12)',
                                    background: reaction?.reactedByMe
                                      ? 'rgba(124,58,237,0.18)'
                                      : 'rgba(255,255,255,0.04)',
                                    color: reaction?.reactedByMe ? '#ddd6fe' : 'rgba(255,255,255,0.75)',
                                  }}
                                >
                                  {emoji} {reaction?.count ?? 0}
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="border-t border-white/10 p-4">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  handleSend()
                }
              }}
              maxLength={280}
              rows={3}
              placeholder="Message the room…  (Enter to send · Shift+Enter for a new line)"
              className="w-full resize-none rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition focus:border-accent"
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs text-white/40">{draft.trim().length}/280</p>
              <div className="w-[160px]">
                <GlowButton onClick={handleSend} disabled={!draft.trim()}>
                  Send
                </GlowButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isOpen && preview && (
        <button
          type="button"
          onClick={() => {
            setPreview(null)
            setIsOpen(true)
          }}
          className="pointer-events-auto flex w-[300px] max-w-[calc(100vw-2rem)] flex-col items-start gap-1 rounded-2xl border border-white/10 bg-[#0f1020]/95 px-4 py-3 text-left shadow-2xl backdrop-blur"
        >
          <span
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.15em]"
            style={{ color: colorForPlayerId(preview.playerId) }}
          >
            <span aria-hidden>{emojiForPlayerId(preview.playerId)}</span>
            {preview.name}
          </span>
          <span className="text-sm text-white/85">
            {preview.body.length > 90 ? `${preview.body.slice(0, 90)}…` : preview.body}
          </span>
        </button>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="pointer-events-auto rounded-full border border-accent/40 bg-accent/15 px-4 py-3 text-sm font-semibold text-accent-light shadow-lg"
      >
        Chat{chatUnreadCount > 0 ? ` (${chatUnreadCount})` : ''}
      </button>
    </div>
  )
}
