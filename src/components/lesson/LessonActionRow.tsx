import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Trophy,
  Check,
} from 'lucide-react'

export interface LessonActionRowProps {
  courseId: string
  isFirstLesson: boolean
  isLastLesson: boolean
  isCompleted: boolean
  onPrevious: () => void
  onNext: () => void
  onToggleComplete: () => void
  onCourseCompleteClick?: () => void
  prefersReducedMotion?: boolean
}

export const LessonActionRow: React.FC<LessonActionRowProps> = ({
  courseId,
  isFirstLesson,
  isLastLesson,
  isCompleted,
  onPrevious,
  onNext,
  onToggleComplete,
  prefersReducedMotion = false,
}) => {
  const [justToggled, setJustToggled] = useState(false)

  const handleToggle = () => {
    onToggleComplete()
    setJustToggled(true)
    setTimeout(() => setJustToggled(false), 800)
  }

  return (
    <div
      data-testid="lesson-action-row"
      className="w-full flex items-center justify-between gap-3 sm:gap-4 py-2 sm:py-3"
    >
      {/* Previous Button */}
      <button
        type="button"
        onClick={onPrevious}
        disabled={isFirstLesson}
        data-testid="lesson-prev-btn"
        aria-label={isFirstLesson ? 'No previous lesson' : 'Go to previous lesson (P)'}
        aria-disabled={isFirstLesson}
        className={`min-h-[44px] min-w-[44px] px-4 sm:px-5 py-2.5 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:outline-none ${
          isFirstLesson
            ? 'opacity-40 cursor-not-allowed bg-white/[0.03] text-[var(--muted)] border border-white/5'
            : 'bg-white/[0.05] hover:bg-white/[0.1] text-[var(--text)] border border-white/10 active:scale-95 cursor-pointer'
        }`}
      >
        <ChevronLeft className="w-4 h-4 shrink-0" />
        <span className="hidden xs:inline">Previous</span>
      </button>

      {/* Center: Mark as Complete / Undo Pill Button */}
      <button
        type="button"
        onClick={handleToggle}
        data-testid="lesson-complete-btn"
        aria-label={
          isCompleted
            ? 'Lesson completed. Click to undo mark as complete.'
            : 'Mark lesson as complete'
        }
        className={`min-h-[44px] px-5 sm:px-7 py-2.5 rounded-full text-xs font-bold tracking-tight flex items-center justify-center gap-2 transition-all cursor-pointer select-none active:scale-95 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:outline-none ${
          isCompleted
            ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
            : 'bg-[var(--accent)] hover:bg-[#a5c3ff] text-[#04060d] border border-transparent shadow-[0_0_22px_rgba(143,180,255,0.35)]'
        }`}
      >
        <div
          className={`shrink-0 transition-transform ${
            justToggled && !prefersReducedMotion ? 'scale-125 duration-200 ease-out' : ''
          }`}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          ) : (
            <Check className="w-4 h-4 stroke-[2.5]" />
          )}
        </div>
        <span>{isCompleted ? 'Completed' : 'Mark as complete'}</span>
        {isCompleted && (
          <span className="text-[11px] text-emerald-300/70 font-normal hidden sm:inline">
            (click to undo)
          </span>
        )}
      </button>

      {/* Next or Course Complete Button */}
      {isLastLesson ? (
        <Link
          to={`/student/courses?course=${courseId}`}
          data-testid="lesson-course-complete-btn"
          aria-label="Course complete. Return to course overview"
          className="min-h-[44px] min-w-[44px] px-4 sm:px-5 py-2.5 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-200 border border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.2)] active:scale-95 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
        >
          <Trophy className="w-4 h-4 text-amber-300 shrink-0" />
          <span className="hidden xs:inline">Course complete</span>
          <ChevronRight className="w-4 h-4 shrink-0" />
        </Link>
      ) : (
        <button
          type="button"
          onClick={onNext}
          data-testid="lesson-next-btn"
          aria-label="Go to next lesson (N)"
          className="min-h-[44px] min-w-[44px] px-4 sm:px-5 py-2.5 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer bg-white/[0.05] hover:bg-white/[0.1] text-[var(--text)] border border-white/10 active:scale-95 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:outline-none"
        >
          <span className="hidden xs:inline">Next</span>
          <ChevronRight className="w-4 h-4 shrink-0" />
        </button>
      )}
    </div>
  )
}
