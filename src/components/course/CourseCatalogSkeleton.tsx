import React from 'react'

interface CourseCatalogSkeletonProps {
  count?: number
}

export const CourseCatalogSkeleton: React.FC<CourseCatalogSkeletonProps> = ({
  count = 9,
}) => {
  const items = Array.from({ length: count }, (_, i) => i)

  return (
    <div
      aria-label="Loading course catalog"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {items.map((idx) => (
        <div
          key={idx}
          className="rounded-3xl bg-[rgba(6,10,20,0.72)] border border-white/10 overflow-hidden flex flex-col justify-between animate-pulse"
        >
          {/* Header shimmer */}
          <div className="h-36 bg-gradient-to-r from-white/[0.04] via-white/[0.08] to-white/[0.04] p-4 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <div className="h-5 w-24 rounded-full bg-white/10" />
              <div className="h-5 w-16 rounded-full bg-white/10" />
            </div>
            <div className="h-4 w-20 rounded-full bg-white/10" />
          </div>

          {/* Body shimmer */}
          <div className="p-5 space-y-4">
            <div className="space-y-2">
              <div className="h-5 w-4/5 rounded-md bg-white/10" />
              <div className="h-5 w-2/3 rounded-md bg-white/10" />
            </div>

            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-white/10" />
              <div className="h-3.5 w-32 rounded bg-white/10" />
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="h-3 w-full rounded bg-white/5" />
              <div className="h-3 w-5/6 rounded bg-white/5" />
            </div>

            {/* Footer shimmer */}
            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-4 w-10 rounded bg-white/10" />
                <div className="h-4 w-16 rounded bg-white/10" />
              </div>
              <div className="h-4 w-12 rounded bg-white/10" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
