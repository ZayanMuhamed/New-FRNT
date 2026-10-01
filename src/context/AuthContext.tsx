import React, { createContext, useContext, useState, useEffect } from 'react'
import { User, LoginCredentials, SignUpData, SocialProvider, UserRole, AuthContextType } from '../types/auth'
import { authService } from '../services/authService'

const SESSION_STORAGE_KEY = 'hermes_auth_session'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null
    try {
      const stored = sessionStorage.getItem(SESSION_STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch (e) {
      console.error('Failed to parse auth session from sessionStorage:', e)
      return null
    }
  })

  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Sync state changes to sessionStorage
  useEffect(() => {
    try {
      if (user) {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user))
      } else {
        sessionStorage.removeItem(SESSION_STORAGE_KEY)
      }
    } catch (e) {
      console.error('Failed to update sessionStorage for auth session:', e)
    }
  }, [user])

  const login = async (credentials: LoginCredentials): Promise<User> => {
    setIsLoading(true)
    try {
      const authenticatedUser = await authService.login(credentials)
      setUser(authenticatedUser)
      return authenticatedUser
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (data: SignUpData): Promise<User> => {
    setIsLoading(true)
    try {
      const newUser = await authService.signUp(data)
      setUser(newUser)
      return newUser
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithSocial = async (provider: SocialProvider, role: UserRole): Promise<User> => {
    setIsLoading(true)
    try {
      const socialUser = await authService.loginWithSocial(provider, role)
      setUser(socialUser)
      return socialUser
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    sessionStorage.removeItem(SESSION_STORAGE_KEY)
    authService.logout().catch(console.error)
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signUp,
    loginWithSocial,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
