const express = require('express');
const router = express.Router();
const { body, validationResult, param } = require('express-validator');
const AuditChecklist = require('../../models/AuditChecklist');
const Institution = require('../../models/Institution');
const User = require('../../models/User');

// Middleware to check authentication
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Mock authentication for now - replace with actual JWT validation
    const user = await User.findByPk(req.headers['user-id']);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// GET /api/audit-checklists - Get all audit checklists
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, institution_id, checklist_type, status } = req.query;
    
    const offset = (page - 1) * limit;
    const whereClause = { is_active: true };

    if (institution_id) whereClause.institution_id = institution_id;
    if (checklist_type) whereClause.checklist_type = checklist_type;
    if (status) whereClause.status = status;

    const { count, rows } = await AuditChecklist.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Institution,
          as: 'institution',
          attributes: ['id', 'name', 'type']
        },
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      checklists: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching audit checklists:', error);
    res.status(500).json({ error: 'Failed to fetch audit checklists' });
  }
});

// POST /api/audit-checklists - Create new audit checklist
router.post('/', authenticateToken, [
  body('institution_id').isUUID().withMessage('Valid institution ID is required'),
  body('name').notEmpty().withMessage('Checklist name is required'),
  body('checklist_type').isIn(['regulatory', 'standards', 'accreditation']).withMessage('Invalid checklist type'),
  body('description').optional().isString(),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('due_date').optional().isISO8601().withMessage('Invalid due date format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const checklistData = {
      ...req.body,
      created_by: req.user.id
    };

    const checklist = await AuditChecklist.create(checklistData);

    // Fetch the created checklist with associations
    const createdChecklist = await AuditChecklist.findByPk(checklist.id, {
      include: [
        {
          model: Institution,
          as: 'institution',
          attributes: ['id', 'name', 'type']
        },
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ]
    });

    res.status(201).json(createdChecklist);
  } catch (error) {
    console.error('Error creating audit checklist:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create audit checklist' });
  }
});

// GET /api/audit-checklists/:id - Get specific audit checklist
router.get('/:id', authenticateToken, [
  param('id').isUUID().withMessage('Valid checklist ID is required')
], async (req, res) => {
  try {
    const checklist = await AuditChecklist.findOne({
      where: { id: req.params.id, is_active: true },
      include: [
        {
          model: Institution,
          as: 'institution',
          attributes: ['id', 'name', 'type']
        },
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ]
    });

    if (!checklist) {
      return res.status(404).json({ error: 'Audit checklist not found' });
    }

    res.json(checklist);
  } catch (error) {
    console.error('Error fetching audit checklist:', error);
    res.status(500).json({ error: 'Failed to fetch audit checklist' });
  }
});

// PUT /api/audit-checklists/:id - Update audit checklist
router.put('/:id', authenticateToken, [
  param('id').isUUID().withMessage('Valid checklist ID is required'),
  body('name').optional().notEmpty().withMessage('Checklist name cannot be empty'),
  body('checklist_type').optional().isIn(['regulatory', 'standards', 'accreditation']).withMessage('Invalid checklist type'),
  body('status').optional().isIn(['draft', 'active', 'completed', 'archived']).withMessage('Invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const checklist = await AuditChecklist.findOne({
      where: { id: req.params.id, is_active: true }
    });

    if (!checklist) {
      return res.status(404).json({ error: 'Audit checklist not found' });
    }

    // Check if user has permission to update
    if (checklist.created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions to update this checklist' });
    }

    await checklist.update({
      ...req.body,
      updated_by: req.user.id
    });

    // Fetch updated checklist with associations
    const updatedChecklist = await AuditChecklist.findByPk(checklist.id, {
      include: [
        {
          model: Institution,
          as: 'institution',
          attributes: ['id', 'name', 'type']
        },
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ]
    });

    res.json(updatedChecklist);
  } catch (error) {
    console.error('Error updating audit checklist:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update audit checklist' });
  }
});

// DELETE /api/audit-checklists/:id - Soft delete audit checklist
router.delete('/:id', authenticateToken, [
  param('id').isUUID().withMessage('Valid checklist ID is required')
], async (req, res) => {
  try {
    const checklist = await AuditChecklist.findOne({
      where: { id: req.params.id, is_active: true }
    });

    if (!checklist) {
      return res.status(404).json({ error: 'Audit checklist not found' });
    }

    // Check if user has permission to delete
    if (checklist.created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions to delete this checklist' });
    }

    await checklist.update({
      is_active: false,
      updated_by: req.user.id
    });

    res.json({ message: 'Audit checklist deleted successfully' });
  } catch (error) {
    console.error('Error deleting audit checklist:', error);
    res.status(500).json({ error: 'Failed to delete audit checklist' });
  }
});

module.exports = router;