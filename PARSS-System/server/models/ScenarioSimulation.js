const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ScenarioSimulation = sequelize.define('ScenarioSimulation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  organizationId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'organizations',
      key: 'id'
    }
  },
  simulationTitle: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  scenarioType: {
    type: DataTypes.ENUM(
      'regulatory_change', 
      'audit_findings', 
      'non_compliance', 
      'risk_event', 
      'system_failure',
      'vendor_issue',
      'policy_violation',
      'training_need',
      'process_optimization',
      'cost_reduction',
      'efficiency_improvement'
    ),
    allowNull: false
  },
  simulationDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('draft', 'configured', 'running', 'completed', 'reviewed', 'approved'),
    allowNull: false,
    defaultValue: 'draft'
  },
  // Scenario configuration
  scenarioDescription: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  scenarioParameters: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  assumptions: {
    type: DataTypes.JSONB
  },
  constraints: {
    type: DataTypes.JSONB
  },
  timeHorizon: {
    type: DataTypes.ENUM('immediate', 'short_term', 'medium_term', 'long_term'),
    allowNull: false,
    defaultValue: 'short_term'
  },
  simulationDuration: {
    type: DataTypes.INTEGER, // in days
    defaultValue: 30
  },
  // Impact analysis
  financialImpact: {
    type: DataTypes.DECIMAL(15, 2)
  },
  operationalImpact: {
    type: DataTypes.JSONB
  },
  complianceImpact: {
    type: DataTypes.JSONB
  },
  reputationalImpact: {
    type: DataTypes.ENUM('minimal', 'low', 'medium', 'high', 'critical')
  },
  riskLevel: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    allowNull: false,
    defaultValue: 'medium'
  },
  // Simulation results
  simulationResults: {
    type: DataTypes.JSONB
  },
  performanceMetrics: {
    type: DataTypes.JSONB
  },
  costProjections: {
    type: DataTypes.JSONB
  },
  timelineProjections: {
    type: DataTypes.JSONB
  },
  resourceRequirements: {
    type: DataTypes.JSONB
  },
  // What-if analysis
  alternativeScenarios: {
    type: DataTypes.JSONB
  },
  sensitivityAnalysis: {
    type: DataTypes.JSONB
  },
  stressTestResults: {
    type: DataTypes.JSONB
  },
  // Mitigation strategies
  mitigationStrategies: {
    type: DataTypes.JSONB
  },
  contingencyPlans: {
    type: DataTypes.JSONB
  },
  responseActions: {
    type: DataTypes.JSONB
  },
  preventiveMeasures: {
    type: DataTypes.JSONB
  },
  // Analysis and recommendations
  impactAssessment: {
    type: DataTypes.JSONB
  },
  riskAssessment: {
    type: DataTypes.JSONB
  },
  recommendations: {
    type: DataTypes.TEXT
  },
  actionPlan: {
    type: DataTypes.JSONB
  },
  priorityActions: {
    type: DataTypes.JSONB
  },
  // Implementation tracking
  implementationStatus: {
    type: DataTypes.ENUM('not_started', 'planning', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'not_started'
  },
  implementationProgress: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  implementationTimeline: {
    type: DataTypes.JSONB
  },
  responsiblePersons: {
    type: DataTypes.JSONB
  },
  // Monitoring and validation
  monitoringMetrics: {
    type: DataTypes.JSONB
  },
  validationResults: {
    type: DataTypes.JSONB
  },
  actualVsProjected: {
    type: DataTypes.JSONB
  },
  lessonsLearned: {
    type: DataTypes.TEXT
  },
  bestPractices: {
    type: DataTypes.JSONB
  },
  // Additional data
  attachments: {
    type: DataTypes.JSONB
  },
  supportingData: {
    type: DataTypes.JSONB
  },
  methodology: {
    type: DataTypes.TEXT
  },
  dataSources: {
    type: DataTypes.JSONB
  },
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'scenario_simulations',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['organizationId']
    },
    {
      fields: ['scenarioType']
    },
    {
      fields: ['status']
    },
    {
      fields: ['riskLevel']
    },
    {
      fields: ['simulationDate']
    }
  ]
});

module.exports = ScenarioSimulation;