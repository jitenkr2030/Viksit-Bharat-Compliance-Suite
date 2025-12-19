const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const sequelize = require('../../config/database').sequelize;
const QualityAudit = require('../../models/QualityAudit');
const User = require('../../models/User');
const Organization = require('../../models/Organization');

// Get all quality audits
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      auditType,
      priority,
      userId,
      organizationId,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const whereClause = {};
    
    if (status) whereClause.status = status;
    if (auditType) whereClause.auditType = auditType;
    if (priority) whereClause.priority = priority;
    if (userId) whereClause.userId = userId;
    if (organizationId) whereClause.organizationId = organizationId;

    const audits = await QualityAudit.findAndCountAll({
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
      data: audits.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(audits.count / parseInt(limit)),
        totalItems: audits.count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching quality audits',
      error: error.message
    });
  }
});

// Get quality audit by ID
router.get('/:id', async (req, res) => {
  try {
    const audit = await QualityAudit.findByPk(req.params.id, {
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

    if (!audit) {
      return res.status(404).json({
        success: false,
        message: 'Quality audit not found'
      });
    }

    res.json({
      success: true,
      data: audit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching quality audit',
      error: error.message
    });
  }
});

// Create new quality audit
router.post('/', [
  body('userId').isUUID().withMessage('Valid user ID is required'),
  body('organizationId').isUUID().withMessage('Valid organization ID is required'),
  body('auditTitle').notEmpty().withMessage('Audit title is required'),
  body('auditType').isIn(['internal', 'external', 'self', 'regulatory', 'customer', 'supplier']).withMessage('Invalid audit type'),
  body('priority').isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority level')
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

    const auditData = {
      ...req.body,
      auditDate: req.body.auditDate || new Date().toISOString().split('T')[0]
    };

    const audit = await QualityAudit.create(auditData);

    const auditWithRelations = await QualityAudit.findByPk(audit.id, {
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
      message: 'Quality audit created successfully',
      data: auditWithRelations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating quality audit',
      error: error.message
    });
  }
});

// Update quality audit
router.put('/:id', [
  body('auditTitle').optional().notEmpty().withMessage('Audit title cannot be empty'),
  body('auditType').optional().isIn(['internal', 'external', 'self', 'regulatory', 'customer', 'supplier']).withMessage('Invalid audit type'),
  body('status').optional().isIn(['draft', 'scheduled', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority level')
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

    const audit = await QualityAudit.findByPk(req.params.id);
    if (!audit) {
      return res.status(404).json({
        success: false,
        message: 'Quality audit not found'
      });
    }

    await audit.update(req.body);

    const updatedAudit = await QualityAudit.findByPk(audit.id, {
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
      message: 'Quality audit updated successfully',
      data: updatedAudit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating quality audit',
      error: error.message
    });
  }
});

// Delete quality audit
router.delete('/:id', async (req, res) => {
  try {
    const audit = await QualityAudit.findByPk(req.params.id);
    if (!audit) {
      return res.status(404).json({
        success: false,
        message: 'Quality audit not found'
      });
    }

    await audit.destroy();

    res.json({
      success: true,
      message: 'Quality audit deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting quality audit',
      error: error.message
    });
  }
});

// Get audit statistics
router.get('/statistics/overview', async (req, res) => {
  try {
    const { organizationId, userId } = req.query;
    
    const whereClause = {};
    if (organizationId) whereClause.organizationId = organizationId;
    if (userId) whereClause.userId = userId;

    const [
      totalAudits,
      completedAudits,
      inProgressAudits,
      scheduledAudits,
      cancelledAudits,
      averageScore,
      totalFindings,
      criticalFindings
    ] = await Promise.all([
      QualityAudit.count({ where: whereClause }),
      QualityAudit.count({ where: { ...whereClause, status: 'completed' } }),
      QualityAudit.count({ where: { ...whereClause, status: 'in_progress' } }),
      QualityAudit.count({ where: { ...whereClause, status: 'scheduled' } }),
      QualityAudit.count({ where: { ...whereClause, status: 'cancelled' } }),
      QualityAudit.findAll({
        where: { ...whereClause, status: 'completed' },
        attributes: [[sequelize.fn('AVG', sequelize.col('overallScore')), 'averageScore']]
      }),
      QualityAudit.sum('totalFindings', { where: { ...whereClause, status: 'completed' } }),
      QualityAudit.sum('criticalFindings', { where: { ...whereClause, status: 'completed' } })
    ]);

    res.json({
      success: true,
      data: {
        totalAudits,
        completedAudits,
        inProgressAudits,
        scheduledAudits,
        cancelledAudits,
        averageScore: averageScore[0]?.averageScore || 0,
        totalFindings: totalFindings || 0,
        criticalFindings: criticalFindings || 0,
        completionRate: totalAudits > 0 ? ((completedAudits / totalAudits) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching audit statistics',
      error: error.message
    });
  }
});

// Get audit trends
router.get('/statistics/trends', async (req, res) => {
  try {
    const { organizationId, userId, period = '6months' } = req.query;
    
    const whereClause = {};
    if (organizationId) whereClause.organizationId = organizationId;
    if (userId) whereClause.userId = userId;

    let dateCondition = {};
    const now = new Date();
    switch (period) {
      case '30days':
        dateCondition = { createdAt: { [Op.gte]: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
        break;
      case '3months':
        dateCondition = { createdAt: { [Op.gte]: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) } };
        break;
      case '6months':
        dateCondition = { createdAt: { [Op.gte]: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000) } };
        break;
      case '1year':
        dateCondition = { createdAt: { [Op.gte]: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) } };
        break;
    }

    const trends = await QualityAudit.findAll({
      where: { ...whereClause, ...dateCondition },
      attributes: [
        [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('auditDate')), 'month'],
        [sequelize.fn('COUNT', '*'), 'totalAudits'],
        [sequelize.fn('AVG', sequelize.col('overallScore')), 'averageScore'],
        [sequelize.fn('SUM', sequelize.col('totalFindings')), 'totalFindings'],
        [sequelize.fn('SUM', sequelize.col('criticalFindings')), 'criticalFindings']
      ],
      group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('auditDate'))],
      order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('auditDate')), 'ASC']]
    });

    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching audit trends',
      error: error.message
    });
  }
});

// Get audit by status
router.get('/status/:status', async (req, res) => {
  try {
    const { status } = req.params;
    const {
      page = 1,
      limit = 10,
      organizationId,
      userId,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const whereClause = { status };
    if (organizationId) whereClause.organizationId = organizationId;
    if (userId) whereClause.userId = userId;

    const audits = await QualityAudit.findAndCountAll({
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
      data: audits.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(audits.count / parseInt(limit)),
        totalItems: audits.count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching audits by status',
      error: error.message
    });
  }
});

// Bulk update audit status
router.patch('/bulk-update-status', [
  body('auditIds').isArray({ min: 1 }).withMessage('Audit IDs array is required'),
  body('status').isIn(['draft', 'scheduled', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status')
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

    const { auditIds, status, userId } = req.body;
    const updateData = { status };

    if (status === 'completed') {
      updateData.completionDate = new Date();
    }

    const updatedAudits = await QualityAudit.update(updateData, {
      where: {
        id: { [Op.in]: auditIds },
        ...(userId && { userId })
      },
      returning: true
    });

    res.json({
      success: true,
      message: `${updatedAudits[0]} audits updated successfully`,
      data: updatedAudits[1]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating audits',
      error: error.message
    });
  }
});

module.exports = router;