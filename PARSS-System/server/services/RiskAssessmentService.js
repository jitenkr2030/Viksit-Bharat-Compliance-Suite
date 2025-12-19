const { Op } = require('sequelize');
const Document = require('../models/Document');
const Alert = require('../models/Alert');
const Faculty = require('../models/Faculty');
const Institution = require('../models/Institution');
const { redisClient } = require('../config/redis');
const logger = require('../middleware/logger');

class RiskAssessmentService {
  /**
   * Generate comprehensive compliance risk assessment
   */
  async assessComplianceRisk(institutionId) {
    try {
      const cachedAssessment = await redisClient.cacheGet(`risk_assessment:${institutionId}`);
      if (cachedAssessment && this.isAssessmentValid(cachedAssessment.timestamp)) {
        return cachedAssessment;
      }

      const assessment = {
        timestamp: new Date(),
        institutionId,
        overallScore: 0,
        riskLevel: 'LOW',
        predictedPenalty: 0,
        factors: {},
        recommendations: [],
        trends: {},
        predictions: {}
      };

      // Calculate individual risk factors
      const [
        documentRisk,
        alertRisk,
        facultyRisk,
        complianceScoreRisk,
        deadlineRisk,
        historicalRisk
      ] = await Promise.all([
        this.assessDocumentRisk(institutionId),
        this.assessAlertRisk(institutionId),
        this.assessFacultyRisk(institutionId),
        this.assessComplianceScoreRisk(institutionId),
        this.assessDeadlineRisk(institutionId),
        this.assessHistoricalRisk(institutionId)
      ]);

      assessment.factors = {
        documentExpiry: documentRisk,
        alerts: alertRisk,
        facultyCompliance: facultyRisk,
        complianceScore: complianceScoreRisk,
        deadlines: deadlineRisk,
        historical: historicalRisk
      };

      // Calculate overall risk score (0-100, higher = more risk)
      assessment.overallScore = this.calculateOverallRiskScore(assessment.factors);
      
      // Determine risk level
      assessment.riskLevel = this.determineRiskLevel(assessment.overallScore);
      
      // Calculate predicted penalty probability
      assessment.predictedPenalty = this.calculatePenaltyProbability(assessment);
      
      // Generate recommendations
      assessment.recommendations = this.generateRecommendations(assessment);
      
      // Calculate trends
      assessment.trends = await this.calculateRiskTrends(institutionId);
      
      // Generate predictions
      assessment.predictions = await this.generatePredictions(institutionId, assessment);

      // Cache the assessment
      await redisClient.cacheSet(
        `risk_assessment:${institutionId}`,
        assessment,
        4 * 60 * 60 // 4 hours
      );

      logger.info('Risk assessment generated', { 
        institutionId, 
        overallScore: assessment.overallScore,
        riskLevel: assessment.riskLevel 
      });

      return assessment;

    } catch (error) {
      logger.error('Risk assessment failed:', { error: error.message, stack: error.stack, institutionId });
      throw error;
    }
  }

  /**
   * Generate assessment based on type
   */
  async generateAssessment(institutionId, options = {}) {
    const { type = 'comprehensive', includePredictions = true, includeRecommendations = true } = options;

    const baseAssessment = await this.assessComplianceRisk(institutionId);

    switch (type) {
      case 'comprehensive':
        return baseAssessment;
      case 'predictive':
        return {
          ...baseAssessment,
          predictions: await this.generatePredictions(institutionId, baseAssessment),
          timeHorizon: '12 months'
        };
      case 'historical':
        return {
          ...baseAssessment,
          historicalTrends: await this.getHistoricalTrends(institutionId),
          patterns: await this.identifyRiskPatterns(institutionId)
        };
      default:
        return baseAssessment;
    }
  }

  /**
   * Assess document-related risk factors
   */
  async assessDocumentRisk(institutionId) {
    try {
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

      const [
        totalDocuments,
        expiredDocuments,
        expiringSoonDocuments,
        missingDocuments,
        pendingDocuments
      ] = await Promise.all([
        Document.count({ where: { institution_id: institutionId, is_active: true } }),
        Document.count({
          where: {
            institution_id: institutionId,
            expiry_date: { [Op.lt]: now },
            is_active: true
          }
        }),
        Document.count({
          where: {
            institution_id: institutionId,
            expiry_date: { [Op.gte]: now, [Op.lte]: thirtyDaysFromNow },
            is_active: true
          }
        }),
        Document.count({
          where: {
            institution_id: institutionId,
            status: 'missing',
            is_active: true
          }
        }),
        Document.count({
          where: {
            institution_id: institutionId,
            status: 'pending',
            is_active: true
          }
        })
      ]);

      const riskScore = this.calculateDocumentRiskScore({
        totalDocuments,
        expiredDocuments,
        expiringSoonDocuments,
        missingDocuments,
        pendingDocuments
      });

      return {
        score: riskScore,
        level: this.determineRiskLevel(riskScore),
        factors: {
          total: totalDocuments,
          expired: expiredDocuments,
          expiringSoon: expiringSoonDocuments,
          missing: missingDocuments,
          pending: pendingDocuments
        },
        impact: this.calculateDocumentImpact(expiredDocuments, expiringSoonDocuments, missingDocuments),
        urgency: this.calculateDocumentUrgency(expiringSoonDocuments, missingDocuments)
      };

    } catch (error) {
      logger.error('Document risk assessment failed:', { error: error.message, institutionId });
      return { score: 50, level: 'MEDIUM', factors: {}, impact: 'unknown', urgency: 'unknown' };
    }
  }

  /**
   * Assess alert-related risk factors
   */
  async assessAlertRisk(institutionId) {
    try {
      const now = new Date();
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const [
        totalAlerts,
        criticalAlerts,
        highAlerts,
        overdueAlerts,
        unresolvedAlerts,
        recentAlerts
      ] = await Promise.all([
        Alert.count({ where: { institution_id: institutionId, is_active: true } }),
        Alert.count({
          where: {
            institution_id: institutionId,
            severity: 'critical',
            is_active: true
          }
        }),
        Alert.count({
          where: {
            institution_id: institutionId,
            severity: 'high',
            is_active: true
          }
        }),
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
            status: { [Op.ne]: 'resolved' },
            is_active: true
          }
        }),
        Alert.count({
          where: {
            institution_id: institutionId,
            created_at: { [Op.gte]: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
            is_active: true
          }
        })
      ]);

      const riskScore = this.calculateAlertRiskScore({
        totalAlerts,
        criticalAlerts,
        highAlerts,
        overdueAlerts,
        unresolvedAlerts,
        recentAlerts
      });

      return {
        score: riskScore,
        level: this.determineRiskLevel(riskScore),
        factors: {
          total: totalAlerts,
          critical: criticalAlerts,
          high: highAlerts,
          overdue: overdueAlerts,
          unresolved: unresolvedAlerts,
          recent: recentAlerts
        },
        escalation: this.calculateAlertEscalation(criticalAlerts, overdueAlerts),
        trend: this.calculateAlertTrend(recentAlerts, totalAlerts)
      };

    } catch (error) {
      logger.error('Alert risk assessment failed:', { error: error.message, institutionId });
      return { score: 50, level: 'MEDIUM', factors: {}, escalation: 'unknown', trend: 'stable' };
    }
  }

  /**
   * Assess faculty-related risk factors
   */
  async assessFacultyRisk(institutionId) {
    try {
      const [
        totalFaculty,
        nonCompliantFaculty,
        pendingVerificationFaculty,
        expiredQualifications,
        missingDocumentation
      ] = await Promise.all([
        Faculty.count({ where: { institution_id: institutionId, is_active: true } }),
        Faculty.count({
          where: {
            institution_id: institutionId,
            compliance_status: 'non_compliant',
            is_active: true
          }
        }),
        Faculty.count({
          where: {
            institution_id: institutionId,
            verification_status: 'pending',
            is_active: true
          }
        }),
        Faculty.count({
          where: {
            institution_id: institutionId,
            qualification_expiry: { [Op.lt]: new Date() },
            is_active: true
          }
        }),
        Faculty.count({
          where: {
            institution_id: institutionId,
            documents_submitted: false,
            is_active: true
          }
        })
      ]);

      const complianceRate = totalFaculty > 0 ? ((totalFaculty - nonCompliantFaculty) / totalFaculty) * 100 : 100;

      const riskScore = this.calculateFacultyRiskScore({
        totalFaculty,
        nonCompliantFaculty,
        pendingVerificationFaculty,
        expiredQualifications,
        missingDocumentation,
        complianceRate
      });

      return {
        score: riskScore,
        level: this.determineRiskLevel(riskScore),
        factors: {
          total: totalFaculty,
          nonCompliant: nonCompliantFaculty,
          pendingVerification: pendingVerificationFaculty,
          expiredQualifications,
          missingDocumentation,
          complianceRate
        },
        severity: this.calculateFacultySeverity(nonCompliantFaculty, totalFaculty),
        impact: this.calculateFacultyImpact(nonCompliantFaculty, pendingVerificationFaculty)
      };

    } catch (error) {
      logger.error('Faculty risk assessment failed:', { error: error.message, institutionId });
      return { score: 50, level: 'MEDIUM', factors: {}, severity: 'medium', impact: 'moderate' };
    }
  }

  /**
   * Assess compliance score risk
   */
  async assessComplianceScoreRisk(institutionId) {
    try {
      // This would typically fetch from a compliance scoring service
      // For now, calculating based on available data
      
      const [documentScore, alertScore, facultyScore] = await Promise.all([
        this.getComplianceScore(institutionId, 'documents'),
        this.getComplianceScore(institutionId, 'alerts'),
        this.getComplianceScore(institutionId, 'faculty')
      ]);

      const overallScore = (documentScore + alertScore + facultyScore) / 3;
      
      return {
        score: 100 - overallScore, // Risk score (higher = more risk)
        level: this.determineRiskLevel(100 - overallScore),
        factors: {
          documentScore,
          alertScore,
          facultyScore,
          overallScore
        },
        trend: await this.getComplianceTrend(institutionId),
        benchmark: await this.getComplianceBenchmark(institutionId)
      };

    } catch (error) {
      logger.error('Compliance score risk assessment failed:', { error: error.message, institutionId });
      return { score: 50, level: 'MEDIUM', factors: {}, trend: 'stable', benchmark: 'average' };
    }
  }

  /**
   * Assess deadline-related risk factors
   */
  async assessDeadlineRisk(institutionId) {
    try {
      const now = new Date();
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const [
        totalDeadlines,
        overdueDeadlines,
        upcomingDeadlines,
        criticalDeadlines,
        missedDeadlines
      ] = await Promise.all([
        this.getTotalDeadlines(institutionId),
        this.getOverdueDeadlines(institutionId),
        this.getUpcomingDeadlinesCount(institutionId, thirtyDaysFromNow),
        this.getCriticalDeadlinesCount(institutionId, sevenDaysFromNow),
        this.getMissedDeadlinesCount(institutionId)
      ]);

      const riskScore = this.calculateDeadlineRiskScore({
        totalDeadlines,
        overdueDeadlines,
        upcomingDeadlines,
        criticalDeadlines,
        missedDeadlines
      });

      return {
        score: riskScore,
        level: this.determineRiskLevel(riskScore),
        factors: {
          total: totalDeadlines,
          overdue: overdueDeadlines,
          upcoming: upcomingDeadlines,
          critical: criticalDeadlines,
          missed: missedDeadlines
        },
        urgency: this.calculateDeadlineUrgency(criticalDeadlines, overdueDeadlines),
        impact: this.calculateDeadlineImpact(overdueDeadlines, missedDeadlines)
      };

    } catch (error) {
      logger.error('Deadline risk assessment failed:', { error: error.message, institutionId });
      return { score: 50, level: 'MEDIUM', factors: {}, urgency: 'medium', impact: 'moderate' };
    }
  }

  /**
   * Assess historical risk patterns
   */
  async assessHistoricalRisk(institutionId) {
    try {
      const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
      
      const [
        historicalAlerts,
        historicalViolations,
        historicalPenalties,
        improvementRate
      ] = await Promise.all([
        Alert.count({
          where: {
            institution_id: institutionId,
            created_at: { [Op.gte]: oneYearAgo },
            is_active: true
          }
        }),
        this.getHistoricalViolations(institutionId),
        this.getHistoricalPenalties(institutionId),
        this.calculateImprovementRate(institutionId)
      ]);

      const riskScore = this.calculateHistoricalRiskScore({
        historicalAlerts,
        historicalViolations,
        historicalPenalties,
        improvementRate
      });

      return {
        score: riskScore,
        level: this.determineRiskLevel(riskScore),
        factors: {
          historicalAlerts,
          historicalViolations,
          historicalPenalties,
          improvementRate
        },
        pattern: this.identifyHistoricalPattern(historicalViolations, improvementRate),
        trajectory: this.calculateTrajectory(improvementRate)
      };

    } catch (error) {
      logger.error('Historical risk assessment failed:', { error: error.message, institutionId });
      return { score: 50, level: 'MEDIUM', factors: {}, pattern: 'stable', trajectory: 'neutral' };
    }
  }

  // Helper calculation methods

  calculateOverallRiskScore(factors) {
    const weights = {
      documentExpiry: 0.25,
      alerts: 0.20,
      facultyCompliance: 0.20,
      complianceScore: 0.20,
      deadlines: 0.10,
      historical: 0.05
    };

    let weightedScore = 0;
    Object.entries(weights).forEach(([factor, weight]) => {
      if (factors[factor]) {
        weightedScore += factors[factor].score * weight;
      }
    });

    return Math.round(weightedScore);
  }

  determineRiskLevel(score) {
    if (score >= 80) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 40) return 'MEDIUM';
    return 'LOW';
  }

  calculatePenaltyProbability(assessment) {
    const { overallScore, factors } = assessment;
    
    // Base probability calculation
    let probability = 0.05; // 5% base probability

    // Adjust based on overall risk score
    probability += (overallScore / 100) * 0.30; // Up to 30% increase

    // Adjust based on critical factors
    if (factors.documentExpiry?.level === 'CRITICAL') probability += 0.15;
    if (factors.alerts?.level === 'CRITICAL') probability += 0.20;
    if (factors.facultyCompliance?.level === 'CRITICAL') probability += 0.10;
    if (factors.deadlines?.level === 'CRITICAL') probability += 0.15;

    // Adjust based on historical patterns
    if (factors.historical?.pattern === 'deteriorating') probability += 0.10;

    return Math.min(Math.round(probability * 100), 100); // Return as percentage
  }

  generateRecommendations(assessment) {
    const recommendations = [];
    const { factors, overallScore } = assessment;

    // Critical recommendations
    if (overallScore >= 80) {
      recommendations.push({
        priority: 'CRITICAL',
        category: 'immediate_action',
        title: 'Immediate Compliance Review Required',
        description: 'Overall risk score indicates critical compliance issues requiring immediate attention.',
        action: 'schedule_emergency_review',
        timeframe: '24 hours',
        impact: 'high'
      });
    }

    // Factor-specific recommendations
    Object.entries(factors).forEach(([factor, data]) => {
      if (data.level === 'CRITICAL' || data.level === 'HIGH') {
        recommendations.push({
          priority: data.level,
          category: factor,
          title: this.getRecommendationTitle(factor, data.level),
          description: this.getRecommendationDescription(factor, data),
          action: this.getRecommendationAction(factor),
          timeframe: this.getRecommendationTimeframe(factor, data),
          impact: data.impact || 'medium'
        });
      }
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    });
  }

  calculateDocumentRiskScore({ totalDocuments, expiredDocuments, expiringSoonDocuments, missingDocuments, pendingDocuments }) {
    let score = 0;

    if (totalDocuments === 0) {
      score += 50; // No documents is high risk
    } else {
      // Calculate percentages
      const expiredRate = expiredDocuments / totalDocuments;
      const expiringRate = expiringSoonDocuments / totalDocuments;
      const missingRate = missingDocuments / totalDocuments;
      const pendingRate = pendingDocuments / totalDocuments;

      // Weight different risk factors
      score += expiredRate * 40; // Expired documents are highest risk
      score += expiringRate * 25; // Expiring soon are high risk
      score += missingRate * 30; // Missing documents are high risk
      score += pendingRate * 10; // Pending documents are medium risk
    }

    return Math.min(Math.round(score), 100);
  }

  calculateAlertRiskScore({ totalAlerts, criticalAlerts, highAlerts, overdueAlerts, unresolvedAlerts, recentAlerts }) {
    let score = 0;

    if (totalAlerts > 0) {
      const criticalRate = criticalAlerts / totalAlerts;
      const highRate = highAlerts / totalAlerts;
      const overdueRate = overdueAlerts / totalAlerts;
      const unresolvedRate = unresolvedAlerts / totalAlerts;

      score += criticalRate * 35;
      score += highRate * 20;
      score += overdueRate * 25;
      score += unresolvedRate * 15;
      score += Math.min(recentAlerts / 30, 1) * 5; // Recent alerts factor
    }

    return Math.min(Math.round(score), 100);
  }

  calculateFacultyRiskScore({ totalFaculty, nonCompliantFaculty, pendingVerificationFaculty, expiredQualifications, missingDocumentation, complianceRate }) {
    let score = 0;

    if (totalFaculty > 0) {
      const nonCompliantRate = nonCompliantFaculty / totalFaculty;
      const pendingRate = pendingVerificationFaculty / totalFaculty;
      const expiredRate = expiredQualifications / totalFaculty;
      const missingRate = missingDocumentation / totalFaculty;

      score += nonCompliantRate * 40;
      score += pendingRate * 20;
      score += expiredRate * 25;
      score += missingRate * 15;

      // Compliance rate penalty (inverse relationship)
      score += (100 - complianceRate) * 0.1;
    }

    return Math.min(Math.round(score), 100);
  }

  calculateDeadlineRiskScore({ totalDeadlines, overdueDeadlines, upcomingDeadlines, criticalDeadlines, missedDeadlines }) {
    let score = 0;

    if (totalDeadlines > 0) {
      const overdueRate = overdueDeadlines / totalDeadlines;
      const criticalRate = criticalDeadlines / totalDeadlines;
      const missedRate = missedDeadlines / totalDeadlines;

      score += overdueRate * 40;
      score += criticalRate * 30;
      score += missedRate * 20;
      score += Math.min(upcomingDeadlines / 30, 1) * 10; // Upcoming pressure
    }

    return Math.min(Math.round(score), 100);
  }

  calculateHistoricalRiskScore({ historicalAlerts, historicalViolations, historicalPenalties, improvementRate }) {
    let score = 0;

    // Historical violations contribute most to risk
    score += Math.min(historicalViolations * 15, 40);
    
    // Historical penalties are critical
    score += Math.min(historicalPenalties * 25, 50);
    
    // Recent alerts indicate ongoing issues
    score += Math.min(historicalAlerts / 12, 10); // Monthly average
    
    // Poor improvement rate increases risk
    if (improvementRate < 0) {
      score += Math.abs(improvementRate) * 5;
    }

    return Math.min(Math.round(score), 100);
  }

  // Additional helper methods would be implemented here...
  // (getComplianceScore, getTotalDeadlines, etc.)

  isAssessmentValid(timestamp) {
    const now = new Date();
    const assessmentTime = new Date(timestamp);
    const hoursDiff = (now - assessmentTime) / (1000 * 60 * 60);
    return hoursDiff < 4; // Valid for 4 hours
  }

  async getDashboardRisk(institutionId) {
    try {
      const assessment = await this.assessComplianceRisk(institutionId);
      return {
        overallScore: assessment.overallScore,
        riskLevel: assessment.riskLevel,
        predictedPenalty: assessment.predictedPenalty,
        criticalFactors: Object.entries(assessment.factors)
          .filter(([_, factor]) => factor.level === 'CRITICAL' || factor.level === 'HIGH')
          .map(([name, factor]) => ({ name, level: factor.level, score: factor.score })),
        recommendations: assessment.recommendations.slice(0, 3) // Top 3 recommendations
      };
    } catch (error) {
      logger.error('Dashboard risk generation failed:', { error: error.message, institutionId });
      return {
        overallScore: 50,
        riskLevel: 'MEDIUM',
        predictedPenalty: 10,
        criticalFactors: [],
        recommendations: []
      };
    }
  }
}

module.exports = new RiskAssessmentService();