import { SkeletonPulse } from '@/components/ui/skeleton-pulse';

export default function PaymentLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 text-center space-y-4">
          <SkeletonPulse className="h-6 w-48 mx-auto" />
          <SkeletonPulse className="h-4 w-64 mx-auto" />
          <SkeletonPulse className="h-10 w-24 mx-auto mt-4" />
          <div className="space-y-2 pt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <SkeletonPulse className="h-4 w-4" />
                <SkeletonPulse className="h-4 w-48" />
              </div>
            ))}
          </div>
          <SkeletonPulse className="h-11 w-full mt-6" />
        </div>
      </div>
    </div>
  );
}
