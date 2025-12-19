const { body, param, query, validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value
    }));
    
    return res.status(400).json({
      status: 'fail',
      message: 'Validation failed',
      errors: errorMessages
    });
  }
  next();
};

// Common validation rules
const validationRules = {
  // User validation
  user: {
    register: [
      body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
      body('username')
        .isAlphanumeric('en-US', { ignore: '_-' })
        .isLength({ min: 3, max: 50 })
        .withMessage('Username must be 3-50 characters long'),
      body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
      body('first_name')
        .isLength({ min: 2, max: 100 })
        .withMessage('First name must be 2-100 characters long'),
      body('last_name')
        .isLength({ min: 2, max: 100 })
        .withMessage('Last name must be 2-100 characters long'),
      body('role')
        .isIn(['admin', 'compliance_officer', 'principal', 'vice_principal', 'department_head', 'faculty', 'auditor', 'viewer'])
        .withMessage('Invalid role specified')
    ],
    
    login: [
      body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
      body('password')
        .notEmpty()
        .withMessage('Password is required')
    ],
    
    updateProfile: [
      body('first_name')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('First name must be 2-100 characters long'),
      body('last_name')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('Last name must be 2-100 characters long'),
      body('department')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Department must be less than 100 characters'),
      body('position')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Position must be less than 100 characters'),
      body('phone')
        .optional()
        .isMobilePhone()
        .withMessage('Please provide a valid phone number')
    ]
  },

  // Institution validation
  institution: {
    create: [
      body('name')
        .notEmpty()
        .isLength({ min: 2, max: 255 })
        .withMessage('Institution name must be 2-255 characters long'),
      body('code')
        .notEmpty()
        .isLength({ min: 2, max: 50 })
        .withMessage('Institution code must be 2-50 characters long'),
      body('type')
        .isIn(['school', 'college', 'university', 'institute'])
        .withMessage('Invalid institution type'),
      body('level')
        .isIn(['primary', 'secondary', 'higher_secondary', 'undergraduate', 'postgraduate', 'research'])
        .withMessage('Invalid institution level'),
      body('principal_name')
        .notEmpty()
        .isLength({ min: 2, max: 100 })
        .withMessage('Principal name must be 2-100 characters long'),
      body('principal_email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid principal email address'),
      body('principal_phone')
        .isMobilePhone()
        .withMessage('Please provide a valid principal phone number')
    ],
    
    update: [
      body('name')
        .optional()
        .isLength({ min: 2, max: 255 })
        .withMessage('Institution name must be 2-255 characters long'),
      body('principal_name')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('Principal name must be 2-100 characters long'),
      body('principal_email')
        .optional()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid principal email address'),
      body('principal_phone')
        .optional()
        .isMobilePhone()
        .withMessage('Please provide a valid principal phone number'),
      body('status')
        .optional()
        .isIn(['active', 'inactive', 'pending', 'suspended'])
        .withMessage('Invalid status')
    ]
  },

  // Faculty validation
  faculty: {
    create: [
      body('employee_id')
        .notEmpty()
        .isLength({ min: 2, max: 50 })
        .withMessage('Employee ID must be 2-50 characters long'),
      body('first_name')
        .notEmpty()
        .isLength({ min: 2, max: 100 })
        .withMessage('First name must be 2-100 characters long'),
      body('last_name')
        .notEmpty()
        .isLength({ min: 2, max: 100 })
        .withMessage('Last name must be 2-100 characters long'),
      body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
      body('phone')
        .isMobilePhone()
        .withMessage('Please provide a valid phone number'),
      body('department')
        .notEmpty()
        .isLength({ min: 2, max: 100 })
        .withMessage('Department must be 2-100 characters long'),
      body('subject')
        .notEmpty()
        .isLength({ min: 2, max: 100 })
        .withMessage('Subject must be 2-100 characters long'),
      body('designation')
        .isIn(['professor', 'associate_professor', 'assistant_professor', 'lecturer', 'teacher', 'principal', 'vice_principal', 'coordinator'])
        .withMessage('Invalid designation'),
      body('qualification')
        .isArray()
        .withMessage('Qualification must be an array'),
      body('experience_years')
        .isInt({ min: 0, max: 50 })
        .withMessage('Experience years must be between 0 and 50'),
      body('date_of_joining')
        .isISO8601()
        .withMessage('Please provide a valid date of joining'),
      body('date_of_birth')
        .isISO8601()
        .withMessage('Please provide a valid date of birth'),
      body('gender')
        .isIn(['male', 'female', 'other'])
        .withMessage('Invalid gender')
    ],
    
    update: [
      body('first_name')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('First name must be 2-100 characters long'),
      body('last_name')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('Last name must be 2-100 characters long'),
      body('email')
        .optional()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
      body('phone')
        .optional()
        .isMobilePhone()
        .withMessage('Please provide a valid phone number'),
      body('department')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('Department must be 2-100 characters long'),
      body('subject')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('Subject must be 2-100 characters long'),
      body('qualification')
        .optional()
        .isArray()
        .withMessage('Qualification must be an array'),
      body('experience_years')
        .optional()
        .isInt({ min: 0, max: 50 })
        .withMessage('Experience years must be between 0 and 50')
    ]
  },

  // Approval validation
  approval: {
    create: [
      body('approval_type')
        .isIn([
          'establishment_license', 'faculty_registration', 'infrastructure_approval',
          'affiliation_certificate', 'building_safety_certificate', 'fire_safety_certificate',
          'pollution_control_certificate', 'health_safety_certificate', 'computer_lab_approval',
          'library_approval', 'sports_facility_approval', 'transport_approval',
          'hostel_approval', 'canteen_approval', 'security_approval'
        ])
        .withMessage('Invalid approval type'),
      body('approval_number')
        .notEmpty()
        .isLength({ min: 2, max: 100 })
        .withMessage('Approval number must be 2-100 characters long'),
      body('issuing_authority')
        .notEmpty()
        .isLength({ min: 2, 255 })
        .withMessage('Issuing authority must be 2-255 characters long'),
      body('council')
        .isIn(['regulatory', 'standards', 'accreditation'])
        .withMessage('Invalid council'),
      body('valid_from')
        .isISO8601()
        .withMessage('Please provide a valid valid_from date'),
      body('valid_until')
        .isISO8601()
        .withMessage('Please provide a valid valid_until date'),
      body('priority_level')
        .optional()
        .isIn(['low', 'medium', 'high', 'critical'])
        .withMessage('Invalid priority level')
    ]
  },

  // Document validation
  document: {
    upload: [
      body('document_type')
        .isIn([
          'certificate', 'license', 'affiliation', 'registration', 'identity_proof',
          'educational_certificate', 'experience_certificate', 'training_certificate',
          'medical_certificate', 'background_check', 'photo', 'signature',
          'academic_transcript', 'degree_certificate', 'professional_certificate',
          'compliance_report', 'audit_report', 'inspection_report', 'policy_document',
          'annual_report', 'financial_document', 'infrastructure_document',
          'safety_certificate', 'other'
        ])
        .withMessage('Invalid document type'),
      body('category')
        .isIn(['regulatory', 'academic', 'administrative', 'financial', 'infrastructure', 'safety', 'compliance', 'personal', 'operational'])
        .withMessage('Invalid category'),
      body('title')
        .notEmpty()
        .isLength({ min: 2, max: 255 })
        .withMessage('Title must be 2-255 characters long'),
      body('confidentiality_level')
        .optional()
        .isIn(['public', 'internal', 'confidential', 'restricted', 'secret'])
        .withMessage('Invalid confidentiality level')
    ]
  },

  // Alert validation
  alert: {
    create: [
      body('alert_type')
        .isIn([
          'approval_expiry', 'document_expiry', 'training_due', 'background_check_due',
          'medical_checkup_due', 'performance_review_due', 'audit_due', 'renewal_required',
          'compliance_violation', 'policy_update', 'deadline_approaching', 'missing_document',
          'incomplete_registration', 'faculty_verification', 'infrastructure_issue',
          'quality_issue', 'accreditation_due', 'custom'
        ])
        .withMessage('Invalid alert type'),
      body('severity')
        .isIn(['info', 'warning', 'high', 'critical'])
        .withMessage('Invalid severity'),
      body('priority')
        .isIn(['low', 'medium', 'high', 'urgent'])
        .withMessage('Invalid priority'),
      body('title')
        .notEmpty()
        .isLength({ min: 5, max: 255 })
        .withMessage('Title must be 5-255 characters long'),
      body('message')
        .notEmpty()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Message must be 10-1000 characters long'),
      body('council')
        .isIn(['regulatory', 'standards', 'accreditation', 'all'])
        .withMessage('Invalid council'),
      body('category')
        .isIn([
          'compliance', 'deadline', 'renewal', 'verification', 'audit', 'training',
          'policy', 'quality', 'infrastructure', 'personnel', 'financial', 'academic', 'administrative'
        ])
        .withMessage('Invalid category')
    ]
  },

  // Query validation
  query: {
    pagination: [
      query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
      query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
      query('sort')
        .optional()
        .isString()
        .withMessage('Sort must be a string'),
      query('fields')
        .optional()
        .isString()
        .withMessage('Fields must be a string')
    ]
  },

  // Parameter validation
  params: {
    id: [
      param('id')
        .isUUID()
        .withMessage('Invalid ID format')
    ]
  }
};

// Export validation functions
module.exports = {
  validationRules,
  handleValidationErrors
};