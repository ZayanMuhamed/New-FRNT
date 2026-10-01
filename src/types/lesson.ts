export interface LessonResource {
  id: string
  name: string
  type: 'pdf' | 'zip' | 'code' | 'doc'
  size: string
  url: string
}

export interface CourseLesson {
  id: string
  courseId: string
  moduleId: string
  moduleNumber: number
  moduleTitle: string
  title: string
  duration: string
  description: string
  order: number // 1-based global order in the course
  videoUrl: string
  resources: LessonResource[]
}

export interface CourseProgressRecord {
  completedLessonIds: string[]
  playbackPositions: Record<string, number> // lessonId -> seconds
  lastAccessedLessonId?: string
}

export type StudentProgressState = Record<string, CourseProgressRecord> // courseId -> record

export interface CourseProgressSummary {
  completedCount: number
  totalCount: number
  percentage: number
}

export interface ProgressContextType {
  progressState: StudentProgressState
  isLessonCompleted: (courseId: string, lessonId: string) => boolean
  markLessonComplete: (courseId: string, lessonId: string) => void
  unmarkLessonComplete: (courseId: string, lessonId: string) => void
  toggleLessonComplete: (courseId: string, lessonId: string) => boolean
  getPlaybackPosition: (courseId: string, lessonId: string) => number
  setPlaybackPosition: (courseId: string, lessonId: string, seconds: number) => void
  getCourseProgress: (courseId: string) => CourseProgressSummary
  getOverallProgress: () => CourseProgressSummary
  getNextLesson: (courseId: string, currentLessonId: string) => CourseLesson | null
  getPreviousLesson: (courseId: string, currentLessonId: string) => CourseLesson | null
  getFirstUnfinishedLesson: (courseId: string) => CourseLesson | null
  getCourseLessons: (courseId: string) => CourseLesson[]
  resetProgress: () => void
}
