const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const sequelize = require('../../config/database').sequelize;
const SelfAuditReport = require('../../models/SelfAuditReport');
const User = require('../../models/User');
const Organization = require('../../models/Organization');

// Get all self audit reports
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      auditPeriod,
      userId,
      organizationId,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const whereClause = {};
    
    if (status) whereClause.status = status;
    if (auditPeriod) whereClause.auditPeriod = auditPeriod;
    if (userId) whereClause.userId = userId;
    if (organizationId) whereClause.organizationId = organizationId;

    const reports = await SelfAuditReport.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'reviewer',
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
      data: reports.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(reports.count / parseInt(limit)),
        totalItems: reports.count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching self audit reports',
      error: error.message
    });
  }
});

// Get self audit report by ID
router.get('/:id', async (req, res) => {
  try {
    const report = await SelfAuditReport.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Organization,
          as: 'organization',
          attributes: ['id', 'name', 'registrationNumber']
        }
      ]
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Self audit report not found'
      });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching self audit report',
      error: error.message
    });
  }
});

// Create new self audit report
router.post('/', [
  body('userId').isUUID().withMessage('Valid user ID is required'),
  body('organizationId').isUUID().withMessage('Valid organization ID is required'),
  body('reportTitle').notEmpty().withMessage('Report title is required'),
  body('auditPeriod').isIn(['monthly', 'quarterly', 'semi-annual', 'annual']).withMessage('Invalid audit period'),
  body('status').optional().isIn(['draft', 'in_progress', 'completed', 'submitted', 'reviewed', 'approved', 'rejected']).withMessage('Invalid status')
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

    const reportData = {
      ...req.body,
      reportDate: req.body.reportDate || new Date().toISOString().split('T')[0]
    };

    const report = await SelfAuditReport.create(reportData);

    const reportWithRelations = await SelfAuditReport.findByPk(report.id, {
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
      message: 'Self audit report created successfully',
      data: reportWithRelations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating self audit report',
      error: error.message
    });
  }
});

// Update self audit report
router.put('/:id', [
  body('reportTitle').optional().notEmpty().withMessage('Report title cannot be empty'),
  body('auditPeriod').optional().isIn(['monthly', 'quarterly', 'semi-annual', 'annual']).withMessage('Invalid audit period'),
  body('status').optional().isIn(['draft', 'in_progress', 'completed', 'submitted', 'reviewed', 'approved', 'rejected']).withMessage('Invalid status'),
  body('overallScore').optional().isFloat({ min: 0, max: 100 }).withMessage('Overall score must be between 0 and 100')
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

    const report = await SelfAuditReport.findByPk(req.params.id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Self audit report not found'
      });
    }

    await report.update(req.body);

    const updatedReport = await SelfAuditReport.findByPk(report.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'reviewer',
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
      message: 'Self audit report updated successfully',
      data: updatedReport
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating self audit report',
      error: error.message
    });
  }
});

// Delete self audit report
router.delete('/:id', async (req, res) => {
  try {
    const report = await SelfAuditReport.findByPk(req.params.id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Self audit report not found'
      });
    }

    await report.destroy();

    res.json({
      success: true,
      message: 'Self audit report deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting self audit report',
      error: error.message
    });
  }
});

// Submit self audit report for review
router.patch('/:id/submit', async (req, res) => {
  try {
    const report = await SelfAuditReport.findByPk(req.params.id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Self audit report not found'
      });
    }

    if (report.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Only completed reports can be submitted'
      });
    }

    await report.update({
      status: 'submitted',
      submissionDate: new Date()
    });

    res.json({
      success: true,
      message: 'Self audit report submitted for review',
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error submitting report',
      error: error.message
    });
  }
});

// Review self audit report
router.patch('/:id/review', [
  body('reviewerId').isUUID().withMessage('Valid reviewer ID is required'),
  body('reviewComments').notEmpty().withMessage('Review comments are required'),
  body('status').isIn(['reviewed', 'approved', 'rejected']).withMessage('Invalid review status')
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

    const report = await SelfAuditReport.findByPk(req.params.id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Self audit report not found'
      });
    }

    if (report.status !== 'submitted') {
      return res.status(400).json({
        success: false,
        message: 'Only submitted reports can be reviewed'
      });
    }

    const updateData = {
      reviewerId: req.body.reviewerId,
      reviewComments: req.body.reviewComments,
      status: req.body.status,
      reviewDate: new Date()
    };

    if (req.body.status === 'approved') {
      updateData.approvalDate = new Date();
    }

    await report.update(updateData);

    const reviewedReport = await SelfAuditReport.findByPk(report.id, {
      include: [
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Self audit report reviewed successfully',
      data: reviewedReport
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error reviewing report',
      error: error.message
    });
  }
});

// Get self audit report statistics
router.get('/statistics/overview', async (req, res) => {
  try {
    const { organizationId, userId } = req.query;
    
    const whereClause = {};
    if (organizationId) whereClause.organizationId = organizationId;
    if (userId) whereClause.userId = userId;

    const [
      totalReports,
      draftReports,
      inProgressReports,
      completedReports,
      submittedReports,
      reviewedReports,
      approvedReports,
      rejectedReports,
      averageScore,
      totalComplianceItems,
      totalNonCompliantItems
    ] = await Promise.all([
      SelfAuditReport.count({ where: whereClause }),
      SelfAuditReport.count({ where: { ...whereClause, status: 'draft' } }),
      SelfAuditReport.count({ where: { ...whereClause, status: 'in_progress' } }),
      SelfAuditReport.count({ where: { ...whereClause, status: 'completed' } }),
      SelfAuditReport.count({ where: { ...whereClause, status: 'submitted' } }),
      SelfAuditReport.count({ where: { ...whereClause, status: 'reviewed' } }),
      SelfAuditReport.count({ where: { ...whereClause, status: 'approved' } }),
      SelfAuditReport.count({ where: { ...whereClause, status: 'rejected' } }),
      SelfAuditReport.findAll({
        where: { ...whereClause, status: 'approved' },
        attributes: [[sequelize.fn('AVG', sequelize.col('overallScore')), 'averageScore']]
      }),
      SelfAuditReport.sum('totalComplianceItems', { where: { ...whereClause, status: 'approved' } }),
      SelfAuditReport.sum('nonCompliantItems', { where: { ...whereClause, status: 'approved' } })
    ]);

    res.json({
      success: true,
      data: {
        totalReports,
        draftReports,
        inProgressReports,
        completedReports,
        submittedReports,
        reviewedReports,
        approvedReports,
        rejectedReports,
        averageScore: averageScore[0]?.averageScore || 0,
        totalComplianceItems: totalComplianceItems || 0,
        totalNonCompliantItems: totalNonCompliantItems || 0,
        completionRate: totalReports > 0 ? ((completedReports / totalReports) * 100).toFixed(2) : 0,
        approvalRate: completedReports > 0 ? ((approvedReports / completedReports) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching report statistics',
      error: error.message
    });
  }
});

// Get reports by period
router.get('/period/:auditPeriod', async (req, res) => {
  try {
    const { auditPeriod } = req.params;
    const {
      page = 1,
      limit = 10,
      organizationId,
      userId,
      status,
      sortBy = 'reportDate',
      sortOrder = 'DESC'
    } = req.query;

    const whereClause = { auditPeriod };
    if (organizationId) whereClause.organizationId = organizationId;
    if (userId) whereClause.userId = userId;
    if (status) whereClause.status = status;

    const reports = await SelfAuditReport.findAndCountAll({
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
      data: reports.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(reports.count / parseInt(limit)),
        totalItems: reports.count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching reports by period',
      error: error.message
    });
  }
});

// Get overdue reports
router.get('/overdue', async (req, res) => {
  try {
    const { organizationId, userId } = req.query;
    
    const whereClause = {
      status: { [Op.in]: ['draft', 'in_progress'] },
      reportDate: { [Op.lt]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Reports older than 7 days
    };
    
    if (organizationId) whereClause.organizationId = organizationId;
    if (userId) whereClause.userId = userId;

    const overdueReports = await SelfAuditReport.findAll({
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
      order: [['reportDate', 'ASC']]
    });

    res.json({
      success: true,
      data: overdueReports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching overdue reports',
      error: error.message
    });
  }
});

// Generate compliance summary
router.get('/:id/compliance-summary', async (req, res) => {
  try {
    const report = await SelfAuditReport.findByPk(req.params.id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Self audit report not found'
      });
    }

    const {
      totalComplianceItems,
      compliantItems,
      nonCompliantItems,
      partiallyCompliantItems,
      notApplicableItems,
      criticalIssues,
      majorIssues,
      minorIssues,
      overallScore
    } = report;

    const complianceRate = totalComplianceItems > 0 ? 
      ((compliantItems / totalComplianceItems) * 100).toFixed(2) : 0;

    const summary = {
      reportId: report.id,
      reportTitle: report.reportTitle,
      auditPeriod: report.auditPeriod,
      overallScore: overallScore,
      complianceRate: complianceRate,
      items: {
        total: totalComplianceItems,
        compliant: compliantItems,
        nonCompliant: nonCompliantItems,
        partiallyCompliant: partiallyCompliantItems,
        notApplicable: notApplicableItems
      },
      issues: {
        critical: criticalIssues,
        major: majorIssues,
        minor: minorIssues,
        total: criticalIssues + majorIssues + minorIssues
      },
      status: report.status,
      riskLevel: criticalIssues > 0 ? 'critical' : 
                majorIssues > 0 ? 'high' : 
                minorIssues > 0 ? 'medium' : 'low'
    };

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating compliance summary',
      error: error.message
    });
  }
});

// Bulk update report status
router.patch('/bulk-update-status', [
  body('reportIds').isArray({ min: 1 }).withMessage('Report IDs array is required'),
  body('status').isIn(['draft', 'in_progress', 'completed', 'submitted', 'reviewed', 'approved', 'rejected']).withMessage('Invalid status')
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

    const { reportIds, status, userId } = req.body;
    const updateData = { status };

    if (status === 'submitted') {
      updateData.submissionDate = new Date();
    } else if (status === 'reviewed') {
      updateData.reviewDate = new Date();
    } else if (status === 'approved') {
      updateData.approvalDate = new Date();
    }

    const updatedReports = await SelfAuditReport.update(updateData, {
      where: {
        id: { [Op.in]: reportIds },
        ...(userId && { userId })
      },
      returning: true
    });

    res.json({
      success: true,
      message: `${updatedReports[0]} self audit reports updated successfully`,
      data: updatedReports[1]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating reports',
      error: error.message
    });
  }
});

module.exports = router;