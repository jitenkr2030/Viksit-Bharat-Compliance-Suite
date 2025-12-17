// Phase 4: Autonomous System Routes

const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const AutonomousSystemService = require('../services/AutonomousSystemService');
const { authenticateToken } = require('../middleware/auth');
const { authorize } = require('../middleware/authorization');
const { validateRequest } = require('../middleware/validation');

// ========================================
// MIDDLEWARE
// ========================================

// All routes require authentication
router.use(authenticateToken);

// ========================================
// VALIDATION MIDDLEWARE
// ========================================

const validateSystemCreation = [
  body('systemName')
    .notEmpty()
    .withMessage('System name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('System name must be between 3 and 100 characters'),
    
  body('systemType')
    .isIn([
      'compliance_monitor',
      'risk_predictor',
      'auto_healer',
      'decision_engine',
      'workflow_orchestrator',
      'quality_assurance',
      'performance_optimizer'
    ])
    .withMessage('Invalid system type'),
    
  body('autonomyLevel')
    .isIn(['assisted', 'semi_autonomous', 'fully_autonomous', 'super_autonomous'])
    .withMessage('Invalid autonomy level'),
    
  body('supervisorId')
    .optional()
    .isUUID()
    .withMessage('Invalid supervisor ID'),
    
  body('institutionId')
    .optional()
    .isUUID()
    .withMessage('Invalid institution ID'),
];

const validateSystemUpdate = [
  body('systemName')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('System name must be between 3 and 100 characters'),
    
  body('autonomyLevel')
    .optional()
    .isIn(['assisted', 'semi_autonomous', 'fully_autonomous', 'super_autonomous'])
    .withMessage('Invalid autonomy level'),
    
  body('status')
    .optional()
    .isIn(['inactive', 'initializing', 'active', 'learning', 'optimizing', 'maintenance', 'error'])
    .withMessage('Invalid status'),
];

const validateCapabilityUpdate = [
  body('capabilities')
    .isObject()
    .withMessage('Capabilities must be an object'),
    
  body('capabilities.autoDetection')
    .optional()
    .isBoolean()
    .withMessage('autoDetection must be a boolean'),
    
  body('capabilities.autoResolution')
    .optional()
    .isBoolean()
    .withMessage('autoResolution must be a boolean'),
    
  body('capabilities.predictiveAnalysis')
    .optional()
    .isBoolean()
    .withMessage('predictiveAnalysis must be a boolean'),
    
  body('capabilities.selfLearning')
    .optional()
    .isBoolean()
    .withMessage('selfLearning must be a boolean'),
    
  body('capabilities.adaptiveResponse')
    .optional()
    .isBoolean()
    .withMessage('adaptiveResponse must be a boolean'),
    
  body('capabilities.continuousOptimization')
    .optional()
    .isBoolean()
    .withMessage('continuousOptimization must be a boolean'),
];

const validateQueryFilters = [
  query('systemType')
    .optional()
    .isIn([
      'compliance_monitor',
      'risk_predictor',
      'auto_healer',
      'decision_engine',
      'workflow_orchestrator',
      'quality_assurance',
      'performance_optimizer'
    ])
    .withMessage('Invalid system type filter'),
    
  query('status')
    .optional()
    .isIn(['inactive', 'initializing', 'active', 'learning', 'optimizing', 'maintenance', 'error'])
    .withMessage('Invalid status filter'),
    
  query('autonomyLevel')
    .optional()
    .isIn(['assisted', 'semi_autonomous', 'fully_autonomous', 'super_autonomous'])
    .withMessage('Invalid autonomy level filter'),
    
  query('minHealthScore')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('minHealthScore must be between 0 and 100'),
];

const validateUUID = [
  param('id')
    .isUUID()
    .withMessage('Invalid system ID'),
];

// ========================================
// SYSTEM MANAGEMENT ROUTES
// ========================================

// Create new autonomous system
router.post('/', 
  authorize(['admin', 'system_admin', 'compliance_officer']),
  validateSystemCreation,
  validateRequest,
  async (req, res) => {
    try {
      const systemData = {
        ...req.body,
        supervisorId: req.body.supervisorId || req.user.id,
      };
      
      const system = await AutonomousSystemService.createSystem(systemData);
      
      res.status(201).json({
        success: true,
        message: 'Autonomous system created successfully',
        data: system,
      });
    } catch (error) {
      console.error('Error creating autonomous system:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create autonomous system',
        error: error.message,
      });
    }
  }
);

// Get all autonomous systems
router.get('/', 
  authorize(['admin', 'system_admin', 'compliance_officer', 'viewer']),
  validateQueryFilters,
  validateRequest,
  async (req, res) => {
    try {
      const filters = req.query;
      const systems = await AutonomousSystemService.getAllSystems(filters);
      
      res.json({
        success: true,
        data: systems,
        pagination: {
          total: systems.length,
          filters: filters,
        },
      });
    } catch (error) {
      console.error('Error getting autonomous systems:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get autonomous systems',
        error: error.message,
      });
    }
  }
);

// Get specific autonomous system
router.get('/:id',
  authorize(['admin', 'system_admin', 'compliance_officer', 'viewer']),
  validateUUID,
  validateRequest,
  async (req, res) => {
    try {
      const system = await AutonomousSystemService.getSystem(req.params.id);
      
      res.json({
        success: true,
        data: system,
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'Autonomous system not found',
        });
      }
      
      console.error('Error getting autonomous system:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get autonomous system',
        error: error.message,
      });
    }
  }
);

// Update autonomous system
router.put('/:id',
  authorize(['admin', 'system_admin', 'compliance_officer']),
  validateUUID,
  validateSystemUpdate,
  validateRequest,
  async (req, res) => {
    try {
      const system = await AutonomousSystemService.updateSystem(req.params.id, req.body);
      
      res.json({
        success: true,
        message: 'Autonomous system updated successfully',
        data: system,
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'Autonomous system not found',
        });
      }
      
      console.error('Error updating autonomous system:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update autonomous system',
        error: error.message,
      });
    }
  }
);

// Delete autonomous system
router.delete('/:id',
  authorize(['admin', 'system_admin']),
  validateUUID,
  validateRequest,
  async (req, res) => {
    try {
      await AutonomousSystemService.deleteSystem(req.params.id);
      
      res.json({
        success: true,
        message: 'Autonomous system deleted successfully',
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'Autonomous system not found',
        });
      }
      
      console.error('Error deleting autonomous system:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete autonomous system',
        error: error.message,
      });
    }
  }
);

// ========================================
// CAPABILITIES MANAGEMENT ROUTES
// ========================================

// Update system capabilities
router.put('/:id/capabilities',
  authorize(['admin', 'system_admin', 'compliance_officer']),
  validateUUID,
  validateCapabilityUpdate,
  validateRequest,
  async (req, res) => {
    try {
      const system = await AutonomousSystemService.updateSystemCapabilities(
        req.params.id, 
        req.body.capabilities
      );
      
      res.json({
        success: true,
        message: 'System capabilities updated successfully',
        data: {
          system: system,
          capabilities: system.capabilities,
          automationPercentage: system.automationPercentage,
        },
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'Autonomous system not found',
        });
      }
      
      console.error('Error updating system capabilities:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update system capabilities',
        error: error.message,
      });
    }
  }
);

// ========================================
// HEALTH MONITORING ROUTES
// ========================================

// Perform health check
router.post('/:id/health-check',
  authorize(['admin', 'system_admin', 'compliance_officer']),
  validateUUID,
  validateRequest,
  async (req, res) => {
    try {
      const healthData = await AutonomousSystemService.performHealthCheck(req.params.id);
      
      res.json({
        success: true,
        message: 'Health check completed',
        data: healthData,
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'Autonomous system not found',
        });
      }
      
      console.error('Error performing health check:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to perform health check',
        error: error.message,
      });
    }
  }
);

// Start health monitoring
router.post('/:id/health-monitoring/start',
  authorize(['admin', 'system_admin']),
  validateUUID,
  validateRequest,
  async (req, res) => {
    try {
      await AutonomousSystemService.startHealthMonitoring(req.params.id);
      
      res.json({
        success: true,
        message: 'Health monitoring started successfully',
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'Autonomous system not found',
        });
      }
      
      console.error('Error starting health monitoring:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start health monitoring',
        error: error.message,
      });
    }
  }
);

// Stop health monitoring
router.post('/:id/health-monitoring/stop',
  authorize(['admin', 'system_admin']),
  validateUUID,
  validateRequest,
  async (req, res) => {
    try {
      await AutonomousSystemService.stopHealthMonitoring(req.params.id);
      
      res.json({
        success: true,
        message: 'Health monitoring stopped successfully',
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'Autonomous system not found',
        });
      }
      
      console.error('Error stopping health monitoring:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to stop health monitoring',
        error: error.message,
      });
    }
  }
);

// ========================================
// SYSTEM EXECUTION ROUTES
// ========================================

// Execute system task
router.post('/:id/execute-task',
  authorize(['admin', 'system_admin', 'compliance_officer']),
  validateUUID,
  [
    body('name')
      .notEmpty()
      .withMessage('Task name is required'),
      
    body('type')
      .isIn([
        'compliance_check',
        'document_generation',
        'report_creation',
        'audit_execution',
        'risk_assessment',
        'notification_dispatch',
        'data_processing',
        'system_maintenance',
        'quality_assurance',
        'performance_monitoring',
        'security_scan',
        'backup_operation'
      ])
      .withMessage('Invalid task type'),
      
    body('parameters')
      .optional()
      .isObject()
      .withMessage('Parameters must be an object'),
      
    body('priority')
      .optional()
      .isIn(['low', 'normal', 'high', 'critical', 'emergency'])
      .withMessage('Invalid priority'),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const task = await AutonomousSystemService.executeSystemTask(req.params.id, req.body);
      
      res.json({
        success: true,
        message: 'System task executed successfully',
        data: task,
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'Autonomous system not found',
        });
      }
      
      console.error('Error executing system task:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to execute system task',
        error: error.message,
      });
    }
  }
);

// Record learning event
router.post('/:id/learning-event',
  authorize(['admin', 'system_admin', 'compliance_officer']),
  validateUUID,
  [
    body('improvement')
      .optional()
      .isBoolean()
      .withMessage('Improvement must be a boolean'),
      
    body('selfCorrection')
      .optional()
      .isBoolean()
      .withMessage('Self correction must be a boolean'),
      
    body('context')
      .optional()
      .isObject()
      .withMessage('Context must be an object'),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const system = await AutonomousSystemService.recordLearningEvent(req.params.id, req.body);
      
      res.json({
        success: true,
        message: 'Learning event recorded successfully',
        data: {
          system: system,
          learningMetrics: system.learningMetrics,
        },
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'Autonomous system not found',
        });
      }
      
      console.error('Error recording learning event:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to record learning event',
        error: error.message,
      });
    }
  }
);

// ========================================
// OPTIMIZATION ROUTES
// ========================================

// Optimize system
router.post('/:id/optimize',
  authorize(['admin', 'system_admin']),
  validateUUID,
  [
    body('optimizationType')
      .isIn([
        'performance',
        'resource_usage',
        'accuracy',
        'efficiency',
        'cost',
        'reliability',
        'scalability',
        'security',
        'user_experience'
      ])
      .withMessage('Invalid optimization type'),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const optimization = await AutonomousSystemService.optimizeSystem(
        req.params.id, 
        req.body.optimizationType
      );
      
      res.json({
        success: true,
        message: 'System optimization initiated',
        data: optimization,
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'Autonomous system not found',
        });
      }
      
      console.error('Error optimizing system:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to optimize system',
        error: error.message,
      });
    }
  }
);

// ========================================
// ESCALATION ROUTES
// ========================================

// Trigger escalation
router.post('/:id/escalate',
  authorize(['admin', 'system_admin', 'compliance_officer']),
  validateUUID,
  [
    body('reason')
      .notEmpty()
      .withMessage('Escalation reason is required'),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const escalation = await AutonomousSystemService.triggerEscalation(
        req.params.id, 
        req.body.reason
      );
      
      res.json({
        success: true,
        message: 'Escalation triggered successfully',
        data: escalation,
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'Autonomous system not found',
        });
      }
      
      console.error('Error triggering escalation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to trigger escalation',
        error: error.message,
      });
    }
  }
);

// ========================================
// STATISTICS ROUTES
// ========================================

// Get system statistics
router.get('/statistics/overview',
  authorize(['admin', 'system_admin', 'compliance_officer']),
  async (req, res) => {
    try {
      const statistics = await AutonomousSystemService.getSystemStatistics();
      
      res.json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      console.error('Error getting system statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get system statistics',
        error: error.message,
      });
    }
  }
);

// ========================================
// ERROR HANDLER
// ========================================

// Global error handler
router.use((error, req, res, next) => {
  console.error('Autonomous system route error:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.errors,
    });
  }
  
  if (error.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Database validation error',
      errors: error.errors.map(e => e.message),
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
  });
});

module.exports = router;