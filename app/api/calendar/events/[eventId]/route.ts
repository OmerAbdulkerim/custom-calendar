/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import calendarService from '@/app/services/calendarService';

/**
 * GET handler for fetching a single calendar event
 */
export async function GET(request: NextRequest) {

  const params = request.nextUrl.searchParams;
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
    
    const eventId = params.get('eventId') as string;
    const calendarId = params.get('calendarId') as string || undefined;
    
    // Get the event
    const event = await calendarService.getEvent(
      accessToken,
      eventId,
      calendarId
    );
    
    return NextResponse.json(event);
  } catch (error: any) {
    console.error(`Error fetching calendar event ${params.get('eventId')}:`, error);
    
    // Handle different error types
    if (error.code === 401 || error.code === 403) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    } else if (error.code === 404) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch calendar event' },
      { status: 500 }
    );
  }
}

/**
 * PATCH handler for updating an event
 */
export async function PATCH(request: NextRequest) {
  const params = request.nextUrl.searchParams;
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
    
    const eventId = params.get('eventId') as string;
    const calendarId = params.get('calendarId') as string || undefined;
    const eventData = await request.json();
    
    // Update the event
    const updatedEvent = await calendarService.updateEvent(
      accessToken,
      eventId,
      eventData,
      calendarId
    );
    
    return NextResponse.json(updatedEvent);
  } catch (error: any) {
    console.error(`Error updating calendar event ${params.get('eventId')}:`, error);
    
    // Handle different error types
    if (error.code === 401 || error.code === 403) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    } else if (error.code === 404) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update calendar event' },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler for deleting an event
 */
export async function DELETE(request: NextRequest) {
  const params = request.nextUrl.searchParams;
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
    
    const eventId = params.get('eventId') as string;
    const calendarId = params.get('calendarId') as string || undefined;
    
    // Delete the event
    await calendarService.deleteEvent(
      accessToken,
      eventId,
      calendarId
    );
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error(`Error deleting calendar event ${params.get('eventId')}:`, error);
    
    // Handle different error types
    if (error.code === 401 || error.code === 403) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    } else if (error.code === 404) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete calendar event' },
      { status: 500 }
    );
  }
}
