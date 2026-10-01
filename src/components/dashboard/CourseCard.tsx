import React, { useEffect, useState, useId } from 'react'
import { User, BookOpen, Clock } from 'lucide-react'
import { Course as StudentCourse } from '../../types/student'
import { Course as DashboardCourse } from '../../types/dashboard'
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver'

export type CourseCardData = StudentCourse | DashboardCourse | {
  id: string
  title: string
  instructor: string
  progress: number
  status?: string
  code?: string
  credits?: number
  category?: string
  nextLesson?: string | { title: string }
  totalLessons?: number
  completedLessons?: number
  lastAccessed?: string
}

export interface CourseCardProps {
  course: CourseCardData
  onSelect?: (course: CourseCardData) => void
  className?: string
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onSelect,
  className = '',
}) => {
  const progressBarId = useId()
  const [cardRef, isInView] = useIntersectionObserver<HTMLElement>({
    threshold: 0.1,
    triggerOnce: true,
  })
  const [animatedProgress, setAnimatedProgress] = useState(0)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  // Normalize status label ('In progress' vs 'Not started')
  const isNotStarted =
    course.status === 'not-started' ||
    (course.status !== 'in-progress' && course.progress === 0)
  const statusLabel = isNotStarted ? 'Not started' : 'In progress'

  // Normalize next lesson text
  const nextLessonTitle =
    typeof course.nextLesson === 'string'
      ? course.nextLesson
      : course.nextLesson?.title

  // Check prefers-reduced-motion
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

  // Animate progress bar from 0 to target value on scroll into view (900ms ease-out)
  useEffect(() => {
    const target = Math.max(0, Math.min(100, course.progress))

    if (prefersReducedMotion) {
      setAnimatedProgress(target)
      return
    }

    if (!isInView) {
      setAnimatedProgress(0)
      return
    }

    const duration = 900
    const startTime = performance.now()
    let frameId: number

    const step = (time: number) => {
      const elapsed = time - startTime
      const progressRatio = Math.min(elapsed / duration, 1)
      // Cubic ease-out
      const easedRatio = 1 - Math.pow(1 - progressRatio, 3)
      setAnimatedProgress(Math.round(easedRatio * target))

      if (progressRatio < 1) {
        frameId = requestAnimationFrame(step)
      }
    }

    frameId = requestAnimationFrame(step)

    return () => {
      if (frameId) cancelAnimationFrame(frameId)
    }
  }, [isInView, course.progress, prefersReducedMotion])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && onSelect) {
      e.preventDefault()
      onSelect(course)
    }
  }

  const completedCount =
    course.completedLessons ??
    Math.round((course.progress / 100) * (course.totalLessons || 20))
  const totalCount = course.totalLessons || 20

  return (
    <article
      ref={cardRef}
      data-testid={`course-card-${course.id}`}
      tabIndex={onSelect ? 0 : undefined}
      role={onSelect ? 'button' : 'article'}
      aria-label={`${course.title} by ${course.instructor}, ${statusLabel}, ${course.progress}% completed`}
      onClick={() => onSelect?.(course)}
      onKeyDown={handleKeyDown}
      className={`frosted-glass rounded-2xl p-5 border border-white/10 flex flex-col justify-between 
        transition-all duration-200 ease-out 
        hover:-translate-y-[2px] hover:border-white/20 hover:shadow-[0_20px_35px_-10px_rgba(0,0,0,0.65),0_0_25px_rgba(143,180,255,0.12)]
        motion-reduce:hover:translate-y-0 motion-reduce:transition-none
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04060d]
        group cursor-pointer select-none ${className}`}
    >
      {/* Top Meta & Status Pill Row */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          {/* Course Code or Category Badge */}
          <span className="text-[10px] font-mono uppercase bg-white/5 text-[var(--muted)] px-2.5 py-0.5 rounded-full border border-white/10 tracking-wider">
            {course.code || 'CS-MOD'}
          </span>

          {/* Status Label Pill (In progress / Not started) */}
          <span
            data-testid="course-status-pill"
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-tight border transition-colors ${
              isNotStarted
                ? 'bg-white/5 text-[var(--muted)] border-white/10'
                : 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/30'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isNotStarted
                  ? 'bg-[var(--muted)]/50'
                  : 'bg-[var(--accent)] animate-pulse'
              }`}
              aria-hidden="true"
            />
            {statusLabel}
          </span>
        </div>

        {/* Title & Instructor */}
        <div>
          <h3 className="text-base font-semibold text-[var(--text)] tracking-tight leading-snug group-hover:text-[var(--accent)] transition-colors line-clamp-2">
            {course.title}
          </h3>
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[var(--muted)]">
            <User className="w-3.5 h-3.5 text-[var(--muted)]/70 flex-shrink-0" />
            <span className="line-clamp-1">{course.instructor}</span>
          </div>
        </div>

        {/* Next lesson snippet if available */}
        {nextLessonTitle && (
          <div className="flex items-start gap-1.5 pt-1 text-xs text-[var(--muted)]/85 line-clamp-1">
            <BookOpen className="w-3.5 h-3.5 text-[var(--accent)]/70 flex-shrink-0 mt-0.5" />
            <span className="truncate">
              <span className="text-[var(--text)]/65">Next:</span> {nextLessonTitle}
            </span>
          </div>
        )}
      </div>

      {/* Progress & Bottom Metrics */}
      <div className="pt-4 mt-3 border-t border-white/5 space-y-2">
        {/* Progress % Label Row */}
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[var(--muted)]">Progress</span>
          <span
            data-testid="course-progress-value"
            className="text-[var(--accent)] font-semibold"
          >
            {animatedProgress}%
          </span>
        </div>

        {/* Animated Progress Bar */}
        <div
          id={progressBarId}
          role="progressbar"
          aria-valuenow={animatedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${course.title} completion percentage`}
          className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden relative"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#8fb4ff] to-[#60a5fa] transition-all duration-[900ms] ease-out shadow-[0_0_10px_rgba(143,180,255,0.4)] motion-reduce:transition-none"
            style={{ width: `${animatedProgress}%` }}
          />
        </div>

        {/* Metadata Footer: Credits & Lessons */}
        <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-[var(--muted)]">
          <span>
            {'credits' in course && typeof course.credits === 'number'
              ? course.credits
              : 4}{' '}
            Credits
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-[var(--muted)]/60" />
            <span>
              {completedCount}/{totalCount} Lessons
            </span>
          </span>
        </div>
      </div>
    </article>
  )
}

export default CourseCard
