import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  PlayCircle,
  User as UserIcon,
  LogOut,
  GraduationCap,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { SparseStarfield } from '../scene/SparseStarfield'

export type NavTab = 'dashboard' | 'courses' | 'lessons' | 'profile'

interface DashboardLayoutProps {
  children: React.ReactNode
  activeTab?: NavTab
  onTabChange?: (tab: NavTab) => void
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  activeTab = 'dashboard',
  onTabChange,
}) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Derive active tab automatically from route or prop
  const currentTab: NavTab = location.pathname.startsWith('/student/courses')
    ? 'courses'
    : location.pathname.startsWith('/student/dashboard')
    ? 'dashboard'
    : activeTab

  const handleSignOut = () => {
    logout()
    navigate('/student', { replace: true })
  }

  const handleTabClick = (tab: NavTab) => {
    if (onTabChange) {
      onTabChange(tab)
    }
    if (tab === 'courses') {
      navigate('/student/courses')
    } else if (tab === 'dashboard') {
      navigate('/student/dashboard')
    }
  }

  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'courses' as NavTab, label: 'Courses', icon: BookOpen },
    { id: 'lessons' as NavTab, label: 'Lessons', icon: PlayCircle },
    { id: 'profile' as NavTab, label: 'Profile', icon: UserIcon },
  ]

  return (
    <div
      data-mode="student"
      className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-geist relative flex flex-col md:flex-row antialiased selection:bg-[var(--accent)]/30"
    >
      {/* Background Starfield (~150 slow particles: 200 desktop, 80 mobile) */}
      <SparseStarfield />

      {/* Desktop Sidebar (hidden under 768px) */}
      <aside
        aria-label="Desktop Navigation Sidebar"
        className="hidden md:flex flex-col w-64 lg:w-72 shrink-0 h-screen sticky top-0 z-40 bg-[#04060d]/85 backdrop-blur-2xl border-r border-white/10 p-6 justify-between"
      >
        <div className="space-y-8">
          {/* Logo & Portal Branding */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#8fb4ff]/25 to-blue-600/10 border border-[#8fb4ff]/30 flex items-center justify-center text-[var(--accent)] shadow-[0_0_15px_rgba(143,180,255,0.2)]">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold tracking-tight text-base text-[var(--text)]">
                  Hermes
                </span>
                <span className="text-[10px] font-mono uppercase bg-[var(--accent)]/15 text-[var(--accent)] px-1.5 py-0.5 rounded-full border border-[var(--accent)]/20">
                  Student
                </span>
              </div>
              <p className="text-xs text-[var(--muted)]">Academic Workspace</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = currentTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full min-h-[44px] flex items-center gap-3.5 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[#04060d] focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04060d] focus:outline-none focus-visible:outline-none ${
                    isActive
                      ? 'bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30 shadow-[0_0_20px_rgba(143,180,255,0.15)] font-semibold'
                      : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[var(--accent)]' : ''}`} />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* User Card & Sign Out */}
        <div className="pt-6 border-t border-white/10 space-y-3">
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#8fb4ff]/20 to-[#60a5fa]/30 border border-white/15 flex items-center justify-center text-xs font-semibold text-[var(--text)] overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.[0] || 'A'
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-[var(--text)] truncate">
                {user?.name || 'Alex Vance'}
              </p>
              <p className="text-[10px] text-[var(--muted)] truncate font-mono">
                {user?.studentId || 'STU-2026-8942'}
              </p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            aria-label="Sign out of student portal"
            className="w-full min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 transition-all duration-200 cursor-pointer hover:shadow-[0_0_15px_rgba(239,68,68,0.15)] focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-[#04060d] focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#04060d] focus:outline-none focus-visible:outline-none"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header (< 768px) */}
      <header
        aria-label="Mobile Navigation Bar"
        className="md:hidden sticky top-0 z-40 bg-[#04060d]/90 backdrop-blur-xl border-b border-white/10 px-4 py-3.5 flex items-center justify-between"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[var(--accent)]/15 border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)]">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm tracking-tight">Hermes</span>
              <span className="text-[9px] font-mono uppercase bg-[var(--accent)]/15 text-[var(--accent)] px-1.5 py-0.2 rounded-full border border-[var(--accent)]/20">
                Student
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-xs font-medium overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user?.name?.[0] || 'A'
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 relative z-10 px-3.5 py-6 sm:px-6 md:px-10 lg:px-12 md:py-10 pb-28 md:pb-12 max-w-7xl mx-auto w-full overflow-x-hidden">
        {children}
      </main>

      {/* Mobile Bottom Tab Bar (< 768px) */}
      <nav
        aria-label="Mobile Bottom Navigation Bar"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#060a14]/95 backdrop-blur-2xl border-t border-white/10 px-2 py-1.5 flex items-center justify-around shadow-[0_-10px_25px_rgba(0,0,0,0.5)]"
      >
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`min-h-[48px] min-w-[48px] flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-2xl transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#060a14] focus-visible:outline-none ${
                isActive
                  ? 'text-[var(--accent)]'
                  : 'text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              <div
                className={`p-1.5 rounded-full transition-all duration-200 ${
                  isActive
                    ? 'bg-[var(--accent)]/15 border border-[var(--accent)]/30 shadow-[0_0_12px_rgba(143,180,255,0.3)]'
                    : 'bg-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className={`text-[10px] font-medium leading-none ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </button>
          )
        })}

        {/* Mobile Sign out tab */}
        <button
          onClick={handleSignOut}
          aria-label="Sign out"
          className="min-h-[48px] min-w-[48px] flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-2xl text-red-400 hover:text-red-300 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#060a14] focus-visible:outline-none"
        >
          <div className="p-1.5 rounded-full bg-red-500/10 border border-red-500/20">
            <LogOut className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-medium leading-none">Sign out</span>
        </button>
      </nav>
    </div>
  )
}

export default DashboardLayout
