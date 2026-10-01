import React from 'react'
import { Filter, Check, RotateCcw } from 'lucide-react'
import { CourseLevel } from '../../types/course'
import { COURSE_CATEGORIES, COURSE_LEVELS, courseCatalog } from '../../data/courseCatalog'

interface FilterPanelProps {
  selectedCategories: string[]
  selectedLevel: CourseLevel | 'All'
  onToggleCategory: (category: string) => void
  onSelectLevel: (level: CourseLevel | 'All') => void
  onClearAll: () => void
  hasActiveFilters: boolean
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  selectedCategories,
  selectedLevel,
  onToggleCategory,
  onSelectLevel,
  onClearAll,
  hasActiveFilters,
}) => {
  // Category counts across full catalog
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {}
    COURSE_CATEGORIES.forEach((cat) => {
      counts[cat] = courseCatalog.filter((c) => c.category === cat).length
    })
    return counts
  }, [])

  return (
    <aside
      aria-label="Course Filters"
      className="rounded-3xl bg-[rgba(6,10,20,0.72)] backdrop-blur-[14px] border border-white/[0.16] p-5 shadow-[0_12px_32px_rgba(0,0,0,0.5)] space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
          <Filter className="w-4 h-4 text-[var(--accent)]" />
          <span>Filters</span>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearAll}
            aria-label="Reset all course filters"
            className="min-h-[44px] px-3 inline-flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors cursor-pointer rounded-full focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04060d] focus-visible:outline-none"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Level Filter (Pills) */}
      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          Difficulty level
        </label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Difficulty level filters">
          <button
            type="button"
            onClick={() => onSelectLevel('All')}
            aria-pressed={selectedLevel === 'All'}
            aria-label="Filter by all difficulty levels"
            className={`min-h-[44px] px-4 py-2.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04060d] focus-visible:outline-none ${
              selectedLevel === 'All'
                ? 'bg-[var(--accent)] text-[#04060d] font-semibold shadow-[0_0_14px_rgba(143,180,255,0.4)]'
                : 'bg-white/5 text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/10 border border-white/10'
            }`}
          >
            All
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
                className={`min-h-[44px] px-4 py-2.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04060d] focus-visible:outline-none ${
                  isSelected
                    ? 'bg-[var(--accent)] text-[#04060d] font-semibold shadow-[0_0_14px_rgba(143,180,255,0.4)]'
                    : 'bg-white/5 text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/10 border border-white/10'
                }`}
              >
                {lvl}
              </button>
            )
          })}
        </div>
      </div>

      {/* Categories Filter (Checkboxes) */}
      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          Categories
        </label>
        <div className="space-y-1.5" role="group" aria-label="Course categories filter">
          {COURSE_CATEGORIES.map((category) => {
            const isChecked = selectedCategories.includes(category)
            const count = categoryCounts[category] || 0

            return (
              <label
                key={category}
                className="min-h-[44px] flex items-center justify-between px-3 py-2 rounded-2xl hover:bg-white/5 cursor-pointer transition-colors group select-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--accent)] has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-[#04060d]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                      isChecked
                        ? 'bg-[var(--accent)] border-[var(--accent)] text-[#04060d]'
                        : 'border-white/20 group-hover:border-white/40 bg-white/5'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span
                    className={`text-xs truncate transition-colors ${
                      isChecked
                        ? 'text-[var(--text)] font-medium'
                        : 'text-[var(--muted)] group-hover:text-[var(--text)]'
                    }`}
                  >
                    {category}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[var(--muted)] px-2 py-0.5 rounded-full bg-white/5 border border-white/5 shrink-0 ml-2">
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
    </aside>
  )
}
