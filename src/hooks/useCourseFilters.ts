import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  CatalogCourse,
  CourseLevel,
  CourseSortOption,
  CourseFilterState,
} from '../types/course'
import { courseCatalog } from '../data/courseCatalog'
import { mockEnrolledCourses } from '../data/studentData'
import {
  DEFAULT_PAGE_SIZE,
  filterAndPaginateCourses,
  parseCourseFilterParams,
  serializeCourseFilterParams,
} from '../utils/courseFilterUtils'

export interface UseCourseFiltersOptions {
  catalog?: CatalogCourse[]
  pageSize?: number
  enrolledIds?: string[]
}

export interface UseCourseFiltersReturn {
  // Paginated and filtered results
  courses: CatalogCourse[]
  allFilteredCourses: CatalogCourse[]

  // Pagination metadata
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  isLoading: boolean

  // Filter & Search states
  search: string // Debounced search term active in URL
  searchInput: string // Immediate controlled input value
  selectedCategories: string[]
  selectedLevel: CourseLevel | 'All'
  selectedSort: CourseSortOption

  // Mutation handlers
  setSearchInput: (value: string) => void
  setCategories: (categories: string[]) => void
  toggleCategory: (category: string) => void
  removeCategory: (category: string) => void
  setLevel: (level: CourseLevel | 'All') => void
  setSort: (sort: CourseSortOption) => void
  setPage: (page: number) => void
  clearSearch: () => void
  clearLevel: () => void
  clearAllFilters: () => void

  // Enrolled status helper
  enrolledCourseIds: Set<string>
  isEnrolled: (courseId: string) => boolean
}

const SEARCH_DEBOUNCE_MS = 300

export function useCourseFilters(
  options: UseCourseFiltersOptions = {}
): UseCourseFiltersReturn {
  const {
    catalog = courseCatalog,
    pageSize = DEFAULT_PAGE_SIZE,
    enrolledIds = mockEnrolledCourses.map((c) => c.id),
  } = options

  const [searchParams, setSearchParams] = useSearchParams()

  // 1. Parse current URL state
  const urlFilterState = useMemo<CourseFilterState>(() => {
    return parseCourseFilterParams(searchParams)
  }, [searchParams])

  // 2. Local immediate input state for snappy controlled text input
  const [searchInput, setSearchInput] = useState<string>(urlFilterState.search)

  // Sync searchInput when URL changes externally (e.g. Back/Forward button or Clear All)
  useEffect(() => {
    setSearchInput(urlFilterState.search)
  }, [urlFilterState.search])

  // Track whether initial mount has occurred to avoid redundant write
  const isFirstMount = useRef(true)

  // 3. Debounce search input by 300ms and write to URL query string
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false
      return
    }

    const trimmedInput = searchInput.trim()
    const currentUrlSearch = urlFilterState.search.trim()

    // If search term hasn't changed, do nothing
    if (trimmedInput === currentUrlSearch) {
      return
    }

    const timer = setTimeout(() => {
      const nextState: CourseFilterState = {
        ...urlFilterState,
        search: trimmedInput,
        page: 1, // Reset to page 1 on search change
      }
      setSearchParams(serializeCourseFilterParams(nextState), { replace: true })
    }, SEARCH_DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [searchInput, urlFilterState, setSearchParams])

  // 4. Update helpers that write immediately to URL
  const updateUrlFilters = useCallback(
    (updater: (prev: CourseFilterState) => CourseFilterState) => {
      const nextState = updater(urlFilterState)
      setSearchParams(serializeCourseFilterParams(nextState), { replace: true })
    },
    [urlFilterState, setSearchParams]
  )

  const setCategories = useCallback(
    (categories: string[]) => {
      updateUrlFilters((prev) => ({
        ...prev,
        categories,
        page: 1,
      }))
    },
    [updateUrlFilters]
  )

  const toggleCategory = useCallback(
    (category: string) => {
      updateUrlFilters((prev) => {
        const exists = prev.categories.includes(category)
        const nextCategories = exists
          ? prev.categories.filter((c) => c !== category)
          : [...prev.categories, category]
        return {
          ...prev,
          categories: nextCategories,
          page: 1,
        }
      })
    },
    [updateUrlFilters]
  )

  const removeCategory = useCallback(
    (category: string) => {
      updateUrlFilters((prev) => ({
        ...prev,
        categories: prev.categories.filter((c) => c !== category),
        page: 1,
      }))
    },
    [updateUrlFilters]
  )

  const setLevel = useCallback(
    (level: CourseLevel | 'All') => {
      updateUrlFilters((prev) => ({
        ...prev,
        level,
        page: 1,
      }))
    },
    [updateUrlFilters]
  )

  const clearLevel = useCallback(() => {
    updateUrlFilters((prev) => ({
      ...prev,
      level: 'All',
      page: 1,
    }))
  }, [updateUrlFilters])

  const clearSearch = useCallback(() => {
    setSearchInput('')
    updateUrlFilters((prev) => ({
      ...prev,
      search: '',
      page: 1,
    }))
  }, [updateUrlFilters])

  const setSort = useCallback(
    (sort: CourseSortOption) => {
      updateUrlFilters((prev) => ({
        ...prev,
        sort,
        page: 1,
      }))
    },
    [updateUrlFilters]
  )

  const setPage = useCallback(
    (page: number) => {
      updateUrlFilters((prev) => ({
        ...prev,
        page,
      }))
    },
    [updateUrlFilters]
  )

  const clearAllFilters = useCallback(() => {
    setSearchInput('')
    const nextState: CourseFilterState = {
      search: '',
      categories: [],
      level: 'All',
      sort: 'popular',
      page: 1,
    }
    setSearchParams(serializeCourseFilterParams(nextState), { replace: true })
  }, [setSearchParams])

  // 5. Compute filtered and paginated results
  const filterResult = useMemo(() => {
    return filterAndPaginateCourses(catalog, {
      search: urlFilterState.search,
      categories: urlFilterState.categories,
      level: urlFilterState.level,
      sort: urlFilterState.sort,
      page: urlFilterState.page,
      pageSize,
    })
  }, [catalog, urlFilterState, pageSize])

  // Auto-clamp page in URL if URL has a page number that is too high
  useEffect(() => {
    if (urlFilterState.page > filterResult.totalPages && filterResult.totalPages > 0) {
      const nextState: CourseFilterState = {
        ...urlFilterState,
        page: filterResult.totalPages,
      }
      setSearchParams(serializeCourseFilterParams(nextState), { replace: true })
    }
  }, [urlFilterState, filterResult.totalPages, setSearchParams])

  // 6. Fast Set lookup for enrolled courses
  const enrolledCourseIds = useMemo(() => new Set(enrolledIds), [enrolledIds])
  const isEnrolled = useCallback(
    (courseId: string) => enrolledCourseIds.has(courseId),
    [enrolledCourseIds]
  )

  return {
    courses: filterResult.courses,
    allFilteredCourses: filterResult.allFilteredCourses,
    totalCount: filterResult.totalCount,
    totalPages: filterResult.totalPages,
    currentPage: filterResult.currentPage,
    pageSize: filterResult.pageSize,
    isLoading: searchInput.trim() !== urlFilterState.search.trim(),

    search: urlFilterState.search,
    searchInput,
    selectedCategories: urlFilterState.categories,
    selectedLevel: urlFilterState.level,
    selectedSort: urlFilterState.sort,

    setSearchInput,
    setCategories,
    toggleCategory,
    removeCategory,
    setLevel,
    clearLevel,
    setSort,
    setPage,
    clearSearch,
    clearAllFilters,

    enrolledCourseIds,
    isEnrolled,
  }
}
