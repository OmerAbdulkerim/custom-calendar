/* eslint-disable @typescript-eslint/no-explicit-any */

/* 
 * Utility functions for API response handling 
 * Provides consistent patterns for success, error, and validation responses
 */

import { NextResponse } from 'next/server';

// Define the structure of our API responses
export type ApiResponseBody<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  warning?: string;
  validationErrors?: Record<string, string>;
};

/**
 * Creates a standardized success response
 */
export function successResponse<T>(data: T, status = 200, warning?: string): NextResponse {
  return NextResponse.json(
    { 
      success: true, 
      data,
      ...(warning ? { warning } : {})
    }, 
    { status }
  );
}

/**
 * Creates a standardized error response
 */
export function errorResponse(
  message: string, 
  status = 500, 
  additionalData: Record<string, any> = {}
): NextResponse {
  return NextResponse.json(
    { 
      success: false, 
      error: message,
      ...additionalData
    }, 
    { status }
  );
}

/**
 * Creates a standardized validation error response
 */
export function validationErrorResponse(
  errors: Record<string, string>
): NextResponse {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Validation failed',
      validationErrors: errors
    }, 
    { status: 400 }
  );
}

/**
 * Creates a standardized authentication error response
 */
export function authErrorResponse(
  message = 'Authentication required'
): NextResponse {
  return NextResponse.json(
    { 
      success: false, 
      error: message
    }, 
    { status: 401 }
  );
}

/**
 * Standard error handler for API routes
 * Converts different error types to appropriate responses
 */
export function handleApiError(error: any): NextResponse {
  console.error('API Error:', error);

  // Authentication errors
  if (error.code === 401 || error.status === 401 || 
      error.code === 403 || error.status === 403) {
    return errorResponse(
      error.message || 'Authentication failed', 
      401
    );
  }

  // Not found errors
  if (error.code === 404 || error.status === 404 || 
      (error.message && error.message.includes('404'))) {
    return errorResponse(
      error.message || 'Resource not found', 
      404
    );
  }

  // Rate limit errors
  if (error.code === 429 || error.status === 429) {
    return errorResponse(
      'Rate limit exceeded. Please try again later.',
      429
    );
  }

  // Default to 500 server error
  return errorResponse(
    error.message || 'An unexpected error occurred', 
    500
  );
}
