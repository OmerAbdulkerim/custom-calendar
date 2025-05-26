import { NextResponse } from 'next/server';
import { getAuthUrl } from '@/app/lib/auth/googleAuthService';

// API route to initiate Google OAuth login
export async function GET() {
  try {
    // Generate Google OAuth URL
    const authUrl = getAuthUrl();
    
    // Redirect to Google OAuth consent screen
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Error initiating Google OAuth login:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Google login' },
      { status: 500 }
    );
  }
}
