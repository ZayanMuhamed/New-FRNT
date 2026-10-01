import { User, LoginCredentials, SignUpData, SocialProvider, UserRole } from '../types/auth'

export const DEMO_USERS: (User & { passwords: string[] })[] = [
  {
    id: 'usr_student_01',
    email: 'alex@university.edu',
    passwords: ['password123', 'student123'],
    name: 'Alex Vance',
    role: 'student',
    studentId: 'STU-2026-8942',
    department: 'Computer Science & Engineering',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    provider: 'email',
  },
  {
    id: 'usr_student_02',
    email: 'student@hermes.org',
    passwords: ['password123', 'student123'],
    name: 'Elena Rostova',
    role: 'student',
    studentId: 'STU-2026-7103',
    department: 'Applied Mathematics',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    provider: 'email',
  },
  {
    id: 'usr_admin_01',
    email: 'admin@hermes.org',
    passwords: ['password123', 'admin123'],
    name: 'Dr. Sarah Connor',
    role: 'admin',
    title: 'Principal Systems Administrator',
    department: 'Hermes Kernel Infrastructure',
    provider: 'email',
  },
  {
    id: 'usr_admin_02',
    email: 'admin@university.edu',
    passwords: ['password123', 'admin123'],
    name: 'Marcus Vance',
    role: 'admin',
    title: 'Director of Academic Computing',
    department: 'Academic Computing Services',
    provider: 'email',
  },
]

// Dynamic user registry initialized from demo users
const registeredUsers: (User & { passwords: string[] })[] = [...DEMO_USERS]

export const authService = {
  /**
   * Authenticates a user against registered users with a simulated network latency.
   */
  async login(credentials: LoginCredentials): Promise<User> {
    const normalizedEmail = credentials.email.trim().toLowerCase()
    const password = credentials.password

    // Simulate 750ms network round-trip delay
    await new Promise((resolve) => setTimeout(resolve, 750))

    const matchedUser = registeredUsers.find(
      (u) => u.email.toLowerCase() === normalizedEmail,
    )

    if (!matchedUser || !matchedUser.passwords.includes(password)) {
      throw new Error('Invalid email or password. Please verify your credentials.')
    }

    // Return user without passwords
    const { passwords: _passwords, ...userProfile } = matchedUser
    return userProfile
  },

  /**
   * Registers a new user with email and password.
   */
  async signUp(data: SignUpData): Promise<User> {
    const normalizedEmail = data.email.trim().toLowerCase()
    const trimmedName = data.name.trim()

    // Simulate 800ms network round-trip delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    const existingUser = registeredUsers.find(
      (u) => u.email.toLowerCase() === normalizedEmail,
    )

    if (existingUser) {
      throw new Error('An account with this email address already exists.')
    }

    const randomId = Math.floor(1000 + Math.random() * 9000)
    const newUser: User & { passwords: string[] } = {
      id: `usr_${data.role}_${Date.now()}`,
      email: normalizedEmail,
      passwords: [data.password],
      name: trimmedName,
      role: data.role,
      studentId: data.role === 'student' ? `STU-2026-${randomId}` : undefined,
      department: data.role === 'student' ? 'Computer Science & Engineering' : 'Kernel Administration',
      title: data.role === 'admin' ? 'System Operator' : undefined,
      avatar:
        data.role === 'student'
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
          : undefined,
      provider: 'email',
    }

    registeredUsers.push(newUser)

    const { passwords: _passwords, ...userProfile } = newUser
    return userProfile
  },

  /**
   * Authenticates with a third-party social provider (Google, Apple, Twitter/X).
   */
  async loginWithSocial(provider: SocialProvider, role: UserRole): Promise<User> {
    // Simulate 700ms OAuth handshake latency
    await new Promise((resolve) => setTimeout(resolve, 700))

    const providerNames = {
      google: {
        name: role === 'student' ? 'Alex Vance (Google)' : 'Dr. Sarah Connor (Google)',
        email: role === 'student' ? 'alex.vance@gmail.com' : 'sarah.connor@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
      },
      apple: {
        name: role === 'student' ? 'Alex Vance (Apple ID)' : 'Sarah Connor (Apple ID)',
        email: role === 'student' ? 'alex.vance@privaterelay.appleid.com' : 'sarah.connor@privaterelay.appleid.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      },
      twitter: {
        name: role === 'student' ? 'Alex Vance (@alex_vance)' : 'Sarah Connor (@sarah_admin)',
        email: role === 'student' ? 'alex.vance@x.com' : 'sarah.connor@x.com',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=256&q=80',
      },
    }

    const info = providerNames[provider]
    const randomId = Math.floor(1000 + Math.random() * 9000)

    const socialUser: User = {
      id: `usr_${provider}_${Date.now()}`,
      email: info.email,
      name: info.name,
      role,
      studentId: role === 'student' ? `STU-2026-${randomId}` : undefined,
      department: role === 'student' ? 'Computer Science & Engineering' : 'Kernel Infrastructure',
      title: role === 'admin' ? 'Authorized Console Operator' : undefined,
      avatar: info.avatar,
      provider,
    }

    return socialUser
  },

  /**
   * Logs out the user with simulated minimal delay.
   */
  async logout(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 150))
  },

  /**
   * Returns list of demo accounts for guidance/debugging.
   */
  getDemoAccounts(): { email: string; role: string; hint: string }[] {
    return [
      { email: 'alex@university.edu', role: 'student', hint: 'password123 or student123' },
      { email: 'admin@hermes.org', role: 'admin', hint: 'password123 or admin123' },
    ]
  },
}

export default authService
