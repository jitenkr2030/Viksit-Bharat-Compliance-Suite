const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Alert = sequelize.define('Alert', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  institution_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'institutions',
      key: 'id'
    }
  },
  faculty_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'faculties',
      key: 'id'
    }
  },
  approval_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'approvals',
      key: 'id'
    }
  },
  document_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'documents',
      key: 'id'
    }
  },
  alert_type: {
    type: DataTypes.ENUM(
      'approval_expiry',
      'document_expiry',
      'training_due',
      'background_check_due',
      'medical_checkup_due',
      'performance_review_due',
      'audit_due',
      'renewal_required',
      'compliance_violation',
      'policy_update',
      'deadline_approaching',
      'missing_document',
      'incomplete_registration',
      'faculty_verification',
      'infrastructure_issue',
      'quality_issue',
      'accreditation_due',
      'custom'
    ),
    allowNull: false
  },
  severity: {
    type: DataTypes.ENUM('info', 'warning', 'high', 'critical'),
    allowNull: false,
    defaultValue: 'warning'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    allowNull: false,
    defaultValue: 'medium'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [5, 255]
    }
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  council: {
    type: DataTypes.ENUM('regulatory', 'standards', 'accreditation', 'all'),
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM(
      'compliance',
      'deadline',
      'renewal',
      'verification',
      'audit',
      'training',
      'policy',
      'quality',
      'infrastructure',
      'personnel',
      'financial',
      'academic',
      'administrative'
    ),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'acknowledged', 'resolved', 'dismissed', 'escalated'),
    defaultValue: 'active'
  },
  source: {
    type: DataTypes.ENUM('system', 'manual', 'integration', 'scheduled_job'),
    defaultValue: 'system'
  },
  triggered_by: {
    type: DataTypes.STRING,
    allowNull: true
  },
  related_entity_type: {
    type: DataTypes.ENUM('institution', 'faculty', 'approval', 'document', 'training', 'audit'),
    allowNull: true
  },
  related_entity_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  due_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  escalation_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  resolution_deadline: {
    type: DataTypes.DATE,
    allowNull: true
  },
  assigned_to: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  acknowledged_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  acknowledged_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  resolved_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  resolved_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  resolution_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  dismissed_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  dismissed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  dismissal_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_escalated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  escalation_level: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 5
    }
  },
  auto_resolve: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  auto_resolve_conditions: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  recurrence_rule: {
    type: DataTypes.STRING,
    allowNull: true
  },
  next_occurrence: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notification_channels: {
    type: DataTypes.ARRAY(DataTypes.ENUM('email', 'sms', 'push', 'in_app', 'dashboard')),
    defaultValue: ['in_app', 'email']
  },
  notification_sent: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: []
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  custom_fields: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  is_system_generated: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  is_recurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  parent_alert_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'alerts',
      key: 'id'
    }
  },
  impact_score: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 10
    }
  },
  business_impact: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    allowNull: true
  }
}, {
  tableName: 'alerts',
  indexes: [
    {
      fields: ['institution_id']
    },
    {
      fields: ['faculty_id']
    },
    {
      fields: ['approval_id']
    },
    {
      fields: ['document_id']
    },
    {
      fields: ['alert_type']
    },
    {
      fields: ['severity']
    },
    {
      fields: ['priority']
    },
    {
      fields: ['status']
    },
    {
      fields: ['council']
    },
    {
      fields: ['category']
    },
    {
      fields: ['due_date']
    },
    {
      fields: ['assigned_to']
    },
    {
      fields: ['is_escalated']
    }
  ]
});

// Instance methods
Alert.prototype.getDaysUntilDue = function() {
  if (!this.due_date) return null;
  
  const today = new Date();
  const dueDate = new Date(this.due_date);
  const timeDiff = dueDate.getTime() - today.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  return daysDiff;
};

Alert.prototype.isOverdue = function() {
  if (!this.due_date) return false;
  return new Date() > new Date(this.due_date);
};

Alert.prototype.isDueSoon = function(days = 7) {
  const daysUntilDue = this.getDaysUntilDue();
  return daysUntilDue !== null && daysUntilDue <= days && daysUntilDue >= 0;
};

Alert.prototype.getUrgencyLevel = function() {
  if (this.severity === 'critical') return 'urgent';
  if (this.severity === 'high' && this.isOverdue()) return 'urgent';
  if (this.severity === 'high' && this.isDueSoon(3)) return 'urgent';
  if (this.isOverdue()) return 'high';
  if (this.isDueSoon()) return 'medium';
  return 'low';
};

Alert.prototype.canAutoResolve = function() {
  if (!this.auto_resolve) return false;
  
  const conditions = this.auto_resolve_conditions || {};
  
  // Check if conditions are met
  if (conditions.status_change && this.status !== conditions.status_change) {
    return false;
  }
  
  if (conditions.date_before && new Date() >= new Date(conditions.date_before)) {
    return false;
  }
  
  return true;
};

Alert.prototype.acknowledge = function(userId) {
  this.status = 'acknowledged';
  this.acknowledged_by = userId;
  this.acknowledged_at = new Date();
  return this.save();
};

Alert.prototype.resolve = function(userId, notes = '') {
  this.status = 'resolved';
  this.resolved_by = userId;
  this.resolved_at = new Date();
  this.resolution_notes = notes;
  return this.save();
};

Alert.prototype.dismiss = function(userId, reason = '') {
  this.status = 'dismissed';
  this.dismissed_by = userId;
  this.dismissed_at = new Date();
  this.dismissal_reason = reason;
  return this.save();
};

Alert.prototype.escalate = function() {
  this.is_escalated = true;
  this.escalation_level += 1;
  this.escalation_date = new Date();
  return this.save();
};

// Class methods
Alert.findActiveAlerts = function() {
  return this.findAll({
    where: {
      status: 'active'
    },
    include: [
      {
        model: require('./Institution'),
        as: 'Institution'
      },
      {
        model: require('./Faculty'),
        as: 'Faculty'
      }
    ],
    order: [
      ['severity', 'DESC'],
      ['due_date', 'ASC']
    ]
  });
};

Alert.findOverdueAlerts = function() {
  const today = new Date();
  
  return this.findAll({
    where: {
      status: 'active',
      due_date: {
        [sequelize.Op.lt]: today
      }
    },
    include: [
      {
        model: require('./Institution'),
        as: 'Institution'
      }
    ],
    order: [['due_date', 'ASC']]
  });
};

Alert.findDueSoonAlerts = function(days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  const today = new Date();
  
  return this.findAll({
    where: {
      status: 'active',
      due_date: {
        [sequelize.Op.gte]: today,
        [sequelize.Op.lte]: futureDate
      }
    },
    include: [
      {
        model: require('./Institution'),
        as: 'Institution'
      }
    ],
    order: [['due_date', 'ASC']]
  });
};

Alert.getAlertStats = async function() {
  const stats = await this.findAll({
    attributes: [
      'status',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: ['status']
  });
  
  const severityStats = await this.findAll({
    attributes: [
      'severity',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    where: { status: 'active' },
    group: ['severity']
  });
  
  return {
    status: stats.reduce((acc, stat) => {
      acc[stat.status] = parseInt(stat.get('count'));
      return acc;
    }, {}),
    severity: severityStats.reduce((acc, stat) => {
      acc[stat.severity] = parseInt(stat.get('count'));
      return acc;
    }, {})
  };
};

Alert.createFromEvent = async function(eventData) {
  // This method can be used to create alerts from various system events
  const {
    institutionId,
    alertType,
    severity,
    title,
    message,
    council = 'regulatory',
    category = 'compliance',
    relatedEntity = null
  } = eventData;
  
  return this.create({
    institution_id: institutionId,
    alert_type: alertType,
    severity,
    title,
    message,
    council,
    category,
    related_entity_type: relatedEntity?.type,
    related_entity_id: relatedEntity?.id,
    source: 'system'
  });
};

module.exports = Alert;