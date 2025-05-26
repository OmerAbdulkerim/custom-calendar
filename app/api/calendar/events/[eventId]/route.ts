/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import calendarService from '@/app/services/calendarService';
import { 
  successResponse, 
  authErrorResponse, 
  handleApiError 
} from '@/app/utils/apiUtils';

/**
 * GET handler for fetching a single calendar event
 */
/**
 * GET handler for fetching a single calendar event
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const eventId = params.get('eventId') as string;
  const calendarId = params.get('calendarId') as string || undefined;

  try {
    // Get the access token from cookies
    const cookieStore = cookies();
    const accessToken = (await cookieStore).get('google_access_token')?.value;
    
    if (!accessToken) {
      return authErrorResponse('No authentication token available');
    }
    
    // Get the event from Google Calendar
    const event = await calendarService.getEvent(
      accessToken,
      eventId,
      calendarId
    );
    
    return successResponse(event);
  } catch (error: any) {
    console.error(`Error fetching calendar event ${eventId}:`, error);
    return handleApiError(error);
  }
}

/**
 * PATCH handler for updating an event
 */
export async function PATCH(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const eventId = params.get('eventId') as string;
  const calendarId = params.get('calendarId') as string || undefined;

  try {
    // Get the access token from cookies
    const cookieStore = cookies();
    const accessToken = (await cookieStore).get('google_access_token')?.value;
    
    if (!accessToken) {
      return authErrorResponse('No authentication token available');
    }
    
    // Parse the event data from the request
    const eventData = await request.json();
    
    // Update the event in Google Calendar
    const updatedEvent = await calendarService.updateEvent(
      accessToken,
      eventId,
      eventData,
      calendarId
    );
    
    return successResponse(updatedEvent);
  } catch (error: any) {
    console.error(`Error updating calendar event ${eventId}:`, error);
    return handleApiError(error);
  }
}

/**
 * DELETE handler for deleting an event
 */
export async function DELETE(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  // Extract event ID from URL path
  const eventId = request.url.split('/').pop() || "";
  const calendarId = params.get('calendarId') as string;

  try {
    // Get the access token from cookies
    const cookieStore = cookies();
    const accessToken = (await cookieStore).get('google_access_token')?.value;
    
    if (!accessToken) {
      return authErrorResponse('No authentication token available');
    }
    
    // Attempt to delete the event
    try {
      await calendarService.deleteEvent(
        accessToken,
        eventId,
        calendarId
      );
      
      return successResponse({ id: eventId });
    } catch (innerError: any) {
      // Special handling for 404 errors (event not found)
      if (innerError.code === 404 || 
          innerError.status === 404 || 
          (innerError.message && innerError.message.includes('404'))) {
        console.warn(`Event not found or already deleted: ${eventId}`);
        
        // Return success with warning if event wasn't found
        // This is a legitimate use case where the end result is the same - the event is gone
        return successResponse(
          { id: eventId },
          200,
          'Event not found or already deleted'
        );
      }
      
      // Rethrow other errors to be handled by the main catch block
      throw innerError;
    }
  } catch (error: any) {
    console.error(`Error deleting calendar event ${eventId}:`, error);
    return handleApiError(error);
  }
}
