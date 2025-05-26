import { google } from 'googleapis';
import { googleAuthConfig } from '@/app/lib/auth/googleAuth.config';

// Create OAuth2 client
export const createOAuth2Client = () => {
  return new google.auth.OAuth2(
    googleAuthConfig.clientId,
    googleAuthConfig.clientSecret,
    googleAuthConfig.redirectUri
  );
};

// Generate authorization URL
export const getAuthUrl = () => {
  const oauth2Client = createOAuth2Client();
  
  return oauth2Client.generateAuthUrl({
    access_type: 'offline', // This will provide a refresh token
    scope: googleAuthConfig.scopes,
    prompt: 'consent', // Force consent screen to ensure we get a refresh token
  });
};

// Exchange code for tokens
export const getTokens = async (code: string) => {
  const oauth2Client = createOAuth2Client();
  
  try {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    throw error;
  }
};

// Refresh access token using refresh token
export const refreshAccessToken = async (refreshToken: string) => {
  const oauth2Client = createOAuth2Client();
  
  try {
    oauth2Client.setCredentials({
      refresh_token: refreshToken
    });
    
    const { credentials } = await oauth2Client.refreshAccessToken();
    return credentials;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw error;
  }
};

// Get user info from Google
export const getUserInfo = async (accessToken: string) => {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });
  
  const oauth2 = google.oauth2({
    auth: oauth2Client,
    version: 'v2'
  });
  
  try {
    const { data } = await oauth2.userinfo.get();
    return data;
  } catch (error) {
    console.error('Error fetching user info:', error);
    throw error;
  }
};
