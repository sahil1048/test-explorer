import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

export async function middleware(request: NextRequest) {
  let hostname = request.headers.get("x-forwarded-host") || request.headers.get("host") || ''
  
  if (hostname.includes(':')) {
    hostname = hostname.split(':')[0]
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-current-domain', hostname)
  requestHeaders.set('x-current-path', request.nextUrl.pathname)

  let response = NextResponse.next({
    request: { headers: requestHeaders },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          
          response = NextResponse.next({ request: { headers: requestHeaders } })
          
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const url = request.nextUrl
  const path = url.pathname
  
  const authRoutes = ['/login', '/signup', '/forgot-password', '/update-password']
  if (user && authRoutes.some(route => path.startsWith(route))) {
    return NextResponse.redirect(new URL('/categories', request.url))
  }

  const isPublicPath = 
    path === '/' ||                       
    path.startsWith('/login') ||          
    path.startsWith('/signup') ||         
    path.startsWith('/about') ||         
    path.startsWith('/contact') || 
    path.startsWith('/streams') ||    
    path.startsWith('/categories') ||        
    path.startsWith('/blogs') ||         
    path.startsWith('/forgot-password') ||
    path.startsWith('/auth') ||           
    path.startsWith('/api/auth') ||       
    path.includes('.') 

  if (!user && !isPublicPath) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return response
}