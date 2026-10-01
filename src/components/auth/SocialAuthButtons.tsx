import React from 'react'
import { SocialProvider } from '../../types/auth'
import { Loader2 } from 'lucide-react'

export interface SocialAuthButtonsProps {
  role: 'student' | 'admin'
  onSelectProvider: (provider: SocialProvider) => void
  disabled?: boolean
  loadingProvider?: SocialProvider | null
}

export const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({
  role,
  onSelectProvider,
  disabled = false,
  loadingProvider = null,
}) => {
  const isStudent = role === 'student'

  const providers: {
    id: SocialProvider
    name: string
    shortName: string
    icon: React.ReactNode
    color: string
    borderHover: string
  }[] = [
    {
      id: 'google',
      name: 'Google',
      shortName: 'Google',
      borderHover: 'hover:border-white/30',
      color: '#ffffff',
      icon: (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>
      ),
    },
    {
      id: 'apple',
      name: 'Apple ID',
      shortName: 'Apple',
      borderHover: 'hover:border-white/30',
      color: '#ffffff',
      icon: (
        <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.76 1.04-1.82.93-2.88-.9.04-1.99.6-2.63 1.36-.58.67-.99 1.74-.88 2.78 1 .08 2.02-.51 2.58-1.26z" />
        </svg>
      ),
    },
    {
      id: 'twitter',
      name: 'X (Twitter)',
      shortName: 'X / Twitter',
      borderHover: 'hover:border-white/30',
      color: '#ffffff',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="w-full space-y-3">
      {/* Decorative divider */}
      <div className="relative flex items-center justify-center my-4">
        <div className="w-full border-t border-white/10" />
        <span className="absolute px-3 text-[11px] font-medium text-[var(--muted)] bg-[var(--card-bg)] transition-colors duration-[600ms]">
          Or continue with
        </span>
      </div>

      {/* Social Provider Buttons */}
      <div className="grid grid-cols-3 gap-2.5">
        {providers.map((p) => {
          const isLoading = loadingProvider === p.id
          return (
            <button
              key={p.id}
              type="button"
              id={`social-btn-${p.id}`}
              onClick={() => onSelectProvider(p.id)}
              disabled={disabled || loadingProvider !== null}
              title={`Sign in with ${p.name}`}
              aria-label={`Sign in with ${p.name}`}
              className={`relative flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-medium text-[var(--text)] bg-white/[0.04] hover:bg-white/[0.09] active:bg-white/[0.12] border border-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[#04060d]`}
              style={{
                borderRadius: isStudent ? '999px' : '6px',
                transition:
                  'border-radius 600ms cubic-bezier(0.4, 0, 0.2, 1), background-color 200ms ease, border-color 200ms ease',
              }}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-[var(--accent)]" />
              ) : (
                <>
                  {p.icon}
                  <span className="hidden sm:inline font-medium text-[11.5px] truncate">
                    {p.shortName}
                  </span>
                </>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default SocialAuthButtons
