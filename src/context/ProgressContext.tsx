import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import {
  CourseLesson,
  CourseProgressSummary,
  ProgressContextType,
  StudentProgressState,
} from '../types/lesson'
import { mockEnrolledCourses, mockCompletedCourses } from '../data/studentData'
import {
  getCourseLessons,
  findLesson,
  getNextLesson as getNextLessonHelper,
  getPreviousLesson as getPreviousLessonHelper,
  getFirstUnfinishedLesson as getFirstUnfinishedHelper,
} from '../utils/lessonHelper'

const PROGRESS_STORAGE_KEY = 'hermes_student_progress'

function getInitialProgressState(): StudentProgressState {
  if (typeof window !== 'undefined') {
    try {
      const stored = window.sessionStorage.getItem(PROGRESS_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed && typeof parsed === 'object') {
          return parsed
        }
      }
    } catch (e) {
      console.warn('Failed to parse progress state from sessionStorage:', e)
    }
  }

  // Seed default progress state from mock student data
  const initial: StudentProgressState = {}

  // 1. Seed enrolled courses
  mockEnrolledCourses.forEach((c) => {
    const lessons = getCourseLessons(c.id)
    const completedCount = Math.min(c.completedLessons || 0, lessons.length)
    const completedLessonIds = lessons.slice(0, completedCount).map((l) => l.id)

    // Find next lesson to seed playback position
    const nextLesson = lessons[completedCount] || lessons[0]
    const playbackPositions: Record<string, number> = {}
    if (nextLesson && completedCount > 0 && completedCount < lessons.length) {
      playbackPositions[nextLesson.id] = 45 // 45 seconds initial playback for active lesson
    }

    initial[c.id] = {
      completedLessonIds,
      playbackPositions,
      lastAccessedLessonId: nextLesson?.id,
    }
  })

  // 2. Seed completed courses (100% complete)
  mockCompletedCourses.forEach((c) => {
    const lessons = getCourseLessons(c.id)
    initial[c.id] = {
      completedLessonIds: lessons.map((l) => l.id),
      playbackPositions: {},
      lastAccessedLessonId: lessons[lessons.length - 1]?.id,
    }
  })

  return initial
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined)

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progressState, setProgressState] = useState<StudentProgressState>(getInitialProgressState)

  // Sync to sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.sessionStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progressState))
      } catch (e) {
        console.warn('Failed to persist progress to sessionStorage:', e)
      }
    }
  }, [progressState])

  const isLessonCompleted = useCallback(
    (courseId: string, lessonId: string) => {
      const courseRecord = progressState[courseId]
      if (!courseRecord) return false
      const target = findLesson(courseId, lessonId)
      const targetId = target ? target.id : lessonId
      return courseRecord.completedLessonIds.includes(targetId)
    },
    [progressState]
  )

  const markLessonComplete = useCallback((courseId: string, lessonId: string) => {
    const target = findLesson(courseId, lessonId)
    const targetId = target ? target.id : lessonId

    setProgressState((prev) => {
      const currentCourse = prev[courseId] || {
        completedLessonIds: [],
        playbackPositions: {},
      }
      if (currentCourse.completedLessonIds.includes(targetId)) {
        return prev
      }
      const updated = {
        ...prev,
        [courseId]: {
          ...currentCourse,
          completedLessonIds: [...currentCourse.completedLessonIds, targetId],
          lastAccessedLessonId: targetId,
        },
      }
      return updated
    })
  }, [])

  const unmarkLessonComplete = useCallback((courseId: string, lessonId: string) => {
    const target = findLesson(courseId, lessonId)
    const targetId = target ? target.id : lessonId

    setProgressState((prev) => {
      const currentCourse = prev[courseId]
      if (!currentCourse) return prev
      return {
        ...prev,
        [courseId]: {
          ...currentCourse,
          completedLessonIds: currentCourse.completedLessonIds.filter((id) => id !== targetId),
        },
      }
    })
  }, [])

  const toggleLessonComplete = useCallback(
    (courseId: string, lessonId: string): boolean => {
      const target = findLesson(courseId, lessonId)
      const targetId = target ? target.id : lessonId
      const currentCourse = progressState[courseId]
      const isCurrentlyCompleted = currentCourse
        ? currentCourse.completedLessonIds.includes(targetId)
        : false

      if (isCurrentlyCompleted) {
        unmarkLessonComplete(courseId, targetId)
        return false
      } else {
        markLessonComplete(courseId, targetId)
        return true
      }
    },
    [progressState, markLessonComplete, unmarkLessonComplete]
  )

  const getPlaybackPosition = useCallback(
    (courseId: string, lessonId: string): number => {
      const target = findLesson(courseId, lessonId)
      const targetId = target ? target.id : lessonId
      return progressState[courseId]?.playbackPositions?.[targetId] || 0
    },
    [progressState]
  )

  const setPlaybackPosition = useCallback(
    (courseId: string, lessonId: string, seconds: number) => {
      const target = findLesson(courseId, lessonId)
      const targetId = target ? target.id : lessonId

      setProgressState((prev) => {
        const currentCourse = prev[courseId] || {
          completedLessonIds: [],
          playbackPositions: {},
        }
        return {
          ...prev,
          [courseId]: {
            ...currentCourse,
            lastAccessedLessonId: targetId,
            playbackPositions: {
              ...currentCourse.playbackPositions,
              [targetId]: Math.max(0, Math.floor(seconds)),
            },
          },
        }
      })
    },
    []
  )

  const getCourseProgress = useCallback(
    (courseId: string): CourseProgressSummary => {
      const lessons = getCourseLessons(courseId)
      const totalCount = lessons.length
      if (totalCount === 0) {
        return { completedCount: 0, totalCount: 0, percentage: 0 }
      }

      const completedIds = new Set(progressState[courseId]?.completedLessonIds || [])
      const completedCount = lessons.filter((l) => completedIds.has(l.id)).length
      const percentage = Math.round((completedCount / totalCount) * 100)

      return {
        completedCount,
        totalCount,
        percentage,
      }
    },
    [progressState]
  )

  const getOverallProgress = useCallback((): CourseProgressSummary => {
    let totalLessonsAcrossCourses = 0
    let completedLessonsAcrossCourses = 0

    Object.keys(progressState).forEach((courseId) => {
      const lessons = getCourseLessons(courseId)
      if (lessons.length > 0) {
        totalLessonsAcrossCourses += lessons.length
        const completedIds = new Set(progressState[courseId]?.completedLessonIds || [])
        completedLessonsAcrossCourses += lessons.filter((l) => completedIds.has(l.id)).length
      }
    })

    const percentage =
      totalLessonsAcrossCourses > 0
        ? Math.round((completedLessonsAcrossCourses / totalLessonsAcrossCourses) * 100)
        : 0

    return {
      completedCount: completedLessonsAcrossCourses,
      totalCount: totalLessonsAcrossCourses,
      percentage,
    }
  }, [progressState])

  const getNextLesson = useCallback((courseId: string, currentLessonId: string): CourseLesson | null => {
    return getNextLessonHelper(courseId, currentLessonId)
  }, [])

  const getPreviousLesson = useCallback(
    (courseId: string, currentLessonId: string): CourseLesson | null => {
      return getPreviousLessonHelper(courseId, currentLessonId)
    },
    []
  )

  const getFirstUnfinishedLesson = useCallback(
    (courseId: string): CourseLesson | null => {
      const completedIds = progressState[courseId]?.completedLessonIds || []
      return getFirstUnfinishedHelper(courseId, completedIds)
    },
    [progressState]
  )

  const getCourseLessonsCallback = useCallback((courseId: string): CourseLesson[] => {
    return getCourseLessons(courseId)
  }, [])

  const resetProgress = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        window.sessionStorage.removeItem(PROGRESS_STORAGE_KEY)
      } catch (e) {
        console.warn(e)
      }
    }
    setProgressState(getInitialProgressState())
  }, [])

  const value = useMemo(
    () => ({
      progressState,
      isLessonCompleted,
      markLessonComplete,
      unmarkLessonComplete,
      toggleLessonComplete,
      getPlaybackPosition,
      setPlaybackPosition,
      getCourseProgress,
      getOverallProgress,
      getNextLesson,
      getPreviousLesson,
      getFirstUnfinishedLesson,
      getCourseLessons: getCourseLessonsCallback,
      resetProgress,
    }),
    [
      progressState,
      isLessonCompleted,
      markLessonComplete,
      unmarkLessonComplete,
      toggleLessonComplete,
      getPlaybackPosition,
      setPlaybackPosition,
      getCourseProgress,
      getOverallProgress,
      getNextLesson,
      getPreviousLesson,
      getFirstUnfinishedLesson,
      getCourseLessonsCallback,
      resetProgress,
    ]
  )

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress(): ProgressContextType {
  const context = useContext(ProgressContext)
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider')
  }
  return context
}
