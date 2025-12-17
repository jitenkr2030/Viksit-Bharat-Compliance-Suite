// Phase 4: Autonomous Decision Model

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AutonomousDecision = sequelize.define('AutonomousDecision', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  
  // Decision Context
  systemId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'autonomous_systems',
      key: 'id',
    },
  },
  decisionType: {
    type: DataTypes.ENUM(
      'compliance_check',
      'risk_assessment',
      'resource_allocation',
      'task_priority',
      'escalation_decision',
      'optimization_choice',
      'policy_enforcement',
      'quality_assurance'
    ),
    allowNull: false,
  },
  decisionCategory: {
    type: DataTypes.ENUM('operational', 'strategic', 'tactical', 'emergency'),
    allowNull: false,
  },
  
  // Decision Data
  context: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
  },
  decisionData: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
  },
  inputParameters: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
  },
  
  // Decision Logic
  decisionAlgorithm: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'rule_based',
  },
  algorithmVersion: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '1.0',
  },
  decisionFactors: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
  },
  weights: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
  },
  
  // Decision Outcome
  decision: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      action: null,
      confidence: 0.0,
      reasoning: null,
      alternatives: [],
      recommendedAction: null,
    },
  },
  confidence: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: 0.00,
      max: 100.00,
    },
  },
  riskLevel: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    allowNull: false,
    defaultValue: 'low',
  },
  
  // Decision Validation
  validationRules: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: [],
  },
  validationResult: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      isValid: true,
      validationErrors: [],
      warnings: [],
      recommendations: [],
    },
  },
  safetyChecks: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      passed: true,
      checks: [],
      violations: [],
      mitigationActions: [],
    },
  },
  
  // Execution Tracking
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'executed', 'failed', 'rolled_back', 'escalated'),
    allowNull: false,
    defaultValue: 'pending',
  },
  executionStatus: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      startedAt: null,
      completedAt: null,
      executionTime: 0,
      steps: [],
      errors: [],
      rollbacks: [],
    },
  },
  rollbackDecision: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      shouldRollback: false,
      rollbackReason: null,
      rollbackAction: null,
      rollbackExecuted: false,
    },
  },
  
  // Impact Assessment
  impactAssessment: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      expectedImpact: null,
      actualImpact: null,
      affectedSystems: [],
      impactScore: 0.0,
      positiveOutcomes: [],
      negativeOutcomes: [],
      mitigationRequired: false,
    },
  },
  outcome: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      success: false,
      result: null,
      sideEffects: [],
      performance: {},
      userFeedback: null,
      systemFeedback: null,
    },
  },
  
  // Learning and Optimization
  learningData: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      feedback: null,
      accuracy: 0.0,
      improvementSuggestions: [],
      modelUpdates: [],
      patternRecognition: {},
    },
  },
  optimizationData: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      optimizationApplied: false,
      performanceGain: 0.0,
      algorithmAdjustment: null,
      parameterTuning: {},
    },
  },
  
  // Escalation and Human Review
  escalationRequired: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  escalationReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  escalationLevel: {
    type: DataTypes.ENUM('supervisor', 'manager', 'admin', 'emergency'),
    allowNull: true,
  },
  humanReviewed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  humanReviewerId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  humanReviewNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  humanOverride: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      overridden: false,
      originalDecision: null,
      overrideReason: null,
      overrideAction: null,
    },
  },
  
  // Compliance and Audit
  complianceChecks: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      regulatoryCompliance: true,
      policyCompliance: true,
      standardCompliance: true,
      complianceScore: 100.0,
      violations: [],
      recommendations: [],
    },
  },
  auditTrail: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      createdBy: null,
      approvalChain: [],
      modifications: [],
      accessLog: [],
    },
  },
  
  // Performance Metrics
  performanceMetrics: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      processingTime: 0,
      resourceUsage: {},
      accuracy: 0.0,
      userSatisfaction: null,
      systemEfficiency: 0.0,
    },
  },
  
  // Timestamps
  decisionTimestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  executionTimestamp: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  completionTimestamp: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  reviewTimestamp: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  
  // Metadata
  metadata: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      sessionId: null,
      correlationId: null,
      tags: [],
      priority: 'normal',
      complexity: 'medium',
      dependencies: [],
      prerequisites: [],
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
  tableName: 'autonomous_decisions',
  timestamps: true,
  indexes: [
    {
      fields: ['systemId'],
    },
    {
      fields: ['decisionType'],
    },
    {
      fields: ['status'],
    },
    {
      fields: ['decisionTimestamp'],
    },
    {
      fields: ['confidence'],
    },
    {
      fields: ['riskLevel'],
    },
  ],
});

// Instance methods
AutonomousDecision.prototype.execute = function() {
  this.executionStatus.startedAt = new Date();
  this.status = 'executing';
  
  // Simulate execution steps
  this.executionStatus.steps.push({
    step: 'validation',
    status: 'completed',
    timestamp: new Date(),
    result: 'success',
  });
  
  this.executionStatus.steps.push({
    step: 'execution',
    status: 'completed',
    timestamp: new Date(),
    result: 'success',
  });
  
  this.executionStatus.completedAt = new Date();
  this.executionStatus.executionTime = 
    this.executionStatus.completedAt - this.executionStatus.startedAt;
  
  this.status = 'executed';
  this.executionTimestamp = new Date();
  this.completionTimestamp = new Date();
  
  return this;
};

AutonomousDecision.prototype.rollback = function(reason) {
  this.rollbackDecision.shouldRollback = true;
  this.rollbackDecision.rollbackReason = reason;
  this.rollbackDecision.rollbackExecuted = true;
  
  this.executionStatus.rollbacks.push({
    timestamp: new Date(),
    reason,
    status: 'completed',
  });
  
  this.status = 'rolled_back';
  
  this.logEvent('rollback', { reason, timestamp: new Date() });
};

AutonomousDecision.prototype.escalate = function(reason, level) {
  this.escalationRequired = true;
  this.escalationReason = reason;
  this.escalationLevel = level;
  this.status = 'escalated';
  
  this.logEvent('escalation', { reason, level, timestamp: new Date() });
};

AutonomousDecision.prototype.logEvent = function(eventType, data) {
  if (!this.auditTrail.modifications) {
    this.auditTrail.modifications = [];
  }
  
  this.auditTrail.modifications.push({
    event: eventType,
    data,
    timestamp: new Date().toISOString(),
  });
};

AutonomousDecision.prototype.recordOutcome = function(outcome) {
  this.outcome = {
    ...this.outcome,
    ...outcome,
    success: outcome.success || false,
  };
  
  // Update impact assessment
  if (outcome.impact) {
    this.impactAssessment.actualImpact = outcome.impact;
    this.impactAssessment.impactScore = outcome.impact.score || 0;
  }
  
  // Update learning data
  if (outcome.feedback) {
    this.learningData.feedback = outcome.feedback;
    this.learningData.accuracy = outcome.accuracy || 0;
  }
  
  this.logEvent('outcome_recorded', { outcome, timestamp: new Date() });
};

AutonomousDecision.prototype.validateDecision = function() {
  let isValid = true;
  const validationErrors = [];
  const warnings = [];
  
  // Basic validation rules
  if (!this.decision.action) {
    validationErrors.push('No action specified in decision');
    isValid = false;
  }
  
  if (this.confidence < 70 && this.riskLevel === 'high') {
    warnings.push('High risk decision with low confidence');
  }
  
  if (this.confidence < 50) {
    validationErrors.push('Confidence level too low for autonomous execution');
    isValid = false;
  }
  
  // Check compliance
  if (!this.complianceChecks.regulatoryCompliance) {
    validationErrors.push('Regulatory compliance check failed');
    isValid = false;
  }
  
  this.validationResult = {
    isValid,
    validationErrors,
    warnings,
    recommendations: this.generateRecommendations(),
  };
  
  return isValid;
};

AutonomousDecision.prototype.generateRecommendations = function() {
  const recommendations = [];
  
  if (this.confidence < 80) {
    recommendations.push('Consider human review due to low confidence');
  }
  
  if (this.riskLevel === 'high') {
    recommendations.push('Implement additional safety checks for high-risk decision');
  }
  
  if (this.impactAssessment.expectedImpact.score > 80) {
    recommendations.push('High impact decision requires supervisor approval');
  }
  
  return recommendations;
};

AutonomousDecision.prototype.shouldRequireHumanReview = function() {
  return (
    this.escalationRequired ||
    this.confidence < 70 ||
    this.riskLevel === 'critical' ||
    !this.validateDecision()
  );
};

// Class methods
AutonomousDecision.findBySystem = function(systemId) {
  return this.findAll({
    where: { systemId },
    order: [['decisionTimestamp', 'DESC']],
  });
};

AutonomousDecision.findRecentDecisions = function(hours = 24) {
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  return this.findAll({
    where: {
      decisionTimestamp: { [sequelize.Sequelize.Op.gte]: cutoff },
    },
    order: [['decisionTimestamp', 'DESC']],
  });
};

AutonomousDecision.getHighConfidenceDecisions = function(minConfidence = 80) {
  return this.findAll({
    where: {
      confidence: { [sequelize.Sequelize.Op.gte]: minConfidence },
      status: { [sequelize.Sequelize.Op.not]: 'failed' },
    },
    order: [['confidence', 'DESC']],
  });
};

AutonomousDecision.getEscalatedDecisions = function() {
  return this.findAll({
    where: {
      escalationRequired: true,
      humanReviewed: false,
    },
    order: [['decisionTimestamp', 'DESC']],
  });
};

// Associations
AutonomousDecision.associate = function(models) {
  // AutonomousDecision belongs to AutonomousSystem
  AutonomousDecision.belongsTo(models.AutonomousSystem, {
    foreignKey: 'systemId',
    as: 'system',
  });
  
  // AutonomousDecision belongs to User (human reviewer)
  AutonomousDecision.belongsTo(models.User, {
    foreignKey: 'humanReviewerId',
    as: 'humanReviewer',
  });
  
  // AutonomousDecision has many DecisionDependencies
  AutonomousDecision.hasMany(models.DecisionDependency, {
    foreignKey: 'decisionId',
    as: 'dependencies',
  });
  
  // AutonomousDecision can trigger Tasks
  AutonomousDecision.hasMany(models.AutonomousTask, {
    foreignKey: 'triggerDecisionId',
    as: 'triggeredTasks',
  });
};

module.exports = AutonomousDecision;