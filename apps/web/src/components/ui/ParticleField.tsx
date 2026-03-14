import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  alpha: number
  size: number
  decay: number
}

/**
 * Canvas-based particle field rendered behind the game UI.
 * Creates a subtle ambient floating-dust effect.
 */
export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const particles: Particle[] = []

    function resize() {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    function spawnParticle(): Particle {
      return {
        x: Math.random() * (canvas?.width ?? window.innerWidth),
        y: (canvas?.height ?? window.innerHeight) + 10,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -(Math.random() * 0.6 + 0.2),
        alpha: Math.random() * 0.5 + 0.1,
        size: Math.random() * 2 + 1,
        decay: Math.random() * 0.003 + 0.001,
      }
    }

    function tick() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (particles.length < 60) particles.push(spawnParticle())

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]!
        p.x += p.vx
        p.y += p.vy
        p.alpha -= p.decay

        if (p.alpha <= 0) {
          particles.splice(i, 1)
          continue
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(168,85,247,${p.alpha})`
        ctx.fill()
      }

      animId = requestAnimationFrame(tick)
    }

    resize()
    window.addEventListener('resize', resize)
    tick()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0"
      aria-hidden="true"
      style={{ zIndex: 1 }}
    />
  )
}
