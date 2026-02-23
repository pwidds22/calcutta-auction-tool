import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const publicRoutes = ['/', '/login', '/register', '/auth/callback']
const paidRoutes = ['/auction']

export async function middleware(request: NextRequest) {
  const { user, supabase, supabaseResponse } = await updateSession(request)
  const path = request.nextUrl.pathname

  // Allow public routes
  if (publicRoutes.includes(path)) {
    if (user && (path === '/login' || path === '/register')) {
      const url = request.nextUrl.clone()
      url.pathname = '/auction'
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  // Allow webhook routes (Stripe handles its own auth)
  if (path.startsWith('/api/webhooks')) {
    return supabaseResponse
  }

  // Everything below requires authentication
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // For paid routes, check has_paid in profiles table
  if (paidRoutes.some((route) => path.startsWith(route))) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('has_paid')
      .eq('id', user.id)
      .single()

    if (!profile?.has_paid) {
      const url = request.nextUrl.clone()
      url.pathname = '/payment'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
