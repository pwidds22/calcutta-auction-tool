import { SkeletonPulse } from '@/components/ui/skeleton-pulse';

export default function RegisterLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-white/[0.06] bg-white/[0.03] p-8">
        <div className="space-y-2 text-center">
          <SkeletonPulse className="mx-auto h-7 w-56" />
          <SkeletonPulse className="mx-auto h-4 w-72" />
        </div>
        <div className="space-y-4">
          <SkeletonPulse className="h-10 w-full" />
          <SkeletonPulse className="h-10 w-full" />
          <SkeletonPulse className="h-10 w-full" />
          <SkeletonPulse className="h-10 w-full" />
        </div>
        <SkeletonPulse className="mx-auto h-4 w-48" />
      </div>
    </div>
  );
}
