import React, { useEffect, useRef } from 'react'
import { X, Check, RotateCcw, SlidersHorizontal } from 'lucide-react'
import { CourseLevel } from '../../types/course'
import { COURSE_CATEGORIES, COURSE_LEVELS, courseCatalog } from '../../data/courseCatalog'

interface MobileFilterSheetProps {
  isOpen: boolean
  onClose: () => void
  selectedCategories: string[]
  selectedLevel: CourseLevel | 'All'
  onToggleCategory: (category: string) => void
  onSelectLevel: (level: CourseLevel | 'All') => void
  onClearAll: () => void
  totalMatchingCount: number
  hasActiveFilters: boolean
}

export const MobileFilterSheet: React.FC<MobileFilterSheetProps> = ({
  isOpen,
  onClose,
  selectedCategories,
  selectedLevel,
  onToggleCategory,
  onSelectLevel,
  onClearAll,
  totalMatchingCount,
  hasActiveFilters,
}) => {
  const sheetRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousActiveElementRef = useRef<HTMLElement | null>(null)

  // ESC key handler, focus trap, and body scroll lock
  useEffect(() => {
    if (!isOpen) return

    if (document.activeElement instanceof HTMLElement) {
      previousActiveElementRef.current = document.activeElement
    }

    const timer = setTimeout(() => {
      if (closeButtonRef.current) {
        closeButtonRef.current.focus()
      }
    }, 50)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }

      if (e.key === 'Tab') {
        if (!sheetRef.current) return
        const focusable = sheetRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
        if (focusable.length === 0) return

        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      clearTimeout(timer)
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalOverflow
      if (previousActiveElementRef.current && typeof previousActiveElementRef.current.focus === 'function') {
        requestAnimationFrame(() => {
          previousActiveElementRef.current?.focus()
        })
      }
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Filter Courses Sheet"
      className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden animate-in fade-in duration-200"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Slide-Up Container */}
      <div
        ref={sheetRef}
        className="relative z-10 max-h-[85vh] flex flex-col w-full rounded-t-[32px] bg-[#060a14] border-t border-white/20 shadow-[0_-16px_48px_rgba(0,0,0,0.8)] overflow-hidden animate-in slide-in-from-bottom duration-[250ms] motion-reduce:duration-0 motion-reduce:animate-none"
      >
        {/* Grab Handle */}
        <div className="flex justify-center pt-3 pb-1" aria-hidden="true">
          <div className="w-12 h-1.5 rounded-full bg-white/20" />
        </div>

        {/* Sheet Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-base font-semibold text-[var(--text)]">
            <SlidersHorizontal className="w-4 h-4 text-[var(--accent)]" />
            <span>Filter courses</span>
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onClearAll}
                aria-label="Reset all filters in sheet"
                className="min-h-[44px] px-3 text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors cursor-pointer inline-flex items-center gap-1 rounded-full focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#060a14] focus-visible:outline-none"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close filter sheet"
              className="min-w-[44px] min-h-[44px] rounded-full bg-white/5 hover:bg-white/10 text-[var(--muted)] hover:text-[var(--text)] transition-colors flex items-center justify-center cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#060a14] focus-visible:outline-none"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Level Filter */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Difficulty level
            </label>
            <div className="grid grid-cols-2 gap-2" role="group" aria-label="Mobile difficulty levels">
              <button
                type="button"
                onClick={() => onSelectLevel('All')}
                aria-pressed={selectedLevel === 'All'}
                aria-label="Filter by all difficulty levels"
                className={`min-h-[44px] px-4 py-2.5 rounded-2xl text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#060a14] focus-visible:outline-none ${
                  selectedLevel === 'All'
                    ? 'bg-[var(--accent)] text-[#04060d] font-bold shadow-[0_0_16px_rgba(143,180,255,0.4)]'
                    : 'bg-white/5 text-[var(--muted)] border border-white/10'
                }`}
              >
                All levels
              </button>
              {COURSE_LEVELS.map((lvl) => {
                const isSelected = selectedLevel === lvl
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => onSelectLevel(lvl)}
                    aria-pressed={isSelected}
                    aria-label={`Filter by difficulty level: ${lvl}`}
                    className={`min-h-[44px] px-4 py-2.5 rounded-2xl text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#060a14] focus-visible:outline-none ${
                      isSelected
                        ? 'bg-[var(--accent)] text-[#04060d] font-bold shadow-[0_0_16px_rgba(143,180,255,0.4)]'
                        : 'bg-white/5 text-[var(--muted)] border border-white/10'
                    }`}
                  >
                    {lvl}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Categories
            </label>
            <div className="space-y-2" role="group" aria-label="Course categories filter">
              {COURSE_CATEGORIES.map((category) => {
                const isChecked = selectedCategories.includes(category)
                const count = courseCatalog.filter((c) => c.category === category).length

                return (
                  <label
                    key={category}
                    className="min-h-[44px] flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/5 cursor-pointer active:bg-white/10 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--accent)] has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-[#060a14]"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all shrink-0 ${
                          isChecked
                            ? 'bg-[var(--accent)] border-[var(--accent)] text-[#04060d]'
                            : 'border-white/20 bg-white/5'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <span className={`text-xs ${isChecked ? 'text-white font-medium' : 'text-[var(--muted)]'}`}>
                        {category}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-[var(--muted)] px-2 py-0.5 rounded-full bg-white/5">
                      {count}
                    </span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggleCategory(category)}
                      aria-label={`Filter by ${category} category`}
                      className="sr-only"
                    />
                  </label>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer with Apply Button */}
        <div className="p-4 border-t border-white/10 bg-[#04060d]/90 backdrop-blur-md">
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[48px] py-3 px-6 rounded-full bg-gradient-to-r from-[var(--accent)] to-blue-500 text-[#04060d] font-semibold text-sm tracking-wide shadow-[0_0_20px_rgba(143,180,255,0.35)] active:scale-[0.98] transition-transform focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04060d] focus-visible:outline-none cursor-pointer"
          >
            Show {totalMatchingCount} {totalMatchingCount === 1 ? 'course' : 'courses'}
          </button>
        </div>
      </div>
    </div>
  )
}
