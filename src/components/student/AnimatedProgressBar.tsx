import React, { useEffect, useState } from 'react'
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver'

export interface AnimatedProgressBarProps {
  progress: number
  height?: string
  className?: string
  showText?: boolean
  label?: string
}

export const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({
  progress,
  height = 'h-2',
  className = '',
  showText = false,
  label = 'Progress',
}) => {
  const [containerRef, isInView] = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.1,
    triggerOnce: true,
  })

  const [currentWidth, setCurrentWidth] = useState<number>(0)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  // Watch prefers-reduced-motion query
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

  // Animate from 0 to target value on scroll into view
  useEffect(() => {
    if (prefersReducedMotion) {
      setCurrentWidth(progress)
      return
    }

    if (isInView) {
      const frame = requestAnimationFrame(() => {
        setCurrentWidth(progress)
      })
      return () => cancelAnimationFrame(frame)
    } else {
      setCurrentWidth(0)
    }
  }, [isInView, progress, prefersReducedMotion])

  return (
    <div
      ref={containerRef}
      className={`w-full ${className}`}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${label}: ${progress}%`}
    >
      {showText && (
        <div className="flex justify-between items-center text-xs mb-1.5 font-mono">
          <span className="text-[var(--muted)]">{label}</span>
          <span className="text-[var(--accent)] font-medium">
            {isInView || prefersReducedMotion ? progress : 0}%
          </span>
        </div>
      )}
      <div className={`w-full bg-white/10 rounded-full overflow-hidden ${height} relative`}>
        <div
          className={`h-full rounded-full bg-gradient-to-r from-[#8fb4ff] to-[#60a5fa] shadow-[0_0_12px_rgba(143,180,255,0.4)] ${
            prefersReducedMotion
              ? ''
              : 'transition-[width] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]'
          }`}
          style={{ width: `${currentWidth}%` }}
        />
      </div>
    </div>
  )
}

export default AnimatedProgressBar
