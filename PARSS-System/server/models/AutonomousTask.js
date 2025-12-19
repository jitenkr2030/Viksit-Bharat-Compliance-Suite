// Phase 4: Autonomous Task Model

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AutonomousTask = sequelize.define('AutonomousTask', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  
  // Task Identification
  systemId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'autonomous_systems',
      key: 'id',
    },
  },
  triggerDecisionId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'autonomous_decisions',
      key: 'id',
    },
  },
  taskName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  taskType: {
    type: DataTypes.ENUM(
      'compliance_check',
      'document_generation',
      'report_creation',
      'audit_execution',
      'risk_assessment',
      'notification_dispatch',
      'data_processing',
      'system_maintenance',
      'quality_assurance',
      'performance_monitoring',
      'security_scan',
      'backup_operation'
    ),
    allowNull: false,
  },
  taskCategory: {
    type: DataTypes.ENUM('automated', 'scheduled', 'event_driven', 'manual_triggered'),
    allowNull: false,
    defaultValue: 'automated',
  },
  
  // Task Configuration
  taskConfiguration: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      priority: 'normal',
      timeout: 300000, // 5 minutes in milliseconds
      retryCount: 3,
      retryDelay: 5000, // 5 seconds
      dependencies: [],
      prerequisites: [],
      resources: {},
      constraints: {},
    },
  },
  taskParameters: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
  },
  taskScript: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  
  // Task Scheduling
  scheduleType: {
    type: DataTypes.ENUM('immediate', 'scheduled', 'recurring', 'event_based'),
    allowNull: false,
    defaultValue: 'immediate',
  },
  scheduleConfiguration: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      cronExpression: null,
      interval: null,
      startDate: null,
      endDate: null,
      timezone: 'UTC',
      daysOfWeek: [],
      daysOfMonth: [],
    },
  },
  
  // Execution Status
  status: {
    type: DataTypes.ENUM(
      'pending',
      'queued',
      'running',
      'paused',
      'completed',
      'failed',
      'cancelled',
      'retrying',
      'timeout'
    ),
    allowNull: false,
    defaultValue: 'pending',
  },
  progress: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: 0.00,
      max: 100.00,
    },
  },
  currentStep: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  totalSteps: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  
  // Execution Details
  executionDetails: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      startedAt: null,
      completedAt: null,
      estimatedDuration: null,
      actualDuration: null,
      steps: [],
      checkpoints: [],
      resourceUsage: {},
      output: {},
    },
  },
  errorDetails: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      errorCode: null,
      errorMessage: null,
      stackTrace: null,
      context: {},
      recoveryActions: [],
    },
  },
  
  // Task Results
  result: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      success: false,
      data: null,
      summary: null,
      metrics: {},
      artifacts: [],
      notifications: [],
    },
  },
  outputFiles: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: [],
  },
  notifications: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      sent: false,
      recipients: [],
      channels: [],
      message: null,
      timestamp: null,
    },
  },
  
  // Quality and Validation
  qualityChecks: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      validationRules: [],
      validationResults: [],
      qualityScore: 0.0,
      passed: false,
      issues: [],
      recommendations: [],
    },
  },
  approvalStatus: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'auto_approved'),
    allowNull: false,
    defaultValue: 'pending',
  },
  approvedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  approvalNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  
  // Dependencies and Relationships
  dependencies: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      prerequisiteTasks: [],
      resourceDependencies: [],
      dataDependencies: [],
      externalDependencies: [],
    },
  },
  downstreamTasks: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      triggeredTasks: [],
      dependentTasks: [],
      blockedTasks: [],
    },
  },
  
  // Performance Metrics
  performanceMetrics: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      executionTime: 0,
      cpuUsage: 0,
      memoryUsage: 0,
      networkUsage: 0,
      ioOperations: 0,
      efficiency: 0.0,
      throughput: 0.0,
    },
  },
  
  // Retry and Recovery
  retryCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  maxRetries: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 3,
  },
  nextRetryAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  recoveryStrategy: {
    type: DataTypes.ENUM('none', 'retry', 'fallback', 'escalate', 'manual_intervention'),
    allowNull: false,
    defaultValue: 'retry',
  },
  
  // Monitoring and Logging
  monitoringConfig: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      logLevel: 'info',
      metricsEnabled: true,
      alertsEnabled: true,
      checkpoints: [],
      milestones: [],
    },
  },
  executionLogs: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      info: [],
      warnings: [],
      errors: [],
      debug: [],
      audit: [],
    },
  },
  
  // Security and Compliance
  securityContext: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      permissions: [],
      accessLevel: 'normal',
      dataClassification: 'internal',
      encryptionRequired: false,
      auditRequired: true,
    },
  },
  complianceChecks: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      regulatoryCompliance: true,
      dataProtection: true,
      securityCompliance: true,
      auditCompliance: true,
      violations: [],
    },
  },
  
  // Resource Management
  resourceAllocation: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      cpuCores: 1,
      memoryMB: 512,
      diskSpaceMB: 1024,
      networkBandwidth: 100,
      gpuRequired: false,
      specialHardware: false,
    },
  },
  resourceUsage: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      allocated: {},
      consumed: {},
      peak: {},
      efficiency: 0.0,
    },
  },
  
  // Scheduling and Timing
  scheduledStart: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  scheduledEnd: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  actualStart: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  actualEnd: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  
  // Priority and Importance
  priority: {
    type: DataTypes.ENUM('low', 'normal', 'high', 'critical', 'emergency'),
    allowNull: false,
    defaultValue: 'normal',
  },
  urgency: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    allowNull: false,
    defaultValue: 'medium',
  },
  impact: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    allowNull: false,
    defaultValue: 'medium',
  },
  
  // Integration and Communication
  integrations: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      externalSystems: [],
      apiCalls: [],
      webhooks: [],
      messageQueues: [],
      databases: [],
    },
  },
  
  // Metadata and Context
  metadata: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      tags: [],
      labels: {},
      businessContext: {},
      technicalContext: {},
      userContext: {},
      environment: 'production',
    },
  },
  
  // Timestamps
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'autonomous_tasks',
  timestamps: true,
  indexes: [
    {
      fields: ['systemId'],
    },
    {
      fields: ['taskType'],
    },
    {
      fields: ['status'],
    },
    {
      fields: ['priority'],
    },
    {
      fields: ['scheduledStart'],
    },
    {
      fields: ['createdAt'],
    },
  ],
});

// Instance methods
AutonomousTask.prototype.start = function() {
  if (this.status !== 'pending' && this.status !== 'queued') {
    throw new Error('Task cannot be started from current status');
  }
  
  this.actualStart = new Date();
  this.status = 'running';
  this.currentStep = 'initialization';
  
  this.log('info', 'Task started', { taskId: this.id, taskName: this.taskName });
  
  return this;
};

AutonomousTask.prototype.complete = function(result = {}) {
  if (this.status !== 'running') {
    throw new Error('Task cannot be completed from current status');
  }
  
  this.actualEnd = new Date();
  this.status = 'completed';
  this.progress = 100.00;
  this.result = {
    ...this.result,
    success: true,
    ...result,
  };
  
  // Calculate actual duration
  if (this.actualStart) {
    this.executionDetails.actualDuration = this.actualEnd - this.actualStart;
  }
  
  this.log('info', 'Task completed successfully', { 
    taskId: this.id, 
    duration: this.executionDetails.actualDuration 
  });
  
  return this;
};

AutonomousTask.prototype.fail = function(error) {
  this.status = 'failed';
  this.errorDetails = {
    errorCode: error.code || 'TASK_FAILED',
    errorMessage: error.message || 'Task execution failed',
    stackTrace: error.stack || null,
    context: error.context || {},
    recoveryActions: [],
  };
  
  this.log('error', 'Task failed', { 
    taskId: this.id, 
    error: error.message,
    stackTrace: error.stack 
  });
  
  return this;
};

AutonomousTask.prototype.retry = function() {
  if (this.retryCount >= this.maxRetries) {
    this.status = 'failed';
    this.log('error', 'Max retries exceeded', { taskId: this.id, retries: this.retryCount });
    return this;
  }
  
  this.retryCount += 1;
  this.status = 'retrying';
  this.nextRetryAt = new Date(Date.now() + this.taskConfiguration.retryDelay);
  
  this.log('warning', 'Task retry scheduled', { 
    taskId: this.id, 
    retryCount: this.retryCount,
    nextRetryAt: this.nextRetryAt 
  });
  
  return this;
};

AutonomousTask.prototype.updateProgress = function(step, progress, details = {}) {
  this.currentStep = step;
  this.progress = Math.min(100, Math.max(0, progress));
  
  // Add step to execution details
  if (!this.executionDetails.steps) {
    this.executionDetails.steps = [];
  }
  
  this.executionDetails.steps.push({
    step,
    progress,
    timestamp: new Date(),
    details,
  });
  
  this.log('debug', 'Progress updated', { 
    taskId: this.id, 
    step, 
    progress 
  });
  
  return this;
};

AutonomousTask.prototype.log = function(level, message, data = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    data,
  };
  
  if (!this.executionLogs[level]) {
    this.executionLogs[level] = [];
  }
  
  this.executionLogs[level].push(logEntry);
  
  // Keep only last 1000 log entries per level
  if (this.executionLogs[level].length > 1000) {
    this.executionLogs[level] = this.executionLogs[level].slice(-1000);
  }
};

AutonomousTask.prototype.addOutputFile = function(filePath, fileType, metadata = {}) {
  this.outputFiles.push({
    path: filePath,
    type: fileType,
    size: metadata.size || 0,
    createdAt: new Date(),
    metadata,
  });
};

AutonomousTask.prototype.validate = function() {
  const issues = [];
  
  // Check if task has required configuration
  if (!this.taskName) {
    issues.push('Task name is required');
  }
  
  if (!this.taskType) {
    issues.push('Task type is required');
  }
  
  // Check scheduling validity
  if (this.scheduleType === 'scheduled' && !this.scheduledStart) {
    issues.push('Scheduled tasks must have a start time');
  }
  
  // Check dependencies
  if (this.dependencies.prerequisiteTasks.length > 0) {
    // In a real implementation, check if prerequisites are completed
    issues.push('Prerequisites not yet implemented');
  }
  
  this.qualityChecks.issues = issues;
  this.qualityChecks.passed = issues.length === 0;
  
  return issues.length === 0;
};

AutonomousTask.prototype.getDuration = function() {
  if (this.actualStart && this.actualEnd) {
    return this.actualEnd - this.actualStart;
  }
  return null;
};

AutonomousTask.prototype.isOverdue = function() {
  if (!this.deadline) return false;
  return new Date() > this.deadline && this.status !== 'completed';
};

AutonomousTask.prototype.shouldEscalate = function() {
  return (
    this.isOverdue() ||
    (this.status === 'failed' && this.retryCount >= this.maxRetries) ||
    this.priority === 'critical' ||
    this.priority === 'emergency'
  );
};

AutonomousTask.prototype.canStart = function() {
  // Check if all prerequisites are met
  if (this.dependencies.prerequisiteTasks.length > 0) {
    // In real implementation, check if prerequisite tasks are completed
    return false;
  }
  
  // Check if scheduled time has arrived
  if (this.scheduleType === 'scheduled' && this.scheduledStart) {
    return new Date() >= this.scheduledStart;
  }
  
  return this.status === 'pending';
};

// Class methods
AutonomousTask.findBySystem = function(systemId) {
  return this.findAll({
    where: { systemId },
    order: [['createdAt', 'DESC']],
  });
};

AutonomousTask.findPendingTasks = function() {
  return this.findAll({
    where: {
      status: { [sequelize.Sequelize.Op.in]: ['pending', 'queued'] },
    },
    order: [
      ['priority', 'DESC'],
      ['scheduledStart', 'ASC'],
      ['createdAt', 'ASC'],
    ],
  });
};

AutonomousTask.findRunningTasks = function() {
  return this.findAll({
    where: {
      status: { [sequelize.Sequelize.Op.in]: ['running', 'retrying'] },
    },
    order: [['actualStart', 'ASC']],
  });
};

AutonomousTask.findOverdueTasks = function() {
  const now = new Date();
  return this.findAll({
    where: {
      deadline: { [sequelize.Sequelize.Op.lt]: now },
      status: { [sequelize.Sequelize.Op.not]: 'completed' },
    },
    order: [['deadline', 'ASC']],
  });
};

AutonomousTask.getTaskStatistics = function(systemId = null) {
  const whereClause = systemId ? { systemId } : {};
  
  return this.findAll({
    where: whereClause,
    attributes: [
      'status',
      [sequelize.Sequelize.fn('COUNT', sequelize.Sequelize.col('id')), 'count'],
      [sequelize.Sequelize.fn('AVG', sequelize.Sequelize.col('executionDetails.actualDuration')), 'avgDuration'],
    ],
    group: ['status'],
  });
};

// Associations
AutonomousTask.associate = function(models) {
  // AutonomousTask belongs to AutonomousSystem
  AutonomousTask.belongsTo(models.AutonomousSystem, {
    foreignKey: 'systemId',
    as: 'system',
  });
  
  // AutonomousTask belongs to AutonomousDecision (trigger)
  AutonomousTask.belongsTo(models.AutonomousDecision, {
    foreignKey: 'triggerDecisionId',
    as: 'triggerDecision',
  });
  
  // AutonomousTask belongs to User (approver)
  AutonomousTask.belongsTo(models.User, {
    foreignKey: 'approvedBy',
    as: 'approver',
  });
  
  // AutonomousTask has many TaskDependencies
  AutonomousTask.hasMany(models.TaskDependency, {
    foreignKey: 'taskId',
    as: 'dependencyRelations',
  });
  
  // AutonomousTask can have parent-child relationships
  AutonomousTask.hasMany(models.TaskDependency, {
    foreignKey: 'dependsOnTaskId',
    as: 'dependentTasks',
  });
};

module.exports = AutonomousTask;