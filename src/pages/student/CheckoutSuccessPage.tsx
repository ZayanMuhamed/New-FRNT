import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { CheckCircle2, ArrowRight, LayoutDashboard, Sparkles, BookOpen } from 'lucide-react'
import { courseCatalog } from '../../data/courseCatalog'
import { getCourseLessons } from '../../utils/lessonHelper'
import { useEnrollment } from '../../context/EnrollmentContext'
import { useToast } from '../../context/ToastContext'
import { ParticleBurstCanvas } from '../../components/checkout/ParticleBurstCanvas'
import { SparseStarfield } from '../../components/scene/SparseStarfield'

// Keep constant at top of file per requirement
export const BURST_DURATION_MS = 1500

export const CheckoutSuccessPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const headingRef = useRef<HTMLHeadingElement | null>(null)
  const hasProcessedRef = useRef(false)
  const { enrollCourse } = useEnrollment()
  const { showToast } = useToast()
  const [isValidSession, setIsValidSession] = useState(false)

  const course = courseCatalog.find((c) => c.id === courseId)

  // Guard: Block direct visits unless checkout was started / verified
  useEffect(() => {
    if (!courseId) return

    try {
      const isPending = sessionStorage.getItem(`hermes_checkout_pending_${courseId}`)
      const isReady = sessionStorage.getItem(`hermes_checkout_success_ready_${courseId}`)
      const isCompleted = sessionStorage.getItem(`hermes_checkout_completed_${courseId}`)

      // If no valid checkout session token exists, direct visit is blocked
      if (!isPending && !isReady && !isCompleted) {
        showToast('Please initiate checkout to enroll.', 'warning')
        navigate('/student/courses', { replace: true })
        return
      }

      setIsValidSession(true)

      // Only perform enrollment and session transition once
      if (!hasProcessedRef.current) {
        hasProcessedRef.current = true
        enrollCourse(courseId)

        // Store completed token so page refresh remains valid, while clearing pending tokens
        sessionStorage.setItem(`hermes_checkout_completed_${courseId}`, 'true')
        sessionStorage.removeItem(`hermes_checkout_pending_${courseId}`)
        sessionStorage.removeItem(`hermes_checkout_success_ready_${courseId}`)
      }
    } catch (e) {
      console.warn('Failed to verify or clear checkout tokens in sessionStorage:', e)
    }
  }, [courseId, enrollCourse, navigate, showToast])

  // Move focus to heading when valid session is confirmed
  useEffect(() => {
    if (isValidSession && headingRef.current) {
      headingRef.current.focus()
    }
  }, [isValidSession])

  if (!isValidSession || !course) {
    return null
  }

  const handleStartLesson = () => {
    const lessons = getCourseLessons(course.id)
    if (lessons.length > 0) {
      navigate(`/student/learn/${course.id}/${lessons[0].id}`)
    } else {
      navigate('/student/dashboard')
    }
  }

  return (
    <main className="min-h-screen bg-[#04060d] text-[var(--text)] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background starfield */}
      <SparseStarfield particleCount={60} />

      {/* Single celebratory particle burst canvas */}
      <ParticleBurstCanvas duration={BURST_DURATION_MS} />

      {/* Success Card */}
      <div className="relative z-20 max-w-lg w-full p-8 sm:p-10 rounded-3xl bg-[rgba(6,10,20,0.88)] border border-emerald-500/30 backdrop-blur-[16px] shadow-[0_25px_60px_rgba(0,0,0,0.7),0_0_40px_rgba(16,185,129,0.15)] text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
        {/* Glowing Success Badge */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
            <div className="relative w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shadow-[0_0_24px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Heading & Details */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Enrollment confirmed</span>
          </div>

          <h1
            ref={headingRef}
            tabIndex={-1}
            id="success-heading"
            className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text)] outline-none"
          >
            Payment successful
          </h1>

          <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed max-w-sm mx-auto">
            You are now officially enrolled in{' '}
            <strong className="text-[var(--text)] font-semibold">
              {course.title}
            </strong>
            . All lessons and labs are active in your student workspace.
          </p>
        </div>

        {/* Course Card Snapshot */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-left space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-[var(--accent)] font-semibold uppercase">
              {course.category}
            </span>
            <span className="text-[11px] text-[var(--muted)]">
              Instructor: {course.instructor}
            </span>
          </div>
          <h2 className="text-sm font-semibold text-[var(--text)] truncate">
            {course.title}
          </h2>
          <div className="flex items-center gap-3 text-xs text-[var(--muted)] pt-1">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{course.lessonCount} lessons</span>
            </span>
            <span>•</span>
            <span>{course.duration}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={handleStartLesson}
            id="start-first-lesson-btn"
            data-testid="start-first-lesson-btn"
            className="w-full min-h-[48px] px-8 py-3 rounded-full bg-[var(--accent)] hover:bg-[#a5c3ff] text-[#04060d] text-sm font-bold tracking-tight transition-all shadow-[0_0_24px_rgba(143,180,255,0.4)] active:scale-95 cursor-pointer flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            <span>Start first lesson</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div>
            <Link
              to="/student/dashboard"
              id="go-to-dashboard-link"
              data-testid="go-to-dashboard-link"
              className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-6 text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors rounded-full focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Go to dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

export default CheckoutSuccessPage
