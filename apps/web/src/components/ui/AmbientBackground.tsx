import './AmbientBackground.css'

/**
 * AmbientBackground — full-screen layered background.
 *
 * Layers (back → front):
 *   1. Radial gradient base  — dark void with purple/blue tones
 *   2. Slow-drift gradient orbs — two large soft blobs
 *   3. CSS-animated particles  — ~30 tiny glowing dots
 *
 * Everything is pure CSS: no Framer Motion, no canvas.
 * Sits at z-index 0; app content goes above it.
 */

const PARTICLE_COUNT = 30

/** Deterministic pseudo-random using a seeded LCG so values are stable across renders */
function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

interface ParticleStyle {
  left: string
  top: string
  width: string
  height: string
  opacity: number
  animationName: string
  animationDuration: string
  animationDelay: string
  background: string
}

function buildParticles(): ParticleStyle[] {
  const rand = seededRand(42)

  const palettes = [
    'rgba(124,58,237,VAL)',   // accent purple
    'rgba(168,85,247,VAL)',   // accent-light purple
    'rgba(59,130,246,VAL)',   // blue
    'rgba(239,68,68,VAL)',    // danger red (rare)
  ]

  const animations = ['ambient-float-a', 'ambient-float-b', 'ambient-float-c']

  return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    const r = rand
    const size = 2 + r() * 3
    const paletteIdx = i < 25
      ? Math.floor(r() * 3)
      : 3
    const alpha = 0.25 + r() * 0.45
    const color = (palettes[paletteIdx] ?? palettes[0]!).replace('VAL', alpha.toFixed(2))

    return {
      left: `${(r() * 100).toFixed(2)}%`,
      top: `${(r() * 110 - 5).toFixed(2)}%`,
      width: `${size.toFixed(1)}px`,
      height: `${size.toFixed(1)}px`,
      opacity: 0.6 + r() * 0.4,
      animationName: animations[Math.floor(r() * animations.length)] ?? 'ambient-float-a',
      animationDuration: `${(18 + r() * 22).toFixed(1)}s`,
      animationDelay: `${-(r() * 20).toFixed(1)}s`,
      background: color,
    }
  })
}

const particles = buildParticles()

export function AmbientBackground() {
  return (
    <div className="ambient-bg" aria-hidden="true">
      {/* Layer 1: radial gradient base */}
      <div className="ambient-gradient-base" />

      {/* Layer 2: slowly drifting soft orbs */}
      <div className="ambient-orb ambient-orb--purple" />
      <div className="ambient-orb ambient-orb--blue" />
      <div className="ambient-orb ambient-orb--red" />

      {/* Layer 3: floating particles */}
      <div className="ambient-particles">
        {particles.map((style, i) => (
          <div
            key={i}
            className="ambient-particle"
            style={style}
          />
        ))}
      </div>
    </div>
  )
}
