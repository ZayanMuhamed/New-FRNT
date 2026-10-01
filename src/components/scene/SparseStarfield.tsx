import React, { useEffect, useRef } from 'react'

export interface StarfieldCanvasProps {
  particleCount?: number
  className?: string
}

interface Star {
  x: number
  y: number
  size: number
  baseAlpha: number
  alpha: number
  speedX: number
  speedY: number
  twinkleSpeed: number
  phase: number
  color: string
}

/**
 * Lightweight starfield canvas for the student dashboard.
 * - 200 slow particles on desktop (>= 768px), 80 on mobile (< 768px), averaging ~150.
 * - Paused cleanly when document is hidden (tab switched).
 * - Capped at 1.5 DPR for battery and GPU efficiency.
 * - Static frame rendering when prefers-reduced-motion is active.
 */
export const SparseStarfield: React.FC<StarfieldCanvasProps> = ({
  particleCount,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let animationFrameId: number | null = null
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let isReducedMotion = motionQuery.matches

    let width = window.innerWidth
    let height = window.innerHeight
    let stars: Star[] = []
    let isVisible = !document.hidden

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)

    // Palette: Crisp stellar whites with student accent blue (#8fb4ff) tints
    const starColors = ['#ffffff', '#f4f7ff', '#e6eeff', '#8fb4ff', '#b4ceff']

    // Determine target count: 200 on desktop (>=768px), 80 on mobile (<768px)
    const getTargetCount = (w: number) => {
      if (typeof particleCount === 'number') return particleCount
      return w >= 768 ? 200 : 80
    }

    const initStars = (w: number, h: number) => {
      const targetCount = getTargetCount(w)
      stars = []
      for (let i = 0; i < targetCount; i++) {
        const color = starColors[Math.floor(Math.random() * starColors.length)]
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          size: Math.random() * 1.4 + 0.4,
          baseAlpha: Math.random() * 0.5 + 0.25,
          alpha: Math.random() * 0.5 + 0.25,
          // Slow drifting particles
          speedX: (Math.random() - 0.5) * 0.045,
          speedY: (Math.random() - 0.5) * 0.045,
          twinkleSpeed: Math.random() * 0.015 + 0.005,
          phase: Math.random() * Math.PI * 2,
          color,
        })
      }

      // Expose for verification/testing
      if (typeof window !== 'undefined') {
        ;(window as unknown as { __starfieldParticleCount?: number }).__starfieldParticleCount = stars.length
      }
    }

    const updateDimensionsAndStars = () => {
      width = window.innerWidth
      height = window.innerHeight

      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      // Reset transform cleanly
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      initStars(width, height)
    }

    // Initialize dimensions and particles
    updateDimensionsAndStars()

    // Render single frame
    const drawFrame = () => {
      ctx.clearRect(0, 0, width, height)

      // Very soft celestial radial vignette in background
      const grad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.35,
        0,
        width * 0.5,
        height * 0.35,
        Math.max(width, height) * 0.65
      )
      grad.addColorStop(0, 'rgba(143, 180, 255, 0.03)')
      grad.addColorStop(0.65, 'rgba(4, 6, 13, 0.01)')
      grad.addColorStop(1, 'transparent')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, width, height)

      // Draw all stars
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i]

        if (!isReducedMotion) {
          star.x += star.speedX
          star.y += star.speedY
          star.phase += star.twinkleSpeed

          // Wrap edges smoothly
          if (star.x < 0) star.x = width
          if (star.x > width) star.x = 0
          if (star.y < 0) star.y = height
          if (star.y > height) star.y = 0

          star.alpha = Math.max(0.12, Math.min(0.9, star.baseAlpha + Math.sin(star.phase) * 0.18))
        }

        ctx.fillStyle = star.color
        ctx.globalAlpha = star.alpha
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.globalAlpha = 1.0
    }

    const handleResize = () => {
      updateDimensionsAndStars()
      if (isReducedMotion) {
        drawFrame()
      }
    }
    window.addEventListener('resize', handleResize)

    // Animation Loop
    const loop = () => {
      if (!isVisible || isReducedMotion) {
        animationFrameId = null
        if (typeof window !== 'undefined') {
          ;(window as unknown as { __starfieldIsRunning?: boolean }).__starfieldIsRunning = false
        }
        return
      }

      if (typeof window !== 'undefined') {
        ;(window as unknown as { __starfieldIsRunning?: boolean }).__starfieldIsRunning = true
      }

      drawFrame()
      animationFrameId = requestAnimationFrame(loop)
    }

    // Start loop or single frame
    if (isReducedMotion) {
      drawFrame()
    } else {
      animationFrameId = requestAnimationFrame(loop)
    }

    // Tab Visibility Handler: Pause when tab hidden, resume when visible
    const handleVisibilityChange = () => {
      const hidden = document.hidden
      isVisible = !hidden

      if (hidden) {
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId)
          animationFrameId = null
        }
        if (typeof window !== 'undefined') {
          ;(window as unknown as { __starfieldIsRunning?: boolean }).__starfieldIsRunning = false
        }
      } else {
        if (!isReducedMotion && animationFrameId === null) {
          animationFrameId = requestAnimationFrame(loop)
        }
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Reduced motion change listener
    const handleMotionChange = (e: MediaQueryListEvent) => {
      isReducedMotion = e.matches
      if (isReducedMotion) {
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId)
          animationFrameId = null
        }
        drawFrame()
      } else if (isVisible && animationFrameId === null) {
        animationFrameId = requestAnimationFrame(loop)
      }
    }

    if (typeof motionQuery.addEventListener === 'function') {
      motionQuery.addEventListener('change', handleMotionChange)
    } else {
      motionQuery.addListener(handleMotionChange)
    }

    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
      }
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (typeof motionQuery.removeEventListener === 'function') {
        motionQuery.removeEventListener('change', handleMotionChange)
      } else {
        motionQuery.removeListener(handleMotionChange)
      }
    }
  }, [particleCount])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none z-0 opacity-80 ${className}`}
    />
  )
}

// Named alias export for flexibility
export const StarfieldCanvas = SparseStarfield
export default SparseStarfield
