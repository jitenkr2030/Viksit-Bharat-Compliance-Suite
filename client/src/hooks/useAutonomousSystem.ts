// Phase 4: Fully Autonomous Compliance Management - React Hooks

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  autonomousSystemApiClient,
  autonomousDecisionApiClient,
  autonomousTaskApiClient,
  autonomousOptimizationApiClient,
  dependencyApiClient,
  autonomousSystemDashboardApiClient
} from '../api/autonomousSystem';
import {
  AutonomousSystem,
  AutonomousDecision,
  AutonomousTask,
  AutonomousOptimization,
  TaskStatus,
  OptimizationStatus
} from '../types/autonomousSystem';

// Generic hook for API calls with loading and error states
function useApiCall<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    execute();
  }, [execute]);

  const refetch = useCallback(() => {
    execute();
  }, [execute]);

  return { data, loading, error, refetch };
}

// Autonomous System Hooks

export function useAutonomousSystems() {
  const { data: systems, loading, error, refetch } = useApiCall(
    () => autonomousSystemApiClient.getAllSystems()
  );

  const getSystem = useCallback((id: string) => {
    return systems?.find(system => system.id === id) || null;
  }, [systems]);

  const activeSystems = useMemo(() => 
    systems?.filter(system => system.status === 'active') || [], 
    [systems]
  );

  const systemsByStatus = useMemo(() => {
    const grouped: Record<string, AutonomousSystem[]> = {};
    systems?.forEach(system => {
      if (!grouped[system.status]) {
        grouped[system.status] = [];
      }
      grouped[system.status].push(system);
    });
    return grouped;
  }, [systems]);

  return {
    systems: systems || [],
    loading,
    error,
    refetch,
    getSystem,
    activeSystems,
    systemsByStatus
  };
}

export function useAutonomousSystem(id: string) {
  const { data: system, loading, error, refetch } = useApiCall(
    () => autonomousSystemApiClient.getSystemById(id),
    [id]
  );

  const updateSystem = useCallback(async (updates: Partial<AutonomousSystem>) => {
    try {
      await autonomousSystemApiClient.updateSystem(id, updates);
      refetch();
    } catch (err) {
      throw err;
    }
  }, [id, refetch]);

  const activateSystem = useCallback(async () => {
    try {
      await autonomousSystemApiClient.activateSystem(id);
      refetch();
    } catch (err) {
      throw err;
    }
  }, [id, refetch]);

  const deactivateSystem = useCallback(async () => {
    try {
      await autonomousSystemApiClient.deactivateSystem(id);
      refetch();
    } catch (err) {
      throw err;
    }
  }, [id, refetch]);

  const getHealth = useCallback(async () => {
    return await autonomousSystemApiClient.getSystemHealth(id);
  }, [id]);

  const getPerformance = useCallback(async () => {
    return await autonomousSystemApiClient.getSystemPerformance(id);
  }, [id]);

  return {
    system,
    loading,
    error,
    refetch,
    updateSystem,
    activateSystem,
    deactivateSystem,
    getHealth,
    getPerformance
  };
}

export function useCreateAutonomousSystem() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSystem = useCallback(async (system: Partial<AutonomousSystem>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await autonomousSystemApiClient.createSystem(system);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create system';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createSystem, loading, error };
}

// Autonomous Decisions Hooks

export function useAutonomousDecisions(filters?: {
  systemId?: string;
  status?: string;
}) {
  const { data: decisions, loading, error, refetch } = useApiCall(
    () => autonomousDecisionApiClient.getAllDecisions(filters?.systemId, filters?.status)
  );

  const pendingDecisions = useMemo(() =>
    decisions?.filter(decision => decision.executionStatus === 'pending') || [],
    [decisions]
  );

  const approvedDecisions = useMemo(() =>
    decisions?.filter(decision => decision.finalDecision?.decision === 'approve') || [],
    [decisions]
  );

  const rejectedDecisions = useMemo(() =>
    decisions?.filter(decision => decision.finalDecision?.decision === 'reject') || [],
    [decisions]
  );

  return {
    decisions: decisions || [],
    loading,
    error,
    refetch,
    pendingDecisions,
    approvedDecisions,
    rejectedDecisions
  };
}

export function useAutonomousDecision(id: string) {
  const { data: decision, loading, error, refetch } = useApiCall(
    () => autonomousDecisionApiClient.getDecisionById(id),
    [id]
  );

  const executeDecision = useCallback(async () => {
    try {
      await autonomousDecisionApiClient.executeDecision(id);
      refetch();
    } catch (err) {
      throw err;
    }
  }, [id, refetch]);

  const approveDecision = useCallback(async (approval: any) => {
    try {
      await autonomousDecisionApiClient.approveDecision(id, approval);
      refetch();
    } catch (err) {
      throw err;
    }
  }, [id, refetch]);

  const rejectDecision = useCallback(async (rejection: any) => {
    try {
      await autonomousDecisionApiClient.rejectDecision(id, rejection);
      refetch();
    } catch (err) {
      throw err;
    }
  }, [id, refetch]);

  const requestMoreInfo = useCallback(async (request: any) => {
    try {
      await autonomousDecisionApiClient.requestMoreInfo(id, request);
      refetch();
    } catch (err) {
      throw err;
    }
  }, [id, refetch]);

  const getAnalytics = useCallback(async () => {
    return await autonomousDecisionApiClient.getDecisionAnalytics(id);
  }, [id]);

  return {
    decision,
    loading,
    error,
    refetch,
    executeDecision,
    approveDecision,
    rejectDecision,
    requestMoreInfo,
    getAnalytics
  };
}

export function useCreateAutonomousDecision() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDecision = useCallback(async (decision: Partial<AutonomousDecision>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await autonomousDecisionApiClient.createDecision(decision);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create decision';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createDecision, loading, error };
}

// Autonomous Tasks Hooks

export function useAutonomousTasks(filters?: {
  systemId?: string;
  status?: string;
  priority?: string;
}) {
  const { data: tasks, loading, error, refetch } = useApiCall(
    () => autonomousTaskApiClient.getAllTasks(filters?.systemId, filters?.status, filters?.priority)
  );

  const pendingTasks = useMemo(() =>
    tasks?.filter(task => task.status === TaskStatus.PENDING) || [],
    [tasks]
  );

  const inProgressTasks = useMemo(() =>
    tasks?.filter(task => task.status === TaskStatus.IN_PROGRESS) || [],
    [tasks]
  );

  const completedTasks = useMemo(() =>
    tasks?.filter(task => task.status === TaskStatus.COMPLETED) || [],
    [tasks]
  );

  const failedTasks = useMemo(() =>
    tasks?.filter(task => task.status === TaskStatus.FAILED) || [],
    [tasks]
  );

  const urgentTasks = useMemo(() =>
    tasks?.filter(task => task.priority === 'urgent' || task.priority === 'critical') || [],
    [tasks]
  );

  return {
    tasks: tasks || [],
    loading,
    error,
    refetch,
    pendingTasks,
    inProgressTasks,
    completedTasks,
    failedTasks,
    urgentTasks
  };
}

export function useAutonomousTask(id: string) {
  const { data: task, loading, error, refetch } = useApiCall(
    () => autonomousTaskApiClient.getTaskById(id),
    [id]
  );

  const startTask = useCallback(async () => {
    try {
      await autonomousTaskApiClient.startTask(id);
      refetch();
    } catch (err) {
      throw err;
    }
  }, [id, refetch]);

  const pauseTask = useCallback(async () => {
    try {
      await autonomousTaskApiClient.pauseTask(id);
      refetch();
    } catch (err) {
      throw err;
    }
  }, [id, refetch]);

  const resumeTask = useCallback(async () => {
    try {
      await autonomousTaskApiClient.resumeTask(id);
      refetch();
    } catch (err) {
      throw err;
    }
  }, [id, refetch]);

  const completeTask = useCallback(async (completion: any) => {
    try {
      await autonomousTaskApiClient.completeTask(id, completion);
      refetch();
    } catch (err) {
      throw err;
    }
  }, [id, refetch]);

  const cancelTask = useCallback(async (reason: string) => {
    try {
      await autonomousTaskApiClient.cancelTask(id, reason);
      refetch();
    } catch (err) {
      throw err;
    }
  }, [id, refetch]);

  const getProgress = useCallback(async () => {
    return await autonomousTaskApiClient.getTaskProgress(id);
  }, [id]);

  const getLogs = useCallback(async (level?: string) => {
    return await autonomousTaskApiClient.getTaskLogs(id, level);
  }, [id]);

  const getMetrics = useCallback(async () => {
    return await autonomousTaskApiClient.getTaskMetrics(id);
  }, [id]);

  return {
    task,
    loading,
    error,
    refetch,
    startTask,
    pauseTask,
    resumeTask,
    completeTask,
    cancelTask,
    getProgress,
    getLogs,
    getMetrics
  };
}

export function useCreateAutonomousTask() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTask = useCallback(async (task: Partial<AutonomousTask>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await autonomousTaskApiClient.createTask(task);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create task';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createTask, loading, error };
}

// Autonomous Optimization Hooks

export function useAutonomousOptimizations(filters?: {
  systemId?: string;
  status?: string;
}) {
  const { data: optimizations, loading, error, refetch } = useApiCall(
    () => autonomousOptimizationApiClient.getAllOptimizations(filters?.systemId, filters?.status)
  );

  const activeOptimizations = useMemo(() =>
    optimizations?.filter(opt => 
      opt.status === OptimizationStatus.ANALYZING ||
      opt.status === OptimizationStatus.IMPLEMENTING ||
      opt.status === OptimizationStatus.VALIDATING
    ) || [],
    [optimizations]
  );

  const completedOptimizations = useMemo(() =>
    optimizations?.filter(opt => opt.status === OptimizationStatus.COMPLETED) || [],
    [optimizations]
  );

  const failedOptimizations = useMemo(() =>
    optimizations?.filter(opt => opt.status === OptimizationStatus.FAILED) || [],
    [optimizations]
  );

  return {
    optimizations: optimizations || [],
    loading,
    error,
    refetch,
    activeOptimizations,
    completedOptimizations,
    failedOptimizations
  };
}

export function useAutonomousOptimization(id: string) {
  const { data: optimization, loading, error, refetch } = useApiCall(
    () => autonomousOptimizationApiClient.getOptimizationById(id),
    [id]
  );

  const startOptimization = useCallback(async () => {
    try {
      await autonomousOptimizationApiClient.startOptimization(id);
      refetch();
    } catch (err) {
      throw err;
    }
  }, [id, refetch]);

  const pauseOptimization = useCallback(async () => {
    try {
      await autonomousOptimizationApiClient.pauseOptimization(id);
      refetch();
    } catch (err) {
      throw err;
    }
  }, [id, refetch]);

  const resumeOptimization = useCallback(async () => {
    try {
      await autonomousOptimizationApiClient.resumeOptimization(id);
      refetch();
    } catch (err) {
      throw err;
    }
  }, [id, refetch]);

  const completeOptimization = useCallback(async (results: any) => {
    try {
      await autonomousOptimizationApiClient.completeOptimization(id, results);
      refetch();
    } catch (err) {
      throw err;
    }
  }, [id, refetch]);

  const cancelOptimization = useCallback(async (reason: string) => {
    try {
      await autonomousOptimizationApiClient.cancelOptimization(id, reason);
      refetch();
    } catch (err) {
      throw err;
    }
  }, [id, refetch]);

  const getAnalysis = useCallback(async () => {
    return await autonomousOptimizationApiClient.getOptimizationAnalysis(id);
  }, [id]);

  const getResults = useCallback(async () => {
    return await autonomousOptimizationApiClient.getOptimizationResults(id);
  }, [id]);

  const getRecommendations = useCallback(async () => {
    return await autonomousOptimizationApiClient.getOptimizationRecommendations(id);
  }, [id]);

  return {
    optimization,
    loading,
    error,
    refetch,
    startOptimization,
    pauseOptimization,
    resumeOptimization,
    completeOptimization,
    cancelOptimization,
    getAnalysis,
    getResults,
    getRecommendations
  };
}

export function useCreateAutonomousOptimization() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOptimization = useCallback(async (optimization: Partial<AutonomousOptimization>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await autonomousOptimizationApiClient.createOptimization(optimization);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create optimization';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createOptimization, loading, error };
}

// Dashboard Hooks

export function useAutonomousSystemDashboard() {
  const { data: overview, loading: overviewLoading, error: overviewError } = useApiCall(
    () => autonomousSystemDashboardApiClient.getDashboardOverview()
  );

  const { data: systemSummary, loading: systemLoading, error: systemError } = useApiCall(
    () => autonomousSystemDashboardApiClient.getSystemSummary()
  );

  const { data: decisionSummary, loading: decisionLoading, error: decisionError } = useApiCall(
    () => autonomousSystemDashboardApiClient.getDecisionSummary()
  );

  const { data: taskSummary, loading: taskLoading, error: taskError } = useApiCall(
    () => autonomousSystemDashboardApiClient.getTaskSummary()
  );

  const { data: optimizationSummary, loading: optimizationLoading, error: optimizationError } = useApiCall(
    () => autonomousSystemDashboardApiClient.getOptimizationSummary()
  );

  const { data: performanceMetrics, loading: performanceLoading, error: performanceError } = useApiCall(
    () => autonomousSystemDashboardApiClient.getPerformanceMetrics()
  );

  const { data: systemHealth, loading: healthLoading, error: healthError } = useApiCall(
    () => autonomousSystemDashboardApiClient.getSystemHealth()
  );

  const { data: activeAlerts, loading: alertsLoading, error: alertsError } = useApiCall(
    () => autonomousSystemDashboardApiClient.getActiveAlerts()
  );

  const loading = overviewLoading || systemLoading || decisionLoading || taskLoading || optimizationLoading || performanceLoading || healthLoading || alertsLoading;
  const error = overviewError || systemError || decisionError || taskError || optimizationError || performanceError || healthError || alertsError;

  return {
    overview,
    systemSummary,
    decisionSummary,
    taskSummary,
    optimizationSummary,
    performanceMetrics,
    systemHealth,
    activeAlerts,
    loading,
    error
  };
}

// Real-time monitoring hook
export function useRealTimeMonitoring(systemId: string, interval: number = 30000) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [health, performance, alerts] = await Promise.all([
        autonomousSystemApiClient.getSystemHealth(systemId),
        autonomousSystemApiClient.getSystemPerformance(systemId),
        autonomousSystemDashboardApiClient.getActiveAlerts()
      ]);

      setData({
        health,
        performance,
        alerts,
        timestamp: new Date()
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch monitoring data');
    } finally {
      setLoading(false);
    }
  }, [systemId]);

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, interval);
    return () => clearInterval(intervalId);
  }, [fetchData, interval]);

  return { data, loading, error, refetch: fetchData };
}

// Search and filter hook
export function useAutonomousSystemSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<any>({});
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { data: systems, loading, error } = useAutonomousSystems();
  const { data: decisions, loading: decisionsLoading } = useAutonomousDecisions();
  const { data: tasks, loading: tasksLoading } = useAutonomousTasks();
  const { data: optimizations, loading: optimizationsLoading } = useAutonomousOptimizations();

  const filteredData = useMemo(() => {
    const allData = [
      ...(systems?.map(s => ({ ...s, type: 'system' })) || []),
      ...(decisions?.map(d => ({ ...d, type: 'decision' })) || []),
      ...(tasks?.map(t => ({ ...t, type: 'task' })) || []),
      ...(optimizations?.map(o => ({ ...o, type: 'optimization' })) || [])
    ];

    return allData
      .filter(item => {
        const matchesSearch = !searchTerm || 
          item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilters = Object.entries(filters).every(([key, value]) => {
          if (!value) return true;
          return item[key] === value;
        });

        return matchesSearch && matchesFilters;
      })
      .sort((a, b) => {
        const aValue = a[sortBy as keyof typeof a];
        const bValue = b[sortBy as keyof typeof b];
        
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [systems, decisions, tasks, optimizations, searchTerm, filters, sortBy, sortOrder]);

  return {
    data: filteredData,
    loading: loading || decisionsLoading || tasksLoading || optimizationsLoading,
    error,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder
  };
}