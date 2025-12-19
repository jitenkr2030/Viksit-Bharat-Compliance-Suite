import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import toast from 'react-hot-toast';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on 401/403 errors
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      onError: (error: any) => {
        // Handle authentication errors
        if (error?.response?.status === 401) {
          // Clear auth token and redirect to login
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return;
        }

        // Handle server errors
        if (error?.response?.status >= 500) {
          console.error('Server error:', error.response.data);
          toast.error('Server error occurred. Please try again later.');
          return;
        }

        // Handle other errors silently or show generic message
        if (error?.message && !error?.response?.status) {
          console.error('Query error:', error);
        }
      },
    },
    mutations: {
      retry: false,
      onError: (error: any) => {
        // Handle mutation errors
        if (error?.response?.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return;
        }

        // Show error toast for mutations
        const message = error?.response?.data?.message || error?.message || 'An error occurred';
        toast.error(message);
      },
    },
  },
});

// Query provider component
interface QueryProviderProps {
  children: ReactNode;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
};

export default QueryProvider;