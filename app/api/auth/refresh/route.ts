import { NextResponse } from 'next/server';
import { refreshAccessToken } from '@/app/lib/auth/googleAuthService';
import { cookies } from 'next/headers';

// API route to refresh the access token using the refresh token
export async function GET() {
  try {
    const cookieStore = cookies();
    const refreshToken = (await cookieStore).get('google_refresh_token')?.value;
    
    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token available' },
        { status: 401 }
      );
    }
    
    // Refresh the access token
    const credentials = await refreshAccessToken(refreshToken);
    
    if (!credentials.access_token) {
      return NextResponse.json(
        { error: 'Failed to refresh access token' },
        { status: 500 }
      );
    }
    
    // Update the access token cookie
    (await cookieStore).set('google_access_token', credentials.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: credentials.expiry_date 
        ? Math.floor((credentials.expiry_date - Date.now()) / 1000) 
        : 3600,
      path: '/',
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return NextResponse.json(
      { error: 'Failed to refresh access token' },
      { status: 500 }
    );
  }
}
