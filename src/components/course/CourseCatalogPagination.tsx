import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CourseCatalogPaginationProps {
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
  onPageChange: (page: number) => void
}

export const CourseCatalogPagination: React.FC<CourseCatalogPaginationProps> = ({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
}) => {
  if (totalPages <= 1 && totalCount <= pageSize) {
    return null
  }

  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalCount)

  // Generate numbered array
  const pages: number[] = []
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i)
  }

  return (
    <nav
      aria-label="Course Catalog Pagination"
      className="mt-8 pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4"
    >
      {/* Summary label */}
      <p className="text-xs text-[var(--muted)] font-mono">
        Showing <span className="text-[var(--text)] font-semibold">{startItem}</span>–
        <span className="text-[var(--text)] font-semibold">{endItem}</span> of{' '}
        <span className="text-[var(--text)] font-semibold">{totalCount}</span> courses
      </p>

      {/* Numbered Controls */}
      <div className="flex items-center gap-2" role="group" aria-label="Pagination page selection">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-disabled={currentPage <= 1}
          aria-label="Go to previous page"
          className={`min-h-[44px] px-4 py-2.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04060d] focus-visible:outline-none ${
            currentPage <= 1
              ? 'opacity-30 cursor-not-allowed text-[var(--muted)] border border-transparent'
              : 'bg-white/5 hover:bg-white/10 text-[var(--text)] border border-white/10 cursor-pointer active:scale-95'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Number Buttons */}
        {pages.map((p) => {
          const isCurrent = p === currentPage
          return (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-label={`Go to page ${p}`}
              aria-current={isCurrent ? 'page' : undefined}
              className={`min-h-[44px] min-w-[44px] px-3.5 py-2.5 rounded-full text-xs font-medium transition-all flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04060d] focus-visible:outline-none ${
                isCurrent
                  ? 'bg-[var(--accent)] text-[#04060d] font-bold shadow-[0_0_14px_rgba(143,180,255,0.4)]'
                  : 'bg-white/5 hover:bg-white/10 text-[var(--muted)] hover:text-[var(--text)] border border-white/10 cursor-pointer'
              }`}
            >
              {p}
            </button>
          )
        })}

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-disabled={currentPage >= totalPages}
          aria-label="Go to next page"
          className={`min-h-[44px] px-4 py-2.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04060d] focus-visible:outline-none ${
            currentPage >= totalPages
              ? 'opacity-30 cursor-not-allowed text-[var(--muted)] border border-transparent'
              : 'bg-white/5 hover:bg-white/10 text-[var(--text)] border border-white/10 cursor-pointer active:scale-95'
          }`}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </nav>
  )
}
