'use client';

import React from 'react';
import { format, isSameDay, addDays, subDays } from 'date-fns';
import { CalendarEvent } from '@/app/services/calendarService';
import { getEventColor } from '@/app/components/calendar/utils';

interface MonthRangeViewProps {
  currentDate: Date;
  selectedDate: Date;
  weeks: Date[][];
  rangeStartDate: Date;
  rangeEndDate: Date;
  events: CalendarEvent[];
  onDateSelect: (date: Date) => void;
  onDateChange: (date: Date) => void;
}

const MonthRangeView: React.FC<MonthRangeViewProps> = ({
  currentDate,
  selectedDate,
  weeks,
  rangeStartDate,
  rangeEndDate,
  events,
  onDateSelect,
  onDateChange
}) => {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-xl overflow-hidden">
      {/* Month Range Header */}
      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
        <h2 className="text-xl font-semibold text-white">
          {format(rangeStartDate, 'MMMM d')} - {format(rangeEndDate, 'MMMM d, yyyy')}
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={() => onDateChange(subDays(currentDate, 30))}
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
            onClick={() => onDateChange(addDays(currentDate, 30))}
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Week by week view */}
      <div className="divide-y divide-gray-800">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="">
            {/* Week Header */}
            <div className="bg-gray-900/30 p-2 border-b border-gray-800 flex">
              <div className="text-sm font-medium text-gray-400">
                Week of {format(week[0], 'MMM d')}
              </div>
            </div>
            
            {/* Week Grid */}
            <div className="grid grid-cols-7">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-1 text-center text-xs font-medium text-gray-500 border-b border-gray-800">
                  {day}
                </div>
              ))}
              
              {/* Days */}
              {week.map((day, dayIndex) => {
                // Filter events for this day
                const dayEvents = events.filter(event => {
                  const eventStart = new Date(event.start);
                  return isSameDay(eventStart, day);
                });
                
                const isSelected = isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <div 
                    key={dayIndex} 
                    className={`min-h-[80px] p-1 border border-gray-800 cursor-pointer
                      ${isSelected ? 'bg-gray-800' : 'hover:bg-gray-800/50'}
                      ${isToday ? 'ring-1 ring-indigo-500 ring-inset' : ''}`}
                    onClick={() => onDateSelect(day)}
                  >
                    <div className={`text-right mb-1 text-sm ${isToday ? 'text-indigo-400 font-semibold' : 'text-gray-400'}`}>
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div 
                          key={event.id} 
                          className={`px-1 py-0.5 text-xs truncate rounded border text-[10px] leading-tight ${getEventColor(event.colorId)}`}
                          title={event.summary}
                        >
                          {event.summary}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-[10px] text-gray-500">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonthRangeView;
