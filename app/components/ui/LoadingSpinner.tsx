'use client';

import React from 'react';

type LoadingSize = 'sm' | 'md' | 'lg';
type LoadingVariant = 'primary' | 'white' | 'subtle';

interface LoadingSpinnerProps {
  size?: LoadingSize;
  variant?: LoadingVariant;
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

/**
 * Consistent loading spinner used throughout the application
 */
export default function LoadingSpinner({
  size = 'md',
  variant = 'primary',
  text,
  fullScreen = false,
  className = ''
}: LoadingSpinnerProps) {
  // Size classes for the spinner
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3'
  };
  
  // Color variants
  const variantClasses = {
    primary: 'border-b-indigo-500 border-l-indigo-500 border-r-indigo-300/30 border-t-indigo-300/30',
    white: 'border-b-white border-l-white border-r-white/30 border-t-white/30',
    subtle: 'border-b-gray-400 border-l-gray-400 border-r-gray-300/30 border-t-gray-300/30'
  };
  
  // Text classes
  const textClasses = {
    primary: 'text-indigo-500',
    white: 'text-white',
    subtle: 'text-gray-400'
  };
  
  const spinnerClasses = `animate-spin rounded-full ${sizeClasses[size]} ${variantClasses[variant]}`;
  
  // For fullscreen loading, show a centered spinner with backdrop
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm z-50">
        <div className="flex flex-col items-center">
          <div className={spinnerClasses}></div>
          {text && <span className={`mt-4 ${textClasses[variant]}`}>{text}</span>}
        </div>
      </div>
    );
  }
  
  // Inline loading spinner
  if (text) {
    return (
      <div className={`flex items-center ${className}`}>
        <div className={spinnerClasses}></div>
        <span className={`ml-3 ${textClasses[variant]}`}>{text}</span>
      </div>
    );
  }
  
  // Just the spinner
  return <div className={`${spinnerClasses} ${className}`}></div>;
}
