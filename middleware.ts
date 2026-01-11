import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

const SYSTEM_ROUTES = new Set([
  'login', 'signup', 'dashboard', 'api', 'about', 'contact', 
  'streams', 'categories', 'blogs', 'forgot-password', 
  'update-password', 'auth', 'profile', 'logout',
  'courses', 'exams', 'search', 'privacy', 'terms', 'robots.txt', 'sitemap.xml', 'mocktest', 'complete-profile'
])

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const url = request.nextUrl
  const path = url.pathname
  const parts = path.split('/')
  const candidateSlug = parts[1]

  let currentSchoolSlug: string | null = null
  let isSchoolRoute = false

  if (candidateSlug && !SYSTEM_ROUTES.has(candidateSlug)) {
    isSchoolRoute = true
    currentSchoolSlug = candidateSlug
    
    const rewriteUrl = url.clone()
    rewriteUrl.pathname = `/${parts.slice(2).join('/')}` 
    
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-school-slug', currentSchoolSlug)
    requestHeaders.set('x-current-path', path) 

    response = NextResponse.rewrite(rewriteUrl, {
      request: { headers: requestHeaders }
    })
  } else {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-current-path', path)
    
    response = NextResponse.next({
      request: { headers: requestHeaders }
    })
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          
          if (isSchoolRoute && currentSchoolSlug) {
             const rewriteUrl = url.clone()
             rewriteUrl.pathname = `/${parts.slice(2).join('/')}`
             const requestHeaders = new Headers(request.headers)
             requestHeaders.set('x-school-slug', currentSchoolSlug)
             requestHeaders.set('x-current-path', path)
             
             response = NextResponse.rewrite(rewriteUrl, { request: { headers: requestHeaders } })
          } else {
             const requestHeaders = new Headers(request.headers)
             requestHeaders.set('x-current-path', path)
             response = NextResponse.next({ request: { headers: requestHeaders } })
          }
          
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const internalPath = isSchoolRoute ? `/${parts.slice(2).join('/')}` : path

  const authRoutes = ['/login', '/signup', '/forgot-password', '/update-password']
  const isAuthRoute = authRoutes.some(route => internalPath.startsWith(route))

  if (user && isAuthRoute) {
    const redirectBase = isSchoolRoute ? `/${currentSchoolSlug}` : ''
    return NextResponse.redirect(new URL(`${redirectBase}/categories`, request.url))
  }

  const isPublicPath = 
    internalPath === '/' || 
    internalPath.startsWith('/about') ||         
    internalPath.startsWith('/contact') || 
    internalPath.startsWith('/streams') ||    
    internalPath.startsWith('/categories') ||    
    internalPath.startsWith('/courses') ||    
    internalPath.startsWith('/blogs') ||         
    internalPath.startsWith('/auth') ||           
    internalPath.startsWith('/api') ||
    internalPath.startsWith('/mocktest') ||
    isAuthRoute 

    if (!user && !isPublicPath) {
    const redirectBase = isSchoolRoute ? `/${currentSchoolSlug}` : ''
    const returnUrl = isSchoolRoute ? path : internalPath
    return NextResponse.redirect(new URL(`${redirectBase}/login?next=${returnUrl}`, request.url))
  }

  return response
}