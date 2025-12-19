const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const sequelize = require('../../config/database').sequelize;
const PolicyUpdate = require('../../models/PolicyUpdate');
const User = require('../../models/User');
const Organization = require('../../models/Organization');

// Get all policy updates
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      impact,
      source,
      userId,
      organizationId,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const whereClause = {};
    
    if (status) whereClause.status = status;
    if (impact) whereClause.impact = impact;
    if (source) whereClause.source = source;
    if (userId) whereClause.userId = userId;
    if (organizationId) whereClause.organizationId = organizationId;

    const policyUpdates = await PolicyUpdate.findAndCountAll({
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
      data: policyUpdates.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(policyUpdates.count / parseInt(limit)),
        totalItems: policyUpdates.count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching policy updates',
      error: error.message
    });
  }
});

// Get policy update by ID
router.get('/:id', async (req, res) => {
  try {
    const policyUpdate = await PolicyUpdate.findByPk(req.params.id, {
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

    if (!policyUpdate) {
      return res.status(404).json({
        success: false,
        message: 'Policy update not found'
      });
    }

    res.json({
      success: true,
      data: policyUpdate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching policy update',
      error: error.message
    });
  }
});

// Create new policy update
router.post('/', [
  body('userId').isUUID().withMessage('Valid user ID is required'),
  body('organizationId').isUUID().withMessage('Valid organization ID is required'),
  body('policyTitle').notEmpty().withMessage('Policy title is required'),
  body('source').notEmpty().withMessage('Source is required'),
  body('updateType').isIn(['new_policy', 'policy_amendment', 'policy_repeal', 'guideline', 'notification', 'circular']).withMessage('Invalid update type'),
  body('impact').isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid impact level')
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

    const policyUpdateData = {
      ...req.body,
      effectiveDate: req.body.effectiveDate || new Date().toISOString().split('T')[0]
    };

    const policyUpdate = await PolicyUpdate.create(policyUpdateData);

    const policyUpdateWithRelations = await PolicyUpdate.findByPk(policyUpdate.id, {
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
      message: 'Policy update created successfully',
      data: policyUpdateWithRelations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating policy update',
      error: error.message
    });
  }
});

// Update policy update
router.put('/:id', [
  body('policyTitle').optional().notEmpty().withMessage('Policy title cannot be empty'),
  body('updateType').optional().isIn(['new_policy', 'policy_amendment', 'policy_repeal', 'guideline', 'notification', 'circular']).withMessage('Invalid update type'),
  body('status').optional().isIn(['draft', 'published', 'implemented', 'superseded', 'withdrawn']).withMessage('Invalid status'),
  body('impact').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid impact level')
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

    const policyUpdate = await PolicyUpdate.findByPk(req.params.id);
    if (!policyUpdate) {
      return res.status(404).json({
        success: false,
        message: 'Policy update not found'
      });
    }

    await policyUpdate.update(req.body);

    const updatedPolicyUpdate = await PolicyUpdate.findByPk(policyUpdate.id, {
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
      message: 'Policy update updated successfully',
      data: updatedPolicyUpdate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating policy update',
      error: error.message
    });
  }
});

// Delete policy update
router.delete('/:id', async (req, res) => {
  try {
    const policyUpdate = await PolicyUpdate.findByPk(req.params.id);
    if (!policyUpdate) {
      return res.status(404).json({
        success: false,
        message: 'Policy update not found'
      });
    }

    await policyUpdate.destroy();

    res.json({
      success: true,
      message: 'Policy update deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting policy update',
      error: error.message
    });
  }
});

// Get policy update statistics
router.get('/statistics/overview', async (req, res) => {
  try {
    const { organizationId, userId } = req.query;
    
    const whereClause = {};
    if (organizationId) whereClause.organizationId = organizationId;
    if (userId) whereClause.userId = userId;

    const [
      totalUpdates,
      publishedUpdates,
      draftUpdates,
      implementedUpdates,
      supersededUpdates,
      criticalUpdates,
      overdueUpdates
    ] = await Promise.all([
      PolicyUpdate.count({ where: whereClause }),
      PolicyUpdate.count({ where: { ...whereClause, status: 'published' } }),
      PolicyUpdate.count({ where: { ...whereClause, status: 'draft' } }),
      PolicyUpdate.count({ where: { ...whereClause, status: 'implemented' } }),
      PolicyUpdate.count({ where: { ...whereClause, status: 'superseded' } }),
      PolicyUpdate.count({ where: { ...whereClause, impact: 'critical' } }),
      PolicyUpdate.count({
        where: {
          ...whereClause,
          effectiveDate: { [Op.lt]: new Date() },
          status: { [Op.not]: 'implemented' }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalUpdates,
        publishedUpdates,
        draftUpdates,
        implementedUpdates,
        supersededUpdates,
        criticalUpdates,
        overdueUpdates,
        implementationRate: totalUpdates > 0 ? ((implementedUpdates / totalUpdates) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching policy update statistics',
      error: error.message
    });
  }
});

// Get upcoming effective policies
router.get('/upcoming', async (req, res) => {
  try {
    const { organizationId, userId, days = 30 } = req.query;
    
    const whereClause = {
      status: 'published',
      effectiveDate: {
        [Op.between]: [
          new Date(),
          new Date(Date.now() + parseInt(days) * 24 * 60 * 60 * 1000)
        ]
      }
    };
    
    if (organizationId) whereClause.organizationId = organizationId;
    if (userId) whereClause.userId = userId;

    const upcomingPolicies = await PolicyUpdate.findAll({
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
      order: [['effectiveDate', 'ASC']]
    });

    res.json({
      success: true,
      data: upcomingPolicies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching upcoming policies',
      error: error.message
    });
  }
});

// Get overdue policies
router.get('/overdue', async (req, res) => {
  try {
    const { organizationId, userId } = req.query;
    
    const whereClause = {
      effectiveDate: { [Op.lt]: new Date() },
      status: { [Op.not]: 'implemented' }
    };
    
    if (organizationId) whereClause.organizationId = organizationId;
    if (userId) whereClause.userId = userId;

    const overduePolicies = await PolicyUpdate.findAll({
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
      order: [['effectiveDate', 'ASC']]
    });

    res.json({
      success: true,
      data: overduePolicies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching overdue policies',
      error: error.message
    });
  }
});

// Get policies by impact level
router.get('/impact/:impact', async (req, res) => {
  try {
    const { impact } = req.params;
    const {
      page = 1,
      limit = 10,
      organizationId,
      userId,
      sortBy = 'effectiveDate',
      sortOrder = 'ASC'
    } = req.query;

    const whereClause = { impact };
    if (organizationId) whereClause.organizationId = organizationId;
    if (userId) whereClause.userId = userId;

    const policies = await PolicyUpdate.findAndCountAll({
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
      data: policies.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(policies.count / parseInt(limit)),
        totalItems: policies.count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching policies by impact',
      error: error.message
    });
  }
});

// Search policies
router.get('/search', async (req, res) => {
  try {
    const {
      q,
      source,
      updateType,
      impact,
      status,
      organizationId,
      userId,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const whereClause = {};
    
    if (q) {
      whereClause[Op.or] = [
        { policyTitle: { [Op.iLike]: `%${q}%` } },
        { description: { [Op.iLike]: `%${q}%` } },
        { summary: { [Op.iLike]: `%${q}%` } },
        { source: { [Op.iLike]: `%${q}%` } }
      ];
    }
    
    if (source) whereClause.source = source;
    if (updateType) whereClause.updateType = updateType;
    if (impact) whereClause.impact = impact;
    if (status) whereClause.status = status;
    if (organizationId) whereClause.organizationId = organizationId;
    if (userId) whereClause.userId = userId;

    const policies = await PolicyUpdate.findAndCountAll({
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
      data: policies.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(policies.count / parseInt(limit)),
        totalItems: policies.count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching policies',
      error: error.message
    });
  }
});

// Bulk update policy status
router.patch('/bulk-update-status', [
  body('policyIds').isArray({ min: 1 }).withMessage('Policy IDs array is required'),
  body('status').isIn(['draft', 'published', 'implemented', 'superseded', 'withdrawn']).withMessage('Invalid status')
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

    const { policyIds, status, userId } = req.body;
    const updateData = { status };

    if (status === 'implemented') {
      updateData.implementationDate = new Date();
    }

    const updatedPolicies = await PolicyUpdate.update(updateData, {
      where: {
        id: { [Op.in]: policyIds },
        ...(userId && { userId })
      },
      returning: true
    });

    res.json({
      success: true,
      message: `${updatedPolicies[0]} policy updates updated successfully`,
      data: updatedPolicies[1]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating policy updates',
      error: error.message
    });
  }
});

module.exports = router;