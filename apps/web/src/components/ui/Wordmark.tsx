/**
 * Wordmark — the stylized "WORDMASK" logo.
 *
 * Two looks:
 *   - `split`    (default): WORD in white + MASK in glowing cyan — the hero logo.
 *   - `terminal`         : a leading underscore "cursor" + the whole word in cyan,
 *                          echoing the `_WORDMASK` command-prompt treatment used in
 *                          the concept's compact header.
 * Size is controlled by the parent's font-size via `className`.
 */
interface WordmarkProps {
  className?: string
  variant?: 'split' | 'terminal'
}

export function Wordmark({ className = 'text-5xl sm:text-6xl', variant = 'split' }: WordmarkProps) {
  if (variant === 'terminal') {
    return (
      <h1
        className={`font-wordmark font-black uppercase leading-none tracking-tight text-cyan ${className}`}
        aria-label="WordMask"
        style={{ textShadow: '0 0 18px var(--color-cyan-glow), 0 0 44px var(--color-cyan-glow)' }}
      >
        <span className="text-cyan/70">_</span>WORDMASK
      </h1>
    )
  }

  return (
    <h1
      className={`font-wordmark font-black uppercase leading-none tracking-tight ${className}`}
      aria-label="WordMask"
    >
      <span className="text-white">WORD</span>
      <span
        className="text-cyan"
        style={{ textShadow: '0 0 18px var(--color-cyan-glow), 0 0 40px var(--color-cyan-glow)' }}
      >
        MASK
      </span>
    </h1>
  )
}
