/**
 * Utility functions for working with calendar events
 */

import { CalendarEvent } from '@/app/services/calendarService';
import { isSameDay } from 'date-fns';

/**
 * Get the appropriate CSS classes for event colors
 * Used consistently across all calendar views
 */
export const getEventColor = (colorId?: string): string => {
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

/**
 * Filter events for a specific date
 */
export function filterEventsForDate(events: CalendarEvent[], date: Date): CalendarEvent[] {
  return events.filter(event => {
    const eventStart = new Date(event.start);
    return isSameDay(eventStart, date);
  });
}

/**
 * Sort events chronologically
 */
export function sortEventsByTime(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort((a, b) => {
    const aStart = new Date(a.start).getTime();
    const bStart = new Date(b.start).getTime();
    return aStart - bStart;
  });
}

/**
 * Group events by day for calendar views
 */
export function groupEventsByDay(events: CalendarEvent[], days: Date[]): Record<string, CalendarEvent[]> {
  const eventsByDay: Record<string, CalendarEvent[]> = {};
  
  // Initialize empty arrays for each day
  days.forEach(day => {
    const dateKey = day.toISOString().split('T')[0];
    eventsByDay[dateKey] = [];
  });
  
  // Add events to the appropriate day
  events.forEach(event => {
    const eventDate = new Date(event.start);
    const dateKey = eventDate.toISOString().split('T')[0];
    
    if (eventsByDay[dateKey]) {
      eventsByDay[dateKey].push(event);
    }
  });
  
  // Sort events in each day
  Object.keys(eventsByDay).forEach(key => {
    eventsByDay[key] = sortEventsByTime(eventsByDay[key]);
  });
  
  return eventsByDay;
}
