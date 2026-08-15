import { useEffect, useRef } from 'react'
import { useUIStore } from '../../store/uiStore'

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

    // Reduce velocity on touch devices (mobile battery saving)
    const isTouchDevice = window.matchMedia('(hover: none)').matches
    const velocityScale = isTouchDevice ? 0.5 : 1

    const orbs = [
      { x: w * 0.2, y: h * 0.3, r: Math.max(w, h) * 0.6, baseColor: [124, 58, 237] as const, baseOpacity: 0.15, vx: 0.2 * velocityScale, vy: -0.1 * velocityScale },
      { x: w * 0.8, y: h * 0.2, r: Math.max(w, h) * 0.5, baseColor: [56, 189, 248] as const, baseOpacity: 0.12, vx: -0.15 * velocityScale, vy: 0.2 * velocityScale },
      { x: w * 0.5, y: h * 0.8, r: Math.max(w, h) * 0.55, baseColor: [232, 121, 249] as const, baseOpacity: 0.1, vx: 0.1 * velocityScale, vy: -0.15 * velocityScale },
    ]

    let frameId: number
    let isActive = true
    let frameCount = 0

    function animate() {
      if (!isActive) return

      frameId = requestAnimationFrame(animate)

      // Skip every other frame (~30fps from 60fps) to save battery
      frameCount++
      if (frameCount % 2 !== 0) return

      ctx!.clearRect(0, 0, w, h)

      // Tension scaling effects
      const tension = useUIStore.getState().tension
      const tensionMultiplier = 1 + (tension * 5)
      const targetRgb = [220, 38, 38] as const

      ctx!.fillStyle = '#030308'
      ctx!.fillRect(0, 0, w, h)

      orbs.forEach(orb => {
        orb.x += orb.vx * tensionMultiplier
        orb.y += orb.vy * tensionMultiplier

        if (orb.x < -w * 0.2 || orb.x > w * 1.2) orb.vx *= -1
        if (orb.y < -h * 0.2 || orb.y > h * 1.2) orb.vy *= -1

        const r = Math.round(orb.baseColor[0] + (targetRgb[0] - orb.baseColor[0]) * tension)
        const g = Math.round(orb.baseColor[1] + (targetRgb[1] - orb.baseColor[1]) * tension)
        const b = Math.round(orb.baseColor[2] + (targetRgb[2] - orb.baseColor[2]) * tension)

        const pulse = tension > 0 ? Math.sin(Date.now() / 150) * 0.08 * tension : 0
        const opacity = orb.baseOpacity + pulse + (tension * 0.1)

        const gradient = ctx!.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r)
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${opacity})`)
        gradient.addColorStop(1, 'rgba(0,0,0,0)')

        ctx!.fillStyle = gradient
        ctx!.fillRect(0, 0, w, h)
      })
    }

    function handleVisibility() {
      if (document.visibilityState === 'visible') {
        if (!isActive) {
          isActive = true
          animate()
        }
      } else {
        isActive = false
        cancelAnimationFrame(frameId)
      }
    }

    const handleResize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w
      canvas.height = h
      if (orbs[0]) orbs[0].r = Math.max(w, h) * 0.6
      if (orbs[1]) orbs[1].r = Math.max(w, h) * 0.5
      if (orbs[2]) orbs[2].r = Math.max(w, h) * 0.55
    }

    animate()
    window.addEventListener('resize', handleResize)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      isActive = false
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('visibilitychange', handleVisibility)
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
