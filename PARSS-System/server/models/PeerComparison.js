const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PeerComparison = sequelize.define('PeerComparison', {
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
  comparisonTitle: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  comparisonType: {
    type: DataTypes.ENUM('industry', 'sector', 'size', 'region', 'custom'),
    allowNull: false
  },
  peerCriteria: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  comparisonDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('draft', 'in_progress', 'completed', 'reviewed'),
    allowNull: false,
    defaultValue: 'draft'
  },
  // Organization being compared
  targetOrganizationId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'organizations',
      key: 'id'
    }
  },
  // Peer organizations for comparison
  peerOrganizationIds: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  // Comparison metrics
  complianceScoreComparison: {
    type: DataTypes.JSONB
  },
  performanceMetricsComparison: {
    type: DataTypes.JSONB
  },
  riskMetricsComparison: {
    type: DataTypes.JSONB
  },
  costComparison: {
    type: DataTypes.JSONB
  },
  efficiencyMetricsComparison: {
    type: DataTypes.JSONB
  },
  // Results and analysis
  benchmarkingResults: {
    type: DataTypes.JSONB
  },
  bestPractices: {
    type: DataTypes.JSONB
  },
  improvementOpportunities: {
    type: DataTypes.JSONB
  },
  competitiveAdvantages: {
    type: DataTypes.JSONB
  },
  competitiveGaps: {
    type: DataTypes.JSONB
  },
  recommendations: {
    type: DataTypes.TEXT
  },
  actionItems: {
    type: DataTypes.JSONB
  },
  // Peer insights
  peerInsights: {
    type: DataTypes.JSONB
  },
  industryBenchmarks: {
    type: DataTypes.JSONB
  },
  sectorStandards: {
    type: DataTypes.JSONB
  },
  // Rankings and positions
  overallRanking: {
    type: DataTypes.INTEGER
  },
  complianceRanking: {
    type: DataTypes.INTEGER
  },
  efficiencyRanking: {
    type: DataTypes.INTEGER
  },
  costRanking: {
    type: DataTypes.INTEGER
  },
  // Analysis results
  percentileRankings: {
    type: DataTypes.JSONB
  },
  performanceGaps: {
    type: DataTypes.JSONB
  },
  potentialSavings: {
    type: DataTypes.DECIMAL(15, 2)
  },
  roiProjection: {
    type: DataTypes.DECIMAL(5, 2)
  },
  // Additional data
  attachments: {
    type: DataTypes.JSONB
  },
  methodology: {
    type: DataTypes.TEXT
  },
  dataSources: {
    type: DataTypes.JSONB
  },
  limitations: {
    type: DataTypes.TEXT
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
  tableName: 'peer_comparisons',
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
      fields: ['targetOrganizationId']
    },
    {
      fields: ['comparisonType']
    },
    {
      fields: ['status']
    },
    {
      fields: ['comparisonDate']
    }
  ]
});

module.exports = PeerComparison;