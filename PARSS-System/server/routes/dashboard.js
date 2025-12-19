const express = require('express');
const { Op } = require('sequelize');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const { authenticateToken, restrictTo } = require('../middleware/auth');
const { validationRules, handleValidationErrors } = require('../middleware/validation');
const { logUserActivity, logComplianceEvent } = require('../middleware/logger');

// Import models
const Institution = require('../models/Institution');
const Faculty = require('../models/Faculty');
const Approval = require('../models/Approval');
const Document = require('../models/Document');
const Alert = require('../models/Alert');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get dashboard overview data
router.get('/overview', catchAsync(async (req, res) => {
  const userInstitutionId = req.user.institutionId;
  const userRole = req.user.role;

  // Base where clause for data filtering
  let whereClause = {};
  if (!['system_admin', 'super_admin'].includes(userRole)) {
    whereClause.institution_id = userInstitutionId;
  }

  // Get basic counts
  const [
    totalInstitutions,
    totalFaculties,
    totalApprovals,
    totalDocuments,
    activeAlerts
  ] = await Promise.all([
    Institution.count({ where: whereClause.institution_id ? { id: whereClause.institution_id } : {} }),
    Faculty.count({ where: { ...whereClause, is_active: true } }),
    Approval.count({ where: whereClause }),
    Document.count({ where: { ...whereClause, status: 'active' } }),
    Alert.count({ where: { ...whereClause, status: 'active' } })
  ]);

  // Get compliance scores by council
  const councilStats = await Promise.all([
    // Regulatory Council
    Approval.findAll({
      where: { ...whereClause, council: 'regulatory' },
      attributes: [
        [Approval.sequelize.fn('COUNT', Approval.sequelize.col('id')), 'total'],
        [Approval.sequelize.fn('SUM', Approval.sequelize.literal("CASE WHEN status = 'approved' THEN 1 ELSE 0 END")), 'approved'],
        [Approval.sequelize.fn('SUM', Approval.sequelize.literal("CASE WHEN valid_until < CURRENT_DATE THEN 1 ELSE 0 END")), 'expired']
      ]
    }),
    
    // Standards Council
    Faculty.findAll({
      where: { ...whereClause, is_active: true },
      attributes: [
        [Faculty.sequelize.fn('COUNT', Faculty.sequelize.col('id')), 'total'],
        [Faculty.sequelize.fn('SUM', Faculty.sequelize.literal("CASE WHEN compliance_status = 'compliant' THEN 1 ELSE 0 END")), 'compliant'],
        [Faculty.sequelize.fn('SUM', Faculty.sequelize.literal("CASE WHEN background_check_status != 'clear' THEN 1 ELSE 0 END")), 'background_check_pending']
      ]
    }),
    
    // Accreditation Council
    Approval.findAll({
      where: { ...whereClause, council: 'accreditation' },
      attributes: [
        [Approval.sequelize.fn('COUNT', Approval.sequelize.col('id')), 'total'],
        [Approval.sequelize.fn('SUM', Approval.sequelize.literal("CASE WHEN status = 'approved' THEN 1 ELSE 0 END")), 'approved'],
        [Approval.sequelize.fn('SUM', Approval.sequelize.literal("CASE WHEN renewal_status = 'not_applied' AND valid_until < CURRENT_DATE + INTERVAL '30 days' THEN 1 ELSE 0 END")), 'renewal_due']
      ]
    })
  ]);

  // Calculate compliance scores
  const regulatoryData = councilStats[0][0];
  const standardsData = councilStats[1][0];
  const accreditationData = councilStats[2][0];

  const regulatoryScore = regulatoryData ? 
    Math.round((parseInt(regulatoryData.get('approved')) / parseInt(regulatoryData.get('total'))) * 100) : 0;
    
  const standardsScore = standardsData ? 
    Math.round((parseInt(standardsData.get('compliant')) / parseInt(standardsData.get('total'))) * 100) : 0;
    
  const accreditationScore = accreditationData ? 
    Math.round((parseInt(accreditationData.get('approved')) / parseInt(accreditationData.get('total'))) * 100) : 0;

  // Get recent alerts
  const recentAlerts = await Alert.findAll({
    where: { ...whereClause, status: 'active' },
    order: [['created_at', 'DESC']],
    limit: 5,
    include: [
      {
        model: Institution,
        as: 'Institution',
        attributes: ['name', 'code']
      }
    ]
  });

  // Get upcoming deadlines
  const upcomingDeadlines = await Approval.findAll({
    where: {
      ...whereClause,
      status: 'approved',
      valid_until: {
        [Op.between]: [new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]
      }
    },
    order: [['valid_until', 'ASC']],
    limit: 10,
    include: [
      {
        model: Institution,
        as: 'Institution',
        attributes: ['name', 'code']
      }
    ]
  });

  res.status(200).json({
    status: 'success',
    data: {
      overview: {
        totalInstitutions,
        totalFaculties,
        totalApprovals,
        totalDocuments,
        activeAlerts
      },
      complianceScores: {
        regulatory: {
          score: regulatoryScore,
          total: parseInt(regulatoryData?.get('total') || 0),
          approved: parseInt(regulatoryData?.get('approved') || 0),
          expired: parseInt(regulatoryData?.get('expired') || 0)
        },
        standards: {
          score: standardsScore,
          total: parseInt(standardsData?.get('total') || 0),
          compliant: parseInt(standardsData?.get('compliant') || 0),
          backgroundCheckPending: parseInt(standardsData?.get('background_check_pending') || 0)
        },
        accreditation: {
          score: accreditationScore,
          total: parseInt(accreditationData?.get('total') || 0),
          approved: parseInt(accreditationData?.get('approved') || 0),
          renewalDue: parseInt(accreditationData?.get('renewal_due') || 0)
        }
      },
      recentAlerts,
      upcomingDeadlines
    }
  });
}));

// Get compliance statistics
router.get('/statistics', catchAsync(async (req, res) => {
  const userInstitutionId = req.user.institutionId;
  const userRole = req.user.role;

  let whereClause = {};
  if (!['system_admin', 'super_admin'].includes(userRole)) {
    whereClause.institution_id = userInstitutionId;
  }

  // Monthly trend data (last 12 months)
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const monthlyTrends = await Promise.all([
    // New approvals by month
    Approval.findAll({
      where: {
        ...whereClause,
        created_at: { [Op.gte]: twelveMonthsAgo }
      },
      attributes: [
        [Approval.sequelize.fn('DATE_TRUNC', 'month', Approval.sequelize.col('created_at')), 'month'],
        [Approval.sequelize.fn('COUNT', '*'), 'count']
      ],
      group: ['month'],
      order: [['month', 'ASC']]
    }),

    // Alerts by month
    Alert.findAll({
      where: {
        ...whereClause,
        created_at: { [Op.gte]: twelveMonthsAgo }
      },
      attributes: [
        [Alert.sequelize.fn('DATE_TRUNC', 'month', Alert.sequelize.col('created_at')), 'month'],
        [Alert.sequelize.fn('COUNT', '*'), 'count'],
        [Alert.sequelize.fn('SUM', Alert.sequelize.literal("CASE WHEN severity = 'critical' THEN 1 ELSE 0 END")), 'critical_count']
      ],
      group: ['month'],
      order: [['month', 'ASC']]
    })
  ]);

  // Department-wise faculty distribution
  const departmentStats = await Faculty.findAll({
    where: { ...whereClause, is_active: true },
    attributes: [
      'department',
      [Faculty.sequelize.fn('COUNT', '*'), 'faculty_count'],
      [Faculty.sequelize.fn('AVG', Faculty.sequelize.col('experience_years')), 'avg_experience']
    ],
    group: ['department'],
    order: [['faculty_count', 'DESC']]
  });

  // Document categories distribution
  const documentStats = await Document.findAll({
    where: { ...whereClause, status: 'active' },
    attributes: [
      'category',
      [Document.sequelize.fn('COUNT', '*'), 'document_count'],
      [Document.sequelize.fn('SUM', Document.sequelize.col('file_size')), 'total_size']
    ],
    group: ['category'],
    order: [['document_count', 'DESC']]
  });

  res.status(200).json({
    status: 'success',
    data: {
      monthlyTrends: {
        approvals: monthlyTrends[0],
        alerts: monthlyTrends[1]
      },
      departmentStats,
      documentStats
    }
  });
}));

// Get risk assessment
router.get('/risk-assessment', catchAsync(async (req, res) => {
  const userInstitutionId = req.user.institutionId;
  const userRole = req.user.role;

  let whereClause = {};
  if (!['system_admin', 'super_admin'].includes(userRole)) {
    whereClause.institution_id = userInstitutionId;
  }

  // Get expired approvals (high risk)
  const expiredApprovals = await Approval.count({
    where: {
      ...whereClause,
      status: 'approved',
      valid_until: { [Op.lt]: new Date() }
    }
  });

  // Get approvals expiring in 30 days (medium risk)
  const expiringApprovals = await Approval.count({
    where: {
      ...whereClause,
      status: 'approved',
      valid_until: {
        [Op.between]: [new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]
      }
    }
  });

  // Get faculty with expired background checks
  const expiredBackgroundChecks = await Faculty.count({
    where: {
      ...whereClause,
      is_active: true,
      background_check_status: 'expired'
    }
  });

  // Get critical alerts
  const criticalAlerts = await Alert.count({
    where: {
      ...whereClause,
      status: 'active',
      severity: 'critical'
    }
  });

  // Calculate overall risk score
  const riskFactors = {
    expiredApprovals: expiredApprovals * 10,
    expiringApprovals: expiringApprovals * 5,
    expiredBackgroundChecks: expiredBackgroundChecks * 8,
    criticalAlerts: criticalAlerts * 15
  };

  const totalRiskScore = Object.values(riskFactors).reduce((sum, score) => sum + score, 0);
  const maxPossibleScore = 100;
  const riskPercentage = Math.min((totalRiskScore / maxPossibleScore) * 100, 100);

  let riskLevel = 'low';
  if (riskPercentage > 70) riskLevel = 'critical';
  else if (riskPercentage > 40) riskLevel = 'high';
  else if (riskPercentage > 20) riskLevel = 'medium';

  res.status(200).json({
    status: 'success',
    data: {
      overallRisk: {
        score: Math.round(riskPercentage),
        level: riskLevel,
        factors: riskFactors
      },
      riskDetails: {
        expiredApprovals,
        expiringApprovals,
        expiredBackgroundChecks,
        criticalAlerts
      },
      recommendations: [
        ...(expiredApprovals > 0 ? ['Renew expired approvals immediately'] : []),
        ...(expiringApprovals > 0 ? ['Start renewal process for approvals expiring soon'] : []),
        ...(expiredBackgroundChecks > 0 ? ['Update background checks for faculty'] : []),
        ...(criticalAlerts > 0 ? ['Address critical compliance alerts'] : [])
      ]
    }
  });
}));

// Get recent activities
router.get('/activities', catchAsync(async (req, res) => {
  const userInstitutionId = req.user.institutionId;
  const userRole = req.user.role;

  let whereClause = {};
  if (!['system_admin', 'super_admin'].includes(userRole)) {
    whereClause.institution_id = userInstitutionId;
  }

  // Get recent activities from different models
  const [
    recentApprovals,
    recentDocuments,
    recentAlerts
  ] = await Promise.all([
    Approval.findAll({
      where: whereClause,
      order: [['updated_at', 'DESC']],
      limit: 10,
      include: [
        {
          model: Institution,
          as: 'Institution',
          attributes: ['name', 'code']
        }
      ]
    }),
    
    Document.findAll({
      where: { ...whereClause, status: 'active' },
      order: [['updated_at', 'DESC']],
      limit: 10,
      include: [
        {
          model: Institution,
          as: 'Institution',
          attributes: ['name', 'code']
        }
      ]
    }),
    
    Alert.findAll({
      where: { ...whereClause },
      order: [['updated_at', 'DESC']],
      limit: 10,
      include: [
        {
          model: Institution,
          as: 'Institution',
          attributes: ['name', 'code']
        }
      ]
    })
  ]);

  // Format activities for timeline
  const activities = [
    ...recentApprovals.map(approval => ({
      id: approval.id,
      type: 'approval',
      action: approval.status === 'approved' ? 'approved' : 'updated',
      title: `${approval.approval_type.replace(/_/g, ' ').toUpperCase()} ${approval.status}`,
      description: `Approval #${approval.approval_number} was ${approval.status}`,
      timestamp: approval.updated_at,
      institution: approval.Institution?.name || 'Unknown'
    })),
    
    ...recentDocuments.map(document => ({
      id: document.id,
      type: 'document',
      action: 'uploaded',
      title: document.title,
      description: `${document.document_type} document uploaded`,
      timestamp: document.updated_at,
      institution: document.Institution?.name || 'Unknown'
    })),
    
    ...recentAlerts.map(alert => ({
      id: alert.id,
      type: 'alert',
      action: alert.status,
      title: alert.title,
      description: alert.message,
      timestamp: alert.updated_at,
      institution: alert.Institution?.name || 'Unknown',
      severity: alert.severity
    }))
  ];

  // Sort by timestamp (most recent first)
  activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  res.status(200).json({
    status: 'success',
    data: {
      activities: activities.slice(0, 20) // Limit to 20 most recent
    }
  });
}));

module.exports = router;