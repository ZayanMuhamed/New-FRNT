import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { GalaxyCanvas, GalaxyState } from '../../components/scene/GalaxyCanvas'
import { OrbitRings, OrbitState } from '../../components/scene/OrbitRings'
import { LoginForm } from '../../components/auth/LoginForm'
import { AnimatePresence, motion } from 'framer-motion'

export interface AuthPageProps {
  initialRole?: 'student' | 'admin'
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialRole }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const shouldReduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const initial = initialRole || (location.pathname.includes('admin') ? 'admin' : 'student')
  const [role, setRole] = useState<'student' | 'admin'>(initial)
  const [canvasState, setCanvasState] = useState<GalaxyState | OrbitState>('idle')

  const isStudent = role === 'student'

  // Sync state if user clicks browser back/forward buttons
  useEffect(() => {
    const routeRole = location.pathname.includes('admin') ? 'admin' : 'student'
    if (routeRole !== role) {
      setRole(routeRole)
    }
  }, [location.pathname])

  const handleRoleChange = (newRole: 'student' | 'admin') => {
    if (newRole === role) return
    setRole(newRole)
    // Seamlessly update URL without remounting page
    navigate(`/${newRole}`, { replace: true })
  }

  const handleSuccessDone = () => {
    if (isStudent) {
      navigate('/student/dashboard')
    } else {
      navigate('/admin/dashboard')
    }
  }

  return (
    <div
      data-mode={role}
      className="relative min-h-screen w-full flex flex-col items-center justify-center bg-[var(--bg)] text-[var(--text)] overflow-x-hidden overflow-y-auto select-none p-4 py-8 sm:py-4 theme-transition-600"
      style={{
        fontFamily: isStudent ? "'Geist', sans-serif" : "'Space Grotesk', sans-serif",
      }}
    >
      {/* BACKGROUND CANVAS LAYER: 600ms Cross-Fade */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Galaxy Canvas (Student) */}
        <div
          className="absolute inset-0"
          style={{
            opacity: isStudent ? 1 : 0,
            transition: 'opacity 600ms cubic-bezier(0.4, 0, 0.2, 1)',
            pointerEvents: isStudent ? 'auto' : 'none',
          }}
          aria-hidden={!isStudent}
        >
          <GalaxyCanvas
            state={canvasState as GalaxyState}
            onSuccessDone={handleSuccessDone}
          />
        </div>

        {/* Orbit Rings Canvas (Admin) */}
        <div
          className="absolute inset-0"
          style={{
            opacity: !isStudent ? 1 : 0,
            transition: 'opacity 600ms cubic-bezier(0.4, 0, 0.2, 1)',
            pointerEvents: !isStudent ? 'auto' : 'none',
          }}
          aria-hidden={isStudent}
        >
          <OrbitRings
            state={canvasState as OrbitState}
            onSuccessDone={handleSuccessDone}
          />
        </div>

        {/* Admin Horizontal Scan Line */}
        <div
          className="admin-scanline"
          style={{
            opacity: !isStudent ? 1 : 0,
            transition: 'opacity 600ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          aria-hidden="true"
        />
      </div>

      {/* HUGE BACKGROUND WORDMARKS: 600ms Cross-Fade (hidden under 900px) */}
      <div className="hidden min-[900px]:flex pointer-events-none fixed inset-0 items-center justify-between px-8 xl:px-16 z-0 select-none">
        {/* Student Wordmark */}
        <div
          className="absolute inset-0 flex items-center justify-between px-8 xl:px-16"
          style={{
            opacity: isStudent ? 1 : 0,
            transition: 'opacity 600ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          aria-hidden={!isStudent}
        >
          <span className="text-[7vw] font-bold tracking-tighter text-white/[0.045] uppercase font-geist leading-none">
            Student
          </span>
          <span className="text-[7vw] font-bold tracking-tighter text-white/[0.045] uppercase font-geist leading-none">
            Portal
          </span>
        </div>

        {/* Admin Wordmark */}
        <div
          className="absolute inset-0 flex items-center justify-between px-8 xl:px-16"
          style={{
            opacity: !isStudent ? 1 : 0,
            transition: 'opacity 600ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          aria-hidden={isStudent}
        >
          <span className="text-[7.5vw] font-bold tracking-tighter text-[#ffb040]/[0.05] uppercase font-space leading-none">
            Admin
          </span>
          <span className="text-[7.5vw] font-bold tracking-tighter text-[#ffb040]/[0.05] uppercase font-space leading-none">
            Console
          </span>
        </div>
      </div>

      {/* Centered Frosted Form */}
      <div className="z-10 flex flex-col items-center justify-center w-full">
        <LoginForm
          role={role}
          onRoleChange={handleRoleChange}
          onCanvasStateChange={setCanvasState}
        />
      </div>

      {/* Footer System Caption with animated transition */}
      <div className="mt-6 sm:mt-0 sm:absolute sm:bottom-4 text-center z-10 text-xs font-medium text-[var(--muted)] transition-colors duration-[600ms] px-4 max-w-md">
        <AnimatePresence mode="wait">
          <motion.span
            key={role}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className={isStudent ? 'font-geist' : 'font-mono'}
          >
            {isStudent
              ? 'Academic Authentication Node • Secured with end-to-end encryption'
              : 'Kernel Authorization • Security Protocol 802.1X Active'}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default AuthPage
