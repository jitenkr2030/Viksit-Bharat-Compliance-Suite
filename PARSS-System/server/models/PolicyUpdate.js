const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PolicyUpdate = sequelize.define('PolicyUpdate', {
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
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  policy_type: {
    type: DataTypes.ENUM('regulation', 'standard', 'guideline', 'procedure', 'policy', 'law'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('draft', 'pending_review', 'approved', 'rejected'),
    defaultValue: 'draft'
  },
  effective_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  source_authority: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium'
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  reviewed_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'policy_updates',
  timestamps: true,
  underscored: true
});

module.exports = PolicyUpdate;