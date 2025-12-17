// Phase 2 TypeScript Types
// Government Portal Integration, AI Document Processing, Executive Analytics

export interface GovernmentPortal {
  id: string;
  portalType: 'UGC' | 'AICTE' | 'NAAC' | 'MHRD' | 'Other';
  portalName: string;
  connectionStatus: 'connected' | 'disconnected' | 'error' | 'syncing';
  lastSync: Date | null;
  credentials: PortalCredentials;
  settings: PortalSettings;
  complianceRequirements: ComplianceRequirement[];
  statistics: PortalStatistics;
  createdAt: Date;
  updatedAt: Date;
}

export interface PortalCredentials {
  username?: string;
  apiKey?: string;
  clientId?: string;
  clientSecret?: string;
  endpoint?: string;
  additionalFields?: Record<string, any>;
}

export interface PortalSettings {
  autoSync: boolean;
  syncFrequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  alertSettings: AlertSettings;
  documentSubmission: DocumentSubmissionSettings;
}

export interface AlertSettings {
  deadlineAlerts: boolean;
  statusChanges: boolean;
  complianceIssues: boolean;
  syncFailures: boolean;
}

export interface DocumentSubmissionSettings {
  autoSubmit: boolean;
  validationRequired: boolean;
  approvalWorkflow: boolean;
}

export interface ComplianceRequirement {
  id: string;
  portalId: string;
  requirementName: string;
  description: string;
  category: string;
  deadline: Date | null;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';
  documents: RequiredDocument[];
  assignedTo: string[];
  progress: number;
}

export interface RequiredDocument {
  id: string;
  name: string;
  type: string;
  format: string;
  isRequired: boolean;
  uploadStatus: 'pending' | 'uploaded' | 'verified' | 'rejected';
  aiAnalysis?: DocumentAnalysis;
}

export interface DocumentSubmission {
  id: string;
  portalId: string;
  documentType: string;
  documentData: Record<string, any>;
  submissionStatus: 'pending' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  verificationType: 'auto' | 'manual' | 'hybrid';
  submittedAt: Date;
  verifiedAt: Date | null;
  feedback: string | null;
}

export interface PortalStatistics {
  totalSubmissions: number;
  successfulSubmissions: number;
  failedSubmissions: number;
  pendingReviews: number;
  averageProcessingTime: number;
  complianceScore: number;
  lastMonthActivity: number;
}

export interface AIDocument {
  id: string;
  filename: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  documentType: 'academic' | 'administrative' | 'financial' | 'compliance' | 'general';
  status: 'uploaded' | 'processing' | 'completed' | 'failed' | 'needs_review';
  priority: 'low' | 'medium' | 'high' | 'critical';
  uploadDate: Date;
  processedAt: Date | null;
  extractedText?: string;
  aiAnalysis?: DocumentAnalysis;
  complianceAnalysis?: ComplianceAnalysis;
  keyInformation?: KeyInformation;
  summary?: DocumentSummary;
  metadata: DocumentMetadata;
  tags: string[];
  relatedDocuments: string[];
  processingHistory: ProcessingStep[];
}

export interface DocumentAnalysis {
  confidence: number;
  classification: DocumentClassification;
  qualityScore: number;
  readability: ReadabilityMetrics;
  extractionMethod: 'ocr' | 'native' | 'ai_extraction';
  processingTime: number;
  errors: string[];
  warnings: string[];
}

export interface DocumentClassification {
  primary: string;
  secondary: string[];
  confidence: number;
  suggestedTags: string[];
  complianceRelevance: ComplianceRelevance[];
}

export interface ComplianceRelevance {
  framework: string;
  relevanceScore: number;
  applicableSections: string[];
}

export interface ReadabilityMetrics {
  score: number;
  level: 'basic' | 'intermediate' | 'advanced';
  wordCount: number;
  sentenceCount: number;
  averageSentenceLength: number;
  complexWords: number;
}

export interface ComplianceAnalysis {
  framework: string;
  requirements: ExtractedRequirement[];
  gaps: ComplianceGap[];
  recommendations: ComplianceRecommendation[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  priority: number;
}

export interface ExtractedRequirement {
  id: string;
  title: string;
  description: string;
  section: string;
  deadline?: Date;
  responsible: string;
  status: 'not_applicable' | 'pending' | 'in_progress' | 'completed';
  compliance: number;
}

export interface ComplianceGap {
  id: string;
  title: string;
  description: string;
  severity: 'minor' | 'major' | 'critical';
  impact: string;
  remediation: string;
  deadline?: Date;
}

export interface ComplianceRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  implementation: string;
  timeline: string;
}

export interface KeyInformation {
  entities: ExtractedEntity[];
  dates: ExtractedDate[];
  numbers: ExtractedNumber[];
  organizations: ExtractedOrganization[];
  people: ExtractedPerson[];
  locations: ExtractedLocation[];
}

export interface ExtractedEntity {
  text: string;
  type: string;
  confidence: number;
  startPosition: number;
  endPosition: number;
}

export interface ExtractedDate {
  date: Date;
  originalText: string;
  confidence: number;
  context: string;
}

export interface ExtractedNumber {
  value: number;
  originalText: string;
  unit?: string;
  context: string;
  confidence: number;
}

export interface ExtractedOrganization {
  name: string;
  type: string;
  confidence: number;
  aliases: string[];
}

export interface ExtractedPerson {
  name: string;
  role?: string;
  confidence: number;
  context: string;
}

export interface ExtractedLocation {
  name: string;
  type: string;
  country?: string;
  state?: string;
  city?: string;
  confidence: number;
}

export interface DocumentSummary {
  type: 'executive' | 'detailed' | 'technical';
  title: string;
  content: string;
  keyPoints: string[];
  recommendations: string[];
  generatedAt: Date;
  confidence: number;
}

export interface DocumentMetadata {
  author?: string;
  creationDate?: Date;
  modificationDate?: Date;
  version?: string;
  language?: string;
  source?: string;
  tags: string[];
  customFields: Record<string, any>;
}

export interface ProcessingStep {
  step: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  result?: any;
  error?: string;
  duration?: number;
}

export interface DocumentSearchResult {
  documents: AIDocument[];
  totalCount: number;
  page: number;
  limit: number;
  searchQuery: string;
  searchFilters: SearchFilters;
  relevanceScores: Record<string, number>;
}

export interface SearchFilters {
  documentType?: string[];
  status?: string[];
  priority?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  tags?: string[];
  complianceFramework?: string[];
}

export interface DocumentStatistics {
  totalDocuments: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  processingQueue: QueueStatus;
  monthlyActivity: MonthlyActivity[];
  qualityMetrics: QualityMetrics;
}

export interface QueueStatus {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  averageWaitTime: number;
}

export interface MonthlyActivity {
  month: string;
  uploads: number;
  processing: number;
  completed: number;
  errors: number;
}

export interface QualityMetrics {
  averageQualityScore: number;
  averageProcessingTime: number;
  errorRate: number;
  userSatisfactionScore: number;
}

export interface ExecutiveMetric {
  id: string;
  metricName: string;
  metricType: 'compliance' | 'risk' | 'financial' | 'operational' | 'strategic';
  category: string;
  value: number;
  unit: string;
  target?: number;
  threshold?: {
    warning: number;
    critical: number;
  };
  trend: 'improving' | 'stable' | 'declining' | 'volatile';
  trendValue: number;
  period: string;
  organizationId: string;
  benchmark?: BenchmarkData;
  prediction?: MetricPrediction;
  createdAt: Date;
  updatedAt: Date;
}

export interface BenchmarkData {
  industryAverage: number;
  bestInClass: number;
  percentileRank: number;
  peerComparison: PeerComparison[];
}

export interface PeerComparison {
  organizationName: string;
  value: number;
  rank: number;
}

export interface MetricPrediction {
  value: number;
  confidence: number;
  timeframe: string;
  factors: PredictionFactor[];
  scenario: 'optimistic' | 'realistic' | 'pessimistic';
}

export interface PredictionFactor {
  name: string;
  impact: number;
  probability: number;
  description: string;
}

export interface ExecutiveDashboard {
  overview: DashboardOverview;
  complianceScores: ComplianceScoreData;
  riskAnalysis: RiskAnalysisData;
  deadlineTracking: DeadlineTrackingData;
  financialImpact: FinancialImpactData;
  regulatoryChanges: RegulatoryChangeData;
  kpis: KPIData;
  alerts: AlertData;
  recommendations: RecommendationData;
  timeRange: string;
  organizationId: string;
}

export interface DashboardOverview {
  overallScore: number;
  scoreChange: number;
  totalRisks: number;
  highRisks: number;
  criticalDeadlines: number;
  complianceGaps: number;
  monthlyTrend: TrendData[];
  lastUpdated: Date;
}

export interface ComplianceScoreData {
  currentScore: number;
  scoreChange: number;
  scoreBreakdown: ScoreBreakdown;
  trends: ScoreTrend[];
  projections: ScoreProjection[];
  industryBenchmark: number;
}

export interface ScoreBreakdown {
  regulatory: number;
  internal: number;
  quality: number;
  operational: number;
}

export interface ScoreTrend {
  period: string;
  score: number;
  target?: number;
  benchmark?: number;
}

export interface ScoreProjection {
  period: string;
  optimistic: number;
  realistic: number;
  pessimistic: number;
  confidence: number;
}

export interface RiskAnalysisData {
  overallRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskCount: Record<string, number>;
  riskMatrix: RiskMatrixItem[];
  riskTrends: RiskTrendData[];
  mitigation: MitigationData;
  heatMap: RiskHeatMapItem[];
}

export interface RiskMatrixItem {
  category: string;
  probability: number;
  impact: number;
  score: number;
  status: string;
}

export interface RiskTrendData {
  period: string;
  risks: number;
  mitigated: number;
  newRisks: number;
  highRisks: number;
}

export interface MitigationData {
  totalMitigations: number;
  completed: number;
  inProgress: number;
  planned: number;
  effectiveness: number;
}

export interface RiskHeatMapItem {
  category: string;
  subcategory: string;
  riskLevel: number;
  count: number;
  trend: string;
}

export interface DeadlineTrackingData {
  upcomingDeadlines: DeadlineItem[];
  overdueItems: DeadlineItem[];
  completionRate: number;
  averageDelay: number;
  criticalPath: CriticalPathItem[];
  predictions: DeadlinePrediction[];
}

export interface DeadlineItem {
  id: string;
  title: string;
  deadline: Date;
  priority: string;
  status: string;
  assignedTo: string[];
  progress: number;
  riskLevel: string;
}

export interface CriticalPathItem {
  id: string;
  task: string;
  dependencies: string[];
  duration: number;
  slack: number;
  criticality: number;
}

export interface DeadlinePrediction {
  deadline: Date;
  probability: number;
  riskFactors: string[];
  mitigationStrategies: string[];
}

export interface FinancialImpactData {
  totalCost: number;
  costChange: number;
  costBreakdown: CostBreakdown;
  roi: number;
  savings: number;
  projections: FinancialProjection[];
  benchmarks: FinancialBenchmark[];
}

export interface CostBreakdown {
  labor: number;
  technology: number;
  consulting: number;
  training: number;
  penalties: number;
  other: number;
}

export interface FinancialProjection {
  period: string;
  costs: number;
  savings: number;
  roi: number;
  confidence: number;
}

export interface FinancialBenchmark {
  metric: string;
  value: number;
  industryAverage: number;
  percentile: number;
}

export interface RegulatoryChangeData {
  recentChanges: RegulatoryChange[];
  impactAssessment: ChangeImpact[];
  pendingRegulations: PendingRegulation[];
  timeline: RegulatoryTimeline[];
}

export interface RegulatoryChange {
  id: string;
  title: string;
  description: string;
  effectiveDate: Date;
  jurisdiction: string;
  impactLevel: 'low' | 'medium' | 'high';
  affectedAreas: string[];
  requiredActions: string[];
  deadline: Date | null;
}

export interface ChangeImpact {
  area: string;
  impact: string;
  effort: string;
  timeline: string;
  resources: string[];
}

export interface PendingRegulation {
  id: string;
  title: string;
  proposedDate: Date;
  expectedEffectiveDate: Date;
  status: string;
  preparationNeeded: boolean;
}

export interface RegulatoryTimeline {
  date: Date;
  event: string;
  type: 'effective' | 'proposal' | 'comment' | 'deadline';
  impact: string;
}

export interface KPIData {
  operational: KPI[];
  strategic: KPI[];
  financial: KPI[];
  custom: KPI[];
  trends: KPITrend[];
  targets: KPITarget[];
}

export interface KPI {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: string;
  performance: 'excellent' | 'good' | 'acceptable' | 'poor' | 'critical';
  category: string;
  description: string;
}

export interface KPITrend {
  kpiId: string;
  period: string;
  value: number;
  target?: number;
  benchmark?: number;
}

export interface KPITarget {
  kpiId: string;
  targetValue: number;
  deadline: Date;
  status: string;
  progress: number;
}

export interface AlertData {
  critical: AlertItem[];
  warnings: AlertItem[];
  info: AlertItem[];
  totalCount: number;
  lastUpdate: Date;
}

export interface AlertItem {
  id: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  timestamp: Date;
  acknowledged: boolean;
  actionRequired: boolean;
  relatedEntities: string[];
}

export interface RecommendationData {
  strategic: Recommendation[];
  operational: Recommendation[];
  improvement: Recommendation[];
  totalCount: number;
  priority: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  timeline: string;
  benefits: string[];
  risks: string[];
  implementation: string;
  stakeholders: string[];
  estimatedCost?: number;
  expectedROI?: number;
}

export interface TrendData {
  period: string;
  value: number;
  change?: number;
  target?: number;
}

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Form Types
export interface PortalConnectionForm {
  portalType: string;
  credentials: {
    username?: string;
    apiKey?: string;
    clientId?: string;
    clientSecret?: string;
    endpoint?: string;
  };
  settings: {
    autoSync: boolean;
    syncFrequency: string;
    alertSettings: AlertSettings;
    documentSubmission: DocumentSubmissionSettings;
  };
}

export interface DocumentUploadForm {
  document: File;
  documentType: string;
  priority: string;
  autoClassify: boolean;
  tags: string[];
  metadata: Record<string, any>;
}

export interface ReportGenerationForm {
  reportType: string;
  period: string;
  sections: string[];
  format: string;
  includeCharts: boolean;
  organizationId?: string;
}