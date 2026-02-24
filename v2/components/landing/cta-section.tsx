import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function CtaSection() {
  return (
    <section className="relative border-t-2 border-emerald-500/30">
      {/* Green-tinted dark overlay for visual separation from footer */}
      <div className="absolute inset-0 bg-emerald-950/20" />

      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Your Calcutta pool is coming up.
            <br />
            Are you ready?
          </h2>
          <p className="mt-4 text-base text-white/40">
            The teams. The odds. The edge. All in one tool.
          </p>
          <div className="mt-8">
            <Button size="lg" asChild className="gap-2">
              <Link href="/register">
                Create Your Free Account
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
