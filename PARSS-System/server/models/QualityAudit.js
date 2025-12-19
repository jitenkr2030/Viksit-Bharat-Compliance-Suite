const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QualityAudit = sequelize.define('QualityAudit', {
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
    allowNull: true
  },
  audit_type: {
    type: DataTypes.ENUM('internal', 'external', 'regulatory', 'standards', 'accreditation'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('planned', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'planned'
  },
  planned_start_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  planned_end_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  actual_start_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  actual_end_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  overall_score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    }
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  updated_by: {
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
  tableName: 'quality_audits',
  timestamps: true,
  underscored: true
});

module.exports = QualityAudit;