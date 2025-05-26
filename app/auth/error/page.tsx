import React from 'react';
import Link from 'next/link';

export default function AuthErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
        <p className="text-gray-700 mb-6">Something went wrong</p>
        <div className="flex flex-col gap-4">
          <Link 
            href="/api/auth/login" 
            className="bg-blue-600 text-white py-2 px-4 rounded-md text-center hover:bg-blue-700 transition-colors"
          >
            Try Again
          </Link>
          <Link 
            href="/" 
            className="text-blue-600 py-2 px-4 rounded-md text-center hover:underline"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
