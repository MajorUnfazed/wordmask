import { useEffect, useRef } from 'react'

interface ConfettiProps {
  particleCount?: number
  colors?: string[]
  /** Set to true for a "sad" falling effect instead of burst */
  sad?: boolean
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  rotation: number
  rotationSpeed: number
  opacity: number
}

export function Confetti({ particleCount = 80, colors, sad = false }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const defaultColors = sad
    ? ['#ef4444', '#dc2626', '#991b1b', '#7f1d1d', '#fca5a5']
    : ['#a855f7', '#8b5cf6', '#ec4899', '#f59e0b', '#22c55e', '#3b82f6', '#f97316']

  const palette = colors ?? defaultColors

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const particles: Particle[] = []
    const w = rect.width
    const h = rect.height

    for (let i = 0; i < particleCount; i++) {
      const angle = sad ? (Math.random() * Math.PI * 0.4 + Math.PI * 0.3) : (Math.random() * Math.PI * 2)
      const speed = sad ? (Math.random() * 2 + 1) : (Math.random() * 8 + 4)
      particles.push({
        x: sad ? (Math.random() * w) : (w / 2),
        y: sad ? -20 : (h / 2),
        vx: Math.cos(angle) * speed,
        vy: sad ? (Math.random() * 2 + 1) : (Math.sin(angle) * speed - 3),
        size: Math.random() * 6 + 3,
        color: palette[Math.floor(Math.random() * palette.length)] ?? '#a855f7',
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: 1,
      })
    }

    let frame: number
    let elapsed = 0

    function animate() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, rect.width, rect.height)
      elapsed++

      let anyVisible = false
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.12 // gravity
        p.vx *= 0.99
        p.rotation += p.rotationSpeed
        if (elapsed > 40) p.opacity -= 0.015
        p.opacity = Math.max(0, p.opacity)

        if (p.opacity <= 0) continue
        anyVisible = true

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.globalAlpha = p.opacity
        ctx.fillStyle = p.color
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
        ctx.restore()
      }

      if (anyVisible) {
        frame = requestAnimationFrame(animate)
      }
    }

    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [particleCount, palette, sad])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50"
      style={{ width: '100vw', height: '100vh' }}
    />
  )
}
