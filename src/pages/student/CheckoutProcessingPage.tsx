import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { RefreshCw, ArrowLeft, ShieldAlert } from 'lucide-react'
import { courseCatalog } from '../../data/courseCatalog'
import { SparseStarfield } from '../../components/scene/SparseStarfield'
import { useEnrollment } from '../../context/EnrollmentContext'
import { useToast } from '../../context/ToastContext'

// Keep delay constant at top of file per requirement
export const PROCESSING_DELAY_MS = 2000

export const CheckoutProcessingPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const headingRef = useRef<HTMLHeadingElement | null>(null)
  const { isEnrolled } = useEnrollment()
  const { showToast } = useToast()

  const [hasTimedOut, setHasTimedOut] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  const course = courseCatalog.find((c) => c.id === courseId)
  const isSimulatedFailure = searchParams.get('fail') === '1'

  // Detect prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Guard: block direct visits unless a checkout was started, redirect if already enrolled
  useEffect(() => {
    if (!courseId) return

    const handleCheck = () => {
      try {
        const isAlreadyEnrolled =
          isEnrolled(courseId) ||
          (() => {
            try {
              const stored = sessionStorage.getItem('hermes_student_enrolled_courses')
              return stored ? JSON.parse(stored).includes(courseId) : false
            } catch {
              return false
            }
          })()

        if (isAlreadyEnrolled) {
          showToast('You are already enrolled in this course.', 'info')
          navigate('/student/courses', { replace: true })
          return
        }

        const isPending = sessionStorage.getItem(`hermes_checkout_pending_${courseId}`)
        if (!isPending) {
          // Direct visit without initiating checkout
          navigate(`/student/checkout/${courseId}`, { replace: true })
          return
        }
      } catch (e) {
        console.warn('Failed to verify checkout session guard:', e)
      }
    }

    handleCheck()

    const onPageShow = () => {
      handleCheck()
    }
    window.addEventListener('pageshow', onPageShow)
    return () => window.removeEventListener('pageshow', onPageShow)
  }, [courseId, isEnrolled, navigate, showToast])

  // Timer logic: Wait 2 seconds, then redirect or transition to failure
  useEffect(() => {
    if (!courseId) return

    const timer = setTimeout(() => {
      setHasTimedOut(true)

      if (isSimulatedFailure) {
        // Transition to failure state view on this screen
        // Focus heading in failure state
        setTimeout(() => {
          if (headingRef.current) {
            headingRef.current.focus()
          }
        }, 50)
      } else {
        // Normal success flow: Mark payment verified in session
        try {
          sessionStorage.setItem(`hermes_checkout_success_ready_${courseId}`, 'true')
        } catch (e) {
          console.warn('Failed to set success token:', e)
        }
        navigate(`/student/checkout/${courseId}/success`, { replace: true })
      }
    }, PROCESSING_DELAY_MS)

    return () => clearTimeout(timer)
  }, [courseId, isSimulatedFailure, navigate])

  // Move focus to heading when mounted or when state changes
  useEffect(() => {
    if (headingRef.current) {
      headingRef.current.focus()
    }
  }, [hasTimedOut])

  const handleRetry = () => {
    // Navigate back to checkout
    navigate(`/student/checkout/${courseId}`, { replace: true })
  }

  // 1. Failure state after 2 seconds with ?fail=1
  if (hasTimedOut && isSimulatedFailure) {
    return (
      <main className="min-h-screen bg-[#04060d] text-[var(--text)] flex items-center justify-center p-6 relative overflow-hidden">
        <SparseStarfield particleCount={40} />

        <div className="relative z-10 max-w-lg w-full p-8 rounded-3xl bg-[rgba(6,10,20,0.85)] border border-rose-500/25 backdrop-blur-[14px] shadow-[0_20px_50px_rgba(244,63,94,0.15)] text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1
              ref={headingRef}
              tabIndex={-1}
              id="failure-heading"
              className="text-2xl font-bold tracking-tight text-[var(--text)] outline-none"
            >
              Payment simulation declined
            </h1>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              We could not complete your demo transaction. The simulated bank network or UPI switch timed out before responding. No charges or deductions were made.
            </p>
          </div>

          {course && (
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-left flex items-center justify-between">
              <div>
                <span className="text-[var(--muted)]">Attempted order:</span>
                <p className="font-semibold text-[var(--text)] truncate max-w-xs">{course.title}</p>
              </div>
              <span className="font-mono text-rose-300 font-semibold">Declined</span>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleRetry}
              id="try-again-btn"
              data-testid="try-again-btn"
              className="w-full sm:w-auto min-h-[44px] px-8 py-2.5 rounded-full bg-[var(--accent)] hover:bg-[#a5c3ff] text-[#04060d] text-xs font-bold transition-all shadow-[0_0_20px_rgba(143,180,255,0.3)] active:scale-95 cursor-pointer flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try again</span>
            </button>

            <Link
              to="/student/courses"
              className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-[var(--text)] border border-white/10 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Cancel to catalog</span>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // 2. Animated processing state (2 seconds)
  return (
    <main className="min-h-screen bg-[#04060d] text-[var(--text)] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Small starfield background */}
      <SparseStarfield particleCount={50} />

      <div className="relative z-10 max-w-md w-full p-8 rounded-3xl bg-[rgba(6,10,20,0.82)] border border-white/15 backdrop-blur-[14px] shadow-[0_20px_50px_rgba(0,0,0,0.6)] text-center space-y-6">
        {/* Animated spinner with reduced-motion support */}
        <div className="flex justify-center">
          <div className="relative w-20 h-20 flex items-center justify-center">
            {/* Outer halo */}
            <div className="absolute inset-0 rounded-full bg-[var(--accent)]/15 blur-lg" />
            
            {/* SVG Spinner */}
            <svg
              className={`w-16 h-16 text-[var(--accent)] ${
                prefersReducedMotion ? '' : 'animate-spin'
              }`}
              viewBox="0 0 24 24"
              fill="none"
              role="img"
              aria-label="Processing animation"
            >
              <circle
                className="opacity-20"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="opacity-90"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        </div>

        <div className="space-y-2">
          <h1
            ref={headingRef}
            tabIndex={-1}
            id="processing-heading"
            className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text)] outline-none"
          >
            Processing your demo payment
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
            Contacting simulated banking gateway. Enrolling your student account in{' '}
            <span className="text-[var(--text)] font-medium">
              {course ? course.title : 'course'}
            </span>
            ...
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.08] text-[11px] text-[var(--muted)] font-mono flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
          <span>Simulated latency (2000ms)...</span>
        </div>
      </div>
    </main>
  )
}

export default CheckoutProcessingPage
