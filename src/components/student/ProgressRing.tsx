import React, { useEffect, useState } from 'react'
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver'

export interface ProgressRingProps {
  percentage: number
  size?: number
  strokeWidth?: number
  className?: string
  label?: string
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  percentage,
  size = 110,
  strokeWidth = 9,
  className = '',
  label = 'Completed',
}) => {
  const [containerRef, isInView] = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.15,
    triggerOnce: true,
  })

  const [displayValue, setDisplayValue] = useState<number>(0)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const targetOffset = circumference - (percentage / 100) * circumference
  const [animatedOffset, setAnimatedOffset] = useState<number>(circumference)

  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handler)
    } else {
      mediaQuery.addListener(handler)
    }

    return () => {
      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', handler)
      } else {
        mediaQuery.removeListener(handler)
      }
    }
  }, [])

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayValue(percentage)
      setAnimatedOffset(targetOffset)
      return
    }

    if (!isInView) {
      setDisplayValue(0)
      setAnimatedOffset(circumference)
      return
    }

    // Trigger stroke animation in next frame
    const timer = setTimeout(() => {
      setAnimatedOffset(targetOffset)
    }, 40)

    // Animate number count-up over 900ms ease-out
    const startTime = performance.now()
    const duration = 900
    let animationFrameId: number

    const animateNumber = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic: 1 - (1 - progress)^3
      const ease = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(ease * percentage)
      setDisplayValue(current)

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animateNumber)
      } else {
        setDisplayValue(percentage)
      }
    }

    animationFrameId = requestAnimationFrame(animateNumber)

    return () => {
      clearTimeout(timer)
      cancelAnimationFrame(animationFrameId)
    }
  }, [isInView, percentage, circumference, targetOffset, prefersReducedMotion])

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${label}: ${percentage}%`}
    >
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        aria-hidden="true"
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Animated accent progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progressAccentGrad)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={animatedOffset}
          style={{
            transition: prefersReducedMotion
              ? 'none'
              : 'stroke-dashoffset 900ms cubic-bezier(0.16, 1, 0.3, 1)',
            filter: 'drop-shadow(0 0 6px rgba(143, 180, 255, 0.45))',
          }}
        />

        <defs>
          <linearGradient id="progressAccentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8fb4ff" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
        </defs>
      </svg>

      {/* Centered value & label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xl font-bold font-geist tracking-tight text-[var(--text)]">
          {displayValue}%
        </span>
        {label && (
          <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--muted)]">
            {label}
          </span>
        )}
      </div>
    </div>
  )
}

export default ProgressRing
