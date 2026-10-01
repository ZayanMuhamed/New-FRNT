import React from 'react'
import { CheckCircle2, Sparkles } from 'lucide-react'

export interface LessonCompletionPromptProps {
  isOpen: boolean
  onComplete: () => void
  onDismiss: () => void
}

export const LessonCompletionPrompt: React.FC<LessonCompletionPromptProps> = ({
  isOpen,
  onComplete,
  onDismiss,
}) => {
  if (!isOpen) return null

  return (
    <div
      role="alert"
      aria-live="polite"
      data-testid="completion-prompt"
      className="p-4 rounded-2xl bg-[#060a14]/95 backdrop-blur-2xl border border-[var(--accent)]/40 shadow-[0_12px_32px_rgba(0,0,0,0.8),0_0_24px_rgba(143,180,255,0.2)] animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-[var(--accent)]/15 border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)] shrink-0 mt-0.5">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-[var(--text)]">
            Lesson almost complete!
          </h4>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            You have watched 90% of this lecture. Would you like to mark it as finished?
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        <button
          type="button"
          onClick={onDismiss}
          data-testid="prompt-dismiss-btn"
          aria-label="Dismiss completion prompt"
          className="min-h-[44px] px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-xs font-medium text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:outline-none"
        >
          Keep watching
        </button>
        <button
          type="button"
          onClick={onComplete}
          data-testid="prompt-mark-complete-btn"
          className="min-h-[44px] px-5 py-2 rounded-full bg-[var(--accent)] hover:bg-[#a5c3ff] text-[#04060d] text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_16px_rgba(143,180,255,0.35)] active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:outline-none"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Mark as complete</span>
        </button>
      </div>
    </div>
  )
}
