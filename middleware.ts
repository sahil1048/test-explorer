import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

// 1. SYSTEM ROUTES: These are reserved and CANNOT be used as school slugs.
// If a URL starts with these, we treat it as a Main Site route.
const SYSTEM_ROUTES = new Set([
  'login', 'signup', 'dashboard', 'api', 'about', 'contact', 
  'streams', 'categories', 'blogs', 'forgot-password', 
  'update-password', 'auth', 'profile', 'logout',
  'courses', 'exams', 'search', 'privacy', 'terms', 'robots.txt', 'sitemap.xml'
])

export async function middleware(request: NextRequest) {
  const url = request.nextUrl
  const path = url.pathname
  const requestHeaders = new Headers(request.headers)
  
  // 2. Extract Potential Slug
  const parts = path.split('/')
  const candidateSlug = parts[1] // e.g. "ops" from "/ops/dashboard" or "categories" from "/categories"

  let currentSchoolSlug = null
  let isSchoolRoute = false

  // 3. Determine if this is a School Route
  // Logic: It has a first segment AND that segment is NOT a system route
  if (candidateSlug && !SYSTEM_ROUTES.has(candidateSlug)) {
    isSchoolRoute = true
    currentSchoolSlug = candidateSlug
    
    // Add headers so Layout/Page knows the school
    requestHeaders.set('x-school-slug', currentSchoolSlug)
    requestHeaders.set('x-current-path', path)
    
    // Rewrite Logic: Remove the slug from the internal path
    // Browser: /ops/categories -> Server sees: /categories
    const newPath = `/${parts.slice(2).join('/')}`
    url.pathname = newPath
  } else {
    // Main Site Route
    requestHeaders.set('x-current-path', path)
  }

  // 4. Create Response
  let response = isSchoolRoute 
    ? NextResponse.rewrite(url, { request: { headers: requestHeaders } })
    : NextResponse.next({ request: { headers: requestHeaders } })

  // 5. Supabase Auth Setup
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = isSchoolRoute 
            ? NextResponse.rewrite(url, { request: { headers: requestHeaders } })
            : NextResponse.next({ request: { headers: requestHeaders } })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // 6. Auth Protection Logic
  // Check against the REWRITTEN url.pathname (internal path)
  const internalPath = url.pathname
  
  const authRoutes = ['/login', '/signup', '/forgot-password', '/update-password']
  
  // A. Redirect Logged-In Users away from Auth Pages
  if (user && authRoutes.some(route => internalPath.startsWith(route))) {
    const redirectBase = isSchoolRoute ? `/${currentSchoolSlug}` : ''
    return NextResponse.redirect(new URL(`${redirectBase}/categories`, request.url))
  }

  // B. Define Public Paths (Routes accessible without login)
  const isPublicPath = 
    internalPath === '/' || 
    internalPath.startsWith('/about') ||         
    internalPath.startsWith('/contact') || 
    internalPath.startsWith('/streams') ||    
    internalPath.startsWith('/categories') || // <--- Important!       
    internalPath.startsWith('/courses') ||    // <--- Important!
    internalPath.startsWith('/blogs') ||         
    internalPath.startsWith('/auth') ||           
    internalPath.startsWith('/api') ||
    authRoutes.some(route => internalPath.startsWith(route))

  // C. Redirect Guest Users to Login
  if (!user && !isPublicPath) {
    const redirectBase = isSchoolRoute ? `/${currentSchoolSlug}` : ''
    // Preserve the original destination for redirect back
    const nextUrl = isSchoolRoute ? path : internalPath
    return NextResponse.redirect(new URL(`${redirectBase}/login?next=${nextUrl}`, request.url))
  }

  return response
}