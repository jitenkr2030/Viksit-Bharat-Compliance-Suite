const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Demo request validation
const demoRequestValidation = [
  body('company')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('phone')
    .trim()
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be between 10 and 15 characters'),
  body('industry')
    .notEmpty()
    .withMessage('Please select an industry'),
  body('employees')
    .notEmpty()
    .withMessage('Please select the number of employees'),
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Message must be less than 500 characters')
];

// Create demo request
router.post('/demo-requests', demoRequestValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      company,
      firstName,
      lastName,
      email,
      phone,
      industry,
      employees,
      message,
      source,
      timestamp,
      userAgent,
      referrer
    } = req.body;

    // Create demo request object
    const demoRequest = {
      id: `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      company,
      contact: {
        firstName,
        lastName,
        email,
        phone
      },
      companyInfo: {
        industry,
        employees
      },
      message,
      source: source || 'landing-page',
      submittedAt: timestamp || new Date().toISOString(),
      userAgent,
      referrer,
      status: 'new',
      assignedTo: null,
      priority: 'medium'
    };

    // In a real implementation, you would save this to a database
    // For now, we'll just log it and return success
    console.log('New demo request received:', demoRequest);

    // TODO: Save to database
    // await DemoRequest.create(demoRequest);

    // TODO: Send notification to sales team
    // await sendNotificationToSales(demoRequest);

    // TODO: Send confirmation email to user
    // await sendConfirmationEmail(demoRequest);

    // TODO: Add to CRM
    // await addToCRM(demoRequest);

    res.status(201).json({
      success: true,
      message: 'Demo request submitted successfully',
      requestId: demoRequest.id,
      estimatedResponse: '24 hours'
    });

  } catch (error) {
    console.error('Demo request submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get demo requests (for admin/sales team)
router.get('/demo-requests', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      industry,
      source,
      startDate,
      endDate
    } = req.query;

    // Build query filters
    const filters = {};
    if (status) filters.status = status;
    if (industry) filters.industry = industry;
    if (source) filters.source = source;
    if (startDate || endDate) {
      filters.submittedAt = {};
      if (startDate) filters.submittedAt.$gte = new Date(startDate);
      if (endDate) filters.submittedAt.$lte = new Date(endDate);
    }

    // TODO: Query database
    // const requests = await DemoRequest.find(filters)
    //   .sort({ submittedAt: -1 })
    //   .skip((page - 1) * limit)
    //   .limit(parseInt(limit));

    // Mock data for now
    const requests = [
      {
        id: 'demo_123',
        company: 'Example University',
        contact: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.edu',
          phone: '+91 9876543210'
        },
        companyInfo: {
          industry: 'education',
          employees: '201-1000'
        },
        submittedAt: new Date().toISOString(),
        status: 'new',
        priority: 'medium'
      }
    ];

    const total = 1; // TODO: Get actual count from database

    res.json({
      success: true,
      data: {
        requests,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get demo requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update demo request status
router.patch('/demo-requests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedTo, notes } = req.body;

    // TODO: Update in database
    // const updatedRequest = await DemoRequest.findByIdAndUpdate(
    //   id,
    //   { status, assignedTo, notes, updatedAt: new Date() },
    //   { new: true }
    // );

    // Mock update for now
    const updatedRequest = {
      id,
      status,
      assignedTo,
      notes,
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Demo request updated successfully',
      data: updatedRequest
    });

  } catch (error) {
    console.error('Update demo request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Analytics endpoint for landing page events
router.post('/analytics/events', async (req, res) => {
  try {
    const { event, data, timestamp, page } = req.body;

    // Log analytics event
    console.log('Analytics event:', {
      event,
      data,
      timestamp,
      page,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      timestamp: new Date().toISOString()
    });

    // TODO: Save to analytics database
    // await AnalyticsEvent.create({
    //   event,
    //   data,
    //   timestamp,
    //   page,
    //   userAgent: req.get('User-Agent'),
    //   ip: req.ip,
    //   createdAt: new Date()
    // });

    // TODO: Send to external analytics service (Google Analytics, Mixpanel, etc.)

    res.json({
      success: true,
      message: 'Event tracked successfully'
    });

  } catch (error) {
    console.error('Analytics event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track event'
    });
  }
});

// Integration status endpoint
router.get('/integrations/status', async (req, res) => {
  try {
    // TODO: Check real integration status from database or external APIs
    const integrationStatus = {
      'gst portal': 'active',
      'mca portal': 'active',
      'rbi portal': 'active',
      'naac portal': 'active',
      'aicte portal': 'maintenance' // Example of maintenance status
    };

    res.json({
      success: true,
      data: integrationStatus
    });

  } catch (error) {
    console.error('Integration status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get integration status'
    });
  }
});

module.exports = router;