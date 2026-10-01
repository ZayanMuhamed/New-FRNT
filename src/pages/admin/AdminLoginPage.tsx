import React from 'react'
import { AuthPage } from '../auth/AuthPage'

export const AdminLoginPage: React.FC = () => {
  return <AuthPage initialRole="admin" />
}

export default AdminLoginPage
