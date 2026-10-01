export type UserRole = 'student' | 'admin'

export type SocialProvider = 'google' | 'apple' | 'twitter'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  studentId?: string
  department?: string
  title?: string
  provider?: 'email' | SocialProvider
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignUpData {
  name: string
  email: string
  password: string
  role: UserRole
}

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<User>
  signUp: (data: SignUpData) => Promise<User>
  loginWithSocial: (provider: SocialProvider, role: UserRole) => Promise<User>
  logout: () => void
}
