'use client';

import { useState, useCallback } from 'react';
import { useAuthenticatedFetch } from '@/app/hooks/useAuthenticatedFetch';
import { CalendarEvent } from '@/app/services/calendarService';

// Typings for parameters
interface GetEventsParams {
  calendarId?: string;
  timeMin?: string;
  timeMax?: string;
  maxResults?: number;
  singleEvents?: boolean;
  orderBy?: string;
  query?: string;
}

interface UseCalendarHookReturn {
  events: CalendarEvent[];
  isLoading: boolean;
  error: Error | null;
  fetchEvents: (params?: GetEventsParams) => Promise<CalendarEvent[]>;
  fetchEvent: (eventId: string, calendarId?: string) => Promise<CalendarEvent>;
  createEvent: (event: Omit<CalendarEvent, 'id'>, calendarId?: string) => Promise<CalendarEvent>;
  updateEvent: (eventId: string, event: Partial<Omit<CalendarEvent, 'id'>>, calendarId?: string) => Promise<CalendarEvent>;
  deleteEvent: (eventId: string, calendarId?: string) => Promise<boolean>;
  searchEvents: (query: string, params?: Omit<GetEventsParams, 'query'>) => Promise<CalendarEvent[]>;
  getEventsForDate: (date: Date, calendarId?: string) => Promise<CalendarEvent[]>;
  getEventsForMonth: (year: number, month: number, calendarId?: string) => Promise<CalendarEvent[]>;
}

/**
 * Hook to interact with the Calendar API
 */
export function useCalendar(): UseCalendarHookReturn {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const { fetchWithAuth, isLoading, error } = useAuthenticatedFetch();
  
  /**
   * Fetch calendar events with the given parameters
   */
  const fetchEvents = useCallback(async (params: GetEventsParams = {}): Promise<CalendarEvent[]> => {
    try {
      // Construct query parameters
      const queryParams = new URLSearchParams();
      if (params.calendarId) queryParams.append('calendarId', params.calendarId);
      if (params.timeMin) queryParams.append('timeMin', params.timeMin);
      if (params.timeMax) queryParams.append('timeMax', params.timeMax);
      if (params.maxResults) queryParams.append('maxResults', params.maxResults.toString());
      if (params.singleEvents !== undefined) queryParams.append('singleEvents', params.singleEvents.toString());
      if (params.orderBy) queryParams.append('orderBy', params.orderBy);
      if (params.query) queryParams.append('q', params.query);
      
      const url = `/api/calendar/events?${queryParams.toString()}`;
      const fetchedEvents = await fetchWithAuth(url);
      setEvents(fetchedEvents);
      return fetchedEvents;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }, [fetchWithAuth]);
  
  /**
   * Fetch a single event by ID
   */
  const fetchEvent = useCallback(async (eventId: string, calendarId?: string): Promise<CalendarEvent> => {
    try {
      const queryParams = new URLSearchParams();
      if (calendarId) queryParams.append('calendarId', calendarId);
      
      const url = `/api/calendar/events/${eventId}?${queryParams.toString()}`;
      return await fetchWithAuth(url);
    } catch (error) {
      console.error(`Error fetching event ${eventId}:`, error);
      throw error;
    }
  }, [fetchWithAuth]);
  
  /**
   * Create a new calendar event
   */
  const createEvent = useCallback(async (
    event: Omit<CalendarEvent, 'id'>, 
    calendarId?: string
  ): Promise<CalendarEvent> => {
    try {
      const queryParams = new URLSearchParams();
      if (calendarId) queryParams.append('calendarId', calendarId);
      
      const url = `/api/calendar/events?${queryParams.toString()}`;
      return await fetchWithAuth(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }, [fetchWithAuth]);
  
  /**
   * Update an existing calendar event
   */
  const updateEvent = useCallback(async (
    eventId: string,
    event: Partial<Omit<CalendarEvent, 'id'>>,
    calendarId?: string
  ): Promise<CalendarEvent> => {
    try {
      const queryParams = new URLSearchParams();
      if (calendarId) queryParams.append('calendarId', calendarId);
      
      const url = `/api/calendar/events/${eventId}?${queryParams.toString()}`;
      return await fetchWithAuth(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error(`Error updating event ${eventId}:`, error);
      throw error;
    }
  }, [fetchWithAuth]);
  
  /**
   * Delete a calendar event
   */
  const deleteEvent = useCallback(async (
    eventId: string,
    calendarId?: string
  ): Promise<boolean> => {
    try {
      const queryParams = new URLSearchParams();
      if (calendarId) queryParams.append('calendarId', calendarId);
      
      const url = `/api/calendar/events/${eventId}?${queryParams.toString()}`;
      await fetchWithAuth(url, {
        method: 'DELETE',
      });
      
      // Update the local state to remove the deleted event
      setEvents(prev => prev.filter(event => event.id !== eventId));
      return true;
    } catch (error) {
      console.error(`Error deleting event ${eventId}:`, error);
      throw error;
    }
  }, [fetchWithAuth]);
  
  /**
   * Search for events matching a query
   */
  const searchEvents = useCallback(async (
    query: string,
    params: Omit<GetEventsParams, 'query'> = {}
  ): Promise<CalendarEvent[]> => {
    return fetchEvents({ ...params, query });
  }, [fetchEvents]);
  
  /**
   * Get events for a specific date
   */
  const getEventsForDate = useCallback(async (
    date: Date,
    calendarId?: string
  ): Promise<CalendarEvent[]> => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return fetchEvents({
      calendarId,
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: 'startTime'
    });
  }, [fetchEvents]);
  
  /**
   * Get events for a specific month
   */
  const getEventsForMonth = useCallback(async (
    year: number,
    month: number, // 0-11
    calendarId?: string
  ): Promise<CalendarEvent[]> => {
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);
    
    return fetchEvents({
      calendarId,
      timeMin: startOfMonth.toISOString(),
      timeMax: endOfMonth.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 500 // Increased for monthly view
    });
  }, [fetchEvents]);
  
  return {
    events,
    isLoading,
    error,
    fetchEvents,
    fetchEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    searchEvents,
    getEventsForDate,
    getEventsForMonth
  };
}
