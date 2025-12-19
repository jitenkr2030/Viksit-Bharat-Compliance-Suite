const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AlertNotification = sequelize.define('AlertNotification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  // Related Entities
  deadlineId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'ComplianceDeadlines',
      key: 'id'
    },
    comment: 'Associated compliance deadline'
  },
  
  riskAssessmentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'RiskAssessments',
      key: 'id'
    },
    comment: 'Associated risk assessment'
  },
  
  institutionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Institutions',
      key: 'id'
    },
    comment: 'Institution for which this alert is sent'
  },
  
  // Recipient Information
  recipientType: {
    type: DataTypes.ENUM('individual', 'role', 'department', 'all_stakeholders'),
    allowNull: false,
    comment: 'Type of recipient for this alert'
  },
  
  recipientId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'Specific recipient ID (user, role, department)'
  },
  
  recipientName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Name of the recipient'
  },
  
  recipientEmail: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    },
    comment: 'Email address for email notifications'
  },
  
  recipientPhone: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Phone number for SMS/WhatsApp/Phone calls'
  },
  
  recipientWhatsApp: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'WhatsApp number (if different from phone)'
  },
  
  // Notification Configuration
  notificationType: {
    type: DataTypes.ENUM('deadline_reminder', 'risk_alert', 'overdue_warning', 'escalation', 'completion_confirmation', 'status_update'),
    allowNull: false,
    comment: 'Type of notification being sent'
  },
  
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent', 'critical'),
    allowNull: false,
    defaultValue: 'medium',
    comment: 'Priority level of this notification'
  },
  
  urgency: {
    type: DataTypes.ENUM('normal', 'high', 'emergency'),
    defaultValue: 'normal',
    comment: 'Urgency level for delivery'
  },
  
  // Channel Configuration
  channels: {
    type: DataTypes.ARRAY(DataTypes.ENUM('email', 'sms', 'whatsapp', 'phone', 'push', 'in_app')),
    allowNull: false,
    comment: 'Channels through which to send this notification'
  },
  
  // Message Content
  subject: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Subject line for email notifications'
  },
  
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Main message content'
  },
  
  shortMessage: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Short version for SMS/WhatsApp (160 chars max)'
  },
  
  // Delivery Status
  status: {
    type: DataTypes.ENUM('pending', 'scheduled', 'sent', 'delivered', 'failed', 'read', 'acknowledged', 'cancelled'),
    defaultValue: 'pending',
    comment: 'Current delivery status'
  },
  
  // Timing Configuration
  scheduledFor: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When this notification should be sent'
  },
  
  sentAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When this notification was actually sent'
  },
  
  deliveredAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When this notification was delivered'
  },
  
  readAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When this notification was read by recipient'
  },
  
  acknowledgedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When recipient acknowledged this notification'
  },
  
  // Channel-specific Delivery Information
  emailStatus: {
    type: DataTypes.ENUM('pending', 'sent', 'delivered', 'failed', 'bounced', 'opened', 'clicked'),
    allowNull: true,
    comment: 'Email delivery status'
  },
  
  smsStatus: {
    type: DataTypes.ENUM('pending', 'sent', 'delivered', 'failed', 'undelivered'),
    allowNull: true,
    comment: 'SMS delivery status'
  },
  
  whatsappStatus: {
    type: DataTypes.ENUM('pending', 'sent', 'delivered', 'failed', 'read'),
    allowNull: true,
    comment: 'WhatsApp delivery status'
  },
  
  phoneStatus: {
    type: DataTypes.ENUM('pending', 'calling', 'answered', 'voicemail', 'failed', 'busy', 'no_answer'),
    allowNull: true,
    comment: 'Phone call status'
  },
  
  pushStatus: {
    type: DataTypes.ENUM('pending', 'sent', 'delivered', 'failed', 'clicked'),
    allowNull: true,
    comment: 'Push notification status'
  },
  
  // External Service IDs
  emailMessageId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'External email service message ID'
  },
  
  smsMessageId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'External SMS service message ID'
  },
  
  whatsappMessageId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'External WhatsApp service message ID'
  },
  
  // Retry Configuration
  retryCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of retry attempts made'
  },
  
  maxRetries: {
    type: DataTypes.INTEGER,
    defaultValue: 3,
    comment: 'Maximum number of retry attempts allowed'
  },
  
  retryDelay: {
    type: DataTypes.INTEGER,
    defaultValue: 300, // 5 minutes in seconds
    comment: 'Delay between retry attempts (seconds)'
  },
  
  nextRetryAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When the next retry should be attempted'
  },
  
  // Error Handling
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Error message if delivery failed'
  },
  
  errorCode: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Error code from external service'
  },
  
  failureReason: {
    type: DataTypes.ENUM('invalid_recipient', 'service_unavailable', 'rate_limit_exceeded', 'content_filtered', 'network_error', 'unknown'),
    allowNull: true,
    comment: 'Reason for delivery failure'
  },
  
  // Template and Personalization
  templateId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'ID of notification template used'
  },
  
  templateVariables: {
    type: DataTypes.JSON,
    comment: 'Variables used in template personalization'
  },
  
  // Escalation Configuration
  escalationLevel: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Escalation level (0 = initial, 1 = first escalation, etc.)'
  },
  
  escalationPath: {
    type: DataTypes.ARRAY(DataTypes.JSON),
    defaultValue: [],
    comment: 'Array of escalation recipients with their levels'
  },
  
  escalated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether this notification triggered an escalation'
  },
  
  escalatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When escalation was triggered'
  },
  
  // Analytics and Tracking
  clickCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of times links in this notification were clicked'
  },
  
  engagementScore: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    comment: 'Engagement score based on recipient interactions (0-100)'
  },
  
  // Compliance and Audit
  consentStatus: {
    type: DataTypes.ENUM('granted', 'denied', 'pending', 'withdrawn'),
    defaultValue: 'granted',
    comment: 'Recipient consent status for notifications'
  },
  
  communicationLog: {
    type: DataTypes.TEXT,
    comment: 'Detailed communication log and timeline'
  },
  
  // Response and Acknowledgment
  requiresResponse: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether this notification requires a response'
  },
  
  responseReceived: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether response was received'
  },
  
  responseContent: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Content of the response received'
  },
  
  responseAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When response was received'
  },
  
  // Additional Metadata
  campaignId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Campaign ID if this is part of a larger notification campaign'
  },
  
  batchId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Batch ID if this was sent as part of a batch'
  },
  
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'Tags for categorization and filtering'
  },
  
  // Additional Notes
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Additional notes about this notification'
  }
}, {
  tableName: 'alert_notifications',
  timestamps: true,
  indexes: [
    {
      fields: ['deadlineId']
    },
    {
      fields: ['riskAssessmentId']
    },
    {
      fields: ['institutionId']
    },
    {
      fields: ['status']
    },
    {
      fields: ['priority']
    },
    {
      fields: ['scheduledFor']
    },
    {
      fields: ['recipientType']
    },
    {
      name: 'notification_status_date_idx',
      fields: ['status', 'scheduledFor']
    },
    {
      name: 'notification_recipient_idx',
      fields: ['recipientType', 'recipientId']
    },
    {
      name: 'notification_priority_status_idx',
      fields: ['priority', 'status']
    }
  ]
});

// Instance methods
AlertNotification.prototype.getDeliveryChannels = function() {
  return this.channels || [];
};

AlertNotification.prototype.isPending = function() {
  return ['pending', 'scheduled'].includes(this.status);
};

AlertNotification.prototype.isDelivered = function() {
  return ['delivered', 'read', 'acknowledged'].includes(this.status);
};

AlertNotification.prototype.hasFailed = function() {
  return this.status === 'failed' || this.retryCount >= this.maxRetries;
};

AlertNotification.prototype.needsRetry = function() {
  return this.hasFailed() && this.retryCount < this.maxRetries;
};

AlertNotification.prototype.canEscalate = function() {
  return this.escalationLevel < 3 && ['failed', 'no_answer'].includes(this.status);
};

// Class methods
AlertNotification.getPendingNotifications = function() {
  return this.findAll({
    where: {
      status: ['pending', 'scheduled'],
      scheduledFor: {
        [sequelize.Sequelize.Op.lte]: new Date()
      }
    },
    order: [['priority', 'DESC'], ['scheduledFor', 'ASC']]
  });
};

AlertNotification.getFailedNotifications = function() {
  return this.findAll({
    where: {
      status: 'failed'
    },
    order: [['createdAt', 'DESC']]
  });
};

AlertNotification.getNotificationsRequiringRetry = function() {
  const now = new Date();
  
  return this.findAll({
    where: {
      status: 'failed',
      retryCount: {
        [sequelize.Sequelize.Op.lt]: sequelize.Sequelize.col('maxRetries')
      },
      nextRetryAt: {
        [sequelize.Sequelize.Op.lte]: now
      }
    },
    order: [['nextRetryAt', 'ASC']]
  });
};

AlertNotification.getEscalationCandidates = function() {
  return this.findAll({
    where: {
      escalated: false,
      status: ['failed', 'no_answer'],
      escalationLevel: {
        [sequelize.Sequelize.Op.lt]: 3
      }
    },
    order: [['priority', 'DESC'], ['createdAt', 'ASC']]
  });
};

module.exports = AlertNotification;