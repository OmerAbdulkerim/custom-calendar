'use client';

import React from 'react';
import { format, isSameDay } from 'date-fns';
import { CalendarEvent } from '@/app/services/calendarService';
import { formatEventTime, getEventColor } from '@/app/components/calendar/utils';

interface MonthViewProps {
  currentDate: Date;
  selectedDate: Date;
  monthDays: Date[];
  events: CalendarEvent[];
  onDateSelect: (date: Date) => void;
  onMonthChange: (date: Date) => void;
}

const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  selectedDate,
  monthDays,
  events,
  onDateSelect,
  onMonthChange
}) => {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-xl overflow-hidden">
      {/* Month Header */}
      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
        <h2 className="text-xl font-semibold text-white">{format(currentDate, 'MMMM yyyy')}</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => onMonthChange(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={() => onMonthChange(new Date())}
            className="px-3 py-1 text-sm bg-indigo-500/20 text-indigo-300 rounded-lg hover:bg-indigo-500/30 transition-colors"
          >
            Today
          </button>
          <button 
            onClick={() => onMonthChange(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
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
              onClick={() => onDateSelect(day)}
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

export default MonthView;
