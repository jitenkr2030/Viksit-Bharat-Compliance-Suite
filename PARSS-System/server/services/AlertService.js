const { Op } = require('sequelize');
const Alert = require('../models/Alert');
const Institution = require('../models/Institution');
const User = require('../models/User');
const logger = require('../middleware/logger');

class AlertService {
  /**
   * Get critical compliance alerts for an institution
   */
  async getCriticalAlerts(institutionId, options = {}) {
    try {
      const {
        timeRange = '30d',
        severity = ['critical', 'high'],
        category,
        limit = 50
      } = options;

      const timeFilter = this.getTimeFilter(timeRange);
      
      const whereClause = {
        institution_id: institutionId,
        severity: { [Op.in]: severity },
        created_at: timeFilter,
        is_active: true
      };

      if (category) {
        whereClause.category = category;
      }

      const alerts = await Alert.findAll({
        where: whereClause,
        order: [
          ['severity_score', 'DESC'],
          ['created_at', 'DESC']
        ],
        limit,
        include: [
          {
            model: User,
            as: 'Creator',
            attributes: ['id', 'first_name', 'last_name', 'email']
          }
        ]
      });

      return alerts.map(alert => ({
        id: alert.id,
        title: alert.title,
        message: alert.message,
        severity: alert.severity,
        severity_score: alert.severity_score,
        category: alert.category,
        type: alert.type,
        status: alert.status,
        action_required: alert.action_required,
        action_url: alert.action_url,
        due_date: alert.due_date,
        created_at: alert.created_at,
        updated_at: alert.updated_at,
        metadata: alert.metadata,
        creator: alert.Creator ? {
          name: `${alert.Creator.first_name} ${alert.Creator.last_name}`,
          email: alert.Creator.email
        } : null
      }));

    } catch (error) {
      logger.error('Error getting critical alerts:', { error: error.message, stack: error.stack });
      throw error;
    }
  }

  /**
   * Get a specific alert by ID
   */
  async getAlert(alertId) {
    try {
      const alert = await Alert.findByPk(alertId, {
        include: [
          {
            model: Institution,
            as: 'Institution',
            attributes: ['id', 'name', 'code']
          },
          {
            model: User,
            as: 'Creator',
            attributes: ['id', 'first_name', 'last_name', 'email']
          }
        ]
      });

      return alert;
    } catch (error) {
      logger.error('Error getting alert:', { error: error.message, stack: error.stack });
      throw error;
    }
  }

  /**
   * Update alert notification status
   */
  async updateAlertNotificationStatus(alertId, updateData) {
    try {
      const alert = await Alert.findByPk(alertId);
      if (!alert) {
        throw new Error('Alert not found');
      }

      await alert.update(updateData);
      
      logger.info('Alert notification status updated', { alertId, updateData });
      return alert;
    } catch (error) {
      logger.error('Error updating alert notification status:', { error: error.message, stack: error.stack });
      throw error;
    }
  }

  /**
   * Create a new critical alert
   */
  async createCriticalAlert(alertData) {
    try {
      const {
        institutionId,
        title,
        message,
        severity = 'high',
        category,
        type,
        actionRequired = true,
        actionUrl,
        dueDate,
        metadata = {},
        createdBy
      } = alertData;

      // Calculate severity score (1-10)
      const severityScore = this.calculateSeverityScore(severity, dueDate);

      const alert = await Alert.create({
        institution_id: institutionId,
        title,
        message,
        severity,
        severity_score: severityScore,
        category,
        type,
        status: 'unread',
        action_required: actionRequired,
        action_url: actionUrl,
        due_date: dueDate,
        metadata,
        created_by: createdBy,
        notification_count: 0,
        is_active: true
      });

      logger.info('Critical alert created', { 
        alertId: alert.id, 
        severity, 
        institutionId 
      });

      return alert;
    } catch (error) {
      logger.error('Error creating critical alert:', { error: error.message, stack: error.stack });
      throw error;
    }
  }

  /**
   * Mark multiple alerts as read
   */
  async markAlertsAsRead(alertIds, userId) {
    try {
      const result = await Alert.update(
        { 
          status: 'read',
          read_at: new Date(),
          read_by: userId
        },
        {
          where: {
            id: { [Op.in]: alertIds },
            status: 'unread'
          }
        }
      );

      logger.info('Alerts marked as read', { alertIds, userId, updatedCount: result[0] });
      return result[0];
    } catch (error) {
      logger.error('Error marking alerts as read:', { error: error.message, stack: error.stack });
      throw error;
    }
  }

  /**
   * Get dashboard summary for alerts
   */
  async getDashboardSummary(institutionId) {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [
        totalAlerts,
        criticalAlerts,
        highAlerts,
        mediumAlerts,
        lowAlerts,
        unreadAlerts,
        overdueAlerts,
        recentAlerts
      ] = await Promise.all([
        Alert.count({ where: { institution_id: institutionId, is_active: true } }),
        Alert.count({ where: { institution_id: institutionId, severity: 'critical', is_active: true } }),
        Alert.count({ where: { institution_id: institutionId, severity: 'high', is_active: true } }),
        Alert.count({ where: { institution_id: institutionId, severity: 'medium', is_active: true } }),
        Alert.count({ where: { institution_id: institutionId, severity: 'low', is_active: true } }),
        Alert.count({ where: { institution_id: institutionId, status: 'unread', is_active: true } }),
        Alert.count({ 
          where: { 
            institution_id: institutionId, 
            due_date: { [Op.lt]: now },
            status: { [Op.ne]: 'resolved' },
            is_active: true 
          } 
        }),
        Alert.count({ 
          where: { 
            institution_id: institutionId, 
            created_at: { [Op.gte]: thirtyDaysAgo },
            is_active: true 
          } 
        })
      ]);

      return {
        total: totalAlerts,
        critical: criticalAlerts,
        high: highAlerts,
        medium: mediumAlerts,
        low: lowAlerts,
        unread: unreadAlerts,
        overdue: overdueAlerts,
        recent: recentAlerts,
        lastAlert: await this.getLastAlert(institutionId)
      };

    } catch (error) {
      logger.error('Error getting dashboard summary:', { error: error.message, stack: error.stack });
      throw error;
    }
  }

  /**
   * Get alerts by category with statistics
   */
  async getAlertsByCategory(institutionId) {
    try {
      const categories = await Alert.findAll({
        where: { institution_id: institutionId, is_active: true },
        attributes: [
          'category',
          [Alert.sequelize.fn('COUNT', Alert.sequelize.col('id')), 'count'],
          [Alert.sequelize.fn('AVG', Alert.sequelize.col('severity_score')), 'avgSeverity']
        ],
        group: ['category'],
        raw: true
      });

      return categories.map(cat => ({
        category: cat.category,
        count: parseInt(cat.count),
        averageSeverity: parseFloat(cat.avgSeverity) || 0
      }));

    } catch (error) {
      logger.error('Error getting alerts by category:', { error: error.message, stack: error.stack });
      throw error;
    }
  }

  /**
   * Auto-generate alerts based on compliance rules
   */
  async autoGenerateAlerts(institutionId) {
    try {
      const generatedAlerts = [];

      // Check for document expiry alerts
      const documentAlerts = await this.generateDocumentExpiryAlerts(institutionId);
      generatedAlerts.push(...documentAlerts);

      // Check for deadline alerts
      const deadlineAlerts = await this.generateDeadlineAlerts(institutionId);
      generatedAlerts.push(...deadlineAlerts);

      // Check for compliance score alerts
      const complianceAlerts = await this.generateComplianceScoreAlerts(institutionId);
      generatedAlerts.push(...complianceAlerts);

      logger.info('Auto-generated alerts', { 
        institutionId, 
        alertCount: generatedAlerts.length 
      });

      return generatedAlerts;

    } catch (error) {
      logger.error('Error auto-generating alerts:', { error: error.message, stack: error.stack });
      throw error;
    }
  }

  /**
   * Calculate severity score for an alert
   */
  calculateSeverityScore(severity, dueDate) {
    const baseScores = {
      critical: 10,
      high: 8,
      medium: 5,
      low: 2
    };

    let score = baseScores[severity] || 5;

    // Add urgency if due date is approaching
    if (dueDate) {
      const daysUntilDue = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilDue <= 7) {
        score += 2; // High urgency
      } else if (daysUntilDue <= 30) {
        score += 1; // Medium urgency
      }
    }

    return Math.min(score, 10); // Cap at 10
  }

  /**
   * Get time filter based on range string
   */
  getTimeFilter(timeRange) {
    const now = new Date();
    
    switch (timeRange) {
      case '7d':
        return { [Op.gte]: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
      case '30d':
        return { [Op.gte]: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
      case '90d':
        return { [Op.gte]: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
      case '1y':
        return { [Op.gte]: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) };
      default:
        return {}; // No time filter
    }
  }

  /**
   * Get the last alert for an institution
   */
  async getLastAlert(institutionId) {
    try {
      const lastAlert = await Alert.findOne({
        where: { institution_id: institutionId, is_active: true },
        order: [['created_at', 'DESC']],
        attributes: ['id', 'title', 'severity', 'created_at']
      });

      return lastAlert;
    } catch (error) {
      logger.error('Error getting last alert:', { error: error.message, stack: error.stack });
      return null;
    }
  }

  /**
   * Generate document expiry alerts
   */
  async generateDocumentExpiryAlerts(institutionId) {
    // Implementation for document expiry alert generation
    return []; // Placeholder
  }

  /**
   * Generate deadline alerts
   */
  async generateDeadlineAlerts(institutionId) {
    // Implementation for deadline alert generation
    return []; // Placeholder
  }

  /**
   * Generate compliance score alerts
   */
  async generateComplianceScoreAlerts(institutionId) {
    // Implementation for compliance score alert generation
    return []; // Placeholder
  }
}

module.exports = new AlertService();