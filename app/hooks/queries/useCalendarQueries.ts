'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarEvent } from '@/app/services/calendarService';
import { useAuthenticatedFetch } from '@/app/hooks/useAuthenticatedFetch';

// Query keys for better cache management
export const calendarKeys = {
  all: ['calendar'] as const,
  events: () => [...calendarKeys.all, 'events'] as const,
  event: (id: string) => [...calendarKeys.events(), id] as const,
  month: (year: number, month: number) => [...calendarKeys.events(), 'month', year, month] as const,
  dateRange: (startDate: string, endDate: string) => [...calendarKeys.events(), 'range', startDate, endDate] as const,
};

export function useCalendarQueries() {
  const { fetchWithAuth, isLoading: isFetchLoading } = useAuthenticatedFetch();
  const queryClient = useQueryClient();

  // Get events for a date range
  const useEventsQuery = (timeMin?: string, timeMax?: string, enabled = true) => {
    return useQuery({
      queryKey: timeMin && timeMax ? calendarKeys.dateRange(timeMin, timeMax) : calendarKeys.events(),
      queryFn: async () => {
        const queryParams = new URLSearchParams();
        if (timeMin) queryParams.append('timeMin', timeMin);
        if (timeMax) queryParams.append('timeMax', timeMax);
        queryParams.append('singleEvents', 'true');
        queryParams.append('orderBy', 'startTime');
        
        const url = `/api/calendar/events?${queryParams.toString()}`;
        return fetchWithAuth(url);
      },
      enabled: enabled && !!fetchWithAuth && !isFetchLoading,
    });
  };

  // Get events for a specific month
  const useMonthEventsQuery = (year: number, month: number, enabled = true) => {
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);
    
    return useQuery({
      queryKey: calendarKeys.month(year, month),
      queryFn: async () => {
        const queryParams = new URLSearchParams();
        queryParams.append('timeMin', startOfMonth.toISOString());
        queryParams.append('timeMax', endOfMonth.toISOString());
        queryParams.append('singleEvents', 'true');
        queryParams.append('orderBy', 'startTime');
        queryParams.append('maxResults', '500');
        
        const url = `/api/calendar/events?${queryParams.toString()}`;
        return fetchWithAuth(url);
      },
      enabled: enabled && !!fetchWithAuth && !isFetchLoading,
    });
  };

  // Get a single event
  const useEventQuery = (eventId: string, enabled = true) => {
    return useQuery({
      queryKey: calendarKeys.event(eventId),
      queryFn: async () => {
        const url = `/api/calendar/events/${eventId}`;
        return fetchWithAuth(url);
      },
      enabled: enabled && !!fetchWithAuth && !!eventId && !isFetchLoading,
    });
  };

  // Create event mutation
  const useCreateEventMutation = () => {
    return useMutation({
      mutationFn: async (eventData: Omit<CalendarEvent, 'id'>) => {
        return fetchWithAuth('/api/calendar/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        });
      },
      onSuccess: () => {
        // Invalidate queries to refetch data
        queryClient.invalidateQueries({ queryKey: calendarKeys.events() });
      },
    });
  };

  // Delete event mutation with optimistic updates
  const useDeleteEventMutation = () => {
    return useMutation({
      mutationFn: async (eventId: string) => {
        return fetchWithAuth(`/api/calendar/events/${eventId}`, {
          method: 'DELETE',
        });
      },
      onMutate: async (eventId) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries({ queryKey: calendarKeys.events() });
        
        // Snapshot the previous events
        const previousEvents = queryClient.getQueryData(calendarKeys.events()) || [];
        
        // Optimistically update to the new value by removing the deleted event
        queryClient.setQueryData(calendarKeys.events(), (old: CalendarEvent[] = []) => 
          old.filter(event => event.id !== eventId)
        );
        
        // Return context with the previous value
        return { previousEvents };
      },
      onError: (err, eventId, context) => {
        // If the mutation fails, use the context to roll back
        if (context?.previousEvents) {
          queryClient.setQueryData(calendarKeys.events(), context.previousEvents);
        }
        console.error(`Error deleting event ${eventId}:`, err);
      },
      onSettled: () => {
        // Always refetch after error or success
        queryClient.invalidateQueries({ queryKey: calendarKeys.events() });
      },
    });
  };

  // Update event mutation
  const useUpdateEventMutation = () => {
    return useMutation({
      mutationFn: async ({ eventId, data }: { eventId: string; data: Partial<CalendarEvent> }) => {
        return fetchWithAuth(`/api/calendar/events/${eventId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      },
      onSuccess: (_, variables) => {
        // Invalidate specific event and events list
        queryClient.invalidateQueries({ queryKey: calendarKeys.event(variables.eventId) });
        queryClient.invalidateQueries({ queryKey: calendarKeys.events() });
      },
    });
  };

  return {
    useEventsQuery,
    useMonthEventsQuery,
    useEventQuery,
    useCreateEventMutation,
    useDeleteEventMutation,
    useUpdateEventMutation,
  };
}
