/**
 * Utility functions for formatting relative timestamps and completion dates.
 */

export function formatRelativeTime(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return 'Recently'

  if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim()
    // If it's already a relative expression like "2 hours ago" or "Yesterday", return as is
    if (
      trimmed.toLowerCase().includes('ago') ||
      trimmed.toLowerCase() === 'yesterday' ||
      trimmed.toLowerCase() === 'just now' ||
      trimmed.toLowerCase() === 'today'
    ) {
      return trimmed
    }
  }

  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  if (isNaN(date.getTime())) {
    return typeof dateInput === 'string' ? dateInput : 'Recently'
  }

  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInSeconds = Math.floor(diffInMs / 1000)

  if (diffInSeconds < 0) {
    return 'Just now'
  }

  if (diffInSeconds < 60) {
    return 'Just now'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes === 1) {
    return '1 minute ago'
  }
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours === 1) {
    return '1 hour ago'
  }
  if (diffInHours < 24) {
    return `${diffInHours} hours ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays === 1) {
    return 'Yesterday'
  }
  if (diffInDays < 7) {
    return `${diffInDays} days ago`
  }

  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks === 1) {
    return '1 week ago'
  }
  if (diffInWeeks < 4) {
    return `${diffInWeeks} weeks ago`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths === 1) {
    return '1 month ago'
  }
  if (diffInMonths < 12) {
    return `${diffInMonths} months ago`
  }

  const diffInYears = Math.floor(diffInDays / 365)
  return diffInYears === 1 ? '1 year ago' : `${diffInYears} years ago`
}

export function formatCompletionDate(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return 'Completed'

  if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim()
    // If it's already a formatted date like "Jan 15, 2026", return it
    if (/^[A-Za-z]{3}\s+\d{1,2},\s+\d{4}$/.test(trimmed)) {
      return trimmed
    }
  }

  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  if (isNaN(date.getTime())) {
    return typeof dateInput === 'string' ? dateInput : 'Completed'
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
