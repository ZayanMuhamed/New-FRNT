import React, { useState, useMemo } from 'react'
import { Layers, RotateCcw } from 'lucide-react'
import { Course as StudentCourse } from '../../types/student'
import { Course as DashboardCourse } from '../../types/dashboard'
import { CourseCard, CourseCardData } from './CourseCard'
import { mockEnrolledCourses } from '../../data/studentData'

export type FilterType = 'all' | 'in-progress' | 'not-started'

export interface CourseGridProps {
  courses?: (StudentCourse | DashboardCourse | CourseCardData)[]
  title?: string
  description?: string
  onCourseClick?: (course: CourseCardData) => void
  className?: string
}

export const CourseGrid: React.FC<CourseGridProps> = ({
  courses = mockEnrolledCourses,
  title = 'Enrolled Courses',
  description,
  onCourseClick,
  className = '',
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')

  // Helper to determine if a course is not started
  const isCourseNotStarted = (course: CourseCardData) => {
    return (
      course.status === 'not-started' ||
      (course.status !== 'in-progress' && course.progress === 0)
    )
  }

  // Pre-calculate counts for each filter category
  const filterCounts = useMemo(() => {
    let inProgress = 0
    let notStarted = 0

    courses.forEach((course) => {
      if (isCourseNotStarted(course)) {
        notStarted++
      } else {
        inProgress++
      }
    })

    return {
      all: courses.length,
      inProgress,
      notStarted,
    }
  }, [courses])

  // Filter the list of courses
  const filteredCourses = useMemo(() => {
    if (activeFilter === 'all') return courses
    if (activeFilter === 'not-started') {
      return courses.filter((c) => isCourseNotStarted(c))
    }
    return courses.filter((c) => !isCourseNotStarted(c))
  }, [courses, activeFilter])

  const filterOptions: { id: FilterType; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: filterCounts.all },
    { id: 'in-progress', label: 'In progress', count: filterCounts.inProgress },
    { id: 'not-started', label: 'Not started', count: filterCounts.notStarted },
  ]

  return (
    <section
      aria-labelledby="course-grid-heading"
      className={`w-full space-y-5 ${className}`}
    >
      {/* Header and Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2.5">
            <h2
              id="course-grid-heading"
              className="text-lg md:text-xl font-semibold text-[var(--text)] tracking-tight"
            >
              {title}
            </h2>
            <span className="text-xs font-mono text-[var(--muted)] bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
              {courses.length} {courses.length === 1 ? 'module' : 'modules'}
            </span>
          </div>
          {description ? (
            <p className="text-xs text-[var(--muted)] mt-1">{description}</p>
          ) : (
            <p className="text-xs text-[var(--muted)] mt-1">
              Active semester coursework &bull; Track your completion progress
            </p>
          )}
        </div>

        {/* Filter Pill Row */}
        <div
          role="tablist"
          aria-label="Course filter"
          className="flex items-center gap-1.5 flex-wrap"
        >
          {filterOptions.map((option) => {
            const isActive = activeFilter === option.id
            return (
              <button
                key={option.id}
                role="tab"
                aria-selected={isActive}
                data-testid={`filter-pill-${option.id}`}
                onClick={() => setActiveFilter(option.id)}
                className={`min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer border focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04060d] focus-visible:outline-none ${
                  isActive
                    ? 'bg-[var(--accent)] text-[#04060d] border-[var(--accent)] font-semibold shadow-[0_0_12px_rgba(143,180,255,0.3)]'
                    : 'bg-white/5 text-[var(--muted)] border-white/10 hover:text-[var(--text)] hover:bg-white/10'
                }`}
              >
                <span>{option.label}</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-[#04060d] text-[var(--accent)] font-bold'
                      : 'bg-white/10 text-[var(--muted)]'
                  }`}
                >
                  {option.count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Grid: 3 cols on desktop (lg), 2 on tablet (md), 1 on mobile */}
      {filteredCourses.length > 0 ? (
        <div
          data-testid="course-grid-container"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
        >
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onSelect={onCourseClick}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div
          data-testid="course-grid-empty"
          className="frosted-glass rounded-2xl p-8 border border-white/10 text-center flex flex-col items-center justify-center space-y-3"
        >
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[var(--muted)]">
            <Layers className="w-5 h-5 text-[var(--accent)]/70" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-[var(--text)]">
              No courses found
            </h3>
            <p className="text-xs text-[var(--muted)] max-w-sm">
              There are currently no courses matching the &ldquo;
              {activeFilter === 'in-progress'
                ? 'In progress'
                : activeFilter === 'not-started'
                ? 'Not started'
                : 'All'}
              &rdquo; filter.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-white/5 hover:bg-white/10 text-[var(--accent)] border border-white/10 transition-colors mt-2 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Show all courses</span>
          </button>
        </div>
      )}
    </section>
  )
}

export default CourseGrid
