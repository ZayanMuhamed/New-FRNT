import React, { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import {
  X,
  Star,
  Clock,
  BookOpen,
  User,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Check,
} from 'lucide-react'
import { CatalogCourse } from '../../types/course'
import { useEnrollment } from '../../context/EnrollmentContext'
import { useProgress } from '../../context/ProgressContext'
import { useToast } from '../../context/ToastContext'
import { isCourseFree } from '../../utils/coursePricing'

export interface CourseDrawerProps {
  course: CatalogCourse | null
  isOpen: boolean
  onClose: () => void
  triggerRef?: React.RefObject<HTMLElement> | null
}

const LEVEL_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  Beginner: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/25',
    text: 'text-emerald-300',
  },
  Intermediate: {
    bg: 'bg-[var(--accent)]/10',
    border: 'border-[var(--accent)]/25',
    text: 'text-[var(--accent)]',
  },
  Advanced: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/25',
    text: 'text-purple-300',
  },
}

export const CourseDrawer: React.FC<CourseDrawerProps> = ({
  course,
  isOpen,
  onClose,
  triggerRef,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousActiveElementRef = useRef<HTMLElement | null>(null)
  const navigate = useNavigate()
  const { isEnrolled, enrollCourse } = useEnrollment()
  const { getFirstUnfinishedLesson } = useProgress()
  const { showToast } = useToast()

  const handleContinueLearning = () => {
    if (!course) return
    onClose()
    const nextLesson = getFirstUnfinishedLesson(course.id)
    if (nextLesson) {
      navigate(`/student/learn/${course.id}/${nextLesson.id}`)
    }
  }

  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({})
  const [justEnrolled, setJustEnrolled] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  // Listen to prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Auto-expand first 2 modules by default when course changes
  useEffect(() => {
    if (course?.syllabus) {
      const initial: Record<string, boolean> = {}
      course.syllabus.forEach((mod, idx) => {
        initial[mod.id] = idx === 0 // expand first module by default
      })
      setExpandedModules(initial)
      setJustEnrolled(false)
    }
  }, [course?.id])

  // Track the active trigger element when opening, restore on close
  useEffect(() => {
    if (isOpen) {
      // Store currently focused element before drawer stole focus
      if (document.activeElement instanceof HTMLElement) {
        previousActiveElementRef.current = document.activeElement
      } else if (triggerRef?.current) {
        previousActiveElementRef.current = triggerRef.current
      }

      // Lock body scroll
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'

      // Set focus to the close button or first interactive element inside drawer
      const timer = setTimeout(() => {
        if (closeButtonRef.current) {
          closeButtonRef.current.focus()
        } else if (drawerRef.current) {
          const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
          if (focusable.length > 0) {
            focusable[0].focus()
          }
        }
      }, 50)

      return () => {
        clearTimeout(timer)
        document.body.style.overflow = originalOverflow

        // Return focus to previous trigger element
        const targetToFocus = triggerRef?.current || previousActiveElementRef.current
        if (targetToFocus && typeof targetToFocus.focus === 'function') {
          // Use microtask / next frame to allow DOM unmount
          requestAnimationFrame(() => {
            targetToFocus.focus()
          })
        }
      }
    }
  }, [isOpen, triggerRef])

  // Focus trap & Escape key handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        onClose()
        return
      }

      if (e.key === 'Tab') {
        if (!drawerRef.current) return

        const focusableElements = drawerRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
        )

        if (focusableElements.length === 0) {
          e.preventDefault()
          return
        }

        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (e.shiftKey) {
          // Backward tab: from first to last
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          // Forward tab: from last to first
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
    },
    [onClose]
  )

  const toggleModule = (modId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }))
  }

  const handleEnrollClick = () => {
    if (!course) return

    if (isCourseFree(course.id)) {
      enrollCourse(course.id)
      showToast(`Successfully enrolled in ${course.title}!`, 'success')
      setJustEnrolled(true)
      setTimeout(() => setJustEnrolled(false), 3000)
    } else {
      onClose()
      navigate(`/student/checkout/${course.id}`)
    }
  }

  if (!isOpen && !course) {
    return null
  }

  const enrolled = course ? isEnrolled(course.id) : false
  const levelStyle = course
    ? LEVEL_COLORS[course.level] || LEVEL_COLORS.Intermediate
    : LEVEL_COLORS.Intermediate

  const drawerContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="course-drawer-title"
      aria-describedby="course-drawer-description"
      onKeyDown={handleKeyDown}
      className={`fixed inset-0 z-[60] transition-opacity ${
        prefersReducedMotion ? 'duration-0' : 'duration-[250ms] ease-out'
      } ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
    >
      {/* Backdrop overlay */}
      <div
        data-testid="course-drawer-backdrop"
        onClick={onClose}
        className="fixed inset-0 bg-[#04060d]/80 backdrop-blur-md transition-opacity"
        aria-hidden="true"
      />

      {/* Drawer Panel Container */}
      <div
        ref={drawerRef}
        data-testid="course-drawer-panel"
        tabIndex={-1}
        className={`fixed inset-0 md:left-auto md:right-0 md:top-0 md:bottom-0 w-full md:max-w-2xl bg-[#060a14]/95 backdrop-blur-2xl border-l border-white/[0.16] shadow-[-20px_0_60px_rgba(0,0,0,0.8),0_0_40px_rgba(143,180,255,0.12)] flex flex-col justify-between overflow-hidden outline-none ${
          prefersReducedMotion
            ? 'transition-none'
            : 'transition-transform duration-[250ms] ease-out'
        } ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {course && (
          <>
            {/* Top Navigation & Header Bar */}
            <div className="sticky top-0 z-20 px-6 py-4 border-b border-white/[0.1] bg-[#060a14]/90 backdrop-blur-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Category Badge */}
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#04060d]/80 border border-white/15 text-[var(--text)]">
                  {course.category}
                </span>

                {/* Level Pill */}
                <span
                  className={`inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${levelStyle.bg} ${levelStyle.border} ${levelStyle.text}`}
                >
                  {course.level}
                </span>

                {/* Enrolled Status Pill */}
                {enrolled && (
                  <span
                    data-testid="drawer-enrolled-badge"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Enrolled</span>
                  </span>
                )}
              </div>

              {/* Close Button (min 44px tap target) */}
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                aria-label="Close course details"
                data-testid="course-drawer-close"
                className="min-w-[44px] min-h-[44px] rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.15] text-[var(--muted)] hover:text-white flex items-center justify-center transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 custom-scrollbar">
              {/* Course Title and Metadata */}
              <div className="space-y-4">
                <h2
                  id="course-drawer-title"
                  className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text)] leading-snug"
                >
                  {course.title}
                </h2>

                <div className="flex items-center gap-4 flex-wrap text-xs text-[var(--muted)]">
                  {/* Rating */}
                  <div className="flex items-center gap-1.5 text-amber-300 font-semibold bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
                    <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                    <span>{course.rating.toFixed(1)} rating</span>
                  </div>

                  {/* Lessons */}
                  <div className="flex items-center gap-1.5 bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/[0.08]">
                    <BookOpen className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>{course.lessonCount} lessons</span>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center gap-1.5 bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/[0.08]">
                    <Clock className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>{course.duration}</span>
                  </div>
                </div>
              </div>

              {/* Instructor Card */}
              <div className="rounded-2xl p-4 bg-white/[0.03] border border-white/[0.08] flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#8fb4ff]/25 to-indigo-600/20 border border-[#8fb4ff]/30 flex items-center justify-center text-[var(--accent)] text-lg font-semibold shrink-0 shadow-[0_0_15px_rgba(143,180,255,0.15)]">
                  <User className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted)]">
                    Lead Instructor
                  </p>
                  <h4 className="text-sm font-semibold text-[var(--text)] truncate">
                    {course.instructor}
                  </h4>
                  <p className="text-xs text-[var(--muted)]">
                    Academic Fellow, Department of {course.category}
                  </p>
                </div>
              </div>

              {/* Course Description */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--accent)] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>About this course</span>
                </h3>
                <p
                  id="course-drawer-description"
                  className="text-sm text-[var(--text)]/85 leading-relaxed"
                >
                  {course.description}
                </p>
              </div>

              {/* What You'll Learn */}
              {course.learningPoints && course.learningPoints.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--accent)] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>What you'll learn</span>
                  </h3>
                  <div className="grid grid-cols-1 gap-2.5">
                    {course.learningPoints.map((point, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors"
                      >
                        <div className="w-5 h-5 rounded-full bg-[var(--accent)]/15 border border-[var(--accent)]/30 flex items-center justify-center shrink-0 mt-0.5 text-[var(--accent)]">
                          <Check className="w-3 h-3" />
                        </div>
                        <span className="text-xs text-[var(--text)]/90 leading-normal">
                          {point}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Syllabus Outline */}
              {course.syllabus && course.syllabus.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--accent)] flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>Syllabus outline ({course.syllabus.length} modules)</span>
                    </h3>
                  </div>

                  <div className="space-y-2.5">
                    {course.syllabus.map((mod) => {
                      const isExpanded = !!expandedModules[mod.id]
                      return (
                        <div
                          key={mod.id}
                          className="rounded-2xl bg-white/[0.02] border border-white/[0.08] overflow-hidden transition-all"
                        >
                          <button
                            type="button"
                            onClick={() => toggleModule(mod.id)}
                            aria-expanded={isExpanded}
                            aria-label={`Toggle module ${mod.module}: ${mod.title}`}
                            className="w-full min-h-[44px] px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-white/[0.04] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:outline-none"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-xs font-mono font-semibold text-[var(--accent)] px-2 py-0.5 rounded-md bg-[var(--accent)]/10 border border-[var(--accent)]/20">
                                M{mod.module}
                              </span>
                              <span className="text-xs font-medium text-[var(--text)] truncate">
                                {mod.title}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {mod.duration && (
                                <span className="text-[11px] text-[var(--muted)] font-mono hidden sm:inline">
                                  {mod.duration}
                                </span>
                              )}
                              <ChevronDown
                                className={`w-4 h-4 text-[var(--muted)] transition-transform duration-200 ${
                                  isExpanded ? 'rotate-180' : ''
                                }`}
                              />
                            </div>
                          </button>

                          {isExpanded && mod.lessons && mod.lessons.length > 0 && (
                            <div className="px-4 pb-3 pt-1 border-t border-white/[0.04] bg-[#04060d]/40 space-y-1.5">
                              {mod.lessons.map((lesson, lIdx) => (
                                <div
                                  key={lIdx}
                                  className="flex items-center gap-2.5 text-xs text-[var(--muted)] py-1 px-2 rounded-lg hover:text-[var(--text)] transition-colors"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]/50 shrink-0" />
                                  <span className="truncate">{lesson}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Action Footer */}
            <div className="sticky bottom-0 z-20 px-6 py-4 border-t border-white/[0.1] bg-[#060a14]/95 backdrop-blur-2xl flex items-center justify-between gap-4">
              <div className="hidden sm:block">
                <p className="text-xs font-medium text-[var(--text)]">
                  {enrolled ? 'Course enrolled' : 'Ready to start?'}
                </p>
                <p className="text-[11px] text-[var(--muted)]">
                  {enrolled
                    ? 'Resume where you left off in your student workspace'
                    : 'Instant access to all modules and lesson labs'}
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {enrolled ? (
                  <button
                    type="button"
                    onClick={handleContinueLearning}
                    data-testid="drawer-continue-btn"
                    className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_18px_rgba(16,185,129,0.25)] focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Continue learning</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleEnrollClick}
                    data-testid="drawer-enroll-btn"
                    className="w-full sm:w-auto min-h-[44px] px-8 py-2.5 rounded-full bg-[var(--accent)] hover:bg-[#a5c3ff] text-[#04060d] text-xs font-bold tracking-tight flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_24px_rgba(143,180,255,0.4)] active:scale-95 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#060a14] focus-visible:outline-none"
                  >
                    <span>
                      {justEnrolled
                        ? 'Enrolled!'
                        : isCourseFree(course.id)
                        ? 'Enroll for free'
                        : 'Enroll now'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )

  if (typeof document === 'undefined') {
    return null
  }

  return createPortal(drawerContent, document.body)
}

export default CourseDrawer
