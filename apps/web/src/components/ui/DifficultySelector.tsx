import type { Difficulty } from '@impostor/core'

/**
 * Three-tier segmented control for hint difficulty. The order matches the
 * authored hint triple (Cryptic → Balanced → Revealing), and the copy is framed
 * around "how much the impostor's clue reveals" — a more Revealing hint is
 * easier for the impostor, which is the opposite of intuitive "harder", so we
 * describe reveal, not difficulty. See packages/core/src/packs/HINT_RUBRIC.md.
 */
const TIERS: Array<{ value: Difficulty; label: string; blurb: string }> = [
  {
    value: 'CRYPTIC',
    label: 'Cryptic',
    blurb: 'Oblique but true. The impostor has to work to blend in.',
  },
  {
    value: 'BALANCED',
    label: 'Balanced',
    blurb: 'A fair foothold — a shared trait. The calibrated default.',
  },
  {
    value: 'REVEALING',
    label: 'Revealing',
    blurb: 'A strong, near-unique tie. The impostor can bluff confidently.',
  },
]

export function DifficultySelector({
  value,
  onChange,
  className = '',
}: {
  value: Difficulty
  onChange: (difficulty: Difficulty) => void
  className?: string
}) {
  const active = TIERS.find((tier) => tier.value === value) ?? TIERS[1]!

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="grid grid-cols-3 gap-2">
        {TIERS.map((tier) => {
          const isSelected = tier.value === value
          return (
            <button
              key={tier.value}
              type="button"
              onClick={() => onChange(tier.value)}
              className="rounded-2xl border px-3 py-3 text-center transition"
              style={{
                borderColor: isSelected ? 'rgba(124,58,237,0.7)' : 'rgba(255,255,255,0.08)',
                background: isSelected ? 'rgba(124,58,237,0.18)' : 'rgba(255,255,255,0.03)',
                boxShadow: isSelected ? '0 0 0 1px rgba(124,58,237,0.35)' : 'none',
              }}
            >
              <div className="text-sm font-semibold text-white">{tier.label}</div>
              {tier.value === 'BALANCED' && (
                <div className="mt-0.5 text-[10px] uppercase tracking-wide text-white/40">Default</div>
              )}
            </button>
          )
        })}
      </div>
      <p className="text-xs text-white/50">{active.blurb}</p>
    </div>
  )
}
