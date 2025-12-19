const express = require('express');
const router = express.Router();
const IoTService = require('../services/IoTService');
const IoTDevice = require('../models/IoTDevice');
const IoTSensorData = require('../models/IoTSensorData');

// Register new IoT device
router.post('/devices/register', async (req, res) => {
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
      institutionId
    } = req.body;

    if (!deviceName || !deviceType || !complianceFramework || !institutionId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: deviceName, deviceType, complianceFramework, institutionId'
      });
    }

    const result = await IoTService.registerDevice({
      deviceId,
      deviceName,
      deviceType,
      deviceModel,
      locationId,
      complianceFramework,
      sensorConfig,
      thresholds,
      userId: req.user.id,
      institutionId
    });

    res.json({
      success: true,
      message: 'IoT device registered successfully',
      data: result
    });
  } catch (error) {
    console.error('Register IoT device error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register IoT device',
      error: error.message
    });
  }
});

// Get all IoT devices for an institution
router.get('/devices/:institutionId', async (req, res) => {
  try {
    const { institutionId } = req.params;
    const {
      page = 1,
      limit = 20,
      deviceType,
      status,
      complianceFramework,
      criticalityLevel,
      search
    } = req.query;

    const result = await IoTDevice.searchDevices(search, {
      deviceType,
      locationId: institutionId, // Using institutionId as locationId
      complianceFramework,
      status,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    // Add health information to each device
    const devicesWithHealth = await Promise.all(
      result.rows.map(async (device) => {
        const healthInfo = await IoTService.getDeviceStatus(device.deviceId);
        return {
          ...device.toJSON(),
          health: {
            status: healthInfo.currentStatus,
            score: healthInfo.healthScore,
            uptime: healthInfo.uptimePercentage,
            lastReading: healthInfo.lastReading
          }
        };
      })
    );

    res.json({
      success: true,
      data: {
        devices: devicesWithHealth,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: result.count,
          pages: Math.ceil(result.count / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get IoT devices error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get IoT devices',
      error: error.message
    });
  }
});

// Get specific device details
router.get('/devices/device/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;

    const device = await IoTDevice.findOne({ where: { deviceId } });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'IoT device not found'
      });
    }

    const status = await IoTService.getDeviceStatus(deviceId);

    res.json({
      success: true,
      data: {
        device: device.toJSON(),
        status,
        connectionInfo: IoTService.getConnectionInfo(device)
      }
    });
  } catch (error) {
    console.error('Get IoT device error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get IoT device',
      error: error.message
    });
  }
});

// Update device configuration
router.put('/devices/device/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const {
      deviceName,
      sensorConfig,
      thresholds,
      samplingInterval,
      alertEnabled
    } = req.body;

    const device = await IoTDevice.findOne({ where: { deviceId } });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'IoT device not found'
      });
    }

    const updateData = {};
    if (deviceName) updateData.deviceName = deviceName;
    if (sensorConfig) updateData.sensorConfig = sensorConfig;
    if (samplingInterval) updateData.samplingInterval = samplingInterval;
    if (alertEnabled !== undefined) updateData.alertEnabled = alertEnabled;

    await device.update(updateData);

    // Update thresholds if provided
    if (thresholds) {
      await IoTService.configureThresholds(deviceId, thresholds);
    }

    res.json({
      success: true,
      message: 'Device configuration updated successfully',
      data: device.toJSON()
    });
  } catch (error) {
    console.error('Update IoT device error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update device configuration',
      error: error.message
    });
  }
});

// Submit sensor data
router.post('/devices/device/:deviceId/data', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const sensorData = req.body;

    if (!sensorData.value && sensorData.value !== 0) {
      return res.status(400).json({
        success: false,
        message: 'Sensor value is required'
      });
    }

    const result = await IoTService.processSensorData(deviceId, sensorData);

    res.json({
      success: true,
      message: 'Sensor data processed successfully',
      data: result
    });
  } catch (error) {
    console.error('Submit sensor data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process sensor data',
      error: error.message
    });
  }
});

// Get device sensor data
router.get('/devices/device/:deviceId/data', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const {
      startDate,
      endDate,
      limit = 100,
      offset = 0
    } = req.query;

    const device = await IoTDevice.findOne({ where: { deviceId } });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'IoT device not found'
      });
    }

    const data = await IoTSensorData.findByDevice(device.id, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: 'DESC'
    });

    res.json({
      success: true,
      data: {
        device: device.toJSON(),
        sensorData: data,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      }
    });
  } catch (error) {
    console.error('Get sensor data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get sensor data',
      error: error.message
    });
  }
});

// Configure device thresholds
router.put('/devices/device/:deviceId/thresholds', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { thresholds } = req.body;

    if (!thresholds) {
      return res.status(400).json({
        success: false,
        message: 'Thresholds configuration is required'
      });
    }

    const result = await IoTService.configureThresholds(deviceId, thresholds);

    res.json({
      success: true,
      message: 'Thresholds configured successfully',
      data: result
    });
  } catch (error) {
    console.error('Configure thresholds error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to configure thresholds',
      error: error.message
    });
  }
});

// Get IoT dashboard data
router.get('/dashboard/:institutionId', async (req, res) => {
  try {
    const { institutionId } = req.params;
    const {
      timeframe = '24h',
      deviceTypes,
      complianceFrameworks,
      criticalityLevels
    } = req.query;

    const filters = {
      timeframe,
      deviceTypes: deviceTypes ? deviceTypes.split(',') : undefined,
      complianceFrameworks: complianceFrameworks ? complianceFrameworks.split(',') : undefined,
      criticalityLevels: criticalityLevels ? criticalityLevels.split(',') : undefined
    };

    const dashboardData = await IoTService.getDashboardData(institutionId, filters);

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Get IoT dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get IoT dashboard data',
      error: error.message
    });
  }
});

// Get device statistics
router.get('/statistics/:institutionId', async (req, res) => {
  try {
    const { institutionId } = req.params;

    const stats = await IoTDevice.getDeviceStatistics();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get IoT statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get IoT statistics',
      error: error.message
    });
  }
});

// Get compliance analytics
router.get('/compliance/:institutionId', async (req, res) => {
  try {
    const { institutionId } = req.params;
    const { period = '30d' } = req.query;

    const analytics = await IoTService.getComplianceAnalytics(institutionId, period);

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Get compliance analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get compliance analytics',
      error: error.message
    });
  }
});

// Get device alerts
router.get('/devices/device/:deviceId/alerts', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const {
      startDate,
      endDate,
      limit = 50,
      offset = 0
    } = req.query;

    const device = await IoTDevice.findOne({ where: { deviceId } });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'IoT device not found'
      });
    }

    const alerts = await IoTSensorData.findAlerts({
      deviceId: device.id,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('Get device alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get device alerts',
      error: error.message
    });
  }
});

// Deactivate device
router.post('/devices/device/:deviceId/deactivate', async (req, res) => {
  try {
    const { deviceId } = req.params;

    const device = await IoTDevice.findOne({ where: { deviceId } });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'IoT device not found'
      });
    }

    await device.update({
      isActive: false,
      deviceStatus: 'offline'
    });

    res.json({
      success: true,
      message: 'Device deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate device error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate device',
      error: error.message
    });
  }
});

// Reactivate device
router.post('/devices/device/:deviceId/reactivate', async (req, res) => {
  try {
    const { deviceId } = req.params;

    const device = await IoTDevice.findOne({ where: { deviceId } });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'IoT device not found'
      });
    }

    await device.update({
      isActive: true,
      deviceStatus: 'unknown'
    });

    res.json({
      success: true,
      message: 'Device reactivated successfully'
    });
  } catch (error) {
    console.error('Reactivate device error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reactivate device',
      error: error.message
    });
  }
});

// Get device types
router.get('/device-types', async (req, res) => {
  try {
    const deviceTypes = [
      {
        id: 'environmental_sensor',
        name: 'Environmental Sensor',
        description: 'Temperature, humidity, and air quality monitoring',
        categories: ['environmental', 'safety'],
        supportedMetrics: ['temperature', 'humidity', 'air_quality', 'pressure']
      },
      {
        id: 'air_quality_monitor',
        name: 'Air Quality Monitor',
        description: 'PM2.5, PM10, CO2, and VOC monitoring',
        categories: ['environmental', 'health'],
        supportedMetrics: ['pm25', 'pm10', 'co2', 'voc', 'air_quality_index']
      },
      {
        id: 'noise_level_sensor',
        name: 'Noise Level Sensor',
        description: 'Sound level and noise pollution monitoring',
        categories: ['environmental', 'safety'],
        supportedMetrics: ['decibel_level', 'noise_pollution', 'frequency_analysis']
      },
      {
        id: 'water_quality_sensor',
        name: 'Water Quality Sensor',
        description: 'pH, turbidity, and chemical contamination monitoring',
        categories: ['environmental', 'health'],
        supportedMetrics: ['ph', 'turbidity', 'conductivity', 'dissolved_oxygen']
      },
      {
        id: 'fire_detection_system',
        name: 'Fire Detection System',
        description: 'Smoke, heat, and flame detection',
        categories: ['safety', 'emergency'],
        supportedMetrics: ['smoke_level', 'temperature_rise', 'flame_detection']
      },
      {
        id: 'access_control_sensor',
        name: 'Access Control Sensor',
        description: 'Door, gate, and entry monitoring',
        categories: ['security', 'access'],
        supportedMetrics: ['door_status', 'access_attempts', 'badge_scans']
      },
      {
        id: 'lighting_control',
        name: 'Lighting Control',
        description: 'Light levels and energy consumption monitoring',
        categories: ['energy', 'comfort'],
        supportedMetrics: ['light_level', 'energy_consumption', 'occupancy']
      },
      {
        id: 'hvac_sensor',
        name: 'HVAC Sensor',
        description: 'Heating, ventilation, and air conditioning monitoring',
        categories: ['environmental', 'energy'],
        supportedMetrics: ['temperature', 'airflow', 'filter_status', 'energy_use']
      },
      {
        id: 'security_camera',
        name: 'Security Camera',
        description: 'Video surveillance and motion detection',
        categories: ['security', 'safety'],
        supportedMetrics: ['motion_detected', 'recording_status', 'storage_usage']
      },
      {
        id: 'occupancy_sensor',
        name: 'Occupancy Sensor',
        description: 'People counting and space utilization',
        categories: ['operations', 'energy'],
        supportedMetrics: ['occupancy_count', 'space_utilization', 'traffic_pattern']
      },
      {
        id: 'energy_meter',
        name: 'Energy Meter',
        description: 'Electrical power consumption monitoring',
        categories: ['energy', 'operations'],
        supportedMetrics: ['power_consumption', 'voltage', 'current', 'power_factor']
      },
      {
        id: 'parking_sensor',
        name: 'Parking Sensor',
        description: 'Vehicle detection and parking space monitoring',
        categories: ['operations', 'traffic'],
        supportedMetrics: ['space_occupied', 'parking_duration', 'traffic_flow']
      },
      {
        id: 'emergency_button',
        name: 'Emergency Button',
        description: 'Panic button and emergency alert system',
        categories: ['safety', 'emergency'],
        supportedMetrics: ['button_pressed', 'response_time', 'location']
      },
      {
        id: 'compliance_monitor',
        name: 'Compliance Monitor',
        description: 'Direct compliance requirement monitoring',
        categories: ['compliance', 'regulatory'],
        supportedMetrics: ['compliance_status', 'threshold_breach', 'regulatory_violation']
      }
    ];

    res.json({
      success: true,
      data: deviceTypes
    });
  } catch (error) {
    console.error('Get device types error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get device types',
      error: error.message
    });
  }
});

// Get devices needing maintenance
router.get('/maintenance/:institutionId', async (req, res) => {
  try {
    const { institutionId } = req.params;

    const devicesNeedingMaintenance = await IoTDevice.findDevicesNeedingMaintenance();

    // Filter by institution
    const filteredDevices = devicesNeedingMaintenance.filter(device => 
      device.institutionId === institutionId
    );

    res.json({
      success: true,
      data: filteredDevices
    });
  } catch (error) {
    console.error('Get maintenance devices error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get devices needing maintenance',
      error: error.message
    });
  }
});

// Bulk device operations
router.post('/devices/bulk-operations', async (req, res) => {
  try {
    const { operation, deviceIds, data } = req.body;

    if (!operation || !deviceIds || !Array.isArray(deviceIds)) {
      return res.status(400).json({
        success: false,
        message: 'Operation and deviceIds array are required'
      });
    }

    const results = {
      successful: 0,
      failed: 0,
      errors: []
    };

    for (const deviceId of deviceIds) {
      try {
        const device = await IoTDevice.findOne({ where: { deviceId } });
        
        if (!device) {
          results.failed++;
          results.errors.push({ deviceId, error: 'Device not found' });
          continue;
        }

        switch (operation) {
          case 'activate':
            await device.update({ isActive: true, deviceStatus: 'unknown' });
            break;
          case 'deactivate':
            await device.update({ isActive: false, deviceStatus: 'offline' });
            break;
          case 'update_config':
            if (data.sensorConfig) {
              await device.update({ sensorConfig: data.sensorConfig });
            }
            break;
          case 'update_thresholds':
            if (data.thresholds) {
              await IoTService.configureThresholds(deviceId, data.thresholds);
            }
            break;
          default:
            results.failed++;
            results.errors.push({ deviceId, error: 'Invalid operation' });
            continue;
        }

        results.successful++;
      } catch (error) {
        results.failed++;
        results.errors.push({ deviceId, error: error.message });
      }
    }

    res.json({
      success: true,
      message: `Bulk operation completed: ${results.successful} successful, ${results.failed} failed`,
      data: results
    });
  } catch (error) {
    console.error('Bulk operations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk operations',
      error: error.message
    });
  }
});

// Export sensor data
router.post('/export/:institutionId', async (req, res) => {
  try {
    const { institutionId } = req.params;
    const {
      format = 'json',
      startDate,
      endDate,
      deviceIds = [],
      metrics = []
    } = req.body;

    // Get devices for the institution
    const devices = await IoTDevice.findAll({
      where: { 
        institutionId,
        ...(deviceIds.length > 0 && { deviceId: { [Op.in]: deviceIds } })
      }
    });

    const exportData = [];

    for (const device of devices) {
      const sensorData = await IoTSensorData.findByDevice(device.id, {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        limit: 10000, // Large limit for export
        order: 'ASC'
      });

      sensorData.forEach(data => {
        exportData.push({
          deviceId: device.deviceId,
          deviceName: device.deviceName,
          deviceType: device.deviceType,
          timestamp: data.timestamp,
          value: data.value,
          unit: data.unit,
          complianceStatus: data.complianceStatus,
          thresholdStatus: data.thresholdStatus,
          alertGenerated: data.alertGenerated,
          qualityScore: data.qualityScore
        });
      });
    }

    res.json({
      success: true,
      message: 'Sensor data exported successfully',
      data: {
        format,
        recordCount: exportData.length,
        exportedAt: new Date(),
        devicesIncluded: devices.length,
        dateRange: { startDate, endDate },
        data: exportData
      }
    });
  } catch (error) {
    console.error('Export sensor data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export sensor data',
      error: error.message
    });
  }
});

module.exports = router;