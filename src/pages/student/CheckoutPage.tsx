import React, { useEffect, useRef, useState, useId } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ShieldCheck,
  CreditCard,
  Smartphone,
  Building2,
  Clock,
  BookOpen,
  User,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  Check,
} from 'lucide-react'
import { courseCatalog } from '../../data/courseCatalog'
import { useEnrollment } from '../../context/EnrollmentContext'
import { useToast } from '../../context/ToastContext'
import { getCoursePricingDetails, isCourseFree } from '../../utils/coursePricing'
import { SparseStarfield } from '../../components/scene/SparseStarfield'

export type PaymentMethod = 'upi' | 'card' | 'netbanking'

interface PaymentOption {
  id: PaymentMethod
  title: string
  subtitle: string
  icon: React.ReactNode
}

export const CheckoutPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const headingRef = useRef<HTMLHeadingElement | null>(null)
  const { isEnrolled, enrollCourse } = useEnrollment()
  const { showToast } = useToast()

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('upi')
  const radioGroupLabelId = useId()

  const course = courseCatalog.find((c) => c.id === courseId)
  const isFree = courseId ? isCourseFree(courseId) : false

  // Focus management: move focus to heading on mount
  useEffect(() => {
    if (headingRef.current) {
      headingRef.current.focus()
    }
  }, [courseId])

  // Guards: redirect already-enrolled or free courses (including BFCache restore)
  useEffect(() => {
    const handleCheck = () => {
      if (!course) return

      const isEnrolledNow =
        isEnrolled(course.id) ||
        (() => {
          try {
            const stored = sessionStorage.getItem('hermes_student_enrolled_courses')
            return stored ? JSON.parse(stored).includes(course.id) : false
          } catch {
            return false
          }
        })()

      if (isEnrolledNow) {
        showToast('You are already enrolled in this course.', 'info')
        navigate('/student/courses', { replace: true })
        return
      }

      if (isFree) {
        // Auto-enroll free courses and redirect with toast
        enrollCourse(course.id)
        showToast(`This course is free. You have been enrolled!`, 'success')
        navigate('/student/courses', { replace: true })
        return
      }
    }

    handleCheck()

    // Handle browser Back-Forward Cache (bfcache)
    const onPageShow = () => {
      handleCheck()
    }
    window.addEventListener('pageshow', onPageShow)
    return () => window.removeEventListener('pageshow', onPageShow)
  }, [course, isEnrolled, isFree, navigate, showToast, enrollCourse])

  if (!course) {
    return (
      <main className="min-h-screen bg-[#04060d] text-[var(--text)] flex items-center justify-center p-6 relative overflow-hidden">
        <SparseStarfield particleCount={40} />
        <div className="relative z-10 max-w-md w-full p-8 rounded-3xl bg-[rgba(6,10,20,0.85)] border border-white/15 backdrop-blur-xl text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1
            ref={headingRef}
            tabIndex={-1}
            id="not-found-heading"
            className="text-xl font-bold tracking-tight outline-none"
          >
            Course not found
          </h1>
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            The course you are attempting to purchase does not exist or may have been removed.
          </p>
          <div className="pt-2">
            <Link
              to="/student/courses"
              className="inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 rounded-full bg-[var(--accent)] hover:bg-[#a5c3ff] text-[#04060d] text-xs font-bold transition-all shadow-[0_0_20px_rgba(143,180,255,0.3)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              Back to catalog
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const pricing = getCoursePricingDetails(course)

  // Payment Options ordered: UPI first, then Card, then Net banking
  const paymentOptions: PaymentOption[] = [
    {
      id: 'upi',
      title: 'UPI',
      subtitle: 'Google Pay, PhonePe, Paytm, BHIM',
      icon: <Smartphone className="w-4 h-4 text-[var(--accent)]" />,
    },
    {
      id: 'card',
      title: 'Card',
      subtitle: 'Visa, MasterCard, RuPay (demo only)',
      icon: <CreditCard className="w-4 h-4 text-emerald-400" />,
    },
    {
      id: 'netbanking',
      title: 'Net banking',
      subtitle: 'All major Indian banks',
      icon: <Building2 className="w-4 h-4 text-purple-400" />,
    },
  ]

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = index
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      nextIndex = (index + 1) % paymentOptions.length
      setSelectedMethod(paymentOptions[nextIndex].id)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      nextIndex = (index - 1 + paymentOptions.length) % paymentOptions.length
      setSelectedMethod(paymentOptions[nextIndex].id)
    }
  }

  const handlePay = () => {
    // Record checkout started flag in sessionStorage
    try {
      sessionStorage.setItem(`hermes_checkout_pending_${course.id}`, 'true')
      sessionStorage.setItem('hermes_active_checkout_course', course.id)
    } catch (err) {
      console.warn('Failed to store checkout pending state:', err)
    }

    navigate(`/student/checkout/${course.id}/processing`)
  }

  return (
    <div className="min-h-screen bg-[#04060d] text-[var(--text)] relative overflow-hidden flex flex-col justify-between">
      {/* Background Starfield */}
      <SparseStarfield particleCount={50} />

      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            to="/student/courses"
            className="inline-flex items-center gap-2 text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors min-h-[44px] px-2 rounded-lg focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to course catalog</span>
          </Link>
        </div>

        {/* Page Heading */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Secure checkout</span>
            </span>
            <span className="text-xs text-[var(--muted)] font-mono">Demo mode</span>
          </div>
          <h1
            ref={headingRef}
            tabIndex={-1}
            id="checkout-heading"
            className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text)] outline-none"
          >
            Checkout
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
            Complete your enrollment to unlock full course lectures, labs, and interactive syllabus.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Payment Method Selection & Demo Notice (7 cols) */}
          <section
            aria-label="Payment method selection"
            className="lg:col-span-7 space-y-6"
          >
            {/* Demo Notice Banner */}
            <div
              role="note"
              className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 shadow-[0_4px_20px_rgba(245,158,11,0.08)]"
            >
              <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-semibold text-amber-300">
                  Demo payment: no real charge
                </p>
                <p className="text-amber-200/80 leading-relaxed">
                  This checkout is an educational simulation. No actual credit card, UPI, or banking transaction will take place, and no real payment credentials will be requested.
                </p>
              </div>
            </div>

            {/* Payment Method Pills */}
            <div className="p-6 rounded-3xl bg-[rgba(6,10,20,0.78)] border border-white/15 backdrop-blur-[14px] shadow-[0_12px_32px_rgba(0,0,0,0.5)] space-y-4">
              <div>
                <h2
                  id={radioGroupLabelId}
                  className="text-sm font-semibold text-[var(--text)]"
                >
                  Select payment method
                </h2>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  Select your preferred test payment rail. UPI is prioritized.
                </p>
              </div>

              {/* Radio Group Pills */}
              <div
                role="radiogroup"
                aria-labelledby={radioGroupLabelId}
                className="flex flex-col sm:flex-row gap-3"
              >
                {paymentOptions.map((opt, idx) => {
                  const isSelected = selectedMethod === opt.id
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      tabIndex={isSelected ? 0 : -1}
                      onClick={() => setSelectedMethod(opt.id)}
                      onKeyDown={(e) => handleKeyDown(e, idx)}
                      id={`payment-method-${opt.id}`}
                      data-testid={`payment-method-${opt.id}`}
                      className={`flex-1 min-h-[44px] px-4 py-3 rounded-full text-xs font-semibold flex items-center justify-between sm:justify-center gap-2.5 transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-[var(--accent)]/15 border-[var(--accent)] text-[var(--text)] shadow-[0_0_18px_rgba(143,180,255,0.25)]'
                          : 'bg-white/[0.03] border-white/10 text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/[0.06]'
                      } focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:outline-none`}
                    >
                      <span className="flex items-center gap-2">
                        {opt.icon}
                        <span>{opt.title}</span>
                      </span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Method explanation details */}
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.08] text-xs text-[var(--muted)] flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <span>
                  Active simulation method:{' '}
                  <strong className="text-[var(--text)] font-medium">
                    {paymentOptions.find((o) => o.id === selectedMethod)?.title}
                  </strong>{' '}
                  ({paymentOptions.find((o) => o.id === selectedMethod)?.subtitle})
                </span>
              </div>
            </div>

            {/* Action Pay Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handlePay}
                id="pay-demo-btn"
                data-testid="pay-demo-btn"
                className="w-full min-h-[48px] px-8 py-3 rounded-full bg-[var(--accent)] hover:bg-[#a5c3ff] text-[#04060d] text-sm font-bold tracking-tight transition-all shadow-[0_0_24px_rgba(143,180,255,0.35)] active:scale-95 cursor-pointer flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04060d] focus-visible:outline-none"
              >
                <span>Pay (demo) {pricing.formattedTotal}</span>
              </button>
              <p className="text-[11px] text-center text-[var(--muted)] mt-2">
                Simulated transaction. Instant access upon completion.
              </p>
            </div>
          </section>

          {/* Right Column: Order Summary Card (5 cols) */}
          <aside
            aria-label="Order summary"
            className="lg:col-span-5 p-6 rounded-3xl bg-[rgba(6,10,20,0.78)] border border-white/15 backdrop-blur-[14px] shadow-[0_12px_32px_rgba(0,0,0,0.5)] space-y-6"
          >
            <div>
              <h2 className="text-sm font-semibold text-[var(--text)]">
                Order summary
              </h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Review course details and final pricing
              </p>
            </div>

            {/* Course Card Preview */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 uppercase">
                  {course.category}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-[var(--muted)]">
                  {course.level}
                </span>
              </div>

              <h3 className="text-sm font-semibold text-[var(--text)] leading-snug">
                {course.title}
              </h3>

              <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                <User className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span className="truncate">{course.instructor}</span>
              </div>

              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs text-[var(--muted)]">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{course.lessonCount} lessons</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{course.duration}</span>
                </span>
              </div>
            </div>

            {/* Price Line Items */}
            <div className="space-y-2.5 text-xs text-[var(--muted)]">
              <div className="flex items-center justify-between">
                <span>Course fee</span>
                <span className="text-[var(--text)] font-mono font-medium">
                  {pricing.formattedPrice}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Tax & platform fees</span>
                <span className="text-emerald-400 font-mono">
                  {pricing.formattedTax}
                </span>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-sm">
                <span className="font-semibold text-[var(--text)]">Total amount</span>
                <span className="font-bold text-[var(--accent)] font-mono text-base">
                  {pricing.formattedTotal}
                </span>
              </div>
            </div>

            {/* Satisfaction Guarantee */}
            <div className="pt-4 border-t border-white/[0.06] flex items-center gap-2 text-[11px] text-[var(--muted)]">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Full academic access with peer discussions and syllabus labs.</span>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-xs text-[var(--muted)] border-t border-white/[0.06]">
        <span>Hermes Learning Portal • Academic Year 2025–2026</span>
      </footer>
    </div>
  )
}

export default CheckoutPage
