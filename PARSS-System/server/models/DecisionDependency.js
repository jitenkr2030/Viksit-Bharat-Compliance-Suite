// Phase 4: Decision Dependency Model

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DecisionDependency = sequelize.define('DecisionDependency', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  
  // Dependencies
  decisionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'autonomous_decisions',
      key: 'id',
    },
  },
  dependsOnDecisionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'autonomous_decisions',
      key: 'id',
    },
  },
  
  // Dependency Type and Relationship
  dependencyType: {
    type: DataTypes.ENUM(
      'prerequisite',
      'sequential',
      'conditional',
      'data_dependency',
      'resource_dependency',
      'approval_dependency',
      'result_dependency'
    ),
    allowNull: false,
  },
  dependencyStrength: {
    type: DataTypes.ENUM('weak', 'medium', 'strong', 'critical'),
    allowNull: false,
    defaultValue: 'medium',
  },
  
  // Dependency Conditions
  conditions: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      requiredOutcomes: [],
      dataRequirements: [],
      resourceRequirements: [],
      timingConstraints: [],
      qualityThresholds: {},
    },
  },
  validationRules: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      checkRequired: true,
      timeout: 300000, // 5 minutes
      retryCount: 3,
      fallbackAction: null,
    },
  },
  
  // Status and Execution
  status: {
    type: DataTypes.ENUM('pending', 'satisfied', 'failed', 'timeout', 'skipped'),
    allowNull: false,
    defaultValue: 'pending',
  },
  satisfactionTimestamp: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  failureReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  
  // Monitoring and Logging
  monitoringConfig: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      checkInterval: 30000, // 30 seconds
      maxWaitTime: 1800000, // 30 minutes
      alertOnFailure: true,
      logLevel: 'info',
    },
  },
  executionLog: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      checks: [],
      events: [],
      errors: [],
      performance: {},
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
  tableName: 'decision_dependencies',
  timestamps: true,
  indexes: [
    {
      fields: ['decisionId'],
    },
    {
      fields: ['dependsOnDecisionId'],
    },
    {
      fields: ['dependencyType'],
    },
    {
      fields: ['status'],
    },
  ],
});

// Instance methods
DecisionDependency.prototype.checkDependency = function() {
  const dependency = this;
  
  try {
    // Log check attempt
    this.log('info', 'Checking dependency', { 
      dependencyId: this.id,
      decisionId: this.decisionId,
      dependsOnId: this.dependsOnDecisionId,
      type: this.dependencyType
    });
    
    // Check if dependency is satisfied
    const isSatisfied = this.evaluateSatisfaction();
    
    if (isSatisfied) {
      this.status = 'satisfied';
      this.satisfactionTimestamp = new Date();
      this.log('info', 'Dependency satisfied', { dependencyId: this.id });
    } else {
      this.status = 'pending';
      this.log('debug', 'Dependency not yet satisfied', { dependencyId: this.id });
    }
    
    return isSatisfied;
  } catch (error) {
    this.status = 'failed';
    this.failureReason = error.message;
    this.log('error', 'Dependency check failed', { 
      dependencyId: this.id, 
      error: error.message 
    });
    
    return false;
  }
};

DecisionDependency.prototype.evaluateSatisfaction = function() {
  // This would normally query the database to check the actual dependency
  // For this example, we'll implement basic logic
  
  const conditions = this.conditions;
  
  switch (this.dependencyType) {
    case 'prerequisite':
      return this.checkPrerequisiteCondition();
      
    case 'sequential':
      return this.checkSequentialCondition();
      
    case 'conditional':
      return this.checkConditionalCondition();
      
    case 'data_dependency':
      return this.checkDataCondition();
      
    case 'resource_dependency':
      return this.checkResourceCondition();
      
    case 'approval_dependency':
      return this.checkApprovalCondition();
      
    case 'result_dependency':
      return this.checkResultCondition();
      
    default:
      return false;
  }
};

DecisionDependency.prototype.checkPrerequisiteCondition = function() {
  // Check if prerequisite decision is completed successfully
  // In real implementation, query the database
  const conditions = this.conditions;
  
  if (conditions.requiredOutcomes.length > 0) {
    // Check if required outcomes are met
    return conditions.requiredOutcomes.every(outcome => outcome.required === true);
  }
  
  return true; // Default to true if no specific requirements
};

DecisionDependency.prototype.checkSequentialCondition = function() {
  // Check if previous decision in sequence is completed
  const timingConstraints = this.conditions.timingConstraints;
  
  if (timingConstraints.maxDelay) {
    // Check timing constraint
    const delay = Date.now() - this.createdAt.getTime();
    if (delay > timingConstraints.maxDelay) {
      this.failureReason = 'Sequential dependency timeout';
      return false;
    }
  }
  
  return true;
};

DecisionDependency.prototype.checkConditionalCondition = function() {
  // Evaluate conditional logic
  const conditions = this.conditions;
  
  // Simple conditional evaluation (would be more complex in reality)
  return conditions.dataRequirements.every(req => 
    req.hasOwnProperty('value') && req.value !== null
  );
};

DecisionDependency.prototype.checkDataCondition = function() {
  // Check if required data is available
  const dataRequirements = this.conditions.dataRequirements;
  
  return dataRequirements.every(req => 
    req.required && (req.dataSource === 'available' || req.value !== undefined)
  );
};

DecisionDependency.prototype.checkResourceCondition = function() {
  // Check if required resources are available
  const resourceRequirements = this.conditions.resourceRequirements;
  
  return resourceRequirements.every(req => 
    req.available === true && req.allocation >= req.required
  );
};

DecisionDependency.prototype.checkApprovalCondition = function() {
  // Check if required approvals are obtained
  const requiredOutcomes = this.conditions.requiredOutcomes;
  
  return requiredOutcomes.every(outcome => 
    outcome.type === 'approval' && outcome.status === 'approved'
  );
};

DecisionDependency.prototype.checkResultCondition = function() {
  // Check if dependent decision has produced required results
  const requiredOutcomes = this.conditions.requiredOutcomes;
  
  return requiredOutcomes.every(outcome => 
    outcome.type === 'result' && outcome.satisfied === true
  );
};

DecisionDependency.prototype.log = function(level, message, data = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    data,
  };
  
  this.executionLog.events.push(logEntry);
  
  // Keep only last 100 log entries
  if (this.executionLog.events.length > 100) {
    this.executionLog.events = this.executionLog.events.slice(-100);
  }
};

DecisionDependency.prototype.markFailed = function(reason) {
  this.status = 'failed';
  this.failureReason = reason;
  this.satisfactionTimestamp = new Date();
  
  this.log('error', 'Dependency failed', { 
    dependencyId: this.id,
    reason 
  });
  
  return this;
};

DecisionDependency.prototype.markSkipped = function(reason) {
  this.status = 'skipped';
  this.failureReason = reason;
  this.satisfactionTimestamp = new Date();
  
  this.log('warning', 'Dependency skipped', { 
    dependencyId: this.id,
    reason 
  });
  
  return this;
};

DecisionDependency.prototype.getDependencyGraph = function() {
  // Return information about this dependency and related dependencies
  return {
    id: this.id,
    type: this.dependencyType,
    strength: this.dependencyStrength,
    status: this.status,
    from: this.decisionId,
    to: this.dependsOnDecisionId,
    conditions: this.conditions,
    timestamp: this.createdAt,
  };
};

// Class methods
DecisionDependency.findByDecision = function(decisionId) {
  return this.findAll({
    where: { decisionId },
    include: [{
      model: sequelize.models.AutonomousDecision,
      as: 'dependsOnDecision',
      foreignKey: 'dependsOnDecisionId',
    }],
  });
};

DecisionDependency.findPrerequisites = function(decisionId) {
  return this.findAll({
    where: {
      decisionId,
      dependencyType: 'prerequisite',
    },
  });
};

DecisionDependency.getUnresolvedDependencies = function() {
  return this.findAll({
    where: {
      status: { [sequelize.Sequelize.Op.in]: ['pending', 'failed'] },
    },
    order: [['createdAt', 'ASC']],
  });
};

// Associations
DecisionDependency.associate = function(models) {
  // DecisionDependency belongs to AutonomousDecision (source)
  DecisionDependency.belongsTo(models.AutonomousDecision, {
    foreignKey: 'decisionId',
    as: 'decision',
  });
  
  // DecisionDependency belongs to AutonomousDecision (dependency)
  DecisionDependency.belongsTo(models.AutonomousDecision, {
    foreignKey: 'dependsOnDecisionId',
    as: 'dependsOnDecision',
  });
};

module.exports = DecisionDependency;