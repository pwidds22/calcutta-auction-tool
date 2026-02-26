import { SkeletonPulse } from '@/components/ui/skeleton-pulse';

export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
      <SkeletonPulse className="h-7 w-32" />

      {/* Account details card */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 space-y-4">
        <SkeletonPulse className="h-5 w-36" />
        <div className="space-y-3">
          <div className="flex justify-between">
            <SkeletonPulse className="h-4 w-16" />
            <SkeletonPulse className="h-4 w-48" />
          </div>
          <div className="flex justify-between">
            <SkeletonPulse className="h-4 w-28" />
            <SkeletonPulse className="h-5 w-20" />
          </div>
          <div className="flex justify-between">
            <SkeletonPulse className="h-4 w-20" />
            <SkeletonPulse className="h-4 w-32" />
          </div>
        </div>
      </div>

      {/* Support card */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 space-y-3">
        <SkeletonPulse className="h-5 w-24" />
        <SkeletonPulse className="h-4 w-64" />
      </div>
    </div>
  );
}
