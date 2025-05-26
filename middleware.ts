import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that require authentication
const PROTECTED_PATHS = ['/dashboard', '/calendar'];

// Middleware to check if user is authenticated
export function middleware(request: NextRequest) {
  // Check if request path is protected
  const isProtectedPath = PROTECTED_PATHS.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath) {
    // Get the user info cookie
    const userInfo = request.cookies.get('user_info')?.value;
    
    // Check if user is authenticated
    if (!userInfo) {
      // Redirect to login page if not authenticated
      const url = new URL('/', request.url);
      url.searchParams.set('returnUrl', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
    
    // Check if access token is about to expire
    const accessToken = request.cookies.get('google_access_token')?.value;
    if (!accessToken) {
      // If we have a refresh token but no access token, redirect to refresh
      const refreshToken = request.cookies.get('google_refresh_token')?.value;
      if (refreshToken) {
        const refreshUrl = new URL('/api/auth/refresh', request.url);
        refreshUrl.searchParams.set('returnUrl', request.nextUrl.pathname);
        return NextResponse.redirect(refreshUrl);
      }
      
      // If no tokens at all, redirect to login
      const url = new URL('/', request.url);
      url.searchParams.set('returnUrl', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }
  
  // Continue to the requested page
  return NextResponse.next();
}

// Configure the paths the middleware runs on
export const config = {
  matcher: [
    // Match all protected paths
    ...PROTECTED_PATHS.map(path => `${path}/:path*`),
  ],
};
