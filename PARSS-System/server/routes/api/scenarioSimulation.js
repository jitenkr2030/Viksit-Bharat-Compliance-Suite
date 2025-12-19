const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const sequelize = require('../../config/database').sequelize;
const ScenarioSimulation = require('../../models/ScenarioSimulation');
const User = require('../../models/User');
const Organization = require('../../models/Organization');

// Get all scenario simulations
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      scenarioType,
      riskLevel,
      userId,
      organizationId,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const whereClause = {};
    
    if (status) whereClause.status = status;
    if (scenarioType) whereClause.scenarioType = scenarioType;
    if (riskLevel) whereClause.riskLevel = riskLevel;
    if (userId) whereClause.userId = userId;
    if (organizationId) whereClause.organizationId = organizationId;

    const simulations = await ScenarioSimulation.findAndCountAll({
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
      data: simulations.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(simulations.count / parseInt(limit)),
        totalItems: simulations.count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching scenario simulations',
      error: error.message
    });
  }
});

// Get scenario simulation by ID
router.get('/:id', async (req, res) => {
  try {
    const simulation = await ScenarioSimulation.findByPk(req.params.id, {
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

    if (!simulation) {
      return res.status(404).json({
        success: false,
        message: 'Scenario simulation not found'
      });
    }

    res.json({
      success: true,
      data: simulation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching scenario simulation',
      error: error.message
    });
  }
});

// Create new scenario simulation
router.post('/', [
  body('userId').isUUID().withMessage('Valid user ID is required'),
  body('organizationId').isUUID().withMessage('Valid organization ID is required'),
  body('simulationTitle').notEmpty().withMessage('Simulation title is required'),
  body('scenarioType').isIn([
    'regulatory_change', 
    'audit_findings', 
    'non_compliance', 
    'risk_event', 
    'system_failure',
    'vendor_issue',
    'policy_violation',
    'training_need',
    'process_optimization',
    'cost_reduction',
    'efficiency_improvement'
  ]).withMessage('Invalid scenario type'),
  body('scenarioDescription').notEmpty().withMessage('Scenario description is required'),
  body('scenarioParameters').isObject().withMessage('Scenario parameters must be an object'),
  body('riskLevel').isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid risk level')
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

    const simulationData = {
      ...req.body,
      simulationDate: req.body.simulationDate || new Date().toISOString().split('T')[0]
    };

    const simulation = await ScenarioSimulation.create(simulationData);

    const simulationWithRelations = await ScenarioSimulation.findByPk(simulation.id, {
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
      message: 'Scenario simulation created successfully',
      data: simulationWithRelations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating scenario simulation',
      error: error.message
    });
  }
});

// Update scenario simulation
router.put('/:id', [
  body('simulationTitle').optional().notEmpty().withMessage('Simulation title cannot be empty'),
  body('scenarioType').optional().isIn([
    'regulatory_change', 
    'audit_findings', 
    'non_compliance', 
    'risk_event', 
    'system_failure',
    'vendor_issue',
    'policy_violation',
    'training_need',
    'process_optimization',
    'cost_reduction',
    'efficiency_improvement'
  ]).withMessage('Invalid scenario type'),
  body('status').optional().isIn(['draft', 'configured', 'running', 'completed', 'reviewed', 'approved']).withMessage('Invalid status'),
  body('riskLevel').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid risk level')
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

    const simulation = await ScenarioSimulation.findByPk(req.params.id);
    if (!simulation) {
      return res.status(404).json({
        success: false,
        message: 'Scenario simulation not found'
      });
    }

    await simulation.update(req.body);

    const updatedSimulation = await ScenarioSimulation.findByPk(simulation.id, {
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
      message: 'Scenario simulation updated successfully',
      data: updatedSimulation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating scenario simulation',
      error: error.message
    });
  }
});

// Delete scenario simulation
router.delete('/:id', async (req, res) => {
  try {
    const simulation = await ScenarioSimulation.findByPk(req.params.id);
    if (!simulation) {
      return res.status(404).json({
        success: false,
        message: 'Scenario simulation not found'
      });
    }

    await simulation.destroy();

    res.json({
      success: true,
      message: 'Scenario simulation deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting scenario simulation',
      error: error.message
    });
  }
});

// Run scenario simulation
router.post('/:id/run', async (req, res) => {
  try {
    const simulation = await ScenarioSimulation.findByPk(req.params.id);
    if (!simulation) {
      return res.status(404).json({
        success: false,
        message: 'Scenario simulation not found'
      });
    }

    if (simulation.status === 'running') {
      return res.status(400).json({
        success: false,
        message: 'Simulation already running'
      });
    }

    if (simulation.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Simulation already completed'
      });
    }

    // Update status to running
    await simulation.update({ status: 'running' });

    // Simulate scenario execution (in real scenario, this would trigger actual simulation logic)
    const mockResults = {
      simulationResults: {
        financialImpact: Math.floor(Math.random() * 1000000),
        operationalImpact: {
          downtime: Math.floor(Math.random() * 24),
          productivity: Math.floor(Math.random() * 100),
          customerSatisfaction: Math.floor(Math.random() * 100)
        },
        complianceImpact: {
          riskLevel: Math.floor(Math.random() * 100),
          regulatory: Math.floor(Math.random() * 100),
          audit: Math.floor(Math.random() * 100)
        }
      },
      performanceMetrics: {
        efficiency: Math.floor(Math.random() * 100),
        quality: Math.floor(Math.random() * 100),
        cost: Math.floor(Math.random() * 100)
      },
      mitigationStrategies: [
        {
          strategy: 'Implement backup procedures',
          effectiveness: Math.floor(Math.random() * 100),
          cost: Math.floor(Math.random() * 100000)
        },
        {
          strategy: 'Staff training program',
          effectiveness: Math.floor(Math.random() * 100),
          cost: Math.floor(Math.random() * 50000)
        }
      ]
    };

    await simulation.update({
      status: 'completed',
      financialImpact: mockResults.simulationResults.financialImpact,
      operationalImpact: mockResults.simulationResults.operationalImpact,
      complianceImpact: mockResults.simulationResults.complianceImpact,
      performanceMetrics: mockResults.performanceMetrics,
      mitigationStrategies: mockResults.mitigationStrategies,
      recommendations: 'Based on the simulation results, implement recommended mitigation strategies to minimize risks.'
    });

    const completedSimulation = await ScenarioSimulation.findByPk(simulation.id, {
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
      message: 'Scenario simulation completed successfully',
      data: completedSimulation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error running scenario simulation',
      error: error.message
    });
  }
});

// Get simulation statistics
router.get('/statistics/overview', async (req, res) => {
  try {
    const { organizationId, userId } = req.query;
    
    const whereClause = {};
    if (organizationId) whereClause.organizationId = organizationId;
    if (userId) whereClause.userId = userId;

    const [
      totalSimulations,
      draftSimulations,
      configuredSimulations,
      runningSimulations,
      completedSimulations,
      reviewedSimulations,
      approvedSimulations,
      criticalSimulations,
      averageFinancialImpact,
      totalPotentialSavings
    ] = await Promise.all([
      ScenarioSimulation.count({ where: whereClause }),
      ScenarioSimulation.count({ where: { ...whereClause, status: 'draft' } }),
      ScenarioSimulation.count({ where: { ...whereClause, status: 'configured' } }),
      ScenarioSimulation.count({ where: { ...whereClause, status: 'running' } }),
      ScenarioSimulation.count({ where: { ...whereClause, status: 'completed' } }),
      ScenarioSimulation.count({ where: { ...whereClause, status: 'reviewed' } }),
      ScenarioSimulation.count({ where: { ...whereClause, status: 'approved' } }),
      ScenarioSimulation.count({ where: { ...whereClause, riskLevel: 'critical' } }),
      ScenarioSimulation.findAll({
        where: { ...whereClause, status: 'completed' },
        attributes: [[sequelize.fn('AVG', sequelize.col('financialImpact')), 'averageFinancialImpact']]
      }),
      ScenarioSimulation.sum('financialImpact', { 
        where: { 
          ...whereClause, 
          status: 'completed',
          financialImpact: { [Op.gt]: 0 }
        } 
      })
    ]);

    res.json({
      success: true,
      data: {
        totalSimulations,
        draftSimulations,
        configuredSimulations,
        runningSimulations,
        completedSimulations,
        reviewedSimulations,
        approvedSimulations,
        criticalSimulations,
        averageFinancialImpact: averageFinancialImpact[0]?.averageFinancialImpact || 0,
        totalPotentialSavings: totalPotentialSavings || 0,
        completionRate: totalSimulations > 0 ? ((completedSimulations / totalSimulations) * 100).toFixed(2) : 0,
        criticalRate: totalSimulations > 0 ? ((criticalSimulations / totalSimulations) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching simulation statistics',
      error: error.message
    });
  }
});

// Get simulations by type
router.get('/type/:scenarioType', async (req, res) => {
  try {
    const { scenarioType } = req.params;
    const {
      page = 1,
      limit = 10,
      organizationId,
      userId,
      status,
      riskLevel,
      sortBy = 'simulationDate',
      sortOrder = 'DESC'
    } = req.query;

    const whereClause = { scenarioType };
    if (organizationId) whereClause.organizationId = organizationId;
    if (userId) whereClause.userId = userId;
    if (status) whereClause.status = status;
    if (riskLevel) whereClause.riskLevel = riskLevel;

    const simulations = await ScenarioSimulation.findAndCountAll({
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
      data: simulations.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(simulations.count / parseInt(limit)),
        totalItems: simulations.count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching simulations by type',
      error: error.message
    });
  }
});

// Get high-risk simulations
router.get('/high-risk', async (req, res) => {
  try {
    const { organizationId, userId } = req.query;
    
    const whereClause = {
      riskLevel: { [Op.in]: ['high', 'critical'] },
      status: { [Op.not]: 'completed' }
    };
    
    if (organizationId) whereClause.organizationId = organizationId;
    if (userId) whereClause.userId = userId;

    const highRiskSimulations = await ScenarioSimulation.findAll({
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
      order: [['riskLevel', 'DESC'], ['simulationDate', 'ASC']]
    });

    res.json({
      success: true,
      data: highRiskSimulations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching high-risk simulations',
      error: error.message
    });
  }
});

// Get simulation analysis
router.get('/:id/analysis', async (req, res) => {
  try {
    const simulation = await ScenarioSimulation.findByPk(req.params.id);
    if (!simulation) {
      return res.status(404).json({
        success: false,
        message: 'Scenario simulation not found'
      });
    }

    if (simulation.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Analysis only available for completed simulations'
      });
    }

    const analysis = {
      simulationId: simulation.id,
      simulationTitle: simulation.simulationTitle,
      scenarioType: simulation.scenarioType,
      riskLevel: simulation.riskLevel,
      financialImpact: simulation.financialImpact,
      operationalImpact: simulation.operationalImpact,
      complianceImpact: simulation.complianceImpact,
      performanceMetrics: simulation.performanceMetrics,
      mitigationStrategies: simulation.mitigationStrategies,
      contingencyPlans: simulation.contingencyPlans,
      impactAssessment: simulation.impactAssessment,
      riskAssessment: simulation.riskAssessment,
      recommendations: simulation.recommendations,
      actionPlan: simulation.actionPlan,
      implementationStatus: simulation.implementationStatus,
      implementationProgress: simulation.implementationProgress,
      lessonsLearned: simulation.lessonsLearned,
      bestPractices: simulation.bestPractices
    };

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating simulation analysis',
      error: error.message
    });
  }
});

// Update implementation status
router.patch('/:id/implementation-status', [
  body('implementationStatus').isIn(['not_started', 'planning', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid implementation status'),
  body('implementationProgress').optional().isInt({ min: 0, max: 100 }).withMessage('Implementation progress must be between 0 and 100')
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

    const simulation = await ScenarioSimulation.findByPk(req.params.id);
    if (!simulation) {
      return res.status(404).json({
        success: false,
        message: 'Scenario simulation not found'
      });
    }

    await simulation.update(req.body);

    const updatedSimulation = await ScenarioSimulation.findByPk(simulation.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Implementation status updated successfully',
      data: updatedSimulation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating implementation status',
      error: error.message
    });
  }
});

// Get what-if analysis scenarios
router.get('/:id/what-if-scenarios', async (req, res) => {
  try {
    const simulation = await ScenarioSimulation.findByPk(req.params.id);
    if (!simulation) {
      return res.status(404).json({
        success: false,
        message: 'Scenario simulation not found'
      });
    }

    if (simulation.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'What-if analysis only available for completed simulations'
      });
    }

    // Generate alternative scenarios based on the original simulation
    const whatIfScenarios = simulation.alternativeScenarios || [
      {
        name: 'Best Case Scenario',
        description: 'Optimistic outcome with full mitigation measures',
        probability: 25,
        impact: Math.floor(simulation.financialImpact * 0.3),
        mitigationEffectiveness: 90
      },
      {
        name: 'Worst Case Scenario',
        description: 'Pessimistic outcome with minimal mitigation',
        probability: 15,
        impact: Math.floor(simulation.financialImpact * 1.5),
        mitigationEffectiveness: 20
      },
      {
        name: 'Most Likely Scenario',
        description: 'Realistic outcome with standard mitigation',
        probability: 60,
        impact: simulation.financialImpact,
        mitigationEffectiveness: 60
      }
    ];

    res.json({
      success: true,
      data: whatIfScenarios
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching what-if scenarios',
      error: error.message
    });
  }
});

// Bulk update simulation status
router.patch('/bulk-update-status', [
  body('simulationIds').isArray({ min: 1 }).withMessage('Simulation IDs array is required'),
  body('status').isIn(['draft', 'configured', 'running', 'completed', 'reviewed', 'approved']).withMessage('Invalid status')
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

    const { simulationIds, status, userId } = req.body;

    const updatedSimulations = await ScenarioSimulation.update(
      { status },
      {
        where: {
          id: { [Op.in]: simulationIds },
          ...(userId && { userId })
        },
        returning: true
      }
    );

    res.json({
      success: true,
      message: `${updatedSimulations[0]} scenario simulations updated successfully`,
      data: updatedSimulations[1]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating simulations',
      error: error.message
    });
  }
});

module.exports = router;