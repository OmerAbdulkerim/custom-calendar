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
import { useCalendar } from '@/app/hooks/useCalendar';
import { CalendarEvent } from '@/app/services/calendarService';
import { DateRangeOption } from '@/app/components/calendar';

export const useCalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'day'>('month');
  const [dateRange, setDateRange] = useState<DateRangeOption>('7-day');
  
  // Calendar hooks
  const { 
    events, 
    isLoading: isCalendarLoading,
    fetchEvents,
    getEventsForMonth
  } = useCalendar();
  
  const [selectedDateEvents, setSelectedDateEvents] = useState<CalendarEvent[]>([]);
  const [isEventsLoading, setIsEventsLoading] = useState(false);
  
  // Compute month days for the calendar grid
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // For day view - calculate range dates based on selected option
  const [rangeStartDate, setRangeStartDate] = useState(new Date());
  const [rangeEndDate, setRangeEndDate] = useState(new Date());
  const [rangeDays, setRangeDays] = useState<Date[]>([]);
  const [weeks, setWeeks] = useState<Date[][]>([]);
  
  // Initialize with default 7-day range on component mount
  useEffect(() => {
    handleDateRangeChange(dateRange);
  }, [currentDate, dateRange]);
  
  // Update selected date events when selectedDate changes
  useEffect(() => {
    setIsEventsLoading(true);
    
    const filteredEvents = events.filter(event => {
      const eventStart = new Date(event.start);
      return isSameDay(eventStart, selectedDate);
    });
    
    setSelectedDateEvents(filteredEvents);
    setIsEventsLoading(false);
  }, [selectedDate, events]);
  
  // Fetch events for the current view range
  useEffect(() => {
    const fetchEventsForCurrentView = async () => {
      try {
        if (viewMode === 'month') {
          // For month view, load events for the entire month
          const year = currentDate.getFullYear();
          const month = currentDate.getMonth();
          await getEventsForMonth(year, month);
        } else {
          // For day view, fetch events based on the selected range
          await fetchEvents({
            timeMin: rangeStartDate.toISOString(),
            timeMax: rangeEndDate.toISOString(),
            singleEvents: true,
            orderBy: 'startTime'
          });
        }
      } catch (err) {
        console.error('Error fetching calendar events:', err);
      }
    };
    
    fetchEventsForCurrentView();
  }, [viewMode, currentDate, rangeStartDate, rangeEndDate, fetchEvents, getEventsForMonth]);
  
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
    if (isEventsLoading) return;
    
    try {
      setIsEventsLoading(true);
      
      if (viewMode === 'month') {
        // For month view, load events for the entire month
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        await getEventsForMonth(year, month);
      } else {
        // For day view, fetch events based on the selected range
        await fetchEvents({
          timeMin: rangeStartDate.toISOString(),
          timeMax: rangeEndDate.toISOString(),
          singleEvents: true,
          orderBy: 'startTime'
        });
      }

      // Update selected date events
      const filtered = events.filter(event => {
        const eventStart = new Date(event.start);
        return isSameDay(eventStart, selectedDate);
      });
      setSelectedDateEvents(filtered);
    } catch (err) {
      console.error('Error refreshing calendar data:', err);
    } finally {
      setIsEventsLoading(false);
    }
  }, [viewMode, currentDate, rangeStartDate, rangeEndDate, fetchEvents, getEventsForMonth, events, selectedDate, isEventsLoading]);

  // Function to refresh after event deletion
  const refreshAfterDelete = useCallback(() => {
    // Immediately refresh the calendar data after event deletion
    refreshData();
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
    isEventsLoading,
    
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
