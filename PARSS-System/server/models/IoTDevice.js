const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const IoTDevice = sequelize.define('IoTDevice', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  
  // Device Identification
  deviceId: {
    type: DataTypes.STRING(255),
    unique: true,
    allowNull: false,
    comment: 'Unique device identifier',
  },
  deviceName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Human-readable device name',
  },
  deviceType: {
    type: DataTypes.ENUM(
      'environmental_sensor',
      'air_quality_monitor',
      'noise_level_sensor',
      'water_quality_sensor',
      'fire_detection_system',
      'access_control_sensor',
      'lighting_control',
      'hvac_sensor',
      'security_camera',
      'occupancy_sensor',
      'energy_meter',
      'parking_sensor',
      'emergency_button',
      'compliance_monitor'
    ),
    allowNull: false,
    comment: 'Type of IoT device',
  },
  deviceModel: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Device model or manufacturer',
  },
  firmwareVersion: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Current firmware version',
  },
  
  // Network Configuration
  macAddress: {
    type: DataTypes.STRING(17),
    allowNull: true,
    comment: 'MAC address of the device',
  },
  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: true,
    comment: 'IP address (IPv4 or IPv6)',
  },
  networkId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Network identifier (WiFi, LoRa, etc.)',
  },
  protocolType: {
    type: DataTypes.ENUM('wifi', 'bluetooth', 'zigbee', 'lora', 'mqtt', 'http', 'coap'),
    allowNull: false,
    defaultValue: 'mqtt',
    comment: 'Communication protocol used',
  },
  mqttTopic: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'MQTT topic for data publishing',
  },
  
  // Location Information
  locationId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'Reference to location/building',
  },
  roomNumber: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Room number or identifier',
  },
  floorLevel: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Floor level in building',
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
    comment: 'GPS latitude coordinate',
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
    comment: 'GPS longitude coordinate',
  },
  altitude: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Altitude in meters',
  },
  installationDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date when device was installed',
  },
  
  // Compliance Monitoring
  complianceFramework: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Applicable compliance framework',
  },
  complianceCategories: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'Compliance categories this device monitors',
  },
  criticalityLevel: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium',
    comment: 'Criticality level for compliance',
  },
  
  // Sensor Configuration
  sensorConfig: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Device-specific sensor configuration',
  },
  measurementUnit: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Unit of measurement (°C, %, ppm, etc.)',
  },
  dataType: {
    type: DataTypes.ENUM('numeric', 'boolean', 'string', 'json', 'binary'),
    defaultValue: 'numeric',
    comment: 'Type of data this device produces',
  },
  
  // Threshold Configuration
  normalRange: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Normal operating range {min, max}',
  },
  warningThreshold: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Warning threshold values',
  },
  criticalThreshold: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Critical threshold values',
  },
  alertEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether alerts are enabled for this device',
  },
  
  // Device Status
  deviceStatus: {
    type: DataTypes.ENUM('online', 'offline', 'maintenance', 'error', 'unknown'),
    defaultValue: 'unknown',
    comment: 'Current device status',
  },
  lastHeartbeat: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Last heartbeat timestamp',
  },
  batteryLevel: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Battery level percentage (0-100)',
  },
  signalStrength: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Signal strength in dBm',
  },
  uptime: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: 'Device uptime in seconds',
  },
  
  // Data Collection
  dataCollectionEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether data collection is enabled',
  },
  samplingInterval: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Data sampling interval in seconds',
  },
  dataRetention: {
    type: DataTypes.INTEGER,
    defaultValue: 365,
    comment: 'Data retention period in days',
  },
  
  // Maintenance
  lastMaintenanceDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Last maintenance performed',
  },
  maintenanceDueDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Next maintenance due date',
  },
  maintenanceInterval: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Maintenance interval in days',
  },
  
  // Security
  securityLevel: {
    type: DataTypes.ENUM('basic', 'enhanced', 'high'),
    defaultValue: 'basic',
    comment: 'Security level configuration',
  },
  encryptionEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether data encryption is enabled',
  },
  authenticationEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether authentication is required',
  },
  
  // Management
  managedBy: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'User ID of device manager',
  },
  ownedBy: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'User ID of device owner',
  },
  department: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Department responsible for device',
  },
  
  // Additional Configuration
  customProperties: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Custom device properties',
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'Tags for categorization',
  },
  
  // Status Flags
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether device is currently active',
  },
  isMonitoringCompliance: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether monitoring compliance requirements',
  },
  
}, {
  tableName: 'iot_devices',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  
  indexes: [
    {
      fields: ['deviceId'],
      unique: true,
    },
    {
      fields: ['deviceType'],
    },
    {
      fields: ['deviceStatus'],
    },
    {
      fields: ['locationId'],
    },
    {
      fields: ['complianceFramework'],
    },
    {
      fields: ['criticalityLevel'],
    },
    {
      fields: ['lastHeartbeat'],
    },
    {
      fields: ['managedBy'],
    },
    {
      fields: ['tags'],
      using: 'gin',
    },
  ],
});

// Instance methods
IoTDevice.prototype.getCurrentStatus = function() {
  // Calculate current device status based on various factors
  const now = new Date();
  const heartbeatThreshold = 5 * 60 * 1000; // 5 minutes
  
  if (this.lastHeartbeat) {
    const timeSinceHeartbeat = now - this.lastHeartbeat;
    if (timeSinceHeartbeat > heartbeatThreshold) {
      return 'offline';
    }
  }
  
  return this.deviceStatus;
};

IoTDevice.prototype.isHealthy = function() {
  const status = this.getCurrentStatus();
  return status === 'online' && this.batteryLevel > 20;
};

IoTDevice.prototype.getComplianceScore = function() {
  // Calculate compliance score based on device health and data quality
  let score = 0;
  
  // Base score for being online
  if (this.getCurrentStatus() === 'online') score += 40;
  
  // Battery level contribution
  if (this.batteryLevel) {
    score += Math.min(this.batteryLevel * 0.4, 40);
  }
  
  // Signal strength contribution
  if (this.signalStrength) {
    const signalScore = Math.max(0, (this.signalStrength + 100) / 100 * 20);
    score += signalScore;
  }
  
  return Math.min(score, 100);
};

IoTDevice.prototype.needsMaintenance = function() {
  if (!this.maintenanceDueDate) return false;
  return new Date() >= this.maintenanceDueDate;
};

IoTDevice.prototype.getThresholdStatus = function(currentValue) {
  if (!this.criticalThreshold || !this.normalRange) {
    return { status: 'unknown', message: 'Thresholds not configured' };
  }
  
  const { min, max } = this.criticalThreshold;
  const { min: normalMin, max: normalMax } = this.normalRange;
  
  if (currentValue < normalMin || currentValue > normalMax) {
    if (currentValue < min || currentValue > max) {
      return { status: 'critical', message: 'Value is outside critical thresholds' };
    } else {
      return { status: 'warning', message: 'Value is outside normal range' };
    }
  }
  
  return { status: 'normal', message: 'Value is within normal range' };
};

// Class methods
IoTDevice.findByLocation = function(locationId) {
  return this.findAll({
    where: { locationId },
    order: [['deviceName', 'ASC']]
  });
};

IoTDevice.findByComplianceFramework = function(framework) {
  return this.findAll({
    where: { complianceFramework: framework },
    order: [['deviceType', 'ASC']]
  });
};

IoTDevice.getDeviceStatistics = async function() {
  const stats = await this.findAll({
    attributes: [
      'deviceType',
      'deviceStatus',
      'criticalityLevel',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: ['deviceType', 'deviceStatus', 'criticalityLevel']
  });
  return stats;
};

IoTDevice.findDevicesNeedingMaintenance = function() {
  const now = new Date();
  return this.findAll({
    where: {
      maintenanceDueDate: {
        [sequelize.Op.lte]: now
      },
      isActive: true
    },
    order: [['maintenanceDueDate', 'ASC']]
  });
};

IoTDevice.searchDevices = async function(query, options = {}) {
  const { 
    deviceType, 
    locationId, 
    complianceFramework, 
    status,
    limit = 50, 
    offset = 0 
  } = options;
  
  const whereClause = {};
  
  if (query) {
    whereClause.$or = [
      { deviceName: { $like: `%${query}%` } },
      { deviceId: { $like: `%${query}%` } },
      { tags: { $overlap: [query] } }
    ];
  }
  
  if (deviceType) whereClause.deviceType = deviceType;
  if (locationId) whereClause.locationId = locationId;
  if (complianceFramework) whereClause.complianceFramework = complianceFramework;
  if (status) whereClause.deviceStatus = status;
  
  return this.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    order: [['deviceName', 'ASC']]
  });
};

module.exports = IoTDevice;