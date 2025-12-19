// Error handling utilities for mobile app
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export interface AppError extends Error {
  type: string;
  code?: string;
  details?: any;
  isRetryable?: boolean;
}

// Error types
export const ERROR_TYPES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  OFFLINE_ERROR: 'OFFLINE_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  STORAGE_ERROR: 'STORAGE_ERROR',
} as const;

export type ErrorType = typeof ERROR_TYPES[keyof typeof ERROR_TYPES];

// Create app error
export const createAppError = (
  message: string,
  type: ErrorType = ERROR_TYPES.UNKNOWN_ERROR,
  code?: string,
  details?: any,
  isRetryable: boolean = false
): AppError => {
  const error = new Error(message) as AppError;
  error.type = type;
  error.code = code;
  error.details = details;
  error.isRetryable = isRetryable;
  return error;
};

// Handle API errors
export const handleApiError = (error: any): AppError => {
  // Network errors
  if (!error.response) {
    if (error.code === 'NETWORK_ERROR' || error.message?.includes('fetch')) {
      return createAppError(
        'Network connection error. Please check your internet connection.',
        ERROR_TYPES.NETWORK_ERROR,
        'NETWORK_CONNECTION_FAILED',
        error,
        true
      );
    }
    
    if (error.code === 'TIMEOUT' || error.message?.includes('timeout')) {
      return createAppError(
        'Request timed out. Please try again.',
        ERROR_TYPES.TIMEOUT_ERROR,
        'REQUEST_TIMEOUT',
        error,
        true
      );
    }

    return createAppError(
      'Network error occurred. Please try again.',
      ERROR_TYPES.NETWORK_ERROR,
      'NETWORK_ERROR',
      error,
      true
    );
  }

  // HTTP response errors
  const status = error.response.status;
  const data = error.response.data;

  switch (status) {
    case 400:
      return createAppError(
        data?.message || 'Invalid request. Please check your input.',
        ERROR_TYPES.VALIDATION_ERROR,
        'BAD_REQUEST',
        data,
        false
      );

    case 401:
      if (data?.message?.includes('Session expired') || data?.message?.includes('expired')) {
        return createAppError(
          'Your session has expired. Please log in again.',
          ERROR_TYPES.AUTH_ERROR,
          'SESSION_EXPIRED',
          data,
          false
        );
      }
      return createAppError(
        data?.message || 'Authentication required. Please log in.',
        ERROR_TYPES.AUTH_ERROR,
        'UNAUTHORIZED',
        data,
        false
      );

    case 403:
      return createAppError(
        data?.message || 'Access denied. You do not have permission to perform this action.',
        ERROR_TYPES.PERMISSION_DENIED,
        'FORBIDDEN',
        data,
        false
      );

    case 404:
      return createAppError(
        data?.message || 'The requested resource was not found.',
        ERROR_TYPES.SERVER_ERROR,
        'NOT_FOUND',
        data,
        false
      );

    case 429:
      return createAppError(
        'Too many requests. Please wait a moment before trying again.',
        ERROR_TYPES.SERVER_ERROR,
        'RATE_LIMITED',
        data,
        true
      );

    case 500:
    case 502:
    case 503:
    case 504:
      return createAppError(
        data?.message || 'Server error. Please try again later.',
        ERROR_TYPES.SERVER_ERROR,
        'SERVER_ERROR',
        data,
        true
      );

    default:
      return createAppError(
        data?.message || 'An unexpected error occurred. Please try again.',
        ERROR_TYPES.SERVER_ERROR,
        'UNKNOWN_ERROR',
        data,
        status >= 500
      );
  }
};

// Show user-friendly error messages
export const showError = (error: AppError, customMessage?: string): void => {
  let message = customMessage || error.message;
  
  // Don't show technical details to users
  if (message.includes('undefined') || message.includes('null')) {
    message = 'An unexpected error occurred. Please try again.';
  }

  // Log error for debugging
  console.error('App Error:', {
    type: error.type,
    code: error.code,
    message: error.message,
    details: error.details,
    stack: error.stack
  });

  // Show user-friendly notification
  // You can replace this with your preferred notification system
  if (typeof window !== 'undefined' && window.alert) {
    window.alert(message);
  } else {
    // For React Native - replace with your notification system
    console.log('Error Notification:', message);
  }
};

// Retry logic for retryable errors
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: AppError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const appError = error instanceof Error ? handleApiError(error) : error;
      lastError = appError;

      // Don't retry if error is not retryable or it's the last attempt
      if (!appError.isRetryable || attempt === maxRetries) {
        throw appError;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError!;
};

// Offline error handling
export const isOfflineError = (error: AppError): boolean => {
  return error.type === ERROR_TYPES.NETWORK_ERROR || 
         error.type === ERROR_TYPES.OFFLINE_ERROR;
};

// Authentication error handling
export const isAuthError = (error: AppError): boolean => {
  return error.type === ERROR_TYPES.AUTH_ERROR;
};

// Permission error handling
export const isPermissionError = (error: AppError): boolean => {
  return error.type === ERROR_TYPES.PERMISSION_DENIED;
};

// Validation error handling
export const isValidationError = (error: AppError): boolean => {
  return error.type === ERROR_TYPES.VALIDATION_ERROR;
};

// Get error action suggestions
export const getErrorSuggestions = (error: AppError): string[] => {
  const suggestions: string[] = [];

  switch (error.type) {
    case ERROR_TYPES.NETWORK_ERROR:
      suggestions.push('Check your internet connection');
      suggestions.push('Try again in a moment');
      break;

    case ERROR_TYPES.AUTH_ERROR:
      suggestions.push('Please log out and log back in');
      suggestions.push('Check your credentials');
      break;

    case ERROR_TYPES.VALIDATION_ERROR:
      suggestions.push('Check all required fields');
      suggestions.push('Ensure data format is correct');
      break;

    case ERROR_TYPES.SERVER_ERROR:
      suggestions.push('Try again later');
      suggestions.push('Contact support if the problem persists');
      break;

    case ERROR_TYPES.TIMEOUT_ERROR:
      suggestions.push('Check your internet connection');
      suggestions.push('Try with a stronger network signal');
      break;

    default:
      suggestions.push('Try again');
      suggestions.push('Contact support if the problem persists');
  }

  return suggestions;
};

// Format error for logging
export const formatErrorForLogging = (error: AppError): string => {
  return JSON.stringify({
    type: error.type,
    code: error.code,
    message: error.message,
    details: error.details,
    timestamp: new Date().toISOString(),
    isRetryable: error.isRetryable
  }, null, 2);
};

// Validate error response format
export const validateErrorResponse = (data: any): boolean => {
  return data && 
         (typeof data === 'object') && 
         (data.message || data.error || data.code);
};

// Default export for convenience
export default {
  createAppError,
  handleApiError,
  showError,
  withRetry,
  isOfflineError,
  isAuthError,
  isPermissionError,
  isValidationError,
  getErrorSuggestions,
  formatErrorForLogging,
  validateErrorResponse,
  ERROR_TYPES
};