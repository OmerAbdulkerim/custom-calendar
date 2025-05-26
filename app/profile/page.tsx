'use client';

import React from 'react';
import Image from 'next/image';
import { useAuth } from '@/app/contexts/AuthContext';
import Link from 'next/link';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="w-full h-64 bg-gradient-to-r from-blue-600 to-blue-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="relative h-full">
            <div className="absolute -bottom-16 flex items-end space-x-6">
              <div className="relative w-32 h-32 rounded-full overflow-hidden ring-4 ring-white bg-white">
                {user.picture ? (
                  <Image
                    src={user.picture}
                    alt={user.name || 'Profile picture'}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <span className="text-3xl font-medium text-gray-600">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="mb-6 text-white">
                <h1 className="text-3xl font-bold">{user.name}</h1>
                <p className="text-xl text-blue-100">{user.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mt-24 space-y-10">
          {/* Account Details */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Account Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <p className="text-sm text-gray-500 mb-2">Full Name</p>
                <p className="text-lg text-gray-900">{user.name}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <p className="text-sm text-gray-500 mb-2">Email Address</p>
                <p className="text-lg text-gray-900">{user.email}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <p className="text-sm text-gray-500 mb-2">Account Type</p>
                <p className="text-lg text-gray-900">Google Account</p>
              </div>
            </div>
          </section>

          {/* Calendar Integration */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Calendar Integration</h2>
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-medium text-gray-900">Google Calendar Connected</h3>
                  <p className="text-green-600 text-lg">Your calendar is syncing successfully</p>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="pb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                href="/calendar"
                className="flex items-center justify-center px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
              >
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                View Calendar
              </Link>
              <Link
                href="/settings"
                className="flex items-center justify-center px-6 py-4 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
              >
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center justify-center px-6 py-4 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
              >
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}