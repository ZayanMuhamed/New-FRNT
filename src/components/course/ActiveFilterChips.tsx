import React from 'react'
import { X, RotateCcw } from 'lucide-react'
import { CourseLevel } from '../../types/course'

interface ActiveFilterChipsProps {
  search: string
  selectedCategories: string[]
  selectedLevel: CourseLevel | 'All'
  totalCount: number
  onClearSearch: () => void
  onRemoveCategory: (category: string) => void
  onClearLevel: () => void
  onClearAll: () => void
}

export const ActiveFilterChips: React.FC<ActiveFilterChipsProps> = ({
  search,
  selectedCategories,
  selectedLevel,
  totalCount,
  onClearSearch,
  onRemoveCategory,
  onClearLevel,
  onClearAll,
}) => {
  const hasFilters = Boolean(
    search.trim() || selectedCategories.length > 0 || selectedLevel !== 'All'
  )

  if (!hasFilters) return null

  return (
    <div
      aria-label="Active Filters"
      className="flex flex-wrap items-center gap-2 py-2 animate-in fade-in duration-200"
    >
      <span className="text-xs text-[var(--muted)] font-medium mr-1">
        Active filters:
      </span>

      {/* Search Chip */}
      {search.trim() && (
        <span
          data-testid="filter-chip-search"
          className="min-h-[44px] inline-flex items-center gap-1 pl-3.5 pr-1 py-1 rounded-full text-xs font-medium bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-[var(--text)]"
        >
          <span>Search: &ldquo;{search.trim()}&rdquo;</span>
          <button
            type="button"
            onClick={onClearSearch}
            aria-label={`Remove search filter "${search.trim()}"`}
            className="min-w-[44px] min-h-[44px] -my-1 -mr-1 inline-flex items-center justify-center rounded-full text-[var(--muted)] hover:text-white hover:bg-white/10 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04060d] focus-visible:outline-none"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </span>
      )}

      {/* Level Chip */}
      {selectedLevel !== 'All' && (
        <span
          data-testid="filter-chip-level"
          className="min-h-[44px] inline-flex items-center gap-1 pl-3.5 pr-1 py-1 rounded-full text-xs font-medium bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-[var(--text)]"
        >
          <span>Level: {selectedLevel}</span>
          <button
            type="button"
            onClick={onClearLevel}
            aria-label={`Remove difficulty level filter ${selectedLevel}`}
            className="min-w-[44px] min-h-[44px] -my-1 -mr-1 inline-flex items-center justify-center rounded-full text-[var(--muted)] hover:text-white hover:bg-white/10 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04060d] focus-visible:outline-none"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </span>
      )}

      {/* Category Chips */}
      {selectedCategories.map((cat) => (
        <span
          key={cat}
          data-testid={`filter-chip-cat-${cat}`}
          className="min-h-[44px] inline-flex items-center gap-1 pl-3.5 pr-1 py-1 rounded-full text-xs font-medium bg-white/10 border border-white/20 text-[var(--text)]"
        >
          <span>{cat}</span>
          <button
            type="button"
            onClick={() => onRemoveCategory(cat)}
            aria-label={`Remove ${cat} category filter`}
            className="min-w-[44px] min-h-[44px] -my-1 -mr-1 inline-flex items-center justify-center rounded-full text-[var(--muted)] hover:text-white hover:bg-white/10 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04060d] focus-visible:outline-none"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </span>
      ))}

      {/* Clear All Action */}
      <button
        type="button"
        onClick={onClearAll}
        data-testid="clear-all-filters-btn"
        aria-label="Clear all active filters"
        className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium text-[var(--accent)] hover:bg-[var(--accent)]/10 border border-[var(--accent)]/30 transition-all cursor-pointer ml-1 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04060d] focus-visible:outline-none"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>Clear all</span>
      </button>

      {/* Count pill */}
      <span className="text-[11px] text-[var(--muted)] font-mono ml-auto py-2">
        {totalCount} {totalCount === 1 ? 'result' : 'results'}
      </span>
    </div>
  )
}
