export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced'

export interface SyllabusModule {
  id: string
  module: number
  title: string
  duration?: string
  lessons: string[]
}

export interface CatalogCourse {
  id: string
  title: string
  instructor: string
  category: string
  level: CourseLevel
  duration: string
  rating: number
  lessonCount: number
  description: string
  learningPoints: string[]
  syllabus: SyllabusModule[]
}

export type CourseSortOption =
  | 'popular'
  | 'rating-desc'
  | 'rating-asc'
  | 'title-asc'
  | 'title-desc'
  | 'lessons-desc'

export interface CourseFilterState {
  search: string
  categories: string[]
  level: CourseLevel | 'All'
  sort: CourseSortOption
  page: number
}

export interface CourseFilterResult {
  courses: CatalogCourse[]
  allFilteredCourses: CatalogCourse[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
}
