import type { LobbyEvent } from '../../lib/online'

interface LobbyActivityFeedProps {
  events: LobbyEvent[]
}

function formatRelativeTime(timestamp: string) {
  const value = Date.parse(timestamp)
  if (Number.isNaN(value)) {
    return ''
  }

  const seconds = Math.max(0, Math.floor((Date.now() - value) / 1000))
  if (seconds < 10) return 'just now'
  if (seconds < 60) return `${seconds}s ago`

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  return `${hours}h ago`
}

export function LobbyActivityFeed({ events }: LobbyActivityFeedProps) {
  return (
    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-white/40">Room Activity</p>
          <h3 className="mt-1 font-display text-2xl font-bold">Live feed</h3>
        </div>
      </div>

      <div className="mt-4 flex max-h-64 flex-col gap-3 overflow-y-auto pr-1">
        {events.length === 0 ? (
          <div className="rounded-2xl border border-white/8 bg-black/10 px-4 py-4 text-sm text-white/45">
            Room events will appear here as people join, ready up, and start rounds.
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="rounded-2xl border border-white/8 bg-black/10 px-4 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm text-white/80">{event.message}</p>
                <span className="shrink-0 text-[11px] uppercase tracking-[0.16em] text-white/35">
                  {formatRelativeTime(event.createdAt)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
