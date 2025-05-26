'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import UserProfile from '@/app/components/auth/UserProfile';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated (extra protection)
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?returnUrl=/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg">Loading...</span>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return null; // Let the middleware handle the redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-blue-600">Custom Calendar</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <NavLink href="/dashboard">Dashboard</NavLink>
                <NavLink href="/calendar">Calendar</NavLink>
                <NavLink href="/settings">Settings</NavLink>
                <NavLink href="/profile">Profile</NavLink>
              </div>
            </div>
            <div className="flex items-center">
              <UserProfile className="mr-2" />
              <button
                onClick={() => router.push('/api/auth/logout')}
                className="ml-4 px-3 py-1 rounded-md text-sm bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        <div className="sm:hidden border-t border-gray-200">
          <div className="grid grid-cols-4 text-center">
            <MobileNavLink href="/dashboard">Dashboard</MobileNavLink>
            <MobileNavLink href="/calendar">Calendar</MobileNavLink>
            <MobileNavLink href="/settings">Settings</MobileNavLink>
            <MobileNavLink href="/profile">Profile</MobileNavLink>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

// Navigation link component
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname?.startsWith(href) || false;

  return (
    <Link
      href={href}
      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
        isActive
          ? 'border-blue-500 text-gray-900'
          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
      }`}
    >
      {children}
    </Link>
  );
}

// Mobile navigation link
function MobileNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname?.startsWith(href) || false;

  return (
    <Link
      href={href}
      className={`py-2 text-sm font-medium ${
        isActive ? 'text-blue-700 border-b-2 border-blue-500' : 'text-gray-600'
      }`}
    >
      {children}
    </Link>
  );
}
