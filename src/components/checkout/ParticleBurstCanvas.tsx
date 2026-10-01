import React, { useEffect, useRef } from 'react'

export const BURST_DURATION_MS = 1500

interface ParticleBurstCanvasProps {
  duration?: number
  className?: string
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  alpha: number
  decay: number
}

const BURST_COLORS = ['#8fb4ff', '#ffffff', '#60a5fa', '#a5b4fc', '#ffd180', '#38bdf8']

/**
 * Single celebratory particle burst canvas for successful course enrollment.
 * - Runs for 1500ms then cleanly halts.
 * - Completely suppressed if prefers-reduced-motion is active.
 * - Uses devicePixelRatio capped at 1.5.
 */
export const ParticleBurstCanvas: React.FC<ParticleBurstCanvasProps> = ({
  duration = BURST_DURATION_MS,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      return
    }

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let animationFrameId: number | null = null
    const startTime = performance.now()
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)

    const width = canvas.parentElement?.clientWidth || window.innerWidth
    const height = canvas.parentElement?.clientHeight || window.innerHeight

    canvas.width = Math.floor(width * dpr)
    canvas.height = Math.floor(height * dpr)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    // Center burst point (approx upper middle of the container)
    const originX = width / 2
    const originY = Math.min(height * 0.35, 220)

    // Initialize 70 particles
    const particleCount = 70
    const particles: Particle[] = []

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 6 + 2
      particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5, // slight upward bias
        size: Math.random() * 3 + 1.5,
        color: BURST_COLORS[Math.floor(Math.random() * BURST_COLORS.length)],
        alpha: 1,
        decay: Math.random() * 0.015 + 0.012,
      })
    }

    const render = (now: number) => {
      const elapsed = now - startTime
      if (elapsed > duration) {
        ctx.clearRect(0, 0, width, height)
        return
      }

      ctx.clearRect(0, 0, width, height)

      // Friction & gravity
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        p.vx *= 0.96
        p.vy *= 0.96
        p.vy += 0.12 // gravity
        p.alpha = Math.max(0, p.alpha - p.decay)

        if (p.alpha > 0) {
          ctx.save()
          ctx.globalAlpha = p.alpha
          ctx.fillStyle = p.color
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    animationFrameId = requestAnimationFrame(render)

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [duration])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 z-10 ${className}`}
    />
  )
}

export default ParticleBurstCanvas
