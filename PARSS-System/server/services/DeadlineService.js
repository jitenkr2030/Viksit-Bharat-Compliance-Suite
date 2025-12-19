const { Op } = require('sequelize');
const { redisClient } = require('../config/redis');
const Document = require('../models/Document');
const Alert = require('../models/Alert');
const Institution = require('../models/Institution');
const User = require('../models/User');
const logger = require('../middleware/logger');

class DeadlineService {
  /**
   * Get smart deadline management information
   */
  async getSmartDeadlines(institutionId, options = {}) {
    try {
      const {
        timeRange = 90,
        includeCompleted = false,
        priority,
        category
      } = options;

      const deadlines = await this.calculateDeadlines(institutionId, {
        timeRange,
        includeCompleted,
        priority,
        category
      });

      // Enrich deadlines with additional information
      const enrichedDeadlines = await Promise.all(
        deadlines.map(deadline => this.enrichDeadline(deadline, institutionId))
      );

      return enrichedDeadlines.sort((a, b) => {
        // Sort by urgency (priority and days remaining)
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority] || 0;
        const bPriority = priorityOrder[b.priority] || 0;
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        
        return a.daysRemaining - b.daysRemaining;
      });

    } catch (error) {
      logger.error('Smart deadlines retrieval failed:', { error: error.message, stack: error.stack, institutionId });
      throw error;
    }
  }

  /**
   * Get upcoming deadlines with specific time range
   */
  async getUpcomingDeadlines(institutionId, days = 90) {
    try {
      const endDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      const now = new Date();

      // Get document-related deadlines
      const documentDeadlines = await this.getDocumentDeadlines(institutionId, now, endDate);
      
      // Get alert-related deadlines
      const alertDeadlines = await this.getAlertDeadlines(institutionId, now, endDate);
      
      // Get regulatory deadlines
      const regulatoryDeadlines = await this.getRegulatoryDeadlines(institutionId, now, endDate);
      
      // Get accreditation deadlines
      const accreditationDeadlines = await this.getAccreditationDeadlines(institutionId, now, endDate);

      const allDeadlines = [
        ...documentDeadlines,
        ...alertDeadlines,
        ...regulatoryDeadlines,
        ...accreditationDeadlines
      ];

      return allDeadlines.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    } catch (error) {
      logger.error('Upcoming deadlines retrieval failed:', { error: error.message, institutionId });
      throw error;
    }
  }

  /**
   * Schedule automated tasks for deadlines
   */
  async scheduleTasks(deadlineId, tasks, context) {
    try {
      const { assignedBy, institutionId } = context;

      const scheduledTasks = [];
      
      for (const task of tasks) {
        const scheduledTask = {
          id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          deadlineId,
          title: task.title,
          description: task.description,
          assignedTo: task.assignedTo,
          assignedBy,
          dueDate: this.calculateTaskDueDate(task, deadlineId),
          priority: task.priority || 'medium',
          estimatedHours: task.estimatedHours || 2,
          status: 'pending',
          dependencies: task.dependencies || [],
          createdAt: new Date(),
          institutionId
        };

        // Store in database/cache
        await this.storeScheduledTask(scheduledTask);
        
        // Schedule notifications
        await this.scheduleTaskNotifications(scheduledTask);
        
        scheduledTasks.push(scheduledTask);
      }

      // Log task scheduling
      logger.info('Deadline tasks scheduled', { 
        deadlineId, 
        taskCount: tasks.length, 
        institutionId,
        assignedBy 
      });

      return scheduledTasks;

    } catch (error) {
      logger.error('Task scheduling failed:', { error: error.message, stack: error.stack });
      throw error;
    }
  }

  /**
   * Get deadline analytics and insights
   */
  async getDeadlineAnalytics(institutionId) {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      const [
        totalDeadlines,
        upcomingDeadlines,
        overdueDeadlines,
        completedDeadlines,
        missedDeadlines,
        averageCompletionTime,
        deadlineComplianceRate,
        recentPerformance
      ] = await Promise.all([
        this.getTotalDeadlinesCount(institutionId),
        this.getUpcomingDeadlinesCount(institutionId, new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)),
        this.getOverdueDeadlinesCount(institutionId),
        this.getCompletedDeadlinesCount(institutionId, thirtyDaysAgo),
        this.getMissedDeadlinesCount(institutionId, thirtyDaysAgo),
        this.getAverageCompletionTime(institutionId, thirtyDaysAgo),
        this.getDeadlineComplianceRate(institutionId),
        this.getRecentPerformance(institutionId, sixtyDaysAgo, thirtyDaysAgo)
      ]);

      return {
        timestamp: new Date(),
        institutionId,
        summary: {
          total: totalDeadlines,
          upcoming: upcomingDeadlines,
          overdue: overdueDeadlines,
          completed: completedDeadlines,
          missed: missedDeadlines
        },
        performance: {
          complianceRate: deadlineComplianceRate,
          averageCompletionTime: averageCompletionTime,
          recentPerformance: recentPerformance
        },
        trends: await this.calculateDeadlineTrends(institutionId),
        riskFactors: await this.identifyDeadlineRiskFactors(institutionId)
      };

    } catch (error) {
      logger.error('Deadline analytics failed:', { error: error.message, institutionId });
      return {
        timestamp: new Date(),
        institutionId,
        summary: { total: 0, upcoming: 0, overdue: 0, completed: 0, missed: 0 },
        performance: { complianceRate: 100, averageCompletionTime: 0, recentPerformance: 'stable' },
        trends: { direction: 'stable', changePercent: 0 },
        riskFactors: []
      };
    }
  }

  /**
   * Get recommendations for deadline management
   */
  async getRecommendations(institutionId) {
    try {
      const analytics = await this.getDeadlineAnalytics(institutionId);
      const upcomingDeadlines = await this.getUpcomingDeadlines(institutionId, 30);
      
      const recommendations = [];

      // Overdue recommendations
      if (analytics.summary.overdue > 0) {
        recommendations.push({
          priority: 'HIGH',
          category: 'overdue_items',
          title: 'Address Overdue Deadlines',
          description: `${analytics.summary.overdue} deadlines are overdue and require immediate attention.`,
          action: 'review_overdue',
          estimatedImpact: 'high',
          timeframe: '24-48 hours'
        });
      }

      // Upcoming critical deadlines
      const criticalUpcoming = upcomingDeadlines.filter(d => 
        d.priority === 'critical' && d.daysRemaining <= 7
      );
      
      if (criticalUpcoming.length > 0) {
        recommendations.push({
          priority: 'CRITICAL',
          category: 'upcoming_critical',
          title: 'Prepare for Critical Deadlines',
          description: `${criticalUpcoming.length} critical deadlines are approaching within 7 days.`,
          action: 'prepare_critical',
          estimatedImpact: 'high',
          timeframe: 'immediate'
        });
      }

      // Compliance rate recommendations
      if (analytics.performance.complianceRate < 90) {
        recommendations.push({
          priority: 'MEDIUM',
          category: 'compliance_improvement',
          title: 'Improve Deadline Compliance',
          description: `Current compliance rate is ${analytics.performance.complianceRate}%. Aim for >95% compliance.`,
          action: 'improve_compliance',
          estimatedImpact: 'medium',
          timeframe: '1-2 weeks'
        });
      }

      // Automation recommendations
      if (analytics.summary.total > 10 && analytics.performance.complianceRate < 95) {
        recommendations.push({
          priority: 'MEDIUM',
          category: 'automation',
          title: 'Automate Deadline Management',
          description: 'Consider implementing automated deadline tracking and reminders.',
          action: 'implement_automation',
          estimatedImpact: 'medium',
          timeframe: '2-4 weeks'
        });
      }

      return recommendations;

    } catch (error) {
      logger.error('Deadline recommendations failed:', { error: error.message, institutionId });
      return [];
    }
  }

  // Core calculation methods

  /**
   * Calculate all deadlines for an institution
   */
  async calculateDeadlines(institutionId, options) {
    const deadlines = [];

    // Document-related deadlines
    const documentDeadlines = await this.getDocumentDeadlines(
      institutionId, 
      new Date(), 
      new Date(Date.now() + options.timeRange * 24 * 60 * 60 * 1000)
    );
    deadlines.push(...documentDeadlines);

    // Alert deadlines
    const alertDeadlines = await this.getAlertDeadlines(
      institutionId,
      new Date(),
      new Date(Date.now() + options.timeRange * 24 * 60 * 60 * 1000)
    );
    deadlines.push(...alertDeadlines);

    // Regulatory deadlines (based on institution type and requirements)
    const regulatoryDeadlines = await this.getRegulatoryDeadlines(
      institutionId,
      new Date(),
      new Date(Date.now() + options.timeRange * 24 * 60 * 60 * 1000)
    );
    deadlines.push(...regulatoryDeadlines);

    // Filter based on options
    return deadlines.filter(deadline => {
      if (options.priority && deadline.priority !== options.priority) return false;
      if (options.category && deadline.category !== options.category) return false;
      if (!options.includeCompleted && deadline.status === 'completed') return false;
      return true;
    });
  }

  /**
   * Get document-related deadlines
   */
  async getDocumentDeadlines(institutionId, startDate, endDate) {
    try {
      const documents = await Document.findAll({
        where: {
          institution_id: institutionId,
          expiry_date: { [Op.between]: [startDate, endDate] },
          is_active: true
        },
        attributes: ['id', 'title', 'category', 'expiry_date', 'status', 'created_at']
      });

      return documents.map(doc => {
        const daysRemaining = Math.ceil((new Date(doc.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
        const urgency = this.calculateUrgency(daysRemaining, doc.status);

        return {
          id: `doc_${doc.id}`,
          title: `${doc.title} Expiry`,
          type: 'document_expiry',
          category: doc.category,
          dueDate: doc.expiry_date,
          daysRemaining,
          status: doc.status,
          priority: urgency.priority,
          severity: urgency.severity,
          actionRequired: true,
          description: `${doc.title} document expires on ${new Date(doc.expiry_date).toLocaleDateString()}`,
          sourceId: doc.id,
          sourceType: 'document'
        };
      });

    } catch (error) {
      logger.error('Document deadlines calculation failed:', { error: error.message, institutionId });
      return [];
    }
  }

  /**
   * Get alert-related deadlines
   */
  async getAlertDeadlines(institutionId, startDate, endDate) {
    try {
      const alerts = await Alert.findAll({
        where: {
          institution_id: institutionId,
          due_date: { [Op.between]: [startDate, endDate] },
          status: { [Op.ne]: 'resolved' },
          is_active: true
        },
        attributes: ['id', 'title', 'category', 'due_date', 'severity', 'status', 'created_at']
      });

      return alerts.map(alert => {
        const daysRemaining = Math.ceil((new Date(alert.due_date) - new Date()) / (1000 * 60 * 60 * 24));
        const urgency = this.calculateUrgency(daysRemaining, alert.status);

        return {
          id: `alert_${alert.id}`,
          title: alert.title,
          type: 'alert_deadline',
          category: alert.category,
          dueDate: alert.due_date,
          daysRemaining,
          status: alert.status,
          priority: urgency.priority,
          severity: alert.severity,
          actionRequired: alert.action_required,
          description: `Alert due date: ${new Date(alert.due_date).toLocaleDateString()}`,
          sourceId: alert.id,
          sourceType: 'alert'
        };
      });

    } catch (error) {
      logger.error('Alert deadlines calculation failed:', { error: error.message, institutionId });
      return [];
    }
  }

  /**
   * Get regulatory deadlines based on institution type
   */
  async getRegulatoryDeadlines(institutionId, startDate, endDate) {
    try {
      const institution = await Institution.findByPk(institutionId);
      if (!institution) return [];

      // Calculate standard regulatory deadlines based on institution type
      const regulatoryDeadlines = this.calculateStandardRegulatoryDeadlines(institution, startDate, endDate);
      
      return regulatoryDeadlines.map(deadline => ({
        ...deadline,
        sourceType: 'regulatory',
        calculated: true
      }));

    } catch (error) {
      logger.error('Regulatory deadlines calculation failed:', { error: error.message, institutionId });
      return [];
    }
  }

  /**
   * Get accreditation deadlines
   */
  async getAccreditationDeadlines(institutionId, startDate, endDate) {
    try {
      // This would typically fetch from an accreditation tracking service
      // For now, returning mock data structure
      const mockDeadlines = [
        {
          id: 'accred_1',
          title: 'NAAC Accreditation Renewal',
          type: 'accreditation_renewal',
          category: 'accreditation',
          dueDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
          daysRemaining: 180,
          status: 'pending',
          priority: 'high',
          severity: 'high',
          actionRequired: true,
          description: 'NAAC accreditation renewal due in 6 months',
          sourceType: 'accreditation'
        }
      ];

      return mockDeadlines.filter(d => 
        new Date(d.dueDate) >= startDate && new Date(d.dueDate) <= endDate
      );

    } catch (error) {
      logger.error('Accreditation deadlines calculation failed:', { error: error.message, institutionId });
      return [];
    }
  }

  /**
   * Enrich deadline with additional information
   */
  async enrichDeadline(deadline, institutionId) {
    try {
      // Add related tasks
      const relatedTasks = await this.getRelatedTasks(deadline.id);
      
      // Add dependencies
      const dependencies = await this.getDependencies(deadline.id);
      
      // Add assignees
      const assignees = await this.getDeadlineAssignees(deadline.id);
      
      // Add history
      const history = await this.getDeadlineHistory(deadline.id);

      return {
        ...deadline,
        tasks: relatedTasks,
        dependencies,
        assignees,
        history,
        metadata: {
          ...deadline.metadata,
          lastUpdated: new Date(),
          calculated: true
        }
      };

    } catch (error) {
      logger.error('Deadline enrichment failed:', { error: error.message });
      return deadline;
    }
  }

  // Utility methods

  calculateUrgency(daysRemaining, status) {
    if (status === 'overdue' || daysRemaining <= 0) {
      return { priority: 'critical', severity: 'critical' };
    } else if (daysRemaining <= 7) {
      return { priority: 'high', severity: 'high' };
    } else if (daysRemaining <= 30) {
      return { priority: 'medium', severity: 'medium' };
    } else {
      return { priority: 'low', severity: 'low' };
    }
  }

  calculateStandardRegulatoryDeadlines(institution, startDate, endDate) {
    const deadlines = [];
    const currentYear = new Date().getFullYear();
    
    // Annual compliance reports
    deadlines.push({
      id: `reg_annual_${currentYear}`,
      title: 'Annual Compliance Report Submission',
      type: 'annual_report',
      category: 'regulatory',
      dueDate: new Date(currentYear, 11, 31), // December 31st
      daysRemaining: Math.ceil((new Date(currentYear, 11, 31) - new Date()) / (1000 * 60 * 60 * 24)),
      status: 'pending',
      priority: 'high',
      severity: 'high',
      actionRequired: true,
      description: 'Annual compliance report must be submitted by year end'
    });

    // Faculty verification (if applicable)
    if (institution.type === 'college' || institution.type === 'university') {
      deadlines.push({
        id: `reg_faculty_${currentYear}`,
        title: 'Faculty Qualification Verification',
        type: 'faculty_verification',
        category: 'faculty',
        dueDate: new Date(currentYear, 5, 30), // June 30th
        daysRemaining: Math.ceil((new Date(currentYear, 5, 30) - new Date()) / (1000 * 60 * 60 * 24)),
        status: 'pending',
        priority: 'medium',
        severity: 'medium',
        actionRequired: true,
        description: 'Annual faculty qualification verification due'
      });
    }

    return deadlines.filter(d => 
      new Date(d.dueDate) >= startDate && new Date(d.dueDate) <= endDate
    );
  }

  calculateTaskDueDate(task, deadlineId) {
    // Calculate task due date based on deadline and task urgency
    const baseDate = new Date(deadlineId.replace('doc_', '').replace('alert_', ''));
    if (isNaN(baseDate.getTime())) {
      return new Date(Date.now() + (task.estimatedHours || 2) * 60 * 60 * 1000);
    }

    const taskUrgency = task.priority || 'medium';
    const urgencyOffsets = {
      critical: 0.1, // 10% of time before deadline
      high: 0.25,    // 25% of time before deadline
      medium: 0.5,   // 50% of time before deadline
      low: 0.75      // 75% of time before deadline
    };

    const offset = urgencyOffsets[taskUrgency] || 0.5;
    const daysBeforeDeadline = 30 * offset; // Assume 30 days max lead time
    
    return new Date(baseDate.getTime() - daysBeforeDeadline * 24 * 60 * 60 * 1000);
  }

  async storeScheduledTask(task) {
    await redisClient.set(
      `deadline_task:${task.id}`,
      JSON.stringify(task),
      30 * 24 * 60 * 60 // 30 days
    );
  }

  async scheduleTaskNotifications(task) {
    const notifications = [
      {
        type: 'task_assigned',
        delay: 0, // Immediate
        message: `Task assigned: ${task.title}`
      },
      {
        type: 'task_reminder',
        delay: 24 * 60 * 60 * 1000, // 24 hours before due
        message: `Task due tomorrow: ${task.title}`
      }
    ];

    for (const notification of notifications) {
      setTimeout(() => {
        this.sendTaskNotification(task, notification);
      }, notification.delay);
    }
  }

  async sendTaskNotification(task, notification) {
    // Implementation for sending task notifications
    logger.info('Task notification sent', { 
      taskId: task.id, 
      type: notification.type,
      assignee: task.assignedTo 
    });
  }

  // Placeholder methods for data retrieval
  async getTotalDeadlinesCount(institutionId) { return 0; }
  async getUpcomingDeadlinesCount(institutionId, endDate) { return 0; }
  async getOverdueDeadlinesCount(institutionId) { return 0; }
  async getCompletedDeadlinesCount(institutionId, date) { return 0; }
  async getMissedDeadlinesCount(institutionId, date) { return 0; }
  async getAverageCompletionTime(institutionId, date) { return 0; }
  async getDeadlineComplianceRate(institutionId) { return 100; }
  async getRecentPerformance(institutionId, startDate, endDate) { return 'stable'; }
  async calculateDeadlineTrends(institutionId) { return { direction: 'stable', changePercent: 0 }; }
  async identifyDeadlineRiskFactors(institutionId) { return []; }
  async getRelatedTasks(deadlineId) { return []; }
  async getDependencies(deadlineId) { return []; }
  async getDeadlineAssignees(deadlineId) { return []; }
  async getDeadlineHistory(deadlineId) { return []; }
  async getComplianceScore(institutionId, type) { return 100; }
  async getComplianceTrend(institutionId) { return 'stable'; }
  async getComplianceBenchmark(institutionId) { return 'average'; }
  async getHistoricalViolations(institutionId) { return 0; }
  async getHistoricalPenalties(institutionId) { return 0; }
  async calculateImprovementRate(institutionId) { return 0; }
  async identifyHistoricalPattern(violations, improvementRate) { return 'stable'; }
  async calculateTrajectory(improvementRate) { return 'neutral'; }

  async getDashboardDeadlines(institutionId) {
    try {
      const upcomingDeadlines = await this.getUpcomingDeadlines(institutionId, 30);
      
      return {
        total: upcomingDeadlines.length,
        overdue: upcomingDeadlines.filter(d => d.daysRemaining < 0).length,
        critical: upcomingDeadlines.filter(d => d.priority === 'critical').length,
        upcoming: upcomingDeadlines.filter(d => d.daysRemaining >= 0 && d.daysRemaining <= 7).length,
        items: upcomingDeadlines.slice(0, 5) // Top 5 upcoming
      };
    } catch (error) {
      logger.error('Dashboard deadlines failed:', { error: error.message, institutionId });
      return {
        total: 0,
        overdue: 0,
        critical: 0,
        upcoming: 0,
        items: []
      };
    }
  }
}

module.exports = new DeadlineService();