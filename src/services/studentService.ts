import {
  Student,
  Course,
  RecentLesson,
  StudentDashboardData,
} from '../types/student'
import {
  mockStudent,
  mockEnrolledCourses,
  mockCompletedCourses,
  mockRecentLessons,
  mockStudentDashboard,
} from '../data/studentData'

/**
 * Service for fetching student portal dashboard and course data.
 */
export const studentService = {
  /**
   * Fetches the complete student dashboard data with a simulated 400ms delay.
   * Optionally accepts authenticated user to customize data if provided.
   */
  async getStudentDashboard(_user?: unknown): Promise<StudentDashboardData> {
    await new Promise((resolve) => setTimeout(resolve, 400))
    // Return structured clone to prevent accidental mutations of mock data
    return JSON.parse(JSON.stringify(mockStudentDashboard))
  },

  /**
   * Fetches current student profile with simulated network latency.
   */
  async getStudentProfile(): Promise<Student> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return JSON.parse(JSON.stringify(mockStudent))
  },

  /**
   * Fetches all enrolled courses.
   */
  async getEnrolledCourses(): Promise<Course[]> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return JSON.parse(JSON.stringify(mockEnrolledCourses))
  },

  /**
   * Fetches all completed courses.
   */
  async getCompletedCourses(): Promise<Course[]> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return JSON.parse(JSON.stringify(mockCompletedCourses))
  },

  /**
   * Fetches recently accessed lessons.
   */
  async getRecentLessons(): Promise<RecentLesson[]> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return JSON.parse(JSON.stringify(mockRecentLessons))
  },

  /**
   * Fetches a course by its unique ID.
   */
  async getCourseById(courseId: string): Promise<Course | undefined> {
    await new Promise((resolve) => setTimeout(resolve, 150))
    const allCourses = [...mockEnrolledCourses, ...mockCompletedCourses]
    const found = allCourses.find((course) => course.id === courseId)
    return found ? JSON.parse(JSON.stringify(found)) : undefined
  },
}

/**
 * Standalone export of getStudentDashboard function as requested.
 */
export const getStudentDashboard = studentService.getStudentDashboard

export default studentService
