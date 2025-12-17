// Phase 4: Autonomous Compliance Management System Model

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AutonomousSystem = sequelize.define('AutonomousSystem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  
  // System Identification
  systemName: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  systemType: {
    type: DataTypes.ENUM(
      'compliance_monitor',
      'risk_predictor',
      'auto_healer',
      'decision_engine',
      'workflow_orchestrator',
      'quality_assurance',
      'performance_optimizer'
    ),
    allowNull: false,
  },
  version: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '1.0.0',
  },
  
  // Autonomous Capabilities
  autonomyLevel: {
    type: DataTypes.ENUM('assisted', 'semi_autonomous', 'fully_autonomous', 'super_autonomous'),
    allowNull: false,
    defaultValue: 'semi_autonomous',
  },
  automationPercentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: 0.00,
      max: 100.00,
    },
  },
  capabilities: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      autoDetection: false,
      autoResolution: false,
      predictiveAnalysis: false,
      selfLearning: false,
      adaptiveResponse: false,
      continuousOptimization: false,
    },
  },
  
  // AI/ML Configuration
  aiConfiguration: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      modelType: 'neural_network',
      trainingData: {},
      hyperparameters: {},
      performanceMetrics: {},
      accuracy: 0.0,
      precision: 0.0,
      recall: 0.0,
      f1Score: 0.0,
    },
  },
  mlModels: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      primaryModel: null,
      fallbackModels: [],
      ensembleModels: [],
      modelVersions: [],
      lastTraining: null,
      trainingStatus: 'not_trained',
      validationScore: 0.0,
    },
  },
  
  // Operational Status
  status: {
    type: DataTypes.ENUM('inactive', 'initializing', 'active', 'learning', 'optimizing', 'maintenance', 'error'),
    allowNull: false,
    defaultValue: 'inactive',
  },
  healthScore: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 100.00,
    validate: {
      min: 0.00,
      max: 100.00,
    },
  },
  uptime: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 100.00,
  },
  lastHealthCheck: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  
  // Performance Metrics
  performanceMetrics: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      tasksCompleted: 0,
      tasksSucceeded: 0,
      tasksFailed: 0,
      averageResponseTime: 0.0,
      successRate: 0.0,
      errorRate: 0.0,
      throughput: 0.0,
      efficiency: 0.0,
    },
  },
  learningMetrics: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      adaptationEvents: 0,
      optimizationImprovements: 0,
      selfCorrections: 0,
      predictionAccuracy: 0.0,
      learningRate: 0.0,
      knowledgeBaseGrowth: 0,
    },
  },
  
  // Configuration and Rules
  autonomousRules: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      triggerConditions: [],
      actionRules: [],
      escalationRules: [],
      fallbackRules: [],
      safetyConstraints: [],
    },
  },
  decisionFramework: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      decisionTrees: {},
      ruleSets: {},
      weightedFactors: {},
      riskThresholds: {},
      confidenceLevels: {},
    },
  },
  
  // Monitoring and Logging
  monitoringConfig: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      logLevel: 'info',
      metricsCollection: true,
      alertThresholds: {},
      monitoringFrequency: 300, // seconds
      retentionPeriod: 2592000, // 30 days in seconds
    },
  },
  eventLogs: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      recentEvents: [],
      performanceEvents: [],
      errorEvents: [],
      learningEvents: [],
      decisionEvents: [],
    },
  },
  
  // Integration and Communication
  integrations: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      connectedSystems: [],
      apiEndpoints: {},
      webhookUrls: [],
      messageQueues: [],
      dataStreams: [],
    },
  },
  communicationProtocols: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      internalCommunication: 'event_bus',
      externalCommunication: 'rest_api',
      realTimeProtocol: 'websocket',
      messagingPattern: 'publish_subscribe',
    },
  },
  
  // Security and Compliance
  securityConfig: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      encryptionEnabled: true,
      authenticationRequired: true,
      authorizationLevel: 'system',
      auditLogging: true,
      accessControl: {},
    },
  },
  complianceFramework: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      regulations: [],
      standards: [],
      auditRequirements: [],
      complianceChecks: [],
      reportingRequirements: [],
    },
  },
  
  // Optimization and Learning
  optimizationConfig: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      continuousOptimization: true,
      performanceTargets: {},
      optimizationStrategies: [],
      feedbackLoops: [],
      adaptationRules: [],
    },
  },
  learningConfiguration: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      machineLearningEnabled: true,
      reinforcementLearning: false,
      supervisedLearning: true,
      unsupervisedLearning: false,
      onlineLearning: true,
      learningRate: 0.001,
      explorationRate: 0.1,
    },
  },
  
  // Resource Management
  resourceAllocation: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      cpuAllocation: 50, // percentage
      memoryAllocation: 1024, // MB
      storageAllocation: 10240, // MB
      networkBandwidth: 100, // Mbps
      priority: 'normal',
      scalingRules: {},
    },
  },
  
  // Error Handling and Recovery
  errorHandling: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      maxRetries: 3,
      retryDelay: 5000, // milliseconds
      circuitBreaker: {
        enabled: true,
        failureThreshold: 5,
        resetTimeout: 60000, // milliseconds
      },
      fallbackStrategies: [],
      recoveryProcedures: [],
    },
  },
  
  // Timestamps
  lastExecution: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  nextScheduledTask: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  lastOptimization: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  
  // Metadata
  metadata: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      deploymentEnvironment: 'development',
      maintenanceWindow: null,
      upgradeHistory: [],
      configurationHistory: [],
      performanceHistory: [],
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
  tableName: 'autonomous_systems',
  timestamps: true,
  indexes: [
    {
      fields: ['systemType'],
    },
    {
      fields: ['status'],
    },
    {
      fields: ['autonomyLevel'],
    },
    {
      fields: ['systemName'],
      unique: true,
    },
  ],
});

// Instance methods
AutonomousSystem.prototype.updateHealthScore = function() {
  // Calculate health score based on performance metrics
  const metrics = this.performanceMetrics;
  const successRate = metrics.tasksSucceeded / Math.max(metrics.tasksCompleted, 1);
  const errorRate = metrics.tasksFailed / Math.max(metrics.tasksCompleted, 1);
  const efficiency = metrics.efficiency || 0;
  
  this.healthScore = Math.min(100, (successRate * 40 + (1 - errorRate) * 30 + efficiency * 30));
  this.lastHealthCheck = new Date();
  
  return this.healthScore;
};

AutonomousSystem.prototype.logEvent = function(eventType, eventData) {
  const timestamp = new Date().toISOString();
  const event = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp,
    type: eventType,
    data: eventData,
  };
  
  // Add to appropriate event log array
  if (!this.eventLogs.recentEvents) {
    this.eventLogs.recentEvents = [];
  }
  
  this.eventLogs.recentEvents.push(event);
  
  // Keep only last 1000 events
  if (this.eventLogs.recentEvents.length > 1000) {
    this.eventLogs.recentEvents = this.eventLogs.recentEvents.slice(-1000);
  }
  
  // Add to specific event type array
  const eventArrayName = `${eventType}Events`;
  if (!this.eventLogs[eventArrayName]) {
    this.eventLogs[eventArrayName] = [];
  }
  
  this.eventLogs[eventArrayName].push(event);
  if (this.eventLogs[eventArrayName].length > 500) {
    this.eventLogs[eventArrayName] = this.eventLogs[eventArrayName].slice(-500);
  }
};

AutonomousSystem.prototype.recordTask = function(success, responseTime, errorDetails = null) {
  this.performanceMetrics.tasksCompleted += 1;
  
  if (success) {
    this.performanceMetrics.tasksSucceeded += 1;
    this.logEvent('performance', {
      action: 'task_completed',
      responseTime,
      success: true,
    });
  } else {
    this.performanceMetrics.tasksFailed += 1;
    this.logEvent('error', {
      action: 'task_failed',
      responseTime,
      error: errorDetails,
    });
  }
  
  // Update performance metrics
  const totalTasks = this.performanceMetrics.tasksCompleted;
  this.performanceMetrics.successRate = this.performanceMetrics.tasksSucceeded / totalTasks;
  this.performanceMetrics.errorRate = this.performanceMetrics.tasksFailed / totalTasks;
  this.performanceMetrics.averageResponseTime = 
    ((this.performanceMetrics.averageResponseTime * (totalTasks - 1)) + responseTime) / totalTasks;
  
  // Update health score
  this.updateHealthScore();
  this.lastExecution = new Date();
};

AutonomousSystem.prototype.adaptAndLearn = function(context, outcome) {
  this.learningMetrics.adaptationEvents += 1;
  
  // Record learning event
  this.logEvent('learning', {
    context,
    outcome,
    adaptationType: 'system_improvement',
  });
  
  // Update learning metrics
  if (outcome.success) {
    this.learningMetrics.optimizationImprovements += 1;
  }
  
  // Trigger self-correction if needed
  if (outcome.requiresCorrection) {
    this.learningMetrics.selfCorrections += 1;
    this.logEvent('learning', {
      action: 'self_correction',
      correctionType: outcome.correctionType,
      details: outcome.details,
    });
  }
};

AutonomousSystem.prototype.shouldEscalate = function() {
  // Determine if system should escalate to human intervention
  const healthScore = this.healthScore;
  const errorRate = this.performanceMetrics.errorRate;
  const consecutiveFailures = this.performanceMetrics.tasksFailed;
  
  return healthScore < 70 || errorRate > 0.2 || consecutiveFailures > 5;
};

AutonomousSystem.prototype.getSystemStatus = function() {
  return {
    id: this.id,
    systemName: this.systemName,
    systemType: this.systemType,
    status: this.status,
    healthScore: this.healthScore,
    automationPercentage: this.automationPercentage,
    autonomyLevel: this.autonomyLevel,
    uptime: this.uptime,
    performanceMetrics: this.performanceMetrics,
    lastExecution: this.lastExecution,
    shouldEscalate: this.shouldEscalate(),
    capabilities: this.capabilities,
  };
};

// Class methods
AutonomousSystem.findByType = function(systemType) {
  return this.findAll({
    where: { systemType },
    order: [['healthScore', 'DESC']],
  });
};

AutonomousSystem.findHealthySystems = function(minHealthScore = 80) {
  return this.findAll({
    where: {
      healthScore: { [sequelize.Sequelize.Op.gte]: minHealthScore },
      status: { [sequelize.Sequelize.Op.not]: 'error' },
    },
    order: [['automationPercentage', 'DESC']],
  });
};

AutonomousSystem.getAutonomousSystems = function() {
  return this.findAll({
    where: {
      autonomyLevel: {
        [sequelize.Sequelize.Op.in]: ['fully_autonomous', 'super_autonomous']
      }
    },
    order: [['automationPercentage', 'DESC']],
  });
};

// Associations
AutonomousSystem.associate = function(models) {
  // AutonomousSystem has many AutonomousDecisions
  AutonomousSystem.hasMany(models.AutonomousDecision, {
    foreignKey: 'systemId',
    as: 'decisions',
  });
  
  // AutonomousSystem has many AutonomousTasks
  AutonomousSystem.hasMany(models.AutonomousTask, {
    foreignKey: 'systemId',
    as: 'tasks',
  });
  
  // AutonomousSystem has many AutonomousOptimizations
  AutonomousSystem.hasMany(models.AutonomousOptimization, {
    foreignKey: 'systemId',
    as: 'optimizations',
  });
  
  // AutonomousSystem belongs to many Workflows
  AutonomousSystem.belongsToMany(models.Workflow, {
    through: models.SystemWorkflow,
    foreignKey: 'systemId',
    as: 'workflows',
  });
  
  // AutonomousSystem can be supervised by Users
  AutonomousSystem.belongsTo(models.User, {
    foreignKey: 'supervisorId',
    as: 'supervisor',
  });
};

module.exports = AutonomousSystem;