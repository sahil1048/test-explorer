import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  // 1. Supabase Auth Refresh (Keep this as is)
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

  // 2. Subdomain & Routing Logic
  const url = request.nextUrl
  const hostname = request.headers.get("host") || ""
  
  // Define your domains (Change to your production domain later)
  const allowedDomains = ["localhost:3000", "testexplorer.com"]
  
  // Check if it's a subdomain (e.g., "dps.localhost:3000")
  const isSubdomain = !allowedDomains.includes(hostname) && !hostname.startsWith('www.')

  if (isSubdomain) {
    const subdomain = hostname.split('.')[0]

    // --- FIX STARTS HERE ---
    
    // A. Define routes that should ALWAYS come from the "Core App" (Root folder)
    // These paths will NOT be rewritten to /school/[slug]
    const coreRoutes = [
      '/dashboard', 
      '/courses', 
      '/exams', 
      '/profile', 
      '/api',
      '/settings'
    ]

    // If the user is visiting a core route, let them pass through to the main app
    if (coreRoutes.some(route => url.pathname.startsWith(route))) {
      return response // This keeps the URL as dps.testexplorer.com/dashboard but renders app/dashboard
    }

    // B. Exclude static files (images, next internals)
    if (url.pathname.includes('.') || url.pathname.startsWith('/_next')) {
      return response
    }

    // C. Rewrite everything else (Landing Page, Login, Signup) to the School Folder
    // e.g., dps.testexplorer.com/ -> app/school/dps/page.tsx
    // e.g., dps.testexplorer.com/login -> app/school/dps/login/page.tsx
    return NextResponse.rewrite(new URL(`/school/${subdomain}${url.pathname}`, request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}