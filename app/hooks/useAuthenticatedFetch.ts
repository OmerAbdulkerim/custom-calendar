'use client';

import { useAuth } from '@/app/contexts/AuthContext';
import { useState, useCallback } from 'react';

// Custom hook to handle API requests with authentication
export function useAuthenticatedFetch() {
  const { refreshToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch with token refresh capability
  const fetchWithAuth = useCallback(
    async (url: string, options: RequestInit = {}) => {
      setIsLoading(true);
      setError(null);

      try {
        // Attempt the fetch
        let response = await fetch(url, options);

        // If unauthorized, try to refresh the token and retry
        if (response.status === 401) {
          const refreshSuccessful = await refreshToken();
          
          if (refreshSuccessful) {
            // Retry the request with the new token
            response = await fetch(url, options);
          } else {
            throw new Error('Session expired. Please login again.');
          }
        }

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        return data;
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshToken]
  );

  return { fetchWithAuth, isLoading, error };
}
