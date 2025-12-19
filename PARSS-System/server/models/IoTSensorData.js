const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const IoTSensorData = sequelize.define('IoTSensorData', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  
  // Device Reference
  deviceId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'Reference to IoTDevice',
  },
  
  // Data Identification
  dataId: {
    type: DataTypes.STRING(255),
    unique: true,
    allowNull: false,
    comment: 'Unique identifier for this data point',
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'When the data was collected',
  },
  
  // Sensor Readings
  value: {
    type: DataTypes.DECIMAL(15, 6),
    allowNull: true,
    comment: 'Primary sensor value',
  },
  unit: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Unit of measurement',
  },
  dataType: {
    type: DataTypes.ENUM('numeric', 'boolean', 'string', 'json', 'binary'),
    allowNull: false,
    defaultValue: 'numeric',
    comment: 'Type of data value',
  },
  
  // Extended Data
  rawData: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Raw sensor data as JSON',
  },
  processedData: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Processed/calculated data',
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Additional metadata',
  },
  
  // Data Quality
  qualityScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Data quality score (0-100)',
  },
  accuracy: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'Measurement accuracy percentage',
  },
  precision: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'Measurement precision',
  },
  
  // Environmental Context
  temperature: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'Ambient temperature when reading was taken',
  },
  humidity: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'Ambient humidity percentage',
  },
  pressure: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
    comment: 'Atmospheric pressure',
  },
  
  // Location Context
  exactLocation: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Exact GPS coordinates and accuracy',
  },
  
  // Compliance Analysis
  complianceStatus: {
    type: DataTypes.ENUM('compliant', 'non_compliant', 'warning', 'unknown'),
    allowNull: true,
    comment: 'Compliance status for this reading',
  },
  complianceFramework: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Applicable compliance framework',
  },
  regulationReference: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Specific regulation this reading relates to',
  },
  
  // Threshold Analysis
  thresholdStatus: {
    type: DataTypes.ENUM('normal', 'warning', 'critical', 'out_of_range'),
    allowNull: true,
    comment: 'Status based on threshold analysis',
  },
  thresholdDetails: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Detailed threshold analysis results',
  },
  
  // Alert and Event Information
  alertGenerated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether an alert was generated for this reading',
  },
  alertLevel: {
    type: DataTypes.ENUM('info', 'warning', 'error', 'critical'),
    allowNull: true,
    comment: 'Level of alert generated',
  },
  alertMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Alert message if generated',
  },
  alertIds: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: [],
    comment: 'IDs of generated alerts',
  },
  
  // Event Detection
  eventType: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Type of event detected (if any)',
  },
  eventConfidence: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'Confidence level of event detection (0-100)',
  },
  eventData: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Event detection metadata',
  },
  
  // Data Processing
  processingStatus: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
    defaultValue: 'pending',
    comment: 'Status of data processing',
  },
  processingPipeline: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Processing pipeline used',
  },
  processedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When data processing was completed',
  },
  
  // Data Validation
  validationStatus: {
    type: DataTypes.ENUM('valid', 'invalid', 'uncertain', 'pending'),
    defaultValue: 'pending',
    comment: 'Data validation status',
  },
  validationResults: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Detailed validation results',
  },
  outlierDetection: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether this data point was flagged as outlier',
  },
  
  // Aggregation and Statistics
  aggregationType: {
    type: DataTypes.ENUM('raw', 'average', 'min', 'max', 'sum', 'count', 'median'),
    allowNull: true,
    comment: 'Type of data aggregation',
  },
  aggregationPeriod: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Period over which data was aggregated',
  },
  sampleCount: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Number of samples in aggregation',
  },
  
  // Trend Analysis
  trendDirection: {
    type: DataTypes.ENUM('increasing', 'decreasing', 'stable', 'volatile'),
    allowNull: true,
    comment: 'Trend direction of this reading',
  },
  trendMagnitude: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: true,
    comment: 'Magnitude of trend',
  },
  
  // Predictive Analytics
  predictedValue: {
    type: DataTypes.DECIMAL(15, 6),
    allowNull: true,
    comment: 'Predicted next value',
  },
  predictionConfidence: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'Confidence in prediction (0-100)',
  },
  predictionModel: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Model used for prediction',
  },
  
  // Data Security
  dataClassification: {
    type: DataTypes.ENUM('public', 'internal', 'confidential', 'restricted'),
    defaultValue: 'internal',
    comment: 'Data classification level',
  },
  encryptionStatus: {
    type: DataTypes.ENUM('plaintext', 'encrypted', 'hashed'),
    defaultValue: 'plaintext',
    comment: 'Data encryption status',
  },
  
  // Synchronization
  syncStatus: {
    type: DataTypes.ENUM('synced', 'pending_sync', 'sync_failed'),
    defaultValue: 'pending_sync',
    comment: 'Synchronization status with external systems',
  },
  syncTimestamp: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Last synchronization timestamp',
  },
  
  // Retention and Archival
  retentionPeriod: {
    type: DataTypes.INTEGER,
    defaultValue: 365,
    comment: 'Data retention period in days',
  },
  archiveStatus: {
    type: DataTypes.ENUM('active', 'archived', 'deleted'),
    defaultValue: 'active',
    comment: 'Archive status',
  },
  
  // Batch Processing
  batchId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Batch processing identifier',
  },
  batchSequence: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Sequence number within batch',
  },
  
}, {
  tableName: 'iot_sensor_data',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  
  indexes: [
    {
      fields: ['deviceId', 'timestamp'],
    },
    {
      fields: ['timestamp'],
    },
    {
      fields: ['dataId'],
      unique: true,
    },
    {
      fields: ['deviceId'],
    },
    {
      fields: ['complianceStatus'],
    },
    {
      fields: ['thresholdStatus'],
    },
    {
      fields: ['alertGenerated'],
    },
    {
      fields: ['eventType'],
    },
    {
      fields: ['processingStatus'],
    },
    {
      fields: ['validationStatus'],
    },
    {
      fields: ['syncStatus'],
    },
  ],
});

// Instance methods
IoTSensorData.prototype.getComplianceScore = function() {
  // Calculate compliance score for this reading
  if (!this.complianceStatus) return 0;
  
  switch (this.complianceStatus) {
    case 'compliant': return 100;
    case 'warning': return 70;
    case 'non_compliant': return 0;
    default: return 50;
  }
};

IoTSensorData.prototype.getThresholdSeverity = function() {
  if (!this.thresholdStatus) return 'unknown';
  
  switch (this.thresholdStatus) {
    case 'normal': return 'low';
    case 'warning': return 'medium';
    case 'critical': return 'high';
    case 'out_of_range': return 'critical';
    default: return 'unknown';
  }
};

IoTSensorData.prototype.isOutlier = function() {
  return this.outlierDetection || this.qualityScore < 70;
};

IoTSensorData.prototype.needsAttention = function() {
  return this.alertGenerated || 
         this.complianceStatus === 'non_compliant' ||
         this.thresholdStatus === 'critical' ||
         this.qualityScore < 70;
};

// Class methods
IoTSensorData.findByDevice = function(deviceId, options = {}) {
  const { 
    startDate, 
    endDate, 
    limit = 1000, 
    offset = 0,
    order = 'DESC'
  } = options;
  
  const whereClause = { deviceId };
  
  if (startDate || endDate) {
    whereClause.timestamp = {};
    if (startDate) whereClause.timestamp[sequelize.Op.gte] = startDate;
    if (endDate) whereClause.timestamp[sequelize.Op.lte] = endDate;
  }
  
  return this.findAll({
    where: whereClause,
    limit,
    offset,
    order: [['timestamp', order]]
  });
};

IoTSensorData.getComplianceSummary = async function(deviceId, startDate, endDate) {
  const whereClause = { deviceId };
  
  if (startDate || endDate) {
    whereClause.timestamp = {};
    if (startDate) whereClause.timestamp[sequelize.Op.gte] = startDate;
    if (endDate) whereClause.timestamp[sequelize.Op.lte] = endDate;
  }
  
  const summary = await this.findAll({
    where: whereClause,
    attributes: [
      'complianceStatus',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      [sequelize.fn('AVG', sequelize.col('qualityScore')), 'avgQuality']
    ],
    group: ['complianceStatus']
  });
  
  return summary;
};

IoTSensorData.getThresholdAnalysis = async function(deviceId, startDate, endDate) {
  const whereClause = { deviceId };
  
  if (startDate || endDate) {
    whereClause.timestamp = {};
    if (startDate) whereClause.timestamp[sequelize.Op.gte] = startDate;
    if (endDate) endDate && (whereClause.timestamp[sequelize.Op.lte] = endDate);
  }
  
  const analysis = await this.findAll({
    where: whereClause,
    attributes: [
      'thresholdStatus',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      [sequelize.fn('AVG', sequelize.col('value')), 'avgValue']
    ],
    group: ['thresholdStatus']
  });
  
  return analysis;
};

IoTSensorData.getTrendAnalysis = async function(deviceId, period = '1h') {
  const interval = period;
  const query = `
    SELECT 
      date_trunc('${interval}', timestamp) as period,
      AVG(value) as avg_value,
      MIN(value) as min_value,
      MAX(value) as max_value,
      COUNT(*) as sample_count
    FROM iot_sensor_data 
    WHERE device_id = :deviceId 
      AND timestamp >= NOW() - INTERVAL '24 hours'
    GROUP BY period 
    ORDER BY period ASC
  `;
  
  return sequelize.query(query, {
    replacements: { deviceId },
    type: sequelize.QueryTypes.SELECT
  });
};

IoTSensorData.findAlerts = function(options = {}) {
  const { 
    startDate, 
    endDate, 
    alertLevel, 
    deviceId,
    limit = 100 
  } = options;
  
  const whereClause = { alertGenerated: true };
  
  if (startDate || endDate) {
    whereClause.timestamp = {};
    if (startDate) whereClause.timestamp[sequelize.Op.gte] = startDate;
    if (endDate) whereClause.timestamp[sequelize.Op.lte] = endDate;
  }
  
  if (alertLevel) whereClause.alertLevel = alertLevel;
  if (deviceId) whereClause.deviceId = deviceId;
  
  return this.findAll({
    where: whereClause,
    limit,
    order: [['timestamp', 'DESC']]
  });
};

IoTSensorData.cleanupOldData = async function(retentionDays = 365) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
  
  return this.destroy({
    where: {
      timestamp: {
        [sequelize.Op.lt]: cutoffDate
      },
      archiveStatus: 'active'
    }
  });
};

module.exports = IoTSensorData;