import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { CatalogCourse } from '../../types/course'
import { CourseLesson } from '../../types/lesson'

export interface LessonTopBarProps {
  course: CatalogCourse
  lesson: CourseLesson
  totalLessons: number
  progressPercentage: number
  onOpenMobileOutline: () => void
}

export const LessonTopBar: React.FC<LessonTopBarProps> = ({
  course,
  lesson,
  totalLessons,
  progressPercentage,
  onOpenMobileOutline,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/[0.1] bg-[#060a14]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Back Link & Course Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to={`/student/courses?course=${course.id}`}
            id="back-to-course-btn"
            data-testid="back-to-course-btn"
            aria-label={`Back to ${course.title}`}
            className="shrink-0 min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[var(--muted)] hover:text-[var(--text)] border border-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:outline-none"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--accent)] font-semibold hidden sm:inline">
                {course.category}
              </span>
              <span className="text-[var(--muted)] text-xs hidden sm:inline">•</span>
              <span className="text-xs text-[var(--muted)] truncate">
                {course.title}
              </span>
            </div>
            <h1 className="text-sm font-semibold text-[var(--text)] truncate hidden md:block">
              {lesson.title}
            </h1>
          </div>
        </div>

        {/* Right: Progress Indicator & Mobile Outline Trigger */}
        <div className="flex items-center gap-3 sm:gap-5 shrink-0">
          {/* Progress Indicator */}
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[var(--muted)] font-medium">
                Lesson <span className="text-[var(--text)] font-semibold">{lesson.order}</span> of{' '}
                <span className="text-[var(--text)] font-semibold">{totalLessons}</span>
              </span>
              <span className="text-xs font-mono font-bold text-[var(--accent)] px-2 py-0.5 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20">
                {progressPercentage}%
              </span>
            </div>

            {/* Thin progress bar */}
            <div
              role="progressbar"
              aria-label="Course completion progress"
              aria-valuenow={progressPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              className="w-28 sm:w-36 h-1.5 mt-1 rounded-full bg-white/10 overflow-hidden relative"
            >
              <div
                className="h-full bg-gradient-to-r from-[var(--accent)] to-emerald-400 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Mobile "Course content" Outline Button (< 768px) */}
          <button
            type="button"
            onClick={onOpenMobileOutline}
            id="mobile-outline-toggle-btn"
            data-testid="mobile-outline-toggle-btn"
            aria-label="Open course content outline"
            className="md:hidden min-h-[44px] px-3.5 py-2 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20 border border-[var(--accent)]/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:outline-none"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden xs:inline">Content</span>
          </button>
        </div>
      </div>
    </header>
  )
}
