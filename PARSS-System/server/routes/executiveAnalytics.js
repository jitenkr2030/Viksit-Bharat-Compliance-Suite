const express = require('express');
const router = express.Router();
const ExecutiveAnalyticsService = require('../services/ExecutiveAnalyticsService');

// Get executive dashboard overview
router.get('/dashboard', async (req, res) => {
  try {
    const { period = '30d', organizationId } = req.query;
    
    const dashboard = await ExecutiveAnalyticsService.getExecutiveDashboard(period, organizationId);
    
    res.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    console.error('Get executive dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get executive dashboard',
      error: error.message
    });
  }
});

// Get compliance score trends
router.get('/compliance-scores', async (req, res) => {
  try {
    const { 
      period = '12m', 
      organizationId, 
      breakdownBy = 'category',
      includeProjections = true 
    } = req.query;
    
    const scores = await ExecutiveAnalyticsService.getComplianceScoreTrends(
      period,
      organizationId,
      breakdownBy,
      includeProjections
    );
    
    res.json({
      success: true,
      data: scores
    });
  } catch (error) {
    console.error('Get compliance scores error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get compliance scores',
      error: error.message
    });
  }
});

// Get risk analysis
router.get('/risk-analysis', async (req, res) => {
  try {
    const { 
      period = '90d', 
      organizationId, 
      riskTypes = ['operational', 'regulatory', 'financial'],
      severity = 'all' 
    } = req.query;
    
    const riskAnalysis = await ExecutiveAnalyticsService.getRiskAnalysis(
      period,
      organizationId,
      riskTypes,
      severity
    );
    
    res.json({
      success: true,
      data: riskAnalysis
    });
  } catch (error) {
    console.error('Get risk analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get risk analysis',
      error: error.message
    });
  }
});

// Get deadline tracking and predictions
router.get('/deadline-tracking', async (req, res) => {
  try {
    const { 
      period = '60d', 
      organizationId, 
      categories = 'all',
      urgencyLevels = ['critical', 'high', 'medium'] 
    } = req.query;
    
    const deadlines = await ExecutiveAnalyticsService.getDeadlineTracking(
      period,
      organizationId,
      categories,
      urgencyLevels
    );
    
    res.json({
      success: true,
      data: deadlines
    });
  } catch (error) {
    console.error('Get deadline tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get deadline tracking',
      error: error.message
    });
  }
});

// Get financial impact analysis
router.get('/financial-impact', async (req, res) => {
  try {
    const { 
      period = '12m', 
      organizationId, 
      currency = 'USD',
      includeProjections = true 
    } = req.query;
    
    const financialImpact = await ExecutiveAnalyticsService.getFinancialImpactAnalysis(
      period,
      organizationId,
      currency,
      includeProjections
    );
    
    res.json({
      success: true,
      data: financialImpact
    });
  } catch (error) {
    console.error('Get financial impact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get financial impact analysis',
      error: error.message
    });
  }
});

// Get regulatory landscape changes
router.get('/regulatory-changes', async (req, res) => {
  try {
    const { 
      period = '6m', 
      organizationId, 
      jurisdictions = 'all',
      impactLevel = 'medium' 
    } = req.query;
    
    const changes = await ExecutiveAnalyticsService.getRegulatoryChanges(
      period,
      organizationId,
      jurisdictions,
      impactLevel
    );
    
    res.json({
      success: true,
      data: changes
    });
  } catch (error) {
    console.error('Get regulatory changes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get regulatory changes',
      error: error.message
    });
  }
});

// Get performance benchmarking
router.get('/benchmarking', async (req, res) => {
  try {
    const { 
      industry = 'general',
      companySize = 'all',
      organizationId,
      metrics = ['compliance_score', 'risk_level', 'cost_efficiency'] 
    } = req.query;
    
    const benchmarking = await ExecutiveAnalyticsService.getPerformanceBenchmarking(
      industry,
      companySize,
      organizationId,
      metrics
    );
    
    res.json({
      success: true,
      data: benchmarking
    });
  } catch (error) {
    console.error('Get benchmarking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get performance benchmarking',
      error: error.message
    });
  }
});

// Get key performance indicators
router.get('/kpis', async (req, res) => {
  try {
    const { 
      period = '30d', 
      organizationId, 
      kpiTypes = ['operational', 'strategic', 'financial'],
      customKPIs = [] 
    } = req.query;
    
    const kpis = await ExecutiveAnalyticsService.getKeyPerformanceIndicators(
      period,
      organizationId,
      kpiTypes,
      customKPIs
    );
    
    res.json({
      success: true,
      data: kpis
    });
  } catch (error) {
    console.error('Get KPIs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get key performance indicators',
      error: error.message
    });
  }
});

// Get predictive analytics
router.get('/predictions', async (req, res) => {
  try {
    const { 
      forecastPeriod = '6m', 
      organizationId, 
      predictionTypes = ['compliance_trends', 'risk_factors', 'resource_needs'],
      confidenceLevel = 0.8 
    } = req.query;
    
    const predictions = await ExecutiveAnalyticsService.getPredictiveAnalytics(
      forecastPeriod,
      organizationId,
      predictionTypes,
      confidenceLevel
    );
    
    res.json({
      success: true,
      data: predictions
    });
  } catch (error) {
    console.error('Get predictions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get predictive analytics',
      error: error.message
    });
  }
});

// Get resource utilization analysis
router.get('/resource-utilization', async (req, res) => {
  try {
    const { 
      period = '30d', 
      organizationId, 
      resourceTypes = ['human', 'financial', 'technological'],
      efficiencyMetrics = true 
    } = req.query;
    
    const utilization = await ExecutiveAnalyticsService.getResourceUtilizationAnalysis(
      period,
      organizationId,
      resourceTypes,
      efficiencyMetrics
    );
    
    res.json({
      success: true,
      data: utilization
    });
  } catch (error) {
    console.error('Get resource utilization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get resource utilization analysis',
      error: error.message
    });
  }
});

// Get audit readiness score
router.get('/audit-readiness', async (req, res) => {
  try {
    const { 
      organizationId, 
      auditTypes = ['internal', 'external', 'regulatory'],
      readinessLevel = 'comprehensive' 
    } = req.query;
    
    const readiness = await ExecutiveAnalyticsService.getAuditReadinessScore(
      organizationId,
      auditTypes,
      readinessLevel
    );
    
    res.json({
      success: true,
      data: readiness
    });
  } catch (error) {
    console.error('Get audit readiness error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get audit readiness score',
      error: error.message
    });
  }
});

// Get compliance cost analysis
router.get('/compliance-costs', async (req, res) => {
  try {
    const { 
      period = '12m', 
      organizationId, 
      costCategories = 'all',
      includeForecasting = true 
    } = req.query;
    
    const costs = await ExecutiveAnalyticsService.getComplianceCostAnalysis(
      period,
      organizationId,
      costCategories,
      includeForecasting
    );
    
    res.json({
      success: true,
      data: costs
    });
  } catch (error) {
    console.error('Get compliance costs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get compliance cost analysis',
      error: error.message
    });
  }
});

// Generate executive report
router.post('/generate-report', async (req, res) => {
  try {
    const { 
      reportType = 'comprehensive',
      period = '30d',
      organizationId,
      sections = [],
      format = 'json',
      includeCharts = true 
    } = req.body;
    
    const report = await ExecutiveAnalyticsService.generateExecutiveReport(
      reportType,
      period,
      organizationId,
      sections,
      format,
      includeCharts
    );
    
    res.json({
      success: true,
      message: 'Executive report generated successfully',
      data: report
    });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate executive report',
      error: error.message
    });
  }
});

// Get real-time alerts and notifications
router.get('/real-time-alerts', async (req, res) => {
  try {
    const { 
      organizationId, 
      severity = 'medium',
      categories = ['compliance', 'risk', 'deadline'],
      limit = 20 
    } = req.query;
    
    const alerts = await ExecutiveAnalyticsService.getRealTimeAlerts(
      organizationId,
      severity,
      categories,
      limit
    );
    
    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('Get real-time alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get real-time alerts',
      error: error.message
    });
  }
});

// Get strategic recommendations
router.get('/recommendations', async (req, res) => {
  try {
    const { 
      organizationId, 
      priority = 'high',
      categories = ['improvement', 'optimization', 'strategic'],
      implementationHorizon = '6m' 
    } = req.query;
    
    const recommendations = await ExecutiveAnalyticsService.getStrategicRecommendations(
      organizationId,
      priority,
      categories,
      implementationHorizon
    );
    
    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get strategic recommendations',
      error: error.message
    });
  }
});

// Update metric configuration
router.put('/metric-config/:metricId', async (req, res) => {
  try {
    const { metricId } = req.params;
    const { configuration } = req.body;
    
    const result = await ExecutiveAnalyticsService.updateMetricConfiguration(metricId, configuration);
    
    res.json({
      success: true,
      message: 'Metric configuration updated successfully',
      data: result
    });
  } catch (error) {
    console.error('Update metric config error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update metric configuration',
      error: error.message
    });
  }
});

// Export analytics data
router.post('/export', async (req, res) => {
  try {
    const { 
      dataTypes = ['metrics', 'trends', 'predictions'],
      period = '30d',
      organizationId,
      format = 'excel',
      filters = {} 
    } = req.body;
    
    const exportData = await ExecutiveAnalyticsService.exportAnalyticsData(
      dataTypes,
      period,
      organizationId,
      format,
      filters
    );
    
    res.json({
      success: true,
      message: 'Analytics data exported successfully',
      data: exportData
    });
  } catch (error) {
    console.error('Export analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export analytics data',
      error: error.message
    });
  }
});

// Get industry comparison data
router.get('/industry-comparison', async (req, res) => {
  try {
    const { 
      industry = 'general',
      companySize = 'all',
      organizationId,
      comparisonMetrics = ['compliance_score', 'cost_efficiency', 'risk_level'] 
    } = req.query;
    
    const comparison = await ExecutiveAnalyticsService.getIndustryComparison(
      industry,
      companySize,
      organizationId,
      comparisonMetrics
    );
    
    res.json({
      success: true,
      data: comparison
    });
  } catch (error) {
    console.error('Get industry comparison error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get industry comparison',
      error: error.message
    });
  }
});

// Get time-series data for specific metrics
router.get('/time-series/:metricName', async (req, res) => {
  try {
    const { metricName } = req.params;
    const { 
      period = '12m', 
      organizationId, 
      granularity = 'monthly',
      includeForecast = true 
    } = req.query;
    
    const timeSeries = await ExecutiveAnalyticsService.getTimeSeriesData(
      metricName,
      period,
      organizationId,
      granularity,
      includeForecast
    );
    
    res.json({
      success: true,
      data: timeSeries
    });
  } catch (error) {
    console.error('Get time-series data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get time-series data',
      error: error.message
    });
  }
});

module.exports = router;