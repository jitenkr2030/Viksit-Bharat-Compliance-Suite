// Phase 2 API Client
// Government Portal Integration, AI Document Processing, Executive Analytics

import { 
  GovernmentPortal,
  PortalConnectionForm,
  ComplianceRequirement,
  AIDocument,
  DocumentUploadForm,
  DocumentSearchResult,
  ExecutiveDashboard,
  APIResponse,
  PaginatedResponse,
  ReportGenerationForm
} from '../types/phase2';

class Phase2ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const token = localStorage.getItem('token');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  private async requestFormData<T>(
    endpoint: string,
    formData: FormData,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const token = localStorage.getItem('token');
    
    const config: RequestInit = {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      body: formData,
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Government Portal API Methods
  async connectToPortal(portalData: PortalConnectionForm): Promise<APIResponse<GovernmentPortal>> {
    return this.request<GovernmentPortal>('/government-portal/connect', {
      method: 'POST',
      body: JSON.stringify(portalData),
    });
  }

  async getConnectedPortals(): Promise<APIResponse<GovernmentPortal[]>> {
    return this.request<GovernmentPortal[]>('/government-portal/connected');
  }

  async getPortalTypes(): Promise<APIResponse<any[]>> {
    return this.request<any[]>('/government-portal/portal-types');
  }

  async syncRequirements(portalId: string): Promise<APIResponse<any>> {
    return this.request(`/government-portal/sync-requirements/${portalId}`, {
      method: 'POST',
    });
  }

  async submitDocument(
    portalId: string,
    documentType: string,
    documentData: any,
    verificationType: string = 'auto'
  ): Promise<APIResponse<any>> {
    return this.request('/government-portal/submit-document', {
      method: 'POST',
      body: JSON.stringify({
        portalId,
        documentType,
        documentData,
        verificationType,
      }),
    });
  }

  async getComplianceStatus(
    portalId: string,
    timeframe: string = 'current'
  ): Promise<APIResponse<any>> {
    return this.request(`/government-portal/compliance-status/${portalId}?timeframe=${timeframe}`);
  }

  async getPortalDeadlines(
    portalId: string,
    status: string = 'upcoming',
    limit: number = 50
  ): Promise<APIResponse<ComplianceRequirement[]>> {
    return this.request<ComplianceRequirement[]>(
      `/government-portal/deadlines/${portalId}?status=${status}&limit=${limit}`
    );
  }

  async getPortalStatistics(
    portalId: string,
    period: string = '30d'
  ): Promise<APIResponse<any>> {
    return this.request(`/government-portal/statistics/${portalId}?period=${period}`);
  }

  async updatePortalConfiguration(
    portalId: string,
    settings: any,
    credentials?: any
  ): Promise<APIResponse<GovernmentPortal>> {
    return this.request(`/government-portal/config/${portalId}`, {
      method: 'PUT',
      body: JSON.stringify({ settings, credentials }),
    });
  }

  async disconnectPortal(portalId: string): Promise<APIResponse<void>> {
    return this.request(`/government-portal/disconnect/${portalId}`, {
      method: 'DELETE',
    });
  }

  async testPortalConnection(portalId: string): Promise<APIResponse<any>> {
    return this.request(`/government-portal/test-connection/${portalId}`, {
      method: 'POST',
    });
  }

  async syncAllPortals(): Promise<APIResponse<any>> {
    return this.request('/government-portal/sync-all', {
      method: 'POST',
    });
  }

  async processWebhook(
    portalId: string,
    webhookData: any
  ): Promise<APIResponse<any>> {
    return this.request(`/government-portal/webhook/${portalId}`, {
      method: 'POST',
      body: JSON.stringify(webhookData),
    });
  }

  // AI Document Processing API Methods
  async uploadDocument(uploadData: DocumentUploadForm): Promise<APIResponse<AIDocument>> {
    const formData = new FormData();
    formData.append('document', uploadData.document);
    formData.append('documentType', uploadData.documentType);
    formData.append('priority', uploadData.priority);
    formData.append('autoClassify', uploadData.autoClassify.toString());
    
    if (uploadData.tags.length > 0) {
      formData.append('tags', JSON.stringify(uploadData.tags));
    }
    
    if (uploadData.metadata) {
      formData.append('metadata', JSON.stringify(uploadData.metadata));
    }

    return this.requestFormData<AIDocument>('/ai-documents/upload', formData);
  }

  async getDocuments(params: {
    page?: number;
    limit?: number;
    documentType?: string;
    status?: string;
    priority?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }): Promise<APIResponse<PaginatedResponse<AIDocument>>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    return this.request<PaginatedResponse<AIDocument>>(`/ai-documents?${queryParams.toString()}`);
  }

  async getDocumentById(documentId: string): Promise<APIResponse<AIDocument>> {
    return this.request<AIDocument>(`/ai-documents/${documentId}`);
  }

  async extractTextFromDocument(
    documentId: string,
    method: string = 'auto'
  ): Promise<APIResponse<any>> {
    return this.request(`/ai-documents/${documentId}/extract-text`, {
      method: 'POST',
      body: JSON.stringify({ method }),
    });
  }

  async classifyDocument(
    documentId: string,
    confidence: number = 0.8
  ): Promise<APIResponse<any>> {
    return this.request(`/ai-documents/${documentId}/classify`, {
      method: 'POST',
      body: JSON.stringify({ confidence }),
    });
  }

  async analyzeComplianceRequirements(
    documentId: string,
    complianceFrameworks: string[] = ['general']
  ): Promise<APIResponse<any>> {
    return this.request(`/ai-documents/${documentId}/analyze-compliance`, {
      method: 'POST',
      body: JSON.stringify({ complianceFrameworks }),
    });
  }

  async extractKeyInformation(
    documentId: string,
    extractionType: string = 'comprehensive'
  ): Promise<APIResponse<any>> {
    return this.request(`/ai-documents/${documentId}/extract-key-info`, {
      method: 'POST',
      body: JSON.stringify({ extractionType }),
    });
  }

  async generateComplianceSummary(
    documentId: string,
    summaryType: string = 'executive'
  ): Promise<APIResponse<any>> {
    return this.request(`/ai-documents/${documentId}/generate-summary`, {
      method: 'POST',
      body: JSON.stringify({ summaryType }),
    });
  }

  async updateDocumentMetadata(
    documentId: string,
    metadata: any
  ): Promise<APIResponse<AIDocument>> {
    return this.request(`/ai-documents/${documentId}`, {
      method: 'PUT',
      body: JSON.stringify({ metadata }),
    });
  }

  async reprocessDocument(
    documentId: string,
    processingOptions: any = {}
  ): Promise<APIResponse<AIDocument>> {
    return this.request(`/ai-documents/${documentId}/reprocess`, {
      method: 'POST',
      body: JSON.stringify({ processingOptions }),
    });
  }

  async deleteDocument(documentId: string): Promise<APIResponse<void>> {
    return this.request(`/ai-documents/${documentId}`, {
      method: 'DELETE',
    });
  }

  async batchProcessDocuments(
    documentIds: string[],
    processingOptions: any = {}
  ): Promise<APIResponse<any>> {
    return this.request('/ai-documents/batch-process', {
      method: 'POST',
      body: JSON.stringify({ documentIds, processingOptions }),
    });
  }

  async getDocumentStatistics(
    period: string = '30d',
    documentType?: string
  ): Promise<APIResponse<any>> {
    const query = new URLSearchParams({ period });
    if (documentType) query.append('documentType', documentType);
    
    return this.request(`/ai-documents/statistics?${query.toString()}`);
  }

  async searchDocuments(
    query: string,
    filters: any = {},
    limit: number = 20
  ): Promise<APIResponse<DocumentSearchResult>> {
    return this.request('/ai-documents/search', {
      method: 'POST',
      body: JSON.stringify({ query, filters, limit }),
    });
  }

  async getProcessingQueueStatus(): Promise<APIResponse<any>> {
    return this.request('/ai-documents/queue/status');
  }

  async exportDocuments(
    documentIds: string[],
    format: string = 'json',
    filters: any = {}
  ): Promise<APIResponse<any>> {
    return this.request('/ai-documents/export', {
      method: 'POST',
      body: JSON.stringify({ documentIds, format, filters }),
    });
  }

  async validateDocumentQuality(
    documentId: string,
    qualityChecks: string[] = ['completeness', 'readability', 'format']
  ): Promise<APIResponse<any>> {
    return this.request(`/ai-documents/${documentId}/validate-quality`, {
      method: 'POST',
      body: JSON.stringify({ qualityChecks }),
    });
  }

  // Executive Analytics API Methods
  async getExecutiveDashboard(
    period: string = '30d',
    organizationId?: string
  ): Promise<APIResponse<ExecutiveDashboard>> {
    const query = new URLSearchParams({ period });
    if (organizationId) query.append('organizationId', organizationId);
    
    return this.request<ExecutiveDashboard>(`/executive-analytics/dashboard?${query.toString()}`);
  }

  async getComplianceScoreTrends(
    period: string = '12m',
    organizationId?: string,
    breakdownBy: string = 'category',
    includeProjections: boolean = true
  ): Promise<APIResponse<any>> {
    const query = new URLSearchParams({
      period,
      breakdownBy,
      includeProjections: includeProjections.toString(),
    });
    if (organizationId) query.append('organizationId', organizationId);
    
    return this.request(`/executive-analytics/compliance-scores?${query.toString()}`);
  }

  async getRiskAnalysis(
    period: string = '90d',
    organizationId?: string,
    riskTypes: string[] = ['operational', 'regulatory', 'financial'],
    severity: string = 'all'
  ): Promise<APIResponse<any>> {
    const query = new URLSearchParams({
      period,
      riskTypes: riskTypes.join(','),
      severity,
    });
    if (organizationId) query.append('organizationId', organizationId);
    
    return this.request(`/executive-analytics/risk-analysis?${query.toString()}`);
  }

  async getDeadlineTracking(
    period: string = '60d',
    organizationId?: string,
    categories: string = 'all',
    urgencyLevels: string[] = ['critical', 'high', 'medium']
  ): Promise<APIResponse<any>> {
    const query = new URLSearchParams({
      period,
      categories,
      urgencyLevels: urgencyLevels.join(','),
    });
    if (organizationId) query.append('organizationId', organizationId);
    
    return this.request(`/executive-analytics/deadline-tracking?${query.toString()}`);
  }

  async getFinancialImpactAnalysis(
    period: string = '12m',
    organizationId?: string,
    currency: string = 'USD',
    includeProjections: boolean = true
  ): Promise<APIResponse<any>> {
    const query = new URLSearchParams({
      period,
      currency,
      includeProjections: includeProjections.toString(),
    });
    if (organizationId) query.append('organizationId', organizationId);
    
    return this.request(`/executive-analytics/financial-impact?${query.toString()}`);
  }

  async getRegulatoryChanges(
    period: string = '6m',
    organizationId?: string,
    jurisdictions: string = 'all',
    impactLevel: string = 'medium'
  ): Promise<APIResponse<any>> {
    const query = new URLSearchParams({
      period,
      jurisdictions,
      impactLevel,
    });
    if (organizationId) query.append('organizationId', organizationId);
    
    return this.request(`/executive-analytics/regulatory-changes?${query.toString()}`);
  }

  async getPerformanceBenchmarking(
    industry: string = 'general',
    companySize: string = 'all',
    organizationId?: string,
    metrics: string[] = ['compliance_score', 'risk_level', 'cost_efficiency']
  ): Promise<APIResponse<any>> {
    const query = new URLSearchParams({
      industry,
      companySize,
      metrics: metrics.join(','),
    });
    if (organizationId) query.append('organizationId', organizationId);
    
    return this.request(`/executive-analytics/benchmarking?${query.toString()}`);
  }

  async getKeyPerformanceIndicators(
    period: string = '30d',
    organizationId?: string,
    kpiTypes: string[] = ['operational', 'strategic', 'financial'],
    customKPIs: string[] = []
  ): Promise<APIResponse<any>> {
    const query = new URLSearchParams({
      period,
      kpiTypes: kpiTypes.join(','),
      customKPIs: customKPIs.join(','),
    });
    if (organizationId) query.append('organizationId', organizationId);
    
    return this.request(`/executive-analytics/kpis?${query.toString()}`);
  }

  async getPredictiveAnalytics(
    forecastPeriod: string = '6m',
    organizationId?: string,
    predictionTypes: string[] = ['compliance_trends', 'risk_factors', 'resource_needs'],
    confidenceLevel: number = 0.8
  ): Promise<APIResponse<any>> {
    const query = new URLSearchParams({
      forecastPeriod,
      predictionTypes: predictionTypes.join(','),
      confidenceLevel: confidenceLevel.toString(),
    });
    if (organizationId) query.append('organizationId', organizationId);
    
    return this.request(`/executive-analytics/predictions?${query.toString()}`);
  }

  async getResourceUtilizationAnalysis(
    period: string = '30d',
    organizationId?: string,
    resourceTypes: string[] = ['human', 'financial', 'technological'],
    efficiencyMetrics: boolean = true
  ): Promise<APIResponse<any>> {
    const query = new URLSearchParams({
      period,
      resourceTypes: resourceTypes.join(','),
      efficiencyMetrics: efficiencyMetrics.toString(),
    });
    if (organizationId) query.append('organizationId', organizationId);
    
    return this.request(`/executive-analytics/resource-utilization?${query.toString()}`);
  }

  async getAuditReadinessScore(
    organizationId?: string,
    auditTypes: string[] = ['internal', 'external', 'regulatory'],
    readinessLevel: string = 'comprehensive'
  ): Promise<APIResponse<any>> {
    const query = new URLSearchParams({
      auditTypes: auditTypes.join(','),
      readinessLevel,
    });
    if (organizationId) query.append('organizationId', organizationId);
    
    return this.request(`/executive-analytics/audit-readiness?${query.toString()}`);
  }

  async getComplianceCostAnalysis(
    period: string = '12m',
    organizationId?: string,
    costCategories: string = 'all',
    includeForecasting: boolean = true
  ): Promise<APIResponse<any>> {
    const query = new URLSearchParams({
      period,
      costCategories,
      includeForecasting: includeForecasting.toString(),
    });
    if (organizationId) query.append('organizationId', organizationId);
    
    return this.request(`/executive-analytics/compliance-costs?${query.toString()}`);
  }

  async generateExecutiveReport(
    reportData: ReportGenerationForm
  ): Promise<APIResponse<any>> {
    return this.request('/executive-analytics/generate-report', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }

  async getRealTimeAlerts(
    organizationId?: string,
    severity: string = 'medium',
    categories: string[] = ['compliance', 'risk', 'deadline'],
    limit: number = 20
  ): Promise<APIResponse<any>> {
    const query = new URLSearchParams({
      severity,
      categories: categories.join(','),
      limit: limit.toString(),
    });
    if (organizationId) query.append('organizationId', organizationId);
    
    return this.request(`/executive-analytics/real-time-alerts?${query.toString()}`);
  }

  async getStrategicRecommendations(
    organizationId?: string,
    priority: string = 'high',
    categories: string[] = ['improvement', 'optimization', 'strategic'],
    implementationHorizon: string = '6m'
  ): Promise<APIResponse<any>> {
    const query = new URLSearchParams({
      priority,
      categories: categories.join(','),
      implementationHorizon,
    });
    if (organizationId) query.append('organizationId', organizationId);
    
    return this.request(`/executive-analytics/recommendations?${query.toString()}`);
  }

  async updateMetricConfiguration(
    metricId: string,
    configuration: any
  ): Promise<APIResponse<any>> {
    return this.request(`/executive-analytics/metric-config/${metricId}`, {
      method: 'PUT',
      body: JSON.stringify({ configuration }),
    });
  }

  async exportAnalyticsData(
    dataTypes: string[] = ['metrics', 'trends', 'predictions'],
    period: string = '30d',
    organizationId?: string,
    format: string = 'excel',
    filters: any = {}
  ): Promise<APIResponse<any>> {
    return this.request('/executive-analytics/export', {
      method: 'POST',
      body: JSON.stringify({
        dataTypes,
        period,
        organizationId,
        format,
        filters,
      }),
    });
  }

  async getIndustryComparison(
    industry: string = 'general',
    companySize: string = 'all',
    organizationId?: string,
    comparisonMetrics: string[] = ['compliance_score', 'cost_efficiency', 'risk_level']
  ): Promise<APIResponse<any>> {
    const query = new URLSearchParams({
      industry,
      companySize,
      comparisonMetrics: comparisonMetrics.join(','),
    });
    if (organizationId) query.append('organizationId', organizationId);
    
    return this.request(`/executive-analytics/industry-comparison?${query.toString()}`);
  }

  async getTimeSeriesData(
    metricName: string,
    period: string = '12m',
    organizationId?: string,
    granularity: string = 'monthly',
    includeForecast: boolean = true
  ): Promise<APIResponse<any>> {
    const query = new URLSearchParams({
      period,
      granularity,
      includeForecast: includeForecast.toString(),
    });
    if (organizationId) query.append('organizationId', organizationId);
    
    return this.request(`/executive-analytics/time-series/${metricName}?${query.toString()}`);
  }
}

export const phase2Api = new Phase2ApiClient();
export default phase2Api;