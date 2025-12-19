const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const NotificationEscalation = sequelize.define('NotificationEscalation', {
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
  ruleName: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  ruleType: {
    type: DataTypes.ENUM(
      'compliance_deadline',
      'audit_breach',
      'non_compliance',
      'risk_threshold',
      'policy_violation',
      'document_expiry',
      'training_due',
      'license_expiry',
      'regulatory_change',
      'system_error',
      'data_anomaly',
      'custom'
    ),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'paused', 'triggered', 'resolved'),
    allowNull: false,
    defaultValue: 'active'
  },
  // Trigger conditions
  triggerConditions: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  severity: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    allowNull: false,
    defaultValue: 'medium'
  },
  priority: {
    type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
    allowNull: false,
    defaultValue: 'normal'
  },
  // Escalation levels
  escalationLevels: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  currentLevel: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  maxLevel: {
    type: DataTypes.INTEGER,
    defaultValue: 3
  },
  // Timing configuration
  timeToEscalate: {
    type: DataTypes.INTEGER, // in minutes
    allowNull: false,
    defaultValue: 60
  },
  escalationInterval: {
    type: DataTypes.INTEGER, // in minutes
    defaultValue: 30
  },
  workingHoursOnly: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  workingHours: {
    type: DataTypes.JSONB
  },
  // Notification channels
  notificationChannels: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  recipients: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  ccRecipients: {
    type: DataTypes.JSONB
  },
  bccRecipients: {
    type: DataTypes.JSONB
  },
  // Notification content
  subjectTemplate: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  messageTemplate: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  emailTemplate: {
    type: DataTypes.TEXT
  },
  smsTemplate: {
    type: DataTypes.STRING(160) // SMS character limit
  },
  // Escalation actions
  escalationActions: {
    type: DataTypes.JSONB
  },
  autoActions: {
    type: DataTypes.JSONB
  },
  manualActions: {
    type: DataTypes.JSONB
  },
  // Monitoring and tracking
  lastTriggered: {
    type: DataTypes.DATE
  },
  totalTriggers: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  resolvedTriggers: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  avgResolutionTime: {
    type: DataTypes.INTEGER // in minutes
  },
  // Current incident
  currentIncidentId: {
    type: DataTypes.UUID
  },
  incidentStartTime: {
    type: DataTypes.DATE
  },
  incidentStatus: {
    type: DataTypes.ENUM('open', 'acknowledged', 'in_progress', 'resolved', 'closed'),
    defaultValue: 'open'
  },
  // Response tracking
  responseTimes: {
    type: DataTypes.JSONB
  },
  acknowledgments: {
    type: DataTypes.JSONB
  },
  resolutions: {
    type: DataTypes.JSONB
  },
  // Reporting and analytics
  metrics: {
    type: DataTypes.JSONB
  },
  reports: {
    type: DataTypes.JSONB
  },
  analytics: {
    type: DataTypes.JSONB
  },
  // Integration settings
  externalIntegrations: {
    type: DataTypes.JSONB
  },
  webhooks: {
    type: DataTypes.JSONB
  },
  apiIntegrations: {
    type: DataTypes.JSONB
  },
  // Suppression and snooze
  suppressionRules: {
    type: DataTypes.JSONB
  },
  maintenanceWindow: {
    type: DataTypes.JSONB
  },
  snoozeSettings: {
    type: DataTypes.JSONB
  },
  // Quality and feedback
  notificationQuality: {
    type: DataTypes.JSONB
  },
  userFeedback: {
    type: DataTypes.JSONB
  },
  effectivenessScore: {
    type: DataTypes.DECIMAL(3, 2),
    validate: {
      min: 0,
      max: 10
    }
  },
  // Configuration backup
  backupConfiguration: {
    type: DataTypes.JSONB
  },
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'notification_escalations',
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
      fields: ['ruleType']
    },
    {
      fields: ['status']
    },
    {
      fields: ['severity']
    },
    {
      fields: ['currentLevel']
    }
  ]
});

module.exports = NotificationEscalation;