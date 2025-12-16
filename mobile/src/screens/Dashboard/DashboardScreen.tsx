import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../constants/theme';
import { appConfig } from '../../constants/app';

interface DashboardStats {
  totalCompliance: number;
  pendingActions: number;
  completedTasks: number;
  upcomingDeadlines: number;
}

export default function DashboardScreen() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCompliance: 0,
    pendingActions: 0,
    completedTasks: 0,
    upcomingDeadlines: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Fetch dashboard data
    setTimeout(() => {
      setStats({
        totalCompliance: 85,
        pendingActions: 12,
        completedTasks: 48,
        upcomingDeadlines: 3,
      });
      setRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    onRefresh();
  }, []);

  const StatCard = ({ title, value, color, onPress }: any) => (
    <TouchableOpacity 
      style={[styles.statCard, { borderLeftColor: color }]}
      onPress={onPress}
    >
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </TouchableOpacity>
  );

  const QuickActionCard = ({ title, description, icon, onPress }: any) => (
    <TouchableOpacity style={styles.quickActionCard} onPress={onPress}>
      <Text style={styles.quickActionIcon}>{icon}</Text>
      <Text style={styles.quickActionTitle}>{title}</Text>
      <Text style={styles.quickActionDescription}>{description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.firstName || 'User'}</Text>
          <Text style={styles.subtitle}>Welcome to Viksit Bharat Compliance</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Text style={styles.profileIcon}>👤</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compliance Overview</Text>
          <View style={styles.statsContainer}>
            <StatCard
              title="Total Compliance"
              value={`${stats.totalCompliance}%`}
              color={theme.colors.success}
              onPress={() => {}}
            />
            <StatCard
              title="Pending Actions"
              value={stats.pendingActions}
              color={theme.colors.warning}
              onPress={() => {}}
            />
            <StatCard
              title="Completed Tasks"
              value={stats.completedTasks}
              color={theme.colors.primary}
              onPress={() => {}}
            />
            <StatCard
              title="Upcoming Deadlines"
              value={stats.upcomingDeadlines}
              color={theme.colors.error}
              onPress={() => {}}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsContainer}>
            <QuickActionCard
              title="Submit Compliance"
              description="Upload new compliance documents"
              icon="📄"
              onPress={() => {}}
            />
            <QuickActionCard
              title="View Alerts"
              description="Check latest compliance alerts"
              icon="⚠️"
              onPress={() => {}}
            />
            <QuickActionCard
              title="Generate Report"
              description="Create compliance report"
              icon="📊"
              onPress={() => {}}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <Text style={styles.activityTitle}>Compliance Review Completed</Text>
            <Text style={styles.activityDescription}>
              Standard compliance review for Q4 2024 has been completed successfully.
            </Text>
            <Text style={styles.activityTime}>2 hours ago</Text>
          </View>
        </View>
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
  greeting: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight as any,
    color: theme.colors.text.primary,
  },
  subtitle: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.secondary,
    marginTop: 4,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIcon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    width: '48%',
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  statTitle: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    marginTop: 4,
  },
  quickActionsContainer: {
    gap: theme.spacing.md,
  },
  quickActionCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  quickActionIcon: {
    fontSize: 24,
    marginRight: theme.spacing.md,
  },
  quickActionTitle: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: theme.typography.body.fontWeight as any,
    color: theme.colors.text.primary,
  },
  quickActionDescription: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  activityCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  activityTitle: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: theme.typography.body.fontWeight as any,
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    marginBottom: 8,
  },
  activityTime: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.tertiary,
  },
});