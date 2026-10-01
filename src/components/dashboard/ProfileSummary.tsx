import React, { useEffect, useState, useMemo } from 'react'
import { Sparkles, Award } from 'lucide-react'
import { Student, Course } from '../../types/student'
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver'

export interface ProfileSummaryProps {
  student?: Partial<Student>
  courses?: Course[]
  overallProgress?: number
  className?: string
}

/**
 * Extracts initials from student's name (e.g. "Alex Vance" -> "AV").
 */
function getInitials(name?: string): string {
  if (!name || !name.trim()) return 'ST'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export const ProfileSummary: React.FC<ProfileSummaryProps> = ({
  student,
  courses,
  overallProgress,
  className = '',
}) => {
  // Fallback student information matching DESIGN.md and mock student data
  const studentName = student?.name || 'Alex Vance'
  const program = student?.program || 'B.S. Computer Science & Engineering'
  const semester = student?.semester || 'Semester 6'
  const studentId = student?.studentId || 'STU-2026-8942'
  const initials = useMemo(() => getInitials(studentName), [studentName])

  // Compute overall progress from enrolled courses if provided, or fallback to student.overallProgress
  const computedProgress = useMemo(() => {
    if (courses && courses.length > 0) {
      const sum = courses.reduce((acc, c) => acc + (typeof c.progress === 'number' ? c.progress : 0), 0)
      return Math.round(sum / courses.length)
    }
    return typeof student?.overallProgress === 'number' ? student.overallProgress : 68
  }, [courses, student?.overallProgress])

  const targetProgress = overallProgress !== undefined ? overallProgress : computedProgress

  // Accessibility: detect prefers-reduced-motion
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  const [sectionRef, isInView] = useIntersectionObserver<HTMLElement>({
    threshold: 0.15,
    triggerOnce: true,
  })

  // Animation states for 900ms ease-out count-up and progress ring
  const [animatedProgress, setAnimatedProgress] = useState<number>(() =>
    prefersReducedMotion ? targetProgress : 0,
  )
  const [displayCount, setDisplayCount] = useState<number>(() =>
    prefersReducedMotion ? targetProgress : 0,
  )

  useEffect(() => {
    if (prefersReducedMotion) {
      setAnimatedProgress(targetProgress)
      setDisplayCount(targetProgress)
      return
    }

    if (!isInView) {
      setAnimatedProgress(0)
      setDisplayCount(0)
      return
    }

    let startTime: number | null = null
    let animationFrameId: number
    const duration = 900 // 900ms ease-out as required by DESIGN.md

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progressRatio = Math.min(elapsed / duration, 1)

      // Cubic ease-out: 1 - (1 - t)^3
      const easeOut = 1 - Math.pow(1 - progressRatio, 3)
      const currentVal = Math.round(easeOut * targetProgress)

      setAnimatedProgress(easeOut * targetProgress)
      setDisplayCount(currentVal)

      if (progressRatio < 1) {
        animationFrameId = requestAnimationFrame(animate)
      } else {
        setAnimatedProgress(targetProgress)
        setDisplayCount(targetProgress)
      }
    }

    animationFrameId = requestAnimationFrame(animate)
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [isInView, targetProgress, prefersReducedMotion])

  // Circular progress ring geometry
  const size = 108
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference

  return (
    <section
      ref={sectionRef}
      aria-label="Student profile summary"
      className={`frosted-glass rounded-2xl p-6 sm:p-7 relative overflow-hidden transition-transform duration-200 hover:-translate-y-0.5 text-[var(--text)] font-geist ${className}`}
    >
      {/* Soft ambient gradient overlay */}
      <div
        className="absolute -right-16 -top-16 w-56 h-56 rounded-full pointer-events-none opacity-20 blur-3xl bg-[var(--accent)]"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Section: Avatar + Name + Academic Details */}
        <div className="flex items-center gap-4 sm:gap-5">
          {/* Avatar with Initials */}
          <div className="relative flex-shrink-0">
            <div
              className="w-16 h-16 sm:w-18 sm:h-18 rounded-full flex items-center justify-center bg-gradient-to-br from-[var(--accent)]/20 via-[var(--accent)]/10 to-transparent border border-[var(--accent)]/35 shadow-[0_0_20px_rgba(143,180,255,0.22)] select-none"
              title={`Student initials: ${initials}`}
            >
              <span className="text-xl sm:text-2xl font-bold tracking-wider text-[var(--accent)]">
                {initials}
              </span>
            </div>
            {/* Subtle active status dot */}
            <span
              className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#04060d] shadow-[0_0_8px_rgba(52,211,153,0.8)]"
              title="Active student session"
            />
          </div>

          {/* Student Academic Info */}
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text)] truncate">
                {studentName}
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
                <Sparkles className="w-3 h-3" />
                <span>Active</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[var(--muted)] font-normal truncate">
              {program}
            </p>

            <div className="flex items-center gap-2 flex-wrap pt-0.5">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-[var(--text)]">
                {semester}
              </span>
              <span className="text-xs text-[var(--muted)] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                <span className="font-mono text-[11px]">{studentId}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: Circular Progress Ring & Stats */}
        <div className="flex items-center gap-5 self-start md:self-center bg-white/[0.02] border border-white/5 rounded-xl p-3 sm:px-4 sm:py-3.5 backdrop-blur-sm">
          {/* SVG Progress Ring */}
          <div
            role="progressbar"
            aria-valuenow={displayCount}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Overall academic progress: ${displayCount}%`}
            className="relative flex-shrink-0"
            style={{ width: size, height: size }}
          >
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              className="-rotate-90 transform"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="profile-progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8fb4ff" />
                  <stop offset="100%" stopColor="#60a5fa" />
                </linearGradient>
                <filter id="progress-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Background circle track */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth={strokeWidth}
              />

              {/* Animated Progress circle */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke="url(#profile-progress-gradient)"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                filter="url(#progress-glow)"
              />
            </svg>

            {/* Inner Ring Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text)]">
                {displayCount}
                <span className="text-xs font-semibold text-[var(--accent)]">%</span>
              </span>
              <span className="text-[9px] font-medium text-[var(--muted)] tracking-wider">
                Progress
              </span>
            </div>
          </div>

          {/* Progress Label Description */}
          <div className="space-y-1 pr-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--text)]">
              <Award className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Overall progress</span>
            </div>
            <p className="text-[11px] text-[var(--muted)] leading-relaxed max-w-[150px]">
              {courses && courses.length > 0
                ? `Computed across ${courses.length} enrolled courses`
                : 'Current academic standing completion'}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProfileSummary
