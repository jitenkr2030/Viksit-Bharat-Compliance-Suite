const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const { authenticateToken, restrictTo } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const logger = require('../middleware/logger');

// Get all alerts for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, type, priority, page = 1, limit = 20 } = req.query;
    const userId = req.user.id;
    
    // Mock alerts data
    const mockAlerts = [
      {
        id: 'alert_1',
        userId,
        title: 'Accreditation Renewal Due',
        message: 'Your institution\'s accreditation is due for renewal in 30 days.',
        type: 'accreditation',
        priority: 'high',
        status: 'unread',
        category: 'deadline',
        actionRequired: true,
        actionUrl: '/accreditation/renewal',
        institutionId: '1',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        readAt: null,
        dismissedAt: null
      },
      {
        id: 'alert_2',
        userId,
        title: 'Faculty Compliance Review',
        message: '3 faculty members need compliance documentation updates.',
        type: 'compliance',
        priority: 'medium',
        status: 'unread',
        category: 'documentation',
        actionRequired: true,
        actionUrl: '/faculty/compliance',
        institutionId: '1',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
        readAt: null,
        dismissedAt: null
      },
      {
        id: 'alert_3',
        userId,
        title: 'New Regulatory Guidelines',
        message: 'Updated guidelines for educational standards have been published.',
        type: 'regulatory',
        priority: 'low',
        status: 'read',
        category: 'information',
        actionRequired: false,
        actionUrl: '/regulatory/guidelines',
        institutionId: null,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        readAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        dismissedAt: null
      },
      {
        id: 'alert_4',
        userId,
        title: 'Standards Audit Scheduled',
        message: 'A routine standards audit has been scheduled for next week.',
        type: 'audit',
        priority: 'high',
        status: 'unread',
        category: 'audit',
        actionRequired: true,
        actionUrl: '/standards/audit/schedule',
        institutionId: '2',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        readAt: null,
        dismissedAt: null
      }
    ];

    let filteredAlerts = mockAlerts;
    
    if (status) {
      filteredAlerts = filteredAlerts.filter(alert => alert.status === status);
    }
    if (type) {
      filteredAlerts = filteredAlerts.filter(alert => alert.type === type);
    }
    if (priority) {
      filteredAlerts = filteredAlerts.filter(alert => alert.priority === priority);
    }

    // Filter by user role and institution
    if (req.user.role !== 'admin') {
      filteredAlerts = filteredAlerts.filter(alert => 
        !alert.institutionId || 
        req.user.institutions?.includes(alert.institutionId)
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedAlerts = filteredAlerts.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        alerts: paginatedAlerts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredAlerts.length,
          pages: Math.ceil(filteredAlerts.length / limit)
        },
        unreadCount: filteredAlerts.filter(alert => alert.status === 'unread').length
      }
    });
  } catch (error) {
    logger.error('Error fetching alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alerts'
    });
  }
});

// Create new alert
router.post('/',
  authenticateToken,
  restrictTo(['admin', 'regulatory_officer', 'standards_officer', 'accreditation_officer']),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('message').notEmpty().withMessage('Message is required'),
    body('type').isIn(['regulatory', 'compliance', 'accreditation', 'audit', 'deadline', 'general']).withMessage('Invalid alert type'),
    body('priority').isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority level'),
    body('category').isIn(['deadline', 'documentation', 'audit', 'information', 'reminder', 'violation']).withMessage('Invalid category'),
    body('targetUsers').optional().isArray().withMessage('Target users must be an array'),
    body('targetInstitutions').optional().isArray().withMessage('Target institutions must be an array'),
    body('expiresAt').optional().isISO8601().withMessage('Valid expiry date required')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const {
        title,
        message,
        type,
        priority,
        category,
        targetUsers,
        targetInstitutions,
        actionUrl,
        expiresAt
      } = req.body;

      const alert = {
        id: `alert_${Date.now()}`,
        title,
        message,
        type,
        priority,
        category,
        status: 'active',
        actionRequired: !!actionUrl,
        actionUrl,
        createdBy: req.user.id,
        createdAt: new Date(),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        targetUsers: targetUsers || [],
        targetInstitutions: targetInstitutions || [],
        readBy: [],
        dismissedBy: []
      };

      // If specific users/institutions are targeted, create individual alerts
      let alertsToCreate = [alert];
      
      if (targetUsers?.length > 0) {
        alertsToCreate = targetUsers.map(userId => ({
          ...alert,
          id: `alert_${Date.now()}_${userId}`,
          userId
        }));
      } else if (targetInstitutions?.length > 0) {
        // This would typically fetch users from these institutions and create alerts for them
        alertsToCreate = targetInstitutions.map(institutionId => ({
          ...alert,
          id: `alert_${Date.now()}_${institutionId}`,
          institutionId
        }));
      }

      logger.info(`Alert created: ${alert.id} by user ${req.user.id}`);

      res.json({
        success: true,
        message: 'Alert created successfully',
        data: {
          created: alertsToCreate.length,
          alerts: alertsToCreate
        }
      });
    } catch (error) {
      logger.error('Error creating alert:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create alert'
      });
    }
  }
);

// Mark alert as read
router.patch('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // This would typically update the database
    logger.info(`Alert marked as read: ${id} by user ${req.user.id}`);

    res.json({
      success: true,
      message: 'Alert marked as read'
    });
  } catch (error) {
    logger.error('Error marking alert as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark alert as read'
    });
  }
});

// Mark multiple alerts as read
router.patch('/read-multiple', authenticateToken, async (req, res) => {
  try {
    const { alertIds } = req.body;
    
    if (!Array.isArray(alertIds) || alertIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Alert IDs array is required'
      });
    }

    // This would typically update the database
    logger.info(`Multiple alerts marked as read: ${alertIds.length} alerts by user ${req.user.id}`);

    res.json({
      success: true,
      message: `${alertIds.length} alerts marked as read`
    });
  } catch (error) {
    logger.error('Error marking multiple alerts as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark alerts as read'
    });
  }
});

// Dismiss alert
router.patch('/:id/dismiss', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    // This would typically update the database
    logger.info(`Alert dismissed: ${id} by user ${req.user.id} - Reason: ${reason || 'No reason provided'}`);

    res.json({
      success: true,
      message: 'Alert dismissed successfully'
    });
  } catch (error) {
    logger.error('Error dismissing alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to dismiss alert'
    });
  }
});

// Get alert statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Mock statistics
    const stats = {
      total: 24,
      unread: 8,
      highPriority: 3,
      actionRequired: 5,
      thisWeek: 12,
      thisMonth: 18,
      byType: {
        regulatory: 5,
        compliance: 8,
        accreditation: 6,
        audit: 3,
        deadline: 2
      },
      byPriority: {
        critical: 1,
        high: 4,
        medium: 12,
        low: 7
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error fetching alert statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alert statistics'
    });
  }
});

// Delete alert (admin only)
router.delete('/:id',
  authenticateToken,
  restrictTo(['admin']),
  async (req, res) => {
    try {
      const { id } = req.params;
      
      // This would typically delete from database
      logger.info(`Alert deleted: ${id} by user ${req.user.id}`);

      res.json({
        success: true,
        message: 'Alert deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting alert:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete alert'
      });
    }
  }
);

// Bulk operations for admins
router.post('/bulk-actions',
  authenticateToken,
  restrictTo(['admin']),
  [
    body('action').isIn(['mark_read', 'dismiss', 'delete']).withMessage('Invalid bulk action'),
    body('alertIds').isArray({ min: 1 }).withMessage('Alert IDs array is required'),
    body('reason').optional().isString().withMessage('Reason must be a string')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { action, alertIds, reason } = req.body;

      // This would typically perform bulk operations on the database
      logger.info(`Bulk ${action} performed on ${alertIds.length} alerts by user ${req.user.id}`);

      res.json({
        success: true,
        message: `Bulk ${action} completed for ${alertIds.length} alerts`
      });
    } catch (error) {
      logger.error('Error performing bulk alert action:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to perform bulk action'
      });
    }
  }
);

module.exports = router;