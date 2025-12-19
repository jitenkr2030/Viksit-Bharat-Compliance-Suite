const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ComplianceVerification = sequelize.define('ComplianceVerification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  // Related Entities
  institutionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Institutions',
      key: 'id'
    }
  },
  
  portalId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'GovernmentPortals',
      key: 'id'
    }
  },
  
  // Verification Details
  verificationType: {
    type: DataTypes.ENUM('initial', 'renewal', 'update', 'audit', 'spot_check'),
    allowNull: false,
    comment: 'Type of compliance verification'
  },
  
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Compliance category being verified'
  },
  
  // Verification Request
  requestData: {
    type: DataTypes.JSON,
    comment: 'Data sent to government portal for verification'
  },
  
  requestTimestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'When the verification request was made'
  },
  
  // Verification Response
  responseData: {
    type: DataTypes.JSON,
    comment: 'Response data received from government portal'
  },
  
  responseTimestamp: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When the response was received'
  },
  
  // Verification Status
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'verified', 'rejected', 'error', 'expired'),
    allowNull: false,
    defaultValue: 'pending',
    comment: 'Current status of verification'
  },
  
  verificationScore: {
    type: DataTypes.DECIMAL(5, 2),
    comment: 'Compliance score from government portal (0-100)'
  },
  
  // Compliance Assessment
  isCompliant: {
    type: DataTypes.BOOLEAN,
    comment: 'Whether the institution is compliant'
  },
  
  complianceLevel: {
    type: DataTypes.ENUM('fully_compliant', 'partially_compliant', 'non_compliant', 'under_review'),
    comment: 'Level of compliance achieved'
  },
  
  compliancePercentage: {
    type: DataTypes.DECIMAL(5, 2),
    comment: 'Percentage of compliance requirements met'
  },
  
  // Issues and Findings
  complianceIssues: {
    type: DataTypes.JSON,
    comment: 'JSON array of compliance issues identified'
  },
  
  recommendations: {
    type: DataTypes.JSON,
    comment: 'JSON array of recommendations from government portal'
  },
  
  actionRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether immediate action is required'
  },
  
  // Timeline Information
  validFrom: {
    type: DataTypes.DATE,
    comment: 'When the compliance verification becomes valid'
  },
  
  validUntil: {
    type: DataTypes.DATE,
    comment: 'When the compliance verification expires'
  },
  
  nextReviewDate: {
    type: DataTypes.DATE,
    comment: 'When the next compliance review is due'
  },
  
  // Document References
  supportingDocuments: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    comment: 'Array of document IDs used for verification'
  },
  
  verificationCertificate: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'URL or path to verification certificate'
  },
  
  // Portal Integration
  externalReferenceId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Reference ID from government portal'
  },
  
  portalTransactionId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Transaction ID from government portal'
  },
  
  // Processing Information
  processingTime: {
    type: DataTypes.INTEGER, // in seconds
    comment: 'Time taken to complete verification'
  },
  
  retryCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of retry attempts made'
  },
  
  maxRetries: {
    type: DataTypes.INTEGER,
    defaultValue: 3,
    comment: 'Maximum number of retries allowed'
  },
  
  // Error Handling
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Error message if verification failed'
  },
  
  errorCode: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Error code from government portal'
  },
  
  // Audit Trail
  verifiedBy: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'User or system that initiated verification'
  },
  
  verificationMethod: {
    type: DataTypes.ENUM('automatic', 'manual', 'hybrid'),
    defaultValue: 'automatic',
    comment: 'How the verification was performed'
  },
  
  // Metadata
  metadata: {
    type: DataTypes.JSON,
    comment: 'Additional metadata as JSON'
  },
  
  // Version Control
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: 'Version number of this verification record'
  },
  
  // Soft Delete
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether this verification record is active'
  }
}, {
  tableName: 'compliance_verifications',
  timestamps: true,
  indexes: [
    {
      fields: ['institutionId']
    },
    {
      fields: ['portalId']
    },
    {
      fields: ['status']
    },
    {
      fields: ['verificationType']
    },
    {
      fields: ['category']
    },
    {
      fields: ['isCompliant']
    },
    {
      fields: ['validUntil']
    },
    {
      fields: ['nextReviewDate']
    },
    {
      name: 'verification_status_date_idx',
      fields: ['status', 'createdAt']
    },
    {
      name: 'verification_compliance_idx',
      fields: ['isCompliant', 'validUntil']
    }
  ]
});

// Instance methods
ComplianceVerification.prototype.isExpired = function() {
  if (!this.validUntil) return false;
  return new Date() > new Date(this.validUntil);
};

ComplianceVerification.prototype.isExpiringSoon = function(days = 30) {
  if (!this.validUntil) return false;
  
  const expiryDate = new Date(this.validUntil);
  const warningDate = new Date();
  warningDate.setDate(warningDate.getDate() + days);
  
  return expiryDate <= warningDate && expiryDate > new Date();
};

ComplianceVerification.prototype.needsReview = function() {
  if (!this.nextReviewDate) return false;
  return new Date() >= new Date(this.nextReviewDate);
};

ComplianceVerification.prototype.canRetry = function() {
  return this.retryCount < this.maxRetries && 
         ['error', 'rejected'].includes(this.status);
};

ComplianceVerification.prototype.getComplianceStatus = function() {
  if (this.isExpired()) return 'expired';
  if (this.needsReview()) return 'needs_review';
  if (this.actionRequired) return 'action_required';
  if (this.isCompliant === false) return 'non_compliant';
  if (this.isCompliant === true) return 'compliant';
  return 'pending';
};

// Class methods
ComplianceVerification.getActiveVerifications = function(institutionId) {
  return this.findAll({
    where: {
      institutionId,
      isActive: true,
      [sequelize.Sequelize.Op.or]: [
        { validUntil: null },
        { validUntil: { [sequelize.Sequelize.Op.gte]: new Date() } }
      ]
    },
    include: [
      {
        model: require('./GovernmentPortal'),
        as: 'portal'
      }
    ]
  });
};

ComplianceVerification.getExpiringVerifications = function(institutionId, days = 30) {
  const warningDate = new Date();
  warningDate.setDate(warningDate.getDate() + days);
  
  return this.findAll({
    where: {
      institutionId,
      isActive: true,
      validUntil: {
        [sequelize.Sequelize.Op.between]: [new Date(), warningDate]
      },
      isCompliant: true
    },
    include: [
      {
        model: require('./GovernmentPortal'),
        as: 'portal'
      }
    ],
    order: [['validUntil', 'ASC']]
  });
};

ComplianceVerification.getNonCompliantItems = function(institutionId) {
  return this.findAll({
    where: {
      institutionId,
      isActive: true,
      isCompliant: false,
      status: ['verified', 'rejected']
    },
    include: [
      {
        model: require('./GovernmentPortal'),
        as: 'portal'
      }
    ],
    order: [['updatedAt', 'DESC']]
  });
};

ComplianceVerification.getVerificationSummary = function(institutionId) {
  return this.findAll({
    where: {
      institutionId,
      isActive: true
    },
    attributes: [
      [sequelize.Sequelize.fn('COUNT', sequelize.Sequelize.col('id')), 'total'],
      [sequelize.Sequelize.fn('SUM', sequelize.Sequelize.literal('CASE WHEN is_compliant THEN 1 ELSE 0 END')), 'compliant'],
      [sequelize.Sequelize.fn('AVG', sequelize.Sequelize.col('verificationScore')), 'averageScore'],
      [sequelize.Sequelize.fn('COUNT', sequelize.Sequelize.literal('CASE WHEN action_required THEN 1 ELSE 0 END')), 'actionRequired']
    ],
    raw: true
  });
};

module.exports = ComplianceVerification;