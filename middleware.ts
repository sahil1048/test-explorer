import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  // 1. Initialize Response
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  // 2. Refresh Supabase Session (Crucial for Auth)
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

  const { data: { user } } = await supabase.auth.getUser()

  const url = request.nextUrl
  const path = url.pathname
  
  // 3. Redirect Logged-In Users away from Auth pages
  const authRoutes = ['/login', '/signup', '/forgot-password', '/update-password']
  if (user && authRoutes.some(route => path.startsWith(route))) {
    return NextResponse.redirect(new URL('/categories', request.url))
  }

  // 4. Define Public Paths (No Login Required)
  const isPublicPath = 
    path === '/' ||                       
    path.startsWith('/login') ||          
    path.startsWith('/signup') ||         
    path.startsWith('/about') ||         
    path.startsWith('/contact') || 
    path.startsWith('/streams') ||    
    path.startsWith('/categories') || // You might want this public or private depending on your logic        
    path.startsWith('/blogs') ||         
    path.startsWith('/forgot-password') ||
    path.startsWith('/auth') ||           
    path.startsWith('/api/auth') ||       
    path.includes('.') // file extensions like .png, .css

  // 5. Protect Private Routes
  if (!user && !isPublicPath) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // --- REMOVED SUBDOMAIN REWRITE LOGIC HERE ---
  // We removed it because app/page.tsx now handles the school logic dynamically.
  // This prevents the 404 error looking for the deleted /school folder.

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}