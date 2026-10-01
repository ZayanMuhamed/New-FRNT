import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { mockEnrolledCourses } from '../data/studentData'

const SESSION_STORAGE_KEY = 'hermes_student_enrolled_courses'

export interface EnrollmentContextType {
  enrolledCourseIds: string[]
  isEnrolled: (courseId: string) => boolean
  enrollCourse: (courseId: string) => void
  unenrollCourse: (courseId: string) => void
  resetEnrollment: () => void
}

const EnrollmentContext = createContext<EnrollmentContextType | undefined>(undefined)

function getInitialEnrolledCourses(): string[] {
  if (typeof window === 'undefined') {
    return mockEnrolledCourses.map((c) => c.id)
  }

  try {
    const stored = window.sessionStorage.getItem(SESSION_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) {
        return parsed
      }
    }
  } catch (err) {
    console.warn('Failed to parse enrolled courses from sessionStorage:', err)
  }

  // Default seed from mock student data
  return mockEnrolledCourses.map((c) => c.id)
}

export const EnrollmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>(getInitialEnrolledCourses)

  // Synchronize state changes to sessionStorage
  useEffect(() => {
    try {
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(enrolledCourseIds))
    } catch (err) {
      console.warn('Failed to save enrolled courses to sessionStorage:', err)
    }
  }, [enrolledCourseIds])

  const enrollCourse = useCallback((courseId: string) => {
    setEnrolledCourseIds((prev) => {
      if (prev.includes(courseId)) {
        return prev
      }
      const updated = [...prev, courseId]
      try {
        window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updated))
      } catch (err) {
        console.warn('Failed to save enrolled courses to sessionStorage:', err)
      }
      return updated
    })
  }, [])

  const unenrollCourse = useCallback((courseId: string) => {
    setEnrolledCourseIds((prev) => prev.filter((id) => id !== courseId))
  }, [])

  const resetEnrollment = useCallback(() => {
    const defaultIds = mockEnrolledCourses.map((c) => c.id)
    setEnrolledCourseIds(defaultIds)
    try {
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(defaultIds))
    } catch (err) {
      console.warn('Failed to reset enrolled courses in sessionStorage:', err)
    }
  }, [])

  const isEnrolled = useCallback(
    (courseId: string) => {
      return enrolledCourseIds.includes(courseId)
    },
    [enrolledCourseIds]
  )

  const value = useMemo(
    () => ({
      enrolledCourseIds,
      isEnrolled,
      enrollCourse,
      unenrollCourse,
      resetEnrollment,
    }),
    [enrolledCourseIds, isEnrolled, enrollCourse, unenrollCourse, resetEnrollment]
  )

  return <EnrollmentContext.Provider value={value}>{children}</EnrollmentContext.Provider>
}

export function useEnrollment(): EnrollmentContextType {
  const context = useContext(EnrollmentContext)
  if (!context) {
    throw new Error('useEnrollment must be used within an EnrollmentProvider')
  }
  return context
}
