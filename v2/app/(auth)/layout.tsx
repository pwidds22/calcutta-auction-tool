import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      {/* Branding + back link */}
      <div className="mb-8 flex flex-col items-center gap-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500">
            <span className="text-sm font-bold tracking-tight text-white font-mono">CE</span>
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">Calcutta Edge</span>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs text-white/40 transition-colors hover:text-white/70"
        >
          <ArrowLeft className="size-3" />
          Back to home
        </Link>
      </div>

      {children}
    </div>
  )
}
