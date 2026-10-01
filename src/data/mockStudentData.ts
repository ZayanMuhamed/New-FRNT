import { Course, StudentProfile } from '../types/dashboard'

export const mockStudentProfile: StudentProfile = {
  name: 'Alex Vance',
  studentId: 'STU-2026-8819',
  program: 'B.Sc. Computer Science & Engineering',
  semester: 'Semester 6',
  overallGpa: 3.92,
  overallProgress: 72,
}

// Featured active course: Most recently accessed unfinished course
export const featuredCourse: Course = {
  id: 'course-distributed-systems',
  title: 'Distributed Systems & Cloud Architecture',
  code: 'CS-402',
  instructor: 'Dr. Sarah Chen',
  category: 'Core Engineering',
  progress: 68,
  totalLessons: 24,
  completedLessons: 16,
  lastAccessed: '28 minutes ago',
  nextLesson: {
    id: 'lesson-raft-consensus',
    lessonNumber: 17,
    title: 'Consensus with Raft: Leader Election & Log Replication',
    duration: '22 min read',
    summary: 'Analyze split-brain scenarios and safety guarantees in distributed consensus protocols.',
  },
}

export const enrolledCourses: Course[] = [
  featuredCourse,
  {
    id: 'course-compilers',
    title: 'Compilers & Programming Language Design',
    code: 'CS-415',
    instructor: 'Prof. David K. Miller',
    category: 'Systems',
    progress: 45,
    totalLessons: 20,
    completedLessons: 9,
    lastAccessed: 'Yesterday',
    nextLesson: {
      id: 'lesson-llvm-ir',
      lessonNumber: 10,
      title: 'LLVM IR Optimization Pipelines & SSA Form',
      duration: '35 min',
    },
  },
  {
    id: 'course-ml-theory',
    title: 'Foundations of Statistical Machine Learning',
    code: 'DS-301',
    instructor: 'Dr. Elena Rostova',
    category: 'Data Science',
    progress: 58,
    totalLessons: 18,
    completedLessons: 10,
    lastAccessed: '2 days ago',
    nextLesson: {
      id: 'lesson-kernel-methods',
      lessonNumber: 11,
      title: 'Kernel Methods and Reproducing Hilbert Spaces',
      duration: '40 min',
    },
  },
  {
    id: 'course-quantum-computing',
    title: 'Introduction to Quantum Algorithms',
    code: 'PH-320',
    instructor: 'Dr. Aris Thorne',
    category: 'Physics & Computing',
    progress: 30,
    totalLessons: 16,
    completedLessons: 5,
    lastAccessed: '4 days ago',
    nextLesson: {
      id: 'lesson-shors-algo',
      lessonNumber: 6,
      title: 'Quantum Phase Estimation & Shor’s Algorithm',
      duration: '45 min',
    },
  },
  {
    id: 'course-network-security',
    title: 'Network Defense & Cryptographic Protocols',
    code: 'SEC-410',
    instructor: 'Marcus Vance, CISSP',
    category: 'Cybersecurity',
    progress: 82,
    totalLessons: 22,
    completedLessons: 18,
    lastAccessed: '5 days ago',
    nextLesson: {
      id: 'lesson-zero-knowledge',
      lessonNumber: 19,
      title: 'Non-Interactive Zero-Knowledge Proofs (zk-SNARKs)',
      duration: '30 min',
    },
  },
  {
    id: 'course-database-internals',
    title: 'Advanced Database Engine Internals',
    code: 'CS-440',
    instructor: 'Dr. Robert Zhao',
    category: 'Databases',
    progress: 0,
    status: 'not-started',
    totalLessons: 26,
    completedLessons: 0,
    lastAccessed: 'Not started',
    nextLesson: {
      id: 'lesson-lsm-trees',
      lessonNumber: 5,
      title: 'B-Trees vs Log-Structured Merge (LSM) Trees',
      duration: '28 min',
    },
  },
]

export const completedCourses = [
  {
    id: 'course-data-structures',
    title: 'Data Structures & Algorithms',
    code: 'CS-201',
    completedDate: 'Dec 15, 2025',
    grade: 'A+',
  },
  {
    id: 'course-computer-architecture',
    title: 'Computer Architecture & RISC-V',
    code: 'CS-250',
    completedDate: 'Jan 10, 2026',
    grade: 'A',
  },
  {
    id: 'course-os-kernel',
    title: 'Operating Systems Principles',
    code: 'CS-301',
    completedDate: 'Feb 20, 2026',
    grade: 'A+',
  },
]

export const recentLessons = [
  {
    id: 'rec-1',
    title: 'Vector Clocks and Causality in Distributed Systems',
    courseName: 'Distributed Systems & Cloud Architecture',
    timeAgo: '28 minutes ago',
  },
  {
    id: 'rec-2',
    title: 'Parsing with LR(1) and LALR Grammars',
    courseName: 'Compilers & Programming Language Design',
    timeAgo: 'Yesterday at 16:45',
  },
  {
    id: 'rec-3',
    title: 'Support Vector Machines & Margin Maximization',
    courseName: 'Foundations of Statistical Machine Learning',
    timeAgo: '2 days ago',
  },
  {
    id: 'rec-4',
    title: 'Quantum Teleportation & Superdense Coding',
    courseName: 'Introduction to Quantum Algorithms',
    timeAgo: '4 days ago',
  },
  {
    id: 'rec-5',
    title: 'Elliptic Curve Diffie-Hellman Key Exchange',
    courseName: 'Network Defense & Cryptographic Protocols',
    timeAgo: '5 days ago',
  },
]
