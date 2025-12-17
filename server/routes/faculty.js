const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const { authenticateToken, restrictTo } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const logger = require('../middleware/logger');

// Get all faculty members
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { institutionId, department, search, complianceStatus, page = 1, limit = 20 } = req.query;
    
    // Mock faculty data
    const mockFaculty = [
      {
        id: '1',
        name: 'Dr. Rajesh Kumar',
        email: 'rajesh.kumar@example.edu',
        phone: '+91-9876543210',
        position: 'Professor',
        department: 'Computer Science',
        institutionId: '1',
        institutionName: 'Example University',
        qualifications: 'Ph.D. in Computer Science, M.Tech in Software Engineering',
        experienceYears: 15,
        specialization: 'Machine Learning, AI',
        dateOfJoining: new Date('2010-08-01'),
        currentSalary: 85000,
        complianceScore: 92,
        complianceStatus: 'compliant',
        documents: {
          phdCertificate: true,
          experienceCertificate: true,
          qualifications: true,
          backgroundCheck: true
        },
        lastComplianceCheck: new Date('2024-11-15'),
        nextComplianceDue: new Date('2025-05-15'),
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Prof. Priya Sharma',
        email: 'priya.sharma@example.edu',
        phone: '+91-9876543211',
        position: 'Associate Professor',
        department: 'Mathematics',
        institutionId: '1',
        institutionName: 'Example University',
        qualifications: 'M.Sc. Mathematics, B.Ed.',
        experienceYears: 8,
        specialization: 'Applied Mathematics, Statistics',
        dateOfJoining: new Date('2016-07-15'),
        currentSalary: 65000,
        complianceScore: 78,
        complianceStatus: 'needs_improvement',
        documents: {
          phdCertificate: false,
          experienceCertificate: true,
          qualifications: true,
          backgroundCheck: true
        },
        lastComplianceCheck: new Date('2024-10-20'),
        nextComplianceDue: new Date('2025-01-20'),
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        name: 'Dr. Amit Singh',
        email: 'amit.singh@example.edu',
        phone: '+91-9876543212',
        position: 'Assistant Professor',
        department: 'Physics',
        institutionId: '2',
        institutionName: 'Example College',
        qualifications: 'Ph.D. in Physics, M.Sc. Physics',
        experienceYears: 5,
        specialization: 'Quantum Physics, Condensed Matter',
        dateOfJoining: new Date('2019-08-01'),
        currentSalary: 55000,
        complianceScore: 85,
        complianceStatus: 'compliant',
        documents: {
          phdCertificate: true,
          experienceCertificate: true,
          qualifications: true,
          backgroundCheck: true
        },
        lastComplianceCheck: new Date('2024-12-01'),
        nextComplianceDue: new Date('2025-06-01'),
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    let filteredFaculty = mockFaculty;
    
    if (institutionId) {
      filteredFaculty = filteredFaculty.filter(faculty => faculty.institutionId === institutionId);
    }
    if (department) {
      filteredFaculty = filteredFaculty.filter(faculty => 
        faculty.department.toLowerCase().includes(department.toLowerCase())
      );
    }
    if (search) {
      filteredFaculty = filteredFaculty.filter(faculty =>
        faculty.name.toLowerCase().includes(search.toLowerCase()) ||
        faculty.email.toLowerCase().includes(search.toLowerCase()) ||
        faculty.department.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (complianceStatus) {
      filteredFaculty = filteredFaculty.filter(faculty => faculty.complianceStatus === complianceStatus);
    }

    // Filter by user's institution access
    if (req.user.role !== 'admin' && req.user.institutions?.length > 0) {
      filteredFaculty = filteredFaculty.filter(faculty => 
        req.user.institutions.includes(faculty.institutionId)
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedFaculty = filteredFaculty.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        faculty: paginatedFaculty,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredFaculty.length,
          pages: Math.ceil(filteredFaculty.length / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching faculty:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch faculty'
    });
  }
});

// Get faculty member by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Mock faculty data - in real implementation, this would query the database
    const mockFaculty = {
      id: '1',
      name: 'Dr. Rajesh Kumar',
      email: 'rajesh.kumar@example.edu',
      phone: '+91-9876543210',
      position: 'Professor',
      department: 'Computer Science',
      institutionId: '1',
      institutionName: 'Example University',
      qualifications: 'Ph.D. in Computer Science, M.Tech in Software Engineering',
      experienceYears: 15,
      specialization: 'Machine Learning, AI',
      dateOfJoining: new Date('2010-08-01'),
      currentSalary: 85000,
      complianceScore: 92,
      complianceStatus: 'compliant',
      documents: {
        phdCertificate: true,
        experienceCertificate: true,
        qualifications: true,
        backgroundCheck: true
      },
      lastComplianceCheck: new Date('2024-11-15'),
      nextComplianceDue: new Date('2025-05-15'),
      status: 'active',
      address: {
        street: '123 University Campus',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        country: 'India'
      },
      emergencyContact: {
        name: 'Mrs. Sunita Kumar',
        relationship: 'Spouse',
        phone: '+91-9876543215'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Check access permissions
    if (req.user.role !== 'admin' && req.user.institutions?.length > 0) {
      if (!req.user.institutions.includes(mockFaculty.institutionId)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this faculty member'
        });
      }
    }

    res.json({
      success: true,
      data: mockFaculty
    });
  } catch (error) {
    logger.error('Error fetching faculty member:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch faculty member'
    });
  }
});

// Create new faculty member
router.post('/',
  authenticateToken,
  restrictTo(['admin', 'institution_admin', 'hr_manager']),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').notEmpty().withMessage('Phone number is required'),
    body('position').notEmpty().withMessage('Position is required'),
    body('department').notEmpty().withMessage('Department is required'),
    body('institutionId').notEmpty().withMessage('Institution ID is required'),
    body('qualifications').notEmpty().withMessage('Qualifications are required'),
    body('experienceYears').isInt({ min: 0 }).withMessage('Experience years must be a positive integer'),
    body('dateOfJoining').isISO8601().withMessage('Valid joining date is required')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const facultyData = req.body;

      // Check if user has permission to add faculty to this institution
      if (req.user.role !== 'admin' && req.user.institutions?.length > 0) {
        if (!req.user.institutions.includes(facultyData.institutionId)) {
          return res.status(403).json({
            success: false,
            message: 'Access denied to add faculty to this institution'
          });
        }
      }

      const newFaculty = {
        id: `faculty_${Date.now()}`,
        ...facultyData,
        complianceScore: 0,
        complianceStatus: 'pending',
        documents: {
          phdCertificate: false,
          experienceCertificate: false,
          qualifications: false,
          backgroundCheck: false
        },
        lastComplianceCheck: null,
        nextComplianceDue: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000), // 6 months from now
        status: 'active',
        createdBy: req.user.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      logger.info(`Faculty member created: ${newFaculty.id} by user ${req.user.id}`);

      res.status(201).json({
        success: true,
        message: 'Faculty member created successfully',
        data: newFaculty
      });
    } catch (error) {
      logger.error('Error creating faculty member:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create faculty member'
      });
    }
  }
);

// Update faculty member
router.put('/:id',
  authenticateToken,
  restrictTo(['admin', 'institution_admin', 'hr_manager']),
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('phone').optional().notEmpty().withMessage('Phone number cannot be empty'),
    body('position').optional().notEmpty().withMessage('Position cannot be empty'),
    body('department').optional().notEmpty().withMessage('Department cannot be empty'),
    body('qualifications').optional().notEmpty().withMessage('Qualifications cannot be empty'),
    body('experienceYears').optional().isInt({ min: 0 }).withMessage('Experience years must be a positive integer')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // This would typically check if faculty exists and update the database
      logger.info(`Faculty member updated: ${id} by user ${req.user.id}`);

      const updatedFaculty = {
        id,
        ...updateData,
        updatedBy: req.user.id,
        updatedAt: new Date()
      };

      res.json({
        success: true,
        message: 'Faculty member updated successfully',
        data: updatedFaculty
      });
    } catch (error) {
      logger.error('Error updating faculty member:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update faculty member'
      });
    }
  }
);

// Update faculty compliance status
router.patch('/:id/compliance',
  authenticateToken,
  restrictTo(['admin', 'compliance_officer', 'standards_officer']),
  [
    body('complianceScore').isFloat({ min: 0, max: 100 }).withMessage('Compliance score must be between 0 and 100'),
    body('complianceStatus').isIn(['compliant', 'needs_improvement', 'non_compliant', 'pending']).withMessage('Invalid compliance status'),
    body('documents.phdCertificate').optional().isBoolean().withMessage('PhD certificate status must be boolean'),
    body('documents.experienceCertificate').optional().isBoolean().withMessage('Experience certificate status must be boolean'),
    body('documents.qualifications').optional().isBoolean().withMessage('Qualifications status must be boolean'),
    body('documents.backgroundCheck').optional().isBoolean().withMessage('Background check status must be boolean'),
    body('comments').optional().isString().withMessage('Comments must be a string')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { complianceScore, complianceStatus, documents, comments } = req.body;

      const complianceUpdate = {
        complianceScore,
        complianceStatus,
        documents,
        lastComplianceCheck: new Date(),
        nextComplianceDue: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000), // 6 months from now
        complianceComments: comments,
        reviewedBy: req.user.id,
        reviewedAt: new Date()
      };

      logger.info(`Faculty compliance updated: ${id} by user ${req.user.id} - Score: ${complianceScore}`);

      res.json({
        success: true,
        message: 'Faculty compliance updated successfully',
        data: {
          facultyId: id,
          ...complianceUpdate
        }
      });
    } catch (error) {
      logger.error('Error updating faculty compliance:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update faculty compliance'
      });
    }
  }
);

// Get faculty compliance report
router.get('/:id/compliance-report',
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { period = 'year' } = req.query;

      // Mock compliance report data
      const complianceReport = {
        facultyId: id,
        period,
        overallScore: 87,
        scores: {
          qualifications: 95,
          experience: 90,
          documentation: 85,
          professionalDevelopment: 80,
          teachingQuality: 88,
          researchContribution: 75
        },
        complianceStatus: 'compliant',
        lastUpdated: new Date(),
        history: [
          { date: new Date('2024-11-01'), score: 85, status: 'compliant' },
          { date: new Date('2024-08-01'), score: 82, status: 'compliant' },
          { date: new Date('2024-05-01'), score: 78, status: 'needs_improvement' },
          { date: new Date('2024-02-01'), score: 75, status: 'needs_improvement' }
        ],
        recommendations: [
          'Complete advanced research methodology course',
          'Participate in at least 2 professional development workshops',
          'Update teaching portfolio with recent innovations'
        ],
        nextReview: new Date('2025-05-01')
      };

      res.json({
        success: true,
        data: complianceReport
      });
    } catch (error) {
      logger.error('Error fetching faculty compliance report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch compliance report'
      });
    }
  }
);

// Delete faculty member
router.delete('/:id',
  authenticateToken,
  restrictTo(['admin', 'institution_admin']),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      // This would typically soft delete from database
      logger.info(`Faculty member deleted: ${id} by user ${req.user.id} - Reason: ${reason || 'No reason provided'}`);

      res.json({
        success: true,
        message: 'Faculty member deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting faculty member:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete faculty member'
      });
    }
  }
);

// Get faculty statistics
router.get('/stats/overview',
  authenticateToken,
  restrictTo(['admin', 'institution_admin', 'compliance_officer']),
  async (req, res) => {
    try {
      const { institutionId } = req.query;

      // Mock statistics
      const stats = {
        totalFaculty: 45,
        compliant: 32,
        needsImprovement: 8,
        nonCompliant: 3,
        pending: 2,
        averageExperience: 8.5,
        averageComplianceScore: 84,
        departmentBreakdown: {
          'Computer Science': { total: 12, compliant: 10 },
          'Mathematics': { total: 8, compliant: 6 },
          'Physics': { total: 10, compliant: 8 },
          'Chemistry': { total: 8, compliant: 5 },
          'Biology': { total: 7, compliant: 3 }
        },
        complianceTrends: {
          thisMonth: '+5%',
          lastMonth: '+3%',
          lastQuarter: '+8%'
        }
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error fetching faculty statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch faculty statistics'
      });
    }
  }
);

module.exports = router;