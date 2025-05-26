/**
 * Date utilities for consistent date handling across the application
 */

import { 
  format, 
  parse, 
  isValid, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek,
  addDays
} from 'date-fns';

/**
 * Standard date formats used throughout the application
 */
export const DATE_FORMATS = {
  API_DATE: 'yyyy-MM-dd',
  API_DATETIME: "yyyy-MM-dd'T'HH:mm:ssxxx",
  DISPLAY_DATE: 'MMMM d, yyyy',
  DISPLAY_DATE_SHORT: 'MMM d, yyyy',
  DISPLAY_SHORT: 'MMM d',  // Short format for date ranges
  DISPLAY_TIME: 'h:mm a',
  DISPLAY_MONTH: 'MMMM yyyy',
  DISPLAY_DAY: 'EEEE, MMMM d, yyyy',
  WEEKDAY_SHORT: 'EEE',    // Short weekday name
  DAY_NUM: 'd',            // Day number only
  INPUT_DATE: 'yyyy-MM-dd',
  INPUT_TIME: 'HH:mm',
};

/**
 * Format a date for display
 */
export function formatDate(date: Date | string, formatStr = DATE_FORMATS.DISPLAY_DATE): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (!isValid(dateObj)) return 'Invalid date';
  
  return format(dateObj, formatStr);
}

/**
 * Format event time consistently
 */
export function formatEventTime(time: Date | string): string {
  if (!time) return '';
  
  const timeObj = typeof time === 'string' ? new Date(time) : time;
  
  if (!isValid(timeObj)) return 'Invalid time';
  
  return format(timeObj, DATE_FORMATS.DISPLAY_TIME);
}

/**
 * Parse a date string to a Date object with validation
 */
export function parseDate(dateString: string, formatStr = DATE_FORMATS.API_DATE): Date | null {
  if (!dateString) return null;
  
  try {
    const parsedDate = parse(dateString, formatStr, new Date());
    return isValid(parsedDate) ? parsedDate : null;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
}

/**
 * Get days for a month view (for the calendar grid)
 */
export function getMonthDays(date: Date): Date[] {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  
  // Get start of calendar (previous month's visible days)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  
  // Get end of calendar (next month's visible days)
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  
  // Create array of all days to display
  const days: Date[] = [];
  let day = calendarStart;
  
  while (day <= calendarEnd) {
    days.push(new Date(day));
    day = addDays(day, 1);
  }
  
  return days;
}

/**
 * Get days for a specified range (e.g., 7-day view)
 */
export function getRangeDays(startDate: Date, endDate: Date): Date[] {
  const days: Date[] = [];
  let day = startDate;
  
  while (day <= endDate) {
    days.push(new Date(day));
    day = addDays(day, 1);
  }
  
  return days;
}

/**
 * Get weeks for a month range view
 */
export function getWeeksInRange(startDate: Date, endDate: Date): Date[][] {
  const weeksInRange = [];
  let currentWeekStart = startOfWeek(startDate, { weekStartsOn: 0 });
  
  while (currentWeekStart <= endDate) {
    const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 0 });
    const adjustedWeekEnd = weekEnd > endDate ? endDate : weekEnd;
    
    const daysInWeek = [];
    let day = currentWeekStart;
    
    while (day <= adjustedWeekEnd) {
      daysInWeek.push(new Date(day));
      day = addDays(day, 1);
    }
    
    weeksInRange.push(daysInWeek);
    currentWeekStart = addDays(weekEnd, 1);
  }
  
  return weeksInRange;
}
