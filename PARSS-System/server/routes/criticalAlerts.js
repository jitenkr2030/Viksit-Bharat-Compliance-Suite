const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const AlertService = require('../services/AlertService');
const NotificationService = require('../services/NotificationService');
const logger = require('../middleware/logger');

// @route   GET /api/alerts/critical-status
// @desc    Get critical compliance status and alerts
// @access  Private
router.get('/critical-status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const institutionId = req.user.institutionId;

    // Get critical compliance alerts
    const criticalAlerts = await AlertService.getCriticalAlerts(institutionId, {
      timeRange: '30d', // Next 30 days
      severity: ['critical', 'high']
    });

    // Get risk assessment
    const riskAssessment = await require('../services/RiskAssessmentService')
      .assessComplianceRisk(institutionId);

    // Get upcoming deadlines
    const upcomingDeadlines = await require('../services/DeadlineService')
      .getUpcomingDeadlines(institutionId, 90); // Next 90 days

    const response = {
      timestamp: new Date(),
      institutionId,
      criticalAlerts: {
        count: criticalAlerts.length,
        alerts: criticalAlerts,
        maxSeverity: criticalAlerts.length > 0 ? 
          Math.max(...criticalAlerts.map(a => a.severity_score)) : 0
      },
      riskAssessment: {
        overallRiskScore: riskAssessment.overallScore,
        riskLevel: riskAssessment.riskLevel,
        predictedPenalty: riskAssessment.predictedPenalty,
        riskFactors: riskAssessment.factors
      },
      upcomingDeadlines: {
        count: upcomingDeadlines.length,
        deadlines: upcomingDeadlines.map(d => ({
          id: d.id,
          title: d.title,
          type: d.type,
          dueDate: d.dueDate,
          daysRemaining: d.daysRemaining,
          priority: d.priority,
          actionRequired: d.actionRequired
        }))
      },
      summary: {
        totalRiskItems: criticalAlerts.length + upcomingDeadlines.length,
        highestPriority: getHighestPriority(criticalAlerts, upcomingDeadlines),
        actionRequired: (criticalAlerts.length + upcomingDeadlines.length) > 0,
        nextAction: getNextRecommendedAction(criticalAlerts, upcomingDeadlines)
      }
    };

    // Log access for audit
    logger.info('Critical compliance status accessed', {
      userId,
      institutionId,
      criticalAlerts: criticalAlerts.length,
      riskScore: riskAssessment.overallScore,
      upcomingDeadlines: upcomingDeadlines.length
    });

    res.json(response);

  } catch (error) {
    logger.error('Critical status error:', { error: error.message, stack: error.stack });
    res.status(500).json({
      error: 'Failed to get critical compliance status',
      message: error.message
    });
  }
});

// @route   POST /api/alerts/send-critical
// @desc    Send critical compliance alerts via multiple channels
// @access  Private (Admin/Compliance Officer)
router.post('/send-critical', authenticateToken, [
  body('alertId').notEmpty().withMessage('Alert ID is required'),
  body('channels').isArray({ min: 1 }).withMessage('At least one notification channel required'),
  body('channels.*').isIn(['sms', 'whatsapp', 'email', 'phone', 'in_app']).withMessage('Invalid notification channel')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { alertId, channels, customMessage } = req.body;
    const userId = req.user.userId;
    const institutionId = req.user.institutionId;

    // Get alert details
    const alert = await AlertService.getAlert(alertId);
    if (!alert || alert.institution_id !== institutionId) {
      return res.status(404).json({
        error: 'Alert not found',
        message: 'The specified alert does not exist or access is denied'
      });
    }

    // Send notifications via specified channels
    const notificationResults = await NotificationService.sendMultiChannelAlert({
      alert,
      channels,
      customMessage,
      institutionId,
      triggeredBy: userId
    });

    // Update alert with notification status
    await AlertService.updateAlertNotificationStatus(alertId, {
      channels: notificationResults,
      lastNotified: new Date(),
      notificationCount: (alert.notification_count || 0) + 1
    });

    logger.info('Critical alert sent via multiple channels', {
      alertId,
      channels,
      institutionId,
      userId,
      results: notificationResults
    });

    res.json({
      message: 'Critical alert sent successfully',
      alertId,
      channels,
      results: notificationResults,
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('Send critical alert error:', { error: error.message, stack: error.stack });
    res.status(500).json({
      error: 'Failed to send critical alert',
      message: error.message
    });
  }
});

// @route   GET /api/alerts/risk-assessment
// @desc    Get comprehensive risk assessment for institution
// @access  Private
router.get('/risk-assessment', authenticateToken, async (req, res) => {
  try {
    const institutionId = req.user.institutionId;
    const assessmentType = req.query.type || 'comprehensive'; // comprehensive, predictive, historical

    const RiskAssessmentService = require('../services/RiskAssessmentService');
    const riskAssessment = await RiskAssessmentService.generateAssessment(institutionId, {
      type: assessmentType,
      includePredictions: true,
      includeRecommendations: true,
      timeHorizon: '12' // months
    });

    res.json({
      timestamp: new Date(),
      institutionId,
      assessmentType,
      riskAssessment
    });

  } catch (error) {
    logger.error('Risk assessment error:', { error: error.message, stack: error.stack });
    res.status(500).json({
      error: 'Failed to generate risk assessment',
      message: error.message
    });
  }
});

// @route   GET /api/alerts/deadlines
// @desc    Get smart deadline management information
// @access  Private
router.get('/deadlines', authenticateToken, async (req, res) => {
  try {
    const institutionId = req.user.institutionId;
    const timeRange = req.query.range || '90'; // days
    const includeCompleted = req.query.includeCompleted === 'true';

    const DeadlineService = require('../services/DeadlineService');
    
    const deadlines = await DeadlineService.getSmartDeadlines(institutionId, {
      timeRange: parseInt(timeRange),
      includeCompleted,
      priority: req.query.priority,
      category: req.query.category
    });

    const deadlineAnalytics = await DeadlineService.getDeadlineAnalytics(institutionId);

    res.json({
      timestamp: new Date(),
      institutionId,
      timeRange: `${timeRange} days`,
      deadlines: {
        total: deadlines.length,
        upcoming: deadlines.filter(d => d.status === 'upcoming').length,
        overdue: deadlines.filter(d => d.status === 'overdue').length,
        completed: deadlines.filter(d => d.status === 'completed').length,
        items: deadlines
      },
      analytics: deadlineAnalytics,
      recommendations: await DeadlineService.getRecommendations(institutionId)
    });

  } catch (error) {
    logger.error('Deadlines error:', { error: error.message, stack: error.stack });
    res.status(500).json({
      error: 'Failed to get deadline information',
      message: error.message
    });
  }
});

// @route   POST /api/alerts/schedule-deadline-tasks
// @desc    Schedule automated tasks for deadlines
// @access  Private (Admin/Compliance Officer)
router.post('/schedule-deadline-tasks', authenticateToken, [
  body('deadlineId').notEmpty().withMessage('Deadline ID is required'),
  body('tasks').isArray({ min: 1 }).withMessage('At least one task required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { deadlineId, tasks } = req.body;
    const userId = req.user.userId;
    const institutionId = req.user.institutionId;

    const DeadlineService = require('../services/DeadlineService');
    
    const scheduledTasks = await DeadlineService.scheduleTasks(deadlineId, tasks, {
      assignedBy: userId,
      institutionId
    });

    logger.info('Deadline tasks scheduled', {
      deadlineId,
      taskCount: tasks.length,
      institutionId,
      userId
    });

    res.json({
      message: 'Deadline tasks scheduled successfully',
      deadlineId,
      scheduledTasks,
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('Schedule deadline tasks error:', { error: error.message, stack: error.stack });
    res.status(500).json({
      error: 'Failed to schedule deadline tasks',
      message: error.message
    });
  }
});

// @route   GET /api/alerts/dashboard
// @desc    Get compliance dashboard summary
// @access  Private
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const institutionId = req.user.institutionId;
    
    const dashboardData = await Promise.all([
      AlertService.getDashboardSummary(institutionId),
      require('../services/RiskAssessmentService').getDashboardRisk(institutionId),
      require('../services/DeadlineService').getDashboardDeadlines(institutionId),
      require('../services/NotificationService').getNotificationStats(institutionId)
    ]);

    const [alertSummary, riskData, deadlineData, notificationStats] = dashboardData;

    const dashboard = {
      timestamp: new Date(),
      institutionId,
      overallScore: calculateOverallComplianceScore(alertSummary, riskData, deadlineData),
      alerts: alertSummary,
      risk: riskData,
      deadlines: deadlineData,
      notifications: notificationStats,
      quickActions: generateQuickActions(alertSummary, riskData, deadlineData),
      trends: {
        compliance: await calculateComplianceTrends(institutionId),
        risk: await calculateRiskTrends(institutionId),
        deadlines: await calculateDeadlineTrends(institutionId)
      }
    };

    res.json(dashboard);

  } catch (error) {
    logger.error('Dashboard error:', { error: error.message, stack: error.stack });
    res.status(500).json({
      error: 'Failed to generate dashboard',
      message: error.message
    });
  }
});

// Helper functions
function getHighestPriority(alerts, deadlines) {
  const allItems = [
    ...alerts.map(a => ({ type: 'alert', priority: a.severity, data: a })),
    ...deadlines.map(d => ({ type: 'deadline', priority: d.priority, data: d }))
  ];
  
  if (allItems.length === 0) return null;
  
  return allItems.sort((a, b) => {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
  })[0];
}

function getNextRecommendedAction(alerts, deadlines) {
  const criticalItems = [...alerts, ...deadlines].filter(item => 
    item.severity === 'critical' || item.priority === 'critical' || item.daysRemaining <= 7
  );
  
  if (criticalItems.length > 0) {
    return {
      action: 'immediate_action_required',
      description: 'Critical compliance issues require immediate attention',
      priority: 'urgent',
      estimatedTime: '2-4 hours'
    };
  }
  
  return {
    action: 'review_and_plan',
    description: 'Review compliance status and plan upcoming activities',
    priority: 'normal',
    estimatedTime: '1-2 hours'
  };
}

function calculateOverallComplianceScore(alertSummary, riskData, deadlineData) {
  // Weighted scoring algorithm
  const alertScore = Math.max(0, 100 - (alertSummary.critical * 20) - (alertSummary.high * 10));
  const riskScore = Math.max(0, 100 - (riskData.overallScore || 50));
  const deadlineScore = Math.max(0, 100 - (deadlineData.overdue * 15));
  
  return Math.round((alertScore * 0.4 + riskScore * 0.4 + deadlineScore * 0.2));
}

function generateQuickActions(alertSummary, riskData, deadlineData) {
  const actions = [];
  
  if (alertSummary.critical > 0) {
    actions.push({
      title: 'Address Critical Alerts',
      description: `${alertSummary.critical} critical alerts need immediate attention`,
      action: 'view_alerts',
      priority: 'high',
      estimatedTime: '30 minutes'
    });
  }
  
  if (riskData.overallScore > 70) {
    actions.push({
      title: 'Review Risk Assessment',
      description: 'High risk areas require immediate review',
      action: 'view_risk',
      priority: 'high',
      estimatedTime: '45 minutes'
    });
  }
  
  if (deadlineData.overdue > 0) {
    actions.push({
      title: 'Handle Overdue Items',
      description: `${deadlineData.overdue} overdue deadlines need attention`,
      action: 'view_deadlines',
      priority: 'high',
      estimatedTime: '1 hour'
    });
  }
  
  return actions;
}

async function calculateComplianceTrends(institutionId) {
  // Implementation for compliance trend analysis
  return {
    direction: 'improving',
    changePercent: 5.2,
    period: '30 days'
  };
}

async function calculateRiskTrends(institutionId) {
  // Implementation for risk trend analysis
  return {
    direction: 'decreasing',
    changePercent: -3.1,
    period: '30 days'
  };
}

async function calculateDeadlineTrends(institutionId) {
  // Implementation for deadline trend analysis
  return {
    direction: 'stable',
    changePercent: 0.8,
    period: '30 days'
  };
}

module.exports = router;