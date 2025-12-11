
import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 1. Refresh Supabase Session
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  await supabase.auth.getUser()

  const url = request.nextUrl
  const hostname = request.headers.get("host") || ""
  const allowedDomains = ["localhost:3000", "testexplorer.com"]
  const isSubdomain = !allowedDomains.includes(hostname) && !hostname.startsWith('www.')

  if (isSubdomain) {
    const subdomain = hostname.split('.')[0]

    if (url.pathname.includes('.') || url.pathname.startsWith('/api') || url.pathname.startsWith('/_next')) {
      return response
    }

    const sharedRoutes = ['/dashboard', '/exams', '/profile']
    if (sharedRoutes.some(route => url.pathname.startsWith(route))) {
      return response
    }

    // Rewrite everything else (Home, Login) to the school folder
    return NextResponse.rewrite(new URL(`/school/${subdomain}${url.pathname}`, request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}