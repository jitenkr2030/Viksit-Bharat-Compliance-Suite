import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';

// Import app components
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Import styles
import './styles/globals.css';

// Create React Query client
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
      refetchOnReconnect: true
    },
    mutations: {
      retry: false
    }
  }
});

// Error handler for React Query
const handleQueryError = (error: any) => {
  console.error('React Query Error:', error);
  
  // Handle authentication errors
  if (error?.response?.status === 401) {
    // Clear auth token and redirect to login
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  }
  
  // Handle server errors
  if (error?.response?.status >= 500) {
    console.error('Server error:', error.response.data);
  }
};

// Global error handling
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  handleQueryError(event.reason);
});

window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

// App initialization
const initializeApp = async () => {
  try {
    // Check for existing auth token
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      // Validate token with backend
      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        if (response.ok) {
          // Token is valid, user is authenticated
          console.log('User authenticated');
        } else {
          // Token is invalid, clear it
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
        }
      } catch (error) {
        console.error('Auth validation failed:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
      }
    }
  } catch (error) {
    console.error('App initialization error:', error);
  }
};

// Initialize app
initializeApp();

// Hide loading screen after React app mounts
const hideLoadingScreen = () => {
  if (window.hideLoadingScreen) {
    window.hideLoadingScreen();
  }
};

// Render React app
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <ThemeProvider>
              <NotificationProvider>
                <App />
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                    success: {
                      duration: 3000,
                      style: {
                        background: '#10B981',
                      },
                    },
                    error: {
                      duration: 5000,
                      style: {
                        background: '#EF4444',
                      },
                    },
                  }}
                />
                {process.env.NODE_ENV === 'development' && (
                  <ReactQueryDevtools initialIsOpen={false} />
                )}
              </NotificationProvider>
            </ThemeProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>
);

// Hide loading screen when app is ready
setTimeout(() => {
  hideLoadingScreen();
}, 2000);

// Service Worker registration (for PWA support)
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Global type declarations
declare global {
  interface Window {
    hideLoadingScreen?: () => void;
  }
}

export default App;