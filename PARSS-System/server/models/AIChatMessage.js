const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AIChatMessage = sequelize.define('AIChatMessage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  
  // Session Reference
  sessionId: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Reference to AIAssistant session',
  },
  
  // Message Identification
  messageId: {
    type: DataTypes.STRING(255),
    unique: true,
    allowNull: false,
    comment: 'Unique message identifier',
  },
  sequenceNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Sequence number within the session',
  },
  
  // Message Content
  role: {
    type: DataTypes.ENUM('user', 'assistant', 'system'),
    allowNull: false,
    comment: 'Role of the message sender',
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Message content',
  },
  contentType: {
    type: DataTypes.ENUM('text', 'image', 'document', 'audio', 'video', 'code'),
    defaultValue: 'text',
    comment: 'Type of message content',
  },
  
  // Message Metadata
  messageType: {
    type: DataTypes.ENUM(
      'question', 
      'answer', 
      'clarification', 
      'follow_up', 
      'explanation', 
      'instruction',
      'feedback',
      'error',
      'system_message'
    ),
    allowNull: true,
    comment: 'Type of message interaction',
  },
  intent: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Detected intent of the message',
  },
  intentConfidence: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'Confidence score for intent detection (0-100)',
  },
  
  // NLP Analysis
  entities: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Named entities extracted from message',
  },
  sentiments: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Sentiment analysis results',
  },
  keywords: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'Extracted keywords',
  },
  topics: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'Topics identified in message',
  },
  
  // Compliance Context
  complianceFramework: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Compliance framework mentioned in message',
  },
  regulations: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'Regulations mentioned in message',
  },
  complianceAreas: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'Compliance areas discussed',
  },
  
  // Knowledge Base References
  referencedDocuments: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'Document IDs referenced in this message',
  },
  knowledgeSources: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'Knowledge sources used for this response',
  },
  
  // Response Quality
  relevanceScore: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'Relevance score of the response (0-100)',
  },
  accuracyScore: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'Accuracy score of the response (0-100)',
  },
  completenessScore: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'Completeness score of the response (0-100)',
  },
  
  // AI Model Information
  modelUsed: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'AI model used for this response',
  },
  modelVersion: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Model version',
  },
  promptTokens: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Tokens used in prompt',
  },
  completionTokens: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Tokens in completion',
  },
  totalTokens: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Total tokens used',
  },
  
  // Timing Information
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Message timestamp',
  },
  responseTime: {
    type: DataTypes.DECIMAL(8, 3),
    allowNull: true,
    comment: 'Response generation time in seconds',
  },
  
  // Processing Pipeline
  processingStatus: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
    defaultValue: 'pending',
    comment: 'Processing status',
  },
  processingSteps: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Processing pipeline steps and results',
  },
  
  // Error Handling
  errorOccurred: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether an error occurred during processing',
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Error message if occurred',
  },
  errorCode: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Error code',
  },
  retryCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of retry attempts',
  },
  
  // User Feedback
  userRating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'User rating for this message (1-5)',
  },
  userFeedback: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'User feedback text',
  },
  feedbackCategory: {
    type: DataTypes.ENUM('helpful', 'unhelpful', 'accurate', 'inaccurate', 'complete', 'incomplete', 'other'),
    allowNull: true,
    comment: 'Category of user feedback',
  },
  
  // Follow-up Information
  requiresFollowUp: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether this message requires follow-up',
  },
  followUpReason: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Reason for follow-up requirement',
  },
  parentMessageId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'ID of parent message for threading',
  },
  childMessageIds: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'IDs of child messages',
  },
  
  // Context Information
  conversationContext: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Conversation context at this point',
  },
  memoryContext: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Relevant memory context for this message',
  },
  
  // Attachments and Media
  attachments: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'File attachments or media links',
  },
  mediaUrls: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'Media URLs referenced in message',
  },
  
  // Security and Privacy
  containsSensitiveInfo: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether message contains sensitive information',
  },
  anonymized: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether message has been anonymized',
  },
  dataClassification: {
    type: DataTypes.ENUM('public', 'internal', 'confidential', 'restricted'),
    defaultValue: 'internal',
    comment: 'Data classification level',
  },
  
  // Performance Metrics
  wordCount: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Number of words in message',
  },
  characterCount: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Number of characters in message',
  },
  readingTime: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Estimated reading time in seconds',
  },
  
  // Custom Properties
  customProperties: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Custom message properties',
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'Tags for categorization',
  },
  
  // Status Flags
  isEdited: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether message has been edited',
  },
  editedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Edit timestamp',
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether message has been deleted',
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Deletion timestamp',
  },
  
}, {
  tableName: 'ai_chat_messages',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  
  indexes: [
    {
      fields: ['sessionId', 'sequenceNumber'],
      unique: true,
    },
    {
      fields: ['sessionId'],
    },
    {
      fields: ['timestamp'],
    },
    {
      fields: ['role'],
    },
    {
      fields: ['messageType'],
    },
    {
      fields: ['intent'],
    },
    {
      fields: ['processingStatus'],
    },
    {
      fields: ['complianceFramework'],
    },
    {
      fields: ['containsSensitiveInfo'],
    },
    {
      fields: ['tags'],
      using: 'gin',
    },
    {
      fields: ['messageId'],
      unique: true,
    },
  ],
});

// Instance methods
AIChatMessage.prototype.getWordCount = function() {
  if (this.wordCount) return this.wordCount;
  
  const words = this.content.trim().split(/\s+/).filter(word => word.length > 0);
  return words.length;
};

AIChatMessage.prototype.getReadingTime = function() {
  if (this.readingTime) return this.readingTime;
  
  const wordCount = this.getWordCount();
  const wordsPerMinute = 200; // Average reading speed
  return Math.ceil((wordCount / wordsPerMinute) * 60);
};

AIChatMessage.prototype.getQualityScore = function() {
  // Calculate overall quality score
  if (this.role !== 'assistant') return null;
  
  let score = 0;
  let factors = 0;
  
  if (this.relevanceScore) {
    score += this.relevanceScore;
    factors++;
  }
  
  if (this.accuracyScore) {
    score += this.accuracyScore;
    factors++;
  }
  
  if (this.completenessScore) {
    score += this.completenessScore;
    factors++;
  }
  
  return factors > 0 ? score / factors : null;
};

AIChatMessage.prototype.isHelpful = function() {
  return this.userRating >= 4 || 
         this.feedbackCategory === 'helpful' ||
         (this.relevanceScore && this.relevanceScore >= 80);
};

AIChatMessage.prototype.needsReview = function() {
  return this.errorOccurred ||
         this.userRating <= 2 ||
         this.feedbackCategory === 'unhelpful' ||
         (this.accuracyScore && this.accuracyScore < 70);
};

// Class methods
AIChatMessage.findBySession = function(sessionId, options = {}) {
  const { 
    limit = 100, 
    offset = 0,
    order = 'ASC'
  } = options;
  
  return this.findAll({
    where: { sessionId },
    limit,
    offset,
    order: [['sequenceNumber', order]]
  });
};

AIChatMessage.findConversationThread = function(messageId) {
  return this.findOne({
    where: { messageId },
    include: [{
      model: this,
      as: 'childMessages',
      foreignKey: 'parentMessageId'
    }, {
      model: this,
      as: 'parentMessage',
      foreignKey: 'childMessageIds'
    }]
  });
};

AIChatMessage.getMessageStatistics = async function(sessionId) {
  const stats = await this.findAll({
    where: { sessionId },
    attributes: [
      'role',
      [sequelize.fn('COUNT', sequelize.col('id')), 'messageCount'],
      [sequelize.fn('AVG', sequelize.col('wordCount')), 'avgWordCount'],
      [sequelize.fn('AVG', sequelize.col('responseTime')), 'avgResponseTime']
    ],
    group: ['role']
  });
  
  return stats;
};

AIChatMessage.searchMessages = async function(query, options = {}) {
  const { 
    sessionId, 
    role, 
    messageType,
    startDate,
    endDate,
    limit = 50, 
    offset = 0 
  } = options;
  
  const whereClause = {};
  
  if (query) {
    whereClause.content = {
      [sequelize.Op.iLike]: `%${query}%`
    };
  }
  
  if (sessionId) whereClause.sessionId = sessionId;
  if (role) whereClause.role = role;
  if (messageType) whereClause.messageType = messageType;
  
  if (startDate || endDate) {
    whereClause.timestamp = {};
    if (startDate) whereClause.timestamp[sequelize.Op.gte] = startDate;
    if (endDate) whereClause.timestamp[sequelize.Op.lte] = endDate;
  }
  
  return this.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    order: [['timestamp', 'DESC']]
  });
};

AIChatMessage.getPopularTopics = async function(sessionId = null, limit = 20) {
  const whereClause = {
    topics: {
      [sequelize.Op.not]: []
    }
  };
  
  if (sessionId) {
    whereClause.sessionId = sessionId;
  }
  
  const topics = await this.findAll({
    where: whereClause,
    attributes: [
      [sequelize.fn('unnest', sequelize.col('topics')), 'topic'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'frequency']
    ],
    group: ['topic'],
    order: [[sequelize.literal('frequency'), 'DESC']],
    limit
  });
  
  return topics;
};

AIChatMessage.cleanupOldMessages = async function(retentionDays = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
  
  return this.destroy({
    where: {
      timestamp: {
        [sequelize.Op.lt]: cutoffDate
      },
      isDeleted: true
    }
  });
};

module.exports = AIChatMessage;