const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RiskAssessment = sequelize.define('RiskAssessment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  // Associated Compliance Deadline
  deadlineId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'ComplianceDeadlines',
      key: 'id'
    },
    comment: 'Reference to the compliance deadline being assessed'
  },
  
  institutionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Institutions',
      key: 'id'
    },
    comment: 'Institution for which this assessment is performed'
  },
  
  // Core Risk Metrics
  violationProbability: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    comment: 'Probability of compliance violation (0-100%)'
  },
  
  riskScore: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    comment: 'Overall risk score (0-100, higher = more risk)'
  },
  
  riskLevel: {
    type: DataTypes.ENUM('very_low', 'low', 'medium', 'high', 'critical', 'extreme'),
    allowNull: false,
    comment: 'Categorical risk level'
  },
  
  // Assessment Details
  assessmentType: {
    type: DataTypes.ENUM('automated', 'manual', 'scheduled', 'triggered'),
    allowNull: false,
    defaultValue: 'automated',
    comment: 'How this assessment was triggered'
  },
  
  assessmentDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'When this assessment was performed'
  },
  
  // Risk Factors Analysis
  timePressureScore: {
    type: DataTypes.DECIMAL(5, 2),
    comment: 'Risk factor based on time remaining (0-100)'
  },
  
  complexityScore: {
    type: DataTypes.DECIMAL(5, 2),
    comment: 'Risk factor based on compliance complexity (0-100)'
  },
  
  resourceAdequacyScore: {
    type: DataTypes.DECIMAL(5, 2),
    comment: 'Risk factor based on available resources (0-100, inverted)'
  },
  
  historicalComplianceScore: {
    type: DataTypes.DECIMAL(5, 2),
    comment: 'Risk factor based on past compliance history (0-100, inverted)'
  },
  
  documentReadinessScore: {
    type: DataTypes.DECIMAL(5, 2),
    comment: 'Risk factor based on document preparation status (0-100, inverted)'
  },
  
  // AI Model Information
  aiModelVersion: {
    type: DataTypes.STRING,
    comment: 'Version of AI model used for assessment'
  },
  
  confidenceLevel: {
    type: DataTypes.DECIMAL(5, 2),
    comment: 'AI model confidence in this assessment (0-100%)'
  },
  
  // Risk Triggers and Warnings
  riskTriggers: {
    type: DataTypes.JSON,
    comment: 'JSON object containing specific risk triggers identified'
  },
  
  riskWarnings: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: [],
    comment: 'Array of risk warnings and alerts'
  },
  
  // Recommendations
  recommendations: {
    type: DataTypes.ARRAY(DataTypes.JSON),
    defaultValue: [],
    comment: 'Array of AI-generated recommendations to reduce risk'
  },
  
  priorityActions: {
    type: DataTypes.ARRAY(DataTypes.JSON),
    defaultValue: [],
    comment: 'Array of high-priority actions to take immediately'
  },
  
  // Predictive Analytics
  predictedCompletionDate: {
    type: DataTypes.DATE,
    comment: 'AI-predicted likely completion date'
  },
  
  completionProbability: {
    type: DataTypes.DECIMAL(5, 2),
    comment: 'Probability of on-time completion (0-100%)'
  },
  
  // Factors and Weights
  assessmentFactors: {
    type: DataTypes.JSON,
    comment: 'Detailed breakdown of all factors considered in assessment'
  },
  
  factorWeights: {
    type: DataTypes.JSON,
    comment: 'Weights assigned to different risk factors'
  },
  
  // Scenario Analysis
  bestCaseScenario: {
    type: DataTypes.JSON,
    comment: 'Best-case scenario analysis results'
  },
  
  worstCaseScenario: {
    type: DataTypes.JSON,
    comment: 'Worst-case scenario analysis results'
  },
  
  likelyCaseScenario: {
    type: DataTypes.JSON,
    comment: 'Most likely scenario analysis results'
  },
  
  // Benchmarking
  riskPercentile: {
    type: DataTypes.DECIMAL(5, 2),
    comment: 'Risk percentile compared to similar institutions (0-100)'
  },
  
  industryBenchmark: {
    type: DataTypes.JSON,
    comment: 'Industry benchmark comparison data'
  },
  
  // Action Items
  actionItems: {
    type: DataTypes.ARRAY(DataTypes.JSON),
    defaultValue: [],
    comment: 'Specific action items with deadlines and priorities'
  },
  
  escalationRecommended: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether escalation to higher management is recommended'
  },
  
  // Monitoring and Updates
  nextAssessmentDate: {
    type: DataTypes.DATE,
    comment: 'When the next assessment should be performed'
  },
  
  assessmentFrequency: {
    type: DataTypes.ENUM('daily', 'weekly', 'bi_weekly', 'monthly', 'quarterly'),
    defaultValue: 'weekly',
    comment: 'How often this assessment should be updated'
  },
  
  // Validation and Quality
  modelAccuracy: {
    type: DataTypes.DECIMAL(5, 2),
    comment: 'Historical accuracy of this type of assessment'
  },
  
  dataQualityScore: {
    type: DataTypes.DECIMAL(5, 2),
    comment: 'Quality score of input data used (0-100)'
  },
  
  // Comments and Notes
  assessmentNotes: {
    type: DataTypes.TEXT,
    comment: 'Additional notes about the assessment'
  },
  
  // Status and Lifecycle
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether this assessment is currently valid'
  },
  
  supersededBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'RiskAssessments',
      key: 'id'
    },
    comment: 'If this assessment was superseded by a newer one'
  },
  
  // Validation Results
  validationPassed: {
    type: DataTypes.BOOLEAN,
    comment: 'Whether assessment passed validation checks'
  },
  
  validationErrors: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'Array of validation errors if any'
  }
}, {
  tableName: 'risk_assessments',
  timestamps: true,
  indexes: [
    {
      fields: ['deadlineId']
    },
    {
      fields: ['institutionId']
    },
    {
      fields: ['riskScore']
    },
    {
      fields: ['riskLevel']
    },
    {
      fields: ['assessmentDate']
    },
    {
      fields: ['violationProbability']
    },
    {
      name: 'risk_assessment_composite_idx',
      fields: ['institutionId', 'riskLevel', 'isActive']
    },
    {
      name: 'risk_assessment_date_idx',
      fields: ['assessmentDate', 'isActive']
    }
  ]
});

// Instance methods
RiskAssessment.prototype.getRiskColor = function() {
  const colorMap = {
    'very_low': '#28a745',
    'low': '#17a2b8', 
    'medium': '#ffc107',
    'high': '#fd7e14',
    'critical': '#dc3545',
    'extreme': '#6f42c1'
  };
  return colorMap[this.riskLevel] || '#6c757d';
};

RiskAssessment.prototype.getTimeToNextAssessment = function() {
  if (!this.nextAssessmentDate) return null;
  
  const now = new Date();
  const next = new Date(this.nextAssessmentDate);
  const diffTime = next - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

RiskAssessment.prototype.needsUpdate = function() {
  const daysToNext = this.getTimeToNextAssessment();
  return daysToNext !== null && daysToNext <= 0;
};

// Class methods
RiskAssessment.getHighRiskAssessments = function(institutionId, minRiskScore = 70) {
  return this.findAll({
    where: {
      institutionId,
      riskScore: {
        [sequelize.Sequelize.Op.gte]: minRiskScore
      },
      isActive: true
    },
    order: [['riskScore', 'DESC']]
  });
};

RiskAssessment.getRecentAssessments = function(institutionId, days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.findAll({
    where: {
      institutionId,
      assessmentDate: {
        [sequelize.Sequelize.Op.gte]: startDate
      },
      isActive: true
    },
    order: [['assessmentDate', 'DESC']]
  });
};

RiskAssessment.getAssessmentsNeedingUpdate = function() {
  const now = new Date();
  
  return this.findAll({
    where: {
      nextAssessmentDate: {
        [sequelize.Sequelize.Op.lte]: now
      },
      isActive: true
    },
    order: [['nextAssessmentDate', 'ASC']]
  });
};

module.exports = RiskAssessment;