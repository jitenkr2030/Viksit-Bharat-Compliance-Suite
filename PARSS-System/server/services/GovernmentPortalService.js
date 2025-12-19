const axios = require('axios');
const crypto = require('crypto');
const GovernmentPortal = require('../models/GovernmentPortal');
const ComplianceVerification = require('../models/ComplianceVerification');

class GovernmentPortalService {
  constructor() {
    this.axiosInstance = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Viksit-Bharat-Compliance/1.0'
      }
    });
  }

  // Initialize portal authentication
  async initializePortal(portalCode) {
    try {
      const portal = await GovernmentPortal.findOne({ where: { portalCode } });
      if (!portal) {
        throw new Error(`Portal ${portalCode} not found`);
      }

      // Check if token needs refresh
      if (portal.needsTokenRefresh() && portal.authType === 'oauth2') {
        await this.refreshToken(portal);
      }

      return portal;
    } catch (error) {
      console.error('Failed to initialize portal:', error);
      throw error;
    }
  }

  // Refresh OAuth2 token
  async refreshToken(portal) {
    try {
      if (portal.authType !== 'oauth2' || !portal.refreshToken) {
        return portal;
      }

      const tokenResponse = await axios.post(`${portal.baseUrl}/oauth/token`, {
        grant_type: 'refresh_token',
        refresh_token: portal.refreshToken,
        client_id: portal.clientId,
        client_secret: portal.clientSecret
      });

      portal.accessToken = tokenResponse.data.access_token;
      portal.refreshToken = tokenResponse.data.refresh_token || portal.refreshToken;
      
      if (tokenResponse.data.expires_in) {
        portal.tokenExpiry = new Date(Date.now() + (tokenResponse.data.expires_in * 1000));
      }

      await portal.save();
      return portal;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      portal.healthStatus = 'degraded';
      await portal.save();
      throw error;
    }
  }

  // Perform health check on portal
  async performHealthCheck(portalCode) {
    try {
      const portal = await this.initializePortal(portalCode);
      
      const startTime = Date.now();
      const response = await this.axiosInstance.get(`${portal.apiEndpoint}/health`, {
        headers: this.getAuthHeaders(portal),
        timeout: 10000
      });
      const responseTime = Date.now() - startTime;

      portal.healthStatus = 'healthy';
      portal.lastHealthCheck = new Date();
      portal.recordRequest();
      await portal.save();

      return {
        portalCode: portal.portalCode,
        status: 'healthy',
        responseTime: responseTime,
        timestamp: new Date(),
        data: response.data
      };
    } catch (error) {
      const portal = await GovernmentPortal.findOne({ where: { portalCode } });
      if (portal) {
        portal.healthStatus = 'down';
        portal.lastHealthCheck = new Date();
        await portal.save();
      }

      return {
        portalCode: portal?.portalCode || portalCode,
        status: 'down',
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  // Verify compliance for an institution
  async verifyCompliance(institutionId, verificationData) {
    const portal = await this.initializePortal(verificationData.portalCode);
    
    if (!portal.canMakeRequest()) {
      throw new Error('Rate limit exceeded for portal');
    }

    try {
      const verification = await ComplianceVerification.create({
        institutionId,
        portalId: portal.id,
        verificationType: verificationData.type || 'initial',
        category: verificationData.category,
        requestData: verificationData.data,
        requestTimestamp: new Date(),
        status: 'pending'
      });

      const startTime = Date.now();
      const response = await this.makeApiRequest(portal, 'POST', '/verify', verificationData.data);
      const processingTime = Math.floor((Date.now() - startTime) / 1000);

      // Update verification record
      verification.responseData = response.data;
      verification.responseTimestamp = new Date();
      verification.status = this.mapPortalStatus(response.data.status);
      verification.externalReferenceId = response.data.referenceId;
      verification.portalTransactionId = response.data.transactionId;
      verification.processingTime = processingTime;

      if (response.data.complianceScore !== undefined) {
        verification.verificationScore = response.data.complianceScore;
        verification.isCompliant = response.data.complianceScore >= 80;
        verification.complianceLevel = this.mapComplianceLevel(response.data.complianceLevel);
        verification.compliancePercentage = response.data.complianceScore;
      }

      if (response.data.issues) {
        verification.complianceIssues = response.data.issues;
      }

      if (response.data.recommendations) {
        verification.recommendations = response.data.recommendations;
      }

      if (response.data.actionRequired) {
        verification.actionRequired = response.data.actionRequired;
      }

      if (response.data.validFrom) {
        verification.validFrom = new Date(response.data.validFrom);
      }

      if (response.data.validUntil) {
        verification.validUntil = new Date(response.data.validUntil);
      }

      if (response.data.nextReviewDate) {
        verification.nextReviewDate = new Date(response.data.nextReviewDate);
      }

      await verification.save();
      portal.recordRequest();
      await portal.save();

      return verification;
    } catch (error) {
      console.error('Compliance verification failed:', error);
      
      // Create failed verification record
      const verification = await ComplianceVerification.create({
        institutionId,
        portalId: portal.id,
        verificationType: verificationData.type || 'initial',
        category: verificationData.category,
        requestData: verificationData.data,
        requestTimestamp: new Date(),
        status: 'error',
        errorMessage: error.message,
        errorCode: error.code,
        retryCount: 1
      });

      portal.recordRequest();
      await portal.save();

      throw error;
    }
  }

  // Get compliance status from portal
  async getComplianceStatus(institutionId, portalCode, category) {
    const portal = await this.initializePortal(portalCode);
    
    if (!portal.canMakeRequest()) {
      throw new Error('Rate limit exceeded for portal');
    }

    try {
      const response = await this.makeApiRequest(portal, 'GET', `/status/${institutionId}`, {
        category: category
      });

      portal.recordRequest();
      await portal.save();

      return response.data;
    } catch (error) {
      portal.recordRequest();
      await portal.save();
      throw error;
    }
  }

  // Sync compliance data from portal
  async syncComplianceData(institutionId, portalCode) {
    const portal = await this.initializePortal(portalCode);
    
    try {
      const response = await this.makeApiRequest(portal, 'GET', `/sync/${institutionId}`);
      
      // Process and store sync data
      const syncData = response.data;
      const verifications = [];

      for (const item of syncData.verifications || []) {
        const verification = await ComplianceVerification.findOrCreate({
          where: {
            institutionId,
            portalId: portal.id,
            externalReferenceId: item.referenceId
          },
          defaults: {
            verificationType: item.type || 'sync',
            category: item.category,
            requestData: item.requestData,
            responseData: item.responseData,
            status: this.mapPortalStatus(item.status),
            verificationScore: item.complianceScore,
            isCompliant: item.complianceScore >= 80,
            complianceLevel: this.mapComplianceLevel(item.complianceLevel),
            compliancePercentage: item.complianceScore,
            externalReferenceId: item.referenceId,
            portalTransactionId: item.transactionId,
            validFrom: item.validFrom ? new Date(item.validFrom) : null,
            validUntil: item.validUntil ? new Date(item.validUntil) : null,
            nextReviewDate: item.nextReviewDate ? new Date(item.nextReviewDate) : null
          }
        });

        if (verification[1]) {
          verifications.push(verification[0]);
        }
      }

      portal.lastSyncAt = new Date();
      await portal.save();

      return {
        synced: verifications.length,
        totalItems: syncData.verifications?.length || 0,
        verifications: verifications
      };
    } catch (error) {
      console.error('Sync compliance data failed:', error);
      throw error;
    }
  }

  // Make authenticated API request to portal
  async makeApiRequest(portal, method, endpoint, data = null) {
    const config = {
      method,
      url: `${portal.apiEndpoint}${endpoint}`,
      headers: this.getAuthHeaders(portal),
      timeout: 30000
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      config.data = data;
    }

    return await this.axiosInstance(config);
  }

  // Get authentication headers for portal
  getAuthHeaders(portal) {
    const headers = {};

    switch (portal.authType) {
      case 'bearer_token':
        headers['Authorization'] = `Bearer ${portal.accessToken}`;
        break;
      case 'api_key':
        headers['X-API-Key'] = portal.apiKey;
        break;
      case 'basic_auth':
        const auth = Buffer.from(`${portal.clientId}:${portal.clientSecret}`).toString('base64');
        headers['Authorization'] = `Basic ${auth}`;
        break;
      case 'oauth2':
        headers['Authorization'] = `Bearer ${portal.accessToken}`;
        break;
    }

    return headers;
  }

  // Map portal status to internal status
  mapPortalStatus(portalStatus) {
    const statusMap = {
      'pending': 'pending',
      'processing': 'in_progress',
      'verified': 'verified',
      'approved': 'verified',
      'rejected': 'rejected',
      'failed': 'error',
      'expired': 'expired'
    };

    return statusMap[portalStatus?.toLowerCase()] || 'pending';
  }

  // Map portal compliance level to internal level
  mapComplianceLevel(portalLevel) {
    const levelMap = {
      'full': 'fully_compliant',
      'partial': 'partially_compliant',
      'non_compliant': 'non_compliant',
      'under_review': 'under_review'
    };

    return levelMap[portalLevel?.toLowerCase()] || 'under_review';
  }

  // Get all active portals
  async getActivePortals() {
    return await GovernmentPortal.getActivePortals();
  }

  // Get portal health status
  async getPortalHealth() {
    const portals = await this.getActivePortals();
    const healthChecks = [];

    for (const portal of portals) {
      try {
        const health = await this.performHealthCheck(portal.portalCode);
        healthChecks.push(health);
      } catch (error) {
        healthChecks.push({
          portalCode: portal.portalCode,
          status: 'down',
          error: error.message,
          timestamp: new Date()
        });
      }
    }

    return healthChecks;
  }

  // Retry failed verification
  async retryVerification(verificationId) {
    const verification = await ComplianceVerification.findByPk(verificationId, {
      include: [
        { model: GovernmentPortal, as: 'portal' },
        { model: require('./Institution'), as: 'institution' }
      ]
    });

    if (!verification) {
      throw new Error('Verification not found');
    }

    if (!verification.canRetry()) {
      throw new Error('Verification cannot be retried');
    }

    try {
      const response = await this.verifyCompliance(
        verification.institutionId,
        {
          portalCode: verification.portal.portalCode,
          type: verification.verificationType,
          category: verification.category,
          data: verification.requestData
        }
      );

      verification.retryCount += 1;
      await verification.save();

      return response;
    } catch (error) {
      verification.retryCount += 1;
      verification.errorMessage = error.message;
      await verification.save();
      throw error;
    }
  }

  // Batch verify compliance for multiple institutions
  async batchVerifyCompliance(verifications) {
    const results = [];
    const errors = [];

    for (const verification of verifications) {
      try {
        const result = await this.verifyCompliance(
          verification.institutionId,
          verification
        );
        results.push(result);
      } catch (error) {
        errors.push({
          institutionId: verification.institutionId,
          portalCode: verification.portalCode,
          error: error.message
        });
      }
    }

    return {
      successful: results.length,
      failed: errors.length,
      results,
      errors
    };
  }
}

module.exports = new GovernmentPortalService();