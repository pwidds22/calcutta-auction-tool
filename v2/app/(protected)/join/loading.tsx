import { SkeletonPulse } from '@/components/ui/skeleton-pulse';

export default function JoinLoading() {
  return (
    <div className="container mx-auto max-w-md px-4 py-16">
      <div className="mb-6 space-y-2">
        <SkeletonPulse className="h-6 w-48" />
        <SkeletonPulse className="h-4 w-80" />
      </div>
      <div className="space-y-4 rounded-xl border border-white/[0.06] bg-white/[0.03] p-6">
        <SkeletonPulse className="h-4 w-24" />
        <SkeletonPulse className="h-10 w-full" />
        <SkeletonPulse className="h-4 w-32" />
        <SkeletonPulse className="h-10 w-full" />
        <SkeletonPulse className="h-10 w-full" />
      </div>
    </div>
  );
}
