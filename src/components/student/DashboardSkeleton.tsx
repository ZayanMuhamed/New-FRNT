import React from 'react'

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-pulse" aria-busy="true" aria-label="Loading student dashboard">
      {/* Greeting Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="space-y-2.5">
          <div className="h-8 w-64 bg-white/10 rounded-lg" />
          <div className="h-4 w-80 bg-white/5 rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-7 w-32 bg-white/10 rounded-full" />
          <div className="h-7 w-28 bg-white/5 rounded-full" />
        </div>
      </div>

      {/* Row 1: Profile Summary Card Skeleton */}
      <div className="frosted-glass p-6 md:p-8 rounded-3xl border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/10 border border-white/10" />
          <div className="space-y-2">
            <div className="h-6 w-44 bg-white/10 rounded-md" />
            <div className="h-4 w-56 bg-white/5 rounded-md" />
            <div className="flex items-center gap-2 pt-1">
              <div className="h-5 w-24 bg-white/10 rounded-full" />
              <div className="h-5 w-20 bg-white/5 rounded-full" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6 self-center md:self-auto">
          <div className="w-24 h-24 rounded-full bg-white/10 border border-white/10" />
        </div>
      </div>

      {/* Row 2: Continue Learning Skeleton */}
      <div className="frosted-glass p-6 md:p-8 rounded-3xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-36 bg-white/10 rounded-full" />
          <div className="h-5 w-20 bg-white/5 rounded-full" />
        </div>
        <div className="h-7 w-72 md:w-96 bg-white/10 rounded-lg" />
        <div className="h-4 w-60 bg-white/5 rounded-md" />
        <div className="h-2.5 w-full bg-white/10 rounded-full mt-3" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-4 w-32 bg-white/5 rounded" />
          <div className="h-10 w-36 bg-white/15 rounded-full" />
        </div>
      </div>

      {/* Row 3: Enrolled Courses Grid Skeleton */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-40 bg-white/10 rounded-md" />
          <div className="h-4 w-24 bg-white/5 rounded-md" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="frosted-glass p-5 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-4 w-20 bg-white/10 rounded-full" />
                <div className="h-4 w-12 bg-white/5 rounded-full" />
              </div>
              <div className="h-5 w-4/5 bg-white/10 rounded-md" />
              <div className="h-3.5 w-1/2 bg-white/5 rounded-md" />
              <div className="h-2 w-full bg-white/10 rounded-full pt-1" />
              <div className="flex justify-between pt-2">
                <div className="h-3 w-16 bg-white/5 rounded" />
                <div className="h-3 w-12 bg-white/5 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 4: Recently Accessed Lessons Skeleton */}
      <div>
        <div className="h-6 w-52 bg-white/10 rounded-md mb-4" />
        <div className="frosted-glass rounded-2xl border border-white/10 divide-y divide-white/5 overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/10 flex-shrink-0" />
                <div className="space-y-1.5">
                  <div className="h-4 w-52 bg-white/10 rounded-md" />
                  <div className="h-3 w-36 bg-white/5 rounded-md" />
                </div>
              </div>
              <div className="h-4 w-20 bg-white/5 rounded-md" />
            </div>
          ))}
        </div>
      </div>

      {/* Row 5: Completed Courses Skeleton */}
      <div>
        <div className="h-6 w-44 bg-white/10 rounded-md mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="frosted-glass p-5 rounded-2xl border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="h-5 w-24 bg-white/10 rounded-full" />
                <div className="w-5 h-5 rounded-full bg-white/10" />
              </div>
              <div className="h-5 w-48 bg-white/10 rounded-md" />
              <div className="h-3.5 w-32 bg-white/5 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DashboardSkeleton
