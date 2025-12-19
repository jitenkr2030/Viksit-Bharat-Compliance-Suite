const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Approval = sequelize.define('Approval', {
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
  approval_type: {
    type: DataTypes.ENUM(
      'establishment_license',
      'faculty_registration',
      'infrastructure_approval',
      'affiliation_certificate',
      'building_safety_certificate',
      'fire_safety_certificate',
      'pollution_control_certificate',
      'health_safety_certificate',
      'computer_lab_approval',
      'library_approval',
      'sports_facility_approval',
      'transport_approval',
      'hostel_approval',
      'canteen_approval',
      'security_approval'
    ),
    allowNull: false
  },
  approval_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  issuing_authority: {
    type: DataTypes.STRING,
    allowNull: false
  },
  council: {
    type: DataTypes.ENUM('regulatory', 'standards', 'accreditation'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'expired', 'revoked'),
    defaultValue: 'pending'
  },
  issue_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  valid_from: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  valid_until: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  renewal_required: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  renewal_period_months: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 120
    }
  },
  conditions: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  terms: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  issuing_officer: {
    type: DataTypes.STRING,
    allowNull: true
  },
  issuing_officer_designation: {
    type: DataTypes.STRING,
    allowNull: true
  },
  contact_details: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  fees_paid: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  payment_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  payment_reference: {
    type: DataTypes.STRING,
    allowNull: true
  },
  documents_required: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  documents_submitted: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  inspection_required: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  inspection_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  inspection_officer: {
    type: DataTypes.STRING,
    allowNull: true
  },
  inspection_report: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  inspection_status: {
    type: DataTypes.ENUM('pending', 'passed', 'failed', 'conditional'),
    allowNull: true
  },
  renewal_application_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  renewal_status: {
    type: DataTypes.ENUM('not_applied', 'applied', 'under_review', 'approved', 'rejected'),
    defaultValue: 'not_applied'
  },
  reminders_sent: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  auto_renewal_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  priority_level: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium'
  },
  risk_level: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium'
  },
  compliance_score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  }
}, {
  tableName: 'approvals',
  indexes: [
    {
      fields: ['institution_id']
    },
    {
      fields: ['faculty_id']
    },
    {
      fields: ['approval_type']
    },
    {
      fields: ['council']
    },
    {
      fields: ['status']
    },
    {
      fields: ['valid_until']
    },
    {
      fields: ['priority_level']
    },
    {
      fields: ['risk_level']
    },
    {
      fields: ['renewal_status']
    }
  ]
});

// Instance methods
Approval.prototype.getDaysUntilExpiry = function() {
  if (!this.valid_until) return null;
  
  const today = new Date();
  const expiryDate = new Date(this.valid_until);
  const timeDiff = expiryDate.getTime() - today.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  return daysDiff;
};

Approval.prototype.isExpiringSoon = function(days = 30) {
  const daysUntilExpiry = this.getDaysUntilExpiry();
  return daysUntilExpiry !== null && daysUntilExpiry <= days && daysUntilExpiry >= 0;
};

Approval.prototype.isExpired = function() {
  const daysUntilExpiry = this.getDaysUntilExpiry();
  return daysUntilExpiry !== null && daysUntilExpiry < 0;
};

Approval.prototype.getStatus = function() {
  if (this.isExpired()) return 'expired';
  if (this.isExpiringSoon(30)) return 'expiring_soon';
  return this.status;
};

Approval.prototype.calculateRiskLevel = function() {
  const daysUntilExpiry = this.getDaysUntilExpiry();
  
  if (this.isExpired()) return 'critical';
  if (daysUntilExpiry <= 7) return 'critical';
  if (daysUntilExpiry <= 30) return 'high';
  if (daysUntilExpiry <= 60) return 'medium';
  return 'low';
};

Approval.prototype.getComplianceImpact = function() {
  const criticalApprovals = ['establishment_license', 'faculty_registration', 'building_safety_certificate'];
  
  if (criticalApprovals.includes(this.approval_type)) {
    return this.isExpired() ? 'violation' : this.isExpiringSoon(7) ? 'high_risk' : 'medium_risk';
  }
  
  return this.isExpired() ? 'high_risk' : 'low_risk';
};

// Class methods
Approval.findExpiringSoon = function(days = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.findAll({
    where: {
      valid_until: {
        [sequelize.Op.lte]: futureDate,
        [sequelize.Op.gte]: new Date()
      },
      status: ['approved', 'pending']
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
    order: [['valid_until', 'ASC']]
  });
};

Approval.findExpired = function() {
  const today = new Date();
  
  return this.findAll({
    where: {
      valid_until: {
        [sequelize.Op.lt]: today
      },
      status: ['approved', 'pending']
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
    order: [['valid_until', 'ASC']]
  });
};

Approval.getCouncilStats = async function() {
  const stats = await this.findAll({
    attributes: [
      'council',
      [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
      [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'approved' THEN 1 ELSE 0 END")), 'approved'],
      [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'expired' THEN 1 ELSE 0 END")), 'expired']
    ],
    group: ['council']
  });
  
  return stats.map(stat => ({
    council: stat.council,
    total: parseInt(stat.get('total')),
    approved: parseInt(stat.get('approved') || 0),
    expired: parseInt(stat.get('expired') || 0),
    pending: parseInt(stat.get('total')) - parseInt(stat.get('approved') || 0)
  }));
};

module.exports = Approval;