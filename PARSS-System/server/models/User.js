const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  institution_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'institutions',
      key: 'id'
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [3, 50],
      isAlphanumeric: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [6, 255]
    }
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  role: {
    type: DataTypes.ENUM(
      'system_admin',
      'super_admin',
      'admin',
      'compliance_officer',
      'principal',
      'vice_principal',
      'department_head',
      'faculty',
      'auditor',
      'viewer',
      'support_staff'
    ),
    allowNull: false,
    defaultValue: 'viewer'
  },
  department: {
    type: DataTypes.STRING,
    allowNull: true
  },
  position: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  profile_image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  email_verified_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  phone_verified_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  last_login_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  login_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  failed_login_attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  locked_until: {
    type: DataTypes.DATE,
    allowNull: true
  },
  password_changed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  reset_password_token: {
    type: DataTypes.STRING,
    allowNull: true
  },
  reset_password_expires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  email_verification_token: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email_verification_expires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  two_factor_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  two_factor_secret: {
    type: DataTypes.STRING,
    allowNull: true
  },
  two_factor_backup_codes: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  permissions: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  preferences: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      theme: 'light',
      language: 'en',
      timezone: 'Asia/Kolkata',
      notifications: {
        email: true,
        sms: false,
        push: true,
        in_app: true
      },
      dashboard: {
        default_view: 'overview',
        widgets: []
      }
    }
  },
  activity_log: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  ip_addresses: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  device_info: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  session_tokens: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  compliance_scope: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      councils: ['regulatory', 'standards', 'accreditation'],
      departments: [],
      can_view_all_institutions: false,
      can_manage_faculty: false,
      can_manage_approvals: false,
      can_generate_reports: false,
      can_manage_alerts: false
    }
  },
  audit_trail: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  }
}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
        user.password_changed_at = new Date();
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
        user.password_changed_at = new Date();
      }
    }
  },
  indexes: [
    {
      fields: ['email']
    },
    {
      fields: ['username']
    },
    {
      fields: ['institution_id']
    },
    {
      fields: ['role']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['reset_password_token']
    },
    {
      fields: ['email_verification_token']
    }
  ]
});

// Instance methods
User.prototype.getFullName = function() {
  return `${this.first_name} ${this.last_name}`;
};

User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

User.prototype.generateAuthToken = function() {
  return jwt.sign(
    {
      userId: this.id,
      email: this.email,
      role: this.role,
      institutionId: this.institution_id
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      issuer: 'viksit-bharat-compliance',
      audience: 'viksit-bharat-users'
    }
  );
};

User.prototype.generateRefreshToken = function() {
  return jwt.sign(
    {
      userId: this.id,
      type: 'refresh'
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
      issuer: 'viksit-bharat-compliance',
      audience: 'viksit-bharat-users'
    }
  );
};

User.prototype.hasPermission = function(permission) {
  // Super admin and system admin have all permissions
  if (['system_admin', 'super_admin'].includes(this.role)) {
    return true;
  }
  
  // Check explicit permissions
  if (this.permissions && this.permissions[permission]) {
    return true;
  }
  
  // Role-based default permissions
  const rolePermissions = {
    admin: ['*'],
    compliance_officer: [
      'view_dashboard',
      'manage_approvals',
      'manage_alerts',
      'generate_reports',
      'manage_documents',
      'view_faculty'
    ],
    principal: [
      'view_dashboard',
      'view_reports',
      'manage_faculty',
      'view_approvals',
      'view_alerts'
    ],
    auditor: [
      'view_dashboard',
      'generate_reports',
      'view_all_data',
      'audit_compliance'
    ],
    faculty: [
      'view_own_data',
      'update_profile',
      'upload_documents'
    ],
    viewer: [
      'view_dashboard',
      'view_basic_reports'
    ]
  };
  
  return rolePermissions[this.role]?.includes(permission) || 
         rolePermissions[this.role]?.includes('*');
};

User.prototype.canAccessInstitution = function(institutionId) {
  // System admin can access all institutions
  if (this.role === 'system_admin') {
    return true;
  }
  
  // User's own institution
  if (this.institution_id === institutionId) {
    return true;
  }
  
  // Check if user has cross-institution access
  if (this.compliance_scope?.can_view_all_institutions) {
    return true;
  }
  
  return false;
};

User.prototype.updateLastLogin = function(ipAddress = null, deviceInfo = null) {
  this.last_login_at = new Date();
  this.login_count += 1;
  this.failed_login_attempts = 0;
  
  // Update IP addresses
  if (ipAddress && !this.ip_addresses.includes(ipAddress)) {
    this.ip_addresses.push(ipAddress);
  }
  
  // Update device info
  if (deviceInfo) {
    this.device_info.push({
      ...deviceInfo,
      last_login: new Date()
    });
  }
  
  return this.save();
};

User.prototype.incrementFailedLogin = function() {
  this.failed_login_attempts += 1;
  
  // Lock account after 5 failed attempts
  if (this.failed_login_attempts >= 5) {
    this.locked_until = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  }
  
  return this.save();
};

User.prototype.unlock = function() {
  this.locked_until = null;
  this.failed_login_attempts = 0;
  return this.save();
};

User.prototype.addActivityLog = function(action, details = {}) {
  const logEntry = {
    action,
    timestamp: new Date(),
    details,
    ip_address: details.ipAddress,
    user_agent: details.userAgent
  };
  
  this.activity_log.push(logEntry);
  
  // Keep only last 100 entries
  if (this.activity_log.length > 100) {
    this.activity_log = this.activity_log.slice(-100);
  }
  
  return this.save();
};

// Class methods
User.findByEmail = function(email) {
  return this.findOne({
    where: { email },
    include: [
      {
        model: require('./Institution'),
        as: 'Institution'
      }
    ]
  });
};

User.findByUsername = function(username) {
  return this.findOne({
    where: { username },
    include: [
      {
        model: require('./Institution'),
        as: 'Institution'
      }
    ]
  });
};

User.findActiveUsers = function() {
  return this.findAll({
    where: { is_active: true },
    include: [
      {
        model: require('./Institution'),
        as: 'Institution'
      }
    ]
  });
};

User.findByRole = function(role) {
  return this.findAll({
    where: { role, is_active: true },
    include: [
      {
        model: require('./Institution'),
        as: 'Institution'
      }
    ]
  });
};

User.getUserStats = async function() {
  const stats = await this.findAll({
    attributes: [
      'role',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    where: { is_active: true },
    group: ['role']
  });
  
  return stats.reduce((acc, stat) => {
    acc[stat.role] = parseInt(stat.get('count'));
    return acc;
  }, {});
};

User.verifyToken = function(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = User;