const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ExecutiveMetric = sequelize.define('ExecutiveMetric', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  // Institution Information
  institutionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Institutions',
      key: 'id'
    }
  },
  
  // Metric Details
  metricName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Name of the executive metric'
  },
  
  metricCategory: {
    type: DataTypes.ENUM(
      'compliance_overall',
      'compliance_by_council',
      'risk_assessment',
      'deadline_management',
      'document_processing',
      'faculty_compliance',
      'infrastructure_compliance',
      'financial_compliance',
      'quality_metrics',
      'benchmarking',
      'predictive_analytics'
    ),
    allowNull: false,
    comment: 'Category of the metric'
  },
  
  // Metric Value
  currentValue: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: false,
    comment: 'Current value of the metric'
  },
  
  previousValue: {
    type: DataTypes.DECIMAL(10, 4),
    comment: 'Previous period value for comparison'
  },
  
  targetValue: {
    type: DataTypes.DECIMAL(10, 4),
    comment: 'Target value for this metric'
  },
  
  // Performance Indicators
  performanceIndicator: {
    type: DataTypes.ENUM('above_target', 'on_target', 'below_target', 'critical'),
    comment: 'Performance indicator based on target'
  },
  
  trend: {
    type: DataTypes.ENUM('improving', 'stable', 'declining', 'volatile'),
    comment: 'Trend direction of the metric'
  },
  
  changePercentage: {
    type: DataTypes.DECIMAL(5, 2),
    comment: 'Percentage change from previous period'
  },
  
  // Time Period
  periodType: {
    type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly'),
    allowNull: false,
    comment: 'Type of time period'
  },
  
  periodStart: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Start of the measurement period'
  },
  
  periodEnd: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'End of the measurement period'
  },
  
  calculatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: 'When this metric was calculated'
  },
  
  // Benchmarking Data
  percentileRank: {
    type: DataTypes.DECIMAL(5, 2),
    comment: 'Percentile rank compared to peer institutions'
  },
  
  industryAverage: {
    type: DataTypes.DECIMAL(10, 4),
    comment: 'Industry average for this metric'
  },
  
  bestInClass: {
    type: DataTypes.DECIMAL(10, 4),
    comment: 'Best-in-class value for this metric'
  },
  
  peerComparison: {
    type: DataTypes.JSON,
    comment: 'JSON object with peer institution comparisons'
  },
  
  // Risk Assessment
  riskScore: {
    type: DataTypes.DECIMAL(5, 2),
    comment: 'Associated risk score (0-100)'
  },
  
  riskLevel: {
    type: DataTypes.ENUM('very_low', 'low', 'medium', 'high', 'critical'),
    comment: 'Risk level for this metric'
  },
  
  riskFactors: {
    type: DataTypes.JSON,
    comment: 'JSON array of risk factors affecting this metric'
  },
  
  // Compliance Context
  complianceScore: {
    type: DataTypes.DECIMAL(5, 2),
    comment: 'Related compliance score (0-100)'
  },
  
  councilBreakdown: {
    type: DataTypes.JSON,
    comment: 'JSON object with breakdown by council (UGC, AICTE, NAAC)'
  },
  
  // Predictive Analytics
  predictedValue: {
    type: DataTypes.DECIMAL(10, 4),
    comment: 'AI-predicted value for next period'
  },
  
  predictionConfidence: {
    type: DataTypes.DECIMAL(5, 2),
    comment: 'Confidence level of prediction (0-100)'
  },
  
  predictionHorizon: {
    type: DataTypes.INTEGER,
    comment: 'Number of periods ahead for prediction'
  },
  
  // Data Quality
  dataCompleteness: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 100,
    comment: 'Percentage of data completeness (0-100)'
  },
  
  dataAccuracy: {
    type: DataTypes.DECIMAL(5, 2),
    comment: 'Estimated accuracy of the metric (0-100)'
  },
  
  sourceSystems: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    comment: 'Array of source systems used for this metric'
  },
  
  // Business Impact
  businessImpact: {
    type: DataTypes.ENUM('high', 'medium', 'low', 'none'),
    comment: 'Business impact level of this metric'
  },
  
  actionRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether immediate action is required'
  },
  
  actionItems: {
    type: DataTypes.JSON,
    comment: 'JSON array of recommended actions'
  },
  
  // Alerts and Notifications
  alertThreshold: {
    type: DataTypes.DECIMAL(10, 4),
    comment: 'Threshold value that triggers alerts'
  },
  
  alertTriggered: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether an alert has been triggered'
  },
  
  alertLevel: {
    type: DataTypes.ENUM('info', 'warning', 'critical', 'emergency'),
    comment: 'Level of triggered alert'
  },
  
  // Metadata
  calculationMethod: {
    type: DataTypes.TEXT,
    comment: 'Description of how this metric is calculated'
  },
  
  businessRules: {
    type: DataTypes.JSON,
    comment: 'JSON object with business rules applied'
  },
  
  metadata: {
    type: DataTypes.JSON,
    comment: 'Additional metadata as JSON'
  },
  
  // Version Control
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: 'Version number of this metric calculation'
  },
  
  // Data Retention
  isArchived: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether this metric record is archived'
  },
  
  archiveDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When this metric was archived'
  }
}, {
  tableName: 'executive_metrics',
  timestamps: true,
  indexes: [
    {
      fields: ['institutionId']
    },
    {
      fields: ['metricCategory']
    },
    {
      fields: ['periodType']
    },
    {
      fields: ['periodStart']
    },
    {
      fields: ['performanceIndicator']
    },
    {
      fields: ['riskLevel']
    },
    {
      fields: ['alertTriggered']
    },
    {
      name: 'metric_institution_period_idx',
      fields: ['institutionId', 'periodType', 'periodStart']
    },
    {
      name: 'metric_category_performance_idx',
      fields: ['metricCategory', 'performanceIndicator']
    }
  ]
});

// Instance methods
ExecutiveMetric.prototype.getPerformanceColor = function() {
  const colors = {
    'above_target': 'text-green-600',
    'on_target': 'text-blue-600',
    'below_target': 'text-yellow-600',
    'critical': 'text-red-600'
  };
  return colors[this.performanceIndicator] || 'text-gray-600';
};

ExecutiveMetric.prototype.getTrendIcon = function() {
  const icons = {
    'improving': '↗️',
    'stable': '➡️',
    'declining': '↘️',
    'volatile': '📊'
  };
  return icons[this.trend] || '❓';
};

ExecutiveMetric.prototype.isAlertActive = function() {
  return this.alertTriggered || this.actionRequired;
};

ExecutiveMetric.prototype.getComparisonDelta = function() {
  if (!this.previousValue) return null;
  return ((this.currentValue - this.previousValue) / this.previousValue) * 100;
};

ExecutiveMetric.prototype.getTargetProgress = function() {
  if (!this.targetValue || this.targetValue === 0) return null;
  return (this.currentValue / this.targetValue) * 100;
};

ExecutiveMetric.prototype.getRiskColor = function() {
  const colors = {
    'very_low': 'bg-green-100 text-green-800',
    'low': 'bg-green-100 text-green-800',
    'medium': 'bg-yellow-100 text-yellow-800',
    'high': 'bg-orange-100 text-orange-800',
    'critical': 'bg-red-100 text-red-800'
  };
  return colors[this.riskLevel] || 'bg-gray-100 text-gray-800';
};

// Class methods
ExecutiveMetric.getCurrentMetrics = function(institutionId) {
  return this.findAll({
    where: {
      institutionId,
      isArchived: false
    },
    order: [
      ['metricCategory', 'ASC'],
      ['calculatedAt', 'DESC']
    ]
  });
};

ExecutiveMetric.getMetricsByCategory = function(institutionId, category) {
  return this.findAll({
    where: {
      institutionId,
      metricCategory: category,
      isArchived: false
    },
    order: [['calculatedAt', 'DESC']]
  });
};

ExecutiveMetric.getAlerts = function(institutionId) {
  return this.findAll({
    where: {
      institutionId,
      isArchived: false,
      [sequelize.Sequelize.Op.or]: [
        { alertTriggered: true },
        { actionRequired: true }
      ]
    },
    order: [['calculatedAt', 'DESC']]
  });
};

ExecutiveMetric.getBenchmarkData = function(metricName, institutionType = 'all') {
  return this.findAll({
    where: {
      metricName,
      isArchived: false,
      percentileRank: { [sequelize.Sequelize.Op.not]: null }
    },
    attributes: [
      'institutionId',
      'currentValue',
      'percentileRank',
      'industryAverage',
      'bestInClass'
    ],
    order: [['percentileRank', 'DESC']]
  });
};

ExecutiveMetric.getTrendAnalysis = function(institutionId, metricName, periods = 12) {
  return this.findAll({
    where: {
      institutionId,
      metricName,
      isArchived: false
    },
    order: [['periodStart', 'ASC']],
    limit: periods
  });
};

ExecutiveMetric.getExecutiveSummary = function(institutionId) {
  return this.findAll({
    where: {
      institutionId,
      isArchived: false,
      periodType: 'monthly'
    },
    attributes: [
      'metricCategory',
      [sequelize.Sequelize.fn('AVG', sequelize.Sequelize.col('currentValue')), 'avgValue'],
      [sequelize.Sequelize.fn('AVG', sequelize.Sequelize.col('complianceScore')), 'avgComplianceScore'],
      [sequelize.Sequelize.fn('COUNT', sequelize.Sequelize.literal('CASE WHEN action_required THEN 1 ELSE 0 END')), 'actionRequired'],
      [sequelize.Sequelize.fn('COUNT', sequelize.Sequelize.literal('CASE WHEN alert_triggered THEN 1 ELSE 0 END')), 'alertsTriggered']
    ],
    group: ['metricCategory'],
    raw: true
  });
};

module.exports = ExecutiveMetric;