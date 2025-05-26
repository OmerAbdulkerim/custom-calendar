'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = () => {
    logout();
    // No need to manually redirect as the logout function in AuthContext already handles it
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo & App Name */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center">
              <svg 
                className="w-8 h-8 text-indigo-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
                <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
                <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
                <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
              </svg>
              <span className="ml-2 text-xl font-bold text-white">Calendar</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className="text-gray-300 hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link 
              href="/calendar" 
              className="text-gray-300 hover:text-white transition-colors"
            >
              Calendar
            </Link>
            <Link 
              href="/profile" 
              className="text-gray-300 hover:text-white transition-colors"
            >
              Profile
            </Link>
          </nav>

          {/* User Menu */}
          <div className="relative">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
              </div>
              <span className="hidden md:inline-block">{user?.name || user?.email || 'User'}</span>
              <svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 py-2 bg-gray-800 rounded-lg shadow-xl z-10">
                <div className="px-4 py-2 text-sm text-gray-400 border-b border-gray-700">
                  Signed in as<br />
                  <span className="font-medium text-white truncate">
                    {user?.email || 'user@example.com'}
                  </span>
                </div>
                <Link 
                  href="/profile" 
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Your Profile
                </Link>
                <Link 
                  href="/settings" 
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-300 hover:text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d={isMenuOpen 
                  ? "M6 18L18 6M6 6l12 12" 
                  : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 pb-3 border-t border-gray-800">
            <nav className="flex flex-col space-y-3 mt-3">
              <Link 
                href="/dashboard" 
                className="text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                href="/calendar" 
                className="text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Calendar
              </Link>
              <Link 
                href="/settings" 
                className="text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Settings
              </Link>
              <button
                onClick={handleSignOut}
                className="text-left text-gray-300 hover:text-white transition-colors"
              >
                Sign Out
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
