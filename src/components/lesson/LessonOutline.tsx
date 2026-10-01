import React, { useEffect, useState, useRef } from 'react'
import {
  ChevronDown,
  CheckCircle2,
  Circle,
  Play,
  X,
  BookOpen,
} from 'lucide-react'
import { CatalogCourse } from '../../types/course'
import { CourseLesson } from '../../types/lesson'

export interface LessonOutlineProps {
  course: CatalogCourse
  currentLesson: CourseLesson
  allLessons: CourseLesson[]
  isLessonCompleted: (courseId: string, lessonId: string) => boolean
  onSelectLesson: (lessonId: string) => void
  isMobileSheetOpen?: boolean
  onCloseMobileSheet?: () => void
  prefersReducedMotion?: boolean
}

export const LessonOutline: React.FC<LessonOutlineProps> = ({
  course,
  currentLesson,
  allLessons,
  isLessonCompleted,
  onSelectLesson,
  isMobileSheetOpen = false,
  onCloseMobileSheet,
  prefersReducedMotion = false,
}) => {
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({})
  const sheetRef = useRef<HTMLDivElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  // Auto-expand module containing current lesson
  useEffect(() => {
    if (currentLesson?.moduleId) {
      setExpandedModules((prev) => ({
        ...prev,
        [currentLesson.moduleId]: true,
      }))
    }
  }, [currentLesson?.moduleId])

  // Focus management for mobile sheet
  useEffect(() => {
    if (isMobileSheetOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'

      const timer = setTimeout(() => {
        closeBtnRef.current?.focus()
      }, 50)

      return () => {
        clearTimeout(timer)
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isMobileSheetOpen])

  // Escape key handler for mobile sheet
  useEffect(() => {
    if (!isMobileSheetOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCloseMobileSheet?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isMobileSheetOpen, onCloseMobileSheet])

  const toggleModule = (modId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }))
  }

  // Group lessons by module
  const modules = course.syllabus || []

  const outlineContent = (
    <div className="flex flex-col h-full">
      {/* Outline Header */}
      <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[var(--accent)]" />
          <h2 className="text-sm font-semibold text-[var(--text)]">Course content</h2>
        </div>
        <span className="text-xs font-mono text-[var(--muted)]">
          {allLessons.length} lessons
        </span>
      </div>

      {/* Accordion Modules List */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
        {modules.map((mod, mIdx) => {
          const modNumber = mod.module || mIdx + 1
          const modId = mod.id || `${course.id}-m${modNumber}`
          const isExpanded = expandedModules[modId] ?? modId === currentLesson.moduleId
          const moduleLessons = allLessons.filter((l) => l.moduleId === modId)

          const completedInModule = moduleLessons.filter((l) =>
            isLessonCompleted(course.id, l.id)
          ).length

          return (
            <div
              key={modId}
              className="rounded-2xl bg-white/[0.02] border border-white/[0.08] overflow-hidden transition-all"
            >
              {/* Module Header / Accordion Button */}
              <button
                type="button"
                onClick={() => toggleModule(modId)}
                aria-expanded={isExpanded}
                aria-controls={`module-lessons-${modId}`}
                data-testid={`module-toggle-${modId}`}
                className="w-full min-h-[44px] px-3.5 py-3 flex items-center justify-between gap-3 text-left hover:bg-white/[0.04] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:outline-none"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-[11px] font-mono font-semibold text-[var(--accent)] px-2 py-0.5 rounded-md bg-[var(--accent)]/10 border border-[var(--accent)]/20 shrink-0">
                    M{modNumber}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-xs font-semibold text-[var(--text)] truncate">
                      {mod.title}
                    </h3>
                    <p className="text-[11px] text-[var(--muted)] font-mono">
                      {completedInModule} / {moduleLessons.length} completed
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <ChevronDown
                    className={`w-4 h-4 text-[var(--muted)] transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Lessons in Module */}
              {isExpanded && (
                <div
                  id={`module-lessons-${modId}`}
                  className="px-2 pb-2.5 pt-1 space-y-1 border-t border-white/[0.04] bg-[#04060d]/30"
                >
                  {moduleLessons.map((lesson) => {
                    const isCurrent = lesson.id === currentLesson.id
                    const isDone = isLessonCompleted(course.id, lesson.id)

                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => {
                          onSelectLesson(lesson.id)
                          onCloseMobileSheet?.()
                        }}
                        aria-current={isCurrent ? 'page' : undefined}
                        data-testid={`outline-lesson-${lesson.id}`}
                        className={`w-full min-h-[44px] px-3 py-2 rounded-xl flex items-center justify-between gap-3 text-left transition-all cursor-pointer group focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:outline-none ${
                          isCurrent
                            ? 'bg-[var(--accent)]/15 border border-[var(--accent)]/40 shadow-[0_0_15px_rgba(143,180,255,0.15)] text-[var(--text)]'
                            : 'hover:bg-white/[0.05] border border-transparent text-[var(--muted)] hover:text-[var(--text)]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Status Icon */}
                          <div className="shrink-0">
                            {isDone ? (
                              <CheckCircle2
                                className="w-4 h-4 text-emerald-400"
                                aria-label="Completed"
                              />
                            ) : isCurrent ? (
                              <div
                                className="w-4 h-4 rounded-full bg-[var(--accent)]/20 border border-[var(--accent)] flex items-center justify-center text-[var(--accent)]"
                                aria-label="In progress"
                              >
                                <Play className="w-2 h-2 fill-current ml-0.2" />
                              </div>
                            ) : (
                              <Circle
                                className="w-4 h-4 text-white/30"
                                aria-label="Not started"
                              />
                            )}
                          </div>

                          <div className="min-w-0">
                            <span
                              className={`text-xs block truncate ${
                                isCurrent ? 'font-semibold text-[var(--accent)]' : 'font-medium'
                              }`}
                            >
                              {lesson.order}. {lesson.title}
                            </span>
                          </div>
                        </div>

                        <span className="text-[11px] font-mono text-[var(--muted)] shrink-0 pl-1">
                          {lesson.duration}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar: Sticky card */}
      <aside
        data-testid="lesson-outline-desktop"
        className="hidden md:flex flex-col h-[calc(100vh-100px)] sticky top-20 rounded-3xl bg-[#060a14]/90 backdrop-blur-2xl border border-white/[0.14] shadow-[-10px_0_30px_rgba(0,0,0,0.5)] overflow-hidden"
      >
        {outlineContent}
      </aside>

      {/* Mobile Bottom Sheet (< 768px) */}
      <div
        data-testid="lesson-outline-mobile-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Course Content Outline"
        className={`md:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
          isMobileSheetOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          data-testid="mobile-sheet-backdrop"
          onClick={onCloseMobileSheet}
          className="fixed inset-0 bg-[#04060d]/80 backdrop-blur-md"
          aria-hidden="true"
        />

        {/* Bottom Sheet Drawer */}
        <div
          ref={sheetRef}
          className={`fixed inset-x-0 bottom-0 max-h-[85vh] bg-[#060a14]/95 backdrop-blur-2xl border-t border-white/[0.16] rounded-t-3xl shadow-[0_-20px_50px_rgba(0,0,0,0.9)] flex flex-col ${
            prefersReducedMotion ? 'transition-none' : 'transition-transform duration-300 ease-out'
          } ${
            isMobileSheetOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          {/* Drag handle & close row */}
          <div className="pt-3 pb-1 px-4 flex items-center justify-between border-b border-white/[0.06] shrink-0">
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto" />
            <button
              ref={closeBtnRef}
              type="button"
              onClick={onCloseMobileSheet}
              data-testid="mobile-sheet-close-btn"
              aria-label="Close course content outline"
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-full text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {outlineContent}
          </div>
        </div>
      </div>
    </>
  )
}
