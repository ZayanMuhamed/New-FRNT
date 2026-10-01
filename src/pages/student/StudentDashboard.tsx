import React, { useEffect, useState, useRef } from 'react'
import {
  Sparkles,
  TrendingUp,
  SlidersHorizontal,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useEnrollment } from '../../context/EnrollmentContext'
import { useProgress } from '../../context/ProgressContext'
import { courseCatalog } from '../../data/courseCatalog'
import { findLesson, slugify } from '../../utils/lessonHelper'
import { DashboardLayout, NavTab } from '../../components/layout/DashboardLayout'
import { getStudentDashboard } from '../../services/studentService'
import { StudentDashboardData } from '../../types/student'
import { DashboardSkeleton } from '../../components/student/DashboardSkeleton'
import { ContinueLearning } from '../../components/dashboard/ContinueLearning'
import { ProfileSummary } from '../../components/dashboard/ProfileSummary'
import { CourseGrid } from '../../components/dashboard/CourseGrid'
import { RecentLessons, RecentLessonItem } from '../../components/dashboard/RecentLessons'
import { CompletedCourses, CompletedCourseItem } from '../../components/dashboard/CompletedCourses'

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth()
  const { enrolledCourseIds } = useEnrollment()
  const { getCourseProgress, getFirstUnfinishedLesson, getOverallProgress } = useProgress()
  const navigate = useNavigate()
  const [data, setData] = useState<StudentDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard')
  const [emptyPreview, setEmptyPreview] = useState<'none' | 'recent' | 'completed' | 'all'>('none')

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      setIsLoading(true)
      try {
        const result = await getStudentDashboard()
        if (isMounted) {
          setData(result)
        }
      } catch (err) {
        console.error('Failed to load student dashboard:', err)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [user])

  // Merge enrolled courses from backend with any newly enrolled courses from session
  // and dynamically enrich with live progress from ProgressContext
  const enrolledCoursesList = React.useMemo(() => {
    if (!data?.enrolledCourses) return []
    const existingIds = new Set(data.enrolledCourses.map((c) => c.id))
    const merged = [...data.enrolledCourses]

    enrolledCourseIds.forEach((id) => {
      if (!existingIds.has(id)) {
        const catalogItem = courseCatalog.find((c) => c.id === id)
        if (catalogItem) {
          merged.push({
            id: catalogItem.id,
            title: catalogItem.title,
            instructor: catalogItem.instructor,
            progress: 0,
            status: 'in-progress',
            nextLesson: catalogItem.syllabus?.[0]?.lessons?.[0] || 'Orientation & Introduction',
            code: catalogItem.id.toUpperCase().replace('_', '-'),
            credits: 3,
            category: catalogItem.category,
            completedLessons: 0,
            totalLessons: catalogItem.lessonCount,
            lastAccessed: 'Just enrolled',
          })
          existingIds.add(id)
        }
      }
    })

    return merged.map((c) => {
      const prog = getCourseProgress(c.id)
      const nextUnfinished = getFirstUnfinishedLesson(c.id)
      return {
        ...c,
        progress: prog.percentage,
        completedLessons: prog.completedCount,
        totalLessons: prog.totalCount || c.totalLessons,
        status: (prog.percentage === 100
          ? 'completed'
          : prog.percentage === 0
          ? 'not-started'
          : 'in-progress') as any,
        nextLesson: nextUnfinished
          ? nextUnfinished.title
          : prog.percentage === 100
          ? 'Course completed'
          : c.nextLesson,
      }
    })
  }, [data?.enrolledCourses, enrolledCourseIds, getCourseProgress, getFirstUnfinishedLesson])

  // Navigation handlers for Resume / Course cards
  const handleResumeCourse = (course: any) => {
    const nextL = getFirstUnfinishedLesson(course.id)
    if (nextL) {
      navigate(`/student/learn/${course.id}/${nextL.id}`)
    }
  }

  const handleResumeRecentLesson = (lesson: RecentLessonItem) => {
    const target =
      findLesson(lesson.courseId, lesson.id) ||
      findLesson(lesson.courseId, slugify(lesson.title))
    if (target) {
      navigate(`/student/learn/${lesson.courseId}/${target.id}`)
    } else {
      const nextL = getFirstUnfinishedLesson(lesson.courseId)
      if (nextL) {
        navigate(`/student/learn/${lesson.courseId}/${nextL.id}`)
      }
    }
  }

  // Dynamic greeting based on current time
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const firstName = data?.student?.name?.split(' ')[0] || user?.name?.split(' ')[0] || 'Alex'
  const continueCourse =
    enrolledCoursesList.find((c) => c.progress < 100) || enrolledCoursesList[0]

  // One-time staggered entrance animation on initial page load only (no repeat on re-render)
  const hasAnimatedRef = useRef(false)
  const [animationDone, setAnimationDone] = useState(false)

  const isEntering = !isLoading && !!data && !hasAnimatedRef.current && !animationDone

  useEffect(() => {
    if (!isLoading && data && !hasAnimatedRef.current && !animationDone) {
      const timer = setTimeout(() => {
        hasAnimatedRef.current = true
        setAnimationDone(true)
      }, 1200)

      return () => clearTimeout(timer)
    }
  }, [isLoading, data, animationDone])

  const getStaggerStyle = (stepIndex: number): React.CSSProperties | undefined => {
    if (!isEntering) return undefined
    return {
      '--stagger-delay': `${stepIndex * 80}ms`,
    } as React.CSSProperties
  }
  const staggerClass = isEntering ? 'dashboard-stagger-section' : ''

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {isLoading || !data ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-8">
          {/* Greeting Header */}
          <section
            aria-label="Greeting Header"
            className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10 ${staggerClass}`}
            style={getStaggerStyle(0)}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase bg-[var(--accent)]/10 text-[var(--accent)] px-2.5 py-0.5 rounded-full border border-[var(--accent)]/20">
                  {data.student.semester || 'Semester 6'}
                </span>
                <span className="text-xs text-[var(--muted)]">• Academic Year 2025–2026</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-[var(--text)] mt-2">
                {getGreeting()}, {firstName}
              </h1>
              <p className="text-sm text-[var(--muted)] mt-1">
                Here is your academic overview and learning trajectory for today.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[var(--text)] font-medium">3.92 GPA</span>
                <span className="text-[var(--muted)]">Honor Roll</span>
              </div>
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-xs text-[var(--accent)]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Semester 6 in progress</span>
              </div>
            </div>
          </section>

          {/* Row 1: Profile Summary Card */}
          <div className={staggerClass} style={getStaggerStyle(1)}>
            <ProfileSummary
              student={{
                ...data.student,
                overallProgress: getOverallProgress().percentage,
              }}
              courses={enrolledCoursesList}
            />
          </div>

          {/* Row 2: Continue Learning (Featured Card) */}
          {continueCourse && (
            <div className={staggerClass} style={getStaggerStyle(2)}>
              <ContinueLearning
                course={continueCourse}
                onResume={handleResumeCourse}
              />
            </div>
          )}

          {/* Row 3: Enrolled Courses Grid */}
          <div className={staggerClass} style={getStaggerStyle(3)}>
            <CourseGrid
              courses={enrolledCoursesList}
              onCourseClick={handleResumeCourse}
            />
          </div>

          {/* Preview State Switcher */}
          <div
            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 text-xs ${staggerClass}`}
            style={getStaggerStyle(4)}
          >
            <div className="flex items-center gap-2 text-[var(--muted)]">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Preview state:</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setEmptyPreview('none')}
                className={`min-h-[44px] px-3.5 py-2 inline-flex items-center justify-center rounded-full text-xs font-medium transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04060d] focus-visible:outline-none ${
                  emptyPreview === 'none'
                    ? 'bg-[var(--accent)] text-[#04060d] font-semibold shadow-[0_0_12px_rgba(143,180,255,0.3)]'
                    : 'bg-white/5 text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/10'
                }`}
              >
                Populated
              </button>
              <button
                type="button"
                onClick={() => setEmptyPreview('recent')}
                className={`min-h-[44px] px-3.5 py-2 inline-flex items-center justify-center rounded-full text-xs font-medium transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04060d] focus-visible:outline-none ${
                  emptyPreview === 'recent'
                    ? 'bg-[var(--accent)] text-[#04060d] font-semibold shadow-[0_0_12px_rgba(143,180,255,0.3)]'
                    : 'bg-white/5 text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/10'
                }`}
              >
                Empty lessons
              </button>
              <button
                type="button"
                onClick={() => setEmptyPreview('completed')}
                className={`min-h-[44px] px-3.5 py-2 inline-flex items-center justify-center rounded-full text-xs font-medium transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04060d] focus-visible:outline-none ${
                  emptyPreview === 'completed'
                    ? 'bg-[var(--accent)] text-[#04060d] font-semibold shadow-[0_0_12px_rgba(143,180,255,0.3)]'
                    : 'bg-white/5 text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/10'
                }`}
              >
                Empty completed
              </button>
              <button
                type="button"
                onClick={() => setEmptyPreview('all')}
                className={`min-h-[44px] px-3.5 py-2 inline-flex items-center justify-center rounded-full text-xs font-medium transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04060d] focus-visible:outline-none ${
                  emptyPreview === 'all'
                    ? 'bg-[var(--accent)] text-[#04060d] font-semibold shadow-[0_0_12px_rgba(143,180,255,0.3)]'
                    : 'bg-white/5 text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/10'
                }`}
              >
                Both empty
              </button>
            </div>
          </div>

          {/* Row 4: Recently Accessed Lessons */}
          <div className={staggerClass} style={getStaggerStyle(5)}>
            <RecentLessons
              lessons={emptyPreview === 'recent' || emptyPreview === 'all' ? [] : (data.recentLessons as unknown as RecentLessonItem[])}
              onSelectLesson={handleResumeRecentLesson}
              onExploreCourses={() => setActiveTab('courses')}
            />
          </div>

          {/* Row 5: Completed Courses */}
          <div className={staggerClass} style={getStaggerStyle(6)}>
            <CompletedCourses
              courses={emptyPreview === 'completed' || emptyPreview === 'all' ? [] : (data.completedCourses as unknown as CompletedCourseItem[])}
              onViewCourse={(course: CompletedCourseItem) => {
                console.log('View course:', course.title)
              }}
              onViewCertificate={(course: CompletedCourseItem) => {
                console.log('View certificate for:', course.title)
              }}
              onExploreCourses={() => setActiveTab('courses')}
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default StudentDashboard
