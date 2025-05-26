import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = cookies();
    
    // Clear all authentication cookies
    (await cookieStore).delete('google_access_token');
    (await cookieStore).delete('google_refresh_token');
    (await cookieStore).delete('user_info');
    
    // Redirect to home page after logout
    return NextResponse.redirect(new URL('/', 'http://localhost:3000'));
  } catch (error) {
    console.error('Error logging out:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}
