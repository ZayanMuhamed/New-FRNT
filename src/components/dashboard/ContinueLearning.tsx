import React, { useState, useEffect, useRef, useId, useMemo } from 'react'
import { Play, Sparkles, Clock, BookOpen, ArrowRight } from 'lucide-react'
import { Course as StudentCourse } from '../../types/student'
import { Course as DashboardCourse } from '../../types/dashboard'
import { featuredCourse } from '../../data/mockStudentData'
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver'

export type AnyCourse = StudentCourse | DashboardCourse | {
  id?: string
  title: string
  code?: string
  instructor?: string
  category?: string
  progress: number
  totalLessons?: number
  completedLessons?: number
  lastAccessed?: string
  nextLesson?: string | {
    id?: string
    title: string
    duration?: string
    lessonNumber?: number
    summary?: string
  }
}

export interface ContinueLearningProps {
  course?: AnyCourse
  onResume?: (course: AnyCourse) => void
  className?: string
}

export const ContinueLearning: React.FC<ContinueLearningProps> = ({
  course = featuredCourse,
  onResume,
  className = '',
}) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const progressBarId = useId()

  // Pointer position relative to card bounds
  const [pointerPos, setPointerPos] = useState<{ x: number; y: number } | null>(null)
  const [isPointerInside, setIsPointerInside] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  // Normalization for nextLesson whether string or object
  const normalizedNextLesson = useMemo(() => {
    if (!course.nextLesson) {
      return {
        title: 'Consensus Protocols & Fault Tolerance',
        duration: '25 min read',
        lessonNumber: 12,
      }
    }
    if (typeof course.nextLesson === 'string') {
      return {
        title: course.nextLesson,
        duration: '45 min',
        lessonNumber: 14,
      }
    }
    return {
      title: course.nextLesson.title,
      duration: course.nextLesson.duration || '25 min',
      lessonNumber: course.nextLesson.lessonNumber || 1,
    }
  }, [course.nextLesson])

  const totalLessons = course.totalLessons ?? 20
  const completedLessons = course.completedLessons ?? Math.round((course.progress / 100) * totalLessons)
  const lastAccessed = course.lastAccessed ?? '25 minutes ago'
  const courseCode = course.code ?? 'CS-402'
  const instructor = course.instructor ?? 'Dr. Sarah Chen'
  const category = course.category ?? 'Core Systems'

  // Progress animation state (from 0 to course.progress over 900ms ease-out)
  const [animatedProgress, setAnimatedProgress] = useState(0)
  const [displayNumber, setDisplayNumber] = useState(0)

  // Listen to system prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

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

  const [sectionRef, isInView] = useIntersectionObserver<HTMLElement>({
    threshold: 0.15,
    triggerOnce: true,
  })

  // Animate progress and percentage counter on scroll into view or change
  useEffect(() => {
    if (prefersReducedMotion) {
      setAnimatedProgress(course.progress)
      setDisplayNumber(course.progress)
      return
    }

    if (!isInView) {
      setAnimatedProgress(0)
      setDisplayNumber(0)
      return
    }

    const duration = 900 // 900ms ease-out as required by Design.md
    const startTime = performance.now()
    let animationFrameId: number

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progressRatio = Math.min(elapsed / duration, 1)

      // Cubic ease-out: 1 - (1 - t)^3
      const easeOut = 1 - Math.pow(1 - progressRatio, 3)
      const currentVal = Math.round(easeOut * course.progress)

      setAnimatedProgress(easeOut * course.progress)
      setDisplayNumber(currentVal)

      if (progressRatio < 1) {
        animationFrameId = requestAnimationFrame(animate)
      } else {
        setAnimatedProgress(course.progress)
        setDisplayNumber(course.progress)
      }
    }

    animationFrameId = requestAnimationFrame(animate)

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [isInView, course.progress, prefersReducedMotion])

  // Desktop pointer tracking
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    // Hide and avoid overhead under reduced motion or touch pointer
    if (prefersReducedMotion || e.pointerType === 'touch') {
      return
    }

    const card = cardRef.current
    if (!card) return

    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setPointerPos({ x, y })
    setIsPointerInside(true)
  }

  const handlePointerLeave = () => {
    setIsPointerInside(false)
  }

  const handleResumeClick = () => {
    if (onResume) {
      onResume(course)
    }
  }

  // Pointer glow active state
  const showGlow = !prefersReducedMotion && isPointerInside && pointerPos !== null

  return (
    <section
      ref={sectionRef}
      aria-labelledby="continue-learning-heading"
      className={`relative w-full ${className}`}
    >
      {/* Outer Card Wrapper with 2px hover lift */}
      <div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="relative group rounded-3xl transition-transform duration-300 ease-out hover:-translate-y-0.5"
      >
        {/* Soft glow in accent color behind the card that follows pointer on desktop */}
        {showGlow && (
          <div
            data-testid="continue-learning-glow"
            className="card-pointer-glow absolute -inset-2 rounded-3xl blur-2xl opacity-75 pointer-events-none transition-opacity duration-300"
            style={{
              background: `radial-gradient(420px circle at ${pointerPos.x}px ${pointerPos.y}px, rgba(143, 180, 255, 0.28), transparent 70%)`,
              zIndex: 0,
            }}
          />
        )}

        {/* Frosted Glass Card Body */}
        <div className="relative z-10 frosted-glass rounded-3xl p-6 sm:p-8 overflow-hidden border border-white/16 shadow-2xl bg-[var(--card-bg)] text-[var(--text)]">
          {/* Subtle inner highlight tracking cursor */}
          {showGlow && (
            <div
              className="card-pointer-glow absolute inset-0 pointer-events-none opacity-40"
              style={{
                background: `radial-gradient(500px circle at ${pointerPos.x}px ${pointerPos.y}px, rgba(143, 180, 255, 0.14), transparent 60%)`,
              }}
            />
          )}

          {/* Header Row: Featured Badge + Course Code + Last Accessed */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium tracking-wide bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Continue learning</span>
              </span>
              <span className="text-xs font-mono text-[var(--muted)] px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10">
                {courseCode}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Accessed {lastAccessed}</span>
            </div>
          </div>

          {/* Main Content: Course Title, Instructor & Next Lesson on Left; Resume Button on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 flex flex-col gap-3">
              <h2
                id="continue-learning-heading"
                className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight text-[var(--text)] font-geist"
              >
                {course.title}
              </h2>

              <p className="text-xs sm:text-sm text-[var(--muted)] flex items-center gap-2">
                <span>Instructor: {instructor}</span>
                <span>&bull;</span>
                <span>{category}</span>
              </p>

              {/* Next Lesson Callout Card */}
              <div className="mt-2 p-3.5 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start sm:items-center gap-3.5">
                <div className="w-9 h-9 shrink-0 rounded-full bg-[var(--accent)]/15 border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)]">
                  <BookOpen className="w-4 h-4" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs font-medium text-[var(--accent)]">
                    <span>Up next</span>
                    <span className="text-[var(--muted)]">&bull;</span>
                    <span className="text-[var(--muted)] font-normal">
                      Lesson {normalizedNextLesson.lessonNumber} ({normalizedNextLesson.duration})
                    </span>
                  </div>
                  <p className="text-sm font-medium text-[var(--text)] truncate mt-0.5">
                    {normalizedNextLesson.title}
                  </p>
                </div>
              </div>
            </div>

            {/* Resume Button Pill & Progress Summary */}
            <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-center gap-4 pt-2 lg:pt-0">
              <button
                type="button"
                onClick={handleResumeClick}
                aria-label={`Resume lesson: ${normalizedNextLesson.title}`}
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 min-h-[44px] rounded-full bg-[var(--accent)] text-[#04060d] font-semibold text-sm transition-all duration-200 hover:bg-[#a5c4ff] hover:shadow-[0_0_25px_rgba(143,180,255,0.45)] active:scale-[0.98] cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04060d] focus-visible:outline-none"
              >
                <Play className="w-4 h-4 fill-current transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />
                <span>Resume lesson</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
              </button>

              <div className="text-xs text-[var(--muted)] text-left lg:text-right">
                <span>{completedLessons} of {totalLessons} lessons completed</span>
              </div>
            </div>
          </div>

          {/* Progress Bar & Percentage */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <div className="flex items-center justify-between text-xs mb-2">
              <span id={progressBarId} className="text-[var(--muted)] font-medium">
                Overall module progress
              </span>
              <span className="font-mono text-sm font-semibold text-[var(--accent)]">
                {displayNumber}%
              </span>
            </div>

            {/* Accessible Progress Bar */}
            <div
              role="progressbar"
              aria-labelledby={progressBarId}
              aria-valuenow={Math.round(animatedProgress)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${course.title} overall module progress: ${displayNumber}%`}
              className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden relative"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[#6ba0ff] shadow-[0_0_12px_rgba(143,180,255,0.4)]"
                style={{
                  width: `${animatedProgress}%`,
                  transition: prefersReducedMotion ? 'none' : undefined,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContinueLearning
