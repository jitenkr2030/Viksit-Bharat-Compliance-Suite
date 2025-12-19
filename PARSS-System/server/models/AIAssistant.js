const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AIAssistant = sequelize.define('AIAssistant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  
  // Chat Session Information
  sessionId: {
    type: DataTypes.STRING(255),
    unique: true,
    allowNull: false,
    comment: 'Unique session identifier',
  },
  userId: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'User who started this session',
  },
  
  // Session Metadata
  sessionTitle: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'User-defined or auto-generated session title',
  },
  sessionDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Session description or context',
  },
  
  // Session Status
  status: {
    type: DataTypes.ENUM('active', 'paused', 'completed', 'archived'),
    defaultValue: 'active',
    comment: 'Current session status',
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium',
    comment: 'Session priority level',
  },
  
  // Context Information
  complianceFramework: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Primary compliance framework for this session',
  },
  institutionType: {
    type: DataTypes.ENUM('university', 'college', 'institute', 'school', 'other'),
    allowNull: true,
    comment: 'Type of educational institution',
  },
  organizationId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Organization identifier',
  },
  
  // Session Configuration
  language: {
    type: DataTypes.STRING(10),
    defaultValue: 'en',
    comment: 'Primary language for this session',
  },
  timezone: {
    type: DataTypes.STRING(50),
    defaultValue: 'UTC',
    comment: 'User timezone',
  },
  modelConfiguration: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'AI model configuration and parameters',
  },
  
  // Conversation Context
  context: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Conversation context and history summary',
  },
  userProfile: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'User profile and preferences',
  },
  sessionGoals: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'Goals for this assistance session',
  },
  
  // Interaction Statistics
  messageCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of messages in this session',
  },
  userMessageCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of user messages',
  },
  assistantMessageCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of assistant responses',
  },
  
  // Performance Metrics
  averageResponseTime: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
    comment: 'Average response time in seconds',
  },
  satisfactionScore: {
    type: DataTypes.DECIMAL(3, 1),
    allowNull: true,
    comment: 'User satisfaction score (1-5)',
  },
  resolutionStatus: {
    type: DataTypes.ENUM('resolved', 'partially_resolved', 'unresolved', 'escalated'),
    allowNull: true,
    comment: 'Whether the user issue was resolved',
  },
  
  // Session Timing
  startTime: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Session start time',
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Session end time',
  },
  lastActivity: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Last activity timestamp',
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Session duration in seconds',
  },
  
  // Knowledge Base Context
  relevantDocuments: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'Document IDs referenced in this session',
  },
  regulationsDiscussed: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'Regulations discussed in this session',
  },
  complianceAreas: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'Compliance areas covered',
  },
  
  // AI Model Information
  modelVersion: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'AI model version used',
  },
  promptTokens: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Total prompt tokens used',
  },
  completionTokens: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Total completion tokens generated',
  },
  totalTokens: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Total tokens used',
  },
  
  // Error Handling
  errorCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of errors encountered',
  },
  lastError: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Last error message',
  },
  recoveryAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of recovery attempts',
  },
  
  // Feedback and Rating
  userFeedback: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'User feedback and ratings',
  },
  helpfulnessRating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Helpfulness rating (1-5)',
  },
  accuracyRating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Accuracy rating (1-5)',
  },
  
  // Escalation Information
  escalated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether session was escalated to human',
  },
  escalationReason: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Reason for escalation',
  },
  escalatedTo: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Who the session was escalated to',
  },
  
  // Security and Privacy
  dataRetention: {
    type: DataTypes.ENUM('session_only', 'short_term', 'long_term', 'indefinite'),
    defaultValue: 'long_term',
    comment: 'Data retention policy for this session',
  },
  privacyLevel: {
    type: DataTypes.ENUM('public', 'internal', 'confidential', 'restricted'),
    defaultValue: 'internal',
    comment: 'Privacy level of session data',
  },
  anonymized: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether session data has been anonymized',
  },
  
  // Integration Information
  sourceChannel: {
    type: DataTypes.ENUM('web', 'mobile', 'api', 'chatbot', 'voice', 'email'),
    defaultValue: 'web',
    comment: 'Source channel for this session',
  },
  integrationId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Integration identifier if applicable',
  },
  
  // Additional Metadata
  customProperties: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Custom session properties',
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'Tags for categorization',
  },
  
  // Status Flags
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether session is currently active',
  },
  isArchived: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether session has been archived',
  },
  
}, {
  tableName: 'ai_assistants',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  
  indexes: [
    {
      fields: ['sessionId'],
      unique: true,
    },
    {
      fields: ['userId'],
    },
    {
      fields: ['status'],
    },
    {
      fields: ['complianceFramework'],
    },
    {
      fields: ['startTime'],
    },
    {
      fields: ['lastActivity'],
    },
    {
      fields: ['priority'],
    },
    {
      fields: ['resolutionStatus'],
    },
    {
      fields: ['tags'],
      using: 'gin',
    },
  ],
});

// Instance methods
AIAssistant.prototype.calculateDuration = function() {
  if (this.endTime && this.startTime) {
    return Math.floor((this.endTime - this.startTime) / 1000);
  }
  return null;
};

AIAssistant.prototype.getEfficiency = function() {
  // Calculate efficiency based on resolution status and duration
  if (!this.duration) return 0;
  
  let efficiency = 0;
  
  switch (this.resolutionStatus) {
    case 'resolved':
      efficiency = 100;
      break;
    case 'partially_resolved':
      efficiency = 70;
      break;
    case 'escalated':
      efficiency = 30;
      break;
    default:
      efficiency = 10;
  }
  
  // Adjust for duration (shorter is better)
  const durationPenalty = Math.min(this.duration / 3600 * 10, 50); // Max 50% penalty
  efficiency = Math.max(0, efficiency - durationPenalty);
  
  return Math.round(efficiency);
};

AIAssistant.prototype.getSatisfactionScore = function() {
  if (this.satisfactionScore) return this.satisfactionScore;
  
  // Calculate based on ratings and resolution
  let score = 3; // Base score
  
  if (this.helpfulnessRating) score += (this.helpfulnessRating - 3) * 0.4;
  if (this.accuracyRating) score += (this.accuracyRating - 3) * 0.4;
  
  switch (this.resolutionStatus) {
    case 'resolved':
      score += 0.5;
      break;
    case 'partially_resolved':
      score += 0.2;
      break;
    case 'escalated':
      score -= 0.5;
      break;
  }
  
  return Math.max(1, Math.min(5, score));
};

AIAssistant.prototype.needsFollowUp = function() {
  return this.resolutionStatus === 'unresolved' || 
         this.satisfactionScore < 3 ||
         this.errorCount > 3;
};

AIAssistant.prototype.isHighPriority = function() {
  return this.priority === 'urgent' ||
         this.escalated ||
         this.errorCount > 5 ||
         this.satisfactionScore < 2;
};

// Class methods
AIAssistant.findActiveSessions = function(userId = null) {
  const whereClause = { 
    status: 'active',
    isActive: true
  };
  
  if (userId) {
    whereClause.userId = userId;
  }
  
  return this.findAll({
    where: whereClause,
    order: [['lastActivity', 'DESC']]
  });
};

AIAssistant.getSessionStatistics = async function(startDate, endDate) {
  const whereClause = {};
  
  if (startDate || endDate) {
    whereClause.startTime = {};
    if (startDate) whereClause.startTime[sequelize.Op.gte] = startDate;
    if (endDate) whereClause.startTime[sequelize.Op.lte] = endDate;
  }
  
  const stats = await this.findAll({
    where: whereClause,
    attributes: [
      'resolutionStatus',
      [sequelize.fn('COUNT', sequelize.col('id')), 'sessionCount'],
      [sequelize.fn('AVG', sequelize.col('satisfactionScore')), 'avgSatisfaction'],
      [sequelize.fn('AVG', sequelize.col('averageResponseTime')), 'avgResponseTime']
    ],
    group: ['resolutionStatus']
  });
  
  return stats;
};

AIAssistant.getPopularTopics = async function(limit = 10) {
  // This would typically involve NLP analysis of the conversation content
  // For now, returning compliance areas frequency
  const topics = await this.findAll({
    attributes: [
      [sequelize.fn('unnest', sequelize.col('complianceAreas')), 'area'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'frequency']
    ],
    where: {
      complianceAreas: {
        [sequelize.Op.not]: []
      }
    },
    group: ['area'],
    order: [[sequelize.literal('frequency'), 'DESC']],
    limit
  });
  
  return topics;
};

AIAssistant.searchSessions = async function(query, options = {}) {
  const { 
    userId, 
    complianceFramework, 
    status,
    startDate,
    endDate,
    limit = 50, 
    offset = 0 
  } = options;
  
  const whereClause = {};
  
  if (query) {
    whereClause.$or = [
      { sessionTitle: { $like: `%${query}%` } },
      { sessionDescription: { $like: `%${query}%` } },
      { tags: { $overlap: [query] } }
    ];
  }
  
  if (userId) whereClause.userId = userId;
  if (complianceFramework) whereClause.complianceFramework = complianceFramework;
  if (status) whereClause.status = status;
  
  if (startDate || endDate) {
    whereClause.startTime = {};
    if (startDate) whereClause.startTime[sequelize.Op.gte] = startDate;
    if (endDate) whereClause.startTime[sequelize.Op.lte] = endDate;
  }
  
  return this.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    order: [['startTime', 'DESC']]
  });
};

AIAssistant.getPerformanceMetrics = async function(period = '30d') {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(period));
  
  const metrics = await this.findAll({
    where: {
      startTime: {
        [sequelize.Op.gte]: startDate
      }
    },
    attributes: [
      [sequelize.fn('COUNT', sequelize.col('id')), 'totalSessions'],
      [sequelize.fn('AVG', sequelize.col('satisfactionScore')), 'avgSatisfaction'],
      [sequelize.fn('AVG', sequelize.col('averageResponseTime')), 'avgResponseTime'],
      [sequelize.fn('SUM', sequelize.col('totalTokens')), 'totalTokens'],
      [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('userId'))), 'uniqueUsers']
    ]
  });
  
  return metrics[0];
};

module.exports = AIAssistant;