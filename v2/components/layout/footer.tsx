import Link from 'next/link'

const PRODUCT_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Sign In', href: '/login' },
  { label: 'Create Account', href: '/register' },
]

export function Footer() {
  return (
    <footer className="border-t border-white/[0.04] bg-black/30">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500">
                <span className="text-[11px] font-bold tracking-tight text-white font-mono">CE</span>
              </div>
              <span className="text-sm font-semibold tracking-tight text-white">Calcutta Edge</span>
            </div>
            <p className="text-sm text-white/40 leading-relaxed">
              Strategy analytics for Calcutta auction players who take their pools seriously.
            </p>
          </div>

          {/* Product links */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/25">
              Product
            </h3>
            <ul className="space-y-2">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.href}>
                  {link.href.startsWith('#') ? (
                    <a
                      href={link.href}
                      className="text-sm text-white/40 transition-colors hover:text-white/70"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-white/40 transition-colors hover:text-white/70"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/25">
              Contact
            </h3>
            <a
              href="mailto:support@calcuttaedge.com"
              className="text-sm text-white/40 transition-colors hover:text-white/70"
            >
              support@calcuttaedge.com
            </a>
          </div>
        </div>

        <div className="mt-10 border-t border-white/[0.04] pt-6">
          <p className="text-xs text-white/20">
            &copy; {new Date().getFullYear()} Calcutta Edge. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
