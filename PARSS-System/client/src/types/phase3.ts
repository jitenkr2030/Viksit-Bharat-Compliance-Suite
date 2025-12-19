// Phase 3: Medium-term Impact - Blockchain, IoT, and AI Assistant Types

// Blockchain Compliance Records Types
export interface BlockchainRecord {
  id: string;
  recordHash: string;
  transactionHash: string;
  blockNumber: number;
  dataType: 'compliance' | 'document' | 'accreditation' | 'audit' | 'report';
  data: any;
  timestamp: Date;
  creatorId: string;
  metadata: BlockchainMetadata;
  chainId: string;
  networkType: 'testnet' | 'mainnet';
  isVerified: boolean;
  verificationDate?: Date;
  ipfsHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlockchainMetadata {
  title: string;
  description: string;
  category: string;
  tags: string[];
  institutionId?: string;
  complianceFramework?: string;
  regulatoryStandard?: string;
  expiryDate?: Date;
  version: string;
  author: string;
  checksum: string;
}

export interface BlockchainTransaction {
  id: string;
  transactionHash: string;
  blockNumber: number;
  gasUsed: number;
  gasPrice: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: Date;
  from: string;
  to: string;
  value: string;
  method: string;
  arguments: any[];
  events: BlockchainEvent[];
  createdAt: Date;
}

export interface BlockchainEvent {
  eventName: string;
  data: any;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
}

// IoT Smart Campus Integration Types
export interface IoTDevice {
  id: string;
  deviceId: string;
  name: string;
  type: IoTDeviceType;
  category: IoTDeviceCategory;
  location: IoTLocation;
  status: IoTDeviceStatus;
  configuration: IoTConfiguration;
  capabilities: IoTCapability[];
  lastHeartbeat: Date;
  batteryLevel?: number;
  firmwareVersion: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  installationDate: Date;
  maintenanceSchedule: MaintenanceSchedule;
  alerts: IoTAlert[];
  complianceZones: string[];
  dataRetentionPeriod: number; // days
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type IoTDeviceType = 
  | 'environmental_sensor'
  | 'security_camera'
  | 'access_control'
  | 'fire_detector'
  | 'smoke_detector'
  | 'temperature_sensor'
  | 'humidity_sensor'
  | 'air_quality_sensor'
  | 'motion_detector'
  | 'occupancy_sensor'
  | 'energy_meter'
  | 'water_leak_detector'
  | 'emergency_button'
  | 'smart_lock'
  | 'lighting_controller';

export type IoTDeviceCategory = 
  | 'safety_security'
  | 'environmental_monitoring'
  | 'access_control'
  | 'energy_management'
  | 'emergency_systems'
  | 'infrastructure_monitoring';

export interface IoTLocation {
  building: string;
  floor: string;
  room: string;
  zone: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  address: string;
}

export type IoTDeviceStatus = 
  | 'online'
  | 'offline'
  | 'maintenance'
  | 'error'
  | 'low_battery'
  | 'calibration_needed';

export interface IoTConfiguration {
  samplingRate: number; // seconds
  transmissionInterval: number; // seconds
  alertThresholds: AlertThresholds;
  calibrationSettings: CalibrationSettings;
  dataFormat: string;
  encryptionEnabled: boolean;
  backupFrequency: number; // hours
  retentionPolicy: DataRetentionPolicy;
}

export interface AlertThresholds {
  temperature?: {
    min: number;
    max: number;
  };
  humidity?: {
    min: number;
    max: number;
  };
  airQuality?: {
    min: number;
    max: number;
  };
  motion?: {
    sensitivity: number;
  };
  occupancy?: {
    minCount: number;
    maxCount: number;
  };
  battery?: {
    minLevel: number;
  };
}

export interface CalibrationSettings {
  autoCalibration: boolean;
  calibrationInterval: number; // days
  referenceValues: any;
  lastCalibration: Date;
  nextCalibration: Date;
}

export interface DataRetentionPolicy {
  rawDataRetention: number; // days
  processedDataRetention: number; // days
  aggregatedDataRetention: number; // days
  compressAfter: number; // days
  deleteAfter: number; // days
}

export interface IoTCapability {
  name: string;
  type: 'sensor' | 'actuator' | 'camera' | 'communication';
  supportedActions: string[];
  dataTypes: string[];
  range?: {
    min: number;
    max: number;
  };
  units?: string;
}

export interface MaintenanceSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  lastMaintenance: Date;
  nextMaintenance: Date;
  tasks: MaintenanceTask[];
  assignedTo: string;
  estimatedDuration: number; // minutes
}

export interface MaintenanceTask {
  id: string;
  name: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedDuration: number; // minutes
  requiredSkills: string[];
  tools: string[];
  parts: string[];
  safetyRequirements: string[];
  isCompleted: boolean;
  completedAt?: Date;
  completedBy?: string;
  notes?: string;
}

export interface IoTAlert {
  id: string;
  deviceId: string;
  alertType: IoTAlertType;
  severity: IoTAlertSeverity;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  actions: AlertAction[];
  metadata: any;
}

export type IoTAlertType = 
  | 'threshold_exceeded'
  | 'device_offline'
  | 'low_battery'
  | 'malfunction'
  | 'calibration_needed'
  | 'maintenance_due'
  | 'security_breach'
  | 'fire_detected'
  | 'gas_leak'
  | 'water_leak'
  | 'unauthorized_access';

export type IoTAlertSeverity = 
  | 'info'
  | 'warning'
  | 'critical'
  | 'emergency';

export interface AlertAction {
  id: string;
  type: 'email' | 'sms' | 'push_notification' | 'webhook' | 'automatic_response';
  target: string;
  configuration: any;
  isEnabled: boolean;
  lastTriggered?: Date;
  triggerCount: number;
}

export interface IoTSensorData {
  id: string;
  deviceId: string;
  timestamp: Date;
  dataType: IoTDataType;
  value: any;
  unit?: string;
  quality: DataQuality;
  location: IoTLocation;
  metadata: any;
  processed: boolean;
  aggregated: boolean;
  retentionDate: Date;
  createdAt: Date;
}

export type IoTDataType = 
  | 'temperature'
  | 'humidity'
  | 'air_quality_index'
  | 'co2_level'
  | 'motion_detected'
  | 'occupancy_count'
  | 'light_level'
  | 'sound_level'
  | 'vibration'
  | 'pressure'
  | 'energy_consumption'
  | 'water_flow'
  | 'gas_level'
  | 'smoke_density'
  | 'fire_sensitivity';

export type DataQuality = 
  | 'excellent'
  | ' 'fair'
 good'
  | | 'poor'
  | 'invalid';

// AI Assistant Types
export interface AIAssistant {
  id: string;
  name: string;
  type: AIAssistantType;
  version: string;
  capabilities: AICapability[];
  configuration: AIConfiguration;
  knowledgeBase: KnowledgeBase;
  trainingData: TrainingData;
  performance: AIPerformance;
  usage: AIUsage;
  integration: AIIntegration;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type AIAssistantType = 
  | 'compliance_guide'
  | 'document_analyzer'
  | 'risk_assessor'
  | 'regulatory_expert'
  | 'audit_assistant'
  | 'policy_reviewer'
  | 'training_companion'
  | 'general_advisor';

export interface AICapability {
  name: string;
  description: string;
  category: 'compliance' | 'analysis' | 'recommendation' | 'automation' | 'training';
  confidence: number; // 0-1
  accuracy: number; // 0-1
  supportedLanguages: string[];
  requiresContext: boolean;
  examples: string[];
}

export interface AIConfiguration {
  modelVersion: string;
  temperature: number; // 0-1 for creativity
  maxTokens: number;
  responseTimeout: number; // seconds
  contextWindow: number; // tokens
  personalization: PersonalizationSettings;
  safety: AISafetySettings;
  integrations: AIIntegrationSettings;
}

export interface PersonalizationSettings {
  preferredTone: 'formal' | 'casual' | 'professional' | 'friendly';
  explanationLevel: 'brief' | 'detailed' | 'comprehensive';
  languagePreference: string;
  domainExpertise: string[];
  userRole: string;
  institutionContext: string;
}

export interface AISafetySettings {
  contentFiltering: boolean;
  biasDetection: boolean;
  toxicityChecking: boolean;
  factChecking: boolean;
  allowedDomains: string[];
  blockedTopics: string[];
  escalationRules: EscalationRule[];
}

export interface EscalationRule {
  condition: string;
  action: 'human_review' | 'redirect' | 'block' | 'alert';
  target: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface AIIntegrationSettings {
  databaseConnections: string[];
  apiEndpoints: string[];
  webhookUrls: string[];
  notificationChannels: string[];
  externalServices: string[];
}

export interface KnowledgeBase {
  id: string;
  name: string;
 [];
  last sources: KnowledgeSourceUpdated: Date;
  version: string;
  size: number; // number of documents
  coverage: KnowledgeCoverage;
  accuracy: number; // 0-1
  freshness: number; // 0-1
}

export interface KnowledgeSource {
  type: 'document' | 'regulation' | 'standard' | 'policy' | 'case_study' | 'faq';
  name: string;
  url?: string;
  lastUpdated: Date;
  priority: number; // 1-10
  isActive: boolean;
  accessLevel: 'public' | 'internal' | 'confidential' | 'restricted';
}

export interface KnowledgeCoverage {
  regulatoryFrameworks: string[];
  complianceAreas: string[];
  industrySectors: string[];
  geographicRegions: string[];
  updateFrequency: string;
  completeness: number; // 0-1
}

export interface TrainingData {
  id: string;
  dataset: string;
  size: number; // number of examples
  lastTrained: Date;
  performance: ModelPerformance;
  validation: ValidationMetrics;
  quality: DataQualityMetrics;
  sources: string[];
  bias: BiasMetrics;
}

export interface ModelPerformance {
  accuracy: number; // 0-1
  precision: number; // 0-1
  recall: number; // 0-1
  f1Score: number; // 0-1
  responseTime: number; // milliseconds
  throughput: number; // requests per second
}

export interface ValidationMetrics {
  crossValidationScore: number; // 0-1
  testAccuracy: number; // 0-1
  overfittingScore: number; // 0-1
  generalizationError: number; // 0-1
}

export interface DataQualityMetrics {
  completeness: number; // 0-1
  consistency: number; // 0-1
  accuracy: number; // 0-1
  timeliness: number; // 0-1
  validity: number; // 0-1
}

export interface BiasMetrics {
  demographicBias: number; // 0-1
  geographicBias: number; // 0-1
  temporalBias: number; // 0-1
  representationBias: number; // 0-1
}

export interface AIPerformance {
  overall: AIOverallPerformance;
  byCapability: CapabilityPerformance[];
  trends: PerformanceTrend[];
  bottlenecks: PerformanceBottleneck[];
  recommendations: PerformanceRecommendation[];
}

export interface AIOverallPerformance {
  averageResponseTime: number; // milliseconds
  successRate: number; // 0-1
  userSatisfaction: number; // 0-1
  taskCompletionRate: number; // 0-1
  errorRate: number; // 0-1
  uptime: number; // percentage
  lastMonth: number; // timestamp
}

export interface CapabilityPerformance {
  capability: string;
  responseTime: number; // milliseconds
  accuracy: number; // 0-1
  usageCount: number;
  successRate: number; // 0-1
  userRating: number; // 0-5
}

export interface PerformanceTrend {
  metric: string;
  period: string;
  value: number;
  change: number; // percentage change
  direction: 'improving' | 'declining' | 'stable';
  significance: number; // 0-1
}

export interface PerformanceBottleneck {
  component: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  affectedCapabilities: string[];
  suggestedActions: string[];
}

export interface PerformanceRecommendation {
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'optimization' | 'training' | 'infrastructure' | 'integration';
  description: string;
  expectedImpact: string;
  implementation: ImplementationGuide;
}

export interface ImplementationGuide {
  steps: string[];
  resources: string[];
  timeline: string;
  risks: string[];
  successCriteria: string[];
}

export interface AIUsage {
  totalRequests: number;
  requestsByType: { [key: string]: number };
  activeUsers: number;
  peakUsage: UsagePeak;
  patterns: UsagePattern[];
  costs: UsageCosts;
  efficiency: UsageEfficiency;
}

export interface UsagePeak {
  timestamp: Date;
  requestsPerMinute: number;
  concurrentUsers: number;
  responseTime: number; // milliseconds
  errorRate: number; // 0-1
}

export interface UsagePattern {
  type: 'time_based' | 'user_based' | 'capability_based' | 'geographic';
  description: string;
  frequency: string;
  insights: string[];
  recommendations: string[];
}

export interface UsageCosts {
  totalCost: number; // in currency
  costByRequest: number; // per request
  costByCapability: { [key: string]: number };
  monthlyTrend: CostTrend[];
  optimization: CostOptimization[];
}

export interface CostTrend {
  month: string;
  cost: number;
  requests: number;
  averageCostPerRequest: number;
}

export interface CostOptimization {
  area: string;
  potentialSavings: number;
  implementation: string;
  timeline: string;
}

export interface UsageEfficiency {
  averageResponseTime: number; // milliseconds
  taskCompletionRate: number; // 0-1
  userSatisfaction: number; // 0-5
  resourceUtilization: number; // 0-1
  bottlenecks: string[];
  improvements: string[];
}

export interface AIIntegration {
  platforms: IntegrationPlatform[];
  apis: IntegrationAPI[];
  webhooks: IntegrationWebhook[];
  databases: IntegrationDatabase[];
  services: IntegrationService[];
  security: IntegrationSecurity;
  monitoring: IntegrationMonitoring;
}

export interface IntegrationPlatform {
  name: string;
  type: 'internal' | 'external' | 'third_party';
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  capabilities: string[];
  configuration: any;
  lastSync: Date;
}

export interface IntegrationAPI {
  name: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  authentication: string;
  rateLimit: number; // requests per minute
  timeout: number; // seconds
  retryPolicy: RetryPolicy;
  documentation: string;
}

export interface RetryPolicy {
  maxRetries: number;
  backoffStrategy: 'linear' | 'exponential' | 'fixed';
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  retryableErrors: string[];
}

export interface IntegrationWebhook {
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  lastTriggered?: Date;
  failureCount: number;
  maxFailures: number;
}

export interface IntegrationDatabase {
  name: string;
  type: 'sql' | 'nosql' | 'graph' | 'time_series';
  connection: DatabaseConnection;
  schema: DatabaseSchema;
  indexes: DatabaseIndex[];
  backup: BackupConfiguration;
}

export interface DatabaseConnection {
  host: string;
  port: number;
  database: string;
  username: string;
  ssl: boolean;
  poolSize: number;
  timeout: number; // seconds
}

export interface DatabaseSchema {
  tables: DatabaseTable[];
  relationships: DatabaseRelationship[];
  constraints: DatabaseConstraint[];
}

export interface DatabaseTable {
  name: string;
  columns: DatabaseColumn[];
  primaryKey: string;
  indexes: string[];
}

export interface DatabaseColumn {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: any;
  constraints: string[];
}

export interface DatabaseRelationship {
  from: string;
  to: string;
  type: 'one_to_one' | 'one_to_many' | 'many_to_many';
  foreignKey: string;
}

export interface DatabaseConstraint {
  name: string;
  type: 'unique' | 'check' | 'foreign_key' | 'primary_key';
  definition: string;
}

export interface DatabaseIndex {
  name: string;
  columns: string[];
  unique: boolean;
  type: string;
}

export interface BackupConfiguration {
  enabled: boolean;
  frequency: string;
  retention: number; // days
  destination: string;
  encryption: boolean;
}

export interface IntegrationService {
  name: string;
  type: 'ai_model' | 'ml_pipeline' | 'data_processor' | 'notification' | 'storage';
  configuration: any;
  health: ServiceHealth;
  performance: ServicePerformance;
}

export interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  lastCheck: Date;
  checks: HealthCheck[];
  uptime: number; // percentage
  downtime: number; // minutes
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  duration: number; // milliseconds
  timestamp: Date;
}

export interface ServicePerformance {
  responseTime: number; // milliseconds
  throughput: number; // requests per second
  errorRate: number; // 0-1
  resourceUtilization: number; // 0-1
}

export interface IntegrationSecurity {
  encryption: SecurityEncryption;
  authentication: SecurityAuthentication;
  authorization: SecurityAuthorization;
  audit: SecurityAudit;
}

export interface SecurityEncryption {
  algorithm: string;
  keyRotation: number; // days
  inTransit: boolean;
  atRest: boolean;
  certificates: SecurityCertificate[];
}

export interface SecurityCertificate {
  type: 'ssl' | 'api' | 'signing';
  issuedBy: string;
  validFrom: Date;
  validTo: Date;
  fingerprint: string;
  isActive: boolean;
}

export interface SecurityAuthentication {
  method: 'oauth2' | 'api_key' | 'jwt' | 'basic' | 'certificate';
  configuration: any;
  sessionTimeout: number; // minutes
  maxSessions: number;
}

export interface SecurityAuthorization {
  model: 'rbac' | 'abac' | 'pbac';
  roles: SecurityRole[];
  permissions: SecurityPermission[];
  policies: SecurityPolicy[];
}

export interface SecurityRole {
  name: string;
  description: string;
  permissions: string[];
  users: string[];
}

export interface SecurityPermission {
  resource: string;
  action: string;
  conditions: string[];
}

export interface SecurityPolicy {
  name: string;
  description: string;
  effect: 'allow' | 'deny';
  conditions: string[];
  actions: string[];
}

export interface SecurityAudit {
  enabled: boolean;
  level: 'basic' | 'detailed' | 'comprehensive';
  retention: number; // days
  alerts: SecurityAlert[];
  reports: SecurityReport[];
}

export interface SecurityAlert {
  id: string;
  type: 'unauthorized_access' | 'data_breach' | 'anomaly' | 'policy_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

export interface SecurityReport {
  id: string;
  type: 'access_log' | 'audit_trail' | 'compliance' | 'security_assessment';
  generatedAt: Date;
  period: string;
  summary: string;
  findings: string[];
  recommendations: string[];
}

export interface IntegrationMonitoring {
  metrics: MonitoringMetric[];
  dashboards: MonitoringDashboard[];
  alerts: MonitoringAlert[];
  logs: MonitoringLog[];
}

export interface MonitoringMetric {
  name: string;
  type: 'counter' | 'gauge' | 'histogram' | 'timer';
  value: number;
  unit: string;
  timestamp: Date;
  labels: { [key: string]: string };
}

export interface MonitoringDashboard {
  name: string;
  description: string;
  widgets: DashboardWidget[];
  refreshRate: number; // seconds
  isPublic: boolean;
}

export interface DashboardWidget {
  type: 'chart' | 'table' | 'stat' | 'alert' | 'log';
  title: string;
  query: string;
  visualization: string;
  configuration: any;
}

export interface MonitoringAlert {
  name: string;
  condition: string;
  threshold: number;
  duration: number; // seconds
  severity: 'info' | 'warning' | 'critical';
  actions: string[];
  isEnabled: boolean;
}

export interface MonitoringLog {
  id: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: Date;
  source: string;
  metadata: any;
}

// AI Chat Message Types
export interface AIChatMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  contentType: 'text' | 'code' | 'markdown' | 'json' | 'file';
  metadata: ChatMetadata;
  attachments: ChatAttachment[];
  timestamp: Date;
  tokens: number;
  confidence: number; // 0-1
  feedback: ChatFeedback;
  parentMessageId?: string;
  children: string[]; // message IDs
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMetadata {
  sessionId: string;
  userId: string;
  context: ChatContext;
  capabilities: string[];
  language: string;
  domain: string;
  complexity: 'simple' | 'moderate' | 'complex';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
}

export interface ChatContext {
  institution: string;
  userRole: string;
  currentPage: string;
  previousMessages: string[];
  knowledgeBase: string[];
  preferences: ChatPreferences;
  constraints: ChatConstraints;
}

export interface ChatPreferences {
  responseLength: 'brief' | 'detailed' | 'comprehensive';
  explanationStyle: 'technical' | 'business' | 'casual';
  language: string;
  timezone: string;
  notificationPreferences: string[];
}

export interface ChatConstraints {
  maxResponseTime: number; // seconds
  requiredDomains: string[];
  prohibitedContent: string[];
  escalationTriggers: string[];
  dataRetentionPeriod: number; // days
}

export interface ChatAttachment {
  id: string;
  name: string;
  type: 'document' | 'image' | 'data' | 'link';
  url?: string;
  size: number; // bytes
  mimeType: string;
  uploadedAt: Date;
  isProcessed: boolean;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface ChatFeedback {
  rating?: number; // 1-5
  helpful: boolean;
  accurate: boolean;
  complete: boolean;
  comments?: string;
  timestamp: Date;
  categories: FeedbackCategory[];
}

export interface FeedbackCategory {
  category: 'accuracy' | 'relevance' | 'completeness' | 'clarity' | 'usefulness';
  score: number; // 1-5
  comment?: string;
}

// Dashboard and Analytics Types
export interface Phase3Dashboard {
  overview: Phase3Overview;
  blockchain: BlockchainDashboard;
  iot: IoTDashboard;
  aiAssistant: AIAssistantDashboard;
  alerts: Phase3Alerts;
  insights: Phase3Insights;
}

export interface Phase3Overview {
  totalDevices: number;
  activeDevices: number;
  blockchainRecords: number;
  aiInteractions: number;
  systemHealth: HealthStatus;
  performance: PerformanceMetrics;
  trends: Phase3Trend[];
}

export interface HealthStatus {
  overall: 'healthy' | 'degraded' | 'critical';
  components: ComponentHealth[];
  lastCheck: Date;
  uptime: number; // percentage
}

export interface ComponentHealth {
  component: string;
  status: 'healthy' | 'degraded' | 'critical' | 'unknown';
  uptime: number; // percentage
  responseTime: number; // milliseconds
  errorRate: number; // 0-1
  lastCheck: Date;
}

export interface PerformanceMetrics {
  responseTime: number; // milliseconds
  throughput: number; // requests per second
  accuracy: number; // 0-1
  availability: number; // 0-1
  userSatisfaction: number; // 0-5
}

export interface Phase3Trend {
  metric: string;
  period: string;
  value: number;
  change: number; // percentage
  direction: 'up' | 'down' | 'stable';
  significance: number; // 0-1
}

export interface BlockchainDashboard {
  records: BlockchainRecord[];
  transactions: BlockchainTransaction[];
  networks: BlockchainNetwork[];
  performance: BlockchainPerformance;
  alerts: BlockchainAlert[];
}

export interface BlockchainNetwork {
  id: string;
  name: string;
  type: 'testnet' | 'mainnet';
  chainId: number;
  provider: string;
  status: 'active' | 'inactive' | 'maintenance';
  blockHeight: number;
  gasPrice: string;
  transactionCount: number;
  averageBlockTime: number; // seconds
}

export interface BlockchainPerformance {
  averageConfirmationTime: number; // seconds
  gasUsage: number;
  costPerTransaction: number; // currency
  successRate: number; // 0-1
  throughput: number; // transactions per second
}

export interface BlockchainAlert {
  id: string;
  type: 'transaction_failed' | 'network_congestion' | 'gas_price_spike' | 'security_breach';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export interface IoTDashboard {
  devices: IoTDevice[];
  sensorData: IoTSensorData[];
  alerts: IoTAlert[];
  maintenance: MaintenanceSchedule[];
  performance: IoTPerformance;
  coverage: IoTCoverage;
}

export interface IoTPerformance {
  deviceUptime: number; // percentage
  dataAccuracy: number; // 0-1
  alertResponseTime: number; // seconds
  batteryLife: number; // average days remaining
  maintenanceEfficiency: number; // 0-1
}

export interface IoTCoverage {
  buildings: BuildingCoverage[];
  zones: ZoneCoverage[];
  complianceAreas: ComplianceAreaCoverage[];
}

export interface BuildingCoverage {
  buildingId: string;
  name: string;
  totalDevices: number;
  activeDevices: number;
  coveragePercentage: number; // 0-100
  criticalAreas: string[];
}

export interface ZoneCoverage {
  zoneId: string;
  name: string;
  deviceCount: number;
  sensorTypes: string[];
  coverageScore: number; // 0-1
}

export interface ComplianceAreaCoverage {
  area: string;
  requiredDevices: number;
  actualDevices: number;
  complianceScore: number; // 0-1
  gaps: string[];
}

export interface AIAssistantDashboard {
  conversations: AIConversation[];
  performance: AIAssistantPerformance;
  usage: AIUsageMetrics;
  satisfaction: SatisfactionMetrics;
  capabilities: CapabilityMetrics;
}

export interface AIConversation {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  messageCount: number;
  duration: number; // seconds
  satisfaction: number; // 0-5
  outcome: 'resolved' | 'escalated' | 'abandoned';
  topics: string[];
}

export interface AIAssistantPerformance {
  responseTime: number; // milliseconds
  accuracy: number; // 0-1
  taskCompletionRate: number; // 0-1
  userSatisfaction: number; // 0-5
  errorRate: number; // 0-1
}

export interface AIUsageMetrics {
  dailyInteractions: number;
  peakHours: TimeSlot[];
  popularCapabilities: CapabilityUsage[];
  userEngagement: EngagementMetrics;
}

export interface TimeSlot {
  hour: number;
  interactions: number;
  averageResponseTime: number; // milliseconds
}

export interface CapabilityUsage {
  capability: string;
  usageCount: number;
  successRate: number; // 0-1
  averageRating: number; // 0-5
}

export interface EngagementMetrics {
  activeUsers: number;
  sessionDuration: number; // seconds
  messagesPerSession: number;
  returnRate: number; // 0-1
  userRetention: number; // 0-1
}

export interface SatisfactionMetrics {
  overall: number; // 0-5
  byCategory: CategorySatisfaction[];
  trends: SatisfactionTrend[];
  feedbackSummary: FeedbackSummary;
}

export interface CategorySatisfaction {
  category: string;
  score: number; // 0-5
  responseCount: number;
  improvementAreas: string[];
}

export interface SatisfactionTrend {
  period: string;
  score: number; // 0-5
  change: number; // percentage
  sampleSize: number;
}

export interface FeedbackSummary {
  positiveComments: string[];
  negativeComments: string[];
  improvementSuggestions: string[];
  commonThemes: string[];
}

export interface CapabilityMetrics {
  topPerformers: CapabilityPerformance[];
  underperformers: CapabilityPerformance[];
  newCapabilities: CapabilityPerformance[];
  deprecatedCapabilities: CapabilityPerformance[];
}

export interface Phase3Alerts {
  critical: AlertSummary[];
  warnings: AlertSummary[];
  info: AlertSummary[];
  trends: AlertTrend[];
  response: AlertResponseMetrics;
}

export interface AlertSummary {
  id: string;
  type: string;
  source: 'blockchain' | 'iot' | 'ai_assistant' | 'system';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  status: 'active' | 'acknowledged' | 'resolved';
  assignedTo?: string;
}

export interface AlertTrend {
  metric: string;
  period: string;
  count: number;
  change: number; // percentage
  severity: AlertSeverityDistribution;
}

export interface AlertSeverityDistribution {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

export interface AlertResponseMetrics {
  averageResponseTime: number; // minutes
  resolutionRate: number; // 0-1
  escalationRate: number; // 0-1
  satisfaction: number; // 0-5
}

export interface Phase3Insights {
  recommendations: Phase3Recommendation[];
  predictions: Phase3Prediction[];
  optimizations: OptimizationOpportunity[];
  risks: RiskAssessment[];
}

export interface Phase3Recommendation {
  id: string;
  category: 'blockchain' | 'iot' | 'ai_assistant' | 'integration';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  benefits: string[];
  implementation: ImplementationPlan;
  roi: ROIEstimate;
}

export interface ImplementationPlan {
  phases: ImplementationPhase[];
  timeline: string;
  resources: string[];
  dependencies: string[];
  risks: string[];
  successCriteria: string[];
}

export interface ImplementationPhase {
  name: string;
  description: string;
  duration: string;
  deliverables: string[];
  milestones: string[];
}

export interface ROIEstimate {
  investment: number; // currency
  savings: number; // currency per year
  payback: number; // months
  netPresentValue: number; // currency
  internalRateOfReturn: number; // percentage
}

export interface Phase3Prediction {
  id: string;
  type: 'performance' | 'usage' | 'maintenance' | 'compliance';
  model: string;
  confidence: number; // 0-1
  prediction: string;
  timeframe: string;
  factors: PredictionFactor[];
  validation: PredictionValidation;
}

export interface PredictionFactor {
  name: string;
  impact: number; // 0-1
  currentValue: any;
  predictedValue: any;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface PredictionValidation {
  accuracy: number; // 0-1
  lastValidated: Date;
  validationScore: number; // 0-1
  dataPoints: number;
}

export interface OptimizationOpportunity {
  id: string;
  area: 'performance' | 'cost' | 'efficiency' | 'user_experience';
  currentState: string;
  targetState: string;
  potentialImprovement: string;
  implementation: OptimizationImplementation;
  metrics: OptimizationMetrics;
}

export interface OptimizationImplementation {
  approach: string;
  steps: string[];
  resources: string[];
  timeline: string;
  risks: string[];
}

export interface OptimizationMetrics {
  baseline: number;
  target: number;
  current: number;
  improvement: number; // percentage
  measurementPeriod: string;
}

export interface RiskAssessment {
  id: string;
  category: 'technical' | 'operational' | 'compliance' | 'security' | 'financial';
  risk: string;
  probability: number; // 0-1
  impact: 'low' | 'medium' | 'high' | 'critical';
  mitigation: MitigationStrategy;
  monitoring: RiskMonitoring;
  status: 'identified' | 'assessed' | 'mitigated' | 'accepted';
}

export interface MitigationStrategy {
  preventive: string[];
  detective: string[];
  corrective: string[];
  contingency: string[];
  owner: string;
  timeline: string;
}

export interface RiskMonitoring {
  indicators: RiskIndicator[];
  thresholds: RiskThreshold[];
  frequency: string;
  escalation: string;
}

export interface RiskIndicator {
  name: string;
  type: 'leading' | 'lagging';
  currentValue: any;
  targetValue: any;
  status: 'good' | 'warning' | 'critical';
}

export interface RiskThreshold {
  metric: string;
  warning: any;
  critical: any;
  action: string;
}