'use client';

import React from 'react';
import { addDays, subDays } from 'date-fns';
import { CalendarEvent } from '@/app/services/calendarService';
import { formatDate, DATE_FORMATS } from '@/app/utils/dateUtils';
import { filterEventsForDate } from '@/app/utils/eventUtils';
import CalendarEventItem from '@/app/components/calendar/CalendarEventItem';

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDateChange: (date: Date) => void;
}

const DayView: React.FC<DayViewProps> = ({
  currentDate,
  events,
  onDateChange
}) => {
  // Filter events for the current day
  const dayEvents = filterEventsForDate(events, currentDate);

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-xl overflow-hidden">
      {/* Day Header */}
      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
        <h2 className="text-xl font-semibold text-white">{formatDate(currentDate, DATE_FORMATS.DISPLAY_DAY)}</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => onDateChange(subDays(currentDate, 1))}
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={() => onDateChange(new Date())}
            className="px-3 py-1 text-sm bg-indigo-500/20 text-indigo-300 rounded-lg hover:bg-indigo-500/30 transition-colors"
          >
            Today
          </button>
          <button 
            onClick={() => onDateChange(addDays(currentDate, 1))}
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Day Events */}
      <div className="p-4">
        {events.length === 0 ? (
          <div className="text-gray-500 text-center py-10">
            No events scheduled for {formatDate(currentDate, DATE_FORMATS.DISPLAY_DATE)}
          </div>
        ) : (
          <div className="space-y-3">
            {dayEvents.length === 0 ? (
              <div className="text-gray-500 text-center py-10">
                No events scheduled for {formatDate(currentDate, DATE_FORMATS.DISPLAY_DATE)}
              </div>
            ) : (
              dayEvents.map(event => (
                <CalendarEventItem 
                  key={event.id}
                  event={event}
                  mode="detailed"
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DayView;
