'use client';

import React from 'react';
import { startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { CalendarEvent } from '@/app/services/calendarService';
import { formatDate, DATE_FORMATS } from '@/app/utils/dateUtils';
import { filterEventsForDate } from '@/app/utils/eventUtils';
import CalendarEventItem from '@/app/components/calendar/CalendarEventItem';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner';

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDateSelect: (date: Date) => void;
  onDateChange: (date: Date) => void;
  isLoading?: boolean;
}

const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  events,
  onDateSelect,
  onDateChange,
  isLoading = false
}) => {
  // Calculate week range
  const startDate = startOfWeek(currentDate, { weekStartsOn: 0 });
  const endDate = endOfWeek(currentDate, { weekStartsOn: 0 });
  const daysOfWeek = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-xl overflow-hidden">
      {/* Week Header */}
      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
        <h2 className="text-xl font-semibold text-white">
          {formatDate(startDate, DATE_FORMATS.DISPLAY_SHORT)} - {formatDate(endDate, DATE_FORMATS.DISPLAY_DATE)}
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={() => onDateChange(subWeeks(currentDate, 1))}
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={() => onDateChange(new Date())}
            className="px-3 py-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            Today
          </button>
          <button 
            onClick={() => onDateChange(addWeeks(currentDate, 1))}
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Week Events */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <LoadingSpinner size="lg" text="Loading events..." />
          </div>
        ) : (
          <div className="grid grid-cols-7 min-h-[400px]">
            {daysOfWeek.map((day, index) => {
              const dayEvents = filterEventsForDate(events, day);
              const isToday = isSameDay(day, new Date());
              
              return (
                <div 
                  key={index} 
                  className={`border-r border-gray-800 last:border-r-0 ${isToday ? 'bg-gray-800/30' : ''}`}
                  onClick={() => onDateSelect(day)}
                >
                  {/* Day header */}
                  <div className={`p-2 text-center border-b border-gray-800 ${isToday ? 'bg-indigo-600/20' : ''}`}>
                    <div className="text-sm font-medium text-gray-400">{formatDate(day, DATE_FORMATS.WEEKDAY_SHORT)}</div>
                    <div className={`text-lg ${isToday ? 'text-indigo-400 font-semibold' : 'text-gray-300'}`}>
                      {formatDate(day, DATE_FORMATS.DAY_NUM)}
                    </div>
                  </div>
                  
                  {/* Day events */}
                  <div className="p-2 space-y-1 min-h-[120px]">
                    {dayEvents.length === 0 ? (
                      <div className="text-xs text-gray-500 text-center pt-2">No events</div>
                    ) : (
                      dayEvents.map(event => (
                        <CalendarEventItem 
                          key={event.id}
                          event={event}
                          mode="compact"
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeekView;
