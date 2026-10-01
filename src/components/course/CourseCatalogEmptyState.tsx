import React from 'react'
import { SearchX, RotateCcw } from 'lucide-react'

interface CourseCatalogEmptyStateProps {
  searchQuery?: string
  hasActiveFilters: boolean
  onClearAll: () => void
}

export const CourseCatalogEmptyState: React.FC<CourseCatalogEmptyStateProps> = ({
  searchQuery,
  hasActiveFilters,
  onClearAll,
}) => {
  return (
    <div
      data-testid="course-catalog-empty-state"
      className="rounded-3xl bg-[rgba(6,10,20,0.72)] backdrop-blur-[14px] border border-white/[0.16] p-8 sm:p-12 text-center max-w-xl mx-auto shadow-[0_12px_32px_rgba(0,0,0,0.5)] my-6 animate-in fade-in zoom-in-95 duration-200"
    >
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/25 flex items-center justify-center text-[var(--accent)] mx-auto mb-5 shadow-[0_0_24px_rgba(143,180,255,0.15)]">
        <SearchX className="w-8 h-8" />
      </div>

      {/* Heading */}
      <h3 className="text-lg sm:text-xl font-bold text-[var(--text)] tracking-tight mb-2">
        No courses match your criteria
      </h3>

      {/* Descriptive explanation telling the user what to change */}
      <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed mb-6 max-w-md mx-auto">
        {searchQuery ? (
          <>
            No courses found matching &ldquo;<span className="text-[var(--text)] font-medium">{searchQuery}</span>&rdquo;.
            Try checking for spelling errors, broadening your search term, or clearing your category and difficulty filters.
          </>
        ) : (
          <>
            No courses found with the selected category and difficulty level filters.
            Try selecting a different level or clearing some filters to explore more of the curriculum.
          </>
        )}
      </p>

      {/* Action CTA */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearAll}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--accent)] text-[#04060d] font-semibold text-xs shadow-[0_0_20px_rgba(143,180,255,0.35)] hover:shadow-[0_0_28px_rgba(143,180,255,0.5)] active:scale-95 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear all filters</span>
        </button>
      )}
    </div>
  )
}
