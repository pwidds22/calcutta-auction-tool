import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
      <h1 className="text-4xl font-bold">Calcutta Edge</h1>
      <p className="max-w-md text-center text-muted-foreground">
        Win your March Madness Calcutta with data-driven strategy. Fair values,
        bid recommendations, and round-by-round profit projections.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/register">Get Started</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
    </div>
  )
}
