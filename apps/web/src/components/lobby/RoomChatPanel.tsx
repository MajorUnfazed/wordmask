import { useEffect, useMemo, useState } from 'react'
import { GlowButton } from '../ui/GlowButton'
import { useLobby } from '../../hooks/useLobby'

const REACTIONS = ['👍', '😂', '😬', '🔥', '👀', '❓'] as const

export function RoomChatPanel() {
  const {
    isHost,
    messages,
    chatUnreadCount,
    markChatRead,
    sendMessage,
    toggleMessageReaction,
    deleteMessage,
  } = useLobby()
  const [isOpen, setIsOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const reversedMessages = useMemo(() => [...messages].reverse(), [messages])

  useEffect(() => {
    if (isOpen) {
      markChatRead()
    }
  }, [isOpen, markChatRead])

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="pointer-events-auto flex h-[70vh] w-[360px] max-w-[calc(100vw-2rem)] flex-col rounded-[28px] border border-white/10 bg-[#0f1020]/95 shadow-2xl backdrop-blur">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/35">Room Chat</p>
              <p className="text-sm text-white/55">Lobby + shared phases</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70"
            >
              Close
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="flex flex-col-reverse gap-3">
              {reversedMessages.map((message) => (
                <div key={message.id} className="rounded-2xl border border-white/8 bg-white/5 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.15em] text-white/35">
                        {message.kind === 'system'
                          ? 'System'
                          : message.playerName ?? 'Player'}
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
              ))}
            </div>
          </div>

          <div className="border-t border-white/10 p-4">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              maxLength={280}
              rows={3}
              placeholder="Send a message to the room…"
              className="w-full resize-none rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition focus:border-accent"
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs text-white/40">{draft.trim().length}/280</p>
              <div className="w-[160px]">
                <GlowButton
                  onClick={() => {
                    const message = draft.trim()
                    if (!message) {
                      return
                    }

                    setDraft('')
                    void sendMessage(message)
                  }}
                  disabled={!draft.trim()}
                >
                  Send
                </GlowButton>
              </div>
            </div>
          </div>
        </div>
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
