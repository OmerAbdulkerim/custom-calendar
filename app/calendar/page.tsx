'use client';

import React, { useEffect, useState } from 'react';
import { useCalendar } from '@/app/hooks/useCalendar';
import { CalendarEvent } from '@/app/services/calendarService';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { events, isLoading: isCalendarLoading, error, getEventsForDate, getEventsForMonth } = useCalendar();
  const [monthDays, setMonthDays] = useState<Date[]>([]);
  const [selectedDateEvents, setSelectedDateEvents] = useState<CalendarEvent[]>([]);
  const [isEventsLoading, setIsEventsLoading] = useState(false);

  // Fetch events based on current view
  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        if (viewMode === 'day') {
          await getEventsForDate(selectedDate);
        } else if (viewMode === 'month') {
          const year = currentDate.getFullYear();
          const month = currentDate.getMonth();
          await getEventsForMonth(year, month);
          
          // Generate days for the month view
          const start = startOfMonth(currentDate);
          const end = endOfMonth(currentDate);
          setMonthDays(eachDayOfInterval({ start, end }));
        }
      } catch (err) {
        console.error('Error fetching calendar data:', err);
      }
    };

    fetchCalendarData();
  }, [viewMode, selectedDate, currentDate, getEventsForDate, getEventsForMonth]);

  // Handle date selection
  const handleDateSelect = async (date: Date) => {
    setSelectedDate(date);
    setIsEventsLoading(true);
    
    try {
      if (viewMode === 'month') {
        // First check if we already have events for this date in our cached events
        const dayEvents = events.filter(event => {
          const eventStart = new Date(event.start);
          return isSameDay(eventStart, date);
        });
        
        // If we have events, use them immediately
        setSelectedDateEvents(dayEvents);
        
        // Then fetch fresh events for this date to ensure we have the latest data
        const freshEvents = await getEventsForDate(date);
        
        // Filter events specifically for the selected date
        const freshDayEvents = freshEvents.filter(event => {
          const eventStart = new Date(event.start);
          return isSameDay(eventStart, date);
        });
        
        setSelectedDateEvents(freshDayEvents);
      }
    } catch (error) {
      console.error('Error fetching events for selected date:', error);
    } finally {
      setIsEventsLoading(false);
    }
  };

  // Format event time for display
  const formatEventTime = (dateString: string | Date) => {
    const date = new Date(dateString);
    return format(date, 'h:mm a');
  };

  // Get event color based on colorId
  const getEventColor = (colorId?: string) => {
    const colors: Record<string, string> = {
      '1': 'bg-blue-400/20 text-blue-200 border-blue-500/30',
      '2': 'bg-emerald-400/20 text-emerald-200 border-emerald-500/30',
      '3': 'bg-amber-400/20 text-amber-200 border-amber-500/30',
      '4': 'bg-rose-400/20 text-rose-200 border-rose-500/30',
      '5': 'bg-purple-400/20 text-purple-200 border-purple-500/30',
      '6': 'bg-pink-400/20 text-pink-200 border-pink-500/30',
      '7': 'bg-indigo-400/20 text-indigo-200 border-indigo-500/30',
      '8': 'bg-slate-400/20 text-slate-200 border-slate-500/30',
      '9': 'bg-orange-400/20 text-orange-200 border-orange-500/30',
      '10': 'bg-teal-400/20 text-teal-200 border-teal-500/30',
    };
    
    return colors[colorId || '1'] || 'bg-blue-400/20 text-blue-200 border-blue-500/30';
  };

  // Render month view
  const renderMonthView = () => {
    return (
      <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-xl overflow-hidden">
        {/* Month Header */}
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
          <h2 className="text-xl font-semibold text-white">{format(currentDate, 'MMMM yyyy')}</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1 text-sm bg-indigo-500/20 text-indigo-300 rounded-lg hover:bg-indigo-500/30 transition-colors"
            >
              Today
            </button>
            <button 
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 bg-gray-900">
          {/* Day Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-400 border-b border-gray-800">
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {monthDays.map((day, i) => {
            // Find events for this day
            const dayEvents = events.filter(event => {
              const eventStart = new Date(event.start);
              return isSameDay(eventStart, day);
            });
            
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            
            return (
              <div 
                key={i} 
                className={`min-h-[120px] p-2 bg-gray-900 border-gray-800 border transition-colors cursor-pointer
                  ${isSelected ? 'bg-gray-800' : 'hover:bg-gray-800/50'}`}
                onClick={() => handleDateSelect(day)}
              >
                <div className={`text-right mb-2 ${isToday ? 'bg-indigo-500 text-white rounded-full w-8 h-8 flex items-center justify-center ml-auto' : 'text-gray-400'}`}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div 
                      key={event.id} 
                      className={`px-2 py-1 text-xs truncate rounded-lg border ${getEventColor(event.colorId)}`}
                      title={event.summary}
                    >
                      {formatEventTime(event.start)} {event.summary}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 px-2">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render selected date events
  const renderSelectedDateEvents = () => {
    // Show loading state for events panel
    if (isEventsLoading) {
      return (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 flex items-center justify-center min-h-[200px]">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
            <p className="text-gray-400">Loading events...</p>
          </div>
        </div>
      );
    }
    
    if (selectedDateEvents.length === 0) {
      return (
        <div className="text-gray-400 py-4 text-center bg-gray-900 rounded-xl border border-gray-800 p-6">
          No events scheduled for {format(selectedDate, 'MMMM d, yyyy')}
        </div>
      );
    }

    return (
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h3 className="font-medium text-white mb-4">Events on {format(selectedDate, 'MMMM d, yyyy')}</h3>
        <div className="space-y-3">
          {selectedDateEvents.map((event) => (
            <div 
              key={event.id} 
              className="p-4 rounded-lg border bg-gray-800/50 border-gray-700"
            >
              <div className="flex justify-between items-start">
                <h4 className="font-medium text-white">{event.summary}</h4>
                <span className="text-sm text-gray-400">
                  {formatEventTime(event.start)} - {formatEventTime(event.end)}
                </span>
              </div>
              {event.description && (
                <p className="text-sm text-gray-300 mt-2">{event.description}</p>
              )}
              {event.location && (
                <p className="text-sm text-gray-400 mt-2 flex items-center gap-2">
                  <span className="text-gray-300">Location:</span> {event.location}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Calendar</h1>
          
          {/* View controls */}
          <div className="flex gap-2">
            <button 
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'month' 
                  ? 'bg-indigo-500 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Month
            </button>
            <button 
              onClick={() => setViewMode('day')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'day' 
                  ? 'bg-indigo-500 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Day
            </button>
          </div>
        </div>
        
        {/* Full-page loading state - only shown during initial calendar load */}
        {isCalendarLoading && !events.length && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}
        
        {/* Error state */}
        {error && (
          <div className="bg-rose-500/20 text-rose-200 p-6 rounded-xl border border-rose-500/30">
            Error loading calendar data. Please try again later.
          </div>
        )}
        
        {/* Calendar content - always visible once loaded, even during event loading */}
        {(!isCalendarLoading || events.length > 0) && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {/* Show loading overlay on calendar only during initial load */}
              <div className="relative">
                {viewMode === 'month' && renderMonthView()}
                {isCalendarLoading && events.length > 0 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                  </div>
                )}
              </div>
            </div>
            <div>
              {renderSelectedDateEvents()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}