import React from 'react'
import { Clock, Play, BookOpen, ArrowRight } from 'lucide-react'
import { formatRelativeTime } from '../../utils/formatTime'

export interface RecentLessonItem {
  id: string
  title: string
  courseId: string
  courseName?: string
  courseTitle?: string
  duration?: string
  accessedAt: string | Date
  lessonNumber?: number
}

export interface RecentLessonsProps {
  lessons?: RecentLessonItem[]
  onSelectLesson?: (lesson: RecentLessonItem) => void
  onExploreCourses?: () => void
  className?: string
}

export const RecentLessons: React.FC<RecentLessonsProps> = ({
  lessons = [],
  onSelectLesson,
  onExploreCourses,
  className = '',
}) => {
  const isEmpty = lessons.length === 0

  return (
    <section aria-labelledby="recent-lessons-heading" className={`w-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <h2
            id="recent-lessons-heading"
            className="text-lg font-semibold text-[var(--text)] tracking-tight"
          >
            Recent lessons
          </h2>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[var(--muted)] font-mono">
            {lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'}
          </span>
        </div>
        {!isEmpty && (
          <span className="text-xs text-[var(--muted)] hidden sm:inline">
            Pick up where you left off
          </span>
        )}
      </div>

      {/* Content or Friendly Empty State */}
      {isEmpty ? (
        <div
          role="region"
          aria-label="No recent lessons"
          className="frosted-glass rounded-2xl border border-white/10 p-8 sm:p-10 text-center flex flex-col items-center justify-center transition-all"
        >
          <div className="w-14 h-14 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] mb-4 shadow-[0_0_20px_rgba(143,180,255,0.15)]">
            <BookOpen className="w-6 h-6" />
          </div>

          <h3 className="text-base font-medium text-[var(--text)] mb-2">
            No recent lessons yet
          </h3>

          <p className="text-xs sm:text-sm text-[var(--muted)] max-w-md leading-relaxed mb-6">
            You haven&apos;t jumped into any learning sessions yet. Explore your enrolled courses or resume your active coursework to start tracking your recent lessons here.
          </p>

          <button
            type="button"
            onClick={onExploreCourses}
            aria-label="Explore enrolled courses"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] rounded-full bg-[var(--accent)] text-[#04060d] text-xs font-semibold hover:opacity-95 active:scale-95 transition-all shadow-lg shadow-[var(--accent)]/20 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04060d] focus-visible:outline-none"
          >
            <span>Explore enrolled courses</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="frosted-glass rounded-2xl border border-white/10 divide-y divide-white/5 overflow-hidden">
          {lessons.map((lesson) => {
            const courseName = lesson.courseName || lesson.courseTitle || 'Course'
            return (
              <div
                key={lesson.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectLesson?.(lesson)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelectLesson?.(lesson)
                  }
                }}
                className="group p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 hover:bg-white/[0.03] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer focus:outline-none focus:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04060d]"
              >
                {/* Left Details */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <div className="w-9 h-9 shrink-0 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[var(--accent)] group-hover:bg-[var(--accent)]/15 group-hover:border-[var(--accent)]/30 group-hover:scale-105 transition-all">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-[var(--accent)] font-medium">
                        {courseName}
                      </span>
                      {lesson.duration && (
                        <>
                          <span className="text-[var(--muted)] text-xs" aria-hidden="true">&bull;</span>
                          <span className="text-xs text-[var(--muted)]">
                            {lesson.duration}
                          </span>
                        </>
                      )}
                    </div>
                    <h3 className="text-sm font-medium text-[var(--text)] group-hover:text-[var(--accent)] transition-colors truncate mt-0.5">
                      {lesson.title}
                    </h3>
                  </div>
                </div>

                {/* Right Meta & Action */}
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pl-12 sm:pl-0">
                  <div className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
                    <Clock className="w-3.5 h-3.5 text-[var(--muted)]/80" />
                    <span>{formatRelativeTime(lesson.accessedAt)}</span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/5 group-hover:bg-[var(--accent)] group-hover:text-[#04060d] text-[var(--text)] border border-white/10 group-hover:border-transparent transition-all">
                    <span>Resume</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default RecentLessons
