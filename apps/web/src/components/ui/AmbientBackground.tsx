import './AmbientBackground.css'

/**
 * AmbientBackground — a clean, near-flat deep-navy backdrop matching concept.png.
 *
 * Deliberately minimal: a solid deep navy (~#060b27) with a whisper of a
 * vertical gradient plus one faint indigo lift near the top for a hint of depth.
 * No floating particles, blueprint grid, or drifting orbs — the concept
 * background is essentially a flat navy, so the theme stays simple.
 *
 * Sits at z-index 0; app content goes above it.
 */
export function AmbientBackground() {
  return (
    <div className="ambient-bg" aria-hidden="true">
      <div className="ambient-base" />
    </div>
  )
}
