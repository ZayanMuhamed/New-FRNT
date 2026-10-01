import { RecentLesson, CompletedCourse } from '../types/dashboard'

const now = Date.now()
const HOUR = 60 * 60 * 1000

export const mockRecentLessons: RecentLesson[] = [
  {
    id: 'lesson-1',
    title: 'Vector embeddings & cosine similarity',
    courseId: 'course-101',
    courseName: 'Machine Learning Foundations',
    duration: '24 min',
    accessedAt: new Date(now - 2 * HOUR).toISOString(),
    progressPercent: 80,
  },
  {
    id: 'lesson-2',
    title: 'Distributed consensus with Raft',
    courseId: 'course-102',
    courseName: 'Distributed Systems',
    duration: '35 min',
    accessedAt: new Date(now - 5 * HOUR).toISOString(),
    progressPercent: 45,
  },
  {
    id: 'lesson-3',
    title: 'Dynamic programming on trees',
    courseId: 'course-103',
    courseName: 'Advanced Algorithms',
    duration: '18 min',
    accessedAt: new Date(now - 26 * HOUR).toISOString(), // ~1 day ago -> Yesterday
    progressPercent: 90,
  },
  {
    id: 'lesson-4',
    title: 'Query planning & index optimization',
    courseId: 'course-104',
    courseName: 'Database Engine Architecture',
    duration: '40 min',
    accessedAt: new Date(now - 50 * HOUR).toISOString(), // ~2 days ago
    progressPercent: 30,
  },
  {
    id: 'lesson-5',
    title: 'Memory safety & borrow checker',
    courseId: 'course-105',
    courseName: 'Systems Programming in Rust',
    duration: '28 min',
    accessedAt: new Date(now - 98 * HOUR).toISOString(), // ~4 days ago
    progressPercent: 65,
  },
]

export const mockCompletedCourses: CompletedCourse[] = [
  {
    id: 'completed-1',
    title: 'Introduction to Computer Systems',
    courseCode: 'CS 101',
    instructor: 'Dr. Elena Vance',
    completedDate: '2026-08-15',
    grade: 'Grade A',
    credentialId: 'CERT-CS101-8849',
    totalLessons: 24,
  },
  {
    id: 'completed-2',
    title: 'Data Structures & Modern C++',
    courseCode: 'CS 201',
    instructor: 'Prof. Marcus Brody',
    completedDate: '2026-07-22',
    grade: 'Grade A+',
    credentialId: 'CERT-CS201-9213',
    totalLessons: 32,
  },
  {
    id: 'completed-3',
    title: 'Web Application Architecture',
    courseCode: 'CS 305',
    instructor: 'Sarah Lin',
    completedDate: '2026-06-10',
    grade: 'Grade A',
    credentialId: 'CERT-CS305-6450',
    totalLessons: 28,
  },
]
