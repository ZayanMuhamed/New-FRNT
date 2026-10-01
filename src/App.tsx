import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthPage } from './pages/auth/AuthPage'
import StudentDashboard from './pages/student/StudentDashboard'
import CourseListing from './pages/CourseListing'
import AdminDashboard from './pages/admin/AdminDashboard'
import CheckoutPage from './pages/student/CheckoutPage'
import CheckoutProcessingPage from './pages/student/CheckoutProcessingPage'
import CheckoutSuccessPage from './pages/student/CheckoutSuccessPage'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { EnrollmentProvider } from './context/EnrollmentContext'
import { ToastProvider } from './context/ToastContext'
import { ToastContainer } from './components/ui/ToastContainer'

import { ProgressProvider } from './context/ProgressContext'
import LessonPage from './pages/student/LessonPage'
import { useParams } from 'react-router-dom'

const CourseParamRedirect: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>()
  return <Navigate to={`/student/courses?course=${courseId}`} replace />
}

export const App: React.FC = () => {
  return (
    <EnrollmentProvider>
      <ProgressProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/student" replace />} />
            <Route path="/student" element={<AuthPage />} />
            <Route path="/admin" element={<AuthPage />} />
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute allowedRole="student">
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/courses"
              element={
                <ProtectedRoute allowedRole="student">
                  <CourseListing />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/courses/:courseId"
              element={
                <ProtectedRoute allowedRole="student">
                  <CourseParamRedirect />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/learn/:courseId/:lessonId"
              element={
                <ProtectedRoute allowedRole="student">
                  <LessonPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/checkout/:courseId"
              element={
                <ProtectedRoute allowedRole="student">
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/checkout/:courseId/processing"
              element={
                <ProtectedRoute allowedRole="student">
                  <CheckoutProcessingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/checkout/:courseId/success"
              element={
                <ProtectedRoute allowedRole="student">
                  <CheckoutSuccessPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/student" replace />} />
          </Routes>
          <ToastContainer />
        </ToastProvider>
      </ProgressProvider>
    </EnrollmentProvider>
  )
}

export default App
