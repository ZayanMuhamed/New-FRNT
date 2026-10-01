import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Server, Activity, ShieldCheck, Database, LogOut, Shield } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = () => {
    logout()
    navigate('/admin', { replace: true })
  }

  return (
    <div
      data-mode="admin"
      className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-space p-6 md:p-12 relative flex flex-col justify-between"
    >
      <div className="admin-scanline" />

      <div className="max-w-5xl mx-auto w-full relative z-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[var(--accent)]/15 border border-[var(--border)] flex items-center justify-center text-[var(--accent)]">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Admin Console</h1>
              <p className="text-xs text-[var(--muted)]">Cluster: us-east-alpha &bull; Node Status: Online</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Authenticated admin badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[var(--accent)]/10 border border-[var(--border)] text-xs font-mono">
              <Shield className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span className="font-medium text-[var(--text)]">{user?.name || 'Dr. Sarah Connor'}</span>
              <span className="text-[var(--accent)]">[{user?.role?.toUpperCase() || 'ADMIN'}]</span>
            </div>

            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium font-mono bg-red-500/10 hover:bg-red-500/20 text-red-300 rounded border border-red-500/30 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Terminate session</span>
            </button>
          </div>
        </header>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="frosted-glass p-6 rounded border border-[var(--border)]">
            <div className="flex items-center justify-between text-[var(--accent)] mb-4">
              <Activity className="w-5 h-5" />
              <span className="text-[11px] font-mono uppercase bg-[var(--accent)]/10 text-[var(--accent)] px-2 py-0.5 rounded border border-[var(--border)]">Normal</span>
            </div>
            <h2 className="text-sm font-semibold text-[var(--text)]">System Throughput</h2>
            <p className="text-2xl font-bold mt-2 text-[var(--text)] font-mono">14.8k req/s</p>
            <p className="text-xs text-[var(--muted)] mt-1">Latency p99: 14ms</p>
          </div>

          <div className="frosted-glass p-6 rounded border border-[var(--border)]">
            <div className="flex items-center justify-between text-[var(--accent)] mb-4">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-[11px] font-mono uppercase bg-[var(--accent)]/10 text-[var(--accent)] px-2 py-0.5 rounded border border-[var(--border)]">Zero Errors</span>
            </div>
            <h2 className="text-sm font-semibold text-[var(--text)]">Security Firewall</h2>
            <p className="text-2xl font-bold mt-2 text-[var(--text)] font-mono">0 Incidents</p>
            <p className="text-xs text-[var(--muted)] mt-1">Audit log synced 2m ago</p>
          </div>

          <div className="frosted-glass p-6 rounded border border-[var(--border)]">
            <div className="flex items-center justify-between text-[var(--accent)] mb-4">
              <Database className="w-5 h-5" />
              <span className="text-[11px] font-mono uppercase bg-[var(--accent)]/10 text-[var(--accent)] px-2 py-0.5 rounded border border-[var(--border)]">Healthy</span>
            </div>
            <h2 className="text-sm font-semibold text-[var(--text)]">Database Pool</h2>
            <p className="text-2xl font-bold mt-2 text-[var(--text)] font-mono">32 / 64 Conns</p>
            <p className="text-xs text-[var(--muted)] mt-1">Read replicas operating normally</p>
          </div>
        </div>

        {/* Notice banner */}
        <div className="frosted-glass mt-8 p-6 rounded border border-[var(--border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-medium text-[var(--text)]">Placeholder Dashboard</h3>
            <p className="text-xs text-[var(--muted)] mt-1">
              You are signed in to the Administrator Console. This is the placeholder landing view.
            </p>
          </div>
          <Link
            to="/student"
            className="text-xs text-[var(--accent)] hover:underline whitespace-nowrap"
          >
            Check Student Portal &rarr;
          </Link>
        </div>
      </div>

      <div className="text-center text-xs text-[var(--muted)]/50 pt-12 pb-4 font-mono relative z-10">
        <span>Admin Kernel Core v2.4.9 &bull; Operational Session</span>
      </div>
    </div>
  )
}
export default AdminDashboard
