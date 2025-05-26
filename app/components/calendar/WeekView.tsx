'use client';

import React from 'react';
import { format, isSameDay, addDays, subDays } from 'date-fns';
import { CalendarEvent } from '@/app/services/calendarService';
import { formatEventTime, getEventColor } from '@/app/components/calendar/utils';

interface WeekViewProps {
  currentDate: Date;
  rangeDays: Date[];
  rangeStartDate: Date;
  rangeEndDate: Date;
  events: CalendarEvent[];
  onDateSelect: (date: Date) => void;
  onDateChange: (date: Date) => void;
}

const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  rangeDays,
  rangeStartDate,
  rangeEndDate,
  events,
  onDateSelect,
  onDateChange
}) => {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-xl overflow-hidden">
      {/* Week Header */}
      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
        <h2 className="text-xl font-semibold text-white">
          {format(rangeStartDate, 'MMM d')} - {format(rangeEndDate, 'MMM d, yyyy')}
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={() => onDateChange(subDays(currentDate, 7))}
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
            onClick={() => onDateChange(addDays(currentDate, 7))}
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 bg-gray-900/50 border-b border-gray-800">
        {rangeDays.map((day, i) => (
          <div 
            key={i}
            className={`p-2 text-center border-r border-gray-800 last:border-r-0 ${isSameDay(day, new Date()) ? 'bg-gray-800/50' : ''}`}
          >
            <div className="text-sm font-medium text-gray-400">{format(day, 'EEE')}</div>
            <div className={`text-lg mt-1 ${isSameDay(day, new Date()) ? 'text-indigo-400 font-semibold' : 'text-gray-300'}`}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      {/* Week Events */}
      <div className="grid grid-cols-7 min-h-[300px] bg-gray-900">
        {rangeDays.map((day, i) => {
          // Filter events for this day
          const dayEvents = events.filter(event => {
            const eventStart = new Date(event.start);
            return isSameDay(eventStart, day);
          });
          
          return (
            <div 
              key={i} 
              className={`min-h-[150px] p-2 border-r border-gray-800 last:border-r-0 ${isSameDay(day, new Date()) ? 'bg-gray-800/30' : ''}`}
              onClick={() => onDateSelect(day)}
            >
              <div className="space-y-1">
                {dayEvents.map((event) => (
                  <div 
                    key={event.id} 
                    className={`px-2 py-1 text-xs truncate rounded-lg border ${getEventColor(event.colorId)}`}
                    title={event.summary}
                  >
                    {formatEventTime(event.start)} {event.summary}
                  </div>
                ))}
                {dayEvents.length === 0 && (
                  <div className="text-xs text-gray-500 h-4"></div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeekView;
