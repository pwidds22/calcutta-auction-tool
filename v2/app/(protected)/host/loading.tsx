import { SkeletonPulse } from '@/components/ui/skeleton-pulse';

export default function HostLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <SkeletonPulse className="h-7 w-40" />
          <SkeletonPulse className="mt-2 h-4 w-56" />
        </div>
        <div className="flex gap-2">
          <SkeletonPulse className="h-9 w-20" />
          <SkeletonPulse className="h-9 w-32" />
        </div>
      </div>

      {/* Section label */}
      <div>
        <SkeletonPulse className="h-4 w-40 mb-3" />
        {/* Session cards */}
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
            >
              <div className="space-y-2">
                <SkeletonPulse className="h-4 w-40" />
                <div className="flex gap-2">
                  <SkeletonPulse className="h-4 w-16" />
                  <SkeletonPulse className="h-4 w-20" />
                </div>
              </div>
              <SkeletonPulse className="h-4 w-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
