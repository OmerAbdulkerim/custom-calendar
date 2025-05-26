/**
 * Google OAuth configuration
 * 
 * Note: OAuth 2.0 credentials need to be created in the Google Cloud Console
 * and the following environment variables need to be added to .env file:
 * - GOOGLE_CLIENT_ID
 * - GOOGLE_CLIENT_SECRET
 * - GOOGLE_REDIRECT_URI (typically http://localhost:3000/api/auth/callback/google in React/Next.js development)
 */

export const googleAuthConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/callback/google',
  
  // The scopes required for accessing Google Calendar
  scopes: [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
  ],
};
