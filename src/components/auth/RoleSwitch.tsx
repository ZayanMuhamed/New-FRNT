import React, { useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { GraduationCap, ShieldCheck } from 'lucide-react'

export interface RoleSwitchProps {
  role: 'student' | 'admin'
  onRoleChange: (newRole: 'student' | 'admin') => void
  disabled?: boolean
  className?: string
}

export const RoleSwitch: React.FC<RoleSwitchProps> = ({
  role,
  onRoleChange,
  disabled = false,
  className = '',
}) => {
  const isStudent = role === 'student'
  const shouldReduceMotion = useReducedMotion()
  const studentBtnRef = useRef<HTMLButtonElement | null>(null)
  const adminBtnRef = useRef<HTMLButtonElement | null>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return

    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault()
      const nextRole = isStudent ? 'admin' : 'student'
      onRoleChange(nextRole)
      if (nextRole === 'student') {
        studentBtnRef.current?.focus()
      } else {
        adminBtnRef.current?.focus()
      }
    }
  }

  return (
    <div
      role="tablist"
      aria-label="Select account role"
      onKeyDown={handleKeyDown}
      className={`relative flex items-center p-1 bg-black/40 border border-white/10 backdrop-blur-md transition-all duration-[600ms] ${className}`}
      style={{
        borderRadius: isStudent ? '999px' : '8px',
        borderColor: isStudent ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 176, 64, 0.25)',
      }}
    >
      {/* Student Tab */}
      <button
        ref={studentBtnRef}
        id="role-tab-student"
        role="tab"
        type="button"
        aria-selected={isStudent}
        aria-controls="auth-login-card"
        tabIndex={isStudent ? 0 : -1}
        disabled={disabled}
        onClick={() => onRoleChange('student')}
        className={`relative flex-1 py-1.5 px-3 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors duration-200 z-10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
          isStudent ? 'text-white' : 'text-[var(--muted)] hover:text-white'
        }`}
        style={{
          borderRadius: isStudent ? '999px' : '6px',
        }}
      >
        {isStudent && (
          <motion.div
            layoutId="role-pill-indicator"
            className="absolute inset-0 bg-white/10 border border-white/20 shadow-sm"
            style={{ borderRadius: '999px' }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { type: 'spring', stiffness: 450, damping: 35 }
            }
          />
        )}
        <GraduationCap
          className={`w-3.5 h-3.5 relative z-10 transition-colors duration-[600ms] ${
            isStudent ? 'text-[var(--accent)]' : 'text-[var(--muted)]'
          }`}
        />
        <span className="relative z-10 font-medium">Student</span>
      </button>

      {/* Admin Tab */}
      <button
        ref={adminBtnRef}
        id="role-tab-admin"
        role="tab"
        type="button"
        aria-selected={!isStudent}
        aria-controls="auth-login-card"
        tabIndex={!isStudent ? 0 : -1}
        disabled={disabled}
        onClick={() => onRoleChange('admin')}
        className={`relative flex-1 py-1.5 px-3 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors duration-200 z-10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
          !isStudent ? 'text-white' : 'text-[var(--muted)] hover:text-white'
        }`}
        style={{
          borderRadius: !isStudent ? '6px' : '999px',
        }}
      >
        {!isStudent && (
          <motion.div
            layoutId="role-pill-indicator"
            className="absolute inset-0 bg-[var(--accent)]/15 border border-[var(--accent)]/35 shadow-sm"
            style={{ borderRadius: '6px' }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { type: 'spring', stiffness: 450, damping: 35 }
            }
          />
        )}
        <ShieldCheck
          className={`w-3.5 h-3.5 relative z-10 transition-colors duration-[600ms] ${
            !isStudent ? 'text-[var(--accent)]' : 'text-[var(--muted)]'
          }`}
        />
        <span className="relative z-10 font-medium">Admin</span>
      </button>
    </div>
  )
}

export default RoleSwitch
