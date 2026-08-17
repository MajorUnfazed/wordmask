/**
 * MaskEmblem — inline-SVG approximation of the concept's hero illustration:
 * a hooded figure wearing a glowing mask, set inside a faint concentric "tech ring".
 *
 * Pure SVG (no external asset) so it ships in-bundle and inherits the cyberpunk
 * palette. Decorative only — hidden from assistive tech.
 */
interface MaskEmblemProps {
  className?: string
  size?: number
}

export function MaskEmblem({ className = '', size = 148 }: MaskEmblemProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="me-glow" cx="50%" cy="46%" r="55%">
          <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.4" />
          <stop offset="55%" stopColor="#22d3ee" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="me-hood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#242850" />
          <stop offset="100%" stopColor="#0a0b18" />
        </linearGradient>
        <linearGradient id="me-face" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#b8c2d4" />
        </linearGradient>
      </defs>

      {/* concentric tech rings */}
      <g stroke="#22d3ee" fill="none">
        <circle cx="60" cy="58" r="54" strokeWidth="1" opacity="0.28" />
        <circle cx="60" cy="58" r="45" strokeWidth="0.75" opacity="0.5" strokeDasharray="2 6" />
        <circle cx="60" cy="58" r="59" strokeWidth="0.75" opacity="0.16" />
      </g>
      {/* ring tick accents */}
      <g stroke="#67e8f9" strokeWidth="2" strokeLinecap="round" opacity="0.7">
        <line x1="60" y1="1" x2="60" y2="8" />
        <line x1="113" y1="58" x2="106" y2="58" />
        <line x1="7" y1="58" x2="14" y2="58" />
      </g>

      {/* soft glow behind the head */}
      <ellipse cx="60" cy="54" rx="36" ry="40" fill="url(#me-glow)" />

      {/* hood */}
      <path
        d="M60 13 C39 13 29 30 28 53 C27 71 33 85 35 98 L85 98 C87 85 93 71 92 53 C91 30 81 13 60 13 Z"
        fill="url(#me-hood)"
        stroke="#22d3ee"
        strokeOpacity="0.45"
        strokeWidth="1"
      />
      {/* dark hood opening */}
      <path
        d="M60 25 C45 25 39 40 39 57 C39 76 49 90 60 92 C71 90 81 76 81 57 C81 40 75 25 60 25 Z"
        fill="#07080f"
      />

      {/* mask face */}
      <path
        d="M60 33 C49 33 44 44 44 57 C44 74 53 86 60 88 C67 86 76 74 76 57 C76 44 71 33 60 33 Z"
        fill="url(#me-face)"
      />

      {/* glowing eyes */}
      <g fill="#22d3ee" style={{ filter: 'drop-shadow(0 0 4px #22d3ee)' }}>
        <ellipse cx="53" cy="58" rx="5.6" ry="2.7" transform="rotate(22 53 58)" />
        <ellipse cx="67" cy="58" rx="5.6" ry="2.7" transform="rotate(-22 67 58)" />
      </g>
    </svg>
  )
}
