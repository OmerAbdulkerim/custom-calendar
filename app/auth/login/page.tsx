'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LoginButton from '@/app/components/auth/LoginButton';
import { useAuth } from '@/app/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();
  const returnUrl = searchParams.get('returnUrl') || '/dashboard';
  
  // If user is already authenticated, redirect to returnUrl or dashboard
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push(returnUrl);
    }
  }, [isAuthenticated, isLoading, router, returnUrl]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome to Custom Calendar
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please sign in to continue
          </p>
          {returnUrl !== '/dashboard' && (
            <p className="mt-2 text-xs text-blue-600">
              {`You'll be redirected back to your requested page after login`}
            </p>
          )}
        </div>
        
        <div className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm">
            {isLoading ? (
              <div className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md bg-gray-200">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700"></div>
                <span className="ml-3">Please wait...</span>
              </div>
            ) : (
              <LoginButton className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
