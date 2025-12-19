const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Institution = sequelize.define('Institution', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 255]
    }
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [2, 50]
    }
  },
  type: {
    type: DataTypes.ENUM('school', 'college', 'university', 'institute'),
    allowNull: false
  },
  level: {
    type: DataTypes.ENUM('primary', 'secondary', 'higher_secondary', 'undergraduate', 'postgraduate', 'research'),
    allowNull: false
  },
  board: {
    type: DataTypes.ENUM('CBSE', 'ICSE', 'State Board', 'IB', 'IGCSE', 'Other'),
    allowNull: true
  },
  address: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {}
  },
  contact: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {}
  },
  principal_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  principal_email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  principal_phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  affiliation: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  accreditation: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  facilities: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  student_count: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0
    }
  },
  faculty_count: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'pending', 'suspended'),
    defaultValue: 'active'
  },
  compliance_status: {
    type: DataTypes.ENUM('compliant', 'warning', 'critical', 'non_compliant'),
    defaultValue: 'compliant'
  },
  last_audit_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  next_audit_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  settings: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  }
}, {
  tableName: 'institutions',
  indexes: [
    {
      fields: ['code']
    },
    {
      fields: ['type']
    },
    {
      fields: ['status']
    },
    {
      fields: ['compliance_status']
    }
  ]
});

// Instance methods
Institution.prototype.getComplianceOverview = function() {
  return {
    institution_id: this.id,
    name: this.name,
    compliance_status: this.compliance_status,
    last_audit_date: this.last_audit_date,
    next_audit_date: this.next_audit_date,
    total_approvals: this.Faculties?.length || 0,
    faculty_compliance: this.Faculties?.filter(f => f.compliance_status === 'compliant').length || 0
  };
};

// Class methods
Institution.findByComplianceStatus = function(status) {
  return this.findAll({
    where: { compliance_status: status },
    include: [
      {
        model: require('./Faculty'),
        as: 'Faculties',
        include: ['Approvals', 'Documents']
      }
    ]
  });
};

Institution.getComplianceStats = async function() {
  const stats = await this.findAll({
    attributes: [
      'compliance_status',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: ['compliance_status']
  });
  
  return stats.reduce((acc, stat) => {
    acc[stat.compliance_status] = parseInt(stat.get('count'));
    return acc;
  }, {});
};

module.exports = Institution;