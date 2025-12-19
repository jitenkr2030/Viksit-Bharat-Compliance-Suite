import { useState, useEffect, useCallback } from 'react';
import { alertsService, Alert, AlertFilter } from '../services/alertsService';

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchAlerts = useCallback(async (filter: AlertFilter = {}) => {
    try {
      const fetchedAlerts = await alertsService.getAlerts(filter);
      setAlerts(fetchedAlerts);
      
      // Calculate unread count
      const unread = fetchedAlerts.filter(alert => !alert.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    }
  }, []);

  const refreshAlerts = useCallback(async () => {
    setRefreshing(true);
    await fetchAlerts();
    setRefreshing(false);
  }, [fetchAlerts]);

  const markAsRead = useCallback(async (alertId: string) => {
    try {
      await alertsService.markAsRead(alertId);
      setAlerts(prevAlerts => 
        prevAlerts.map(alert => 
          alert.id === alertId ? { ...alert, read: true } : alert
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark alert as read:', error);
    }
  }, []);

  const markAsUnread = useCallback(async (alertId: string) => {
    try {
      await alertsService.markAsUnread(alertId);
      setAlerts(prevAlerts => 
        prevAlerts.map(alert => 
          alert.id === alertId ? { ...alert, read: false } : alert
        )
      );
      setUnreadCount(prev => prev + 1);
    } catch (error) {
      console.error('Failed to mark alert as unread:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await alertsService.markAllAsRead();
      setAlerts(prevAlerts => 
        prevAlerts.map(alert => ({ ...alert, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all alerts as read:', error);
    }
  }, []);

  const deleteAlert = useCallback(async (alertId: string) => {
    try {
      await alertsService.deleteAlert(alertId);
      setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== alertId));
      
      // Update unread count if deleted alert was unread
      const deletedAlert = alerts.find(alert => alert.id === alertId);
      if (deletedAlert && !deletedAlert.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete alert:', error);
    }
  }, [alerts]);

  const getAlert = useCallback(async (alertId: string) => {
    try {
      return await alertsService.getAlert(alertId);
    } catch (error) {
      console.error('Failed to get alert:', error);
      return null;
    }
  }, []);

  const getFilteredAlerts = useCallback((filter: AlertFilter) => {
    let filtered = [...alerts];
    
    if (filter.category) {
      filtered = filtered.filter(alert => alert.category === filter.category);
    }
    
    if (filter.type) {
      filtered = filtered.filter(alert => alert.type === filter.type);
    }
    
    if (filter.read !== undefined) {
      filtered = filtered.filter(alert => alert.read === filter.read);
    }
    
    if (filter.priority) {
      filtered = filtered.filter(alert => alert.priority === filter.priority);
    }
    
    return filtered;
  }, [alerts]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  return {
    alerts,
    loading,
    refreshing,
    unreadCount,
    fetchAlerts,
    refreshAlerts,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteAlert,
    getAlert,
    getFilteredAlerts,
  };
}