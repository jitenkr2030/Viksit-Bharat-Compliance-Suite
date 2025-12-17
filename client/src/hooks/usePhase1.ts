import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../hooks/use-toast';
import { phase1API } from '../services/phase1Api';
import type {
  ComplianceDeadline,
  RiskAssessment,
  AlertNotification,
  RiskDashboardWidget,
  NotificationSummary,
  DeadlineSummary,
  RiskSummary,
  DeadlineFilters,
  RiskAssessmentFilters,
  NotificationFilters,
  CreateDeadlineForm,
  UpdateDeadlineForm,
  CreateRiskAssessmentForm,
  SendNotificationForm
} from '../types/phase1';

// Toast hook for notifications
const usePhase1Toast = () => {
  const { toast } = useToast();
  
  return {
    success: (message: string) => toast({ title: "Success", description: message, variant: "default" }),
    error: (message: string) => toast({ title: "Error", description: message, variant: "destructive" }),
    warning: (message: string) => toast({ title: "Warning", description: message, variant: "default" }),
    info: (message: string) => toast({ title: "Info", description: message, variant: "default" })
  };
};

// Compliance Deadlines Hooks
export const useDeadlines = (filters?: DeadlineFilters, page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['deadlines', filters, page, limit],
    queryFn: () => phase1API.getDeadlines(filters, page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useDeadline = (id: string) => {
  return useQuery({
    queryKey: ['deadline', id],
    queryFn: () => phase1API.getDeadline(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpcomingDeadlines = (days = 30) => {
  return useQuery({
    queryKey: ['upcoming-deadlines', days],
    queryFn: () => phase1API.getUpcomingDeadlines(days),
    staleTime: 5 * 60 * 1000,
  });
};

export const useOverdueDeadlines = () => {
  return useQuery({
    queryKey: ['overdue-deadlines'],
    queryFn: () => phase1API.getOverdueDeadlines(),
    staleTime: 2 * 60 * 1000, // 2 minutes for overdue items
  });
};

export const useHighRiskDeadlines = (minRiskScore = 70) => {
  return useQuery({
    queryKey: ['high-risk-deadlines', minRiskScore],
    queryFn: () => phase1API.getHighRiskDeadlines(minRiskScore),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateDeadline = () => {
  const queryClient = useQueryClient();
  const toast = usePhase1Toast();
  
  return useMutation({
    mutationFn: (data: CreateDeadlineForm) => phase1API.createDeadline(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadlines'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-deadlines'] });
      queryClient.invalidateQueries({ queryKey: ['overdue-deadlines'] });
      toast.success('Deadline created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create deadline');
    },
  });
};

export const useUpdateDeadline = () => {
  const queryClient = useQueryClient();
  const toast = usePhase1Toast();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDeadlineForm }) => 
      phase1API.updateDeadline(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['deadlines'] });
      queryClient.invalidateQueries({ queryKey: ['deadline', id] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-deadlines'] });
      queryClient.invalidateQueries({ queryKey: ['overdue-deadlines'] });
      toast.success('Deadline updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update deadline');
    },
  });
};

export const useCompleteDeadline = () => {
  const queryClient = useQueryClient();
  const toast = usePhase1Toast();
  
  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data: { completionPercentage: number; submittedDocuments?: string[]; notes?: string; }
    }) => phase1API.completeDeadline(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['deadlines'] });
      queryClient.invalidateQueries({ queryKey: ['deadline', id] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-deadlines'] });
      queryClient.invalidateQueries({ queryKey: ['overdue-deadlines'] });
      toast.success('Deadline completed successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to complete deadline');
    },
  });
};

export const useDeleteDeadline = () => {
  const queryClient = useQueryClient();
  const toast = usePhase1Toast();
  
  return useMutation({
    mutationFn: (id: string) => phase1API.deleteDeadline(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadlines'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-deadlines'] });
      queryClient.invalidateQueries({ queryKey: ['overdue-deadlines'] });
      toast.success('Deadline deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete deadline');
    },
  });
};

// Risk Assessments Hooks
export const useRiskAssessments = (filters?: RiskAssessmentFilters, page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['risk-assessments', filters, page, limit],
    queryFn: () => phase1API.getRiskAssessments(filters, page, limit),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useRiskAssessment = (id: string) => {
  return useQuery({
    queryKey: ['risk-assessment', id],
    queryFn: () => phase1API.getRiskAssessment(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useHighRiskAssessments = (minRiskScore = 70) => {
  return useQuery({
    queryKey: ['high-risk-assessments', minRiskScore],
    queryFn: () => phase1API.getHighRiskAssessments(minRiskScore),
    staleTime: 5 * 60 * 1000,
  });
};

export const useRecentRiskAssessments = (days = 7) => {
  return useQuery({
    queryKey: ['recent-risk-assessments', days],
    queryFn: () => phase1API.getRecentRiskAssessments(days),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateRiskAssessment = () => {
  const queryClient = useQueryClient();
  const toast = usePhase1Toast();
  
  return useMutation({
    mutationFn: (data: CreateRiskAssessmentForm) => phase1API.createRiskAssessment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risk-assessments'] });
      queryClient.invalidateQueries({ queryKey: ['high-risk-assessments'] });
      queryClient.invalidateQueries({ queryKey: ['recent-risk-assessments'] });
      toast.success('Risk assessment created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create risk assessment');
    },
  });
};

export const useRunRiskAssessment = () => {
  const queryClient = useQueryClient();
  const toast = usePhase1Toast();
  
  return useMutation({
    mutationFn: (deadlineId: string) => phase1API.runRiskAssessment(deadlineId),
    onSuccess: (_, deadlineId) => {
      queryClient.invalidateQueries({ queryKey: ['risk-assessments'] });
      queryClient.invalidateQueries({ queryKey: ['deadline', deadlineId] });
      queryClient.invalidateQueries({ queryKey: ['high-risk-assessments'] });
      toast.success('Risk assessment completed successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to run risk assessment');
    },
  });
};

// Alert Notifications Hooks
export const useNotifications = (filters?: NotificationFilters, page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['notifications', filters, page, limit],
    queryFn: () => phase1API.getNotifications(filters, page, limit),
    staleTime: 2 * 60 * 1000, // 2 minutes for notifications
    gcTime: 5 * 60 * 1000,
  });
};

export const useNotification = (id: string) => {
  return useQuery({
    queryKey: ['notification', id],
    queryFn: () => phase1API.getNotification(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

export const usePendingNotifications = () => {
  return useQuery({
    queryKey: ['pending-notifications'],
    queryFn: () => phase1API.getPendingNotifications(),
    staleTime: 1 * 60 * 1000, // 1 minute for pending items
    refetchInterval: 60 * 1000, // Auto-refresh every minute
  });
};

export const useFailedNotifications = () => {
  return useQuery({
    queryKey: ['failed-notifications'],
    queryFn: () => phase1API.getFailedNotifications(),
    staleTime: 2 * 60 * 1000,
  });
};

export const useSendNotification = () => {
  const queryClient = useQueryClient();
  const toast = usePhase1Toast();
  
  return useMutation({
    mutationFn: (data: SendNotificationForm) => phase1API.sendNotification(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['pending-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-notifications'] });
      toast.success('Notification sent successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send notification');
    },
  });
};

export const useResendNotification = () => {
  const queryClient = useQueryClient();
  const toast = usePhase1Toast();
  
  return useMutation({
    mutationFn: (id: string) => phase1API.resendNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['failed-notifications'] });
      toast.success('Notification resent successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to resend notification');
    },
  });
};

export const useAcknowledgeNotification = () => {
  const queryClient = useQueryClient();
  const toast = usePhase1Toast();
  
  return useMutation({
    mutationFn: ({ id, response }: { id: string; response?: string }) => 
      phase1API.acknowledgeNotification(id, response),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification acknowledged successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to acknowledge notification');
    },
  });
};

export const useEscalateNotification = () => {
  const queryClient = useQueryClient();
  const toast = usePhase1Toast();
  
  return useMutation({
    mutationFn: (id: string) => phase1API.escalateNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-notifications'] });
      toast.success('Notification escalated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to escalate notification');
    },
  });
};

// Dashboard Hooks
export const useDashboardWidgets = () => {
  return useQuery({
    queryKey: ['dashboard-widgets'],
    queryFn: () => phase1API.getDashboardWidgets(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useNotificationSummary = () => {
  return useQuery({
    queryKey: ['dashboard-notifications'],
    queryFn: () => phase1API.getNotificationSummary(),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000, // Auto-refresh every 2 minutes
  });
};

export const useDeadlineSummary = () => {
  return useQuery({
    queryKey: ['dashboard-deadlines'],
    queryFn: () => phase1API.getDeadlineSummary(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useRiskSummary = () => {
  return useQuery({
    queryKey: ['dashboard-risk'],
    queryFn: () => phase1API.getRiskSummary(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useRiskTrends = (days = 30) => {
  return useQuery({
    queryKey: ['risk-trends', days],
    queryFn: () => phase1API.getRiskTrends(days),
    staleTime: 10 * 60 * 1000,
  });
};

// Templates Hooks
export const useNotificationTemplates = () => {
  return useQuery({
    queryKey: ['notification-templates'],
    queryFn: () => phase1API.getNotificationTemplates(),
    staleTime: 10 * 60 * 1000,
  });
};

export const useNotificationSettings = () => {
  return useQuery({
    queryKey: ['notification-settings'],
    queryFn: () => phase1API.getNotificationSettings(),
    staleTime: 10 * 60 * 1000,
  });
};

// Statistics Hooks
export const useComplianceStatistics = (period = '30d') => {
  return useQuery({
    queryKey: ['compliance-statistics', period],
    queryFn: () => phase1API.getComplianceStatistics(period),
    staleTime: 15 * 60 * 1000,
  });
};

export const useRiskReport = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['risk-report', startDate, endDate],
    queryFn: () => phase1API.getRiskReport(startDate, endDate),
    enabled: !!startDate && !!endDate,
    staleTime: 30 * 60 * 1000,
  });
};

export const useNotificationReport = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['notification-report', startDate, endDate],
    queryFn: () => phase1API.getNotificationReport(startDate, endDate),
    enabled: !!startDate && !!endDate,
    staleTime: 30 * 60 * 1000,
  });
};

// Batch Operations Hooks
export const useBatchUpdateDeadlines = () => {
  const queryClient = useQueryClient();
  const toast = usePhase1Toast();
  
  return useMutation({
    mutationFn: ({ deadlineIds, updates }: { deadlineIds: string[]; updates: Partial<ComplianceDeadline> }) => 
      phase1API.batchUpdateDeadlines(deadlineIds, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadlines'] });
      toast.success('Deadlines updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update deadlines');
    },
  });
};

export const useBatchRunRiskAssessments = () => {
  const queryClient = useQueryClient();
  const toast = usePhase1Toast();
  
  return useMutation({
    mutationFn: (deadlineIds: string[]) => phase1API.batchRunRiskAssessments(deadlineIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risk-assessments'] });
      toast.success('Risk assessments started successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to start risk assessments');
    },
  });
};