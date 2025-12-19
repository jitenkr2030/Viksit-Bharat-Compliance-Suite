// Phase 2 React Hooks
// Government Portal Integration, AI Document Processing, Executive Analytics

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { 
  GovernmentPortal,
  AIDocument,
  ExecutiveDashboard,
  PaginatedResponse,
  PortalConnectionForm,
  DocumentUploadForm,
  ReportGenerationForm,
  DocumentSearchResult
} from '@/types/phase2';
import { phase2Api } from '@/api/phase2Api';

// Government Portal Hooks
export const useGovernmentPortals = () => {
  const [portals, setPortals] = useState<GovernmentPortal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPortals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await phase2Api.getConnectedPortals();
      if (response.success && response.data) {
        setPortals(response.data);
      }
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to fetch connected portals');
    } finally {
      setLoading(false);
    }
  }, []);

  const connectPortal = useCallback(async (portalData: PortalConnectionForm) => {
    try {
      setLoading(true);
      const response = await phase2Api.connectToPortal(portalData);
      if (response.success && response.data) {
        setPortals(prev => [...prev, response.data!]);
        toast.success('Successfully connected to portal');
        return response.data;
      }
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnectPortal = useCallback(async (portalId: string) => {
    try {
      setLoading(true);
      await phase2Api.disconnectPortal(portalId);
      setPortals(prev => prev.filter(portal => portal.id !== portalId));
      toast.success('Successfully disconnected from portal');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const syncPortal = useCallback(async (portalId: string) => {
    try {
      setLoading(true);
      await phase2Api.syncRequirements(portalId);
      toast.success('Portal sync completed');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortals();
  }, [fetchPortals]);

  return {
    portals,
    loading,
    error,
    fetchPortals,
    connectPortal,
    disconnectPortal,
    syncPortal,
    refetch: fetchPortals,
  };
};

export const usePortalDetails = (portalId: string | null) => {
  const [portal, setPortal] = useState<GovernmentPortal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPortalDetails = useCallback(async () => {
    if (!portalId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await phase2Api.getConnectedPortals();
      if (response.success && response.data) {
        const foundPortal = response.data.find(p => p.id === portalId);
        setPortal(foundPortal || null);
      }
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to fetch portal details');
    } finally {
      setLoading(false);
    }
  }, [portalId]);

  useEffect(() => {
    fetchPortalDetails();
  }, [fetchPortalDetails]);

  return {
    portal,
    loading,
    error,
    refetch: fetchPortalDetails,
  };
};

export const usePortalCompliance = (portalId: string | null) => {
  const [complianceStatus, setComplianceStatus] = useState<any>(null);
  const [deadlines, setDeadlines] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComplianceData = useCallback(async (timeframe = 'current') => {
    if (!portalId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const [statusResponse, deadlinesResponse, statsResponse] = await Promise.all([
        phase2Api.getComplianceStatus(portalId, timeframe),
        phase2Api.getPortalDeadlines(portalId),
        phase2Api.getPortalStatistics(portalId)
      ]);
      
      if (statusResponse.success) setComplianceStatus(statusResponse.data);
      if (deadlinesResponse.success) setDeadlines(deadlinesResponse.data);
      if (statsResponse.success) setStatistics(statsResponse.data);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to fetch compliance data');
    } finally {
      setLoading(false);
    }
  }, [portalId]);

  useEffect(() => {
    fetchComplianceData();
  }, [fetchComplianceData]);

  return {
    complianceStatus,
    deadlines,
    statistics,
    loading,
    error,
    refetch: fetchComplianceData,
  };
};

// AI Document Processing Hooks
export const useAIDocuments = (filters: any = {}) => {
  const [documents, setDocuments] = useState<AIDocument[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = { ...filters, ...params };
      const response = await phase2Api.getDocuments(queryParams);
      
      if (response.success && response.data) {
        setDocuments(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const uploadDocument = useCallback(async (uploadData: DocumentUploadForm) => {
    try {
      setLoading(true);
      const response = await phase2Api.uploadDocument(uploadData);
      if (response.success && response.data) {
        setDocuments(prev => [response.data!, ...prev]);
        toast.success('Document uploaded and processing started');
        return response.data;
      }
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteDocument = useCallback(async (documentId: string) => {
    try {
      await phase2Api.deleteDocument(documentId);
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      toast.success('Document deleted successfully');
    } catch (err: any) {
      toast.error(err.message);
    }
  }, []);

  const batchProcessDocuments = useCallback(async (documentIds: string[]) => {
    try {
      setLoading(true);
      await phase2Api.batchProcessDocuments(documentIds);
      toast.success('Batch processing started');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return {
    documents,
    pagination,
    loading,
    error,
    fetchDocuments,
    uploadDocument,
    deleteDocument,
    batchProcessDocuments,
    refetch: fetchDocuments,
  };
};

export const useDocumentDetails = (documentId: string | null) => {
  const [document, setDocument] = useState<AIDocument | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocumentDetails = useCallback(async () => {
    if (!documentId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await phase2Api.getDocumentById(documentId);
      if (response.success && response.data) {
        setDocument(response.data);
      }
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to fetch document details');
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  const extractText = useCallback(async (method = 'auto') => {
    if (!documentId) return;
    
    try {
      await phase2Api.extractTextFromDocument(documentId, method);
      toast.success('Text extraction completed');
      fetchDocumentDetails();
    } catch (err: any) {
      toast.error(err.message);
    }
  }, [documentId, fetchDocumentDetails]);

  const classifyDocument = useCallback(async (confidence = 0.8) => {
    if (!documentId) return;
    
    try {
      await phase2Api.classifyDocument(documentId, confidence);
      toast.success('Document classification completed');
      fetchDocumentDetails();
    } catch (err: any) {
      toast.error(err.message);
    }
  }, [documentId, fetchDocumentDetails]);

  const analyzeCompliance = useCallback(async (frameworks: string[] = ['general']) => {
    if (!documentId) return;
    
    try {
      await phase2Api.analyzeComplianceRequirements(documentId, frameworks);
      toast.success('Compliance analysis completed');
      fetchDocumentDetails();
    } catch (err: any) {
      toast.error(err.message);
    }
  }, [documentId, fetchDocumentDetails]);

  const generateSummary = useCallback(async (summaryType = 'executive') => {
    if (!documentId) return;
    
    try {
      await phase2Api.generateComplianceSummary(documentId, summaryType);
      toast.success('Summary generated successfully');
      fetchDocumentDetails();
    } catch (err: any) {
      toast.error(err.message);
    }
  }, [documentId, fetchDocumentDetails]);

  useEffect(() => {
    fetchDocumentDetails();
  }, [fetchDocumentDetails]);

  return {
    document,
    loading,
    error,
    extractText,
    classifyDocument,
    analyzeCompliance,
    generateSummary,
    refetch: fetchDocumentDetails,
  };
};

export const useDocumentSearch = () => {
  const [searchResults, setSearchResults] = useState<DocumentSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchDocuments = useCallback(async (
    query: string,
    filters: any = {},
    limit: number = 20
  ) => {
    try {
      setLoading(true);
      setError(null);
      const response = await phase2Api.searchDocuments(query, filters, limit);
      if (response.success && response.data) {
        setSearchResults(response.data);
      }
    } catch (err: any) {
      setError(err.message);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchResults(null);
    setError(null);
  }, []);

  return {
    searchResults,
    loading,
    error,
    searchDocuments,
    clearSearch,
  };
};

export const useDocumentStatistics = (period: string = '30d', documentType?: string) => {
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await phase2Api.getDocumentStatistics(period, documentType);
      if (response.success && response.data) {
        setStatistics(response.data);
      }
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  }, [period, documentType]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return {
    statistics,
    loading,
    error,
    refetch: fetchStatistics,
  };
};

// Executive Analytics Hooks
export const useExecutiveDashboard = (period: string = '30d', organizationId?: string) => {
  const [dashboard, setDashboard] = useState<ExecutiveDashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await phase2Api.getExecutiveDashboard(period, organizationId);
      if (response.success && response.data) {
        setDashboard(response.data);
      }
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to fetch executive dashboard');
    } finally {
      setLoading(false);
    }
  }, [period, organizationId]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    dashboard,
    loading,
    error,
    refetch: fetchDashboard,
  };
};

export const useComplianceScores = (
  period: string = '12m',
  organizationId?: string,
  breakdownBy: string = 'category'
) => {
  const [scores, setScores] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScores = useCallback(async (includeProjections: boolean = true) => {
    try {
      setLoading(true);
      setError(null);
      const response = await phase2Api.getComplianceScoreTrends(
        period,
        organizationId,
        breakdownBy,
        includeProjections
      );
      if (response.success && response.data) {
        setScores(response.data);
      }
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to fetch compliance scores');
    } finally {
      setLoading(false);
    }
  }, [period, organizationId, breakdownBy]);

  useEffect(() => {
    fetchScores();
  }, [fetchScores]);

  return {
    scores,
    loading,
    error,
    refetch: fetchScores,
  };
};

export const useRiskAnalysis = (
  period: string = '90d',
  organizationId?: string,
  riskTypes: string[] = ['operational', 'regulatory', 'financial']
) => {
  const [riskData, setRiskData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRiskAnalysis = useCallback(async (severity: string = 'all') => {
    try {
      setLoading(true);
      setError(null);
      const response = await phase2Api.getRiskAnalysis(
        period,
        organizationId,
        riskTypes,
        severity
      );
      if (response.success && response.data) {
        setRiskData(response.data);
      }
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to fetch risk analysis');
    } finally {
      setLoading(false);
    }
  }, [period, organizationId, riskTypes]);

  useEffect(() => {
    fetchRiskAnalysis();
  }, [fetchRiskAnalysis]);

  return {
    riskData,
    loading,
    error,
    refetch: fetchRiskAnalysis,
  };
};

export const useFinancialImpact = (
  period: string = '12m',
  organizationId?: string,
  currency: string = 'USD'
) => {
  const [financialData, setFinancialData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFinancialImpact = useCallback(async (includeProjections: boolean = true) => {
    try {
      setLoading(true);
      setError(null);
      const response = await phase2Api.getFinancialImpactAnalysis(
        period,
        organizationId,
        currency,
        includeProjections
      );
      if (response.success && response.data) {
        setFinancialData(response.data);
      }
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to fetch financial impact');
    } finally {
      setLoading(false);
    }
  }, [period, organizationId, currency]);

  useEffect(() => {
    fetchFinancialImpact();
  }, [fetchFinancialImpact]);

  return {
    financialData,
    loading,
    error,
    refetch: fetchFinancialImpact,
  };
};

export const useBenchmarking = (
  industry: string = 'general',
  companySize: string = 'all',
  organizationId?: string
) => {
  const [benchmarkData, setBenchmarkData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBenchmarking = useCallback(async (
    metrics: string[] = ['compliance_score', 'risk_level', 'cost_efficiency']
  ) => {
    try {
      setLoading(true);
      setError(null);
      const response = await phase2Api.getPerformanceBenchmarking(
        industry,
        companySize,
        organizationId,
        metrics
      );
      if (response.success && response.data) {
        setBenchmarkData(response.data);
      }
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to fetch benchmarking data');
    } finally {
      setLoading(false);
    }
  }, [industry, companySize, organizationId]);

  useEffect(() => {
    fetchBenchmarking();
  }, [fetchBenchmarking]);

  return {
    benchmarkData,
    loading,
    error,
    refetch: fetchBenchmarking,
  };
};

export const usePredictiveAnalytics = (
  forecastPeriod: string = '6m',
  organizationId?: string
) => {
  const [predictions, setPredictions] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPredictions = useCallback(async (
    predictionTypes: string[] = ['compliance_trends', 'risk_factors', 'resource_needs'],
    confidenceLevel: number = 0.8
  ) => {
    try {
      setLoading(true);
      setError(null);
      const response = await phase2Api.getPredictiveAnalytics(
        forecastPeriod,
        organizationId,
        predictionTypes,
        confidenceLevel
      );
      if (response.success && response.data) {
        setPredictions(response.data);
      }
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to fetch predictions');
    } finally {
      setLoading(false);
    }
  }, [forecastPeriod, organizationId]);

  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  return {
    predictions,
    loading,
    error,
    refetch: fetchPredictions,
  };
};

export const useRealTimeAlerts = (organizationId?: string) => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async (
    severity: string = 'medium',
    categories: string[] = ['compliance', 'risk', 'deadline'],
    limit: number = 20
  ) => {
    try {
      setLoading(true);
      setError(null);
      const response = await phase2Api.getRealTimeAlerts(
        organizationId,
        severity,
        categories,
        limit
      );
      if (response.success && response.data) {
        setAlerts(response.data);
      }
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchAlerts();
    // Set up polling for real-time updates
    const interval = setInterval(() => {
      fetchAlerts();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [fetchAlerts]);

  return {
    alerts,
    loading,
    error,
    refetch: fetchAlerts,
  };
};

export const useExecutiveReport = () => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReport = useCallback(async (reportData: ReportGenerationForm) => {
    try {
      setLoading(true);
      setError(null);
      const response = await phase2Api.generateExecutiveReport(reportData);
      if (response.success && response.data) {
        setReport(response.data);
        toast.success('Executive report generated successfully');
        return response.data;
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearReport = useCallback(() => {
    setReport(null);
    setError(null);
  }, []);

  return {
    report,
    loading,
    error,
    generateReport,
    clearReport,
  };
};

// Utility Hook for File Upload with Progress
export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadFile = useCallback(async (
    file: File,
    onProgress?: (progress: number) => void
  ) => {
    try {
      setUploading(true);
      setUploadProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.random() * 20;
          if (onProgress) onProgress(newProgress);
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 200);

      // Create upload form data
      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', 'general');
      formData.append('priority', 'medium');
      formData.append('autoClassify', 'true');

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/ai-documents/upload`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: formData,
        }
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      if (result.success) {
        toast.success('File uploaded successfully');
        return result.data;
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, []);

  return {
    uploading,
    uploadProgress,
    uploadFile,
  };
};

export default {
  useGovernmentPortals,
  usePortalDetails,
  usePortalCompliance,
  useAIDocuments,
  useDocumentDetails,
  useDocumentSearch,
  useDocumentStatistics,
  useExecutiveDashboard,
  useComplianceScores,
  useRiskAnalysis,
  useFinancialImpact,
  useBenchmarking,
  usePredictiveAnalytics,
  useRealTimeAlerts,
  useExecutiveReport,
  useFileUpload,
};