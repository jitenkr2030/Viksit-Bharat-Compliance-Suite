const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SelfAuditReport = sequelize.define('SelfAuditReport', {
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
  auditPeriod: {
    type: DataTypes.ENUM('monthly', 'quarterly', 'semi-annual', 'annual'),
    allowNull: false,
    defaultValue: 'monthly'
  },
  reportTitle: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  reportDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('draft', 'in_progress', 'completed', 'submitted', 'reviewed', 'approved', 'rejected'),
    allowNull: false,
    defaultValue: 'draft'
  },
  overallScore: {
    type: DataTypes.DECIMAL(5, 2),
    validate: {
      min: 0,
      max: 100
    }
  },
  totalComplianceItems: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  compliantItems: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  nonCompliantItems: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  partiallyCompliantItems: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  notApplicableItems: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  criticalIssues: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  majorIssues: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  minorIssues: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  recommendations: {
    type: DataTypes.TEXT
  },
  actionPlan: {
    type: DataTypes.TEXT
  },
  riskAssessment: {
    type: DataTypes.JSONB
  },
  findings: {
    type: DataTypes.JSONB
  },
  attachments: {
    type: DataTypes.JSONB
  },
  reviewerId: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  reviewComments: {
    type: DataTypes.TEXT
  },
  reviewDate: {
    type: DataTypes.DATE
  },
  submissionDate: {
    type: DataTypes.DATE
  },
  approvalDate: {
    type: DataTypes.DATE
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
  tableName: 'self_audit_reports',
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
      fields: ['status']
    },
    {
      fields: ['auditPeriod']
    },
    {
      fields: ['reportDate']
    }
  ]
});

module.exports = SelfAuditReport;