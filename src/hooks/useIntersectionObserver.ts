import { useEffect, useRef, useState, RefObject } from 'react'

export interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  triggerOnce?: boolean
}

/**
 * Custom hook to detect when an element intersects the viewport.
 * Disconnects automatically after first intersection if triggerOnce is true (default).
 */
export function useIntersectionObserver<T extends HTMLElement = HTMLDivElement>(
  options: UseIntersectionObserverOptions = {}
): [RefObject<T>, boolean] {
  const { threshold = 0.15, root = null, rootMargin = '0px', triggerOnce = true } = options
  const targetRef = useRef<T | null>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const element = targetRef.current
    if (!element) return

    // Fallback if IntersectionObserver is unsupported in current environment
    if (typeof IntersectionObserver === 'undefined') {
      setIsInView(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          if (triggerOnce) {
            observer.unobserve(entry.target)
          }
        } else if (!triggerOnce) {
          setIsInView(false)
        }
      },
      { threshold, root, rootMargin }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold, root, rootMargin, triggerOnce])

  return [targetRef, isInView]
}

export default useIntersectionObserver
