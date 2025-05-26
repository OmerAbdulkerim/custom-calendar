import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import calendarService from '@/app/services/calendarService';

/**
 * GET handler for fetching calendar events
 */
export async function GET(request: NextRequest) {
  try {
    // Get the access token from cookies
    const cookieStore = cookies();
    const accessToken = (await cookieStore).get('google_access_token')?.value;
    const refreshToken = (await cookieStore).get('google_refresh_token')?.value;
    
    // If no access token and no refresh token, return 401
    if (!accessToken && !refreshToken) {
      return NextResponse.json(
        { error: 'No authentication token available' },
        { status: 401 }
      );
    }
    
    // Try to refresh the token if access token is missing but refresh token exists
    let token = accessToken;
    if (!accessToken && refreshToken) {
      try {
        token = await calendarService.refreshTokenIfNeeded(refreshToken);
        // Update the access token cookie
        (await cookieStore).set('google_access_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 3600,
          path: '/',
        });
      } catch (error) {
        console.error('Failed to refresh token:', error);
        return NextResponse.json(
          { error: 'Authentication failed' },
          { status: 401 }
        );
      }
    }
    
    if (!token) {
      return NextResponse.json(
        { error: 'No valid authentication token' },
        { status: 401 }
      );
    }
    
    // Get query parameters
    const { searchParams } = request.nextUrl;
    const calendarId = searchParams.get('calendarId') || undefined;
    const timeMin = searchParams.get('timeMin') || undefined;
    const timeMax = searchParams.get('timeMax') || undefined;
    const maxResults = searchParams.get('maxResults') ? 
      parseInt(searchParams.get('maxResults')!) : 
      undefined;
    const singleEvents = searchParams.get('singleEvents') ? 
      searchParams.get('singleEvents') === 'true' : 
      undefined;
    const orderBy = searchParams.get('orderBy') || undefined;
    const query = searchParams.get('q') || undefined;
    
    // Use the appropriate method based on parameters
    let events;
    if (query) {
      events = await calendarService.searchEvents(token, query, {
        calendarId,
        timeMin,
        timeMax,
        maxResults
      });
    } else {
      events = await calendarService.getEvents(token, {
        calendarId,
        timeMin,
        timeMax,
        maxResults,
        singleEvents,
        orderBy,
        q: query
      });
    }
    
    return NextResponse.json(events);
  } catch (error: any) {
    console.error('Error fetching calendar events:', error);
    
    // Handle different error types
    if (error.code === 401 || error.code === 403) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    } else if (error.code === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    } else if (error.code >= 500) {
      return NextResponse.json(
        { error: 'Calendar service unavailable. Please try again later.' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}

/**
 * POST handler for creating calendar events
 */
export async function POST(request: NextRequest) {
  try {
    // Get the access token from cookies
    const cookieStore = cookies();
    const accessToken = (await cookieStore).get('google_access_token')?.value;
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'No authentication token available' },
        { status: 401 }
      );
    }
    
    // Parse the request body
    const eventData = await request.json();
    const calendarId = request.nextUrl.searchParams.get('calendarId') || undefined;
    
    // Create the event
    const createdEvent = await calendarService.createEvent(
      accessToken,
      eventData,
      calendarId
    );
    
    return NextResponse.json(createdEvent, { status: 201 });
  } catch (error: any) {
    console.error('Error creating calendar event:', error);
    
    // Handle different error types
    if (error.code === 401 || error.code === 403) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create calendar event' },
      { status: 500 }
    );
  }
}
