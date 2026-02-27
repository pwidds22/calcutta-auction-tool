'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark landing-theme">
      <body className="bg-background text-white">
        <div className="flex min-h-screen flex-col items-center justify-center px-4">
          <div className="mx-auto max-w-md text-center">
            <div className="mb-4 text-4xl font-bold text-white/20">500</div>
            <h1 className="text-xl font-semibold text-white">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm text-white/40">
              An unexpected error occurred. Please try again.
            </p>
            {error.digest && (
              <p className="mt-1 text-xs text-white/20 font-mono">
                Error ID: {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              className="mt-6 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
