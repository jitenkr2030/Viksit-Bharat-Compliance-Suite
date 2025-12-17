const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const logger = require('../middleware/logger');

// Get user notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;
    const userId = req.user.id;
    
    // Mock notifications data
    const mockNotifications = [
      {
        id: 'notif_1',
        userId,
        title: 'Welcome to Viksit Bharat Compliance Suite',
        message: 'Your account has been successfully created. You can now start managing compliance for your institution.',
        type: 'system',
        status: 'read',
        priority: 'normal',
        actionUrl: '/dashboard',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        readAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        expiresAt: null
      },
      {
        id: 'notif_2',
        userId,
        title: 'Document Upload Reminder',
        message: 'You have 3 pending document uploads for faculty qualifications.',
        type: 'reminder',
        status: 'unread',
        priority: 'high',
        actionUrl: '/documents/upload',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        readAt: null,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // expires in 24 hours
      },
      {
        id: 'notif_3',
        userId,
        title: 'System Maintenance Scheduled',
        message: 'Scheduled maintenance on December 20, 2024 from 2:00 AM to 4:00 AM IST.',
        type: 'maintenance',
        status: 'unread',
        priority: 'normal',
        actionUrl: null,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        readAt: null,
        expiresAt: new Date('2024-12-20T04:00:00Z')
      }
    ];

    let filteredNotifications = mockNotifications;
    
    if (status) {
      filteredNotifications = filteredNotifications.filter(notif => notif.status === status);
    }
    if (type) {
      filteredNotifications = filteredNotifications.filter(notif => notif.type === type);
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        notifications: paginatedNotifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredNotifications.length,
          pages: Math.ceil(filteredNotifications.length / limit)
        },
        unreadCount: filteredNotifications.filter(n => n.status === 'unread').length
      }
    });
  } catch (error) {
    logger.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

// Mark notification as read
router.patch('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    logger.info(`Notification marked as read: ${id} by user ${req.user.id}`);

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    logger.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
});

// Mark all notifications as read
router.patch('/read-all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    logger.info(`All notifications marked as read for user: ${userId}`);

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    logger.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read'
    });
  }
});

// Delete notification
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    logger.info(`Notification deleted: ${id} by user ${req.user.id}`);

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification'
    });
  }
});

module.exports = router;