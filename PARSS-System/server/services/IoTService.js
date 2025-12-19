const IoTDevice = require('../models/IoTDevice');
const IoTSensorData = require('../models/IoTSensorData');
const { Op } = require('sequelize');
const EventEmitter = require('events');

class IoTService extends EventEmitter {
  constructor() {
    super();
    this.deviceConnections = new Map();
    this.dataBuffer = new Map();
    this.alertThresholds = new Map();
    this.initializeServices();
  }

  /**
   * Register a new IoT device
   * @param {Object} deviceData - Device information
   * @returns {Promise<Object>} Created device
   */
  async registerDevice(deviceData) {
    try {
      const {
        deviceId,
        deviceName,
        deviceType,
        deviceModel,
        locationId,
        complianceFramework,
        sensorConfig,
        thresholds,
        userId,
        institutionId
      } = deviceData;

      // Generate unique device ID if not provided
      const finalDeviceId = deviceId || this.generateDeviceId();

      // Check if device already exists
      const existingDevice = await IoTDevice.findOne({
        where: { deviceId: finalDeviceId }
      });

      if (existingDevice) {
        throw new Error(`Device with ID ${finalDeviceId} already exists`);
      }

      // Create device record
      const device = await IoTDevice.create({
        deviceId: finalDeviceId,
        deviceName,
        deviceType,
        deviceModel,
        locationId,
        complianceFramework,
        complianceCategories: sensorConfig.categories || [],
        criticalityLevel: sensorConfig.criticality || 'medium',
        sensorConfig,
        normalRange: thresholds?.normal || null,
        warningThreshold: thresholds?.warning || null,
        criticalThreshold: thresholds?.critical || null,
        measurementUnit: sensorConfig.unit || 'unit',
        dataType: sensorConfig.dataType || 'numeric',
        samplingInterval: sensorConfig.samplingInterval || 60,
        managedBy: userId,
        institutionId,
        isActive: true,
        isMonitoringCompliance: true
      });

      // Set up device connection
      this.setupDeviceConnection(device);

      // Set up alert thresholds
      this.setupAlertThresholds(device);

      this.emit('deviceRegistered', device);

      return {
        success: true,
        device: device.toJSON(),
        deviceId: finalDeviceId,
        connectionInfo: this.getConnectionInfo(device)
      };

    } catch (error) {
      console.error('Device registration error:', error);
      throw new Error(`Failed to register device: ${error.message}`);
    }
  }

  /**
   * Process sensor data from device
   * @param {string} deviceId - Device identifier
   * @param {Object} sensorData - Sensor readings
   * @returns {Promise<Object>} Processing result
   */
  async processSensorData(deviceId, sensorData) {
    try {
      const device = await IoTDevice.findOne({ where: { deviceId } });
      
      if (!device) {
        throw new Error(`Device ${deviceId} not found`);
      }

      if (!device.isActive) {
        throw new Error(`Device ${deviceId} is not active`);
      }

      // Generate unique data ID
      const dataId = this.generateDataId();

      // Process sensor value
      const processedValue = this.processSensorValue(sensorData.value, device.sensorConfig);

      // Analyze compliance status
      const complianceAnalysis = await this.analyzeCompliance(processedValue, device);

      // Check thresholds and generate alerts
      const thresholdAnalysis = this.analyzeThresholds(processedValue, device);

      // Create sensor data record
      const sensorRecord = await IoTSensorData.create({
        deviceId: device.id,
        dataId,
        timestamp: sensorData.timestamp || new Date(),
        value: processedValue.value,
        unit: processedValue.unit || device.measurementUnit,
        dataType: device.dataType,
        rawData: sensorData,
        processedData: processedValue,
        qualityScore: processedValue.quality || 85,
        accuracy: processedValue.accuracy || 95,
        temperature: sensorData.temperature,
        humidity: sensorData.humidity,
        pressure: sensorData.pressure,
        complianceStatus: complianceAnalysis.status,
        complianceFramework: device.complianceFramework,
        regulationReference: complianceAnalysis.regulation,
        thresholdStatus: thresholdAnalysis.status,
        thresholdDetails: thresholdAnalysis.details,
        alertGenerated: thresholdAnalysis.alertRequired,
        alertLevel: thresholdAnalysis.alertLevel,
        alertMessage: thresholdAnalysis.alertMessage,
        eventType: processedValue.eventType,
        eventConfidence: processedValue.eventConfidence,
        eventData: processedValue.eventAnalysis,
        processingStatus: 'completed',
        processedAt: new Date(),
        validationStatus: 'valid',
        aggregationType: 'raw',
        syncStatus: 'synced',
        syncTimestamp: new Date(),
        dataClassification: 'internal'
      });

      // Update device status
      await this.updateDeviceStatus(device, sensorData);

      // Generate alerts if needed
      if (thresholdAnalysis.alertRequired) {
        await this.generateAlert(device, sensorRecord, thresholdAnalysis);
      }

      // Process for compliance insights
      await this.processComplianceInsights(device, sensorRecord);

      // Emit events for real-time updates
      this.emit('sensorDataProcessed', {
        deviceId,
        dataId,
        value: processedValue.value,
        complianceStatus: complianceAnalysis.status,
        alertGenerated: thresholdAnalysis.alertRequired
      });

      this.emit('complianceEvent', {
        deviceId,
        complianceStatus: complianceAnalysis.status,
        framework: device.complianceFramework,
        severity: thresholdAnalysis.severity
      });

      return {
        success: true,
        dataId,
        processedValue: processedValue.value,
        complianceStatus: complianceAnalysis.status,
        thresholdStatus: thresholdAnalysis.status,
        alertGenerated: thresholdAnalysis.alertRequired,
        qualityScore: processedValue.quality || 85
      };

    } catch (error) {
      console.error('Sensor data processing error:', error);
      throw new Error(`Failed to process sensor data: ${error.message}`);
    }
  }

  /**
   * Get device status and health information
   * @param {string} deviceId - Device identifier
   * @returns {Promise<Object>} Device status
   */
  async getDeviceStatus(deviceId) {
    try {
      const device = await IoTDevice.findOne({ where: { deviceId } });
      
      if (!device) {
        throw new Error(`Device ${deviceId} not found`);
      }

      const currentStatus = device.getCurrentStatus();
      const healthScore = device.getComplianceScore();
      const needsMaintenance = device.needsMaintenance();

      // Get recent sensor data
      const recentData = await IoTSensorData.findByDevice(device.id, {
        limit: 10,
        order: 'DESC'
      });

      // Calculate uptime percentage
      const uptimePercentage = this.calculateUptimePercentage(device);

      return {
        device: device.toJSON(),
        currentStatus,
        healthScore,
        uptimePercentage,
        needsMaintenance,
        lastReading: recentData[0]?.toJSON() || null,
        recentReadings: recentData.slice(0, 5).map(d => ({
          timestamp: d.timestamp,
          value: d.value,
          unit: d.unit,
          complianceStatus: d.complianceStatus,
          thresholdStatus: d.thresholdStatus
        })),
        alertCount: recentData.filter(d => d.alertGenerated).length,
        dataQuality: this.calculateDataQuality(recentData)
      };

    } catch (error) {
      console.error('Get device status error:', error);
      throw new Error(`Failed to get device status: ${error.message}`);
    }
  }

  /**
   * Get IoT dashboard data for an institution
   * @param {string} institutionId - Institution ID
   * @param {Object} filters - Dashboard filters
   * @returns {Promise<Object>} Dashboard data
   */
  async getDashboardData(institutionId, filters = {}) {
    try {
      const {
        timeframe = '24h',
        deviceTypes,
        complianceFrameworks,
        criticalityLevels
      } = filters;

      const startDate = this.getTimeframeStartDate(timeframe);

      // Get device statistics
      const deviceStats = await this.getDeviceStatistics(institutionId, {
        deviceTypes,
        complianceFrameworks,
        criticalityLevels
      });

      // Get compliance summary
      const complianceSummary = await this.getComplianceSummary(institutionId, startDate);

      // Get alert statistics
      const alertStats = await this.getAlertStatistics(institutionId, startDate);

      // Get performance metrics
      const performanceMetrics = await this.getPerformanceMetrics(institutionId, startDate);

      // Get recent events
      const recentEvents = await this.getRecentEvents(institutionId, startDate);

      return {
        summary: {
          totalDevices: deviceStats.total,
          activeDevices: deviceStats.active,
          complianceScore: complianceSummary.overallScore,
          activeAlerts: alertStats.active,
          avgUptime: performanceMetrics.avgUptime,
          dataQuality: performanceMetrics.avgDataQuality
        },
        deviceStats,
        complianceSummary,
        alertStats,
        performanceMetrics,
        recentEvents,
        timeframe,
        generatedAt: new Date()
      };

    } catch (error) {
      console.error('Dashboard data error:', error);
      throw new Error(`Failed to get dashboard data: ${error.message}`);
    }
  }

  /**
   * Configure alert thresholds for a device
   * @param {string} deviceId - Device identifier
   * @param {Object} thresholds - Threshold configuration
   * @returns {Promise<Object>} Configuration result
   */
  async configureThresholds(deviceId, thresholds) {
    try {
      const device = await IoTDevice.findOne({ where: { deviceId } });
      
      if (!device) {
        throw new Error(`Device ${deviceId} not found`);
      }

      await device.update({
        normalRange: thresholds.normal,
        warningThreshold: thresholds.warning,
        criticalThreshold: thresholds.critical,
        alertEnabled: thresholds.alertEnabled !== false
      });

      // Update in-memory thresholds
      this.setupAlertThresholds(device);

      this.emit('thresholdsUpdated', { deviceId, thresholds });

      return {
        success: true,
        message: 'Thresholds updated successfully',
        thresholds: {
          normal: thresholds.normal,
          warning: thresholds.warning,
          critical: thresholds.critical
        }
      };

    } catch (error) {
      console.error('Threshold configuration error:', error);
      throw new Error(`Failed to configure thresholds: ${error.message}`);
    }
  }

  /**
   * Get compliance analytics for IoT data
   * @param {string} institutionId - Institution ID
   * @param {string} period - Analysis period
   * @returns {Promise<Object>} Compliance analytics
   */
  async getComplianceAnalytics(institutionId, period = '30d') {
    try {
      const startDate = this.getTimeframeStartDate(period);

      // Get compliance trends
      const trends = await this.getComplianceTrends(institutionId, startDate);

      // Get violation analysis
      const violations = await this.getViolationAnalysis(institutionId, startDate);

      // Get framework compliance
      const frameworkCompliance = await this.getFrameworkCompliance(institutionId, startDate);

      // Get predictive analysis
      const predictions = await this.getPredictiveCompliance(institutionId, startDate);

      return {
        trends,
        violations,
        frameworkCompliance,
        predictions,
        period,
        generatedAt: new Date()
      };

    } catch (error) {
      console.error('Compliance analytics error:', error);
      throw new Error(`Failed to get compliance analytics: ${error.message}`);
    }
  }

  // Private helper methods

  generateDeviceId() {
    const prefix = 'IOT';
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `${prefix}-${timestamp}-${random}`.toUpperCase();
  }

  generateDataId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 8);
    return `DATA-${timestamp}-${random}`.toUpperCase();
  }

  setupDeviceConnection(device) {
    this.deviceConnections.set(device.deviceId, {
      device,
      connectedAt: new Date(),
      lastHeartbeat: new Date(),
      connectionStatus: 'connected',
      reconnectAttempts: 0
    });
  }

  setupAlertThresholds(device) {
    if (device.criticalThreshold) {
      this.alertThresholds.set(device.deviceId, {
        normal: device.normalRange,
        warning: device.warningThreshold,
        critical: device.criticalThreshold,
        alertEnabled: device.alertEnabled
      });
    }
  }

  async updateDeviceStatus(device, sensorData) {
    const updateData = {
      lastHeartbeat: new Date(),
      deviceStatus: 'online'
    };

    if (sensorData.battery !== undefined) {
      updateData.batteryLevel = sensorData.battery;
    }

    if (sensorData.signalStrength !== undefined) {
      updateData.signalStrength = sensorData.signalStrength;
    }

    if (sensorData.uptime !== undefined) {
      updateData.uptime = sensorData.uptime;
    }

    await device.update(updateData);
  }

  processSensorValue(rawValue, config) {
    let processedValue = {
      value: rawValue,
      unit: config.unit || 'unit',
      quality: 85,
      accuracy: 95
    };

    // Apply calibration if configured
    if (config.calibration) {
      const { offset, multiplier } = config.calibration;
      processedValue.value = (rawValue + offset) * multiplier;
    }

    // Apply range validation
    if (config.validRange) {
      const { min, max } = config.validRange;
      if (processedValue.value < min || processedValue.value > max) {
        processedValue.quality = Math.max(0, processedValue.quality - 30);
      }
    }

    // Detect anomalies
    if (config.anomalyDetection) {
      const anomaly = this.detectAnomaly(processedValue.value, config);
      if (anomaly.isAnomaly) {
        processedValue.eventType = 'anomaly';
        processedValue.eventConfidence = anomaly.confidence;
        processedValue.eventAnalysis = anomaly;
        processedValue.quality = Math.max(0, processedValue.quality - 40);
      }
    }

    return processedValue;
  }

  detectAnomaly(value, config) {
    // Simple anomaly detection based on statistical thresholds
    // In real implementation, use ML models or more sophisticated algorithms
    const threshold = config.anomalyDetection.threshold || 3;
    const mean = config.anomalyDetection.mean || 50;
    const stdDev = config.anomalyDetection.stdDev || 10;
    
    const zScore = Math.abs((value - mean) / stdDev);
    const isAnomaly = zScore > threshold;
    
    return {
      isAnomaly,
      confidence: Math.min(zScore / threshold, 1),
      zScore,
      threshold
    };
  }

  async analyzeCompliance(value, device) {
    const complianceFramework = device.complianceFramework;
    
    // Framework-specific compliance logic
    switch (complianceFramework) {
      case 'UGC':
        return this.analyzeUGCCompliance(value, device);
      case 'AICTE':
        return this.analyzeAICTECompliance(value, device);
      case 'NAAC':
        return this.analyzeNAACCompliance(value, device);
      default:
        return {
          status: 'unknown',
          regulation: null
        };
    }
  }

  analyzeUGCCompliance(value, device) {
    // UGC-specific compliance rules
    const thresholds = device.normalRange;
    if (!thresholds) return { status: 'unknown', regulation: null };

    const { min, max } = thresholds;
    
    if (value >= min && value <= max) {
      return { status: 'compliant', regulation: 'UGC-ENVIRONMENTAL-STANDARDS' };
    } else {
      return { status: 'non_compliant', regulation: 'UGC-ENVIRONMENTAL-STANDARDS' };
    }
  }

  analyzeAICTECompliance(value, device) {
    // AICTE-specific compliance rules
    const thresholds = device.normalRange;
    if (!thresholds) return { status: 'unknown', regulation: null };

    const { min, max } = thresholds;
    
    if (value >= min && value <= max) {
      return { status: 'compliant', regulation: 'AICTE-INFRASTRUCTURE-STANDARDS' };
    } else {
      return { status: 'non_compliant', regulation: 'AICTE-INFRASTRUCTURE-STANDARDS' };
    }
  }

  analyzeNAACCompliance(value, device) {
    // NAAC-specific compliance rules
    const thresholds = device.normalRange;
    if (!thresholds) return { status: 'unknown', regulation: null };

    const { min, max } = thresholds;
    
    if (value >= min && value <= max) {
      return { status: 'compliant', regulation: 'NAAC-QUALITY-STANDARDS' };
    } else {
      return { status: 'non_compliant', regulation: 'NAAC-QUALITY-STANDARDS' };
    }
  }

  analyzeThresholds(value, device) {
    const thresholds = this.alertThresholds.get(device.deviceId);
    if (!thresholds) {
      return {
        status: 'unknown',
        alertRequired: false,
        details: {}
      };
    }

    const { normal, warning, critical } = thresholds;
    
    let status = 'normal';
    let alertRequired = false;
    let alertLevel = 'info';
    let alertMessage = '';

    if (critical && (value < critical.min || value > critical.max)) {
      status = 'critical';
      alertRequired = true;
      alertLevel = 'critical';
      alertMessage = `Critical threshold exceeded: ${value}`;
    } else if (warning && (value < warning.min || value > warning.max)) {
      status = 'warning';
      alertRequired = true;
      alertLevel = 'warning';
      alertMessage = `Warning threshold exceeded: ${value}`;
    } else if (normal && (value < normal.min || value > normal.max)) {
      status = 'out_of_range';
      alertRequired = true;
      alertLevel = 'error';
      alertMessage = `Value out of normal range: ${value}`;
    }

    return {
      status,
      alertRequired,
      alertLevel,
      alertMessage,
      details: {
        value,
        thresholds: { normal, warning, critical },
        exceeded: {
          normal: normal && (value < normal.min || value > normal.max),
          warning: warning && (value < warning.min || value > warning.max),
          critical: critical && (value < critical.min || value > critical.max)
        }
      }
    };
  }

  async generateAlert(device, sensorRecord, thresholdAnalysis) {
    // Create alert in database
    const Alert = require('../models/Alert');
    
    await Alert.create({
      title: `IoT Alert: ${device.deviceName}`,
      message: thresholdAnalysis.alertMessage,
      severity: thresholdAnalysis.alertLevel,
      type: 'iot_threshold',
      status: 'active',
      deviceId: device.id,
      institutionId: device.institutionId,
      metadata: {
        deviceId: device.deviceId,
        deviceType: device.deviceType,
        sensorValue: sensorRecord.value,
        thresholdStatus: thresholdAnalysis.status,
        complianceFramework: device.complianceFramework
      }
    });

    // Emit real-time alert event
    this.emit('alertGenerated', {
      deviceId: device.deviceId,
      deviceName: device.deviceName,
      alertLevel: thresholdAnalysis.alertLevel,
      message: thresholdAnalysis.alertMessage,
      value: sensorRecord.value,
      timestamp: sensorRecord.timestamp
    });
  }

  async processComplianceInsights(device, sensorRecord) {
    // Process compliance insights and trends
    // This could trigger ML models, generate reports, etc.
    
    // For now, emit event for downstream processing
    this.emit('complianceInsight', {
      deviceId: device.deviceId,
      complianceStatus: sensorRecord.complianceStatus,
      framework: device.complianceFramework,
      value: sensorRecord.value,
      timestamp: sensorRecord.timestamp
    });
  }

  getTimeframeStartDate(timeframe) {
    const now = new Date();
    switch (timeframe) {
      case '1h':
        return new Date(now.getTime() - 60 * 60 * 1000);
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
  }

  async getDeviceStatistics(institutionId, filters) {
    const { deviceTypes, complianceFrameworks, criticalityLevels } = filters;
    
    const whereClause = { institutionId, isActive: true };
    if (deviceTypes?.length) whereClause.deviceType = { [Op.in]: deviceTypes };
    if (complianceFrameworks?.length) whereClause.complianceFramework = { [Op.in]: complianceFrameworks };
    if (criticalityLevels?.length) whereClause.criticalityLevel = { [Op.in]: criticalityLevels };

    const devices = await IoTDevice.findAll({ where: whereClause });
    
    return {
      total: devices.length,
      active: devices.filter(d => d.deviceStatus === 'online').length,
      offline: devices.filter(d => d.deviceStatus === 'offline').length,
      maintenance: devices.filter(d => d.deviceStatus === 'maintenance').length,
      byType: this.groupBy(devices, 'deviceType'),
      byFramework: this.groupBy(devices, 'complianceFramework'),
      byCriticality: this.groupBy(devices, 'criticalityLevel')
    };
  }

  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const value = item[key] || 'unknown';
      groups[value] = (groups[value] || 0) + 1;
      return groups;
    }, {});
  }

  calculateUptimePercentage(device) {
    // Simplified uptime calculation
    // In real implementation, track connection history
    const now = new Date();
    const lastHeartbeat = device.lastHeartbeat || new Date(0);
    const hoursSinceHeartbeat = (now - lastHeartbeat) / (1000 * 60 * 60);
    
    if (hoursSinceHeartbeat < 1) return 100;
    if (hoursSinceHeartbeat < 24) return 90;
    return 75;
  }

  calculateDataQuality(recentData) {
    if (!recentData.length) return 0;
    
    const avgQuality = recentData.reduce((sum, d) => sum + (d.qualityScore || 0), 0) / recentData.length;
    return Math.round(avgQuality);
  }

  initializeServices() {
    // Initialize background services
    setInterval(() => {
      this.cleanupOldData();
    }, 24 * 60 * 60 * 1000); // Daily cleanup

    setInterval(() => {
      this.checkDeviceHealth();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  async cleanupOldData() {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90); // Keep 90 days of data
      
      await IoTSensorData.destroy({
        where: {
          timestamp: { [Op.lt]: cutoffDate },
          archiveStatus: 'active'
        }
      });
      
      console.log('Old IoT data cleaned up');
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }

  async checkDeviceHealth() {
    try {
      const devices = await IoTDevice.findAll({
        where: { isActive: true }
      });

      const now = new Date();
      const offlineThreshold = 5 * 60 * 1000; // 5 minutes

      for (const device of devices) {
        if (device.lastHeartbeat) {
          const timeSinceHeartbeat = now - device.lastHeartbeat;
          
          if (timeSinceHeartbeat > offlineThreshold && device.deviceStatus === 'online') {
            await device.update({ deviceStatus: 'offline' });
            
            this.emit('deviceOffline', {
              deviceId: device.deviceId,
              deviceName: device.deviceName,
              lastHeartbeat: device.lastHeartbeat
            });
          }
        }
      }
    } catch (error) {
      console.error('Device health check error:', error);
    }
  }

  // Additional helper methods would be implemented here
  // For brevity, showing the structure

  getConnectionInfo(device) {
    return {
      protocol: device.protocolType,
      mqttTopic: device.mqttTopic,
      apiEndpoint: `/api/iot/devices/${device.deviceId}/data`
    };
  }

  async getComplianceSummary(institutionId, startDate) {
    // Implementation for compliance summary
    return { overallScore: 85 };
  }

  async getAlertStatistics(institutionId, startDate) {
    // Implementation for alert statistics
    return { active: 5 };
  }

  async getPerformanceMetrics(institutionId, startDate) {
    // Implementation for performance metrics
    return { avgUptime: 95, avgDataQuality: 88 };
  }

  async getRecentEvents(institutionId, startDate) {
    // Implementation for recent events
    return [];
  }

  async getComplianceTrends(institutionId, startDate) {
    // Implementation for compliance trends
    return [];
  }

  async getViolationAnalysis(institutionId, startDate) {
    // Implementation for violation analysis
    return [];
  }

  async getFrameworkCompliance(institutionId, startDate) {
    // Implementation for framework compliance
    return {};
  }

  async getPredictiveCompliance(institutionId, startDate) {
    // Implementation for predictive compliance
    return {};
  }
}

module.exports = new IoTService();