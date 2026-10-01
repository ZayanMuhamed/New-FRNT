import React, { useEffect, useRef } from 'react'

export type GalaxyState = 'idle' | 'focus' | 'error' | 'success'

export interface GalaxyCanvasProps {
  state: GalaxyState
  onSuccessDone?: () => void
  className?: string
}

interface Particle {
  dist: number
  angle: number
  angularSpeed: number
  radius: number
  alpha: number
  color: string
}

export const GalaxyCanvas: React.FC<GalaxyCanvasProps> = ({
  state,
  onSuccessDone,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 })

  // Props reference for animation loop (ready for future state handlers)
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

    // DPR capped at 1.5 for performance
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

    // Palette: Mostly white (~72%), some blue (~20%), subtle orange (~8%)
    const whiteColors = ['#ffffff', '#f4f7ff', '#e6eeff']
    const blueColors = ['#8fb4ff', '#709dff', '#adc8ff']
    const orangeColors = ['#ffb040', '#ffa033', '#ffd294']

    const getRandomColor = () => {
      const r = Math.random()
      if (r < 0.72) {
        return whiteColors[Math.floor(Math.random() * whiteColors.length)]
      } else if (r < 0.92) {
        return blueColors[Math.floor(Math.random() * blueColors.length)]
      } else {
        return orangeColors[Math.floor(Math.random() * orangeColors.length)]
      }
    }

    // Two spiral arms generation (total pool of 1300 particles desktop, dynamically capped <= 600 on mobile)
    const maxParticles = 1300
    const particles: Particle[] = []

    const maxRadius = Math.sqrt(width * width + height * height) * 0.55
    // Galaxy tilt angle in radians (~22 deg) and projection aspect ratio
    const galaxyTiltAngle = -0.38
    const cosTilt = Math.cos(galaxyTiltAngle)
    const sinTilt = Math.sin(galaxyTiltAngle)
    const yAspect = 0.68 // Elliptical projection ratio

    for (let i = 0; i < maxParticles; i++) {
      // Two arms: arm 0 and arm 1 (separated by 180 degrees)
      const arm = i % 2
      const armAngleOffset = arm * Math.PI

      // Radial density: concentrated at nucleus with long spiral tails
      const distPercent = Math.pow(Math.random(), 0.88)
      const dist = distPercent * maxRadius + 15

      // Archimedean / power spiral arm curve
      const spiralTheta = armAngleOffset + Math.pow(distPercent, 0.72) * 3.8
      // Jitter / spread around the arm
      const armSpread = (Math.random() - 0.5) * (0.32 + distPercent * 0.48)
      const angle = spiralTheta + armSpread

      // Differential rotation speed: inner particles rotate faster than outer particles
      const angularSpeed =
        (0.00035 / (Math.pow(distPercent, 0.65) + 0.16)) * (0.85 + Math.random() * 0.3)

      const isCoreSpark = Math.random() < 0.08
      const radius = isCoreSpark
        ? Math.random() * 1.5 + 1.2
        : Math.random() * 1.0 + 0.5
      const alpha = Math.random() * 0.6 + 0.25

      particles.push({
        dist,
        angle,
        angularSpeed,
        radius,
        alpha,
        color: getRandomColor(),
      })
    }

    // State tracking variables
    let lastState: GalaxyState = propsRef.current.state
    let focusTargetGlow = 1.0
    let focusTargetSpeed = 1.0
    let currentGlow = 1.0
    let currentSpeed = 1.0
    let errorStartTime: number | null = null
    let successStartTime: number | null = null
    let successDoneTriggered = false

    // Frame rate & delta time tracking
    let frameCount = 0
    let lastFpsUpdate = performance.now()
    let lastFrameTime = performance.now()
    let currentFps = 60

    // Render loop
    const render = (time: number) => {
      if (document.hidden) {
        animFrameRef.current = null
        return
      }

      const dt = Math.min(Math.max((time - lastFrameTime) / 1000, 0.001), 0.1)
      lastFrameTime = time

      // Check for state changes from props
      const currentState = propsRef.current.state
      if (currentState !== lastState) {
        if (currentState === 'focus') {
          focusTargetGlow = 1.85
          focusTargetSpeed = 0.6
        } else if (currentState === 'error') {
          errorStartTime = time
          focusTargetGlow = 1.15
          focusTargetSpeed = 1.0
        } else if (currentState === 'success') {
          successStartTime = time
          successDoneTriggered = false
        } else {
          // idle
          focusTargetGlow = 1.0
          focusTargetSpeed = 1.0
        }
        lastState = currentState
      }

      // Smooth lerp with exponential decay for framerate independence
      const glowLerpFactor = 1 - Math.exp(-dt * 5.5)
      const speedLerpFactor = 1 - Math.exp(-dt * 5.0)
      currentGlow += (focusTargetGlow - currentGlow) * glowLerpFactor
      currentSpeed += (focusTargetSpeed - currentSpeed) * speedLerpFactor

      // Error ripple calculation (400ms outward surge and ease back)
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

      // Success collapse calculation (900ms duration)
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

      // FPS measurement
      frameCount++
      const deltaFps = time - lastFpsUpdate
      if (deltaFps >= 500) {
        currentFps = Math.round((frameCount * 1000) / deltaFps)
        frameCount = 0
        lastFpsUpdate = time
        if (typeof window !== 'undefined') {
          ;(window as unknown as { __galaxyFps: number }).__galaxyFps = currentFps
        }
      }

      // Smooth mouse parallax lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05

      // Center with parallax shift
      const cx = width / 2 + mouseRef.current.x
      const cy = height / 2 + mouseRef.current.y

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // 1. Soft Center Glow
      const glowRadius = Math.min(width, height) * 0.42 * currentGlow
      const centerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowRadius)
      centerGlow.addColorStop(0, `rgba(230, 242, 255, ${0.28 * currentGlow * fadeFactor})`)
      centerGlow.addColorStop(0.2, `rgba(143, 180, 255, ${0.18 * currentGlow * fadeFactor})`)
      centerGlow.addColorStop(0.5, `rgba(65, 110, 225, ${0.07 * currentGlow * fadeFactor})`)
      centerGlow.addColorStop(1, 'rgba(4, 6, 13, 0)')

      ctx.fillStyle = centerGlow
      ctx.beginPath()
      ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2)
      ctx.fill()

      // 2. Particle Simulation (desktop <= 1300, mobile <= 600)
      const activeParticleCount = width < 768 ? 600 : 1300
      for (let i = 0; i < activeParticleCount && i < particles.length; i++) {
        const p = particles[i]

        if (!isReducedMotion) {
          p.angle += p.angularSpeed * currentSpeed * vortexSpin
        }

        // Radial offset: normal distance modulated by collapseFactor and error ripple
        let effectiveDist = p.dist * collapseFactor

        if (isErrorActive) {
          // Outward surge ripple wave that peaks then eases back
          const rippleWave = Math.sin(errorRippleProgress * Math.PI)
          effectiveDist += rippleWave * 35 * (1 + p.dist / maxRadius)
        }

        // Elliptical coordinate on galaxy plane
        const localX = Math.cos(p.angle) * effectiveDist
        const localY = Math.sin(p.angle) * (effectiveDist * yAspect)

        // Rotate into canvas viewport angle
        const screenX = cx + (localX * cosTilt - localY * sinTilt)
        const screenY = cy + (localX * sinTilt + localY * cosTilt)

        ctx.fillStyle = p.color
        ctx.globalAlpha = p.alpha * fadeFactor
        ctx.beginPath()
        ctx.arc(screenX, screenY, p.radius, 0, Math.PI * 2)
        ctx.fill()
      }

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
          lastFpsUpdate = performance.now()
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
        lastFpsUpdate = performance.now()
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
    </div>
  )
}

export default GalaxyCanvas
