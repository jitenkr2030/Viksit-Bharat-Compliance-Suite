const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const sequelize = require('../../config/database').sequelize;
const GovernmentPortalIntegration = require('../../models/GovernmentPortalIntegration');
const User = require('../../models/User');
const Organization = require('../../models/Organization');

// Get all government portal integrations
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      portalType,
      healthStatus,
      userId,
      organizationId,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const whereClause = {};
    
    if (status) whereClause.status = status;
    if (portalType) whereClause.portalType = portalType;
    if (healthStatus) whereClause.healthStatus = healthStatus;
    if (userId) whereClause.userId = userId;
    if (organizationId) whereClause.organizationId = organizationId;

    const integrations = await GovernmentPortalIntegration.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Organization,
          as: 'organization',
          attributes: ['id', 'name', 'registrationNumber']
        }
      ],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [[sortBy, sortOrder.toUpperCase()]]
    });

    res.json({
      success: true,
      data: integrations.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(integrations.count / parseInt(limit)),
        totalItems: integrations.count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching government portal integrations',
      error: error.message
    });
  }
});

// Get government portal integration by ID
router.get('/:id', async (req, res) => {
  try {
    const integration = await GovernmentPortalIntegration.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Organization,
          as: 'organization',
          attributes: ['id', 'name', 'registrationNumber']
        }
      ]
    });

    if (!integration) {
      return res.status(404).json({
        success: false,
        message: 'Government portal integration not found'
      });
    }

    res.json({
      success: true,
      data: integration
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching government portal integration',
      error: error.message
    });
  }
});

// Create new government portal integration
router.post('/', [
  body('userId').isUUID().withMessage('Valid user ID is required'),
  body('organizationId').isUUID().withMessage('Valid organization ID is required'),
  body('integrationName').notEmpty().withMessage('Integration name is required'),
  body('portalType').isIn([
    'mca21', 
    'gst_portal', 
    'income_tax', 
    'esic', 
    'epf',
    'pfms',
    'gem',
    'msme',
    'dpiit',
    'startup_india',
    'other'
  ]).withMessage('Invalid portal type'),
  body('portalUrl').isURL().withMessage('Valid portal URL is required'),
  body('apiEndpoint').optional().isURL().withMessage('API endpoint must be a valid URL'),
  body('authenticationType').isIn(['api_key', 'oauth2', 'certificate', 'basic_auth', 'none']).withMessage('Invalid authentication type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const integrationData = {
      ...req.body,
      healthStatus: 'unknown',
      syncStatus: 'idle'
    };

    const integration = await GovernmentPortalIntegration.create(integrationData);

    const integrationWithRelations = await GovernmentPortalIntegration.findByPk(integration.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Organization,
          as: 'organization',
          attributes: ['id', 'name', 'registrationNumber']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Government portal integration created successfully',
      data: integrationWithRelations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating government portal integration',
      error: error.message
    });
  }
});

// Update government portal integration
router.put('/:id', [
  body('integrationName').optional().notEmpty().withMessage('Integration name cannot be empty'),
  body('portalType').optional().isIn([
    'mca21', 
    'gst_portal', 
    'income_tax', 
    'esic', 
    'epf',
    'pfms',
    'gem',
    'msme',
    'dpiit',
    'startup_india',
    'other'
  ]).withMessage('Invalid portal type'),
  body('status').optional().isIn(['active', 'inactive', 'testing', 'error', 'maintenance']).withMessage('Invalid status'),
  body('healthStatus').optional().isIn(['healthy', 'degraded', 'unhealthy', 'unknown']).withMessage('Invalid health status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const integration = await GovernmentPortalIntegration.findByPk(req.params.id);
    if (!integration) {
      return res.status(404).json({
        success: false,
        message: 'Government portal integration not found'
      });
    }

    await integration.update({
      ...req.body,
      lastUpdated: new Date()
    });

    const updatedIntegration = await GovernmentPortalIntegration.findByPk(integration.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Organization,
          as: 'organization',
          attributes: ['id', 'name', 'registrationNumber']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Government portal integration updated successfully',
      data: updatedIntegration
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating government portal integration',
      error: error.message
    });
  }
});

// Delete government portal integration
router.delete('/:id', async (req, res) => {
  try {
    const integration = await GovernmentPortalIntegration.findByPk(req.params.id);
    if (!integration) {
      return res.status(404).json({
        success: false,
        message: 'Government portal integration not found'
      });
    }

    await integration.destroy();

    res.json({
      success: true,
      message: 'Government portal integration deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting government portal integration',
      error: error.message
    });
  }
});

// Test portal connection
router.post('/:id/test-connection', async (req, res) => {
  try {
    const integration = await GovernmentPortalIntegration.findByPk(req.params.id);
    if (!integration) {
      return res.status(404).json({
        success: false,
        message: 'Government portal integration not found'
      });
    }

    // Update connection attempt counter
    const newAttempts = integration.connectionAttempts + 1;
    await integration.update({
      connectionAttempts: newAttempts,
      lastHealthCheck: new Date()
    });

    // Simulate connection test (in real scenario, this would test actual API connectivity)
    const isSuccessful = Math.random() > 0.2; // 80% success rate
    const responseTime = Math.floor(Math.random() * 2000) + 500; // 500-2500ms

    const updateData = {
      healthStatus: isSuccessful ? 'healthy' : 'unhealthy',
      lastSuccessfulConnection: isSuccessful ? new Date() : integration.lastSuccessfulConnection,
      averageResponseTime: Math.round((integration.averageResponseTime + responseTime) / 2)
    };

    if (isSuccessful) {
      updateData.successfulAttempts = integration.successfulAttempts + 1;
    } else {
      updateData.failedAttempts = integration.failedAttempts + 1;
    }

    await integration.update(updateData);

    const testedIntegration = await GovernmentPortalIntegration.findByPk(integration.id);

    res.json({
      success: true,
      message: isSuccessful ? 'Connection test successful' : 'Connection test failed',
      data: {
        integration: testedIntegration,
        testResult: {
          successful: isSuccessful,
          responseTime: responseTime,
          timestamp: new Date()
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error testing connection',
      error: error.message
    });
  }
});

// Sync data with portal
router.post('/:id/sync', async (req, res) => {
  try {
    const integration = await GovernmentPortalIntegration.findByPk(req.params.id);
    if (!integration) {
      return res.status(404).json({
        success: false,
        message: 'Government portal integration not found'
      });
    }

    if (integration.healthStatus !== 'healthy') {
      return res.status(400).json({
        success: false,
        message: 'Cannot sync with unhealthy integration'
      });
    }

    if (integration.syncStatus === 'syncing') {
      return res.status(400).json({
        success: false,
        message: 'Sync already in progress'
      });
    }

    // Update sync status
    await integration.update({
      syncStatus: 'syncing',
      lastSyncDate: new Date()
    });

    // Simulate data sync (in real scenario, this would perform actual data synchronization)
    const mockSyncResult = {
      recordsProcessed: Math.floor(Math.random() * 1000) + 100,
      recordsUpdated: Math.floor(Math.random() * 100) + 10,
      recordsCreated: Math.floor(Math.random() * 50) + 5,
      recordsFailed: Math.floor(Math.random() * 10),
      syncDuration: Math.floor(Math.random() * 60) + 10, // seconds
      nextSyncDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    };

    // Update integration with sync results
    await integration.update({
      syncStatus: 'completed',
      totalFilings: integration.totalFilings + mockSyncResult.recordsCreated + mockSyncResult.recordsUpdated,
      successfulFilings: integration.successfulFilings + mockSyncResult.recordsCreated + mockSyncResult.recordsUpdated,
      syncErrors: mockSyncResult.recordsFailed > 0 ? {
        failedRecords: mockSyncResult.recordsFailed,
        lastError: `Failed to sync ${mockSyncResult.recordsFailed} records`
      } : null
    });

    const syncedIntegration = await GovernmentPortalIntegration.findByPk(integration.id);

    res.json({
      success: true,
      message: 'Data synchronization completed successfully',
      data: {
        integration: syncedIntegration,
        syncResult: mockSyncResult
      }
    });
  } catch (error) {
    // Update sync status to failed on error
    await GovernmentPortalIntegration.update(
      { syncStatus: 'failed' },
      { where: { id: req.params.id } }
    );

    res.status(500).json({
      success: false,
      message: 'Error synchronizing data',
      error: error.message
    });
  }
});

// Auto-file documents
router.post('/:id/auto-file', [
  body('filingType').notEmpty().withMessage('Filing type is required'),
  body('filingData').isObject().withMessage('Filing data must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const integration = await GovernmentPortalIntegration.findByPk(req.params.id);
    if (!integration) {
      return res.status(404).json({
        success: false,
        message: 'Government portal integration not found'
      });
    }

    if (!integration.autoFilingEnabled) {
      return res.status(400).json({
        success: false,
        message: 'Auto-filing is not enabled for this integration'
      });
    }

    if (integration.healthStatus !== 'healthy') {
      return res.status(400).json({
        success: false,
        message: 'Cannot file with unhealthy integration'
      });
    }

    // Simulate auto-filing (in real scenario, this would submit actual filings)
    const mockFilingResult = {
      filingId: `FIL${Date.now()}`,
      filingType: req.body.filingType,
      status: 'submitted',
      submissionDate: new Date(),
      confirmationNumber: `CONF${Math.floor(Math.random() * 1000000)}`,
      expectedProcessingTime: '2-5 business days'
    };

    // Update filing counters
    await integration.update({
      totalFilings: integration.totalFilings + 1,
      successfulFilings: integration.successfulFilings + 1,
      pendingFilings: integration.pendingFilings + 1
    });

    const updatedIntegration = await GovernmentPortalIntegration.findByPk(integration.id);

    res.json({
      success: true,
      message: 'Auto-filing submitted successfully',
      data: {
        integration: updatedIntegration,
        filing: mockFilingResult
      }
    });
  } catch (error) {
    // Update failed filing counter
    await GovernmentPortalIntegration.update(
      { 
        totalFilings: sequelize.literal('total_filings + 1'),
        failedFilings: sequelize.literal('failed_filings + 1')
      },
      { where: { id: req.params.id } }
    );

    res.status(500).json({
      success: false,
      message: 'Error submitting auto-filing',
      error: error.message
    });
  }
});

// Get integration statistics
router.get('/statistics/overview', async (req, res) => {
  try {
    const { organizationId, userId } = req.query;
    
    const whereClause = {};
    if (organizationId) whereClause.organizationId = organizationId;
    if (userId) whereClause.userId = userId;

    const [
      totalIntegrations,
      activeIntegrations,
      inactiveIntegrations,
      testingIntegrations,
      errorIntegrations,
      healthyIntegrations,
      unhealthyIntegrations,
      totalFilings,
      successfulFilings,
      failedFilings,
      pendingFilings,
      avgResponseTime
    ] = await Promise.all([
      GovernmentPortalIntegration.count({ where: whereClause }),
      GovernmentPortalIntegration.count({ where: { ...whereClause, status: 'active' } }),
      GovernmentPortalIntegration.count({ where: { ...whereClause, status: 'inactive' } }),
      GovernmentPortalIntegration.count({ where: { ...whereClause, status: 'testing' } }),
      GovernmentPortalIntegration.count({ where: { ...whereClause, status: 'error' } }),
      GovernmentPortalIntegration.count({ where: { ...whereClause, healthStatus: 'healthy' } }),
      GovernmentPortalIntegration.count({ where: { ...whereClause, healthStatus: 'unhealthy' } }),
      GovernmentPortalIntegration.sum('totalFilings', { where: whereClause }),
      GovernmentPortalIntegration.sum('successfulFilings', { where: whereClause }),
      GovernmentPortalIntegration.sum('failedFilings', { where: whereClause }),
      GovernmentPortalIntegration.sum('pendingFilings', { where: whereClause }),
      GovernmentPortalIntegration.findAll({
        where: { ...whereClause, averageResponseTime: { [Op.not]: null } },
        attributes: [[sequelize.fn('AVG', sequelize.col('averageResponseTime')), 'avgResponseTime']]
      })
    ]);

    res.json({
      success: true,
      data: {
        totalIntegrations,
        activeIntegrations,
        inactiveIntegrations,
        testingIntegrations,
        errorIntegrations,
        healthyIntegrations,
        unhealthyIntegrations,
        totalFilings: totalFilings || 0,
        successfulFilings: successfulFilings || 0,
        failedFilings: failedFilings || 0,
        pendingFilings: pendingFilings || 0,
        avgResponseTime: avgResponseTime[0]?.avgResponseTime || 0,
        healthRate: totalIntegrations > 0 ? ((healthyIntegrations / totalIntegrations) * 100).toFixed(2) : 0,
        successRate: totalFilings > 0 ? ((successfulFilings / totalFilings) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching integration statistics',
      error: error.message
    });
  }
});

// Get integrations by portal type
router.get('/portal-type/:portalType', async (req, res) => {
  try {
    const { portalType } = req.params;
    const {
      page = 1,
      limit = 10,
      organizationId,
      userId,
      status,
      healthStatus,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const whereClause = { portalType };
    if (organizationId) whereClause.organizationId = organizationId;
    if (userId) whereClause.userId = userId;
    if (status) whereClause.status = status;
    if (healthStatus) whereClause.healthStatus = healthStatus;

    const integrations = await GovernmentPortalIntegration.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Organization,
          as: 'organization',
          attributes: ['id', 'name', 'registrationNumber']
        }
      ],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [[sortBy, sortOrder.toUpperCase()]]
    });

    res.json({
      success: true,
      data: integrations.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(integrations.count / parseInt(limit)),
        totalItems: integrations.count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching integrations by portal type',
      error: error.message
    });
  }
});

// Get unhealthy integrations
router.get('/unhealthy', async (req, res) => {
  try {
    const { organizationId, userId } = req.query;
    
    const whereClause = {
      healthStatus: { [Op.in]: ['unhealthy', 'degraded'] }
    };
    
    if (organizationId) whereClause.organizationId = organizationId;
    if (userId) whereClause.userId = userId;

    const unhealthyIntegrations = await GovernmentPortalIntegration.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Organization,
          as: 'organization',
          attributes: ['id', 'name', 'registrationNumber']
        }
      ],
      order: [['lastHealthCheck', 'ASC']]
    });

    res.json({
      success: true,
      data: unhealthyIntegrations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching unhealthy integrations',
      error: error.message
    });
  }
});

// Bulk health check
router.post('/bulk-health-check', async (req, res) => {
  try {
    const { integrationIds, organizationId, userId } = req.body;
    
    const whereClause = {};
    if (integrationIds && integrationIds.length > 0) {
      whereClause.id = { [Op.in]: integrationIds };
    }
    if (organizationId) whereClause.organizationId = organizationId;
    if (userId) whereClause.userId = userId;

    const integrations = await GovernmentPortalIntegration.findAll({ where: whereClause });
    
    const results = [];
    
    for (const integration of integrations) {
      // Simulate health check for each integration
      const isHealthy = Math.random() > 0.3; // 70% success rate
      const responseTime = Math.floor(Math.random() * 3000) + 500;
      
      await integration.update({
        healthStatus: isHealthy ? 'healthy' : 'unhealthy',
        lastHealthCheck: new Date(),
        averageResponseTime: Math.round((integration.averageResponseTime + responseTime) / 2),
        connectionAttempts: integration.connectionAttempts + 1,
        ...(isHealthy && { successfulAttempts: integration.successfulAttempts + 1 }),
        ...(!isHealthy && { failedAttempts: integration.failedAttempts + 1 })
      });
      
      results.push({
        integrationId: integration.id,
        integrationName: integration.integrationName,
        healthStatus: isHealthy ? 'healthy' : 'unhealthy',
        responseTime: responseTime,
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Bulk health check completed',
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error performing bulk health check',
      error: error.message
    });
  }
});

// Update integration status
router.patch('/:id/status', [
  body('status').isIn(['active', 'inactive', 'testing', 'error', 'maintenance']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const integration = await GovernmentPortalIntegration.findByPk(req.params.id);
    if (!integration) {
      return res.status(404).json({
        success: false,
        message: 'Government portal integration not found'
      });
    }

    await integration.update({
      status: req.body.status,
      lastUpdated: new Date()
    });

    const updatedIntegration = await GovernmentPortalIntegration.findByPk(integration.id);

    res.json({
      success: true,
      message: 'Integration status updated successfully',
      data: updatedIntegration
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating integration status',
      error: error.message
    });
  }
});

module.exports = router;