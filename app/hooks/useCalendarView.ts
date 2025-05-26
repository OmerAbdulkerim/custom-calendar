import { useState, useEffect, useCallback } from 'react';
import { 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  addDays,
  startOfWeek,
  endOfWeek,
  eachWeekOfInterval
} from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import { useCalendarQueries, calendarKeys } from '@/app/hooks/queries/useCalendarQueries';
import { useAuthenticatedFetch } from '@/app/hooks/useAuthenticatedFetch';
import { CalendarEvent } from '@/app/services/calendarService';
import { DateRangeOption } from '@/app/components/calendar';

export const useCalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'day'>('month');
  const [dateRange, setDateRange] = useState<DateRangeOption>('7-day');
  
  // For day view - calculate range dates based on selected option
  const [rangeStartDate, setRangeStartDate] = useState(new Date());
  const [rangeEndDate, setRangeEndDate] = useState(new Date());
  const [rangeDays, setRangeDays] = useState<Date[]>([]);
  const [weeks, setWeeks] = useState<Date[][]>([]);
  
  // Calendar query hooks
  const { 
    useEventsQuery,
    useMonthEventsQuery,
  } = useCalendarQueries();
  
  const queryClient = useQueryClient();
  
  // Query data based on the current view mode and date range
  const monthQuery = useMonthEventsQuery(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    viewMode === 'month'
  );
  
  const rangeQuery = useEventsQuery(
    rangeStartDate.toISOString(),
    rangeEndDate.toISOString(),
    viewMode === 'day' && !!rangeStartDate && !!rangeEndDate
  );
  
  // Consolidated events and loading states
  const events = viewMode === 'month' ? monthQuery.data || [] : rangeQuery.data || [];
  const isCalendarLoading = viewMode === 'month' ? monthQuery.isLoading : rangeQuery.isLoading;
  
  const [selectedDateEvents, setSelectedDateEvents] = useState<CalendarEvent[]>([]);
  
  // Compute month days for the calendar grid
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Initialize with default 7-day range on component mount
  useEffect(() => {
    handleDateRangeChange(dateRange);
  }, [currentDate, dateRange]);
  
  // Update selected date events when selectedDate changes
  useEffect(() => {
    const filteredEvents = events.filter((event: CalendarEvent) => {
      const eventStart = new Date(event.start);
      return isSameDay(eventStart, selectedDate);
    });
    
    setSelectedDateEvents(filteredEvents);
  }, [selectedDate, events]);
  
  // Get authenticated fetch for prefetching
  const { fetchWithAuth } = useAuthenticatedFetch();

  // Prefetch next month's data when month view is active
  useEffect(() => {
    if (viewMode === 'month') {
      // Calculate next month
      const nextMonth = new Date(currentDate);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      // Prefetch next month's data
      queryClient.prefetchQuery({
        queryKey: calendarKeys.month(nextMonth.getFullYear(), nextMonth.getMonth()),
        queryFn: async () => {
          const startOfNextMonth = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1);
          const endOfNextMonth = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0, 23, 59, 59, 999);
          
          const queryParams = new URLSearchParams();
          queryParams.append('timeMin', startOfNextMonth.toISOString());
          queryParams.append('timeMax', endOfNextMonth.toISOString());
          queryParams.append('singleEvents', 'true');
          queryParams.append('orderBy', 'startTime');
          queryParams.append('maxResults', '500');
          
          return fetchWithAuth(`/api/calendar/events?${queryParams.toString()}`);
        }
      });
    }
  }, [viewMode, currentDate, queryClient, fetchWithAuth]);
  
  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // If in day view with 1-day range, also update the current date
    if (viewMode === 'day' && dateRange === '1-day') {
      setCurrentDate(date);
    }
  };
  
  // Handle date range change
  const handleDateRangeChange = (range: DateRangeOption) => {
    setDateRange(range);
    
    if (range === '1-day') {
      // Single day view - set the range to cover the entire day
      const startOfDay = new Date(currentDate);
      startOfDay.setHours(0, 0, 0, 0); // Set to beginning of day (midnight)
      
      const endOfDay = new Date(currentDate);
      endOfDay.setHours(23, 59, 59, 999); // Set to end of day (23:59:59.999)
      
      setRangeStartDate(startOfDay);
      setRangeEndDate(endOfDay);
      setRangeDays([currentDate]);
    } else if (range === '7-day') {
      // Week view (7 days)
      const startDate = startOfWeek(currentDate, { weekStartsOn: 0 });
      const endDate = endOfWeek(currentDate, { weekStartsOn: 0 });
      
      setRangeStartDate(startDate);
      setRangeEndDate(endDate);
      
      // Create array of days for the week
      const days = [];
      let day = startDate;
      
      while (day <= endDate) {
        days.push(new Date(day));
        day = addDays(day, 1);
      }
      
      setRangeDays(days);
    } else if (range === '30-day') {
      // Month range view (30 days)
      // We'll use 4 weeks from the current date
      const startDate = currentDate;
      const endDate = addDays(startDate, 30);
      
      setRangeStartDate(startDate);
      setRangeEndDate(endDate);
      
      // Group days by week for 30-day view
      const weeksInRange = eachWeekOfInterval(
        { start: startDate, end: endDate },
        { weekStartsOn: 0 }
      );
      
      const weekGroups = weeksInRange.map(weekStart => {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });
        return eachDayOfInterval({ 
          start: weekStart, 
          end: weekEnd > endDate ? endDate : weekEnd 
        });
      });
      
      setWeeks(weekGroups);
    }
  };
  
  // Function to manually refresh data
  const refreshData = useCallback(async () => {
    // Invalidate and refetch the relevant queries based on view mode
    const promises = [];
    
    if (viewMode === 'month') {
      promises.push(
        queryClient.invalidateQueries({
          queryKey: calendarKeys.month(currentDate.getFullYear(), currentDate.getMonth())
        })
      );
    } else {
      promises.push(
        queryClient.invalidateQueries({
          queryKey: calendarKeys.dateRange(rangeStartDate.toISOString(), rangeEndDate.toISOString())
        })
      );
    }
    
    // Also invalidate all events to ensure everything is fresh
    promises.push(
      queryClient.invalidateQueries({
        queryKey: calendarKeys.events()
      })
    );
    
    // Wait for all invalidations to complete
    return Promise.all(promises);
  }, [viewMode, currentDate, rangeStartDate, rangeEndDate, queryClient]);

  // Function to refresh after event deletion
  const refreshAfterDelete = useCallback(async () => {
    // Immediately refresh the calendar data after event deletion
    return refreshData();
  }, [refreshData]);

  return {
    // State
    currentDate,
    selectedDate,
    viewMode,
    dateRange,
    events,
    selectedDateEvents,
    isCalendarLoading,
    isEventsLoading: monthQuery.isLoading || rangeQuery.isLoading,
    
    // Computed values
    monthDays,
    rangeStartDate,
    rangeEndDate,
    rangeDays,
    weeks,
    
    // Actions
    setCurrentDate,
    setViewMode,
    handleDateSelect,
    setDateRange: handleDateRangeChange,
    refreshData,
    refreshAfterDelete
  };
};
