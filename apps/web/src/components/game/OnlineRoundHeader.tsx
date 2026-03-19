interface OnlineRoundHeaderProps {
  roundNumber: number
  phaseLabel: string
  categories: string[]
}

export function OnlineRoundHeader({
  roundNumber,
  phaseLabel,
  categories,
}: OnlineRoundHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="space-y-2">
        <p
          className="text-sm uppercase tracking-[0.25em]"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Round {roundNumber}
        </p>
        <h2 className="font-display text-4xl font-bold">{phaseLabel}</h2>
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map((category) => (
            <span
              key={category}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.18em] text-white/60"
            >
              {category}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
