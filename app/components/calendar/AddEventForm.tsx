'use client';

import React, { useState } from 'react';
import { useCalendar } from '@/app/hooks/useCalendar';
import { addDays, format, parse, isValid as isDateValid, isBefore } from 'date-fns';

interface FormData {
  summary: string;
  description: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  colorId: string;
}

interface FormErrors {
  summary?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  timeRange?: string;
}

const INITIAL_FORM_DATA: FormData = {
  summary: '',
  description: '',
  location: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  startTime: format(new Date(), 'HH:mm'),
  endTime: format(addDays(new Date(), 1), 'HH:mm'),
  colorId: '1',
};

const COLOR_OPTIONS = [
  { id: '1', label: 'Blue', color: 'bg-blue-500' },
  { id: '2', label: 'Green', color: 'bg-emerald-500' },
  { id: '3', label: 'Yellow', color: 'bg-amber-500' },
  { id: '4', label: 'Red', color: 'bg-rose-500' },
  { id: '5', label: 'Purple', color: 'bg-purple-500' },
  { id: '6', label: 'Pink', color: 'bg-pink-500' },
  { id: '7', label: 'Indigo', color: 'bg-indigo-500' },
  { id: '8', label: 'Gray', color: 'bg-slate-500' },
  { id: '9', label: 'Orange', color: 'bg-orange-500' },
  { id: '10', label: 'Teal', color: 'bg-teal-500' },
];

export default function AddEventForm() {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  const { createEvent } = useCalendar();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isFormValid = true;

    // Validate summary (required)
    if (!formData.summary.trim()) {
      newErrors.summary = 'Event name is required';
      isFormValid = false;
    }

    // Validate date (required and must be valid)
    if (!formData.date) {
      newErrors.date = 'Date is required';
      isFormValid = false;
    } else {
      const parsedDate = parse(formData.date, 'yyyy-MM-dd', new Date());
      if (!isDateValid(parsedDate)) {
        newErrors.date = 'Invalid date format';
        isFormValid = false;
      }
    }

    // Validate start time (required)
    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
      isFormValid = false;
    }

    // Validate end time (required)
    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
      isFormValid = false;
    }

    // Validate time range (end time must be after start time)
    if (formData.startTime && formData.endTime && formData.date) {
      const startDateTime = parse(
        `${formData.date} ${formData.startTime}`,
        'yyyy-MM-dd HH:mm',
        new Date()
      );
      const endDateTime = parse(
        `${formData.date} ${formData.endTime}`,
        'yyyy-MM-dd HH:mm',
        new Date()
      );

      if (isDateValid(startDateTime) && isDateValid(endDateTime) && !isBefore(startDateTime, endDateTime)) {
        newErrors.timeRange = 'End time must be after start time';
        isFormValid = false;
      }
    }

    setErrors(newErrors);
    return isFormValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear specific error when field is changed
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    
    // Clear timeRange error if start or end time is changed
    if ((name === 'startTime' || name === 'endTime') && errors.timeRange) {
      setErrors(prev => ({ ...prev, timeRange: undefined }));
    }
    
    // Reset success and error messages when form is edited
    setIsSuccess(false);
    setApiError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset status
    setApiError(null);
    setIsSuccess(false);
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Format the date and time for the API
      const startDateTime = parse(
        `${formData.date} ${formData.startTime}`,
        'yyyy-MM-dd HH:mm',
        new Date()
      );
      
      const endDateTime = parse(
        `${formData.date} ${formData.endTime}`,
        'yyyy-MM-dd HH:mm',
        new Date()
      );
      
      // Create the event object
      const eventData = {
        summary: formData.summary,
        description: formData.description,
        location: formData.location,
        start: startDateTime.toISOString(),
        end: endDateTime.toISOString(),
        colorId: formData.colorId,
      };
      
      // Call the API to create the event
      await createEvent(eventData);
      
      // Show success message and reset form
      setIsSuccess(true);
      setFormData(INITIAL_FORM_DATA);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error creating event:', error);
      setApiError('Failed to create event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
      <h2 className="text-xl font-medium text-white mb-6">Add New Event</h2>
      
      {/* Success message */}
      {isSuccess && (
        <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-200">
          Event created successfully!
        </div>
      )}
      
      {/* Error message */}
      {apiError && (
        <div className="mb-4 p-3 bg-rose-500/20 border border-rose-500/30 rounded-lg text-rose-200">
          {apiError}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Event Name */}
        <div>
          <label htmlFor="summary" className="block text-sm font-medium text-gray-300 mb-1">
            Event Name*
          </label>
          <input
            type="text"
            id="summary"
            name="summary"
            value={formData.summary}
            onChange={handleChange}
            className={`w-full px-3 py-2 bg-gray-800 border ${
              errors.summary ? 'border-rose-500' : 'border-gray-700'
            } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            placeholder="Meeting with Team"
            disabled={isSubmitting}
          />
          {errors.summary && (
            <p className="mt-1 text-sm text-rose-500">{errors.summary}</p>
          )}
        </div>
        
        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Discuss project milestones and next steps"
            disabled={isSubmitting}
          />
        </div>
        
        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-1">
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Conference Room A or Google Meet"
            disabled={isSubmitting}
          />
        </div>
        
        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">
            Date*
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={`w-full px-3 py-2 bg-gray-800 border ${
              errors.date ? 'border-rose-500' : 'border-gray-700'
            } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            disabled={isSubmitting}
          />
          {errors.date && (
            <p className="mt-1 text-sm text-rose-500">{errors.date}</p>
          )}
        </div>
        
        {/* Time Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Time */}
          <div>
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-300 mb-1">
              Start Time*
            </label>
            <input
              type="time"
              id="startTime"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-gray-800 border ${
                errors.startTime ? 'border-rose-500' : 'border-gray-700'
              } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              disabled={isSubmitting}
            />
            {errors.startTime && (
              <p className="mt-1 text-sm text-rose-500">{errors.startTime}</p>
            )}
          </div>
          
          {/* End Time */}
          <div>
            <label htmlFor="endTime" className="block text-sm font-medium text-gray-300 mb-1">
              End Time*
            </label>
            <input
              type="time"
              id="endTime"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-gray-800 border ${
                errors.endTime ? 'border-rose-500' : 'border-gray-700'
              } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              disabled={isSubmitting}
            />
            {errors.endTime && (
              <p className="mt-1 text-sm text-rose-500">{errors.endTime}</p>
            )}
          </div>
        </div>
        
        {/* Time Range Error */}
        {errors.timeRange && (
          <p className="text-sm text-rose-500">{errors.timeRange}</p>
        )}
        
        {/* Color */}
        <div>
          <label htmlFor="colorId" className="block text-sm font-medium text-gray-300 mb-1">
            Color
          </label>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map(option => (
              <button
                key={option.id}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, colorId: option.id }))}
                className={`w-8 h-8 rounded-full ${option.color} ${
                  formData.colorId === option.id ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-800' : ''
                }`}
                title={option.label}
                disabled={isSubmitting}
                aria-label={`Set color to ${option.label}`}
              />
            ))}
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2 px-4 rounded-lg text-white font-medium transition-colors ${
              isSubmitting
                ? 'bg-indigo-600/50 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Event...
              </span>
            ) : (
              'Create Event'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
