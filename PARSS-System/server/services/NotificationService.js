const nodemailer = require('nodemailer');
const axios = require('axios');
const { redisClient } = require('../config/redis');
const User = require('../models/User');
const Institution = require('../models/Institution');
const logger = require('../middleware/logger');

class NotificationService {
  constructor() {
    this.emailTransporter = this.createEmailTransporter();
    this.smsProvider = this.initializeSMSProvider();
    this.whatsappProvider = this.initializeWhatsAppProvider();
  }

  /**
   * Send critical alert via multiple channels
   */
  async sendMultiChannelAlert({ alert, channels, customMessage, institutionId, triggeredBy }) {
    try {
      const results = {};
      const timestamp = new Date();

      // Get institution and user details
      const institution = await Institution.findByPk(institutionId);
      const recipients = await this.getRecipients(institutionId, alert.severity);

      for (const channel of channels) {
        try {
          switch (channel) {
            case 'sms':
              results.sms = await this.sendSMSAlert(alert, recipients, customMessage);
              break;
            case 'whatsapp':
              results.whatsapp = await this.sendWhatsAppAlert(alert, recipients, customMessage);
              break;
            case 'email':
              results.email = await this.sendEmailAlert(alert, recipients, customMessage);
              break;
            case 'phone':
              results.phone = await this.makePhoneCall(alert, recipients, customMessage);
              break;
            case 'in_app':
              results.in_app = await this.sendInAppAlert(alert, recipients, customMessage);
              break;
          }
        } catch (channelError) {
          logger.error(`Failed to send ${channel} alert:`, { 
            error: channelError.message, 
            alertId: alert.id, 
            channel 
          });
          results[channel] = { 
            success: false, 
            error: channelError.message 
          };
        }
      }

      // Log notification attempt
      await this.logNotificationAttempt({
        alertId: alert.id,
        institutionId,
        channels: Object.keys(results),
        results,
        triggeredBy,
        timestamp
      });

      // Cache notification for retry logic
      await this.cacheNotificationForRetry(alert.id, results);

      return results;

    } catch (error) {
      logger.error('Multi-channel alert sending failed:', { 
        error: error.message, 
        stack: error.stack, 
        alertId: alert.id 
      });
      throw error;
    }
  }

  /**
   * Send SMS Alert
   */
  async sendSMSAlert(alert, recipients, customMessage) {
    try {
      const smsResults = [];

      for (const recipient of recipients) {
        if (!recipient.phone) continue;

        const message = this.formatSMSMessage(alert, recipient, customMessage);
        
        // Simulate SMS sending (replace with actual SMS provider)
        const smsResult = await this.sendSMS(recipient.phone, message);
        
        smsResults.push({
          recipient: recipient.phone,
          success: smsResult.success,
          messageId: smsResult.messageId,
          timestamp: new Date()
        });

        // Rate limiting
        await this.rateLimit('sms', recipient.phone);
      }

      return {
        success: smsResults.every(r => r.success),
        results: smsResults,
        totalSent: smsResults.filter(r => r.success).length,
        totalFailed: smsResults.filter(r => !r.success).length
      };

    } catch (error) {
      logger.error('SMS alert failed:', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Send WhatsApp Alert
   */
  async sendWhatsAppAlert(alert, recipients, customMessage) {
    try {
      const whatsappResults = [];

      for (const recipient of recipients) {
        if (!recipient.phone) continue;

        const message = this.formatWhatsAppMessage(alert, recipient, customMessage);
        
        // Simulate WhatsApp sending (replace with actual WhatsApp Business API)
        const whatsappResult = await this.sendWhatsApp(recipient.phone, message);
        
        whatsappResults.push({
          recipient: recipient.phone,
          success: whatsappResult.success,
          messageId: whatsappResult.messageId,
          timestamp: new Date()
        });

        await this.rateLimit('whatsapp', recipient.phone);
      }

      return {
        success: whatsappResults.every(r => r.success),
        results: whatsappResults,
        totalSent: whatsappResults.filter(r => r.success).length,
        totalFailed: whatsappResults.filter(r => !r.success).length
      };

    } catch (error) {
      logger.error('WhatsApp alert failed:', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Send Email Alert
   */
  async sendEmailAlert(alert, recipients, customMessage) {
    try {
      const emailResults = [];

      for (const recipient of recipients) {
        if (!recipient.email) continue;

        const emailData = this.formatEmailData(alert, recipient, customMessage);
        
        // Send email
        const emailResult = await this.emailTransporter.sendMail(emailData);
        
        emailResults.push({
          recipient: recipient.email,
          success: true,
          messageId: emailResult.messageId,
          timestamp: new Date()
        });

        await this.rateLimit('email', recipient.email);
      }

      return {
        success: emailResults.every(r => r.success),
        results: emailResults,
        totalSent: emailResults.filter(r => r.success).length,
        totalFailed: emailResults.filter(r => !r.success).length
      };

    } catch (error) {
      logger.error('Email alert failed:', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Make Phone Call Alert
   */
  async makePhoneCall(alert, recipients, customMessage) {
    try {
      const callResults = [];

      for (const recipient of recipients) {
        if (!recipient.phone) continue;

        // Only make calls for critical alerts
        if (alert.severity !== 'critical') continue;

        const message = this.formatCallMessage(alert, recipient, customMessage);
        
        // Simulate phone call (replace with actual voice service)
        const callResult = await this.makeCall(recipient.phone, message);
        
        callResults.push({
          recipient: recipient.phone,
          success: callResult.success,
          callId: callResult.callId,
          timestamp: new Date()
        });

        await this.rateLimit('phone', recipient.phone);
      }

      return {
        success: callResults.every(r => r.success),
        results: callResults,
        totalSent: callResults.filter(r => r.success).length,
        totalFailed: callResults.filter(r => !r.success).length
      };

    } catch (error) {
      logger.error('Phone call alert failed:', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Send In-App Alert
   */
  async sendInAppAlert(alert, recipients, customMessage) {
    try {
      const inAppResults = [];

      for (const recipient of recipients) {
        // Store in-app notification in database/cache
        const notificationData = {
          userId: recipient.id,
          alertId: alert.id,
          type: 'critical_alert',
          title: `🚨 ${alert.title}`,
          message: customMessage || alert.message,
          priority: alert.severity,
          actionUrl: alert.action_url,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        };

        await this.storeInAppNotification(notificationData);
        
        inAppResults.push({
          recipient: recipient.id,
          success: true,
          notificationId: notificationData.notificationId,
          timestamp: new Date()
        });
      }

      return {
        success: inAppResults.every(r => r.success),
        results: inAppResults,
        totalSent: inAppResults.filter(r => r.success).length,
        totalFailed: inAppResults.filter(r => !r.success).length
      };

    } catch (error) {
      logger.error('In-app alert failed:', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Get notification recipients based on severity and institution
   */
  async getRecipients(institutionId, severity) {
    try {
      const roleHierarchy = {
        critical: ['admin', 'principal', 'compliance_officer'],
        high: ['admin', 'principal', 'compliance_officer', 'vice_principal'],
        medium: ['admin', 'compliance_officer', 'department_head'],
        low: ['admin', 'compliance_officer']
      };

      const allowedRoles = roleHierarchy[severity] || ['admin'];

      const users = await User.findAll({
        where: {
          institution_id: institutionId,
          role: { [require('sequelize').Op.in]: allowedRoles },
          is_active: true
        },
        attributes: ['id', 'first_name', 'last_name', 'email', 'phone', 'role']
      });

      return users.map(user => ({
        ...user.toJSON(),
        fullName: `${user.first_name} ${user.last_name}`
      }));

    } catch (error) {
      logger.error('Error getting recipients:', { error: error.message });
      return [];
    }
  }

  /**
   * Get notification statistics for dashboard
   */
  async getNotificationStats(institutionId) {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      // This would typically query a notifications log table
      // For now, returning mock data structure
      return {
        totalSent: 156,
        last30Days: 89,
        byChannel: {
          email: 78,
          sms: 45,
          whatsapp: 32,
          phone: 8,
          in_app: 123
        },
        successRate: 0.96,
        averageDeliveryTime: '2.3 seconds',
        failedAttempts: 6
      };

    } catch (error) {
      logger.error('Error getting notification stats:', { error: error.message });
      return {
        totalSent: 0,
        last30Days: 0,
        byChannel: {},
        successRate: 0,
        averageDeliveryTime: '0 seconds',
        failedAttempts: 0
      };
    }
  }

  // Helper methods

  createEmailTransporter() {
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  initializeSMSProvider() {
    // Initialize SMS provider (Twilio, AWS SNS, etc.)
    return {
      // SMS provider configuration
    };
  }

  initializeWhatsAppProvider() {
    // Initialize WhatsApp Business API provider
    return {
      // WhatsApp provider configuration
    };
  }

  formatSMSMessage(alert, recipient, customMessage) {
    const institution = 'Your Institution'; // Get from context
    const maxLength = 160; // SMS character limit
    
    let message = customMessage || alert.message;
    
    // Truncate if too long
    if (message.length > maxLength - 50) {
      message = message.substring(0, maxLength - 50) + '...';
    }

    return `🚨 ${institution}: ${alert.title}. ${message} Reply STOP to opt out.`;
  }

  formatWhatsAppMessage(alert, recipient, customMessage) {
    const institution = 'Your Institution';
    
    return {
      to: recipient.phone,
      type: 'text',
      text: {
        body: `🚨 *CRITICAL ALERT*\n\n🏛️ *${institution}*\n\n📋 *${alert.title}*\n\n${customMessage || alert.message}\n\n⏰ *Severity: ${alert.severity.toUpperCase()}*\n\n${alert.action_url ? `🔗 Action Required: ${alert.action_url}` : ''}`
      }
    };
  }

  formatEmailData(alert, recipient, customMessage) {
    const institution = 'Your Institution';
    
    return {
      from: process.env.SMTP_FROM || 'noreply@viksitbharat.gov.in',
      to: recipient.email,
      subject: `🚨 CRITICAL: ${alert.title}`,
      html: this.generateEmailHTML(alert, recipient, customMessage, institution),
      text: this.generateEmailText(alert, recipient, customMessage, institution)
    };
  }

  formatCallMessage(alert, recipient, customMessage) {
    const institution = 'Your Institution';
    const message = customMessage || alert.message;
    
    return `This is an automated compliance alert from ${institution}. ${alert.title}. ${message}. Please check your compliance dashboard for more details.`;
  }

  generateEmailHTML(alert, recipient, customMessage, institution) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .alert-container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .alert-box { background: #fee; border-left: 4px solid #dc2626; padding: 15px; margin: 15px 0; }
          .footer { background: #333; color: white; padding: 15px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="alert-container">
          <div class="header">
            <h1>🚨 CRITICAL COMPLIANCE ALERT</h1>
            <p>${institution}</p>
          </div>
          <div class="content">
            <h2>${alert.title}</h2>
            <div class="alert-box">
              <p><strong>Severity:</strong> ${alert.severity.toUpperCase()}</p>
              <p><strong>Category:</strong> ${alert.category || 'General'}</p>
              <p><strong>Message:</strong></p>
              <p>${customMessage || alert.message}</p>
            </div>
            ${alert.action_url ? `<p><strong>Action Required:</strong> <a href="${alert.action_url}">Click here to view details</a></p>` : ''}
            <p><em>Alert ID: ${alert.id}</em></p>
            <p><em>Generated: ${new Date().toLocaleString()}</em></p>
          </div>
          <div class="footer">
            <p>This is an automated compliance alert from PARSS - Penalty Avoidance & Regulatory Survival System.</p>
            <p>Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateEmailText(alert, recipient, customMessage, institution) {
    return `
CRITICAL COMPLIANCE ALERT
${institution}

${alert.title}

Severity: ${alert.severity.toUpperCase()}
Category: ${alert.category || 'General'}

Message:
${customMessage || alert.message}

${alert.action_url ? `Action Required: ${alert.action_url}` : ''}

Alert ID: ${alert.id}
Generated: ${new Date().toLocaleString()}

---
This is an automated compliance alert from PARSS - Penalty Avoidance & Regulatory Survival System.
Please do not reply to this email.
    `;
  }

  async sendSMS(phoneNumber, message) {
    // Simulate SMS sending (replace with actual SMS provider)
    return {
      success: true,
      messageId: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  async sendWhatsApp(phoneNumber, messageData) {
    // Simulate WhatsApp sending (replace with actual WhatsApp Business API)
    return {
      success: true,
      messageId: `wa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  async makeCall(phoneNumber, message) {
    // Simulate phone call (replace with actual voice service)
    return {
      success: true,
      callId: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  async storeInAppNotification(notificationData) {
    // Store in Redis for quick access
    const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    notificationData.notificationId = notificationId;
    
    await redisClient.set(
      `notification:${notificationId}`,
      JSON.stringify(notificationData),
      7 * 24 * 60 * 60 // 7 days
    );

    // Add to user's notification list
    await redisClient.lPush(
      `user_notifications:${notificationData.userId}`,
      notificationId
    );

    return notificationId;
  }

  async rateLimit(channel, identifier) {
    const key = `rate_limit:${channel}:${identifier}`;
    const current = await redisClient.get(key);
    
    if (current && parseInt(current) >= 5) {
      throw new Error(`Rate limit exceeded for ${channel}`);
    }
    
    await redisClient.setEx(key, 3600, String((parseInt(current) || 0) + 1));
  }

  async logNotificationAttempt(logData) {
    // Store notification log
    await redisClient.lPush('notification_logs', JSON.stringify(logData));
    
    // Keep only last 1000 logs
    const logs = await redisClient.lRange('notification_logs', 0, -1);
    if (logs.length > 1000) {
      await redisClient.lTrim('notification_logs', 0, 999);
    }
  }

  async cacheNotificationForRetry(alertId, results) {
    const failedChannels = Object.entries(results)
      .filter(([channel, result]) => !result.success)
      .map(([channel]) => channel);
    
    if (failedChannels.length > 0) {
      await redisClient.setEx(
        `retry_notification:${alertId}`,
        3600, // 1 hour
        JSON.stringify({
          failedChannels,
          results,
          retryCount: 0,
          maxRetries: 3
        })
      );
    }
  }
}

module.exports = new NotificationService();