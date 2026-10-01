import React from 'react'

interface HighlightTextProps {
  text: string
  query?: string
  className?: string
  highlightClassName?: string
}

/**
 * Renders text with matching substrings highlighted safely.
 * Matches case-insensitively and escapes special regex characters.
 */
export const HighlightText: React.FC<HighlightTextProps> = ({
  text,
  query = '',
  className = '',
  highlightClassName = 'bg-[var(--accent)]/30 text-[var(--accent)] font-semibold rounded-sm px-0.5 shadow-[0_0_8px_rgba(143,180,255,0.25)]',
}) => {
  const trimmed = query.trim()
  if (!trimmed || !text) {
    return <span className={className}>{text}</span>
  }

  // Escape special regex characters
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escaped})`, 'gi')
  const parts = text.split(regex)

  return (
    <span className={className}>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark
            key={index}
            className={`${highlightClassName} inline`}
            data-testid="highlighted-text"
          >
            {part}
          </mark>
        ) : (
          <React.Fragment key={index}>{part}</React.Fragment>
        )
      )}
    </span>
  )
}

export default HighlightText
