export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced'

export type CourseCategory =
  | 'Core Systems'
  | 'Artificial Intelligence'
  | 'Data Architecture'
  | 'Cybersecurity'
  | 'Emerging Tech'
  | 'Foundations'

export interface SyllabusItem {
  week: number
  title: string
  topics?: string[]
}

export interface CatalogCourse {
  id: string
  title: string
  instructor: string
  category: CourseCategory
  level: CourseLevel
  duration: string
  rating: number
  reviewCount: number
  lessonCount: number
  description: string
  learningPoints: string[]
  syllabus: SyllabusItem[]
  gradient: string
  badge?: string
}

export type SortOption = 'popular' | 'rating' | 'lessons' | 'title-asc' | 'title-desc'

export interface CourseFilterState {
  search: string
  categories: CourseCategory[]
  level: CourseLevel | 'All'
  sort: SortOption
  page: number
}
