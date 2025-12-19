const cron = require('node-cron');
const { redisClient } = require('../config/redis');
const User = require('../models/User');
const Alert = require('../models/Alert');
const Document = require('../models/Document');
const logger = require('../middleware/logger');

// Background job scheduler
class JobScheduler {
  constructor() {
    this.jobs = new Map();
    this.isRunning = false;
  }

  // Initialize all scheduled jobs
  scheduleJobs() {
    if (this.isRunning) {
      console.log('⚠️ Jobs are already scheduled');
      return;
    }

    console.log('🕒 Scheduling background jobs...');

    // Clean up expired sessions every hour
    this.scheduleJob('cleanup-sessions', '0 * * * *', this.cleanupExpiredSessions);

    // Send daily compliance reminders at 9 AM
    this.scheduleJob('daily-reminders', '0 9 * * *', this.sendDailyComplianceReminders);

    // Generate weekly compliance reports on Sundays at 11 PM
    this.scheduleJob('weekly-reports', '0 23 * * 0', this.generateWeeklyReports);

    // Clean up old logs and temporary files daily at 2 AM
    this.scheduleJob('cleanup-logs', '0 2 * * *', this.cleanupOldLogs);

    // Update dashboard statistics every 15 minutes
    this.scheduleJob('update-stats', '*/15 * * * *', this.updateDashboardStatistics);

    // Process notification queue every 5 minutes
    this.scheduleJob('process-notifications', '*/5 * * * *', this.processNotificationQueue);

    // Backup critical data every day at 3 AM
    this.scheduleJob('daily-backup', '0 3 * * *', this.performDailyBackup);

    // Clean up file uploads older than 30 days daily at 4 AM
    this.scheduleJob('cleanup-files', '0 4 * * *', this.cleanupOldFiles);

    // Generate monthly compliance summaries on 1st of each month at 1 AM
    this.scheduleJob('monthly-summaries', '0 1 1 * *', this.generateMonthlySummaries);

    // Check for expiring certifications weekly on Mondays at 8 AM
    this.scheduleJob('check-certifications', '0 8 * * 1', this.checkExpiringCertifications);

    this.isRunning = true;
    console.log('✅ All background jobs scheduled successfully');
  }

  // Schedule a single job
  scheduleJob(name, cronPattern, jobFunction) {
    try {
      const job = cron.schedule(cronPattern, async () => {
        logger.info(`Starting scheduled job: ${name}`);
        const startTime = Date.now();
        
        try {
          await jobFunction();
          const duration = Date.now() - startTime;
          logger.info(`Completed job: ${name} in ${duration}ms`);
        } catch (error) {
          logger.error(`Job failed: ${name}`, { error: error.message, stack: error.stack });
        }
      }, {
        scheduled: false,
        timezone: 'Asia/Kolkata' // IST timezone
      });

      this.jobs.set(name, job);
      job.start();
      
      console.log(`📅 Scheduled job: ${name} (${cronPattern})`);
    } catch (error) {
      logger.error(`Failed to schedule job: ${name}`, { error: error.message });
    }
  }

  // Stop all jobs
  stopAllJobs() {
    console.log('🛑 Stopping all background jobs...');
    
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`⏹️ Stopped job: ${name}`);
    });
    
    this.jobs.clear();
    this.isRunning = false;
    console.log('✅ All background jobs stopped');
  }

  // Individual job implementations

  // Clean up expired user sessions
  async cleanupExpiredSessions() {
    try {
      await redisClient.cleanup();
      
      // Clean up database sessions
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      await User.update(
        { last_login_at: null },
        {
          where: {
            last_login_at: {
              [require('sequelize').Op.lt]: thirtyDaysAgo
            }
          }
        }
      );
      
      logger.info('Expired sessions cleanup completed');
    } catch (error) {
      logger.error('Failed to cleanup expired sessions', { error: error.message });
      throw error;
    }
  }

  // Send daily compliance reminders
  async sendDailyComplianceReminders() {
    try {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Find users with pending compliance items
      const pendingUsers = await User.findAll({
        where: {
          is_active: true,
          role: {
            [require('sequelize').Op.in]: ['compliance_officer', 'principal', 'vice_principal', 'department_head']
          }
        },
        include: [
          {
            model: require('./Institution'),
            as: 'Institution'
          }
        ]
      });

      for (const user of pendingUsers) {
        // Check for pending documents
        const pendingDocuments = await Document.count({
          where: {
            institution_id: user.institution_id,
            status: 'draft'
          }
        });

        // Check for upcoming deadlines (next 7 days)
        const upcomingDeadlines = await Alert.count({
          where: {
            institution_id: user.institution_id,
            type: 'deadline',
            status: 'unread',
            expires_at: {
              [require('sequelize').Op.lte]: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
          }
        });

        if (pendingDocuments > 0 || upcomingDeadlines > 0) {
          // Create or update daily reminder alert
          await Alert.upsert({
            user_id: user.id,
            title: 'Daily Compliance Reminder',
            message: `You have ${pendingDocuments} pending documents and ${upcomingDeadlines} upcoming deadlines.`,
            type: 'reminder',
            priority: 'medium',
            category: 'daily_reminder',
            status: 'unread'
          });

          // Add to notification queue
          await redisClient.addNotification({
            userId: user.id,
            type: 'daily_reminder',
            title: 'Daily Compliance Reminder',
            message: `You have ${pendingDocuments} pending documents and ${upcomingDeadlines} upcoming deadlines.`,
            timestamp: new Date()
          });
        }
      }

      logger.info('Daily compliance reminders sent successfully');
    } catch (error) {
      logger.error('Failed to send daily compliance reminders', { error: error.message });
      throw error;
    }
  }

  // Generate weekly compliance reports
  async generateWeeklyReports() {
    try {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);
      
      const institutions = await require('../models/Institution').findAll();
      
      for (const institution of institutions) {
        const complianceData = await this.generateComplianceReport(institution.id, weekStart, new Date());
        
        // Store report data in Redis cache
        await redisClient.cacheSet(
          `weekly_report:${institution.id}:${weekStart.toISOString().split('T')[0]}`,
          complianceData,
          7 * 24 * 60 * 60 // 7 days
        );

        // Create alert for report completion
        await Alert.create({
          user_id: institution.admin_user_id,
          title: 'Weekly Compliance Report Generated',
          message: `Weekly compliance report for ${institution.name} has been generated.`,
          type: 'report',
          priority: 'low',
          category: 'report_generated',
          metadata: {
            report_type: 'weekly',
            institution_id: institution.id,
            period_start: weekStart,
            period_end: new Date()
          }
        });
      }

      logger.info('Weekly compliance reports generated successfully');
    } catch (error) {
      logger.error('Failed to generate weekly reports', { error: error.message });
      throw error;
    }
  }

  // Clean up old logs and temporary files
  async cleanupOldLogs() {
    try {
      const fs = require('fs').promises;
      const path = require('path');
      
      // Clean up old log files (older than 30 days)
      const logsDir = path.join(__dirname, '../../logs');
      try {
        const files = await fs.readdir(logsDir);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        
        for (const file of files) {
          const filePath = path.join(logsDir, file);
          const stats = await fs.stat(filePath);
          
          if (stats.mtime < thirtyDaysAgo) {
            await fs.unlink(filePath);
            logger.info(`Deleted old log file: ${file}`);
          }
        }
      } catch (error) {
        // Logs directory might not exist
        logger.warn('Logs directory not found, skipping log cleanup');
      }

      // Clean up old temporary uploads (older than 7 days)
      const uploadDir = path.join(__dirname, '../../uploads/temp');
      try {
        const files = await fs.readdir(uploadDir);
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        
        for (const file of files) {
          const filePath = path.join(uploadDir, file);
          const stats = await fs.stat(filePath);
          
          if (stats.mtime < sevenDaysAgo) {
            await fs.unlink(filePath);
            logger.info(`Deleted old temporary file: ${file}`);
          }
        }
      } catch (error) {
        // Temp uploads directory might not exist
        logger.warn('Temp uploads directory not found, skipping temp file cleanup');
      }

      logger.info('Old logs and files cleanup completed');
    } catch (error) {
      logger.error('Failed to cleanup old logs', { error: error.message });
      throw error;
    }
  }

  // Update dashboard statistics
  async updateDashboardStatistics() {
    try {
      const institutions = await require('../models/Institution').findAll();
      
      for (const institution of institutions) {
        const stats = await this.calculateInstitutionStats(institution.id);
        
        // Cache statistics for dashboard
        await redisClient.cacheSet(
          `dashboard_stats:${institution.id}`,
          stats,
          15 * 60 // 15 minutes
        );
      }

      logger.info('Dashboard statistics updated successfully');
    } catch (error) {
      logger.error('Failed to update dashboard statistics', { error: error.message });
      throw error;
    }
  }

  // Process notification queue
  async processNotificationQueue() {
    try {
      const notifications = await redisClient.getNotifications(50);
      
      for (const notification of notifications) {
        try {
          // Process each notification (send email, push notification, etc.)
          await this.processSingleNotification(notification);
        } catch (error) {
          logger.error('Failed to process notification', { 
            notification, 
            error: error.message 
          });
        }
      }

      // Clear processed notifications
      await redisClient.clearNotifications();
      
      logger.info(`Processed ${notifications.length} notifications`);
    } catch (error) {
      logger.error('Failed to process notification queue', { error: error.message });
      throw error;
    }
  }

  // Perform daily backup
  async performDailyBackup() {
    try {
      // This would integrate with your backup service
      // For now, we'll just log that backup was attempted
      logger.info('Daily backup initiated');
      
      // TODO: Implement actual backup logic
      // - Database dump
      // - File system backup
      // - Upload to cloud storage
    } catch (error) {
      logger.error('Failed to perform daily backup', { error: error.message });
      throw error;
    }
  }

  // Clean up old files
  async cleanupOldFiles() {
    try {
      // This would clean up uploaded files older than retention policy
      logger.info('Old files cleanup initiated');
      
      // TODO: Implement file cleanup logic
      // - Check file retention policies
      // - Archive or delete old files
    } catch (error) {
      logger.error('Failed to cleanup old files', { error: error.message });
      throw error;
    }
  }

  // Generate monthly summaries
  async generateMonthlySummaries() {
    try {
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      monthEnd.setDate(0);
      monthEnd.setHours(23, 59, 59, 999);
      
      const institutions = await require('../models/Institution').findAll();
      
      for (const institution of institutions) {
        const summary = await this.generateMonthlySummary(institution.id, monthStart, monthEnd);
        
        // Cache monthly summary
        await redisClient.cacheSet(
          `monthly_summary:${institution.id}:${monthStart.toISOString().split('T')[0]}`,
          summary,
          30 * 24 * 60 * 60 // 30 days
        );

        // Create alert for summary completion
        await Alert.create({
          user_id: institution.admin_user_id,
          title: 'Monthly Compliance Summary Generated',
          message: `Monthly compliance summary for ${institution.name} (${monthStart.toLocaleDateString()}) has been generated.`,
          type: 'report',
          priority: 'low',
          category: 'monthly_summary',
          metadata: {
            report_type: 'monthly',
            institution_id: institution.id,
            period_start: monthStart,
            period_end: monthEnd
          }
        });
      }

      logger.info('Monthly compliance summaries generated successfully');
    } catch (error) {
      logger.error('Failed to generate monthly summaries', { error: error.message });
      throw error;
    }
  }

  // Check for expiring certifications
  async checkExpiringCertifications() {
    try {
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      
      // Find alerts for expiring certifications
      const expiringCertifications = await Alert.findAll({
        where: {
          category: 'certification_expiry',
          status: 'unread',
          expires_at: {
            [require('sequelize').Op.lte]: thirtyDaysFromNow
          }
        },
        include: [
          {
            model: User,
            as: 'User'
          }
        ]
      });

      for (const certification of expiringCertifications) {
        // Send reminder notification
        await redisClient.addNotification({
          userId: certification.user_id,
          type: 'certification_expiry',
          title: 'Certification Expiring Soon',
          message: certification.message,
          priority: 'high',
          timestamp: new Date()
        });
      }

      logger.info(`Checked ${expiringCertifications.length} expiring certifications`);
    } catch (error) {
      logger.error('Failed to check expiring certifications', { error: error.message });
      throw error;
    }
  }

  // Helper methods
  async generateComplianceReport(institutionId, startDate, endDate) {
    // Generate compliance statistics for the period
    const totalDocuments = await Document.count({
      where: {
        institution_id: institutionId,
        created_at: {
          [require('sequelize').Op.between]: [startDate, endDate]
        }
      }
    });

    const approvedDocuments = await Document.count({
      where: {
        institution_id: institutionId,
        status: 'approved',
        updated_at: {
          [require('sequelize').Op.between]: [startDate, endDate]
        }
      }
    });

    const pendingDocuments = await Document.count({
      where: {
        institution_id: institutionId,
        status: 'pending'
      }
    });

    return {
      institutionId,
      period: { startDate, endDate },
      totalDocuments,
      approvedDocuments,
      pendingDocuments,
      complianceRate: totalDocuments > 0 ? (approvedDocuments / totalDocuments) * 100 : 0,
      generatedAt: new Date()
    };
  }

  async calculateInstitutionStats(institutionId) {
    const [totalUsers, totalDocuments, pendingDocuments, totalAlerts, unreadAlerts] = await Promise.all([
      User.count({ where: { institution_id: institutionId } }),
      Document.count({ where: { institution_id: institutionId } }),
      Document.count({ where: { institution_id: institutionId, status: 'pending' } }),
      Alert.count({ where: { institution_id: institutionId } }),
      Alert.count({ where: { institution_id: institutionId, status: 'unread' } })
    ]);

    return {
      institutionId,
      totalUsers,
      totalDocuments,
      pendingDocuments,
      totalAlerts,
      unreadAlerts,
      complianceRate: totalDocuments > 0 ? ((totalDocuments - pendingDocuments) / totalDocuments) * 100 : 0,
      updatedAt: new Date()
    };
  }

  async processSingleNotification(notification) {
    // TODO: Implement notification processing
    // - Send email notifications
    // - Send push notifications
    // - Update notification status
    logger.info('Processing notification', { notification });
  }

  async generateMonthlySummary(institutionId, startDate, endDate) {
    // Generate detailed monthly summary
    const report = await this.generateComplianceReport(institutionId, startDate, endDate);
    
    return {
      ...report,
      summary: 'Monthly compliance summary generated successfully',
      generatedAt: new Date()
    };
  }
}

// Create singleton instance
const jobScheduler = new JobScheduler();

// Export functions for use in index.js
const scheduleJobs = () => {
  jobScheduler.scheduleJobs();
};

const stopAllJobs = () => {
  jobScheduler.stopAllJobs();
};

module.exports = {
  scheduleJobs,
  stopAllJobs,
  jobScheduler
};