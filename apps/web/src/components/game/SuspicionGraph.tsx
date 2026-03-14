// SuspicionGraph — visualises player suspicion levels in discussion phase
// Placeholder for future implementation using a radar/bar chart
import { GlassCard } from '../ui/GlassCard'

interface SuspicionGraphProps {
  players: Array<{ id: string; name: string }>
  suspicion: Record<string, number>
}

export function SuspicionGraph({ players, suspicion }: SuspicionGraphProps) {
  return (
    <GlassCard className="w-full p-4">
      <h3 className="font-display text-sm font-bold mb-3" style={{ color: 'var(--color-text-secondary)' }}>
        Suspicion
      </h3>
      <div className="flex flex-col gap-2">
        {players.map((p) => (
          <div key={p.id} className="flex items-center gap-2 text-xs">
            <span className="w-20 truncate">{p.name}</span>
            <div className="flex-1 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${suspicion[p.id] ?? 0}%`,
                  background: 'var(--color-danger)',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}
