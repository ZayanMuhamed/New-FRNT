import React from 'react'
import { AuthPage } from '../auth/AuthPage'

export const StudentLoginPage: React.FC = () => {
  return <AuthPage initialRole="student" />
}

export default StudentLoginPage
