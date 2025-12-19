const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const sequelize = require('../../config/database').sequelize;
const NotificationEscalation = require('../../models/NotificationEscalation');
const User = require('../../models/User');
const Organization = require('../../models/Organization');

// Get all notification escalations
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      ruleType,
      severity,
      priority,
      userId,
      organizationId,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const whereClause = {};
    
    if (status) whereClause.status = status;
    if (ruleType) whereClause.ruleType = ruleType;
    if (severity) whereClause.severity = severity;
    if (priority) whereClause.priority = priority;
    if (userId) whereClause.userId = userId;
    if (organizationId) whereClause.organizationId = organizationId;

    const escalations = await NotificationEscalation.findAndCountAll({
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
      data: escalations.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(escalations.count / parseInt(limit)),
        totalItems: escalations.count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching notification escalations',
      error: error.message
    });
  }
});

// Get notification escalation by ID
router.get('/:id', async (req, res) => {
  try {
    const escalation = await NotificationEscalation.findByPk(req.params.id, {
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

    if (!escalation) {
      return res.status(404).json({
        success: false,
        message: 'Notification escalation not found'
      });
    }

    res.json({
      success: true,
      data: escalation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching notification escalation',
      error: error.message
    });
  }
});

// Create new notification escalation
router.post('/', [
  body('userId').isUUID().withMessage('Valid user ID is required'),
  body('organizationId').isUUID().withMessage('Valid organization ID is required'),
  body('ruleName').notEmpty().withMessage('Rule name is required'),
  body('ruleType').isIn([
    'compliance_deadline',
    'audit_breach',
    'non_compliance',
    'risk_threshold',
    'policy_violation',
    'document_expiry',
    'training_due',
    'license_expiry',
    'regulatory_change',
    'system_error',
    'data_anomaly',
    'custom'
  ]).withMessage('Invalid rule type'),
  body('triggerConditions').isObject().withMessage('Trigger conditions must be an object'),
  body('severity').isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid severity level'),
  body('priority').isIn(['low', 'normal', 'high', 'urgent']).withMessage('Invalid priority level'),
  body('timeToEscalate').isInt({ min: 1 }).withMessage('Time to escalate must be at least 1 minute'),
  body('escalationLevels').isArray({ min: 1 }).withMessage('Escalation levels must be an array with at least one level'),
  body('notificationChannels').isArray({ min: 1 }).withMessage('Notification channels must be an array with at least one channel'),
  body('recipients').isArray({ min: 1 }).withMessage('Recipients must be an array with at least one recipient'),
  body('subjectTemplate').notEmpty().withMessage('Subject template is required'),
  body('messageTemplate').notEmpty().withMessage('Message template is required')
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

    const escalationData = {
      ...req.body,
      currentLevel: 1,
      maxLevel: req.body.escalationLevels.length
    };

    const escalation = await NotificationEscalation.create(escalationData);

    const escalationWithRelations = await NotificationEscalation.findByPk(escalation.id, {
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
      message: 'Notification escalation created successfully',
      data: escalationWithRelations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating notification escalation',
      error: error.message
    });
  }
});

// Update notification escalation
router.put('/:id', [
  body('ruleName').optional().notEmpty().withMessage('Rule name cannot be empty'),
  body('ruleType').optional().isIn([
    'compliance_deadline',
    'audit_breach',
    'non_compliance',
    'risk_threshold',
    'policy_violation',
    'document_expiry',
    'training_due',
    'license_expiry',
    'regulatory_change',
    'system_error',
    'data_anomaly',
    'custom'
  ]).withMessage('Invalid rule type'),
  body('status').optional().isIn(['active', 'inactive', 'paused', 'triggered', 'resolved']).withMessage('Invalid status'),
  body('severity').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid severity level'),
  body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']).withMessage('Invalid priority level')
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

    const escalation = await NotificationEscalation.findByPk(req.params.id);
    if (!escalation) {
      return res.status(404).json({
        success: false,
        message: 'Notification escalation not found'
      });
    }

    await escalation.update(req.body);

    const updatedEscalation = await NotificationEscalation.findByPk(escalation.id, {
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
      message: 'Notification escalation updated successfully',
      data: updatedEscalation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating notification escalation',
      error: error.message
    });
  }
});

// Delete notification escalation
router.delete('/:id', async (req, res) => {
  try {
    const escalation = await NotificationEscalation.findByPk(req.params.id);
    if (!escalation) {
      return res.status(404).json({
        success: false,
        message: 'Notification escalation not found'
      });
    }

    await escalation.destroy();

    res.json({
      success: true,
      message: 'Notification escalation deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting notification escalation',
      error: error.message
    });
  }
});

// Trigger escalation rule
router.post('/:id/trigger', [
  body('triggerData').isObject().withMessage('Trigger data must be an object')
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

    const escalation = await NotificationEscalation.findByPk(req.params.id);
    if (!escalation) {
      return res.status(404).json({
        success: false,
        message: 'Notification escalation not found'
      });
    }

    if (escalation.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Can only trigger active escalation rules'
      });
    }

    // Generate incident ID
    const incidentId = `INC${Date.now()}`;
    const incidentStartTime = new Date();

    // Create mock trigger result
    const triggerResult = {
      incidentId: incidentId,
      ruleId: escalation.id,
      ruleName: escalation.ruleName,
      ruleType: escalation.ruleType,
      severity: escalation.severity,
      priority: escalation.priority,
      currentLevel: escalation.currentLevel,
      triggerTime: incidentStartTime,
      triggerData: req.body.triggerData,
      notifications: [
        {
          level: escalation.currentLevel,
          channel: escalation.notificationChannels[0],
          recipient: escalation.recipients[0],
          subject: escalation.subjectTemplate.replace('{{incidentId}}', incidentId),
          message: escalation.messageTemplate.replace('{{incidentId}}', incidentId),
          sent: true,
          timestamp: new Date()
        }
      ]
    };

    // Update escalation with incident data
    await escalation.update({
      status: 'triggered',
      currentIncidentId: incidentId,
      incidentStartTime: incidentStartTime,
      incidentStatus: 'open',
      totalTriggers: escalation.totalTriggers + 1,
      lastTriggered: incidentStartTime
    });

    const triggeredEscalation = await NotificationEscalation.findByPk(escalation.id);

    res.json({
      success: true,
      message: 'Escalation rule triggered successfully',
      data: {
        escalation: triggeredEscalation,
        triggerResult: triggerResult
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error triggering escalation rule',
      error: error.message
    });
  }
});

// Acknowledge escalation
router.patch('/:id/acknowledge', [
  body('acknowledgerId').isUUID().withMessage('Valid acknowledger ID is required'),
  body('comments').optional().isString().withMessage('Comments must be a string')
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

    const escalation = await NotificationEscalation.findByPk(req.params.id);
    if (!escalation) {
      return res.status(404).json({
        success: false,
        message: 'Notification escalation not found'
      });
    }

    if (escalation.incidentStatus !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Can only acknowledge open incidents'
      });
    }

    const acknowledgment = {
      acknowledgerId: req.body.acknowledgerId,
      acknowledgerName: 'User Name', // This would be fetched from user data
      timestamp: new Date(),
      comments: req.body.comments || ''
    };

    const currentAcknowledgments = escalation.acknowledgments || [];
    currentAcknowledgments.push(acknowledgment);

    await escalation.update({
      incidentStatus: 'acknowledged',
      acknowledgments: currentAcknowledgments,
      responseTimes: {
        ...escalation.responseTimes,
        [escalation.currentLevel]: new Date() - escalation.incidentStartTime
      }
    });

    const acknowledgedEscalation = await NotificationEscalation.findByPk(escalation.id);

    res.json({
      success: true,
      message: 'Escalation acknowledged successfully',
      data: {
        escalation: acknowledgedEscalation,
        acknowledgment: acknowledgment
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error acknowledging escalation',
      error: error.message
    });
  }
});

// Resolve escalation
router.patch('/:id/resolve', [
  body('resolverId').isUUID().withMessage('Valid resolver ID is required'),
  body('resolution').notEmpty().withMessage('Resolution details are required'),
  body('resolutionNotes').optional().isString().withMessage('Resolution notes must be a string')
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

    const escalation = await NotificationEscalation.findByPk(req.params.id);
    if (!escalation) {
      return res.status(404).json({
        success: false,
        message: 'Notification escalation not found'
      });
    }

    const resolution = {
      resolverId: req.body.resolverId,
      resolverName: 'User Name', // This would be fetched from user data
      timestamp: new Date(),
      resolution: req.body.resolution,
      resolutionNotes: req.body.resolutionNotes || '',
      resolutionTime: new Date() - escalation.incidentStartTime
    };

    const currentResolutions = escalation.resolutions || [];
    currentResolutions.push(resolution);

    await escalation.update({
      incidentStatus: 'resolved',
      status: 'resolved',
      resolutions: currentResolutions,
      resolvedTriggers: escalation.resolvedTriggers + 1,
      currentIncidentId: null,
      incidentStartTime: null
    });

    const resolvedEscalation = await NotificationEscalation.findByPk(escalation.id);

    res.json({
      success: true,
      message: 'Escalation resolved successfully',
      data: {
        escalation: resolvedEscalation,
        resolution: resolution
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resolving escalation',
      error: error.message
    });
  }
});

// Get escalation statistics
router.get('/statistics/overview', async (req, res) => {
  try {
    const { organizationId, userId } = req.query;
    
    const whereClause = {};
    if (organizationId) whereClause.organizationId = organizationId;
    if (userId) whereClause.userId = userId;

    const [
      totalRules,
      activeRules,
      inactiveRules,
      pausedRules,
      triggeredRules,
      resolvedRules,
      criticalRules,
      totalTriggers,
      resolvedTriggers,
      avgResolutionTime
    ] = await Promise.all([
      NotificationEscalation.count({ where: whereClause }),
      NotificationEscalation.count({ where: { ...whereClause, status: 'active' } }),
      NotificationEscalation.count({ where: { ...whereClause, status: 'inactive' } }),
      NotificationEscalation.count({ where: { ...whereClause, status: 'paused' } }),
      NotificationEscalation.count({ where: { ...whereClause, status: 'triggered' } }),
      NotificationEscalation.count({ where: { ...whereClause, status: 'resolved' } }),
      NotificationEscalation.count({ where: { ...whereClause, severity: 'critical' } }),
      NotificationEscalation.sum('totalTriggers', { where: whereClause }),
      NotificationEscalation.sum('resolvedTriggers', { where: whereClause }),
      NotificationEscalation.findAll({
        where: { ...whereClause, status: 'resolved' },
        attributes: [[sequelize.fn('AVG', sequelize.col('avgResolutionTime')), 'avgResolutionTime']]
      })
    ]);

    res.json({
      success: true,
      data: {
        totalRules,
        activeRules,
        inactiveRules,
        pausedRules,
        triggeredRules,
        resolvedRules,
        criticalRules,
        totalTriggers: totalTriggers || 0,
        resolvedTriggers: resolvedTriggers || 0,
        avgResolutionTime: avgResolutionTime[0]?.avgResolutionTime || 0,
        activationRate: totalRules > 0 ? ((activeRules / totalRules) * 100).toFixed(2) : 0,
        resolutionRate: totalTriggers > 0 ? ((resolvedTriggers / totalTriggers) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching escalation statistics',
      error: error.message
    });
  }
});

// Get escalations by rule type
router.get('/rule-type/:ruleType', async (req, res) => {
  try {
    const { ruleType } = req.params;
    const {
      page = 1,
      limit = 10,
      organizationId,
      userId,
      status,
      severity,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const whereClause = { ruleType };
    if (organizationId) whereClause.organizationId = organizationId;
    if (userId) whereClause.userId = userId;
    if (status) whereClause.status = status;
    if (severity) whereClause.severity = severity;

    const escalations = await NotificationEscalation.findAndCountAll({
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
      data: escalations.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(escalations.count / parseInt(limit)),
        totalItems: escalations.count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching escalations by rule type',
      error: error.message
    });
  }
});

// Get active incidents
router.get('/incidents/active', async (req, res) => {
  try {
    const { organizationId, userId } = req.query;
    
    const whereClause = {
      incidentStatus: { [Op.in]: ['open', 'acknowledged', 'in_progress'] }
    };
    
    if (organizationId) whereClause.organizationId = organizationId;
    if (userId) whereClause.userId = userId;

    const activeIncidents = await NotificationEscalation.findAll({
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
      order: [['incidentStartTime', 'ASC']]
    });

    res.json({
      success: true,
      data: activeIncidents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching active incidents',
      error: error.message
    });
  }
});

// Get escalated incidents (at higher levels)
router.get('/incidents/escalated', async (req, res) => {
  try {
    const { organizationId, userId, minLevel = 2 } = req.query;
    
    const whereClause = {
      currentLevel: { [Op.gte]: parseInt(minLevel) },
      incidentStatus: { [Op.in]: ['open', 'acknowledged', 'in_progress'] }
    };
    
    if (organizationId) whereClause.organizationId = organizationId;
    if (userId) whereClause.userId = userId;

    const escalatedIncidents = await NotificationEscalation.findAll({
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
      order: [['currentLevel', 'DESC'], ['incidentStartTime', 'ASC']]
    });

    res.json({
      success: true,
      data: escalatedIncidents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching escalated incidents',
      error: error.message
    });
  }
});

// Get incident timeline
router.get('/:id/timeline', async (req, res) => {
  try {
    const escalation = await NotificationEscalation.findByPk(req.params.id);
    if (!escalation) {
      return res.status(404).json({
        success: false,
        message: 'Notification escalation not found'
      });
    }

    const timeline = [];

    // Add rule creation
    timeline.push({
      timestamp: escalation.createdAt,
      event: 'Rule Created',
      description: `Escalation rule "${escalation.ruleName}" was created`,
      level: null
    });

    // Add trigger event
    if (escalation.lastTriggered) {
      timeline.push({
        timestamp: escalation.lastTriggered,
        event: 'Incident Triggered',
        description: `Escalation rule was triggered for incident ${escalation.currentIncidentId}`,
        level: escalation.currentLevel
      });
    }

    // Add acknowledgment events
    if (escalation.acknowledgments && escalation.acknowledgments.length > 0) {
      escalation.acknowledgments.forEach(ack => {
        timeline.push({
          timestamp: ack.timestamp,
          event: 'Incident Acknowledged',
          description: `Incident acknowledged by ${ack.acknowledgerName}`,
          level: escalation.currentLevel,
          comments: ack.comments
        });
      });
    }

    // Add resolution events
    if (escalation.resolutions && escalation.resolutions.length > 0) {
      escalation.resolutions.forEach(resolution => {
        timeline.push({
          timestamp: resolution.timestamp,
          event: 'Incident Resolved',
          description: `Incident resolved by ${resolution.resolverName}`,
          level: escalation.currentLevel,
          resolution: resolution.resolution,
          resolutionNotes: resolution.resolutionNotes,
          resolutionTime: resolution.resolutionTime
        });
      });
    }

    // Sort timeline by timestamp
    timeline.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    res.json({
      success: true,
      data: {
        escalationId: escalation.id,
        incidentId: escalation.currentIncidentId,
        timeline: timeline
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating incident timeline',
      error: error.message
    });
  }
});

// Pause escalation rule
router.patch('/:id/pause', async (req, res) => {
  try {
    const escalation = await NotificationEscalation.findByPk(req.params.id);
    if (!escalation) {
      return res.status(404).json({
        success: false,
        message: 'Notification escalation not found'
      });
    }

    if (escalation.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Can only pause active escalation rules'
      });
    }

    await escalation.update({ status: 'paused' });

    const pausedEscalation = await NotificationEscalation.findByPk(escalation.id);

    res.json({
      success: true,
      message: 'Escalation rule paused successfully',
      data: pausedEscalation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error pausing escalation rule',
      error: error.message
    });
  }
});

// Resume escalation rule
router.patch('/:id/resume', async (req, res) => {
  try {
    const escalation = await NotificationEscalation.findByPk(req.params.id);
    if (!escalation) {
      return res.status(404).json({
        success: false,
        message: 'Notification escalation not found'
      });
    }

    if (escalation.status !== 'paused') {
      return res.status(400).json({
        success: false,
        message: 'Can only resume paused escalation rules'
      });
    }

    await escalation.update({ status: 'active' });

    const resumedEscalation = await NotificationEscalation.findByPk(escalation.id);

    res.json({
      success: true,
      message: 'Escalation rule resumed successfully',
      data: resumedEscalation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resuming escalation rule',
      error: error.message
    });
  }
});

// Bulk update escalation status
router.patch('/bulk-update-status', [
  body('escalationIds').isArray({ min: 1 }).withMessage('Escalation IDs array is required'),
  body('status').isIn(['active', 'inactive', 'paused', 'triggered', 'resolved']).withMessage('Invalid status')
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

    const { escalationIds, status, userId } = req.body;

    const updatedEscalations = await NotificationEscalation.update(
      { status },
      {
        where: {
          id: { [Op.in]: escalationIds },
          ...(userId && { userId })
        },
        returning: true
      }
    );

    res.json({
      success: true,
      message: `${updatedEscalations[0]} notification escalations updated successfully`,
      data: updatedEscalations[1]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating escalations',
      error: error.message
    });
  }
});

module.exports = router;