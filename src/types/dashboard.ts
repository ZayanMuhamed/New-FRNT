export interface Lesson {
  id: string
  lessonNumber?: number
  title: string
  duration?: string
  summary?: string
}

export interface Course {
  id: string
  title: string
  code?: string
  credits?: number
  instructor: string
  category?: string
  progress: number
  totalLessons?: number
  completedLessons?: number
  lastAccessed?: string
  nextLesson?: string | Lesson
  status?: string
  completedOn?: string
}

export interface StudentProfile {
  name: string
  studentId: string
  program: string
  semester: string
  overallGpa?: number
  overallProgress: number
  avatar?: string
}

export interface ContinueLearningProps {
  course?: Course
  onResume?: (courseId: string) => void
  className?: string
}



export interface RecentLesson {
  id: string
  title: string
  courseId: string
  courseName: string
  duration?: string
  accessedAt: string | Date
  progressPercent?: number
}

export interface CompletedCourse {
  id: string
  title: string
  courseCode?: string
  instructor: string
  completedDate: string
  grade?: string
  credentialId?: string
  totalLessons?: number
  certificateUrl?: string
}

