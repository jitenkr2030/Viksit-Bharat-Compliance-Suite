// Phase 4: Task Dependency Model

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TaskDependency = sequelize.define('TaskDependency', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  
  // Dependencies
  taskId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'autonomous_tasks',
      key: 'id',
    },
  },
  dependsOnTaskId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'autonomous_tasks',
      key: 'id',
    },
  },
  
  // Dependency Type and Relationship
  dependencyType: {
    type: DataTypes.ENUM(
      'finish_to_start',
      'start_to_start',
      'finish_to_finish',
      'start_to_finish',
      'resource_dependency',
      'data_dependency',
      'conditional_dependency',
      'sequential_dependency'
    ),
    allowNull: false,
    defaultValue: 'finish_to_start',
  },
  dependencyStrength: {
    type: DataTypes.ENUM('optional', 'preferred', 'required', 'critical'),
    allowNull: false,
    defaultValue: 'required',
  },
  
  // Dependency Configuration
  configuration: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      lagTime: 0, // milliseconds
      leadTime: 0, // milliseconds
      conditions: [],
      constraints: {},
      resourceSharing: false,
      parallelExecution: false,
    },
  },
  validationRules: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      checkRequired: true,
      timeout: 300000, // 5 minutes
      retryCount: 3,
      fallbackAction: 'skip',
      validateData: true,
    },
  },
  
  // Status and Execution
  status: {
    type: DataTypes.ENUM('pending', 'satisfied', 'blocked', 'failed', 'timeout', 'skipped'),
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
  
  // Resource and Data Sharing
  resourceSharing: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      sharedResources: [],
      allocation: {},
      conflictResolution: 'priority_based',
      maxConcurrent: 1,
    },
  },
  dataSharing: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      inputData: [],
      outputData: [],
      dataFormat: 'json',
      validationRequired: true,
      transformationRules: [],
    },
  },
  
  // Monitoring and Performance
  monitoringConfig: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      checkInterval: 30000, // 30 seconds
      maxWaitTime: 3600000, // 1 hour
      alertOnFailure: true,
      performanceTracking: true,
    },
  },
  performanceMetrics: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      waitTime: 0,
      resolutionTime: 0,
      dependencyScore: 0.0,
      efficiency: 0.0,
      bottlenecks: [],
    },
  },
  
  // Execution Log
  executionLog: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      checks: [],
      events: [],
      errors: [],
      performance: {},
      resourceUsage: {},
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
  tableName: 'task_dependencies',
  timestamps: true,
  indexes: [
    {
      fields: ['taskId'],
    },
    {
      fields: ['dependsOnTaskId'],
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
TaskDependency.prototype.checkDependency = function() {
  const startTime = Date.now();
  
  try {
    this.log('info', 'Checking task dependency', { 
      dependencyId: this.id,
      taskId: this.taskId,
      dependsOnId: this.dependsOnTaskId,
      type: this.dependencyType
    });
    
    // Check if dependency is satisfied
    const isSatisfied = this.evaluateDependency();
    
    if (isSatisfied) {
      this.status = 'satisfied';
      this.satisfactionTimestamp = new Date();
      this.performanceMetrics.resolutionTime = Date.now() - startTime;
      this.log('info', 'Task dependency satisfied', { dependencyId: this.id });
    } else {
      this.status = 'pending';
      this.log('debug', 'Task dependency not yet satisfied', { dependencyId: this.id });
    }
    
    return isSatisfied;
  } catch (error) {
    this.status = 'failed';
    this.failureReason = error.message;
    this.performanceMetrics.resolutionTime = Date.now() - startTime;
    this.log('error', 'Task dependency check failed', { 
      dependencyId: this.id, 
      error: error.message 
    });
    
    return false;
  }
};

TaskDependency.prototype.evaluateDependency = function() {
  const config = this.configuration;
  
  switch (this.dependencyType) {
    case 'finish_to_start':
      return this.checkFinishToStart();
      
    case 'start_to_start':
      return this.checkStartToStart();
      
    case 'finish_to_finish':
      return this.checkFinishToFinish();
      
    case 'start_to_finish':
      return this.checkStartToFinish();
      
    case 'resource_dependency':
      return this.checkResourceDependency();
      
    case 'data_dependency':
      return this.checkDataDependency();
      
    case 'conditional_dependency':
      return this.checkConditionalDependency();
      
    case 'sequential_dependency':
      return this.checkSequentialDependency();
      
    default:
      return false;
  }
};

TaskDependency.prototype.checkFinishToStart = function() {
  // Check if dependent task has finished successfully
  // In real implementation, query the task status from database
  
  const conditions = this.configuration.conditions;
  
  if (conditions.length > 0) {
    // Check custom conditions
    return conditions.every(condition => {
      switch (condition.type) {
        case 'status':
          return condition.value === 'completed';
        case 'result':
          return condition.hasOwnProperty('success') && condition.success === true;
        case 'output':
          return condition.hasOwnProperty('data') && condition.data !== null;
        default:
          return true;
      }
    });
  }
  
  // Default: assume dependency is satisfied if task exists
  return true;
};

TaskDependency.prototype.checkStartToStart = function() {
  // Check if dependent task has started
  const conditions = this.configuration.conditions;
  
  return conditions.every(condition => {
    switch (condition.type) {
      case 'status':
        return ['running', 'completed'].includes(condition.value);
      case 'progress':
        return condition.progress >= (condition.minProgress || 0);
      default:
        return true;
    }
  });
};

TaskDependency.prototype.checkFinishToFinish = function() {
  // Check if both tasks finish at the same time or dependent task finishes first
  const conditions = this.configuration.conditions;
  
  return conditions.every(condition => {
    switch (condition.type) {
      case 'timing':
        return condition.timing === 'simultaneous' || condition.timing === 'dependent_first';
      default:
        return true;
    }
  });
};

TaskDependency.prototype.checkStartToFinish = function() {
  // Check if dependent task starts when this task finishes
  const conditions = this.configuration.conditions;
  
  // This typically involves scheduling logic
  return conditions.every(condition => {
    switch (condition.type) {
      case 'scheduling':
        return condition.relativeTiming === 'start_after_finish';
      default:
        return true;
    }
  });
};

TaskDependency.prototype.checkResourceDependency = function() {
  // Check if required resources are available
  const resourceSharing = this.resourceSharing;
  
  return resourceSharing.sharedResources.every(resource => {
    return resource.available === true && 
           resource.allocation >= resource.required &&
           resource.concurrentTasks < resource.maxConcurrent;
  });
};

TaskDependency.prototype.checkDataDependency = function() {
  // Check if required data is available from dependent task
  const dataSharing = this.dataSharing;
  
  return dataSharing.inputData.every(dataReq => {
    return dataReq.available === true && 
           (dataReq.validationPassed || !dataSharing.validationRequired);
  });
};

TaskDependency.prototype.checkConditionalDependency = function() {
  // Evaluate conditional logic
  const conditions = this.configuration.conditions;
  
  return conditions.every(condition => {
    switch (condition.type) {
      case 'time_based':
        return Date.now() >= condition.targetTime;
      case 'event_based':
        return condition.eventFired === true;
      case 'state_based':
        return condition.currentState === condition.requiredState;
      case 'performance_based':
        return condition.metric >= condition.threshold;
      default:
        return true;
    }
  });
};

TaskDependency.prototype.checkSequentialDependency = function() {
  // Check if tasks must be executed in sequence
  const conditions = this.configuration.conditions;
  
  return conditions.every(condition => {
    switch (condition.type) {
      case 'order':
        return condition.respectOrder === true;
      case 'sequence':
        return condition.sequenceNumber < condition.maxSequence;
      default:
        return true;
    }
  });
};

TaskDependency.prototype.canExecute = function() {
  // Check if this task can start considering all dependencies
  return this.status === 'satisfied' && 
         this.checkResourceAvailability() &&
         this.checkDataAvailability();
};

TaskDependency.prototype.checkResourceAvailability = function() {
  const resourceSharing = this.resourceSharing;
  
  if (!resourceSharing.resourceSharing) {
    return true; // No resource sharing required
  }
  
  return resourceSharing.sharedResources.every(resource => {
    return resource.available === true && 
           resource.currentUsage < resource.maxConcurrent;
  });
};

TaskDependency.prototype.checkDataAvailability = function() {
  const dataSharing = this.dataSharing;
  
  return dataSharing.inputData.every(data => {
    return data.available === true && 
           (data.validationPassed || !dataSharing.validationRequired);
  });
};

TaskDependency.prototype.log = function(level, message, data = {}) {
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

TaskDependency.prototype.markFailed = function(reason) {
  this.status = 'failed';
  this.failureReason = reason;
  this.satisfactionTimestamp = new Date();
  
  this.log('error', 'Task dependency failed', { 
    dependencyId: this.id,
    reason 
  });
  
  return this;
};

TaskDependency.prototype.markBlocked = function(reason) {
  this.status = 'blocked';
  this.failureReason = reason;
  
  this.log('warning', 'Task dependency blocked', { 
    dependencyId: this.id,
    reason 
  });
  
  return this;
};

TaskDependency.prototype.calculateWaitTime = function() {
  if (!this.satisfactionTimestamp) {
    return Date.now() - this.createdAt.getTime();
  }
  
  return this.satisfactionTimestamp.getTime() - this.createdAt.getTime();
};

TaskDependency.prototype.getDependencyScore = function() {
  // Calculate how critical this dependency is
  const baseScore = {
    'optional': 1,
    'preferred': 2,
    'required': 3,
    'critical': 4,
  };
  
  const typeMultiplier = {
    'finish_to_start': 1.0,
    'start_to_start': 0.8,
    'finish_to_finish': 0.9,
    'start_to_finish': 0.7,
    'resource_dependency': 1.2,
    'data_dependency': 1.1,
    'conditional_dependency': 0.6,
    'sequential_dependency': 0.8,
  };
  
  return (baseScore[this.dependencyStrength] || 1) * 
         (typeMultiplier[this.dependencyType] || 1);
};

TaskDependency.prototype.optimizeDependency = function() {
  // Analyze dependency and suggest optimizations
  const suggestions = [];
  
  // Check if dependency can be made parallel
  if (this.dependencyType === 'sequential_dependency') {
    suggestions.push({
      type: 'parallelization',
      description: 'Consider parallel execution for performance improvement',
      potentialGain: '20-30%',
      effort: 'medium',
    });
  }
  
  // Check if resource sharing can be improved
  if (this.dependencyType === 'resource_dependency') {
    suggestions.push({
      type: 'resource_optimization',
      description: 'Optimize resource allocation and sharing',
      potentialGain: '10-15%',
      effort: 'low',
    });
  }
  
  // Check if data dependencies can be cached
  if (this.dependencyType === 'data_dependency') {
    suggestions.push({
      type: 'data_caching',
      description: 'Implement data caching for frequently accessed dependencies',
      potentialGain: '15-25%',
      effort: 'medium',
    });
  }
  
  return suggestions;
};

// Class methods
TaskDependency.findByTask = function(taskId) {
  return this.findAll({
    where: { taskId },
    include: [{
      model: sequelize.models.AutonomousTask,
      as: 'dependsOnTask',
      foreignKey: 'dependsOnTaskId',
    }],
  });
};

TaskDependency.findBlockingDependencies = function(taskId) {
  return this.findAll({
    where: {
      taskId,
      status: { [sequelize.Sequelize.Op.not]: 'satisfied' },
      dependencyStrength: { [sequelize.Sequelize.Op.in]: ['required', 'critical'] },
    },
  });
};

TaskDependency.getDependencyGraph = function(taskId) {
  return this.findAll({
    where: {
      [sequelize.Sequelize.Op.or]: [
        { taskId },
        { dependsOnTaskId: taskId }
      ],
    },
    attributes: ['taskId', 'dependsOnTaskId', 'dependencyType', 'dependencyStrength', 'status'],
  });
};

TaskDependency.findCriticalPath = function() {
  // Find dependencies that form the critical path
  return this.findAll({
    where: {
      dependencyStrength: 'critical',
      status: 'satisfied',
    },
    order: [['satisfactionTimestamp', 'ASC']],
  });
};

// Associations
TaskDependency.associate = function(models) {
  // TaskDependency belongs to AutonomousTask (source task)
  TaskDependency.belongsTo(models.AutonomousTask, {
    foreignKey: 'taskId',
    as: 'task',
  });
  
  // TaskDependency belongs to AutonomousTask (dependent task)
  TaskDependency.belongsTo(models.AutonomousTask, {
    foreignKey: 'dependsOnTaskId',
    as: 'dependsOnTask',
  });
};

module.exports = TaskDependency;