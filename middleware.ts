import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that require authentication
const PROTECTED_PATHS = ['/dashboard', '/calendar', '/profile'];

// Auth paths that should redirect to dashboard if already logged in
const AUTH_PATHS = ['/auth/login'];

// Middleware to check if user is authenticated
export function middleware(request: NextRequest) {
  // Get the current path
  const { pathname } = request.nextUrl;
  
  // Check if request path is protected
  const isProtectedPath = PROTECTED_PATHS.some(path => 
    pathname.startsWith(path)
  );
  
  // Check if path is an auth path (login page)
  const isAuthPath = AUTH_PATHS.some(path =>
    pathname.startsWith(path)
  );

  // Get the user info cookie
  const userInfo = request.cookies.get('user_info')?.value;
  const accessToken = request.cookies.get('google_access_token')?.value;
  const refreshToken = request.cookies.get('google_refresh_token')?.value;
  
  // Check if user is authenticated
  const isAuthenticated = !!userInfo && !!accessToken;
  
  // Handle auth paths - redirect to dashboard if already logged in
  if (isAuthPath && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Handle protected paths - redirect to login if not authenticated
  if (isProtectedPath && !isAuthenticated) {
    // Create login URL with return path
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('returnUrl', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
    
  // If protected path with token but no access token, try to refresh
  if (isProtectedPath && userInfo && !accessToken && refreshToken) {
    const refreshUrl = new URL('/api/auth/refresh', request.url);
    refreshUrl.searchParams.set('returnUrl', request.nextUrl.pathname);
    return NextResponse.redirect(refreshUrl);
  }
  
  // Continue to the requested page
  return NextResponse.next();
}

// Configure the paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
