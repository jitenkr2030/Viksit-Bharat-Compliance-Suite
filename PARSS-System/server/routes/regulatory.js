const express = require('express');
const { Op } = require('sequelize');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const { authenticateToken, restrictTo, checkOwnershipOrPermission } = require('../middleware/auth');
const { validationRules, handleValidationErrors } = require('../middleware/validation');
const { logUserActivity, logComplianceEvent } = require('../middleware/logger');

// Import models
const Institution = require('../models/Institution');
const Faculty = require('../models/Faculty');
const Approval = require('../models/Approval');
const Document = require('../models/Document');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get regulatory compliance overview
router.get('/overview', catchAsync(async (req, res) => {
  const userInstitutionId = req.user.institutionId;
  const userRole = req.user.role;

  let whereClause = { council: 'regulatory' };
  if (!['system_admin', 'super_admin'].includes(userRole)) {
    whereClause.institution_id = userInstitutionId;
  }

  // Get regulatory approval statistics
  const approvalStats = await Approval.findAll({
    where: whereClause,
    attributes: [
      [Approval.sequelize.fn('COUNT', Approval.sequelize.col('id')), 'total'],
      [Approval.sequelize.fn('SUM', Approval.sequelize.literal("CASE WHEN status = 'approved' THEN 1 ELSE 0 END")), 'approved'],
      [Approval.sequelize.fn('SUM', Approval.sequelize.literal("CASE WHEN status = 'pending' THEN 1 ELSE 0 END")), 'pending'],
      [Approval.sequelize.fn('SUM', Approval.sequelize.literal("CASE WHEN status = 'expired' THEN 1 ELSE 0 END")), 'expired'],
      [Approval.sequelize.fn('SUM', Approval.sequelize.literal("CASE WHEN valid_until < CURRENT_DATE + INTERVAL '30 days' AND valid_until >= CURRENT_DATE THEN 1 ELSE 0 END")), 'expiring_soon']
    ]
  });

  const stats = approvalStats[0] || {};
  const total = parseInt(stats.get('total') || 0);
  const approved = parseInt(stats.get('approved') || 0);
  const pending = parseInt(stats.get('pending') || 0);
  const expired = parseInt(stats.get('expired') || 0);
  const expiringSoon = parseInt(stats.get('expiring_soon') || 0);

  // Calculate compliance score
  const complianceScore = total > 0 ? Math.round((approved / total) * 100) : 0;

  // Get approval type breakdown
  const approvalTypeStats = await Approval.findAll({
    where: whereClause,
    attributes: [
      'approval_type',
      [Approval.sequelize.fn('COUNT', '*'), 'count'],
      [Approval.sequelize.fn('SUM', Approval.sequelize.literal("CASE WHEN status = 'approved' THEN 1 ELSE 0 END")), 'approved_count']
    ],
    group: ['approval_type'],
    order: [['count', 'DESC']]
  });

  // Get recent activities
  const recentApprovals = await Approval.findAll({
    where: whereClause,
    order: [['updated_at', 'DESC']],
    limit: 10,
    include: [
      {
        model: Institution,
        as: 'Institution',
        attributes: ['name', 'code']
      },
      {
        model: Faculty,
        as: 'Faculty',
        attributes: ['first_name', 'last_name', 'employee_id']
      }
    ]
  });

  res.status(200).json({
    status: 'success',
    data: {
      overview: {
        totalApprovals: total,
        approved,
        pending,
        expired,
        expiringSoon,
        complianceScore
      },
      approvalTypeStats,
      recentApprovals
    }
  });
}));

// Get all approvals with filtering and pagination
router.get('/approvals', catchAsync(async (req, res) => {
  const userInstitutionId = req.user.institutionId;
  const userRole = req.user.role;

  let whereClause = { council: 'regulatory' };
  if (!['system_admin', 'super_admin'].includes(userRole)) {
    whereClause.institution_id = userInstitutionId;
  }

  // Apply filters
  const { 
    status, 
    approval_type, 
    priority_level, 
    search,
    page = 1, 
    limit = 20,
    sort = '-created_at'
  } = req.query;

  if (status) whereClause.status = status;
  if (approval_type) whereClause.approval_type = approval_type;
  if (priority_level) whereClause.priority_level = priority_level;
  if (search) {
    whereClause[Op.or] = [
      { approval_number: { [Op.iLike]: `%${search}%` } },
      { issuing_authority: { [Op.iLike]: `%${search}%` } }
    ];
  }

  // Parse sorting
  const order = sort.startsWith('-') 
    ? [[sort.substring(1), 'DESC']] 
    : [[sort, 'ASC']];

  // Get total count for pagination
  const total = await Approval.count({ where: whereClause });

  // Get approvals
  const approvals = await Approval.findAll({
    where: whereClause,
    include: [
      {
        model: Institution,
        as: 'Institution',
        attributes: ['id', 'name', 'code']
      },
      {
        model: Faculty,
        as: 'Faculty',
        attributes: ['id', 'first_name', 'last_name', 'employee_id']
      }
    ],
    order,
    limit: parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit)
  });

  res.status(200).json({
    status: 'success',
    data: {
      approvals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
}));

// Get single approval
router.get('/approvals/:id', 
  checkOwnershipOrPermission(Approval),
  catchAsync(async (req, res) => {
    const approval = req.resource;

    // Get related documents
    const documents = await Document.findAll({
      where: { approval_id: approval.id },
      order: [['created_at', 'DESC']]
    });

    // Get approval history (if tracking changes)
    const history = []; // TODO: Implement approval history tracking

    res.status(200).json({
      status: 'success',
      data: {
        approval,
        documents,
        history
      }
    });
  })
);

// Create new approval
router.post('/approvals', 
  restrictTo('admin', 'compliance_officer'),
  validationRules.approval.create,
  handleValidationErrors,
  catchAsync(async (req, res) => {
    const userInstitutionId = req.user.institutionId;
    
    // Add institution ID if not system admin
    if (!['system_admin', 'super_admin'].includes(req.user.role)) {
      req.body.institution_id = userInstitutionId;
    }

    const approval = await Approval.create(req.body);

    // Log compliance event
    logComplianceEvent('approval_created', approval.institution_id, {
      approvalId: approval.id,
      approvalType: approval.approval_type,
      createdBy: req.user.userId
    });

    // Log user activity
    logUserActivity('approval_created', { approvalId: approval.id });

    res.status(201).json({
      status: 'success',
      data: {
        approval
      }
    });
  })
);

// Update approval
router.patch('/approvals/:id',
  checkOwnershipOrPermission(Approval),
  restrictTo('admin', 'compliance_officer'),
  catchAsync(async (req, res) => {
    const approval = req.resource;
    const allowedUpdates = [
      'status', 'issue_date', 'valid_until', 'renewal_required',
      'renewal_period_months', 'conditions', 'terms', 'issuing_officer',
      'issuing_officer_designation', 'contact_details', 'fees_paid',
      'payment_date', 'payment_reference', 'inspection_required',
      'inspection_date', 'inspection_officer', 'inspection_report',
      'inspection_status', 'renewal_application_date', 'renewal_status',
      'auto_renewal_enabled', 'priority_level', 'risk_level',
      'compliance_score', 'notes'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    await approval.update(updates);

    // Log compliance event
    logComplianceEvent('approval_updated', approval.institution_id, {
      approvalId: approval.id,
      updatedFields: Object.keys(updates),
      updatedBy: req.user.userId
    });

    // Log user activity
    logUserActivity('approval_updated', { approvalId: approval.id });

    res.status(200).json({
      status: 'success',
      data: {
        approval
      }
    });
  })
);

// Delete approval
router.delete('/approvals/:id',
  checkOwnershipOrPermission(Approval),
  restrictTo('admin', 'compliance_officer'),
  catchAsync(async (req, res) => {
    const approval = req.resource;

    // Soft delete by setting status to deleted
    await approval.update({ status: 'deleted' });

    // Log compliance event
    logComplianceEvent('approval_deleted', approval.institution_id, {
      approvalId: approval.id,
      deletedBy: req.user.userId
    });

    res.status(204).json({
      status: 'success',
      data: null
    });
  })
);

// Get expiring approvals
router.get('/approvals/expiring', catchAsync(async (req, res) => {
  const userInstitutionId = req.user.institutionId;
  const userRole = req.user.role;

  let whereClause = {
    council: 'regulatory',
    status: 'approved',
    valid_until: {
      [Op.lte]: new Date(Date.now() + (req.query.days || 30) * 24 * 60 * 60 * 1000),
      [Op.gte]: new Date()
    }
  };

  if (!['system_admin', 'super_admin'].includes(userRole)) {
    whereClause.institution_id = userInstitutionId;
  }

  const expiringApprovals = await Approval.findAll({
    where: whereClause,
    include: [
      {
        model: Institution,
        as: 'Institution',
        attributes: ['id', 'name', 'code']
      },
      {
        model: Faculty,
        as: 'Faculty',
        attributes: ['id', 'first_name', 'last_name', 'employee_id']
      }
    ],
    order: [['valid_until', 'ASC']]
  });

  res.status(200).json({
    status: 'success',
    data: {
      expiringApprovals,
      count: expiringApprovals.length
    }
  });
}));

// Get expired approvals
router.get('/approvals/expired', catchAsync(async (req, res) => {
  const userInstitutionId = req.user.institutionId;
  const userRole = req.user.role;

  let whereClause = {
    council: 'regulatory',
    status: 'approved',
    valid_until: {
      [Op.lt]: new Date()
    }
  };

  if (!['system_admin', 'super_admin'].includes(userRole)) {
    whereClause.institution_id = userInstitutionId;
  }

  const expiredApprovals = await Approval.findAll({
    where: whereClause,
    include: [
      {
        model: Institution,
        as: 'Institution',
        attributes: ['id', 'name', 'code']
      },
      {
        model: Faculty,
        as: 'Faculty',
        attributes: ['id', 'first_name', 'last_name', 'employee_id']
      }
    ],
    order: [['valid_until', 'ASC']]
  });

  res.status(200).json({
    status: 'success',
    data: {
      expiredApprovals,
      count: expiredApprovals.length
    }
  });
}));

// Get approval statistics
router.get('/statistics', catchAsync(async (req, res) => {
  const userInstitutionId = req.user.institutionId;
  const userRole = req.user.role;

  let whereClause = { council: 'regulatory' };
  if (!['system_admin', 'super_admin'].includes(userRole)) {
    whereClause.institution_id = userInstitutionId;
  }

  // Monthly statistics for the last 12 months
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const monthlyStats = await Approval.findAll({
    where: {
      ...whereClause,
      created_at: { [Op.gte]: twelveMonthsAgo }
    },
    attributes: [
      [Approval.sequelize.fn('DATE_TRUNC', 'month', Approval.sequelize.col('created_at')), 'month'],
      [Approval.sequelize.fn('COUNT', '*'), 'total'],
      [Approval.sequelize.fn('SUM', Approval.sequelize.literal("CASE WHEN status = 'approved' THEN 1 ELSE 0 END")), 'approved'],
      [Approval.sequelize.fn('SUM', Approval.sequelize.literal("CASE WHEN status = 'pending' THEN 1 ELSE 0 END")), 'pending']
    ],
    group: ['month'],
    order: [['month', 'ASC']]
  });

  // Priority level distribution
  const priorityStats = await Approval.findAll({
    where: whereClause,
    attributes: [
      'priority_level',
      [Approval.sequelize.fn('COUNT', '*'), 'count']
    ],
    group: ['priority_level']
  });

  // Risk level distribution
  const riskStats = await Approval.findAll({
    where: whereClause,
    attributes: [
      'risk_level',
      [Approval.sequelize.fn('COUNT', '*'), 'count']
    ],
    group: ['risk_level']
  });

  res.status(200).json({
    status: 'success',
    data: {
      monthlyStats,
      priorityStats,
      riskStats
    }
  });
}));

// Bulk operations
router.patch('/approvals/bulk', 
  restrictTo('admin', 'compliance_officer'),
  catchAsync(async (req, res) => {
    const { approval_ids, action, data } = req.body;

    if (!Array.isArray(approval_ids) || approval_ids.length === 0) {
      throw new AppError('Approval IDs array is required', 400);
    }

    if (!action) {
      throw new AppError('Action is required', 400);
    }

    const userInstitutionId = req.user.institutionId;
    const userRole = req.user.role;

    let whereClause = {
      id: { [Op.in]: approval_ids },
      council: 'regulatory'
    };

    if (!['system_admin', 'super_admin'].includes(userRole)) {
      whereClause.institution_id = userInstitutionId;
    }

    let result;
    switch (action) {
      case 'update_status':
        if (!data.status) {
          throw new AppError('Status is required for update action', 400);
        }
        result = await Approval.update(
          { status: data.status },
          { where: whereClause }
        );
        break;
      
      case 'update_priority':
        if (!data.priority_level) {
          throw new AppError('Priority level is required for update action', 400);
        }
        result = await Approval.update(
          { priority_level: data.priority_level },
          { where: whereClause }
        );
        break;
      
      default:
        throw new AppError('Invalid action', 400);
    }

    // Log bulk operation
    logComplianceEvent('bulk_approval_update', userInstitutionId, {
      action,
      approvalIds: approval_ids,
      updatedBy: req.user.userId,
      updatedCount: result[0]
    });

    res.status(200).json({
      status: 'success',
      data: {
        message: `Bulk ${action} completed successfully`,
        updatedCount: result[0]
      }
    });
  })
);

module.exports = router;