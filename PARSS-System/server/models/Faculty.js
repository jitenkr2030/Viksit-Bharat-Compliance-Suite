const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Faculty = sequelize.define('Faculty', {
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
  employee_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
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
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false
  },
  designation: {
    type: DataTypes.ENUM('professor', 'associate_professor', 'assistant_professor', 'lecturer', 'teacher', 'principal', 'vice_principal', 'coordinator'),
    allowNull: false
  },
  qualification: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: []
  },
  experience_years: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  date_of_joining: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: false
  },
  address: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  emergency_contact: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  bank_details: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  training_records: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  certifications: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  compliance_status: {
    type: DataTypes.ENUM('compliant', 'warning', 'critical', 'non_compliant', 'pending'),
    defaultValue: 'pending'
  },
  background_check_status: {
    type: DataTypes.ENUM('pending', 'clear', 'flagged', 'expired'),
    defaultValue: 'pending'
  },
  medical_checkup_status: {
    type: DataTypes.ENUM('pending', 'clear', 'flagged', 'expired'),
    defaultValue: 'pending'
  },
  performance_rating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 5
    }
  },
  last_performance_review: {
    type: DataTypes.DATE,
    allowNull: true
  },
  next_performance_review: {
    type: DataTypes.DATE,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  profile_image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  documents: {
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
  tableName: 'faculties',
  indexes: [
    {
      fields: ['institution_id']
    },
    {
      fields: ['email']
    },
    {
      fields: ['employee_id']
    },
    {
      fields: ['department']
    },
    {
      fields: ['compliance_status']
    },
    {
      fields: ['is_active']
    }
  ]
});

// Instance methods
Faculty.prototype.getFullName = function() {
  return `${this.first_name} ${this.last_name}`;
};

Faculty.prototype.getComplianceOverview = function() {
  return {
    faculty_id: this.id,
    name: this.getFullName(),
    employee_id: this.employee_id,
    department: this.department,
    subject: this.subject,
    compliance_status: this.compliance_status,
    background_check: this.background_check_status,
    medical_checkup: this.medical_checkup_status,
    qualifications: this.qualification,
    certifications: this.certifications,
    training_records: this.training_records
  };
};

Faculty.prototype.calculateComplianceScore = function() {
  let score = 0;
  let maxScore = 0;
  
  // Background check (20 points)
  maxScore += 20;
  if (this.background_check_status === 'clear') score += 20;
  else if (this.background_check_status === 'pending') score += 10;
  
  // Medical checkup (20 points)
  maxScore += 20;
  if (this.medical_checkup_status === 'clear') score += 20;
  else if (this.medical_checkup_status === 'pending') score += 10;
  
  // Qualifications (30 points)
  maxScore += 30;
  if (this.qualification && this.qualification.length > 0) score += 30;
  
  // Training records (30 points)
  maxScore += 30;
  if (this.training_records && this.training_records.length > 0) score += 30;
  
  return Math.round((score / maxScore) * 100);
};

// Class methods
Faculty.findByComplianceStatus = function(status) {
  return this.findAll({
    where: { compliance_status: status },
    include: [
      {
        model: require('./Institution'),
        as: 'Institution'
      },
      {
        model: require('./Approval'),
        as: 'Approvals'
      },
      {
        model: require('./Document'),
        as: 'Documents'
      }
    ]
  });
};

Faculty.getComplianceStats = async function() {
  const stats = await this.findAll({
    where: { is_active: true },
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

Faculty.getTrainingDue = async function() {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  
  return this.findAll({
    where: {
      is_active: true,
      training_records: {
        [sequelize.Op.or]: [
          { completed_date: null },
          { completed_date: { [sequelize.Op.lte]: thirtyDaysFromNow } }
        ]
      }
    },
    include: [
      {
        model: require('./Institution'),
        as: 'Institution'
      }
    ]
  });
};

module.exports = Faculty;