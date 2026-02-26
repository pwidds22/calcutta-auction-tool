'use client';

import Link from 'next/link';

export default function ProtectedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-4 text-4xl font-bold text-white/20">Error</div>
        <h1 className="text-xl font-semibold text-white">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-white/40">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/host"
            className="rounded-lg border border-white/10 px-5 py-2 text-sm font-medium text-white/60 hover:bg-white/[0.06] transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
