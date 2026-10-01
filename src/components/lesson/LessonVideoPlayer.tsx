import React, { useEffect, useRef, useCallback } from 'react'

export interface LessonVideoPlayerProps {
  lessonId: string
  courseId?: string
  title: string
  videoUrl?: string
  posterUrl?: string
  initialPosition?: number
  onPositionChange?: (seconds: number) => void
  onReachNinetyPercent?: () => void
}

export const LessonVideoPlayer: React.FC<LessonVideoPlayerProps> = ({
  lessonId,
  title,
  videoUrl = '/videos/lesson-preview.mp4',
  posterUrl = '/videos/poster.jpg',
  initialPosition = 0,
  onPositionChange,
  onReachNinetyPercent,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const hasTriggered90Ref = useRef(false)
  const lastSavedSecondRef = useRef(0)

  // Reset 90% threshold trigger on lesson change
  useEffect(() => {
    hasTriggered90Ref.current = false
  }, [lessonId])

  // Restore playback position on mount & lesson switch
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      if (initialPosition > 0 && initialPosition < (video.duration || 1000)) {
        try {
          video.currentTime = initialPosition
        } catch (e) {
          console.warn('Could not seek to initial position:', e)
        }
      }
    }

    if (video.readyState >= 1) {
      handleLoadedMetadata()
    } else {
      video.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true })
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
    }
  }, [lessonId, initialPosition])

  // Track playback time and 90% threshold
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    const currentSec = Math.floor(video.currentTime)
    if (Math.abs(currentSec - lastSavedSecondRef.current) >= 1) {
      lastSavedSecondRef.current = currentSec
      onPositionChange?.(video.currentTime)
    }

    if (
      !hasTriggered90Ref.current &&
      video.duration > 0 &&
      video.currentTime / video.duration >= 0.9
    ) {
      hasTriggered90Ref.current = true
      onReachNinetyPercent?.()
    }
  }, [onPositionChange, onReachNinetyPercent])

  // Save position on pause or unload
  const handlePause = useCallback(() => {
    if (videoRef.current) {
      onPositionChange?.(videoRef.current.currentTime)
    }
  }, [onPositionChange])

  // Dedicated keyboard handler for video container: Left/Right arrows seek ONLY when video or container is focused
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const video = videoRef.current
    if (!video) return

    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      e.stopPropagation()
      video.currentTime = Math.max(0, video.currentTime - 5)
      onPositionChange?.(video.currentTime)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      e.stopPropagation()
      video.currentTime = Math.min(video.duration || 1000, video.currentTime + 5)
      onPositionChange?.(video.currentTime)
    } else if (e.key === ' ' && e.target === containerRef.current) {
      e.preventDefault()
      e.stopPropagation()
      if (video.paused) {
        video.play()
      } else {
        video.pause()
      }
    }
  }, [onPositionChange])

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="region"
      aria-label={`Video player for ${title}. Use left and right arrow keys to seek by 5 seconds.`}
      onKeyDown={handleKeyDown}
      className="group relative w-full aspect-video rounded-2xl md:rounded-3xl overflow-hidden bg-[#04060d] border border-white/[0.16] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.85),0_0_30px_rgba(143,180,255,0.08)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04060d]"
    >
      <video
        ref={videoRef}
        key={lessonId}
        src={videoUrl}
        poster={posterUrl}
        controls
        playsInline
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onPause={handlePause}
        className="w-full h-full object-cover rounded-2xl md:rounded-3xl"
        data-testid="lesson-video-element"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  )
}
