import { google, calendar_v3 } from 'googleapis';
import { refreshAccessToken } from '@/app/lib/auth/googleAuthService';

// Types for consistency across the service
export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: Date | string;
  end: Date | string;
  location?: string;
  creator?: {
    email: string;
    displayName?: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
  }>;
  recurringEventId?: string;
  colorId?: string;
  status?: string;
  htmlLink?: string;
}

// API Error types
export interface CalendarApiError extends Error {
  code?: number;
  status?: string;
  isRetryable?: boolean;
}

// Service configuration
interface CalendarServiceConfig {
  maxRetries: number;
  retryDelay: number; // in milliseconds
  rateLimitDelay: number; // in milliseconds
  defaultCalendarId: string;
}

// Default configuration
const defaultConfig: CalendarServiceConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  rateLimitDelay: 2000,
  defaultCalendarId: 'primary'
};

/**
 * CalendarService class to handle all interactions with Google Calendar API
 */
export class CalendarService {
  private config: CalendarServiceConfig;
  private requestsThisMinute: number = 0;
  private minuteStartTime: number = Date.now();
  private maxRequestsPerMinute: number = 500;

  constructor(config?: Partial<CalendarServiceConfig>) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Get Google Calendar API client
   */
  private async getCalendarClient(accessToken: string): Promise<calendar_v3.Calendar> {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    return google.calendar({ version: 'v3', auth });
  }

  /**
   * Check and handle rate limiting
   */
  private async checkRateLimit(): Promise<void> {
    const now = Date.now();
    
    // Reset counter if a minute has passed
    if (now - this.minuteStartTime >= 60000) {
      this.requestsThisMinute = 0;
      this.minuteStartTime = now;
      return;
    }
    
    // If we're approaching the rate limit, delay the request
    if (this.requestsThisMinute >= this.maxRequestsPerMinute) {
      console.warn('Approaching rate limit, delaying request');
      await new Promise(resolve => setTimeout(resolve, this.config.rateLimitDelay));
      
      // Reset after waiting
      this.requestsThisMinute = 0;
      this.minuteStartTime = Date.now();
    }
    
    this.requestsThisMinute++;
  }

  /**
   * Execute API request with retry logic
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    retries: number = 0
  ): Promise<T> {
    try {
      // Check rate limiting before making the request
      await this.checkRateLimit();
      
      // Execute the operation
      return await operation();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const calendarError: CalendarApiError = error;
      
      // Determine if we should retry based on error type
      const isRetryable = 
        calendarError.code === 429 || // Too Many Requests
        calendarError.code === 500 || // Internal Server Error
        calendarError.code === 503 || // Service Unavailable
        (calendarError.code! >= 400 && calendarError.code! < 500 && calendarError.code !== 401 && calendarError.code !== 403); // Retry most 4xx errors except auth issues
      
      // Handle rate limiting specifically
      if (calendarError.code === 429) {
        console.warn('Rate limit exceeded, cooling down');
        await new Promise(resolve => setTimeout(resolve, this.config.rateLimitDelay * 2));
      }
      
      // Retry if we have retries left and error is retryable
      if (retries < this.config.maxRetries && isRetryable) {
        const delay = this.config.retryDelay * Math.pow(2, retries);
        console.log(`Retrying operation, attempt ${retries + 1} of ${this.config.maxRetries}`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.executeWithRetry(operation, retries + 1);
      }
      
      // If we've exhausted retries or error is not retryable, throw it
      console.error('Calendar API operation failed after retries:', calendarError);
      throw calendarError;
    }
  }

  /**
   * Transform Google Calendar event to our CalendarEvent type
   * Safely converts Google Calendar API events to our application format
   */
  private transformEvent(event: calendar_v3.Schema$Event): CalendarEvent {
    if (!event) {
      console.error('Received null or undefined event');
      // Create a minimal valid event instead of throwing
      return {
        id: `generated-${Date.now()}`,
        summary: 'Invalid Event',
        start: new Date().toISOString(),
        end: new Date().toISOString()
      };
    }
    
    // Generate a UUID if ID is missing
    const id = event.id || `generated-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Normalize dates to ensure consistent format
    let startDate = event.start?.dateTime || event.start?.date;
    let endDate = event.end?.dateTime || event.end?.date;
    
    // Ensure dates are in ISO format
    if (startDate && !startDate.includes('T')) {
      // Convert YYYY-MM-DD to YYYY-MM-DDT00:00:00Z format
      startDate = `${startDate}T00:00:00Z`;
    }
    
    if (endDate && !endDate.includes('T')) {
      // Convert YYYY-MM-DD to YYYY-MM-DDT23:59:59Z format
      endDate = `${endDate}T23:59:59Z`;
    }
    
    if (!startDate || !endDate) {
      console.warn(`Event ${id} has missing date information`);
    }
    
    // Handle potentially null arrays
    const attendeesList = event.attendees || [];
    
    return {
      id,
      summary: event.summary || 'Untitled Event',
      description: event.description || undefined,
      start: startDate || new Date().toISOString(),
      end: endDate || new Date().toISOString(),
      location: event.location || undefined,
      creator: event.creator ? {
        email: event.creator.email || 'unknown@example.com',
        displayName: event.creator.displayName || undefined
      } : undefined,
      attendees: attendeesList.map(attendee => ({
        email: attendee.email || 'unknown@example.com',
        displayName: attendee.displayName || undefined,
        responseStatus: attendee.responseStatus || undefined
      })),
      recurringEventId: event.recurringEventId || undefined,
      colorId: event.colorId || undefined,
      status: event.status || undefined,
      htmlLink: event.htmlLink || undefined
    };
  }

  /**
   * Get list of user's calendars
   */
  async getCalendarList(accessToken: string): Promise<Array<{ id: string, summary: string }>> {
    return this.executeWithRetry(async () => {
      const calendar = await this.getCalendarClient(accessToken);
      const response = await calendar.calendarList.list();
      
      return (response.data.items || []).map(calendar => ({
        id: calendar.id!,
        summary: calendar.summary!
      }));
    });
  }

  /**
   * Fetch events from a calendar
   */
  async getEvents(
    accessToken: string, 
    params: {
      calendarId?: string,
      timeMin?: string,
      timeMax?: string,
      maxResults?: number,
      singleEvents?: boolean,
      orderBy?: string,
      q?: string
    } = {}
  ): Promise<CalendarEvent[]> {
    return this.executeWithRetry(async () => {
      const calendar = await this.getCalendarClient(accessToken);
      
      const response = await calendar.events.list({
        calendarId: params.calendarId || this.config.defaultCalendarId,
        timeMin: params.timeMin || new Date().toISOString(),
        timeMax: params.timeMax,
        maxResults: params.maxResults || 100,
        singleEvents: params.singleEvents !== undefined ? params.singleEvents : true,
        orderBy: params.orderBy || 'startTime',
        q: params.q
      });
      
      return (response.data.items || []).map(event => this.transformEvent(event));
    });
  }

  /**
   * Get a single event by ID
   */
  async getEvent(
    accessToken: string,
    eventId: string,
    calendarId?: string
  ): Promise<CalendarEvent> {
    return this.executeWithRetry(async () => {
      const calendar = await this.getCalendarClient(accessToken);
      
      const response = await calendar.events.get({
        calendarId: calendarId || this.config.defaultCalendarId,
        eventId
      });
      
      return this.transformEvent(response.data);
    });
  }

  /**
   * Create a new event
   */
  async createEvent(
    accessToken: string,
    event: Omit<CalendarEvent, 'id'>,
    calendarId?: string
  ): Promise<CalendarEvent> {
    return this.executeWithRetry(async () => {
      const calendar = await this.getCalendarClient(accessToken);
      
      // Transform our event format to Google's format
      const googleEvent: calendar_v3.Schema$Event = {
        summary: event.summary,
        description: event.description,
        start: {
          dateTime: typeof event.start === 'string' ? event.start : event.start.toISOString()
        },
        end: {
          dateTime: typeof event.end === 'string' ? event.end : event.end.toISOString()
        },
        location: event.location,
        attendees: event.attendees,
        colorId: event.colorId
      };
      
      const response = await calendar.events.insert({
        calendarId: calendarId || this.config.defaultCalendarId,
        requestBody: googleEvent,
        sendUpdates: 'all'
      });
      
      return this.transformEvent(response.data);
    });
  }

  /**
   * Update an existing event
   */
  async updateEvent(
    accessToken: string,
    eventId: string,
    event: Partial<Omit<CalendarEvent, 'id'>>,
    calendarId?: string
  ): Promise<CalendarEvent> {
    return this.executeWithRetry(async () => {
      const calendar = await this.getCalendarClient(accessToken);
      
      // Transform our event format to Google's format
      const googleEvent: calendar_v3.Schema$Event = {
        summary: event.summary,
        description: event.description,
        start: event.start ? {
          dateTime: typeof event.start === 'string' ? event.start : event.start.toISOString()
        } : undefined,
        end: event.end ? {
          dateTime: typeof event.end === 'string' ? event.end : event.end.toISOString()
        } : undefined,
        location: event.location,
        attendees: event.attendees,
        colorId: event.colorId
      };
      
      const response = await calendar.events.patch({
        calendarId: calendarId || this.config.defaultCalendarId,
        eventId,
        requestBody: googleEvent,
        sendUpdates: 'all'
      });
      
      return this.transformEvent(response.data);
    });
  }

  /**
   * Delete an event
   */
  async deleteEvent(
    accessToken: string,
    eventId: string,
    calendarId?: string
  ): Promise<boolean> {
    return this.executeWithRetry(async () => {
      const calendar = await this.getCalendarClient(accessToken);
      
      await calendar.events.delete({
        calendarId: calendarId || this.config.defaultCalendarId,
        eventId,
        sendUpdates: 'all'
      });
      
      return true;
    });
  }

  /**
   * Search for events
   */
  async searchEvents(
    accessToken: string,
    query: string,
    params: {
      calendarId?: string,
      timeMin?: string,
      timeMax?: string,
      maxResults?: number
    } = {}
  ): Promise<CalendarEvent[]> {
    return this.getEvents(accessToken, {
      ...params,
      q: query,
      orderBy: 'startTime',
      singleEvents: true
    });
  }

  /**
   * Get events for a specific date
   */
  async getEventsForDate(
    accessToken: string,
    date: Date,
    calendarId?: string
  ): Promise<CalendarEvent[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return this.getEvents(accessToken, {
      calendarId,
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: 'startTime'
    });
  }

  /**
   * Get events for a specific month
   */
  async getEventsForMonth(
    accessToken: string,
    year: number,
    month: number, // 0-11
    calendarId?: string
  ): Promise<CalendarEvent[]> {
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);
    
    return this.getEvents(accessToken, {
      calendarId,
      timeMin: startOfMonth.toISOString(),
      timeMax: endOfMonth.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 500 // Increased for monthly view
    });
  }

  /**
   * Handle token refresh if needed
   */
  async refreshTokenIfNeeded(refreshToken: string): Promise<string> {
    try {
      const credentials = await refreshAccessToken(refreshToken);
      if (!credentials.access_token) {
        throw new Error('Failed to refresh access token');
      }
      return credentials.access_token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }
}

const calendarService = new CalendarService();
export default calendarService;
