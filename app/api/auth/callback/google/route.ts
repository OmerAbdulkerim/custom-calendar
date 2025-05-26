import { NextRequest, NextResponse } from 'next/server';
import { getTokens, getUserInfo } from '@/app/lib/auth/googleAuthService';
import { cookies } from 'next/headers';

// API route to handle Google OAuth callback
export async function GET(request: NextRequest) {
  try {
    // Get the code from the URL query parameters
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    
    if (!code) {
      return NextResponse.redirect(new URL('/auth/error?error=no_code', request.url));
    }
    
    // Exchange the code for tokens
    const tokens = await getTokens(code);
    
    if (!tokens.access_token) {
      return NextResponse.redirect(new URL('/auth/error?error=no_token', request.url));
    }
    
    // Get user information using the access token
    const userInfo = await getUserInfo(tokens.access_token);
    
    // Store tokens in HTTP-only cookies for security
    const cookieStore = cookies();
    
    // Store access token (short-lived)
    (await
      // Store access token (short-lived)
      cookieStore).set('google_access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: tokens.expiry_date ? Math.floor((tokens.expiry_date - Date.now()) / 1000) : 3600,
      path: '/',
    });
    
    // Store refresh token (long-lived) if provided
    if (tokens.refresh_token) {
      (await cookieStore).set('google_refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      });
    }
    
    // Store user info in session cookie
    (await cookieStore).set('user_info', JSON.stringify({
      id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
    }), {
      httpOnly: false, // We want client JS to access this
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });
    
    // Redirect to the home page or dashboard after successful login
    return NextResponse.redirect(new URL('/', request.url));
  } catch (error) {
    console.error('Error handling Google OAuth callback:', error);
    return NextResponse.redirect(new URL('/auth/error?error=auth_failed', request.url));
  }
}
