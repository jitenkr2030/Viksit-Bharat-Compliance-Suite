const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const { authenticateToken, restrictTo } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const logger = require('../middleware/logger');

// Get all institutions
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, type, category, status, page = 1, limit = 20 } = req.query;
    
    // Mock institutions data
    const mockInstitutions = [
      {
        id: '1',
        name: 'Example University',
        type: 'university',
        category: 'public',
        status: 'active',
        location: {
          address: '123 University Campus',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          country: 'India'
        },
        contact: {
          email: 'admin@example.edu',
          phone: '+91-22-12345678',
          website: 'https://www.example.edu'
        },
        accreditation: {
          level: 'A+',
          status: 'accredited',
          accreditingBody: 'VBSA',
          accreditedSince: new Date('2023-01-15'),
          expiryDate: new Date('2026-01-15')
        },
        compliance: {
          overallScore: 88,
          regulatoryScore: 92,
          standardsScore: 85,
          accreditationScore: 87,
          lastAssessment: new Date('2024-11-01'),
          nextAssessment: new Date('2025-05-01')
        },
        statistics: {
          totalFaculty: 125,
          totalStudents: 3500,
          totalPrograms: 24,
          annualBudget: 50000000,
          establishedYear: 1995
        },
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2024-12-01')
      },
      {
        id: '2',
        name: 'Example College',
        type: 'college',
        category: 'private',
        status: 'active',
        location: {
          address: '456 College Road',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411001',
          country: 'India'
        },
        contact: {
          email: 'principal@examplecollege.edu',
          phone: '+91-20-87654321',
          website: 'https://www.examplecollege.edu'
        },
        accreditation: {
          level: 'A',
          status: 'accredited',
          accreditingBody: 'VBSA',
          accreditedSince: new Date('2022-06-20'),
          expiryDate: new Date('2025-06-20')
        },
        compliance: {
          overallScore: 82,
          regulatoryScore: 85,
          standardsScore: 80,
          accreditationScore: 81,
          lastAssessment: new Date('2024-10-15'),
          nextAssessment: new Date('2025-04-15')
        },
        statistics: {
          totalFaculty: 45,
          totalStudents: 1200,
          totalPrograms: 12,
          annualBudget: 15000000,
          establishedYear: 2005
        },
        createdAt: new Date('2022-01-01'),
        updatedAt: new Date('2024-11-15')
      },
      {
        id: '3',
        name: 'City International School',
        type: 'school',
        category: 'private',
        status: 'pending_accreditation',
        location: {
          address: '789 School Street',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001',
          country: 'India'
        },
        contact: {
          email: 'info@cityinternational.edu',
          phone: '+91-11-98765432',
          website: 'https://www.cityinternational.edu'
        },
        accreditation: {
          level: null,
          status: 'pending',
          accreditingBody: 'VBSA',
          accreditedSince: null,
          expiryDate: null,
          applicationDate: new Date('2024-11-01'),
          expectedDecision: new Date('2025-02-01')
        },
        compliance: {
          overallScore: 75,
          regulatoryScore: 78,
          standardsScore: 73,
          accreditationScore: 0,
          lastAssessment: new Date('2024-09-20'),
          nextAssessment: new Date('2025-03-20')
        },
        statistics: {
          totalFaculty: 65,
          totalStudents: 1800,
          totalPrograms: 8,
          annualBudget: 25000000,
          establishedYear: 2010
        },
        createdAt: new Date('2023-06-01'),
        updatedAt: new Date('2024-12-05')
      }
    ];

    let filteredInstitutions = mockInstitutions;
    
    if (search) {
      filteredInstitutions = filteredInstitutions.filter(institution =>
        institution.name.toLowerCase().includes(search.toLowerCase()) ||
        institution.location.city.toLowerCase().includes(search.toLowerCase()) ||
        institution.location.state.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (type) {
      filteredInstitutions = filteredInstitutions.filter(institution => institution.type === type);
    }
    if (category) {
      filteredInstitutions = filteredInstitutions.filter(institution => institution.category === category);
    }
    if (status) {
      filteredInstitutions = filteredInstitutions.filter(institution => institution.status === status);
    }

    // Filter by user's institution access for non-admin users
    if (req.user.role !== 'admin' && req.user.institutions?.length > 0) {
      filteredInstitutions = filteredInstitutions.filter(institution => 
        req.user.institutions.includes(institution.id)
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedInstitutions = filteredInstitutions.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        institutions: paginatedInstitutions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredInstitutions.length,
          pages: Math.ceil(filteredInstitutions.length / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching institutions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch institutions'
    });
  }
});

// Get institution by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Mock institution data
    const mockInstitution = {
      id: '1',
      name: 'Example University',
      type: 'university',
      category: 'public',
      status: 'active',
      location: {
        address: '123 University Campus',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        country: 'India'
      },
      contact: {
        email: 'admin@example.edu',
        phone: '+91-22-12345678',
        website: 'https://www.example.edu'
      },
      accreditation: {
        level: 'A+',
        status: 'accredited',
        accreditingBody: 'VBSA',
        accreditedSince: new Date('2023-01-15'),
        expiryDate: new Date('2026-01-15'),
        certificateNumber: 'VBSA-UNI-001',
        lastReview: new Date('2024-01-15'),
        nextReview: new Date('2025-01-15')
      },
      compliance: {
        overallScore: 88,
        regulatoryScore: 92,
        standardsScore: 85,
        accreditationScore: 87,
        lastAssessment: new Date('2024-11-01'),
        nextAssessment: new Date('2025-05-01'),
        complianceHistory: [
          { date: new Date('2024-11-01'), score: 88, status: 'compliant' },
          { date: new Date('2024-08-01'), score: 86, status: 'compliant' },
          { date: new Date('2024-05-01'), score: 84, status: 'compliant' },
          { date: new Date('2024-02-01'), score: 82, status: 'needs_improvement' }
        ]
      },
      statistics: {
        totalFaculty: 125,
        totalStudents: 3500,
        totalPrograms: 24,
        annualBudget: 50000000,
        establishedYear: 1995,
        campusArea: 50, // acres
        libraryBooks: 100000,
        laboratories: 15,
        researchCenters: 8
      },
      programs: [
        {
          id: 'prog_1',
          name: 'Bachelor of Computer Science',
          level: 'undergraduate',
          duration: 4,
          accredited: true,
          intake: 60,
          currentEnrollment: 58
        },
        {
          id: 'prog_2',
          name: 'Master of Computer Science',
          level: 'graduate',
          duration: 2,
          accredited: true,
          intake: 30,
          currentEnrollment: 28
        }
      ],
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2024-12-01')
    };

    // Check access permissions
    if (req.user.role !== 'admin' && req.user.institutions?.length > 0) {
      if (!req.user.institutions.includes(mockInstitution.id)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this institution'
        });
      }
    }

    res.json({
      success: true,
      data: mockInstitution
    });
  } catch (error) {
    logger.error('Error fetching institution:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch institution'
    });
  }
});

// Create new institution
router.post('/',
  authenticateToken,
  restrictTo(['admin', 'regulatory_officer']),
  [
    body('name').notEmpty().withMessage('Institution name is required'),
    body('type').isIn(['school', 'college', 'university']).withMessage('Invalid institution type'),
    body('category').isIn(['public', 'private', 'international']).withMessage('Invalid category'),
    body('location.address').notEmpty().withMessage('Address is required'),
    body('location.city').notEmpty().withMessage('City is required'),
    body('location.state').notEmpty().withMessage('State is required'),
    body('location.pincode').notEmpty().withMessage('Pincode is required'),
    body('contact.email').isEmail().withMessage('Valid email is required'),
    body('contact.phone').notEmpty().withMessage('Phone number is required'),
    body('statistics.establishedYear').isInt({ min: 1800, max: new Date().getFullYear() }).withMessage('Valid establishment year required')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const institutionData = req.body;

      const newInstitution = {
        id: `inst_${Date.now()}`,
        ...institutionData,
        status: 'pending_verification',
        compliance: {
          overallScore: 0,
          regulatoryScore: 0,
          standardsScore: 0,
          accreditationScore: 0,
          lastAssessment: null,
          nextAssessment: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
        },
        accreditation: {
          level: null,
          status: 'not_applied',
          accreditingBody: 'VBSA',
          accreditedSince: null,
          expiryDate: null
        },
        createdBy: req.user.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      logger.info(`Institution created: ${newInstitution.id} by user ${req.user.id}`);

      res.status(201).json({
        success: true,
        message: 'Institution created successfully',
        data: newInstitution
      });
    } catch (error) {
      logger.error('Error creating institution:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create institution'
      });
    }
  }
);

// Update institution
router.put('/:id',
  authenticateToken,
  restrictTo(['admin', 'institution_admin']),
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('type').optional().isIn(['school', 'college', 'university']).withMessage('Invalid institution type'),
    body('category').optional().isIn(['public', 'private', 'international']).withMessage('Invalid category'),
    body('location.address').optional().notEmpty().withMessage('Address cannot be empty'),
    body('contact.email').optional().isEmail().withMessage('Valid email is required')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Check if user has permission to update this institution
      if (req.user.role !== 'admin' && req.user.institutions?.length > 0) {
        if (!req.user.institutions.includes(id)) {
          return res.status(403).json({
            success: false,
            message: 'Access denied to update this institution'
          });
        }
      }

      logger.info(`Institution updated: ${id} by user ${req.user.id}`);

      const updatedInstitution = {
        id,
        ...updateData,
        updatedBy: req.user.id,
        updatedAt: new Date()
      };

      res.json({
        success: true,
        message: 'Institution updated successfully',
        data: updatedInstitution
      });
    } catch (error) {
      logger.error('Error updating institution:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update institution'
      });
    }
  }
);

// Get institution statistics
router.get('/stats/overview',
  authenticateToken,
  restrictTo(['admin', 'regulatory_officer']),
  async (req, res) => {
    try {
      // Mock statistics
      const stats = {
        totalInstitutions: 156,
        byType: {
          university: 45,
          college: 78,
          school: 33
        },
        byCategory: {
          public: 89,
          private: 52,
          international: 15
        },
        byStatus: {
          active: 142,
          pending_accreditation: 8,
          suspended: 4,
          closed: 2
        },
        accreditationStatus: {
          accredited: 128,
          pending: 12,
          expired: 8,
          not_applied: 8
        },
        averageComplianceScore: 84,
        complianceDistribution: {
          excellent: 45, // 90-100%
          good: 67,      // 80-89%
          satisfactory: 32, // 70-79%
          needsImprovement: 12 // Below 70%
        },
        geographicDistribution: {
          'Maharashtra': 45,
          'Karnataka': 32,
          'Tamil Nadu': 28,
          'Delhi': 18,
          'Uttar Pradesh': 15,
          'Other': 18
        },
        recentTrends: {
          newRegistrations: '+12%',
          accreditationApprovals: '+8%',
          complianceImprovements: '+15%'
        }
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error fetching institution statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch institution statistics'
      });
    }
  }
);

module.exports = router;