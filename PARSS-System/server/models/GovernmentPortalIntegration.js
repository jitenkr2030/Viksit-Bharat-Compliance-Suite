const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const GovernmentPortalIntegration = sequelize.define('GovernmentPortalIntegration', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  organizationId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'organizations',
      key: 'id'
    }
  },
  integrationName: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  portalType: {
    type: DataTypes.ENUM(
      'mca21', 
      'gst_portal', 
      'income_tax', 
      'esic', 
      'epf',
      'pfms',
      'gem',
      'msme',
      'dpiit',
      'startup_india',
      'other'
    ),
    allowNull: false
  },
  portalUrl: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'testing', 'error', 'maintenance'),
    allowNull: false,
    defaultValue: 'testing'
  },
  // API Configuration
  apiEndpoint: {
    type: DataTypes.STRING(500)
  },
  apiVersion: {
    type: DataTypes.STRING(50)
  },
  authenticationType: {
    type: DataTypes.ENUM('api_key', 'oauth2', 'certificate', 'basic_auth', 'none'),
    allowNull: false,
    defaultValue: 'api_key'
  },
  authenticationCredentials: {
    type: DataTypes.JSONB
  },
  apiHeaders: {
    type: DataTypes.JSONB
  },
  // Integration capabilities
  supportedOperations: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  dataFormats: {
    type: DataTypes.JSONB
  },
  // Filing capabilities
  autoFilingEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  filingTypes: {
    type: DataTypes.JSONB
  },
  filingSchedule: {
    type: DataTypes.JSONB
  },
  filingReminders: {
    type: DataTypes.JSONB
  },
  // Monitoring and health
  lastSuccessfulConnection: {
    type: DataTypes.DATE
  },
  lastHealthCheck: {
    type: DataTypes.DATE
  },
  healthStatus: {
    type: DataTypes.ENUM('healthy', 'degraded', 'unhealthy', 'unknown'),
    defaultValue: 'unknown'
  },
  connectionAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  successfulAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  failedAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  averageResponseTime: {
    type: DataTypes.INTEGER // in milliseconds
  },
  // Data synchronization
  lastSyncDate: {
    type: DataTypes.DATE
  },
  syncFrequency: {
    type: DataTypes.ENUM('real_time', 'hourly', 'daily', 'weekly', 'monthly', 'on_demand'),
    defaultValue: 'daily'
  },
  syncStatus: {
    type: DataTypes.ENUM('idle', 'syncing', 'completed', 'failed'),
    defaultValue: 'idle'
  },
  syncErrors: {
    type: DataTypes.JSONB
  },
  dataMapping: {
    type: DataTypes.JSONB
  },
  // Filing tracking
  totalFilings: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  successfulFilings: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  failedFilings: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  pendingFilings: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  upcomingFilings: {
    type: DataTypes.JSONB
  },
  // Configuration settings
  portalCredentials: {
    type: DataTypes.JSONB
  },
  sandboxMode: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  rateLimiting: {
    type: DataTypes.JSONB
  },
  retryPolicy: {
    type: DataTypes.JSONB
  },
  timeoutSettings: {
    type: DataTypes.JSONB
  },
  // Error handling
  errorLog: {
    type: DataTypes.JSONB
  },
  alertSettings: {
    type: DataTypes.JSONB
  },
  escalationRules: {
    type: DataTypes.JSONB
  },
  // Documentation and support
  apiDocumentation: {
    type: DataTypes.STRING(1000)
  },
  supportContact: {
    type: DataTypes.JSONB
  },
  troubleshootingGuide: {
    type: DataTypes.TEXT
  },
  // Security settings
  encryptionEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  secureDataTransmission: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  auditLogging: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  // Version control
  integrationVersion: {
    type: DataTypes.STRING(50),
    defaultValue: '1.0.0'
  },
  lastUpdated: {
    type: DataTypes.DATE
  },
  updateNotes: {
    type: DataTypes.TEXT
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'government_portal_integrations',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['organizationId']
    },
    {
      fields: ['portalType']
    },
    {
      fields: ['status']
    },
    {
      fields: ['healthStatus']
    }
  ]
});

module.exports = GovernmentPortalIntegration;