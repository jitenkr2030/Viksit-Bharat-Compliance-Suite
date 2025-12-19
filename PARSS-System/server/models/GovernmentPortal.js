const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GovernmentPortal = sequelize.define('GovernmentPortal', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  // Portal Information
  portalName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Name of the government portal (UGC, AICTE, NAAC)'
  },
  
  portalCode: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'Unique code for the portal (UGC, AICTE, NAAC)'
  },
  
  baseUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Base URL for the government portal'
  },
  
  apiEndpoint: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'API endpoint for compliance verification'
  },
  
  // Authentication Configuration
  authType: {
    type: DataTypes.ENUM('oauth2', 'api_key', 'basic_auth', 'bearer_token'),
    allowNull: false,
    defaultValue: 'api_key',
    comment: 'Authentication method for portal access'
  },
  
  clientId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'OAuth2 client ID'
  },
  
  clientSecret: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'OAuth2 client secret (encrypted)'
  },
  
  apiKey: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'API key for authentication (encrypted)'
  },
  
  accessToken: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Current access token (encrypted)'
  },
  
  refreshToken: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Refresh token for token renewal (encrypted)'
  },
  
  tokenExpiry: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When the access token expires'
  },
  
  // Portal Status
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether the portal is currently active'
  },
  
  lastSyncAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Last successful data synchronization'
  },
  
  lastHealthCheck: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Last health check performed'
  },
  
  healthStatus: {
    type: DataTypes.ENUM('healthy', 'degraded', 'down', 'maintenance'),
    defaultValue: 'healthy',
    comment: 'Current health status of the portal'
  },
  
  // Rate Limiting
  rateLimitPerHour: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
    comment: 'Maximum requests per hour'
  },
  
  rateLimitPerDay: {
    type: DataTypes.INTEGER,
    defaultValue: 1000,
    comment: 'Maximum requests per day'
  },
  
  requestsToday: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of requests made today'
  },
  
  requestsThisHour: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of requests made this hour'
  },
  
  // Compliance Categories
  supportedCategories: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'List of compliance categories supported by this portal'
  },
  
  requiredFields: {
    type: DataTypes.JSON,
    comment: 'JSON object containing required fields for compliance verification'
  },
  
  // Webhook Configuration
  webhookUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Webhook URL for real-time notifications'
  },
  
  webhookSecret: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Secret for webhook verification (encrypted)'
  },
  
  // Configuration
  config: {
    type: DataTypes.JSON,
    comment: 'Additional configuration as JSON'
  },
  
  // Metadata
  contactEmail: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Contact email for portal support'
  },
  
  documentationUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'URL to API documentation'
  },
  
  version: {
    type: DataTypes.STRING,
    defaultValue: '1.0',
    comment: 'API version being used'
  }
}, {
  tableName: 'government_portals',
  timestamps: true,
  indexes: [
    {
      fields: ['portalCode']
    },
    {
      fields: ['isActive']
    },
    {
      fields: ['healthStatus']
    },
    {
      fields: ['lastHealthCheck']
    }
  ]
});

// Instance methods
GovernmentPortal.prototype.isTokenExpired = function() {
  if (!this.tokenExpiry) return true;
  return new Date() > new Date(this.tokenExpiry);
};

GovernmentPortal.prototype.needsTokenRefresh = function() {
  if (!this.tokenExpiry) return true;
  
  const expiryTime = new Date(this.tokenExpiry);
  const now = new Date();
  const timeToExpiry = expiryTime.getTime() - now.getTime();
  
  // Refresh if token expires in less than 5 minutes
  return timeToExpiry < (5 * 60 * 1000);
};

GovernmentPortal.prototype.canMakeRequest = function() {
  const now = new Date();
  const hourStart = new Date(now);
  hourStart.setMinutes(0, 0, 0);
  
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  
  // Reset counters if it's a new hour or day
  if (this.lastHealthCheck && this.lastHealthCheck < hourStart) {
    this.requestsThisHour = 0;
  }
  
  if (this.lastHealthCheck && this.lastHealthCheck < dayStart) {
    this.requestsToday = 0;
  }
  
  return this.requestsThisHour < this.rateLimitPerHour && 
         this.requestsToday < this.rateLimitPerDay;
};

GovernmentPortal.prototype.recordRequest = function() {
  this.requestsThisHour += 1;
  this.requestsToday += 1;
  this.lastHealthCheck = new Date();
};

// Class methods
GovernmentPortal.getActivePortals = function() {
  return this.findAll({
    where: { isActive: true },
    order: [['portalName', 'ASC']]
  });
};

GovernmentPortal.getHealthyPortals = function() {
  return this.findAll({
    where: { 
      isActive: true,
      healthStatus: 'healthy'
    },
    order: [['portalName', 'ASC']]
  });
};

GovernmentPortal.getPortalsNeedingHealthCheck = function() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  
  return this.findAll({
    where: {
      isActive: true,
      [sequelize.Sequelize.Op.or]: [
        { lastHealthCheck: null },
        { lastHealthCheck: { [sequelize.Sequelize.Op.lt]: fiveMinutesAgo } }
      ]
    }
  });
};

module.exports = GovernmentPortal;