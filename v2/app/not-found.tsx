import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 bg-background">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-4 text-6xl font-bold text-white/10">404</div>
        <h1 className="text-xl font-semibold text-white">Page not found</h1>
        <p className="mt-2 text-sm text-white/40">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/host"
            className="rounded-lg border border-white/10 px-5 py-2 text-sm font-medium text-white/60 hover:bg-white/[0.06] transition-colors"
          >
            My Auctions
          </Link>
        </div>
      </div>
    </div>
  );
}
