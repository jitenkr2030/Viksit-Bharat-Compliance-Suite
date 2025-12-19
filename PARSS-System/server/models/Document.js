const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Document = sequelize.define('Document', {
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
  document_type: {
    type: DataTypes.ENUM(
      'certificate',
      'license',
      'affiliation',
      'registration',
      'identity_proof',
      'educational_certificate',
      'experience_certificate',
      'training_certificate',
      'medical_certificate',
      'background_check',
      'photo',
      'signature',
      'academic_transcript',
      'degree_certificate',
      'professional_certificate',
      'compliance_report',
      'audit_report',
      'inspection_report',
      'policy_document',
      'annual_report',
      'financial_document',
      'infrastructure_document',
      'safety_certificate',
      'other'
    ),
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM(
      'regulatory',
      'academic',
      'administrative',
      'financial',
      'infrastructure',
      'safety',
      'compliance',
      'personal',
      'operational'
    ),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 255]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  file_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  original_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  file_path: {
    type: DataTypes.STRING,
    allowNull: false
  },
  file_size: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  mime_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  file_hash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  parent_document_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'documents',
      key: 'id'
    }
  },
  is_current_version: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  status: {
    type: DataTypes.ENUM('draft', 'active', 'archived', 'deleted', 'under_review'),
    defaultValue: 'draft'
  },
  confidentiality_level: {
    type: DataTypes.ENUM('public', 'internal', 'confidential', 'restricted', 'secret'),
    defaultValue: 'internal'
  },
  access_permissions: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      roles: ['admin', 'compliance_officer'],
      users: [],
      departments: []
    }
  },
  issued_by: {
    type: DataTypes.STRING,
    allowNull: true
  },
  issued_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  valid_from: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  valid_until: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  expiry_reminder_sent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
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
  ocr_text: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  extracted_data: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  verification_status: {
    type: DataTypes.ENUM('pending', 'verified', 'rejected', 'expired'),
    defaultValue: 'pending'
  },
  verified_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  verified_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  verification_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  download_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  last_accessed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  checksum_valid: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  encryption_status: {
    type: DataTypes.ENUM('none', 'encrypted', 'decrypted'),
    defaultValue: 'encrypted'
  },
  backup_locations: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  is_template: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  template_variables: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  auto_expire: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  auto_archive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'documents',
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
      fields: ['document_type']
    },
    {
      fields: ['category']
    },
    {
      fields: ['status']
    },
    {
      fields: ['confidentiality_level']
    },
    {
      fields: ['valid_until']
    },
    {
      fields: ['is_current_version']
    },
    {
      fields: ['verification_status']
    },
    {
      fields: ['file_hash']
    }
  ]
});

// Instance methods
Document.prototype.isExpired = function() {
  if (!this.valid_until) return false;
  return new Date() > new Date(this.valid_until);
};

Document.prototype.isExpiringSoon = function(days = 30) {
  if (!this.valid_until) return false;
  
  const today = new Date();
  const expiryDate = new Date(this.valid_until);
  const timeDiff = expiryDate.getTime() - today.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  return daysDiff <= days && daysDiff >= 0;
};

Document.prototype.canAccess = function(user) {
  if (!user) return false;
  
  // System admin can access everything
  if (user.role === 'system_admin') return true;
  
  // Check role permissions
  const allowedRoles = this.access_permissions?.roles || [];
  if (allowedRoles.includes(user.role)) return true;
  
  // Check user-specific permissions
  const allowedUsers = this.access_permissions?.users || [];
  if (allowedUsers.includes(user.id)) return true;
  
  // Check department permissions
  const allowedDepartments = this.access_permissions?.departments || [];
  if (allowedDepartments.includes(user.department) && user.role === 'admin') return true;
  
  return false;
};

Document.prototype.getAccessUrl = function() {
  return `/api/documents/${this.id}/download`;
};

Document.prototype.incrementDownloadCount = function() {
  this.download_count += 1;
  this.last_accessed_at = new Date();
  return this.save();
};

// Class methods
Document.findExpired = function() {
  const today = new Date();
  
  return this.findAll({
    where: {
      valid_until: {
        [sequelize.Op.lt]: today
      },
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
    ]
  });
};

Document.findExpiringSoon = function(days = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.findAll({
    where: {
      valid_until: {
        [sequelize.Op.lte]: futureDate,
        [sequelize.Op.gte]: new Date()
      },
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
    ]
  });
};

Document.searchByText = function(query, institutionId = null) {
  const whereClause = {
    [sequelize.Op.or]: [
      { title: { [sequelize.Op.iLike]: `%${query}%` } },
      { description: { [sequelize.Op.iLike]: `%${query}%` } },
      { ocr_text: { [sequelize.Op.iLike]: `%${query}%` } },
      { tags: { [sequelize.Op.contains]: [query] } }
    ]
  };
  
  if (institutionId) {
    whereClause.institution_id = institutionId;
  }
  
  return this.findAll({
    where: whereClause,
    include: [
      {
        model: require('./Institution'),
        as: 'Institution'
      }
    ]
  });
};

Document.getStorageStats = async function() {
  const stats = await this.findAll({
    attributes: [
      [sequelize.fn('SUM', sequelize.col('file_size')), 'total_size'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'total_count']
    ],
    where: { status: { [sequelize.Op.not]: 'deleted' } }
  });
  
  return {
    total_size: parseInt(stats[0]?.get('total_size') || 0),
    total_count: parseInt(stats[0]?.get('total_count') || 0)
  };
};

module.exports = Document;