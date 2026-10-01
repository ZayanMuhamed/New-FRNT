import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { CanvasState } from '../canvas/BackgroundCanvas'
import { RoleSwitch } from './RoleSwitch'
import { SocialAuthButtons } from './SocialAuthButtons'
import { useAuth } from '../../context/AuthContext'
import { SocialProvider } from '../../types/auth'
import {
  ArrowRight,
  Lock,
  Mail,
  User as UserIcon,
  ShieldAlert,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Shield,
  KeyRound,
  UserPlus,
  LogIn,
} from 'lucide-react'

// Schema for Sign In
const signInSchema = z.object({
  name: z.string().optional(),
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().optional(),
})

// Schema for Sign Up
const signUpSchema = z
  .object({
    name: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z
      .string()
      .min(1, 'Email address is required')
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type AuthFormData = {
  name?: string
  email: string
  password: string
  confirmPassword?: string
}

export interface LoginFormProps {
  role: 'student' | 'admin'
  onRoleChange?: (newRole: 'student' | 'admin') => void
  onCanvasStateChange?: (state: CanvasState) => void
}

export const LoginForm: React.FC<LoginFormProps> = ({
  role,
  onRoleChange,
  onCanvasStateChange,
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, signUp, loginWithSocial, logout, isLoading: isAuthLoading } = useAuth()
  const shouldReduceMotion = useReducedMotion()

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [shake, setShake] = useState(false)
  const [socialLoadingProvider, setSocialLoadingProvider] = useState<SocialProvider | null>(null)

  const isStudent = role === 'student'
  const isSignUp = authMode === 'signup'

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormData>({
    resolver: zodResolver(isSignUp ? signUpSchema : signInSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  // Real-time email watcher to detect typed email starting with "admin"
  const emailValue = watch('email') || ''
  const showAdminSuggestion =
    isStudent && emailValue.trim().toLowerCase().startsWith('admin')

  const triggerErrorShake = (msg: string) => {
    setAuthError(msg)
    onCanvasStateChange?.('error')
    setShake(true)
    setTimeout(() => setShake(false), 450)
    setTimeout(() => {
      onCanvasStateChange?.('idle')
    }, 450)
  }

  const handleInputFocus = () => {
    if (!isSuccess) {
      onCanvasStateChange?.('focus')
    }
  }

  const handleInputBlur = () => {
    if (!isSuccess && !authError) {
      onCanvasStateChange?.('idle')
    }
  }

  const handleToggleMode = (mode: 'signin' | 'signup') => {
    setAuthMode(mode)
    setAuthError(null)
    reset({
      name: '',
      email: watch('email') || '',
      password: '',
      confirmPassword: '',
    })
  }

  const executeSuccessfulRedirect = () => {
    setIsSuccess(true)
    onCanvasStateChange?.('success')

    const stateLocation = (location.state as { from?: { pathname: string } })?.from?.pathname
    const destination =
      stateLocation && stateLocation !== '/' && !stateLocation.includes('/login')
        ? stateLocation
        : isStudent
          ? '/student/dashboard'
          : '/admin/dashboard'

    setTimeout(() => {
      navigate(destination, { replace: true })
    }, 920)
  }

  const onSubmit = async (data: AuthFormData) => {
    setAuthError(null)
    onCanvasStateChange?.('focus')

    try {
      if (isSignUp) {
        // Sign Up Flow
        const newUser = await signUp({
          name: data.name || (isStudent ? 'New Student' : 'New Admin'),
          email: data.email,
          password: data.password,
          role,
        })

        if (newUser.role !== role) {
          logout()
          triggerErrorShake('Account role mismatch. Please switch portal.')
          return
        }

        executeSuccessfulRedirect()
      } else {
        // Sign In Flow
        const authenticatedUser = await login({
          email: data.email,
          password: data.password,
        })

        if (authenticatedUser.role !== role) {
          logout()
          const targetPortal =
            authenticatedUser.role === 'admin' ? 'Admin console' : 'Student portal'
          triggerErrorShake(
            `This account has ${authenticatedUser.role} credentials. Please switch to the ${targetPortal}.`,
          )
          return
        }

        executeSuccessfulRedirect()
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : isSignUp
            ? 'Registration failed. Please verify the entered information.'
            : 'Invalid credentials. Please verify your email and password.'
      triggerErrorShake(message)
    }
  }

  const handleSocialLogin = async (provider: SocialProvider) => {
    setAuthError(null)
    setSocialLoadingProvider(provider)
    onCanvasStateChange?.('focus')

    try {
      await loginWithSocial(provider, role)
      executeSuccessfulRedirect()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : `Failed to authenticate with ${provider}.`
      triggerErrorShake(msg)
    } finally {
      setSocialLoadingProvider(null)
    }
  }

  const onError = () => {
    triggerErrorShake('Please fix the highlighted errors before submitting.')
  }

  const handleFillDemoCredentials = () => {
    setAuthError(null)
    if (isStudent) {
      setValue('email', 'alex@university.edu', { shouldValidate: true })
      setValue('password', 'password123', { shouldValidate: true })
    } else {
      setValue('email', 'admin@hermes.org', { shouldValidate: true })
      setValue('password', 'password123', { shouldValidate: true })
    }
  }

  return (
    <div
      id={`${role}-login-card`}
      className={`frosted-glass w-full max-w-[440px] p-6 sm:p-9 z-10 relative ${
        shake ? 'animate-shake' : ''
      }`}
      style={{
        borderRadius: isStudent ? '28px' : '6px',
        borderColor: 'var(--border)',
        transition:
          'border-radius 600ms cubic-bezier(0.4, 0, 0.2, 1), border-color 600ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 600ms cubic-bezier(0.4, 0, 0.2, 1), background-color 600ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Role Switch Tablist */}
      <RoleSwitch
        role={role}
        onRoleChange={(newRole) => onRoleChange?.(newRole)}
        disabled={isSubmitting || isSuccess || socialLoadingProvider !== null}
        className="mb-5"
      />

      {/* Auth Mode Toggle Tabs (Sign In / Sign Up) */}
      <div
        className="grid grid-cols-2 p-1 mb-5 bg-white/[0.04] border border-white/10"
        style={{
          borderRadius: isStudent ? '999px' : '6px',
          transition: 'border-radius 600ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <button
          type="button"
          id="tab-signin-btn"
          onClick={() => handleToggleMode('signin')}
          disabled={isSubmitting || isSuccess}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-medium cursor-pointer transition-all duration-200 ${
            !isSignUp
              ? 'bg-[var(--accent)] text-[#04060d] shadow-sm font-semibold'
              : 'text-[var(--muted)] hover:text-[var(--text)]'
          }`}
          style={{
            borderRadius: isStudent ? '999px' : '4px',
          }}
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Sign In</span>
        </button>

        <button
          type="button"
          id="tab-signup-btn"
          onClick={() => handleToggleMode('signup')}
          disabled={isSubmitting || isSuccess}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-medium cursor-pointer transition-all duration-200 ${
            isSignUp
              ? 'bg-[var(--accent)] text-[#04060d] shadow-sm font-semibold'
              : 'text-[var(--muted)] hover:text-[var(--text)]'
          }`}
          style={{
            borderRadius: isStudent ? '999px' : '4px',
          }}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Sign Up</span>
        </button>
      </div>

      {/* Header section with animated text */}
      <div className="mb-5 text-left">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${role}-${authMode}`}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-[var(--accent)] transition-colors duration-[600ms]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse transition-colors duration-[600ms]" />
            <span>
              {isStudent
                ? isSignUp
                  ? 'Student registration'
                  : 'Student authentication'
                : isSignUp
                  ? 'Administrator enrollment'
                  : 'Administrator control'}
            </span>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.h1
            key={`${role}-${authMode}-title`}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text)] transition-colors duration-[600ms]"
          >
            {isSignUp
              ? isStudent
                ? 'Create student account'
                : 'Register admin node'
              : isStudent
                ? 'Welcome back'
                : 'System access'}
          </motion.h1>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.p
            key={`${role}-${authMode}-desc`}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="mt-1.5 text-xs sm:text-sm text-[var(--muted)] leading-relaxed transition-colors duration-[600ms]"
          >
            {isSignUp
              ? isStudent
                ? 'Register with your academic email or social identity to access modules.'
                : 'Provision new operator credentials for authorized console management.'
              : isStudent
                ? 'Sign in to access your course materials and academic records.'
                : 'Authenticate credentials to enter the administrative console.'}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Global error banner */}
      {authError && (
        <div
          role="alert"
          className="mb-4 flex items-center gap-2.5 p-3 text-xs leading-normal bg-red-500/10 border border-red-500/30 text-red-200 transition-all duration-[600ms]"
          style={{ borderRadius: isStudent ? '999px' : '6px' }}
        >
          <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 ml-1" />
          <span>{authError}</span>
        </div>
      )}

      {/* Form inputs */}
      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-3.5" noValidate>
        {/* Full Name field (Only in Sign Up mode) */}
        {isSignUp && (
          <div>
            <label
              htmlFor="name-input"
              className="block text-xs font-medium text-[var(--muted)] mb-1 ml-1 transition-colors duration-[600ms]"
            >
              Full name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--muted)] transition-colors duration-[600ms]">
                <UserIcon className="w-4 h-4" />
              </div>
              <input
                id="name-input"
                type="text"
                autoComplete="name"
                placeholder={isStudent ? 'Alex Vance' : 'Dr. Sarah Connor'}
                disabled={isSubmitting || isSuccess}
                {...register('name')}
                onFocus={handleInputFocus}
                onBlur={(e) => {
                  register('name').onBlur(e)
                  handleInputBlur()
                }}
                className={`w-full pl-10 pr-4 py-2.5 text-sm bg-[var(--input-bg)] text-[var(--text)] placeholder-[var(--muted)]/75 border focus:bg-[var(--input-bg-focus)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04060d] transition-all duration-[600ms] ${
                  errors.name
                    ? 'border-red-400/70 focus:border-red-400'
                    : 'border-[var(--border)] focus:border-[var(--border-focus)]'
                }`}
                style={{
                  borderRadius: isStudent ? '999px' : '6px',
                }}
              />
            </div>
            {errors.name && (
              <p className="mt-1 ml-2 text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.name.message}</span>
              </p>
            )}
          </div>
        )}

        {/* Email field */}
        <div>
          <label
            htmlFor="email-input"
            className="block text-xs font-medium text-[var(--muted)] mb-1 ml-1 transition-colors duration-[600ms]"
          >
            {isStudent ? 'Student email' : 'Admin email'}
          </label>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--muted)] transition-colors duration-[600ms]">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="email-input"
              type="email"
              autoComplete="email"
              placeholder={isStudent ? 'alex@university.edu' : 'admin@hermes.org'}
              disabled={isSubmitting || isSuccess}
              {...register('email')}
              onFocus={handleInputFocus}
              onBlur={(e) => {
                register('email').onBlur(e)
                handleInputBlur()
              }}
              className={`w-full pl-10 pr-4 py-2.5 text-sm bg-[var(--input-bg)] text-[var(--text)] placeholder-[var(--muted)]/75 border focus:bg-[var(--input-bg-focus)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04060d] transition-all duration-[600ms] ${
                errors.email
                  ? 'border-red-400/70 focus:border-red-400'
                  : 'border-[var(--border)] focus:border-[var(--border-focus)]'
              }`}
              style={{
                borderRadius: isStudent ? '999px' : '6px',
              }}
            />
          </div>

          {/* Accessible inline suggestion prompt when student types an admin email */}
          <AnimatePresence>
            {showAdminSuggestion && (
              <motion.div
                id="admin-switch-prompt"
                role="status"
                aria-live="polite"
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0, y: -4 }}
                animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, height: 'auto', y: 0 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0, y: -4 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="overflow-hidden mt-2"
              >
                <div
                  className="flex items-center justify-between gap-2 p-2.5 bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-xs text-[var(--text)] backdrop-blur-sm transition-all duration-[600ms]"
                  style={{ borderRadius: isStudent ? '12px' : '6px' }}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Shield className="w-3.5 h-3.5 text-[var(--accent)] shrink-0 transition-colors duration-[600ms]" />
                    <span className="truncate">Administrative address detected</span>
                  </div>
                  <button
                    type="button"
                    id="admin-suggestion-switch-btn"
                    onClick={() => onRoleChange?.('admin')}
                    className="shrink-0 px-2.5 py-1 rounded text-[11px] font-medium bg-[var(--accent)] text-[#0b0704] hover:opacity-90 transition-opacity cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1 focus-visible:ring-offset-[#04060d]"
                    aria-label="Switch to Admin console"
                  >
                    Switch to Admin &rarr;
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {errors.email && (
            <p className="mt-1 ml-2 text-xs text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.email.message}</span>
            </p>
          )}
        </div>

        {/* Password field with show/hide */}
        <div>
          <div className="flex items-center justify-between mb-1 ml-1 mr-1">
            <label
              htmlFor="password-input"
              className="block text-xs font-medium text-[var(--muted)] transition-colors duration-[600ms]"
            >
              Password
            </label>
            {!isSignUp && (
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault()
                  alert('Password reset instructions have been dispatched to registered recovery email.')
                }}
                className="text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[#04060d] rounded-sm"
              >
                Forgot password?
              </a>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--muted)] transition-colors duration-[600ms]">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="password-input"
              type={showPassword ? 'text' : 'password'}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              placeholder="••••••••"
              disabled={isSubmitting || isSuccess}
              {...register('password')}
              onFocus={handleInputFocus}
              onBlur={(e) => {
                register('password').onBlur(e)
                handleInputBlur()
              }}
              className={`w-full pl-10 pr-11 py-2.5 text-sm bg-[var(--input-bg)] text-[var(--text)] placeholder-[var(--muted)]/75 border focus:bg-[var(--input-bg-focus)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04060d] transition-all duration-[600ms] ${
                errors.password
                  ? 'border-red-400/70 focus:border-red-400'
                  : 'border-[var(--border)] focus:border-[var(--border-focus)]'
              }`}
              style={{
                borderRadius: isStudent ? '999px' : '6px',
              }}
            />
            <button
              id="toggle-password-btn"
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              disabled={isSubmitting || isSuccess}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--muted)] hover:text-[var(--text)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[#04060d] rounded-md cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 ml-2 text-xs text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.password.message}</span>
            </p>
          )}
        </div>

        {/* Confirm Password field (Only in Sign Up mode) */}
        {isSignUp && (
          <div>
            <label
              htmlFor="confirm-password-input"
              className="block text-xs font-medium text-[var(--muted)] mb-1 ml-1 transition-colors duration-[600ms]"
            >
              Confirm password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--muted)] transition-colors duration-[600ms]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="confirm-password-input"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                disabled={isSubmitting || isSuccess}
                {...register('confirmPassword')}
                onFocus={handleInputFocus}
                onBlur={(e) => {
                  register('confirmPassword').onBlur(e)
                  handleInputBlur()
                }}
                className={`w-full pl-10 pr-11 py-2.5 text-sm bg-[var(--input-bg)] text-[var(--text)] placeholder-[var(--muted)]/75 border focus:bg-[var(--input-bg-focus)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04060d] transition-all duration-[600ms] ${
                  errors.confirmPassword
                    ? 'border-red-400/70 focus:border-red-400'
                    : 'border-[var(--border)] focus:border-[var(--border-focus)]'
                }`}
                style={{
                  borderRadius: isStudent ? '999px' : '6px',
                }}
              />
              <button
                id="toggle-confirm-password-btn"
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                disabled={isSubmitting || isSuccess}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--muted)] hover:text-[var(--text)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[#04060d] rounded-md cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 ml-2 text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.confirmPassword.message}</span>
              </p>
            )}
          </div>
        )}

        {/* Demo quick fill helper (Only in Sign In mode) */}
        {!isSignUp && (
          <div className="flex items-center justify-between text-[11px] text-[var(--muted)] px-1 pt-0.5">
            <span>Demo: {isStudent ? 'alex@university.edu' : 'admin@hermes.org'}</span>
            <button
              type="button"
              id="demo-fill-btn"
              onClick={handleFillDemoCredentials}
              disabled={isSubmitting || isAuthLoading || isSuccess}
              className="inline-flex items-center gap-1 text-[var(--accent)] hover:underline cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[#04060d] rounded-sm"
              title="Auto-fill demo credentials"
            >
              <KeyRound className="w-3 h-3" />
              <span>Use demo</span>
            </button>
          </div>
        )}

        {/* Submit button with animated label and tweened styling */}
        <div className="pt-1.5">
          <button
            id="login-submit-btn"
            type="submit"
            disabled={isSubmitting || isAuthLoading || isSuccess || socialLoadingProvider !== null}
            className="w-full py-3 px-5 text-sm font-medium flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 group shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#04060d]"
            style={{
              backgroundColor: 'var(--accent)',
              color: isStudent ? '#04060d' : '#0b0704',
              borderRadius: isStudent ? '999px' : '6px',
              boxShadow: '0 4px 20px -2px var(--glow-color)',
              transition:
                'background-color 600ms cubic-bezier(0.4, 0, 0.2, 1), color 600ms cubic-bezier(0.4, 0, 0.2, 1), border-radius 600ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 600ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {isSuccess ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 animate-bounce" />
                <span>Redirecting to {isStudent ? 'portal' : 'console'}...</span>
              </span>
            ) : isSubmitting || isAuthLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isSignUp ? 'Creating account...' : 'Verifying credentials...'}</span>
              </span>
            ) : (
              <AnimatePresence mode="wait">
                <motion.span
                  key={`${role}-${authMode}-btn`}
                  initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                  animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
                  exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2"
                >
                  <span>
                    {isSignUp
                      ? isStudent
                        ? 'Create student account'
                        : 'Register admin node'
                      : isStudent
                        ? 'Sign in to portal'
                        : 'Access admin console'}
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.span>
              </AnimatePresence>
            )}
          </button>
        </div>
      </form>

      {/* Social Logins: Google, Apple ID, Twitter / X */}
      <SocialAuthButtons
        role={role}
        onSelectProvider={handleSocialLogin}
        disabled={isSubmitting || isSuccess}
        loadingProvider={socialLoadingProvider}
      />

      {/* Mode toggle link */}
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => handleToggleMode(isSignUp ? 'signin' : 'signup')}
          disabled={isSubmitting || isSuccess}
          className="text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors cursor-pointer"
        >
          {isSignUp ? (
            <span>
              Already have an account? <strong className="text-[var(--text)] underline">Sign in</strong>
            </span>
          ) : (
            <span>
              Don&apos;t have an account? <strong className="text-[var(--text)] underline">Sign up</strong>
            </span>
          )}
        </button>
      </div>

      {/* Role switch toggle footer */}
      <div className="mt-5 pt-4 border-t border-white/5 text-center">
        <p className="text-xs text-[var(--muted)] transition-colors duration-[600ms]">
          {isStudent ? 'Looking for administrative console?' : 'Need to sign in as a student?'}
        </p>

        <button
          id="switch-role-link"
          type="button"
          onClick={() => onRoleChange?.(isStudent ? 'admin' : 'student')}
          className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text)] hover:text-[var(--accent)] transition-colors duration-200 py-1.5 px-3 rounded-full hover:bg-white/5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04060d]"
        >
          <span>Switch to {isStudent ? 'Admin console' : 'Student portal'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

export default LoginForm
