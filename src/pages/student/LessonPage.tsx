import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { useEnrollment } from '../../context/EnrollmentContext'
import { useProgress } from '../../context/ProgressContext'
import { useToast } from '../../context/ToastContext'
import { courseCatalog } from '../../data/courseCatalog'
import {
  findLesson,
  getCourseLessons,
  getNextLesson,
  getPreviousLesson,
} from '../../utils/lessonHelper'
import { LessonTopBar } from '../../components/lesson/LessonTopBar'
import { LessonVideoPlayer } from '../../components/lesson/LessonVideoPlayer'
import { LessonActionRow } from '../../components/lesson/LessonActionRow'
import { LessonResources } from '../../components/lesson/LessonResources'
import { LessonOutline } from '../../components/lesson/LessonOutline'
import { LessonCompletionPrompt } from '../../components/lesson/LessonCompletionPrompt'
import { SparseStarfield } from '../../components/scene/SparseStarfield'

export const LessonPage: React.FC = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>()
  const navigate = useNavigate()
  const { isEnrolled } = useEnrollment()
  const { showToast } = useToast()
  const {
    isLessonCompleted,
    toggleLessonComplete,
    markLessonComplete,
    getPlaybackPosition,
    setPlaybackPosition,
    getCourseProgress,
  } = useProgress()

  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false)
  const [showNinetyPercentPrompt, setShowNinetyPercentPrompt] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const titleHeadingRef = useRef<HTMLHeadingElement>(null)

  // Listen for prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // 1. Course lookup
  const course = courseId ? courseCatalog.find((c) => c.id === courseId) : null
  const allLessons = course ? getCourseLessons(course.id) : []

  // 2. Lesson lookup (handles direct ID, alias lsn_01, slug, or numeric index)
  const currentLesson = course && lessonId ? findLesson(course.id, lessonId) : null

  // 3. Enrollment verification
  const enrolled = courseId ? isEnrolled(courseId) : false

  useEffect(() => {
    if (courseId && !enrolled && course) {
      showToast('You must be enrolled in this course to access lessons.', 'error')
      navigate(`/student/courses?course=${courseId}`, { replace: true })
    }
  }, [courseId, enrolled, course, navigate, showToast])

  // Focus management on lesson change
  useEffect(() => {
    if (currentLesson && titleHeadingRef.current) {
      titleHeadingRef.current.focus()
    }
    setShowNinetyPercentPrompt(false)
  }, [currentLesson?.id])

  // Global Keyboard shortcuts: "N" for next, "P" for previous (when not typing in an input)
  useEffect(() => {
    if (!course || !currentLesson) return

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase()
      const isInput =
        activeTag === 'input' ||
        activeTag === 'textarea' ||
        activeTag === 'select' ||
        (document.activeElement as HTMLElement)?.isContentEditable

      if (isInput) return

      if (e.key === 'n' || e.key === 'N') {
        const next = getNextLesson(course.id, currentLesson.id)
        if (next) {
          e.preventDefault()
          navigate(`/student/learn/${course.id}/${next.id}`)
        }
      } else if (e.key === 'p' || e.key === 'P') {
        const prev = getPreviousLesson(course.id, currentLesson.id)
        if (prev) {
          e.preventDefault()
          navigate(`/student/learn/${course.id}/${prev.id}`)
        }
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [course, currentLesson, navigate])

  // Handlers for Next / Prev navigation
  const handleNext = useCallback(() => {
    if (!course || !currentLesson) return
    const next = getNextLesson(course.id, currentLesson.id)
    if (next) {
      navigate(`/student/learn/${course.id}/${next.id}`)
    }
  }, [course, currentLesson, navigate])

  const handlePrevious = useCallback(() => {
    if (!course || !currentLesson) return
    const prev = getPreviousLesson(course.id, currentLesson.id)
    if (prev) {
      navigate(`/student/learn/${course.id}/${prev.id}`)
    }
  }, [course, currentLesson, navigate])

  const handleSelectLesson = useCallback(
    (newLessonId: string) => {
      if (!course) return
      navigate(`/student/learn/${course.id}/${newLessonId}`)
    },
    [course, navigate]
  )

  const handleToggleComplete = useCallback(() => {
    if (!course || !currentLesson) return
    const isNowDone = toggleLessonComplete(course.id, currentLesson.id)
    if (isNowDone) {
      setShowNinetyPercentPrompt(false)
    }
  }, [course, currentLesson, toggleLessonComplete])

  const handlePromptComplete = useCallback(() => {
    if (!course || !currentLesson) return
    markLessonComplete(course.id, currentLesson.id)
    setShowNinetyPercentPrompt(false)
    showToast('Lesson marked as complete!', 'success')
  }, [course, currentLesson, markLessonComplete, showToast])

  // Early return for unauthorized students (redirect is happening in useEffect)
  if (!enrolled && course) {
    return null
  }

  // Friendly not-found states for invalid course or lesson IDs
  if (!course) {
    return (
      <main className="min-h-screen bg-[#04060d] text-[var(--text)] flex items-center justify-center p-6 relative overflow-hidden">
        <SparseStarfield particleCount={40} />
        <div
          data-testid="lesson-not-found-card"
          className="max-w-md w-full p-8 rounded-3xl bg-[#060a14]/90 backdrop-blur-2xl border border-white/[0.16] shadow-2xl text-center space-y-5 relative z-10"
        >
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-[var(--text)]">Course not found</h1>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              We couldn&apos;t locate the course you requested. It may have been removed or the URL is incorrect.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/student/courses"
              id="not-found-catalog-link"
              data-testid="not-found-catalog-link"
              className="min-h-[44px] px-6 py-2.5 rounded-full bg-[var(--accent)] hover:bg-[#a5c3ff] text-[#04060d] text-xs font-bold inline-flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(143,180,255,0.3)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Browse course catalog</span>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  if (!currentLesson) {
    const firstLesson = allLessons[0]
    return (
      <main className="min-h-screen bg-[#04060d] text-[var(--text)] flex items-center justify-center p-6 relative overflow-hidden">
        <SparseStarfield particleCount={40} />
        <div
          data-testid="lesson-not-found-card"
          className="max-w-md w-full p-8 rounded-3xl bg-[#060a14]/90 backdrop-blur-2xl border border-white/[0.16] shadow-2xl text-center space-y-5 relative z-10"
        >
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-[var(--text)]">Lesson not found</h1>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              The requested lesson ID could not be found within {course.title}.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {firstLesson && (
              <Link
                to={`/student/learn/${course.id}/${firstLesson.id}`}
                id="not-found-first-lesson-link"
                data-testid="not-found-first-lesson-link"
                className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-full bg-[var(--accent)] hover:bg-[#a5c3ff] text-[#04060d] text-xs font-bold inline-flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(143,180,255,0.3)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              >
                <span>Start from lesson 1</span>
              </Link>
            )}
            <Link
              to={`/student/courses?course=${course.id}`}
              className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-xs font-medium text-[var(--muted)] hover:text-[var(--text)] inline-flex items-center justify-center gap-2 transition-colors border border-white/10"
            >
              <span>Course details</span>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // Active lesson metrics
  const progressSummary = getCourseProgress(course.id)
  const isCompleted = isLessonCompleted(course.id, currentLesson.id)
  const isFirstLesson = currentLesson.order === 1
  const isLastLesson = currentLesson.order === allLessons.length
  const savedPosition = getPlaybackPosition(course.id, currentLesson.id)

  return (
    <div className="min-h-screen bg-[#04060d] text-[var(--text)] font-sans flex flex-col relative overflow-x-hidden selection:bg-[var(--accent)] selection:text-[#04060d]">
      {/* Background Starfield */}
      <SparseStarfield particleCount={80} />

      {/* Top Progress Strip Header */}
      <LessonTopBar
        course={course}
        lesson={currentLesson}
        totalLessons={allLessons.length}
        progressPercentage={progressSummary.percentage}
        onOpenMobileOutline={() => setIsMobileSheetOpen(true)}
      />

      {/* Main Container: 2-column layout (main + sidebar) */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Main Column: Video Player, Title, Action Row, Resources */}
          <main className="md:col-span-8 lg:col-span-8 space-y-6 pb-20 md:pb-6">
            {/* 1. Video Player */}
            <LessonVideoPlayer
              lessonId={currentLesson.id}
              courseId={course.id}
              title={currentLesson.title}
              videoUrl={currentLesson.videoUrl}
              initialPosition={savedPosition}
              onPositionChange={(sec) => setPlaybackPosition(course.id, currentLesson.id, sec)}
              onReachNinetyPercent={() => {
                if (!isCompleted) {
                  setShowNinetyPercentPrompt(true)
                }
              }}
            />

            {/* 2. 90% Completion Prompt Banner */}
            <LessonCompletionPrompt
              isOpen={showNinetyPercentPrompt && !isCompleted}
              onComplete={handlePromptComplete}
              onDismiss={() => setShowNinetyPercentPrompt(false)}
            />

            {/* 3. Title & Description Area (Cross-fades 200ms on lesson change) */}
            <div
              key={currentLesson.id}
              className={`space-y-3 ${
                prefersReducedMotion
                  ? ''
                  : 'animate-in fade-in duration-200 ease-out'
              }`}
            >
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
                  Module {currentLesson.moduleNumber} • {currentLesson.moduleTitle}
                </span>
                <span className="text-xs text-[var(--muted)] font-mono">
                  {currentLesson.duration}
                </span>
              </div>

              <h1
                ref={titleHeadingRef}
                tabIndex={-1}
                id="lesson-title-heading"
                data-testid="lesson-title-heading"
                className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-[var(--text)] outline-none"
              >
                {currentLesson.title}
              </h1>

              <p className="text-sm text-[var(--muted)] leading-relaxed">
                {currentLesson.description}
              </p>
            </div>

            {/* 4. Desktop Action Row */}
            <div className="hidden md:block pt-2 border-t border-white/[0.08]">
              <LessonActionRow
                courseId={course.id}
                isFirstLesson={isFirstLesson}
                isLastLesson={isLastLesson}
                isCompleted={isCompleted}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onToggleComplete={handleToggleComplete}
                prefersReducedMotion={prefersReducedMotion}
              />
            </div>

            {/* 5. Downloadable Resources */}
            <div className="pt-2 border-t border-white/[0.08]">
              <LessonResources resources={currentLesson.resources} />
            </div>
          </main>

          {/* Side Column: Outline Sidebar */}
          <div className="md:col-span-4 lg:col-span-4">
            <LessonOutline
              course={course}
              currentLesson={currentLesson}
              allLessons={allLessons}
              isLessonCompleted={isLessonCompleted}
              onSelectLesson={handleSelectLesson}
              isMobileSheetOpen={isMobileSheetOpen}
              onCloseMobileSheet={() => setIsMobileSheetOpen(false)}
              prefersReducedMotion={prefersReducedMotion}
            />
          </div>
        </div>
      </div>

      {/* Mobile Sticky Action Bar (< 768px) */}
      <aside
        data-testid="mobile-sticky-action-bar"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#060a14]/95 backdrop-blur-2xl border-t border-white/[0.14] px-4 py-2 shadow-[0_-10px_25px_rgba(0,0,0,0.8)]"
      >
        <LessonActionRow
          courseId={course.id}
          isFirstLesson={isFirstLesson}
          isLastLesson={isLastLesson}
          isCompleted={isCompleted}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onToggleComplete={handleToggleComplete}
          prefersReducedMotion={prefersReducedMotion}
        />
      </aside>
    </div>
  )
}

export default LessonPage
