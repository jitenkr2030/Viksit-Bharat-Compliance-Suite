const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const sequelize = require('../../config/database').sequelize;
const PeerComparison = require('../../models/PeerComparison');
const User = require('../../models/User');
const Organization = require('../../models/Organization');

// Get all peer comparisons
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      comparisonType,
      userId,
      organizationId,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const whereClause = {};
    
    if (status) whereClause.status = status;
    if (comparisonType) whereClause.comparisonType = comparisonType;
    if (userId) whereClause.userId = userId;
    if (organizationId) whereClause.organizationId = organizationId;

    const comparisons = await PeerComparison.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Organization,
          as: 'organization',
          attributes: ['id', 'name', 'registrationNumber']
        }
      ],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [[sortBy, sortOrder.toUpperCase()]]
    });

    res.json({
      success: true,
      data: comparisons.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(comparisons.count / parseInt(limit)),
        totalItems: comparisons.count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching peer comparisons',
      error: error.message
    });
  }
});

// Get peer comparison by ID
router.get('/:id', async (req, res) => {
  try {
    const comparison = await PeerComparison.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Organization,
          as: 'organization',
          attributes: ['id', 'name', 'registrationNumber']
        }
      ]
    });

    if (!comparison) {
      return res.status(404).json({
        success: false,
        message: 'Peer comparison not found'
      });
    }

    res.json({
      success: true,
      data: comparison
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching peer comparison',
      error: error.message
    });
  }
});

// Create new peer comparison
router.post('/', [
  body('userId').isUUID().withMessage('Valid user ID is required'),
  body('organizationId').isUUID().withMessage('Valid organization ID is required'),
  body('comparisonTitle').notEmpty().withMessage('Comparison title is required'),
  body('comparisonType').isIn(['industry', 'sector', 'size', 'region', 'custom']).withMessage('Invalid comparison type'),
  body('targetOrganizationId').isUUID().withMessage('Valid target organization ID is required'),
  body('peerOrganizationIds').isArray({ min: 1 }).withMessage('Peer organization IDs array is required'),
  body('peerCriteria').isObject().withMessage('Peer criteria must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const comparisonData = {
      ...req.body,
      comparisonDate: req.body.comparisonDate || new Date().toISOString().split('T')[0]
    };

    const comparison = await PeerComparison.create(comparisonData);

    const comparisonWithRelations = await PeerComparison.findByPk(comparison.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Organization,
          as: 'organization',
          attributes: ['id', 'name', 'registrationNumber']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Peer comparison created successfully',
      data: comparisonWithRelations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating peer comparison',
      error: error.message
    });
  }
});

// Update peer comparison
router.put('/:id', [
  body('comparisonTitle').optional().notEmpty().withMessage('Comparison title cannot be empty'),
  body('comparisonType').optional().isIn(['industry', 'sector', 'size', 'region', 'custom']).withMessage('Invalid comparison type'),
  body('status').optional().isIn(['draft', 'in_progress', 'completed', 'reviewed']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const comparison = await PeerComparison.findByPk(req.params.id);
    if (!comparison) {
      return res.status(404).json({
        success: false,
        message: 'Peer comparison not found'
      });
    }

    await comparison.update(req.body);

    const updatedComparison = await PeerComparison.findByPk(comparison.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Organization,
          as: 'organization',
          attributes: ['id', 'name', 'registrationNumber']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Peer comparison updated successfully',
      data: updatedComparison
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating peer comparison',
      error: error.message
    });
  }
});

// Delete peer comparison
router.delete('/:id', async (req, res) => {
  try {
    const comparison = await PeerComparison.findByPk(req.params.id);
    if (!comparison) {
      return res.status(404).json({
        success: false,
        message: 'Peer comparison not found'
      });
    }

    await comparison.destroy();

    res.json({
      success: true,
      message: 'Peer comparison deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting peer comparison',
      error: error.message
    });
  }
});

// Execute peer comparison
router.post('/:id/execute', async (req, res) => {
  try {
    const comparison = await PeerComparison.findByPk(req.params.id);
    if (!comparison) {
      return res.status(404).json({
        success: false,
        message: 'Peer comparison not found'
      });
    }

    if (comparison.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Comparison already executed'
      });
    }

    // Update status to in progress
    await comparison.update({ status: 'in_progress' });

    // Simulate comparison execution (in real scenario, this would trigger actual comparison logic)
    const mockResults = {
      benchmarkingResults: {
        complianceScore: Math.floor(Math.random() * 100),
        performanceMetrics: {
          efficiency: Math.floor(Math.random() * 100),
          quality: Math.floor(Math.random() * 100),
          cost: Math.floor(Math.random() * 100)
        }
      },
      overallRanking: Math.floor(Math.random() * 10) + 1,
      percentileRankings: {
        compliance: Math.floor(Math.random() * 100),
        efficiency: Math.floor(Math.random() * 100),
        cost: Math.floor(Math.random() * 100)
      }
    };

    await comparison.update({
      status: 'completed',
      benchmarkingResults: mockResults.benchmarkingResults,
      overallRanking: mockResults.overallRanking,
      percentileRankings: mockResults.percentileRankings,
      potentialSavings: Math.floor(Math.random() * 1000000),
      roiProjection: (Math.random() * 50).toFixed(2)
    });

    const completedComparison = await PeerComparison.findByPk(comparison.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Organization,
          as: 'organization',
          attributes: ['id', 'name', 'registrationNumber']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Peer comparison executed successfully',
      data: completedComparison
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error executing peer comparison',
      error: error.message
    });
  }
});

// Get comparison statistics
router.get('/statistics/overview', async (req, res) => {
  try {
    const { organizationId, userId } = req.query;
    
    const whereClause = {};
    if (organizationId) whereClause.organizationId = organizationId;
    if (userId) whereClause.userId = userId;

    const [
      totalComparisons,
      draftComparisons,
      inProgressComparisons,
      completedComparisons,
      reviewedComparisons,
      averageRanking,
      totalPotentialSavings
    ] = await Promise.all([
      PeerComparison.count({ where: whereClause }),
      PeerComparison.count({ where: { ...whereClause, status: 'draft' } }),
      PeerComparison.count({ where: { ...whereClause, status: 'in_progress' } }),
      PeerComparison.count({ where: { ...whereClause, status: 'completed' } }),
      PeerComparison.count({ where: { ...whereClause, status: 'reviewed' } }),
      PeerComparison.findAll({
        where: { ...whereClause, status: 'completed' },
        attributes: [[sequelize.fn('AVG', sequelize.col('overallRanking')), 'averageRanking']]
      }),
      PeerComparison.sum('potentialSavings', { where: { ...whereClause, status: 'completed' } })
    ]);

    res.json({
      success: true,
      data: {
        totalComparisons,
        draftComparisons,
        inProgressComparisons,
        completedComparisons,
        reviewedComparisons,
        averageRanking: averageRanking[0]?.averageRanking || 0,
        totalPotentialSavings: totalPotentialSavings || 0,
        completionRate: totalComparisons > 0 ? ((completedComparisons / totalComparisons) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching comparison statistics',
      error: error.message
    });
  }
});

// Get comparisons by type
router.get('/type/:comparisonType', async (req, res) => {
  try {
    const { comparisonType } = req.params;
    const {
      page = 1,
      limit = 10,
      organizationId,
      userId,
      status,
      sortBy = 'comparisonDate',
      sortOrder = 'DESC'
    } = req.query;

    const whereClause = { comparisonType };
    if (organizationId) whereClause.organizationId = organizationId;
    if (userId) whereClause.userId = userId;
    if (status) whereClause.status = status;

    const comparisons = await PeerComparison.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Organization,
          as: 'organization',
          attributes: ['id', 'name', 'registrationNumber']
        }
      ],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [[sortBy, sortOrder.toUpperCase()]]
    });

    res.json({
      success: true,
      data: comparisons.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(comparisons.count / parseInt(limit)),
        totalItems: comparisons.count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching comparisons by type',
      error: error.message
    });
  }
});

// Get top performers (best rankings)
router.get('/rankings/top-performers', async (req, res) => {
  try {
    const { organizationId, comparisonType, limit = 10 } = req.query;
    
    const whereClause = {
      status: 'completed'
    };
    
    if (organizationId) whereClause.organizationId = organizationId;
    if (comparisonType) whereClause.comparisonType = comparisonType;

    const topPerformers = await PeerComparison.findAll({
      where: whereClause,
      include: [
        {
          model: Organization,
          as: 'organization',
          attributes: ['id', 'name', 'registrationNumber']
        }
      ],
      order: [['overallRanking', 'ASC']],
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: topPerformers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching top performers',
      error: error.message
    });
  }
});

// Get benchmark analysis
router.get('/:id/benchmark-analysis', async (req, res) => {
  try {
    const comparison = await PeerComparison.findByPk(req.params.id);
    if (!comparison) {
      return res.status(404).json({
        success: false,
        message: 'Peer comparison not found'
      });
    }

    if (comparison.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Benchmark analysis only available for completed comparisons'
      });
    }

    const analysis = {
      comparisonId: comparison.id,
      comparisonTitle: comparison.comparisonTitle,
      comparisonType: comparison.comparisonType,
      overallRanking: comparison.overallRanking,
      rankings: {
        compliance: comparison.complianceRanking,
        efficiency: comparison.efficiencyRanking,
        cost: comparison.costRanking
      },
      percentileRankings: comparison.percentileRankings,
      benchmarkingResults: comparison.benchmarkingResults,
      potentialSavings: comparison.potentialSavings,
      roiProjection: comparison.roiProjection,
      bestPractices: comparison.bestPractices,
      improvementOpportunities: comparison.improvementOpportunities,
      competitiveAdvantages: comparison.competitiveAdvantages,
      competitiveGaps: comparison.competitiveGaps,
      recommendations: comparison.recommendations
    };

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating benchmark analysis',
      error: error.message
    });
  }
});

// Get industry benchmarks
router.get('/benchmarks/industry', async (req, res) => {
  try {
    const { organizationId, industry, comparisonType } = req.query;
    
    const whereClause = {
      status: 'completed',
      comparisonType: comparisonType || 'industry'
    };

    const benchmarks = await PeerComparison.findAll({
      where: whereClause,
      attributes: [
        [sequelize.fn('AVG', sequelize.col('overallRanking')), 'avgRanking'],
        [sequelize.fn('AVG', sequelize.col('complianceRanking')), 'avgComplianceRanking'],
        [sequelize.fn('AVG', sequelize.col('efficiencyRanking')), 'avgEfficiencyRanking'],
        [sequelize.fn('AVG', sequelize.col('costRanking')), 'avgCostRanking'],
        [sequelize.fn('AVG', sequelize.col('potentialSavings')), 'avgPotentialSavings'],
        [sequelize.fn('AVG', sequelize.col('roiProjection')), 'avgROIProjection']
      ],
      include: [
        {
          model: Organization,
          as: 'organization',
          attributes: ['id', 'name', 'industry'],
          where: industry ? { industry: { [Op.iLike]: `%${industry}%` } } : undefined
        }
      ]
    });

    res.json({
      success: true,
      data: benchmarks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching industry benchmarks',
      error: error.message
    });
  }
});

// Bulk update comparison status
router.patch('/bulk-update-status', [
  body('comparisonIds').isArray({ min: 1 }).withMessage('Comparison IDs array is required'),
  body('status').isIn(['draft', 'in_progress', 'completed', 'reviewed']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { comparisonIds, status, userId } = req.body;

    const updatedComparisons = await PeerComparison.update(
      { status },
      {
        where: {
          id: { [Op.in]: comparisonIds },
          ...(userId && { userId })
        },
        returning: true
      }
    );

    res.json({
      success: true,
      message: `${updatedComparisons[0]} peer comparisons updated successfully`,
      data: updatedComparisons[1]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating comparisons',
      error: error.message
    });
  }
});

module.exports = router;