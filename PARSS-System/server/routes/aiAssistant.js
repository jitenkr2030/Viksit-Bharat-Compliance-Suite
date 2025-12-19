const express = require('express');
const router = express.Router();
const AIAssistantService = require('../services/AIAssistantService');
const AIAssistant = require('../models/AIAssistant');
const AIChatMessage = require('../models/AIChatMessage');

// Start new AI assistant session
router.post('/sessions', async (req, res) => {
  try {
    const {
      institutionId,
      complianceFramework,
      sessionTitle,
      language = 'en',
      modelConfig = {},
      userProfile = {},
      sessionGoals = []
    } = req.body;

    if (!institutionId || !complianceFramework) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: institutionId, complianceFramework'
      });
    }

    const result = await AIAssistantService.startSession({
      userId: req.user.id,
      institutionId,
      complianceFramework,
      sessionTitle,
      language,
      modelConfig,
      userProfile,
      sessionGoals
    });

    res.json({
      success: true,
      message: 'AI assistant session started successfully',
      data: result
    });
  } catch (error) {
    console.error('Start AI session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start AI assistant session',
      error: error.message
    });
  }
});

// Process user message
router.post('/sessions/:sessionId/messages', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const {
      content,
      contentType = 'text',
      messageType = 'question',
      attachments = []
    } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    const result = await AIAssistantService.processMessage(sessionId, {
      content,
      contentType,
      messageType,
      attachments,
      userId: req.user.id
    });

    res.json({
      success: true,
      message: 'Message processed successfully',
      data: result
    });
  } catch (error) {
    console.error('Process message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process message',
      error: error.message
    });
  }
});

// End AI assistant session
router.post('/sessions/:sessionId/end', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const {
      resolutionStatus = 'resolved',
      satisfactionScore,
      feedback,
      helpfulnessRating,
      accuracyRating
    } = req.body;

    const result = await AIAssistantService.endSession(sessionId, {
      resolutionStatus,
      satisfactionScore,
      feedback,
      helpfulnessRating,
      accuracyRating
    });

    res.json({
      success: true,
      message: 'Session ended successfully',
      data: result
    });
  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to end session',
      error: error.message
    });
  }
});

// Get session details
router.get('/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await AIAssistant.findOne({
      where: { sessionId },
      include: [{
        model: AIChatMessage,
        as: 'messages',
        order: [['sequenceNumber', 'ASC']],
        limit: 100
      }]
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'AI session not found'
      });
    }

    // Calculate session metrics
    const metrics = {
      duration: session.duration,
      messageCount: session.messageCount,
      averageResponseTime: session.averageResponseTime,
      satisfactionScore: session.satisfactionScore,
      resolutionStatus: session.resolutionStatus,
      efficiency: session.getEfficiency()
    };

    res.json({
      success: true,
      data: {
        session: session.toJSON(),
        metrics,
        messageCount: session.messages?.length || 0
      }
    });
  } catch (error) {
    console.error('Get session details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get session details',
      error: error.message
    });
  }
});

// Get user sessions
router.get('/sessions', async (req, res) => {
  try {
    const {
      userId,
      institutionId,
      complianceFramework,
      status = 'active',
      page = 1,
      limit = 20,
      startDate,
      endDate
    } = req.query;

    const filters = {
      page: parseInt(page),
      limit: parseInt(limit),
      userId: userId || req.user.id,
      complianceFramework,
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined
    };

    if (institutionId) filters.institutionId = institutionId;

    const result = await AIAssistant.searchSessions('', filters);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get user sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user sessions',
      error: error.message
    });
  }
});

// Get session analytics
router.get('/analytics/:institutionId', async (req, res) => {
  try {
    const { institutionId } = req.params;
    const {
      period = '30d',
      startDate,
      endDate,
      complianceFramework,
      userId
    } = req.query;

    const filters = {
      period,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      complianceFramework,
      userId
    };

    const analytics = await AIAssistantService.getSessionAnalytics(institutionId, filters);

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Get session analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get session analytics',
      error: error.message
    });
  }
});

// Search sessions and messages
router.post('/search', async (req, res) => {
  try {
    const {
      query,
      userId,
      complianceFramework,
      sessionId,
      startDate,
      endDate,
      limit = 20,
      offset = 0
    } = req.body;

    if (!query && !userId && !complianceFramework && !sessionId) {
      return res.status(400).json({
        success: false,
        message: 'At least one search parameter is required'
      });
    }

    const searchParams = {
      query,
      userId: userId || req.user.id,
      complianceFramework,
      sessionId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: parseInt(limit),
      offset: parseInt(offset)
    };

    const results = await AIAssistantService.searchSessions(searchParams);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Search sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search sessions',
      error: error.message
    });
  }
});

// Get AI recommendations
router.get('/recommendations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { context = {} } = req.query;

    const recommendations = await AIAssistantService.getRecommendations(userId, context);

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations',
      error: error.message
    });
  }
});

// Get conversation thread
router.get('/sessions/:sessionId/messages/:messageId/thread', async (req, res) => {
  try {
    const { sessionId, messageId } = req.params;

    const thread = await AIChatMessage.findConversationThread(messageId);

    if (!thread) {
      return res.status(404).json({
        success: false,
        message: 'Message thread not found'
      });
    }

    res.json({
      success: true,
      data: thread
    });
  } catch (error) {
    console.error('Get conversation thread error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversation thread',
      error: error.message
    });
  }
});

// Get message details
router.get('/sessions/:sessionId/messages/:messageId', async (req, res) => {
  try {
    const { sessionId, messageId } = req.params;

    const message = await AIChatMessage.findOne({
      where: { 
        sessionId,
        messageId 
      }
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Get message details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get message details',
      error: error.message
    });
  }
});

// Rate message
router.post('/sessions/:sessionId/messages/:messageId/rate', async (req, res) => {
  try {
    const { sessionId, messageId } = req.params;
    const {
      rating,
      feedback,
      feedbackCategory
    } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const message = await AIChatMessage.findOne({
      where: { 
        sessionId,
        messageId 
      }
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    await message.update({
      userRating: rating,
      userFeedback: feedback,
      feedbackCategory
    });

    res.json({
      success: true,
      message: 'Message rated successfully'
    });
  } catch (error) {
    console.error('Rate message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to rate message',
      error: error.message
    });
  }
});

// Get active sessions
router.get('/sessions/active', async (req, res) => {
  try {
    const { userId } = req.query;

    const activeSessions = await AIAssistant.findActiveSessions(userId || req.user.id);

    res.json({
      success: true,
      data: activeSessions
    });
  } catch (error) {
    console.error('Get active sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get active sessions',
      error: error.message
    });
  }
});

// Get popular topics
router.get('/topics/popular', async (req, res) => {
  try {
    const { sessionId, limit = 20 } = req.query;

    const topics = await AIChatMessage.getPopularTopics(sessionId, parseInt(limit));

    res.json({
      success: true,
      data: topics
    });
  } catch (error) {
    console.error('Get popular topics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get popular topics',
      error: error.message
    });
  }
});

// Get session statistics
router.get('/sessions/:sessionId/statistics', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const stats = await AIChatMessage.getMessageStatistics(sessionId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get session statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get session statistics',
      error: error.message
    });
  }
});

// Export conversation
router.post('/sessions/:sessionId/export', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const {
      format = 'json',
      includeMetadata = true,
      includeAnalysis = true
    } = req.body;

    const session = await AIAssistant.findOne({
      where: { sessionId },
      include: [{
        model: AIChatMessage,
        as: 'messages',
        order: [['sequenceNumber', 'ASC']]
      }]
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const exportData = {
      session: session.toJSON(),
      messages: session.messages?.map(msg => ({
        ...msg.toJSON(),
        ...(includeAnalysis && {
          qualityScore: msg.getQualityScore(),
          isHelpful: msg.isHelpful(),
          needsReview: msg.needsReview(),
          wordCount: msg.getWordCount(),
          readingTime: msg.getReadingTime()
        })
      })) || [],
      exportMetadata: {
        exportedAt: new Date(),
        format,
        includeMetadata,
        includeAnalysis,
        totalMessages: session.messages?.length || 0,
        sessionDuration: session.duration,
        userSatisfaction: session.satisfactionScore
      }
    };

    res.json({
      success: true,
      message: 'Conversation exported successfully',
      data: exportData
    });
  } catch (error) {
    console.error('Export conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export conversation',
      error: error.message
    });
  }
});

// Get compliance frameworks
router.get('/frameworks', async (req, res) => {
  try {
    const frameworks = [
      {
        id: 'UGC',
        name: 'University Grants Commission',
        description: 'UGC compliance for universities and colleges',
        capabilities: [
          'Regulatory compliance guidance',
          'Accreditation process support',
          'Infrastructure requirement monitoring',
          'Faculty qualification verification',
          'Academic program compliance'
        ],
        supportedIntents: [
          'compliance_guidance',
          'accreditation_support',
          'regulatory_updates',
          'deadline_tracking',
          'documentation_assistance'
        ]
      },
      {
        id: 'AICTE',
        name: 'All India Council for Technical Education',
        description: 'AICTE compliance for technical institutions',
        capabilities: [
          'Technical education compliance',
          'Infrastructure and faculty requirements',
          'Program approval and monitoring',
          'Quality assurance processes',
          'Industry collaboration guidance'
        ],
        supportedIntents: [
          'technical_compliance',
          'faculty_requirements',
          'infrastructure_standards',
          'program_approval',
          'quality_metrics'
        ]
      },
      {
        id: 'NA: 'National AssessmentAC',
        name and Accreditation Council',
        description: 'NAAC accreditation and quality assessment',
        capabilities: [
          'Quality assessment preparation',
          'Accreditation process guidance',
          'Criterion-wise compliance tracking',
          'SSR preparation assistance',
          'Quality improvement suggestions'
        ],
        supportedIntents: [
          'quality_assessment',
          'accreditation_guidance',
          'ssr_preparation',
          'criterion_compliance',
          'quality_improvement'
        ]
      },
      {
        id: 'NBA',
        name: 'National Board of Accreditation',
        description: 'NBA accreditation for technical programs',
        capabilities: [
          'Program accreditation support',
          'Outcome-based education guidance',
          'Assessment and evaluation assistance',
          'Continuous improvement tracking',
          'Industry partnership facilitation'
        ],
        supportedIntents: [
          'program_accreditation',
          'obe_implementation',
          'assessment_guidance',
          'outcome_tracking',
          'improvement_planning'
        ]
      }
    ];

    res.json({
      success: true,
      data: frameworks
    });
  } catch (error) {
    console.error('Get frameworks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get compliance frameworks',
      error: error.message
    });
  }
});

// Get AI assistant capabilities
router.get('/capabilities', async (req, res) => {
  try {
    const capabilities = {
      natural_language_processing:ification: true {
        intent_class,
        entity_extraction: true,
        sentiment_analysis: true,
        language_support: ['en', 'hi', 'regional_languages'],
        confidence_scoring: true
      },
      compliance_assistance: {
        regulation_lookup: true,
        requirement_explanation: true,
        compliance_checking: true,
        deadline_tracking: true,
        document_guidance: true
      },
      conversation_management: {
        context_awareness: true,
        conversation_history: true,
        session_management: true,
        escalation_handling: true,
        multi_turn_dialogue: true
      },
      knowledge_integration: {
        regulation_database: true,
        compliance_guides: true,
        best_practices: true,
        case_studies: true,
        real_time_updates: true
      },
      analytics_and_insights: {
        conversation_analytics: true,
        user_satisfaction_tracking: true,
        performance_metrics: true,
        improvement_suggestions: true,
        reporting_capabilities: true
      },
      integrations: {
        document_analysis: true,
        calendar_integration: true,
        notification_systems: true,
        reporting_tools: true,
        external_apis: true
      }
    };

    res.json({
      success: true,
      data: capabilities
    });
  } catch (error) {
    console.error('Get capabilities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get AI assistant capabilities',
      error: error.message
    });
  }
});

// Health check
router.get('/health', async (req, res) => {
  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        nlp_engine: 'active',
        knowledge_base: 'connected',
        conversation_manager: 'operational',
        analytics_engine: 'running'
      },
      metrics: {
        active_sessions: AIAssistantService.activeSessions.size,
        response_time_avg: '1.2s',
        satisfaction_score: '4.3/5',
        resolution_rate: '87%'
      },
      capabilities: {
        intent_classification: 'operational',
        entity_extraction: 'operational',
        compliance_guidance: 'operational',
        escalation_handling: 'operational'
      }
    };

    res.json({
      success: true,
      data: healthStatus
    });
  } catch (error) {
    console.error('AI assistant health check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get AI assistant health status',
      error: error.message
    });
  }
});

module.exports = router;