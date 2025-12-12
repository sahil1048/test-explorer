import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({ request: { headers: request.headers } })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )
  await supabase.auth.getUser()

  const url = request.nextUrl
  const hostname = request.headers.get("host") || ""
  
  // ADD YOUR VERCEL DOMAIN HERE to prevent it from being treated as a school subdomain
  // e.g. ["localhost:3000", "testexplorer.com", "your-app-name.vercel.app"]
  const allowedDomains = ["localhost:3000", "testexplorer.com"]
  
  const isSubdomain = !allowedDomains.includes(hostname) && !hostname.startsWith('www.')

  if (isSubdomain) {
    const subdomain = hostname.split('.')[0]

    // --- FIX IS HERE ---
    const coreRoutes = [
      '/dashboard', 
      '/courses', 
      '/categories', // <--- ADD THIS
      '/exams', 
      '/profile', 
      '/api',
      '/settings',
      '/login', // Optional: if you want a global login page
      '/signup' // Optional: if you want a global signup page
    ]

    if (coreRoutes.some(route => url.pathname.startsWith(route))) {
      return response 
    }

    if (url.pathname.includes('.') || url.pathname.startsWith('/_next')) {
      return response
    }

    return NextResponse.rewrite(new URL(`/school/${subdomain}${url.pathname}`, request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}