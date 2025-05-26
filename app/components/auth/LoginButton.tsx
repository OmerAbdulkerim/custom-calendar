'use client';

import React from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

interface LoginButtonProps {
  className?: string;
}

export default function LoginButton({ className = '' }: LoginButtonProps) {
  const { isAuthenticated, login, logout } = useAuth();

  return (
    <button
      onClick={isAuthenticated ? logout : login}
      className={`px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors ${className}`}
    >
      {isAuthenticated ? 'Sign Out' : 'Sign in with Google'}
    </button>
  );
}
