import React from 'react'
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'
import { useToast, ToastType } from '../../context/ToastContext'

const TOAST_ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
  error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
  info: <Info className="w-4 h-4 text-[var(--accent)] shrink-0" />,
}

const TOAST_STYLES: Record<ToastType, string> = {
  success: 'border-emerald-500/30 shadow-[0_8px_24px_rgba(16,185,129,0.2)]',
  error: 'border-rose-500/30 shadow-[0_8px_24px_rgba(244,63,94,0.2)]',
  warning: 'border-amber-500/30 shadow-[0_8px_24px_rgba(245,158,11,0.2)]',
  info: 'border-[var(--accent)]/30 shadow-[0_8px_24px_rgba(143,180,255,0.2)]',
}

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-[#060a14]/95 backdrop-blur-xl border text-xs text-[var(--text)] transition-all animate-in fade-in slide-in-from-bottom-2 ${
            TOAST_STYLES[toast.type]
          }`}
        >
          <div className="flex items-center gap-2.5">
            {TOAST_ICONS[toast.type]}
            <span className="leading-snug">{toast.message}</span>
          </div>

          <button
            type="button"
            onClick={() => removeToast(toast.id)}
            aria-label="Dismiss notification"
            className="p-1 rounded-full text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}

export default ToastContainer
