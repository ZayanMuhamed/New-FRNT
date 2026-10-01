import React from 'react'
import { Star, Clock, BookOpen, User, CheckCircle2 } from 'lucide-react'
import { CatalogCourse } from '../../types/course'
import { HighlightText } from './HighlightText'

interface CatalogCourseCardProps {
  course: CatalogCourse
  isEnrolled: boolean
  searchQuery?: string
  onClick?: (course: CatalogCourse, triggerElement?: HTMLElement) => void
}

const LEVEL_COLORS = {
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

// Deterministic gradient generator for thumbnails based on course ID / category
function getThumbnailGradient(category: string, id: string): string {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  switch (category) {
    case 'Core Systems':
      return 'from-blue-600/35 via-indigo-950/60 to-[#04060d]'
    case 'Artificial Intelligence':
      return 'from-purple-600/35 via-violet-950/60 to-[#04060d]'
    case 'Data Architecture':
      return 'from-emerald-600/35 via-teal-950/60 to-[#04060d]'
    case 'Cybersecurity':
      return 'from-rose-600/35 via-red-950/60 to-[#04060d]'
    case 'Emerging Tech':
      return 'from-cyan-600/35 via-sky-950/60 to-[#04060d]'
    case 'Foundations':
      return 'from-amber-600/35 via-orange-950/60 to-[#04060d]'
    default:
      return hash % 2 === 0
        ? 'from-blue-600/35 via-indigo-950/60 to-[#04060d]'
        : 'from-purple-600/35 via-violet-950/60 to-[#04060d]'
  }
}

export const CatalogCourseCard: React.FC<CatalogCourseCardProps> = ({
  course,
  isEnrolled,
  searchQuery = '',
  onClick,
}) => {
  const levelStyle =
    LEVEL_COLORS[course.level] || LEVEL_COLORS.Intermediate
  const thumbnailGradient = getThumbnailGradient(course.category, course.id)

  return (
    <article
      id={`course-card-${course.id}`}
      data-testid={`course-card-${course.id}`}
      role="button"
      tabIndex={0}
      aria-label={`View course details for ${course.title} by ${course.instructor}`}
      onClick={(e) => onClick && onClick(course, e.currentTarget)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick && onClick(course, e.currentTarget)
        }
      }}
      className="group relative flex flex-col justify-between rounded-3xl bg-[rgba(6,10,20,0.72)] backdrop-blur-[14px] border border-white/[0.16] overflow-hidden transition-all duration-200 ease-out hover:-translate-y-[2px] hover:border-[var(--accent)]/40 hover:shadow-[0_12px_32px_rgba(0,0,0,0.6),0_0_24px_rgba(143,180,255,0.12)] motion-reduce:hover:translate-y-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04060d] focus-visible:outline-none"
    >
      {/* Top Banner / Thumbnail Gradient */}
      <div className={`relative h-36 w-full bg-gradient-to-br ${thumbnailGradient} p-4 flex flex-col justify-between border-b border-white/[0.08]`}>
        {/* Subtle grid texture overlay */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)',
            backgroundSize: '16px 16px',
          }}
        />

        {/* Top Badges Row */}
        <div className="relative z-10 flex items-center justify-between gap-2">
          {/* Category Tag */}
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide bg-[#04060d]/70 backdrop-blur-md border border-white/15 text-[var(--text)]">
            <HighlightText text={course.category} query={searchQuery} />
          </span>

          {/* Enrolled Badge if student is enrolled */}
          {isEnrolled && (
            <span
              data-testid="enrolled-badge"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)] animate-in fade-in"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Enrolled</span>
            </span>
          )}
        </div>

        {/* Level Tag (Bottom of thumbnail) */}
        <div className="relative z-10 flex items-center gap-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${levelStyle.bg} ${levelStyle.border} ${levelStyle.text}`}
          >
            {course.level}
          </span>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3 className="text-base font-semibold text-[var(--text)] leading-snug tracking-tight group-hover:text-[var(--accent)] transition-colors line-clamp-2 mb-2">
            <HighlightText text={course.title} query={searchQuery} />
          </h3>

          {/* Instructor */}
          <div className="flex items-center gap-2 text-xs text-[var(--muted)] mb-3">
            <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-[var(--accent)]">
              <User className="w-3 h-3" />
            </div>
            <span className="font-medium truncate">
              <HighlightText text={course.instructor} query={searchQuery} />
            </span>
          </div>

          {/* Description */}
          <p className="text-xs text-[var(--muted)] line-clamp-2 leading-relaxed mb-4">
            {course.description}
          </p>
        </div>

        {/* Metadata Footer: Duration, Rating, Lesson Count */}
        <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs text-[var(--muted)]">
          <div className="flex items-center gap-3">
            {/* Rating */}
            <div className="flex items-center gap-1 text-amber-300 font-semibold" title={`Rating: ${course.rating}`}>
              <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              <span>{course.rating.toFixed(1)}</span>
            </div>

            {/* Lesson Count */}
            <div className="flex items-center gap-1" title={`${course.lessonCount} lessons`}>
              <BookOpen className="w-3.5 h-3.5 text-[var(--muted)]" />
              <span>{course.lessonCount} lessons</span>
            </div>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-1 text-[11px]" title={`Duration: ${course.duration}`}>
            <Clock className="w-3.5 h-3.5 text-[var(--muted)]" />
            <span>{course.duration.split(' ')[0]} {course.duration.split(' ')[1] || 'wks'}</span>
          </div>
        </div>
      </div>
    </article>
  )
}

export default CatalogCourseCard
