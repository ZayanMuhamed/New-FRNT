import React, { useEffect, useRef } from 'react'

export type CanvasState = 'idle' | 'focus' | 'error' | 'success'

interface BackgroundCanvasProps {
  role: 'student' | 'admin'
  canvasState: CanvasState
}

interface Particle {
  x: number
  y: number
  originDistance: number
  angle: number
  baseSpeed: number
  color: string
  radius: number
  alpha: number
  spiralArm: number
  radialOffset: number
}

interface OrbitDot {
  ringIndex: number
  angle: number
  speed: number
  radius: number
  alpha: number
  color: string
}

export const BackgroundCanvas: React.FC<BackgroundCanvasProps> = ({ role, canvasState }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 })
  const stateRef = useRef({
    role,
    canvasState,
    rippleProgress: 0, // 0 -> 1 during error
    rippleActive: false,
    successProgress: 0, // 0 -> 1 during success
    glowMultiplier: 1.0,
    speedMultiplier: 1.0,
  })

  // Synchronize refs
  useEffect(() => {
    stateRef.current.role = role
    stateRef.current.canvasState = canvasState

    if (canvasState === 'error') {
      stateRef.current.rippleActive = true
      stateRef.current.rippleProgress = 0
    }
  }, [role, canvasState])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let isVisible = !document.hidden
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Handle Resize & DPR
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    // Visibility change listener
    const onVisibilityChange = () => {
      isVisible = !document.hidden
      if (isVisible && !prefersReducedMotion && !animFrameRef.current) {
        animFrameRef.current = requestAnimationFrame(render)
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    // Mouse parallax
    const onMouseMove = (e: MouseEvent) => {
      const cx = width / 2
      const cy = height / 2
      mouseRef.current.targetX = (e.clientX - cx) * 0.04
      mouseRef.current.targetY = (e.clientY - cy) * 0.04
    }
    window.addEventListener('mousemove', onMouseMove)

    // Build Student Galaxy Particles
    const isMobile = width < 768
    const particleCount = isMobile ? 550 : 1250
    const particles: Particle[] = []
    const colors = [
      '#ffffff',
      '#eef4ff',
      '#8fb4ff',
      '#adc8ff',
      '#ffb766', // subtle orange
      '#ffd4a3',
    ]

    const maxRadius = Math.sqrt(width * width + height * height) * 0.55
    for (let i = 0; i < particleCount; i++) {
      const arm = i % 3
      const distPercent = Math.pow(Math.random(), 0.7) // higher density toward center
      const dist = distPercent * maxRadius + 15
      const baseAngle = (arm * (2 * Math.PI)) / 3 + distPercent * 4.2
      const spread = (Math.random() - 0.5) * (0.35 + distPercent * 0.45)
      const color =
        Math.random() < 0.07
          ? colors[4] // orange
          : Math.random() < 0.65
          ? colors[2] // blue accent
          : colors[0] // white

      particles.push({
        x: 0,
        y: 0,
        originDistance: dist,
        angle: baseAngle + spread,
        baseSpeed: (0.00035 / (distPercent + 0.15)) * (0.85 + Math.random() * 0.3),
        color,
        radius: Math.random() < 0.85 ? Math.random() * 1.3 + 0.5 : Math.random() * 2.1 + 1.2,
        alpha: Math.random() * 0.65 + 0.25,
        spiralArm: arm,
        radialOffset: 0,
      })
    }

    // Build Admin Rings & Orbit Dots
    const ringCount = 6
    const ringRadii = [70, 140, 220, 310, 420, 540]
    const orbitDots: OrbitDot[] = []
    for (let i = 0; i < 48; i++) {
      const ringIdx = Math.floor(Math.random() * ringCount)
      orbitDots.push({
        ringIndex: ringIdx,
        angle: Math.random() * Math.PI * 2,
        speed: (Math.random() * 0.003 + 0.001) * (ringIdx % 2 === 0 ? 1 : -1),
        radius: Math.random() * 1.6 + 1.0,
        alpha: Math.random() * 0.7 + 0.3,
        color: Math.random() < 0.7 ? '#ffb040' : '#fbf3e6',
      })
    }

    let errorStartTime: number | null = null
    let successStartTime: number | null = null

    // Render loop
    const render = (currentTime: number) => {
      if (!isVisible) return

      // Smooth mouse parallax
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05

      const { role: currentRole, canvasState: currentState } = stateRef.current

      // Target multipliers based on canvas state
      const targetGlow = currentState === 'focus' ? 1.7 : currentState === 'error' ? 0.8 : 1.0
      const targetSpeed = currentState === 'focus' ? 0.6 : 1.0 // slows 40%
      stateRef.current.glowMultiplier += (targetGlow - stateRef.current.glowMultiplier) * 0.08
      stateRef.current.speedMultiplier += (targetSpeed - stateRef.current.speedMultiplier) * 0.08

      // Error ripple progression (400ms duration)
      if (currentState === 'error') {
        if (!errorStartTime) errorStartTime = currentTime
        const elapsed = currentTime - errorStartTime
        const progress = Math.min(elapsed / 400, 1.0)
        // push outward and ease back
        stateRef.current.rippleProgress = Math.sin(progress * Math.PI)
        if (progress >= 1.0) {
          errorStartTime = null
        }
      } else {
        errorStartTime = null
        stateRef.current.rippleProgress = 0
      }

      // Success collapse progression (900ms duration)
      if (currentState === 'success') {
        if (!successStartTime) successStartTime = currentTime
        const elapsed = currentTime - successStartTime
        stateRef.current.successProgress = Math.min(elapsed / 900, 1.0)
      } else {
        successStartTime = null
        stateRef.current.successProgress = 0
      }

      // Clear Canvas
      ctx.clearRect(0, 0, width, height)

      const cx = width / 2 + mouseRef.current.x
      const cy = height / 2 + mouseRef.current.y

      if (currentRole === 'student') {
        // --- STUDENT GALAXY ---
        // Center soft glow
        const glowRadius = Math.min(width, height) * 0.38
        const glowGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowRadius)
        const glowAlpha = 0.22 * stateRef.current.glowMultiplier
        glowGradient.addColorStop(0, `rgba(143, 180, 255, ${glowAlpha})`)
        glowGradient.addColorStop(0.4, `rgba(80, 120, 220, ${glowAlpha * 0.4})`)
        glowGradient.addColorStop(1, 'rgba(4, 6, 13, 0)')

        ctx.fillStyle = glowGradient
        ctx.beginPath()
        ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2)
        ctx.fill()

        // Draw and update galaxy particles
        const rippleOffset = stateRef.current.rippleProgress * 50 // outward push on error
        const collapseFactor = 1 - Math.pow(stateRef.current.successProgress, 2) * 0.95 // ease to center on success

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i]
          if (!prefersReducedMotion) {
            p.angle += p.baseSpeed * stateRef.current.speedMultiplier
          }

          const currentDist = (p.originDistance + rippleOffset) * collapseFactor
          const px = cx + Math.cos(p.angle) * currentDist
          const py = cy + Math.sin(p.angle) * (currentDist * 0.72) // tilted perspective

          ctx.fillStyle = p.color
          ctx.globalAlpha = p.alpha * (currentState === 'success' ? 1 - stateRef.current.successProgress * 0.5 : 1)
          ctx.beginPath()
          ctx.arc(px, py, p.radius, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.globalAlpha = 1.0
      } else {
        // --- ADMIN TILTED CONCENTRIC RINGS ---
        // Center ambient warm glow
        const glowRadius = Math.min(width, height) * 0.32
        const glowGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowRadius)
        const glowAlpha = 0.18 * stateRef.current.glowMultiplier
        glowGradient.addColorStop(0, `rgba(255, 176, 64, ${glowAlpha})`)
        glowGradient.addColorStop(0.5, `rgba(180, 90, 20, ${glowAlpha * 0.3})`)
        glowGradient.addColorStop(1, 'rgba(11, 7, 4, 0)')

        ctx.fillStyle = glowGradient
        ctx.beginPath()
        ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2)
        ctx.fill()

        // Concentric rings
        const tiltX = 1.0
        const tiltY = 0.52
        const rippleR = stateRef.current.rippleProgress * 30
        const collapseR = 1 - Math.pow(stateRef.current.successProgress, 2) * 0.9

        ctx.save()
        for (let i = 0; i < ringRadii.length; i++) {
          const r = (ringRadii[i] + rippleR) * collapseR
          ctx.strokeStyle = `rgba(255, 176, 64, ${0.12 + (i % 2 === 0 ? 0.08 : 0.02)})`
          ctx.lineWidth = i === 1 || i === 3 ? 1.5 : 1

          if (i % 2 === 1) {
            ctx.setLineDash([8, 12])
          } else {
            ctx.setLineDash([])
          }

          ctx.beginPath()
          ctx.ellipse(cx, cy, r * tiltX, r * tiltY, -0.15, 0, Math.PI * 2)
          ctx.stroke()
        }
        ctx.restore()

        // Orbiting dots on rings
        for (let i = 0; i < orbitDots.length; i++) {
          const dot = orbitDots[i]
          if (!prefersReducedMotion) {
            dot.angle += dot.speed * stateRef.current.speedMultiplier
          }

          const baseR = (ringRadii[dot.ringIndex] + rippleR) * collapseR
          const angle = dot.angle
          const rotAngle = -0.15

          // Ellipse coordinate calculation with rotation
          const ex = Math.cos(angle) * (baseR * tiltX)
          const ey = Math.sin(angle) * (baseR * tiltY)
          const dx = ex * Math.cos(rotAngle) - ey * Math.sin(rotAngle)
          const dy = ex * Math.sin(rotAngle) + ey * Math.cos(rotAngle)

          ctx.fillStyle = dot.color
          ctx.globalAlpha = dot.alpha
          ctx.beginPath()
          ctx.arc(cx + dx, cy + dy, dot.radius, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.globalAlpha = 1.0
      }

      if (!prefersReducedMotion) {
        animFrameRef.current = requestAnimationFrame(render)
      }
    }

    if (prefersReducedMotion) {
      render(performance.now())
    } else {
      animFrameRef.current = requestAnimationFrame(render)
    }

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [role])

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-opacity duration-700">
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
      {role === 'admin' && <div className="admin-scanline" />}
    </div>
  )
}
