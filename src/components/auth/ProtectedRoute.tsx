import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { UserRole } from '../../types/auth'

export interface ProtectedRouteProps {
  allowedRole: UserRole
  children?: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRole, children }) => {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()

  // 1. If not authenticated, redirect to appropriate role login page with return state
  if (!isAuthenticated || !user) {
    const loginPath = allowedRole === 'admin' ? '/admin' : '/student'
    return <Navigate to={loginPath} state={{ from: location }} replace />
  }

  // 2. If authenticated, but role does not match allowed role, redirect to user's matching dashboard
  if (user.role !== allowedRole) {
    const targetDashboard = user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'
    return <Navigate to={targetDashboard} replace />
  }

  // 3. User is authenticated and role matches
  return <>{children}</>
}

export default ProtectedRoute
