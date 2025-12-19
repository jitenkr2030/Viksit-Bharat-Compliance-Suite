import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import toast from 'react-hot-toast';

// Types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  persistent?: boolean;
  action?: {
    label: string;
    handler: () => void;
  };
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}

type NotificationAction =
  | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id' | 'timestamp' | 'read'> }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_ALL' }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] };

interface NotificationContextType extends NotificationState {
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  showToast: (type: 'info' | 'success' | 'warning' | 'error', message: string, title?: string) => void;
}

// Initial state
const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
};

// Reducer
const notificationReducer = (state: NotificationState, action: NotificationAction): NotificationState => {
  switch (action.type) {
    case 'ADD_NOTIFICATION': {
      const newNotification: Notification = {
        ...action.payload,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
        read: false,
      };
      
      return {
        ...state,
        notifications: [newNotification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };
    }
    
    case 'MARK_AS_READ': {
      const updatedNotifications = state.notifications.map(notification =>
        notification.id === action.payload
          ? { ...notification, read: true }
          : notification
      );
      
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    }
    
    case 'MARK_ALL_AS_READ': {
      return {
        ...state,
        notifications: state.notifications.map(notification => ({
          ...notification,
          read: true,
        })),
        unreadCount: 0,
      };
    }
    
    case 'REMOVE_NOTIFICATION': {
      const notificationToRemove = state.notifications.find(n => n.id === action.payload);
      const updatedNotifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
      
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: notificationToRemove && !notificationToRemove.read 
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
      };
    }
    
    case 'CLEAR_ALL': {
      return {
        ...state,
        notifications: [],
        unreadCount: 0,
      };
    }
    
    case 'SET_NOTIFICATIONS': {
      const unreadCount = action.payload.filter(n => !n.read).length;
      return {
        ...state,
        notifications: action.payload,
        unreadCount,
      };
    }
    
    default:
      return state;
  }
};

// Create context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Provider component
interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // Add notification
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    
    // Show toast notification for non-persistent notifications
    if (!notification.persistent) {
      showToast(notification.type, notification.message, notification.title);
    }
  };

  // Mark as read
  const markAsRead = (id: string) => {
    dispatch({ type: 'MARK_AS_READ', payload: id });
  };

  // Mark all as read
  const markAllAsRead = () => {
    dispatch({ type: 'MARK_ALL_AS_READ' });
  };

  // Remove notification
  const removeNotification = (id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  };

  // Clear all notifications
  const clearAll = () => {
    dispatch({ type: 'CLEAR_ALL' });
  };

  // Show toast notification
  const showToast = (
    type: 'info' | 'success' | 'warning' | 'error',
    message: string,
    title?: string
  ) => {
    const displayMessage = title ? `${title}: ${message}` : message;
    
    switch (type) {
      case 'success':
        toast.success(displayMessage);
        break;
      case 'warning':
        toast(displayMessage, { icon: '⚠️' });
        break;
      case 'error':
        toast.error(displayMessage);
        break;
      case 'info':
      default:
        toast(displayMessage);
        break;
    }
  };

  const contextValue: NotificationContextType = {
    ...state,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    showToast,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use notification context
export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;