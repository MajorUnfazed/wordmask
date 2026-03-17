import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export function AuroraBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = window.innerWidth
    let h = window.innerHeight
    canvas.width = w
    canvas.height = h

    const orbs = [
      { x: w * 0.2, y: h * 0.3, r: Math.max(w, h) * 0.6, color: 'rgba(124, 58, 237, 0.15)', vx: 0.2, vy: -0.1 }, // Purple
      { x: w * 0.8, y: h * 0.2, r: Math.max(w, h) * 0.5, color: 'rgba(56, 189, 248, 0.12)', vx: -0.15, vy: 0.2 }, // Blue
      { x: w * 0.5, y: h * 0.8, r: Math.max(w, h) * 0.55, color: 'rgba(232, 121, 249, 0.1)', vx: 0.1, vy: -0.15 }, // Magenta
    ]

    let frameId: number

    function animate() {
      ctx!.clearRect(0, 0, w, h)
      
      // Draw deepest void background
      ctx!.fillStyle = '#030308'
      ctx!.fillRect(0, 0, w, h)

      // Update and draw orbs
      orbs.forEach(orb => {
        orb.x += orb.vx
        orb.y += orb.vy

        // Gentle boundary bounce
        if (orb.x < -w * 0.2 || orb.x > w * 1.2) orb.vx *= -1
        if (orb.y < -h * 0.2 || orb.y > h * 1.2) orb.vy *= -1

        const gradient = ctx!.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r)
        gradient.addColorStop(0, orb.color)
        gradient.addColorStop(1, 'rgba(0,0,0,0)')

        ctx!.fillStyle = gradient
        ctx!.fillRect(0, 0, w, h)
      })

      frameId = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w
      canvas.height = h
      // Recalculate radii on resize safely
      if (orbs[0]) orbs[0].r = Math.max(w, h) * 0.6
      if (orbs[1]) orbs[1].r = Math.max(w, h) * 0.5
      if (orbs[2]) orbs[2].r = Math.max(w, h) * 0.55
    }

    window.addEventListener('resize', handleResize)
    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <canvas ref={canvasRef} className="absolute inset-0" />
      {/* Heavy blur overlay to create the frosted aurora effect */}
      <div className="absolute inset-0 backdrop-blur-[60px]" />
    </div>
  )
}
