import React from 'react'
import { CheckCircle2, Award, Calendar, ExternalLink, ArrowRight } from 'lucide-react'
import { formatCompletionDate } from '../../utils/formatTime'

export interface CompletedCourseItem {
  id: string
  title: string
  instructor: string
  completedDate?: string
  completedOn?: string
  courseCode?: string
  code?: string
  grade?: string
  credits?: number
  credentialId?: string
  totalLessons?: number
  certificateUrl?: string
}

export interface CompletedCoursesProps {
  courses?: CompletedCourseItem[]
  onViewCourse?: (course: CompletedCourseItem) => void
  onViewCertificate?: (course: CompletedCourseItem) => void
  onExploreCourses?: () => void
  className?: string
}

export const CompletedCourses: React.FC<CompletedCoursesProps> = ({
  courses = [],
  onViewCourse,
  onViewCertificate,
  onExploreCourses,
  className = '',
}) => {
  const isEmpty = courses.length === 0

  return (
    <section aria-labelledby="completed-courses-heading" className={`w-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <h2
            id="completed-courses-heading"
            className="text-lg font-semibold text-[var(--text)] tracking-tight"
          >
            Completed courses
          </h2>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono">
            {courses.length} {courses.length === 1 ? 'completed' : 'completed'}
          </span>
        </div>
        {!isEmpty && (
          <span className="text-xs text-[var(--muted)] hidden sm:inline">
            Finished accredited modules
          </span>
        )}
      </div>

      {/* Content or Friendly Empty State */}
      {isEmpty ? (
        <div
          role="region"
          aria-label="No completed courses"
          className="frosted-glass rounded-2xl border border-white/10 p-8 sm:p-10 text-center flex flex-col items-center justify-center transition-all"
        >
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 shadow-[0_0_20px_rgba(52,211,153,0.15)]">
            <Award className="w-6 h-6" />
          </div>

          <h3 className="text-base font-medium text-[var(--text)] mb-2">
            No completed courses yet
          </h3>

          <p className="text-xs sm:text-sm text-[var(--muted)] max-w-md leading-relaxed mb-6">
            Finish all module lessons and assessments in an enrolled course to earn your verified certificate and unlock honors recognition here.
          </p>

          <button
            type="button"
            onClick={onExploreCourses}
            aria-label="Continue your coursework"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] rounded-full bg-[var(--accent)] text-[#04060d] text-xs font-semibold hover:opacity-95 active:scale-95 transition-all shadow-lg shadow-[var(--accent)]/20 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04060d] focus-visible:outline-none"
          >
            <span>Continue your coursework</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => {
            const courseCode = course.courseCode || course.code
            const dateStr = course.completedDate || course.completedOn

            return (
              <div
                key={course.id}
                role="button"
                tabIndex={0}
                onClick={() => onViewCourse?.(course)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onViewCourse?.(course)
                  }
                }}
                className="frosted-glass group p-5 rounded-2xl border border-white/10 hover:border-white/20 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04060d]"
              >
                {/* Top Row: Badge & Grade */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 border border-emerald-500/25 text-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Completed</span>
                    </span>

                    {course.grade ? (
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[var(--accent)]">
                        {course.grade}
                      </span>
                    ) : courseCode ? (
                      <span className="text-[10px] font-mono uppercase text-[var(--muted)] bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                        {courseCode}
                      </span>
                    ) : null}
                  </div>

                  {/* Course Title */}
                  <h3 className="text-sm font-semibold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors line-clamp-2">
                    {course.title}
                  </h3>

                  <p className="text-xs text-[var(--muted)] mt-1">
                    {course.instructor}
                    {course.credits ? ` \u2022 ${course.credits} Credits` : ''}
                  </p>
                </div>

                {/* Bottom Meta & Credentials */}
                <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-[var(--muted)]">
                    <Calendar className="w-3.5 h-3.5 text-[var(--muted)]/70" />
                    <span>{formatCompletionDate(dateStr)}</span>
                  </div>

                  {course.credentialId || course.certificateUrl ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onViewCertificate?.(course)
                      }}
                      className="inline-flex items-center gap-1 text-[var(--accent)] hover:underline text-[11px] py-0.5 px-1.5 rounded cursor-pointer"
                    >
                      <span>Certificate</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  ) : (
                    <span className="text-[11px] font-mono text-[var(--muted)]">100%</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default CompletedCourses
