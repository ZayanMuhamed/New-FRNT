import {
  CatalogCourse,
  CourseFilterState,
  CourseLevel,
  CourseSortOption,
  CourseFilterResult,
} from '../types/course'

export interface CourseFilterOptions {
  search?: string
  categories?: string[]
  level?: CourseLevel | 'All'
  sort?: CourseSortOption
  page?: number
  pageSize?: number
}

export const DEFAULT_PAGE_SIZE = 9

/**
 * Pure function to filter courses using AND logic:
 * - search matches course title, instructor, or category (case-insensitive)
 * - categories matches course category (if non-empty)
 * - level matches course level (if not 'All')
 */
export function filterCourses(
  courses: CatalogCourse[],
  options: Pick<CourseFilterOptions, 'search' | 'categories' | 'level'>
): CatalogCourse[] {
  const searchTerm = options.search?.trim().toLowerCase() || ''
  const selectedCategories = options.categories || []
  const selectedLevel = options.level || 'All'

  return courses.filter((course) => {
    // 1. Search filter: matches title, instructor, or category
    if (searchTerm) {
      const matchTitle = course.title.toLowerCase().includes(searchTerm)
      const matchInstructor = course.instructor.toLowerCase().includes(searchTerm)
      const matchCategory = course.category.toLowerCase().includes(searchTerm)

      if (!matchTitle && !matchInstructor && !matchCategory) {
        return false
      }
    }

    // 2. Categories filter: OR within selected categories
    if (selectedCategories.length > 0) {
      if (!selectedCategories.includes(course.category)) {
        return false
      }
    }

    // 3. Level filter: matches level exactly unless 'All'
    if (selectedLevel !== 'All') {
      if (course.level !== selectedLevel) {
        return false
      }
    }

    return true
  })
}

/**
 * Sorts courses by chosen sorting criteria
 */
export function sortCourses(
  courses: CatalogCourse[],
  sortOption: CourseSortOption = 'popular'
): CatalogCourse[] {
  const list = [...courses]

  switch (sortOption) {
    case 'rating-desc':
      return list.sort((a, b) => b.rating - a.rating || a.title.localeCompare(b.title))

    case 'rating-asc':
      return list.sort((a, b) => a.rating - b.rating || a.title.localeCompare(b.title))

    case 'title-asc':
      return list.sort((a, b) => a.title.localeCompare(b.title))

    case 'title-desc':
      return list.sort((a, b) => b.title.localeCompare(a.title))

    case 'lessons-desc':
      return list.sort((a, b) => b.lessonCount - a.lessonCount || b.rating - a.rating)

    case 'popular':
    default:
      // Default natural catalog order
      return list
  }
}

/**
 * Paginates a list of courses with page clamping
 */
export function paginateCourses(
  courses: CatalogCourse[],
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZE
): CourseFilterResult {
  const totalCount = courses.length
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const currentPage = Math.min(Math.max(1, page), totalPages)

  const startIndex = (currentPage - 1) * pageSize
  const paginatedCourses = courses.slice(startIndex, startIndex + pageSize)

  return {
    courses: paginatedCourses,
    allFilteredCourses: courses,
    totalCount,
    totalPages,
    currentPage,
    pageSize,
  }
}

/**
 * Combines filtering, sorting, and pagination in a single pipeline
 */
export function filterAndPaginateCourses(
  courses: CatalogCourse[],
  options: CourseFilterOptions = {}
): CourseFilterResult {
  const {
    search = '',
    categories = [],
    level = 'All',
    sort = 'popular',
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
  } = options

  const filtered = filterCourses(courses, { search, categories, level })
  const sorted = sortCourses(filtered, sort)
  return paginateCourses(sorted, page, pageSize)
}

/**
 * Parse filter state from URLSearchParams
 */
export function parseCourseFilterParams(searchParams: URLSearchParams): CourseFilterState {
  // Search
  const search = searchParams.get('search') || searchParams.get('q') || ''

  // Categories (handles ?categories=A,B and ?category=A&category=B)
  const categoryRawList = [
    ...searchParams.getAll('categories'),
    ...searchParams.getAll('category'),
  ]
  const parsedCategories = Array.from(
    new Set(
      categoryRawList
        .flatMap((item) => item.split(','))
        .map((cat) => cat.trim())
        .filter(Boolean)
    )
  )

  // Level
  const levelRaw = searchParams.get('level')
  const validLevels: CourseLevel[] = ['Beginner', 'Intermediate', 'Advanced']
  const level: CourseLevel | 'All' =
    levelRaw && validLevels.includes(levelRaw as CourseLevel)
      ? (levelRaw as CourseLevel)
      : 'All'

  // Sort
  const sortRaw = searchParams.get('sort')
  const validSorts: CourseSortOption[] = [
    'popular',
    'rating-desc',
    'rating-asc',
    'title-asc',
    'title-desc',
    'lessons-desc',
  ]
  const sort: CourseSortOption =
    sortRaw && validSorts.includes(sortRaw as CourseSortOption)
      ? (sortRaw as CourseSortOption)
      : 'popular'

  // Page
  const pageRaw = parseInt(searchParams.get('page') || '1', 10)
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1

  return {
    search,
    categories: parsedCategories,
    level,
    sort,
    page,
  }
}

/**
 * Serialize filter state to URLSearchParams (omitting defaults to keep URLs clean)
 */
export function serializeCourseFilterParams(state: CourseFilterState): URLSearchParams {
  const params = new URLSearchParams()

  const trimmedSearch = state.search.trim()
  if (trimmedSearch) {
    params.set('search', trimmedSearch)
  }

  if (state.categories && state.categories.length > 0) {
    params.set('categories', state.categories.join(','))
  }

  if (state.level && state.level !== 'All') {
    params.set('level', state.level)
  }

  if (state.sort && state.sort !== 'popular') {
    params.set('sort', state.sort)
  }

  if (state.page && state.page > 1) {
    params.set('page', String(state.page))
  }

  return params
}
