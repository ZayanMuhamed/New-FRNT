import React, { useEffect, useRef } from 'react'

export type OrbitState = 'idle' | 'focus' | 'error' | 'success'
// Export aliases for flexible drop-in compatibility with GalaxyCanvas / CanvasState
export type OrbitRingsState = OrbitState
export type GalaxyState = OrbitState

export interface OrbitRingsProps {
  state: OrbitState
  onSuccessDone?: () => void
  className?: string
}

interface OrbitDot {
  ringIndex: number
  angle: number
  speed: number
  radius: number
  alpha: number
  color: string
}

export const OrbitRings: React.FC<OrbitRingsProps> = ({
  state,
  onSuccessDone,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 })

  // Props reference for animation loop
  const propsRef = useRef({ state, onSuccessDone })
  useEffect(() => {
    propsRef.current = { state, onSuccessDone }
  }, [state, onSuccessDone])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let isReducedMotion = motionMediaQuery.matches

    // DPR capped at 1.5 for crisp rendering and optimal performance
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    let width = window.innerWidth
    let height = window.innerHeight

    const updateCanvasDimensions = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    updateCanvasDimensions()



    // Palette: Rich tactical ambers, warm golds, and bright starlight accents
    const amberColors = ['#ffb040', '#ffa033', '#ffd294', '#fbf3e6', '#ffc266']

    // 6 Concentric Rings configuration
    const ringCount = 6
    const ringDashPatterns: number[][] = [
      [],          // Ring 0: Solid inner core ring
      [6, 10],     // Ring 1: Tech dashes
      [],          // Ring 2: Solid fine ring
      [14, 16],    // Ring 3: Wide dashed orbital ring
      [],          // Ring 4: Solid containment ring
      [8, 14],     // Ring 5: Outer telemetry ring
    ]

    const ringWidths = [1.2, 1.0, 1.5, 1.0, 1.2, 1.0]

    // Orbiting dots pool (52 dots pool; rendered as 52 desktop, 26 mobile)
    const maxDots = 52
    const orbitDots: OrbitDot[] = []

    for (let i = 0; i < maxDots; i++) {
      const ringIdx = i % ringCount
      // Alternating orbital directions with faster inner orbits
      const direction = ringIdx % 2 === 0 ? 1 : -1
      const baseSpeed = (0.0018 / Math.pow(ringIdx + 1, 0.45)) * (0.8 + Math.random() * 0.4)
      const color = amberColors[Math.floor(Math.random() * amberColors.length)]

      orbitDots.push({
        ringIndex: ringIdx,
        angle: Math.random() * Math.PI * 2,
        speed: baseSpeed * direction,
        radius: Math.random() < 0.2 ? Math.random() * 1.4 + 1.8 : Math.random() * 1.0 + 1.0,
        alpha: Math.random() * 0.55 + 0.35,
        color,
      })
    }

    // Geometry: Tilted elliptical orbital plane
    const tiltAngle = -0.32 // ~18.3 degrees tilt
    const cosTilt = Math.cos(tiltAngle)
    const sinTilt = Math.sin(tiltAngle)
    const yAspect = 0.54 // Elliptical projection depth

    // Animation state controllers with smooth continuous easing
    let currentGlow = 1.0
    let currentSpeed = 1.0
    let lastState: OrbitState = propsRef.current.state

    let errorStartTime: number | null = null
    let successStartTime: number | null = null
    let successDoneTriggered = false

    // Slow scan line tracking
    let scanLineY = 0
    const scanLineDuration = 7500 // 7.5 seconds for complete top-to-bottom pass

    let lastFrameTime = performance.now()

    // Render loop
    const render = (time: number) => {
      if (document.hidden) {
        animFrameRef.current = null
        return
      }

      // Measure delta time (dt) for framerate-independent easing
      const dt = Math.min(Math.max((time - lastFrameTime) / 1000, 0.001), 0.1)
      lastFrameTime = time

      // Mouse parallax smooth lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05

      // Orbital center with parallax offset
      const cx = width / 2 + mouseRef.current.x
      const cy = height / 2 + mouseRef.current.y

      // State transitions detection
      const activeState = propsRef.current.state
      if (activeState !== lastState) {
        if (activeState === 'error') {
          errorStartTime = time
        }
        if (activeState === 'success') {
          successStartTime = time
          successDoneTriggered = false
        }
        lastState = activeState
      }

      // 1. Focus state easing:
      // Focus: center glow brightens (x1.85), orbit slows 40% (x0.60)
      const targetGlow =
        activeState === 'focus'
          ? 1.85
          : activeState === 'error'
          ? 1.2
          : activeState === 'success'
          ? 2.4
          : 1.0

      const targetSpeed = activeState === 'focus' ? 0.6 : 1.0 // slows 40%

      const glowLerpFactor = 1 - Math.exp(-dt * 5.5)
      const speedLerpFactor = 1 - Math.exp(-dt * 5.0)
      currentGlow += (targetGlow - currentGlow) * glowLerpFactor
      currentSpeed += (targetSpeed - currentSpeed) * speedLerpFactor

      // 2. Error state ripple calculation (400ms duration):
      // A propagating wave ripples outward along the concentric rings
      let errorRippleProgress = 0
      let isErrorActive = false
      if (errorStartTime !== null) {
        const elapsed = time - errorStartTime
        const progress = Math.min(elapsed / 400, 1.0)
        errorRippleProgress = progress
        isErrorActive = true
        if (progress >= 1.0) {
          errorStartTime = null
        }
      }

      // 3. Success state collapse calculation (900ms duration):
      // Rings and dots ease into center over 900ms, then call onSuccessDone
      let collapseFactor = 1.0
      let vortexSpin = 1.0
      let fadeFactor = 1.0

      if (successStartTime !== null) {
        const elapsed = time - successStartTime
        const progress = Math.min(elapsed / 900, 1.0)

        // Smooth cubic ease-in collapse to center
        collapseFactor = Math.max(0, 1 - Math.pow(progress, 1.9) * 0.98)

        // Vortex acceleration as matter condenses inward
        vortexSpin = 1.0 + Math.pow(progress, 1.6) * 2.4

        // Fadeout in final 350ms
        if (progress > 0.6) {
          fadeFactor = Math.max(0, 1 - (progress - 0.6) / 0.4)
        }

        if (progress >= 1.0 && !successDoneTriggered) {
          successDoneTriggered = true
          propsRef.current.onSuccessDone?.()
        }
      }

      // 4. Slow scan line update (static under reduced motion)
      scanLineY = isReducedMotion ? 0.5 : (time % scanLineDuration) / scanLineDuration

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Base concentric ring radii calibrated to screen scale
      const minDimension = Math.min(width, height)
      const baseRadius = minDimension * 0.48
      const ringRadiiFactors = [0.16, 0.30, 0.46, 0.62, 0.78, 0.96]

      // Ambient Center Warm Amber Glow
      const glowRadius = Math.min(width, height) * 0.38
      const effectiveGlowRadius = glowRadius * (1.0 + (currentGlow - 1.0) * 0.25)
      const centerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, effectiveGlowRadius)
      const glowAlpha = 0.24 * currentGlow

      if (isErrorActive) {
        // Warning crimson-amber surge during error ripple
        const errWave = Math.sin(errorRippleProgress * Math.PI)
        centerGlow.addColorStop(0, `rgba(255, 230, 200, ${Math.min(1, glowAlpha * 1.3)})`)
        centerGlow.addColorStop(0.25, `rgba(255, 95, 45, ${Math.min(1, glowAlpha * 0.9 * errWave)})`)
        centerGlow.addColorStop(0.55, `rgba(180, 50, 20, ${Math.min(1, glowAlpha * 0.4 * errWave)})`)
        centerGlow.addColorStop(1, 'rgba(11, 7, 4, 0)')
      } else {
        centerGlow.addColorStop(0, `rgba(255, 240, 220, ${Math.min(1, glowAlpha * 1.25 * fadeFactor)})`)
        centerGlow.addColorStop(0.22, `rgba(255, 176, 64, ${Math.min(1, glowAlpha * 0.85 * fadeFactor)})`)
        centerGlow.addColorStop(0.55, `rgba(180, 95, 20, ${Math.min(1, glowAlpha * 0.32 * fadeFactor)})`)
        centerGlow.addColorStop(1, 'rgba(11, 7, 4, 0)')
      }

      ctx.fillStyle = centerGlow
      ctx.beginPath()
      ctx.arc(cx, cy, effectiveGlowRadius, 0, Math.PI * 2)
      ctx.fill()

      // Calculate radii for each ring with error ripple displacement
      const computedRingRadii: number[] = []
      for (let i = 0; i < ringCount; i++) {
        let ringRipple = 0
        if (isErrorActive) {
          // Outward propagating ripple wave: inner rings pulse first, flowing to outer rings
          const waveDelay = (i / ringCount) * 0.45
          const ringProgress = Math.max(0, Math.min(1, (errorRippleProgress - waveDelay) / 0.55))
          ringRipple = Math.sin(ringProgress * Math.PI) * 42
        }

        const currentR = Math.max(0, (baseRadius * ringRadiiFactors[i] + ringRipple) * collapseFactor)
        computedRingRadii.push(currentR)
      }

      // Draw 6 Tilted Concentric Rings
      ctx.save()
      for (let i = 0; i < ringCount; i++) {
        const r = computedRingRadii[i]
        if (r <= 0) continue

        const baseAlpha = 0.12 + (i % 2 === 0 ? 0.08 : 0.03)
        const alpha = baseAlpha * (activeState === 'focus' ? 1.35 : 1.0) * fadeFactor

        if (isErrorActive) {
          // Energetic pulse during error
          ctx.strokeStyle = `rgba(255, 120, 60, ${alpha * 1.4})`
        } else {
          ctx.strokeStyle = `rgba(255, 176, 64, ${alpha})`
        }

        ctx.lineWidth = ringWidths[i]
        ctx.setLineDash(ringDashPatterns[i])

        ctx.beginPath()
        ctx.ellipse(cx, cy, r, r * yAspect, tiltAngle, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.restore()

      // Draw Orbiting Dots (desktop 52, mobile <= 26)
      const activeDots = width < 768 ? 26 : 52
      for (let i = 0; i < activeDots && i < orbitDots.length; i++) {
        const dot = orbitDots[i]
        const ringR = computedRingRadii[dot.ringIndex]
        if (ringR <= 0) continue

        if (!isReducedMotion) {
          dot.angle += dot.speed * currentSpeed * vortexSpin
        }

        // Calculate position on the tilted ellipse
        const localX = Math.cos(dot.angle) * ringR
        const localY = Math.sin(dot.angle) * (ringR * yAspect)

        // Rotate by tiltAngle
        const screenX = cx + (localX * cosTilt - localY * sinTilt)
        const screenY = cy + (localX * sinTilt + localY * cosTilt)

        // Draw dot halo & core
        const dotAlpha = dot.alpha * fadeFactor
        ctx.fillStyle = dot.color
        ctx.globalAlpha = dotAlpha

        ctx.beginPath()
        ctx.arc(screenX, screenY, dot.radius, 0, Math.PI * 2)
        ctx.fill()

        // Subtle glowing accent on prominent dots
        if (dot.radius > 1.6) {
          ctx.fillStyle = '#ffb040'
          ctx.globalAlpha = dotAlpha * 0.35
          ctx.beginPath()
          ctx.arc(screenX, screenY, dot.radius * 2.2, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Draw Slow Scan Line
      // Sweeps vertically through the viewport with a soft tactical amber laser beam
      const curScanY = scanLineY * height
      const scanGrad = ctx.createLinearGradient(0, curScanY - 14, 0, curScanY + 14)
      scanGrad.addColorStop(0, 'rgba(255, 176, 64, 0)')
      scanGrad.addColorStop(0.48, `rgba(255, 185, 80, ${0.14 * fadeFactor})`)
      scanGrad.addColorStop(0.5, `rgba(255, 230, 180, ${0.38 * fadeFactor})`)
      scanGrad.addColorStop(0.52, `rgba(255, 185, 80, ${0.14 * fadeFactor})`)
      scanGrad.addColorStop(1, 'rgba(255, 176, 64, 0)')

      ctx.fillStyle = scanGrad
      ctx.fillRect(0, curScanY - 14, width, 28)

      ctx.globalAlpha = 1.0

      if (!isReducedMotion && !document.hidden) {
        animFrameRef.current = requestAnimationFrame(render)
      } else {
        animFrameRef.current = null
      }
    }

    const handleResize = () => {
      updateCanvasDimensions()
      if (isReducedMotion) {
        render(performance.now())
      }
    }
    window.addEventListener('resize', handleResize)

    // Visibility handling: pause animation loop immediately when tab is hidden
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (animFrameRef.current) {
          cancelAnimationFrame(animFrameRef.current)
          animFrameRef.current = null
        }
      } else {
        if (!isReducedMotion && !animFrameRef.current) {
          lastFrameTime = performance.now()
          animFrameRef.current = requestAnimationFrame(render)
        }
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Listen for reduced motion preference changes dynamically
    const handleMotionChange = (e: MediaQueryListEvent) => {
      isReducedMotion = e.matches
      if (isReducedMotion) {
        if (animFrameRef.current) {
          cancelAnimationFrame(animFrameRef.current)
          animFrameRef.current = null
        }
        render(performance.now())
      } else if (!document.hidden && !animFrameRef.current) {
        lastFrameTime = performance.now()
        animFrameRef.current = requestAnimationFrame(render)
      }
    }
    motionMediaQuery.addEventListener('change', handleMotionChange)

    // Subtle mouse parallax
    const handleMouseMove = (e: MouseEvent) => {
      const cx = width / 2
      const cy = height / 2
      mouseRef.current.targetX = (e.clientX - cx) * 0.035
      mouseRef.current.targetY = (e.clientY - cy) * 0.035
    }
    window.addEventListener('mousemove', handleMouseMove)

    // Always render initial frame immediately (provides static frame if reduced motion)
    render(performance.now())

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      motionMediaQuery.removeEventListener('change', handleMotionChange)
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
        animFrameRef.current = null
      }
    }
  }, [])

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
      {/* Supporting tactical scanline CSS overlay */}
      <div className="admin-scanline" />
    </div>
  )
}

export default OrbitRings
