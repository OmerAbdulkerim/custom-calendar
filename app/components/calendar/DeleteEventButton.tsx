'use client';

import React, { useState } from 'react';
import { useCalendarQueries } from '@/app/hooks/queries/useCalendarQueries';
import ConfirmationDialog from '@/app/components/ui/ConfirmationDialog';

interface DeleteEventButtonProps {
  eventId: string;
  eventTitle: string;
  onDeleteSuccess?: () => void;
  size?: 'sm' | 'md';
  variant?: 'icon' | 'button';
}

export default function DeleteEventButton({
  eventId,
  eventTitle,
  onDeleteSuccess,
  size = 'sm',
  variant = 'icon'
}: DeleteEventButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { useDeleteEventMutation } = useCalendarQueries();
  const deleteEventMutation = useDeleteEventMutation();
  
  // Track the mutation status
  const isDeleting = deleteEventMutation.isPending;

  const handleDelete = async () => {
    try {
      // Try to delete the event using the mutation
      await deleteEventMutation.mutateAsync(eventId);
      setIsDialogOpen(false);
      
      // Call custom success handler if provided
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } catch (err) {
      console.error('Failed to delete event:', err);
      
      // The error handling is now managed by the mutation's onError callback
      // Just close the dialog for any error
      setIsDialogOpen(false);
    }
  };

  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6'
  };

  return (
    <>
      {variant === 'icon' ? (
        <button
          type="button"
          onClick={() => setIsDialogOpen(true)}
          className="text-gray-400 hover:text-rose-500 transition-colors p-1 rounded-full hover:bg-gray-800"
          aria-label={`Delete event: ${eventTitle}`}
          title="Delete event"
        >
          <svg
            className={sizeClasses[size]}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-1.5 text-sm text-gray-200 hover:text-rose-500 transition-colors px-2 py-1 rounded hover:bg-gray-800"
          aria-label={`Delete event: ${eventTitle}`}
        >
          <svg
            className={sizeClasses[size]}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          Delete
        </button>
      )}

      <ConfirmationDialog
        isOpen={isDialogOpen}
        title="Delete Event"
        message={`Are you sure you want to delete "${eventTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setIsDialogOpen(false)}
        isLoading={isDeleting}
        variant="danger"
      />
    </>
  );
}
