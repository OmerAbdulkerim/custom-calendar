'use client';

import React from 'react';
import Image from 'next/image';
import { useAuth } from '@/app/contexts/AuthContext';

interface UserProfileProps {
  className?: string;
}

export default function UserProfile({ className = '' }: UserProfileProps) {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="flex flex-col">
        <span className="font-medium">{user.name}</span>
        <span className="text-sm text-gray-500">{user.email}</span>
      </div>
      {user.picture && (
        <div className="relative w-10 h-10 overflow-hidden rounded-full">
          <Image
            src={user.picture}
            alt={user.name || 'User profile'}
            fill
            className="object-cover"
          />
        </div>
      )}
      <button
        onClick={logout}
        className="text-sm text-red-500 hover:text-red-700"
      >
        Sign out
      </button>
    </div>
  );
}
