const ExecutiveMetric = require('../models/ExecutiveMetric');
const ComplianceVerification = require('../models/ComplianceVerification');
const ComplianceDeadline = require('../models/ComplianceDeadline');
const RiskAssessment = require('../models/RiskAssessment');
const AIDocument = require('../models/AIDocument');
const Institution = require('../models/Institution');

class ExecutiveAnalyticsService {
  constructor() {
    this.metricCategories = {
      compliance_overall: {
        name: 'Overall Compliance Score',
        description: 'Aggregate compliance score across all councils',
        target: 95,
        weight: 0.4
      },
      compliance_by_council: {
        name: 'Council-Specific Compliance',
        description: 'Compliance scores by UGC, AICTE, and NAAC',
        target: 90,
        weight: 0.3
      },
      risk_assessment: {
        name: 'Risk Assessment Score',
        description: 'AI-powered risk assessment results',
        target: 80,
        weight: 0.2
      },
      deadline_management: {
        name: 'Deadline Management',
        description: 'On-time completion and deadline adherence',
        target: 85,
        weight: 0.1
      }
    };
  }

  // Calculate executive metrics for an institution
  async calculateExecutiveMetrics(institutionId, periodType = 'monthly') {
    try {
      const metrics = [];
      const period = this.getCurrentPeriod(periodType);

      // Calculate overall compliance score
      const overallCompliance = await this.calculateOverallCompliance(institutionId, period);
      metrics.push(overallCompliance);

      // Calculate council-specific compliance
      const councilCompliance = await this.calculateCouncilCompliance(institutionId, period);
      metrics.push(...councilCompliance);

      // Calculate risk assessment metrics
      const riskMetrics = await this.calculateRiskMetrics(institutionId, period);
      metrics.push(...riskMetrics);

      // Calculate deadline management metrics
      const deadlineMetrics = await this.calculateDeadlineMetrics(institutionId, period);
      metrics.push(...deadlineMetrics);

      // Calculate document processing metrics
      const documentMetrics = await this.calculateDocumentMetrics(institutionId, period);
      metrics.push(...documentMetrics);

      // Save metrics to database
      await this.saveMetrics(metrics);

      return metrics;
    } catch (error) {
      console.error('Failed to calculate executive metrics:', error);
      throw error;
    }
  }

  // Calculate overall compliance score
  async calculateOverallCompliance(institutionId, period) {
    const verifications = await ComplianceVerification.findAll({
      where: {
        institutionId,
        isActive: true,
        createdAt: {
          [require('sequelize').Op.between]: [period.start, period.end]
        }
      }
    });

    const totalVerifications = verifications.length;
    const compliantVerifications = verifications.filter(v => v.isCompliant).length;
    const avgScore = totalVerifications > 0 ? 
      verifications.reduce((sum, v) => sum + (v.verificationScore || 0), 0) / totalVerifications : 0;

    const complianceRate = totalVerifications > 0 ? (compliantVerifications / totalVerifications) * 100 : 0;

    return this.createMetric(institutionId, 'compliance_overall', 'Overall Compliance Score', {
      currentValue: avgScore,
      complianceScore: avgScore,
      performanceIndicator: this.getPerformanceIndicator(avgScore, 95),
      trend: await this.calculateTrend(institutionId, 'compliance_overall', avgScore),
      changePercentage: await this.calculateChangePercentage(institutionId, 'compliance_overall', avgScore),
      businessImpact: avgScore < 80 ? 'high' : avgScore < 90 ? 'medium' : 'low',
      actionRequired: avgScore < 80,
      actionItems: avgScore < 80 ? [
        'Review non-compliant areas',
        'Implement corrective measures',
        'Schedule follow-up verification'
      ] : []
    }, period);
  }

  // Calculate council-specific compliance
  async calculateCouncilCompliance(institutionId, period) {
    const councils = ['UGC', 'AICTE', 'NAAC'];
    const metrics = [];

    for (const council of councils) {
      const verifications = await ComplianceVerification.findAll({
        where: {
          institutionId,
          isActive: true,
          createdAt: {
            [require('sequelize').Op.between]: [period.start, period.end]
          },
          '$portal.portalCode$': council
        },
        include: [{
          model: require('./GovernmentPortal'),
          as: 'portal',
          where: { portalCode: council }
        }]
      });

      const totalVerifications = verifications.length;
      const compliantVerifications = verifications.filter(v => v.isCompliant).length;
      const avgScore = totalVerifications > 0 ? 
        verifications.reduce((sum, v) => sum + (v.verificationScore || 0), 0) / totalVerifications : 0;

      const complianceRate = totalVerifications > 0 ? (compliantVerifications / totalVerifications) * 100 : 0;

      metrics.push(this.createMetric(institutionId, 'compliance_by_council', `${council} Compliance`, {
        currentValue: avgScore,
        complianceScore: avgScore,
        performanceIndicator: this.getPerformanceIndicator(avgScore, 90),
        trend: await this.calculateTrend(institutionId, 'compliance_by_council', avgScore),
        changePercentage: await this.calculateChangePercentage(institutionId, 'compliance_by_council', avgScore),
        councilBreakdown: { [council]: avgScore },
        businessImpact: avgScore < 80 ? 'high' : avgScore < 90 ? 'medium' : 'low',
        actionRequired: avgScore < 80
      }, period));
    }

    return metrics;
  }

  // Calculate risk assessment metrics
  async calculateRiskMetrics(institutionId, period) {
    const riskAssessments = await RiskAssessment.findAll({
      where: {
        institutionId,
        isActive: true,
        assessmentDate: {
          [require('sequelize').Op.between]: [period.start, period.end]
        }
      }
    });

    const totalAssessments = riskAssessments.length;
    const avgRiskScore = totalAssessments > 0 ? 
      riskAssessments.reduce((sum, r) => sum + (r.riskScore || 0), 0) / totalAssessments : 0;
    
    const highRiskCount = riskAssessments.filter(r => r.riskScore > 70).length;
    const criticalRiskCount = riskAssessments.filter(r => r.riskLevel === 'critical').length;

    const metrics = [];

    // Overall risk score
    metrics.push(this.createMetric(institutionId, 'risk_assessment', 'Average Risk Score', {
      currentValue: avgRiskScore,
      riskScore: avgRiskScore,
      riskLevel: this.getRiskLevel(avgRiskScore),
      performanceIndicator: this.getPerformanceIndicator(100 - avgRiskScore, 80), // Inverted for risk
      trend: await this.calculateTrend(institutionId, 'risk_assessment', avgRiskScore),
      changePercentage: await this.calculateChangePercentage(institutionId, 'risk_assessment', avgRiskScore),
      businessImpact: avgRiskScore > 70 ? 'high' : avgRiskScore > 50 ? 'medium' : 'low',
      actionRequired: avgRiskScore > 70,
      actionItems: avgRiskScore > 70 ? [
        'Immediate risk mitigation required',
        'Review high-risk areas',
        'Implement preventive measures'
      ] : []
    }, period));

    // High risk count
    metrics.push(this.createMetric(institutionId, 'risk_assessment', 'High Risk Items', {
      currentValue: highRiskCount,
      riskScore: (highRiskCount / Math.max(totalAssessments, 1)) * 100,
      performanceIndicator: highRiskCount === 0 ? 'above_target' : highRiskCount < 3 ? 'on_target' : 'below_target',
      businessImpact: highRiskCount > 5 ? 'high' : highRiskCount > 2 ? 'medium' : 'low'
    }, period));

    return metrics;
  }

  // Calculate deadline management metrics
  async calculateDeadlineMetrics(institutionId, period) {
    const deadlines = await ComplianceDeadline.findAll({
      where: {
        institutionId,
        createdAt: {
          [require('sequelize').Op.between]: [period.start, period.end]
        }
      }
    });

    const totalDeadlines = deadlines.length;
    const completedDeadlines = deadlines.filter(d => d.status === 'completed').length;
    const overdueDeadlines = deadlines.filter(d => d.status === 'overdue').length;
    const onTimeCompletion = deadlines.filter(d => 
      d.status === 'completed' && d.completedDate && 
      new Date(d.completedDate) <= new Date(d.dueDate)
    ).length;

    const completionRate = totalDeadlines > 0 ? (completedDeadlines / totalDeadlines) * 100 : 0;
    const onTimeRate = completedDeadlines > 0 ? (onTimeCompletion / completedDeadlines) * 100 : 0;

    const metrics = [];

    // Completion rate
    metrics.push(this.createMetric(institutionId, 'deadline_management', 'Deadline Completion Rate', {
      currentValue: completionRate,
      complianceScore: completionRate,
      performanceIndicator: this.getPerformanceIndicator(completionRate, 85),
      trend: await this.calculateTrend(institutionId, 'deadline_management', completionRate),
      businessImpact: completionRate < 70 ? 'high' : completionRate < 85 ? 'medium' : 'low'
    }, period));

    // On-time completion rate
    metrics.push(this.createMetric(institutionId, 'deadline_management', 'On-Time Completion Rate', {
      currentValue: onTimeRate,
      complianceScore: onTimeRate,
      performanceIndicator: this.getPerformanceIndicator(onTimeRate, 80),
      businessImpact: onTimeRate < 70 ? 'high' : 'low'
    }, period));

    return metrics;
  }

  // Calculate document processing metrics
  async calculateDocumentMetrics(institutionId, period) {
    const documents = await AIDocument.findAll({
      where: {
        institutionId,
        uploadedAt: {
          [require('sequelize').Op.between]: [period.start, period.end]
        }
      }
    });

    const totalDocuments = documents.length;
    const processedDocuments = documents.filter(d => d.processingStatus === 'completed').length;
    const avgConfidence = totalDocuments > 0 ?
      documents.reduce((sum, d) => sum + (d.aiConfidence || 0), 0) / totalDocuments : 0;
    
    const avgComplianceScore = totalDocuments > 0 ?
      documents.reduce((sum, d) => sum + (d.complianceScore || 0), 0) / totalDocuments : 0;

    const processingRate = totalDocuments > 0 ? (processedDocuments / totalDocuments) * 100 : 0;

    const metrics = [];

    // Processing rate
    metrics.push(this.createMetric(institutionId, 'document_processing', 'Document Processing Rate', {
      currentValue: processingRate,
      performanceIndicator: this.getPerformanceIndicator(processingRate, 90),
      businessImpact: processingRate < 80 ? 'medium' : 'low'
    }, period));

    // AI confidence
    metrics.push(this.createMetric(institutionId, 'document_processing', 'Average AI Confidence', {
      currentValue: avgConfidence,
      performanceIndicator: this.getPerformanceIndicator(avgConfidence, 85),
      businessImpact: avgConfidence < 70 ? 'medium' : 'low'
    }, period));

    // Document compliance score
    metrics.push(this.createMetric(institutionId, 'document_processing', 'Document Compliance Score', {
      currentValue: avgComplianceScore,
      complianceScore: avgComplianceScore,
      performanceIndicator: this.getPerformanceIndicator(avgComplianceScore, 80),
      businessImpact: avgComplianceScore < 70 ? 'medium' : 'low'
    }, period));

    return metrics;
  }

  // Create metric object
  createMetric(institutionId, category, name, data, period) {
    return {
      institutionId,
      metricName: name,
      metricCategory: category,
      currentValue: data.currentValue,
      previousValue: data.previousValue,
      targetValue: data.targetValue || this.metricCategories[category]?.target || 90,
      performanceIndicator: data.performanceIndicator || 'on_target',
      trend: data.trend || 'stable',
      changePercentage: data.changePercentage,
      periodType: period.type,
      periodStart: period.start,
      periodEnd: period.end,
      calculatedAt: new Date(),
      riskScore: data.riskScore,
      riskLevel: data.riskLevel,
      complianceScore: data.complianceScore,
      councilBreakdown: data.councilBreakdown,
      businessImpact: data.businessImpact || 'medium',
      actionRequired: data.actionRequired || false,
      actionItems: data.actionItems || [],
      dataCompleteness: 100,
      dataAccuracy: 95
    };
  }

  // Get current period
  getCurrentPeriod(periodType) {
    const now = new Date();
    const period = { type: periodType, start: null, end: now };

    switch (periodType) {
      case 'daily':
        period.start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        period.start = startOfWeek;
        break;
      case 'monthly':
        period.start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarterly':
        const quarter = Math.floor(now.getMonth() / 3);
        period.start = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case 'yearly':
        period.start = new Date(now.getFullYear(), 0, 1);
        break;
    }

    return period;
  }

  // Get performance indicator
  getPerformanceIndicator(value, target) {
    if (value >= target * 1.1) return 'above_target';
    if (value >= target * 0.9) return 'on_target';
    if (value >= target * 0.7) return 'below_target';
    return 'critical';
  }

  // Get risk level
  getRiskLevel(score) {
    if (score >= 80) return 'very_low';
    if (score >= 60) return 'low';
    if (score >= 40) return 'medium';
    if (score >= 20) return 'high';
    return 'critical';
  }

  // Calculate trend
  async calculateTrend(institutionId, metricName, currentValue) {
    try {
      const previousMetric = await ExecutiveMetric.findOne({
        where: {
          institutionId,
          metricName,
          isArchived: false
        },
        order: [['calculatedAt', 'DESC']],
        limit: 1
      });

      if (!previousMetric || !previousMetric.currentValue) {
        return 'stable';
      }

      const change = ((currentValue - previousMetric.currentValue) / previousMetric.currentValue) * 100;
      
      if (change > 5) return 'improving';
      if (change < -5) return 'declining';
      return 'stable';
    } catch (error) {
      return 'stable';
    }
  }

  // Calculate change percentage
  async calculateChangePercentage(institutionId, metricName, currentValue) {
    try {
      const previousMetric = await ExecutiveMetric.findOne({
        where: {
          institutionId,
          metricName,
          isArchived: false
        },
        order: [['calculatedAt', 'DESC']],
        limit: 1
      });

      if (!previousMetric || !previousMetric.currentValue) {
        return 0;
      }

      return ((currentValue - previousMetric.currentValue) / previousMetric.currentValue) * 100;
    } catch (error) {
      return 0;
    }
  }

  // Save metrics to database
  async saveMetrics(metrics) {
    const savedMetrics = [];
    
    for (const metricData of metrics) {
      try {
        // Check if metric already exists for this period
        const existing = await ExecutiveMetric.findOne({
          where: {
            institutionId: metricData.institutionId,
            metricName: metricData.metricName,
            periodType: metricData.periodType,
            periodStart: metricData.periodStart,
            isArchived: false
          }
        });

        if (existing) {
          // Update existing metric
          Object.assign(existing, metricData);
          await existing.save();
          savedMetrics.push(existing);
        } else {
          // Create new metric
          const metric = await ExecutiveMetric.create(metricData);
          savedMetrics.push(metric);
        }
      } catch (error) {
        console.error('Failed to save metric:', error);
      }
    }

    return savedMetrics;
  }

  // Generate executive dashboard data
  async getExecutiveDashboard(institutionId) {
    try {
      const currentMetrics = await ExecutiveMetric.getCurrentMetrics(institutionId);
      const alerts = await ExecutiveMetric.getAlerts(institutionId);
      const summary = await ExecutiveMetric.getExecutiveSummary(institutionId);

      // Calculate overall compliance score
      const complianceMetrics = currentMetrics.filter(m => 
        m.metricCategory === 'compliance_overall' || m.metricCategory === 'compliance_by_council'
      );
      
      const overallScore = complianceMetrics.length > 0 ?
        complianceMetrics.reduce((sum, m) => sum + m.currentValue, 0) / complianceMetrics.length : 0;

      // Calculate risk score
      const riskMetrics = currentMetrics.filter(m => m.metricCategory === 'risk_assessment');
      const avgRiskScore = riskMetrics.length > 0 ?
        riskMetrics.reduce((sum, m) => sum + m.currentValue, 0) / riskMetrics.length : 0;

      return {
        institutionId,
        overallComplianceScore: Math.round(overallScore * 100) / 100,
        riskScore: Math.round(avgRiskScore * 100) / 100,
        totalMetrics: currentMetrics.length,
        criticalAlerts: alerts.filter(a => a.alertLevel === 'critical').length,
        actionItems: alerts.filter(a => a.actionRequired).length,
        performanceIndicators: {
          aboveTarget: currentMetrics.filter(m => m.performanceIndicator === 'above_target').length,
          onTarget: currentMetrics.filter(m => m.performanceIndicator === 'on_target').length,
          belowTarget: currentMetrics.filter(m => m.performanceIndicator === 'below_target').length,
          critical: currentMetrics.filter(m => m.performanceIndicator === 'critical').length
        },
        councilScores: this.calculateCouncilScores(currentMetrics),
        recentTrends: await this.getRecentTrends(institutionId),
        alerts: alerts.slice(0, 10), // Latest 10 alerts
        summary: summary
      };
    } catch (error) {
      console.error('Failed to generate executive dashboard:', error);
      throw error;
    }
  }

  // Calculate council scores
  calculateCouncilScores(metrics) {
    const councilMetrics = metrics.filter(m => m.metricCategory === 'compliance_by_council');
    const scores = {};

    for (const metric of councilMetrics) {
      const councilName = metric.metricName.replace(' Compliance', '');
      scores[councilName] = metric.currentValue;
    }

    return scores;
  }

  // Get recent trends
  async getRecentTrends(institutionId) {
    try {
      const trends = [];
      const categories = ['compliance_overall', 'risk_assessment', 'deadline_management'];

      for (const category of categories) {
        const metrics = await ExecutiveMetric.findAll({
          where: {
            institutionId,
            metricCategory: category,
            isArchived: false
          },
          order: [['periodStart', 'DESC']],
          limit: 6 // Last 6 periods
        });

        trends.push({
          category,
          data: metrics.map(m => ({
            period: m.periodStart,
            value: m.currentValue,
            trend: m.trend
          }))
        });
      }

      return trends;
    } catch (error) {
      console.error('Failed to get recent trends:', error);
      return [];
    }
  }

  // Get peer benchmarking data
  async getPeerBenchmarking(institutionId, institutionType = 'all') {
    try {
      const institution = await Institution.findByPk(institutionId);
      if (!institution) {
        throw new Error('Institution not found');
      }

      // Get all institutions for comparison
      const whereClause = institutionType !== 'all' ? { type: institutionType } : {};
      const peerInstitutions = await Institution.findAll({
        where: whereClause,
        attributes: ['id', 'name', 'type', 'location']
      });

      const benchmarkData = [];
      
      for (const peer of peerInstitutions) {
        if (peer.id === institutionId) continue; // Skip self

        const metrics = await ExecutiveMetric.findAll({
          where: {
            institutionId: peer.id,
            isArchived: false,
            periodType: 'monthly'
          },
          order: [['calculatedAt', 'DESC']],
          limit: 1
        });

        if (metrics.length > 0) {
          const latestMetric = metrics[0];
          benchmarkData.push({
            institutionId: peer.id,
            institutionName: peer.name,
            institutionType: peer.type,
            location: peer.location,
            overallScore: latestMetric.currentValue,
            percentileRank: latestMetric.percentileRank || null
          });
        }
      }

      // Sort by overall score
      benchmarkData.sort((a, b) => b.overallScore - a.overallScore);

      // Calculate percentile rank for the current institution
      const currentInstitutionScore = await this.getInstitutionScore(institutionId);
      const percentileRank = this.calculatePercentileRank(currentInstitutionScore, benchmarkData.map(b => b.overallScore));

      return {
        institutionId,
        peerCount: benchmarkData.length,
        percentileRank,
        peerAverage: benchmarkData.length > 0 ? 
          benchmarkData.reduce((sum, b) => sum + b.overallScore, 0) / benchmarkData.length : 0,
        bestInClass: benchmarkData.length > 0 ? benchmarkData[0].overallScore : 0,
        peers: benchmarkData.slice(0, 10) // Top 10 peers
      };
    } catch (error) {
      console.error('Failed to get peer benchmarking:', error);
      throw error;
    }
  }

  // Get institution's overall score
  async getInstitutionScore(institutionId) {
    const metrics = await ExecutiveMetric.findAll({
      where: {
        institutionId,
        metricCategory: 'compliance_overall',
        isArchived: false
      },
      order: [['calculatedAt', 'DESC']],
      limit: 1
    });

    return metrics.length > 0 ? metrics[0].currentValue : 0;
  }

  // Calculate percentile rank
  calculatePercentileRank(score, peerScores) {
    if (peerScores.length === 0) return 50;
    
    const sortedScores = [...peerScores].sort((a, b) => a - b);
    const rank = sortedScores.filter(s => s < score).length;
    return Math.round((rank / peerScores.length) * 100);
  }

  // Generate predictive analytics
  async generatePredictiveAnalytics(institutionId) {
    try {
      // Get historical data for trend analysis
      const historicalMetrics = await ExecutiveMetric.findAll({
        where: {
          institutionId,
          isArchived: false
        },
        order: [['periodStart', 'ASC']],
        limit: 12 // Last 12 periods
      });

      // Simple linear regression for prediction
      const predictions = this.calculatePredictions(historicalMetrics);

      return {
        institutionId,
        predictions,
        confidence: this.calculatePredictionConfidence(historicalMetrics),
        generatedAt: new Date(),
        dataPoints: historicalMetrics.length
      };
    } catch (error) {
      console.error('Failed to generate predictive analytics:', error);
      throw error;
    }
  }

  // Calculate predictions using simple linear regression
  calculatePredictions(metrics) {
    const predictions = {};
    
    // Group metrics by category
    const groupedMetrics = {};
    metrics.forEach(m => {
      if (!groupedMetrics[m.metricCategory]) {
        groupedMetrics[m.metricCategory] = [];
      }
      groupedMetrics[m.metricCategory].push(m);
    });

    // Calculate predictions for each category
    for (const [category, categoryMetrics] of Object.entries(groupedMetrics)) {
      if (categoryMetrics.length < 3) continue; // Need at least 3 data points

      const values = categoryMetrics.map(m => m.currentValue);
      const x = values.map((_, i) => i); // Time periods
      const y = values;

      // Simple linear regression: y = ax + b
      const n = x.length;
      const sumX = x.reduce((a, b) => a + b, 0);
      const sumY = y.reduce((a, b) => a + b, 0);
      const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
      const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;

      // Predict next 3 periods
      const futureValues = [];
      for (let i = 1; i <= 3; i++) {
        const futureX = x.length + i - 1;
        const predictedValue = slope * futureX + intercept;
        futureValues.push(Math.max(0, Math.min(100, predictedValue))); // Clamp between 0-100
      }

      predictions[category] = {
        currentValue: values[values.length - 1],
        predictedValues,
        trend: slope > 0.1 ? 'improving' : slope < -0.1 ? 'declining' : 'stable',
        confidence: this.calculateTrendConfidence(values)
      };
    }

    return predictions;
  }

  // Calculate trend confidence
  calculateTrendConfidence(values) {
    if (values.length < 3) return 0;
    
    // Calculate R-squared for trend reliability
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const totalSumSquares = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0);
    
    // Simple variance-based confidence
    const variance = totalSumSquares / values.length;
    const confidence = Math.max(0, Math.min(100, 100 - variance));
    
    return Math.round(confidence);
  }

  // Calculate prediction confidence
  calculatePredictionConfidence(metrics) {
    const dataPoints = metrics.length;
    const avgConfidence = metrics.reduce((sum, m) => sum + (m.dataAccuracy || 0), 0) / dataPoints;
    
    // Base confidence on data points and accuracy
    const dataPointsScore = Math.min(100, (dataPoints / 12) * 100); // Max points for 12 periods
    const confidence = (dataPointsScore * 0.4) + (avgConfidence * 0.6);
    
    return Math.round(confidence);
  }
}

module.exports = new ExecutiveAnalyticsService();