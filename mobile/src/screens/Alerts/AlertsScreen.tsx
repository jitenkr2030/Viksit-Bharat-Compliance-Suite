import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { theme } from '../../constants/theme';

interface AlertItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  read: boolean;
  category: 'regulatory' | 'standards' | 'accreditation' | 'general';
}

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { key: 'all', label: 'All' },
    { key: 'regulatory', label: 'Regulatory' },
    { key: 'standards', label: 'Standards' },
    { key: 'accreditation', label: 'Accreditation' },
    { key: 'general', label: 'General' },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Fetch alerts from API
    setTimeout(() => {
      setAlerts([
        {
          id: '1',
          title: 'New Regulatory Update',
          message: 'New regulatory guidelines have been published. Please review the updated compliance requirements.',
          type: 'warning',
          timestamp: '2 hours ago',
          read: false,
          category: 'regulatory',
        },
        {
          id: '2',
          title: 'Compliance Review Completed',
          message: 'Your quarterly compliance review has been completed successfully.',
          type: 'success',
          timestamp: '1 day ago',
          read: true,
          category: 'standards',
        },
        {
          id: '3',
          title: 'Upcoming Deadline',
          message: 'Annual accreditation submission is due in 7 days.',
          type: 'error',
          timestamp: '2 days ago',
          read: false,
          category: 'accreditation',
        },
      ]);
      setRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    onRefresh();
  }, []);

  const filteredAlerts = selectedCategory === 'all' 
    ? alerts 
    : alerts.filter(alert => alert.category === selectedCategory);

  const markAsRead = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, read: true } : alert
    ));
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'success': return '✅';
      default: return 'ℹ️';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning': return theme.colors.warning;
      case 'error': return theme.colors.error;
      case 'success': return theme.colors.success;
      default: return theme.colors.info;
    }
  };

  const AlertCard = ({ alert }: { alert: AlertItem }) => (
    <TouchableOpacity
      style={[
        styles.alertCard,
        { borderLeftColor: getAlertColor(alert.type) },
        !alert.read && styles.unreadAlert,
      ]}
      onPress={() => markAsRead(alert.id)}
    >
      <View style={styles.alertHeader}>
        <Text style={styles.alertIcon}>{getAlertIcon(alert.type)}</Text>
        <View style={styles.alertContent}>
          <Text style={[styles.alertTitle, !alert.read && styles.unreadTitle]}>
            {alert.title}
          </Text>
          <Text style={styles.alertMessage}>{alert.message}</Text>
          <Text style={styles.alertTimestamp}>{alert.timestamp}</Text>
        </View>
        {!alert.read && <View style={styles.unreadDot} />}
      </View>
    </TouchableOpacity>
  );

  const CategoryTab = ({ category }: { category: any }) => (
    <TouchableOpacity
      style={[
        styles.categoryTab,
        selectedCategory === category.key && styles.activeCategoryTab,
      ]}
      onPress={() => setSelectedCategory(category.key)}
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === category.key && styles.activeCategoryText,
        ]}
      >
        {category.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Alerts</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonText}>Filter</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => (
            <CategoryTab key={category.key} category={category} />
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredAlerts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📭</Text>
            <Text style={styles.emptyStateTitle}>No alerts found</Text>
            <Text style={styles.emptyStateDescription}>
              You're all caught up! New alerts will appear here.
            </Text>
          </View>
        ) : (
          filteredAlerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight as any,
    color: theme.colors.text.primary,
  },
  filterButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
  },
  filterButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.caption.fontSize,
  },
  categoriesContainer: {
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  categoryTab: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    marginHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.full,
  },
  activeCategoryTab: {
    backgroundColor: theme.colors.primary,
  },
  categoryText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.secondary,
  },
  activeCategoryText: {
    color: theme.colors.white,
  },
  alertCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    borderLeftWidth: 4,
    padding: theme.spacing.md,
  },
  unreadAlert: {
    backgroundColor: theme.colors.surfaceVariant,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  alertIcon: {
    fontSize: 20,
    marginRight: theme.spacing.md,
    marginTop: 2,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: theme.typography.body.fontWeight as any,
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: 'bold' as any,
  },
  alertMessage: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  alertTimestamp: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.tertiary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  emptyStateTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  emptyStateDescription: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});