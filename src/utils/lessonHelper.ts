import { courseCatalog } from '../data/courseCatalog'
import { CatalogCourse } from '../types/course'
import { CourseLesson, LessonResource } from '../types/lesson'
import { mockRecentLessons } from '../data/studentData'

// Deterministic duration generator for consistent lesson duration readouts
function getDeterministicDuration(courseId: string, index: number): string {
  const durations = ['12 mins', '15 mins', '18 mins', '22 mins', '25 mins', '30 mins', '14 mins', '20 mins']
  const hash = courseId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) + index * 7
  return durations[hash % durations.length]
}

// Generate realistic mock resources for each lesson
function getLessonResources(courseId: string, lessonIndex: number): LessonResource[] {
  const baseCode = courseId.replace('crs_', '').toUpperCase()
  return [
    {
      id: `${courseId}-res-1`,
      name: `${baseCode}_Lecture_Notes_L${lessonIndex}.pdf`,
      type: 'pdf',
      size: '2.4 MB',
      url: '/resources/lecture-notes.pdf',
    },
    {
      id: `${courseId}-res-2`,
      name: `${baseCode}_Starter_Code_L${lessonIndex}.zip`,
      type: 'zip',
      size: '4.8 MB',
      url: '/resources/starter-code.zip',
    },
    {
      id: `${courseId}-res-3`,
      name: `${baseCode}_Cheat_Sheet.md`,
      type: 'code',
      size: '180 KB',
      url: '/resources/cheatsheet.md',
    },
  ]
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

// Cache of normalized lessons per courseId to avoid recalculating
const lessonsCache = new Map<string, CourseLesson[]>()

export function getCourseLessons(courseOrId: CatalogCourse | string): CourseLesson[] {
  const courseId = typeof courseOrId === 'string' ? courseOrId : courseOrId.id
  if (lessonsCache.has(courseId)) {
    return lessonsCache.get(courseId)!
  }

  const course =
    typeof courseOrId === 'string'
      ? courseCatalog.find((c) => c.id === courseOrId)
      : courseOrId

  if (!course || !course.syllabus) {
    return []
  }

  const lessons: CourseLesson[] = []
  let globalOrder = 1

  course.syllabus.forEach((module, mIdx) => {
    const moduleNumber = module.module || mIdx + 1
    const moduleId = module.id || `${course.id}-m${moduleNumber}`
    const moduleTitle = module.title || `Module ${moduleNumber}`

    if (Array.isArray(module.lessons)) {
      module.lessons.forEach((lessonTitle) => {
        const lessonId = `${course.id}-l${globalOrder}`
        lessons.push({
          id: lessonId,
          courseId: course.id,
          moduleId,
          moduleNumber,
          moduleTitle,
          title: lessonTitle,
          duration: getDeterministicDuration(course.id, globalOrder),
          description: `In this session on "${lessonTitle}", we dissect core architecture, algorithmic trade-offs, and production engineering practices essential for mastering ${moduleTitle}.`,
          order: globalOrder,
          videoUrl: '/videos/lesson-preview.mp4',
          resources: getLessonResources(course.id, globalOrder),
        })
        globalOrder++
      })
    }
  })

  lessonsCache.set(courseId, lessons)
  return lessons
}

// Find lesson by exact ID, alias (lsn_01), slug, or index
export function findLesson(courseId: string, lessonIdentifier: string): CourseLesson | null {
  if (!courseId || !lessonIdentifier) return null
  const lessons = getCourseLessons(courseId)
  if (!lessons.length) return null

  // 1. Direct ID match
  const exact = lessons.find((l) => l.id.toLowerCase() === lessonIdentifier.toLowerCase())
  if (exact) return exact

  // 2. Check mockRecentLessons alias mapping (e.g. lsn_01 -> lesson with matching title in that course)
  const recentMatch = mockRecentLessons.find(
    (rl) => rl.id.toLowerCase() === lessonIdentifier.toLowerCase() && rl.courseId === courseId
  )
  if (recentMatch) {
    const mapped = lessons.find((l) => l.title.toLowerCase() === recentMatch.title.toLowerCase())
    if (mapped) return mapped
  }

  // 3. Slug match
  const slugTarget = slugify(lessonIdentifier)
  const slugMatch = lessons.find((l) => slugify(l.title) === slugTarget || slugify(l.id) === slugTarget)
  if (slugMatch) return slugMatch

  // 4. Numeric order index (e.g. "1" -> first lesson, "l1" -> first lesson)
  const numericStr = lessonIdentifier.replace(/^[lL]/, '')
  const parsedNum = parseInt(numericStr, 10)
  if (!isNaN(parsedNum) && parsedNum >= 1 && parsedNum <= lessons.length) {
    return lessons[parsedNum - 1]
  }

  return null
}

export function getNextLesson(courseId: string, currentLessonId: string): CourseLesson | null {
  const lessons = getCourseLessons(courseId)
  const current = findLesson(courseId, currentLessonId)
  if (!current) return null

  const currentIndex = lessons.findIndex((l) => l.id === current.id)
  if (currentIndex >= 0 && currentIndex < lessons.length - 1) {
    return lessons[currentIndex + 1]
  }
  return null
}

export function getPreviousLesson(courseId: string, currentLessonId: string): CourseLesson | null {
  const lessons = getCourseLessons(courseId)
  const current = findLesson(courseId, currentLessonId)
  if (!current) return null

  const currentIndex = lessons.findIndex((l) => l.id === current.id)
  if (currentIndex > 0) {
    return lessons[currentIndex - 1]
  }
  return null
}

export function getFirstUnfinishedLesson(
  courseId: string,
  completedLessonIds: string[] | Set<string>
): CourseLesson | null {
  const lessons = getCourseLessons(courseId)
  if (!lessons.length) return null

  const completedSet =
    completedLessonIds instanceof Set
      ? completedLessonIds
      : new Set(completedLessonIds)

  for (const lesson of lessons) {
    if (!completedSet.has(lesson.id)) {
      return lesson
    }
  }

  // If all are completed, return the first lesson or the last lesson
  return lessons[0] || null
}
