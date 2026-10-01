export type CourseStatus = 'in-progress' | 'completed' | 'not-started'

export interface Student {
  id: string
  name: string
  email: string
  avatar?: string
  studentId: string
  program: string
  semester: string
  overallProgress: number // 0-100
}

export interface Course {
  id: string
  title: string
  instructor: string
  progress: number // 0-100
  status: CourseStatus
  nextLesson: string
  completedOn?: string
  code?: string
  credits?: number
  category?: string
  completedLessons?: number
  totalLessons?: number
  lastAccessed?: string
}

export interface RecentLesson {
  id: string
  title: string
  courseId: string
  courseTitle: string
  accessedAt: string
  duration?: string
  lessonNumber?: number
}

export interface StudentDashboardData {
  student: Student
  enrolledCourses: Course[]
  completedCourses: Course[]
  recentLessons: RecentLesson[]
  continueLearningCourse: Course
  continueLearning: Course
}
