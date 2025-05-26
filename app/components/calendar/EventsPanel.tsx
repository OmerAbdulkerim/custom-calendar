'use client';

import React from 'react';
import { format } from 'date-fns';
import { CalendarEvent } from '@/app/services/calendarService';
import { formatEventTime } from '@/app/components/calendar/utils';
import DeleteEventButton from '@/app/components/calendar/DeleteEventButton';

interface EventsPanelProps {
  selectedDate: Date;
  events: CalendarEvent[];
  isLoading: boolean;
}

const EventsPanel: React.FC<EventsPanelProps> = ({ 
  selectedDate, 
  events, 
  isLoading 
}) => {
  // Show loading state for events panel
  if (isLoading) {
    return (
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 flex items-center justify-center min-h-[200px]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-gray-400">Loading events...</p>
        </div>
      </div>
    );
  }
  
  if (events.length === 0) {
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
        {events.map((event) => (
          <div key={event.id} className="p-4 border-b border-gray-800 last:border-0">
            <div className="flex justify-between items-start">
              <h3 className="text-white font-medium">{event.summary}</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">
                  {formatEventTime(event.start)} - {formatEventTime(event.end)}
                </span>
                <DeleteEventButton 
                  eventId={event.id} 
                  eventTitle={event.summary} 
                />
              </div>
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

export default EventsPanel;
