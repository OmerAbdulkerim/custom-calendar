'use client';

import React from 'react';
import { CalendarEvent } from '@/app/services/calendarService';
import { formatEventTime } from '@/app/utils/dateUtils';
import { getEventColor } from '@/app/components/calendar/utils';
import DeleteEventButton from '@/app/components/calendar/DeleteEventButton';

export type EventDisplayMode = 'compact' | 'detailed' | 'minimal';

interface CalendarEventItemProps {
  event: CalendarEvent;
  mode?: EventDisplayMode;
  onEventClick?: (event: CalendarEvent) => void;
  className?: string;
}

/**
 * Reusable calendar event component that can be displayed in different modes
 * - compact: Used in week/month views (time + title + delete button)
 * - detailed: Used in day view or events panel (all details)
 * - minimal: Used in month view with very limited space (just title)
 */
export default function CalendarEventItem({
  event,
  mode = 'detailed',
  onEventClick,
  className = ''
}: CalendarEventItemProps) {
  const eventColor = getEventColor(event.colorId);
  
  const handleClick = () => {
    if (onEventClick) {
      onEventClick(event);
    }
  };

  // Minimal view (just title, used in month view with limited space)
  if (mode === 'minimal') {
    return (
      <div 
        className={`px-1.5 py-0.5 text-[10px] rounded truncate ${eventColor} ${className}`}
        onClick={handleClick}
        title={`${event.summary} (${formatEventTime(event.start)} - ${formatEventTime(event.end)})`}
      >
        {event.summary}
      </div>
    );
  }
  
  // Compact view (used in week view)
  if (mode === 'compact') {
    return (
      <div 
        className={`px-2 py-1 text-xs rounded-lg border ${eventColor} flex items-center justify-between gap-1 group ${className}`}
        onClick={handleClick}
        title={event.summary}
      >
        <div className="truncate">
          {formatEventTime(event.start)} {event.summary}
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <DeleteEventButton 
            eventId={event.id} 
            eventTitle={event.summary} 
            size="sm"
          />
        </div>
      </div>
    );
  }
  
  // Detailed view (default, used in day view and events panel)
  return (
    <div 
      className={`p-4 rounded-lg border ${eventColor} ${className}`}
      onClick={handleClick}
    >
      <div className="flex justify-between items-start">
        <h4 className="font-medium text-white">{event.summary}</h4>
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
  );
}
