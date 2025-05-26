'use client';

import React from 'react';
import { useCalendarView } from '@/app/hooks/useCalendarView';
import Layout from '@/app/components/layout/Layout';
import Link from 'next/link';

import {
  MonthView,
  DayView,
  WeekView,
  MonthRangeView,
  EventsPanel,
  DateRangeSelector,
  RefreshButton
} from '@/app/components/calendar';

export default function CalendarPage() {
  // Use our custom hook to manage all calendar state and logic
  const {
    currentDate,
    selectedDate,
    viewMode,
    dateRange,
    events,
    selectedDateEvents,
    isCalendarLoading,
    isEventsLoading,
    monthDays,
    rangeStartDate,
    rangeEndDate,
    weeks,
    setCurrentDate,
    setViewMode,
    handleDateSelect,
    setDateRange,
    refreshData
  } = useCalendarView();





  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6 flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
          <h1 className="text-2xl font-bold">Calendar</h1>
          
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
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
                onClick={() => {
                  setViewMode('day');
                  if (dateRange === '30-day') {
                    setDateRange('7-day');
                  }
                }}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'day' 
                    ? 'bg-indigo-500 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Day
              </button>
            </div>
            
            {/* Date range selector - only shown in day view */}
            {viewMode === 'day' && (
              <DateRangeSelector
                selectedRange={dateRange}
                onChange={(range) => setDateRange(range)}
              />
            )}
            
            {/* Refresh button */}
            <RefreshButton onRefresh={refreshData} />
            
            {/* Create Event button */}
            <Link
              href="/calendar/add"
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M12 4v16m8-8H4" 
                />
              </svg>
              Create Event
            </Link>
          </div>
        </div>
        
        {/* Full-page loading state - only shown during initial calendar load */}
        {isCalendarLoading && !events.length && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}
        
        {/* Calendar content */}
        {(!isCalendarLoading || events.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {/* Show loading overlay on calendar only during initial load */}
              <div className="relative">
                {viewMode === 'month' && (
                  <MonthView
                    currentDate={currentDate}
                    selectedDate={selectedDate}
                    monthDays={monthDays}
                    events={events}
                    onDateSelect={handleDateSelect}
                    onMonthChange={setCurrentDate}
                  />
                )}
                {viewMode === 'day' && dateRange === '1-day' && (
                  <DayView
                    currentDate={currentDate}
                    events={events}
                    onDateChange={setCurrentDate}
                  />
                )}
                {viewMode === 'day' && dateRange === '7-day' && (
                  <WeekView
                    currentDate={currentDate}
                    events={events}
                    onDateSelect={handleDateSelect}
                    onDateChange={setCurrentDate}
                  />
                )}
                {viewMode === 'day' && dateRange === '30-day' && (
                  <MonthRangeView
                    currentDate={currentDate}
                    selectedDate={selectedDate}
                    weeks={weeks}
                    rangeStartDate={rangeStartDate}
                    rangeEndDate={rangeEndDate}
                    events={events}
                    onDateSelect={handleDateSelect}
                    onDateChange={setCurrentDate}
                  />
                )}
                {isCalendarLoading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                  </div>
                )}
              </div>
            </div>
            <div>
              <EventsPanel
                selectedDate={selectedDate}
                events={selectedDateEvents}
                isLoading={isEventsLoading}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}