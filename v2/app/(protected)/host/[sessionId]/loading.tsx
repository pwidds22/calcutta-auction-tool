import { SkeletonPulse } from '@/components/ui/skeleton-pulse';

export default function SessionLoading() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-4 space-y-4">
      {/* Status bar skeleton */}
      <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-2">
        <SkeletonPulse className="h-5 w-40" />
        <div className="flex items-center gap-3">
          <SkeletonPulse className="h-4 w-20" />
          <SkeletonPulse className="h-4 w-16" />
        </div>
      </div>

      {/* 3-column grid skeleton */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left panel */}
        <div className="col-span-12 lg:col-span-3">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 space-y-2">
            <SkeletonPulse className="h-5 w-24 mb-3" />
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonPulse key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>

        {/* Center panel */}
        <div className="col-span-12 space-y-4 lg:col-span-6">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
            <SkeletonPulse className="h-6 w-48 mx-auto mb-3" />
            <SkeletonPulse className="h-4 w-32 mx-auto mb-4" />
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <SkeletonPulse key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
            <SkeletonPulse className="h-10 w-full" />
            <SkeletonPulse className="h-10 w-full" />
          </div>
        </div>

        {/* Right panel */}
        <div className="col-span-12 space-y-4 lg:col-span-3">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 space-y-2">
            <SkeletonPulse className="h-5 w-28 mb-2" />
            {[1, 2, 3].map((i) => (
              <SkeletonPulse key={i} className="h-8 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
