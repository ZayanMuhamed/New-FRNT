import React, { useState } from 'react'
import {
  Search,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  Sparkles,
} from 'lucide-react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { useCourseFilters } from '../../hooks/useCourseFilters'
import { useSearchParams } from 'react-router-dom'
import { CatalogCourseCard } from '../../components/course/CatalogCourseCard'
import { CourseDrawer } from '../../components/courses/CourseDrawer'
import { FilterPanel } from '../../components/course/FilterPanel'
import { MobileFilterSheet } from '../../components/course/MobileFilterSheet'
import { ActiveFilterChips } from '../../components/course/ActiveFilterChips'
import { CourseCatalogPagination } from '../../components/course/CourseCatalogPagination'
import { CourseCatalogSkeleton } from '../../components/course/CourseCatalogSkeleton'
import { CourseCatalogEmptyState } from '../../components/course/CourseCatalogEmptyState'
import { CatalogCourse, CourseSortOption } from '../../types/course'
import { courseCatalog } from '../../data/courseCatalog'
import { useEnrollment } from '../../context/EnrollmentContext'

export const CourseListing: React.FC = () => {
  const {
    courses,
    totalCount,
    totalPages,
    currentPage,
    pageSize,
    search,
    searchInput,
    selectedCategories,
    selectedLevel,
    selectedSort,
    setSearchInput,
    toggleCategory,
    setLevel,
    setSort,
    setPage,
    clearAllFilters,
    isLoading,
  } = useCourseFilters()

  const [searchParams, setSearchParams] = useSearchParams()
  const { isEnrolled: isEnrolledInSession } = useEnrollment()
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)
  const lastTriggerElementRef = React.useRef<HTMLElement | null>(null)

  // Current course ID from URL query (?course=ID)
  const courseIdInUrl = searchParams.get('course')
  const activeCourse = courseIdInUrl
    ? courseCatalog.find((c) => c.id === courseIdInUrl) || null
    : null

  // Active filter count for badge
  const activeFilterCount =
    (search.trim() ? 1 : 0) +
    selectedCategories.length +
    (selectedLevel !== 'All' ? 1 : 0)

  const hasActiveFilters = activeFilterCount > 0

  const handleClearAll = () => {
    clearAllFilters()
  }

  const handleCourseCardClick = (
    course: CatalogCourse,
    triggerElement?: HTMLElement
  ) => {
    if (triggerElement) {
      lastTriggerElementRef.current = triggerElement
    } else {
      lastTriggerElementRef.current = document.getElementById(`course-card-${course.id}`)
    }
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('course', course.id)
    setSearchParams(nextParams, { replace: false })
  }

  const handleCloseDrawer = () => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('course')
    setSearchParams(nextParams, { replace: false })
  }

  return (
    <DashboardLayout activeTab="courses">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <header className="space-y-1.5 animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Academic Curriculum</span>
            </span>
            <span className="text-xs text-[var(--muted)] font-mono">
              30 catalog courses
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[var(--text)]">
            Explore Course Catalog
          </h1>
          <p className="text-sm text-[var(--muted)] max-w-2xl leading-relaxed">
            Deepen your systems expertise, master machine learning algorithms, and explore advanced computer science topics.
          </p>
        </header>

        {/* Search, Mobile Filter Toggle, and Sort Bar */}
        <section
          aria-label="Course Controls"
          className="rounded-3xl bg-[rgba(6,10,20,0.72)] backdrop-blur-[14px] border border-white/[0.16] p-4 sm:p-5 shadow-[0_12px_32px_rgba(0,0,0,0.5)]"
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input (Debounced 300ms) */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--muted)]">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by course title, instructor, or category..."
                aria-label="Search courses by title, instructor, or category"
                className="w-full min-h-[44px] pl-10 pr-12 py-2.5 rounded-full bg-white/[0.05] border border-white/[0.16] text-sm text-[var(--text)] placeholder-[var(--muted)]/70 transition-all focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30 focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  aria-label="Clear search input"
                  className="absolute inset-y-0 right-0 my-auto min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--muted)] hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:outline-none"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Sheet Toggle Button (< 1024px) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(true)}
                aria-label="Open filter panel"
                className="lg:hidden flex-1 sm:flex-none min-h-[44px] px-4 py-2.5 rounded-full bg-white/[0.05] hover:bg-white/10 border border-white/[0.16] text-xs font-semibold text-[var(--text)] flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04060d]"
              >
                <SlidersHorizontal className="w-4 h-4 text-[var(--accent)]" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[var(--accent)] text-[#04060d] text-[10px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Sort Dropdown */}
              <div className="relative flex-1 sm:flex-none min-w-[170px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--muted)]">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
                <select
                  value={selectedSort}
                  onChange={(e) => setSort(e.target.value as CourseSortOption)}
                  aria-label="Sort courses by"
                  className="w-full min-h-[44px] pl-8 pr-8 py-2.5 rounded-full bg-white/[0.05] border border-white/[0.16] text-xs font-medium text-[var(--text)] transition-all focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04060d] cursor-pointer appearance-none"
                >
                  <option value="popular" className="bg-[#060a14] text-white">Most popular</option>
                  <option value="rating-desc" className="bg-[#060a14] text-white">Highest rated</option>
                  <option value="lessons-desc" className="bg-[#060a14] text-white">Most lessons</option>
                  <option value="title-asc" className="bg-[#060a14] text-white">Title (A to Z)</option>
                  <option value="title-desc" className="bg-[#060a14] text-white">Title (Z to A)</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[var(--muted)] text-[10px]">
                  ▼
                </div>
              </div>
            </div>
          </div>

          {/* Active Filter Chips & Clear All */}
          <ActiveFilterChips
            search={search}
            selectedCategories={selectedCategories}
            selectedLevel={selectedLevel}
            totalCount={totalCount}
            onClearSearch={() => setSearchInput('')}
            onRemoveCategory={toggleCategory}
            onClearLevel={() => setLevel('All')}
            onClearAll={handleClearAll}
          />
        </section>

        {/* Main Content Layout (Desktop: Left Filter Panel + Right 3-col Grid) */}
        <div className="flex flex-col lg:flex-row items-start gap-8">
          {/* Desktop Filter Panel (hidden on tablet & mobile) */}
          <div className="hidden lg:block w-64 lg:w-72 shrink-0 sticky top-24">
            <FilterPanel
              selectedCategories={selectedCategories}
              selectedLevel={selectedLevel}
              onToggleCategory={toggleCategory}
              onSelectLevel={setLevel}
              onClearAll={handleClearAll}
              hasActiveFilters={hasActiveFilters}
            />
          </div>

          {/* Results Grid / States */}
          <div className="flex-1 w-full min-w-0">
            {isLoading ? (
              <CourseCatalogSkeleton count={9} />
            ) : totalCount === 0 ? (
              <CourseCatalogEmptyState
                searchQuery={search}
                hasActiveFilters={hasActiveFilters}
                onClearAll={handleClearAll}
              />
            ) : (
              <div>
                {/* 3 Columns Desktop, 2 Columns Tablet, 1 Column Mobile with fade-in once per page change */}
                <div
                  key={`page-${currentPage}`}
                  data-testid="courses-grid"
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in duration-300 motion-reduce:animate-none"
                >
                  {courses.map((course) => (
                    <CatalogCourseCard
                      key={course.id}
                      course={course}
                      searchQuery={search}
                      isEnrolled={isEnrolledInSession(course.id)}
                      onClick={handleCourseCardClick}
                    />
                  ))}
                </div>

                {/* Numbered Pagination */}
                <CourseCatalogPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalCount={totalCount}
                  pageSize={pageSize}
                  onPageChange={setPage}
                />
              </div>
            )}
          </div>
        </div>

        {/* Mobile Slide-Up Filter Sheet (< 768px) */}
        <MobileFilterSheet
          isOpen={isMobileFiltersOpen}
          onClose={() => setIsMobileFiltersOpen(false)}
          selectedCategories={selectedCategories}
          selectedLevel={selectedLevel}
          onToggleCategory={toggleCategory}
          onSelectLevel={setLevel}
          onClearAll={handleClearAll}
          totalMatchingCount={totalCount}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Course Details Preview Drawer (Desktop Side Drawer / Mobile Full-Height Sheet) */}
        <CourseDrawer
          course={activeCourse}
          isOpen={!!activeCourse}
          onClose={handleCloseDrawer}
          triggerRef={lastTriggerElementRef}
        />
      </div>
    </DashboardLayout>
  )
}

export default CourseListing
