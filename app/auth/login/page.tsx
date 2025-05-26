import React from 'react';
import LoginButton from '@/app/components/auth/LoginButton';

export default function LoginPage() {
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
        </div>
        
        <div className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm">
            <LoginButton className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
