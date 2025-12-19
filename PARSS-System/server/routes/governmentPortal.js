const express = require('express');
const router = express.Router();
const GovernmentPortalService = require('../services/GovernmentPortalService');
const ComplianceVerification = require('../models/ComplianceVerification');

// Connect to government portal
router.post('/connect', async (req, res) => {
  try {
    const { portalType, credentials, autoSync = false } = req.body;
    
    const result = await GovernmentPortalService.connectToPortal(portalType, credentials, autoSync);
    
    res.json({
      success: true,
      message: `Successfully connected to ${portalType} portal`,
      data: result
    });
  } catch (error) {
    console.error('Portal connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to connect to portal',
      error: error.message
    });
  }
});

// Get all connected portals
router.get('/connected', async (req, res) => {
  try {
    const portals = await GovernmentPortalService.getConnectedPortals();
    
    res.json({
      success: true,
      data: portals
    });
  } catch (error) {
    console.error('Get connected portals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve connected portals',
      error: error.message
    });
  }
});

// Sync compliance requirements from portal
router.post('/sync-requirements/:portalId', async (req, res) => {
  try {
    const { portalId } = req.params;
    
    const result = await GovernmentPortalService.syncComplianceRequirements(portalId);
    
    res.json({
      success: true,
      message: 'Compliance requirements synchronized successfully',
      data: result
    });
  } catch (error) {
    console.error('Sync requirements error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync compliance requirements',
      error: error.message
    });
  }
});

// Submit compliance document to portal
router.post('/submit-document', async (req, res) => {
  try {
    const { portalId, documentType, documentData, verificationType = 'auto' } = req.body;
    
    const result = await GovernmentPortalService.submitComplianceDocument(
      portalId,
      documentType,
      documentData,
      verificationType
    );
    
    res.json({
      success: true,
      message: 'Document submitted successfully',
      data: result
    });
  } catch (error) {
    console.error('Document submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit document',
      error: error.message
    });
  }
});

// Check compliance status for a portal
router.get('/compliance-status/:portalId', async (req, res) => {
  try {
    const { portalId } = req.params;
    const { timeframe = 'current' } = req.query;
    
    const status = await GovernmentPortalService.getComplianceStatus(portalId, timeframe);
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Get compliance status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get compliance status',
      error: error.message
    });
  }
});

// Get portal-specific deadlines
router.get('/deadlines/:portalId', async (req, res) => {
  try {
    const { portalId } = req.params;
    const { status = 'upcoming', limit = 50 } = req.query;
    
    const deadlines = await GovernmentPortalService.getPortalDeadlines(portalId, status, limit);
    
    res.json({
      success: true,
      data: deadlines
    });
  } catch (error) {
    console.error('Get portal deadlines error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get portal deadlines',
      error: error.message
    });
  }
});

// Get portal statistics
router.get('/statistics/:portalId', async (req, res) => {
  try {
    const { portalId } = req.params;
    const { period = '30d' } = req.query;
    
    const stats = await GovernmentPortalService.getPortalStatistics(portalId, period);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get portal statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get portal statistics',
      error: error.message
    });
  }
});

// Update portal configuration
router.put('/config/:portalId', async (req, res) => {
  try {
    const { portalId } = req.params;
    const { settings, credentials } = req.body;
    
    const result = await GovernmentPortalService.updatePortalConfiguration(portalId, settings, credentials);
    
    res.json({
      success: true,
      message: 'Portal configuration updated successfully',
      data: result
    });
  } catch (error) {
    console.error('Update portal config error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update portal configuration',
      error: error.message
    });
  }
});

// Disconnect from portal
router.delete('/disconnect/:portalId', async (req, res) => {
  try {
    const { portalId } = req.params;
    
    await GovernmentPortalService.disconnectFromPortal(portalId);
    
    res.json({
      success: true,
      message: 'Successfully disconnected from portal'
    });
  } catch (error) {
    console.error('Portal disconnection error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disconnect from portal',
      error: error.message
    });
  }
});

// Test portal connection
router.post('/test-connection/:portalId', async (req, res) => {
  try {
    const { portalId } = req.params;
    
    const result = await GovernmentPortalService.testPortalConnection(portalId);
    
    res.json({
      success: true,
      message: 'Portal connection test completed',
      data: result
    });
  } catch (error) {
    console.error('Test portal connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Portal connection test failed',
      error: error.message
    });
  }
});

// Get available portal types
router.get('/portal-types', async (req, res) => {
  try {
    const portalTypes = await GovernmentPortalService.getAvailablePortalTypes();
    
    res.json({
      success: true,
      data: portalTypes
    });
  } catch (error) {
    console.error('Get portal types error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get available portal types',
      error: error.message
    });
  }
});

// Manual sync all portals
router.post('/sync-all', async (req, res) => {
  try {
    const result = await GovernmentPortalService.syncAllPortals();
    
    res.json({
      success: true,
      message: 'All portals synchronized successfully',
      data: result
    });
  } catch (error) {
    console.error('Sync all portals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync all portals',
      error: error.message
    });
  }
});

// Webhook endpoint for portal notifications
router.post('/webhook/:portalId', async (req, res) => {
  try {
    const { portalId } = req.params;
    const webhookData = req.body;
    
    const result = await GovernmentPortalService.processWebhook(portalId, webhookData);
    
    res.json({
      success: true,
      message: 'Webhook processed successfully',
      data: result
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process webhook',
      error: error.message
    });
  }
});

module.exports = router;