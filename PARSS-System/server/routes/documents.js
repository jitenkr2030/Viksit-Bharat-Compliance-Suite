const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { body, validationResult, query } = require('express-validator');
const { authenticateToken, restrictTo } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const logger = require('../middleware/logger');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/documents');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error, null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, images, Word documents, and text files are allowed.'));
    }
  }
});

// Get all documents
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { institutionId, type, category, status, search, page = 1, limit = 20 } = req.query;
    
    // Mock documents data
    const mockDocuments = [
      {
        id: 'doc_1',
        title: 'Institutional Accreditation Certificate',
        description: 'Official accreditation certificate from VBSA',
        type: 'accreditation',
        category: 'certificate',
        fileName: 'accreditation_certificate.pdf',
        fileSize: 1024000,
        mimeType: 'application/pdf',
        fileUrl: '/uploads/documents/accreditation_certificate.pdf',
        thumbnailUrl: '/uploads/thumbnails/accreditation_certificate_thumb.jpg',
        institutionId: '1',
        institutionName: 'Example University',
        uploadedBy: 'admin_1',
        uploadedAt: new Date('2024-01-15'),
        status: 'verified',
        expiryDate: new Date('2026-01-15'),
        tags: ['accreditation', 'certificate', 'official'],
        metadata: {
          pages: 3,
          resolution: '300dpi',
          color: true
        },
        version: 1,
        isLatestVersion: true,
        downloadCount: 15,
        lastAccessed: new Date('2024-12-10'),
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: 'doc_2',
        title: 'Faculty Qualifications - Computer Science Department',
        description: 'Complete faculty qualification documents',
        type: 'faculty',
        category: 'qualifications',
        fileName: 'cs_faculty_qualifications.pdf',
        fileSize: 2048000,
        mimeType: 'application/pdf',
        fileUrl: '/uploads/documents/cs_faculty_qualifications.pdf',
        thumbnailUrl: '/uploads/thumbnails/cs_faculty_qualifications_thumb.jpg',
        institutionId: '1',
        institutionName: 'Example University',
        uploadedBy: 'hr_manager_1',
        uploadedAt: new Date('2024-03-20'),
        status: 'pending_review',
        expiryDate: null,
        tags: ['faculty', 'qualifications', 'computer-science'],
        metadata: {
          pages: 25,
          resolution: '300dpi',
          color: true,
          documentsIncluded: 12
        },
        version: 1,
        isLatestVersion: true,
        downloadCount: 8,
        lastAccessed: new Date('2024-12-08'),
        createdAt: new Date('2024-03-20'),
        updatedAt: new Date('2024-03-20')
      },
      {
        id: 'doc_3',
        title: 'Infrastructure Compliance Report',
        description: 'Annual infrastructure compliance assessment',
        type: 'compliance',
        category: 'infrastructure',
        fileName: 'infrastructure_compliance_2024.pdf',
        fileSize: 1536000,
        mimeType: 'application/pdf',
        fileUrl: '/uploads/documents/infrastructure_compliance_2024.pdf',
        thumbnailUrl: '/uploads/thumbnails/infrastructure_compliance_2024_thumb.jpg',
        institutionId: '2',
        institutionName: 'Example College',
        uploadedBy: 'compliance_officer_1',
        uploadedAt: new Date('2024-11-30'),
        status: 'draft',
        expiryDate: new Date('2025-11-30'),
        tags: ['compliance', 'infrastructure', 'assessment', '2024'],
        metadata: {
          pages: 18,
          resolution: '300dpi',
          color: true,
          assessmentDate: '2024-11-25'
        },
        version: 1,
        isLatestVersion: true,
        downloadCount: 3,
        lastAccessed: new Date('2024-12-05'),
        createdAt: new Date('2024-11-30'),
        updatedAt: new Date('2024-11-30')
      }
    ];

    let filteredDocuments = mockDocuments;
    
    if (institutionId) {
      filteredDocuments = filteredDocuments.filter(doc => doc.institutionId === institutionId);
    }
    if (type) {
      filteredDocuments = filteredDocuments.filter(doc => doc.type === type);
    }
    if (category) {
      filteredDocuments = filteredDocuments.filter(doc => doc.category === category);
    }
    if (status) {
      filteredDocuments = filteredDocuments.filter(doc => doc.status === status);
    }
    if (search) {
      filteredDocuments = filteredDocuments.filter(doc =>
        doc.title.toLowerCase().includes(search.toLowerCase()) ||
        doc.description.toLowerCase().includes(search.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Filter by user's institution access
    if (req.user.role !== 'admin' && req.user.institutions?.length > 0) {
      filteredDocuments = filteredDocuments.filter(doc => 
        req.user.institutions.includes(doc.institutionId)
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedDocuments = filteredDocuments.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        documents: paginatedDocuments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredDocuments.length,
          pages: Math.ceil(filteredDocuments.length / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching documents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents'
    });
  }
});

// Upload new document
router.post('/upload',
  authenticateToken,
  upload.single('document'),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('type').isIn(['accreditation', 'compliance', 'faculty', 'infrastructure', 'regulatory', 'general']).withMessage('Invalid document type'),
    body('category').isIn(['certificate', 'qualifications', 'infrastructure', 'assessment', 'report', 'policy', 'other']).withMessage('Invalid category'),
    body('institutionId').notEmpty().withMessage('Institution ID is required'),
    body('tags').optional().isString().withMessage('Tags must be a string'),
    body('expiryDate').optional().isISO8601().withMessage('Valid expiry date required')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const {
        title,
        description,
        type,
        category,
        institutionId,
        tags,
        expiryDate
      } = req.body;

      // Check if user has permission to upload documents for this institution
      if (req.user.role !== 'admin' && req.user.institutions?.length > 0) {
        if (!req.user.institutions.includes(institutionId)) {
          return res.status(403).json({
            success: false,
            message: 'Access denied to upload documents for this institution'
          });
        }
      }

      const newDocument = {
        id: `doc_${Date.now()}`,
        title,
        description: description || '',
        type,
        category,
        fileName: req.file.filename,
        originalName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        fileUrl: `/uploads/documents/${req.file.filename}`,
        thumbnailUrl: `/uploads/thumbnails/thumb_${req.file.filename}.jpg`,
        institutionId,
        uploadedBy: req.user.id,
        uploadedAt: new Date(),
        status: 'pending_review',
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        metadata: {
          uploadedVia: 'web_interface',
          userAgent: req.get('User-Agent'),
          ipAddress: req.ip
        },
        version: 1,
        isLatestVersion: true,
        downloadCount: 0,
        lastAccessed: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      logger.info(`Document uploaded: ${newDocument.id} by user ${req.user.id}`);

      res.status(201).json({
        success: true,
        message: 'Document uploaded successfully',
        data: newDocument
      });
    } catch (error) {
      logger.error('Error uploading document:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload document'
      });
    }
  }
);

// Get document by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Mock document data - in real implementation, this would query the database
    const mockDocument = {
      id: 'doc_1',
      title: 'Institutional Accreditation Certificate',
      description: 'Official accreditation certificate from VBSA',
      type: 'accreditation',
      category: 'certificate',
      fileName: 'accreditation_certificate.pdf',
      fileSize: 1024000,
      mimeType: 'application/pdf',
      fileUrl: '/uploads/documents/accreditation_certificate.pdf',
      thumbnailUrl: '/uploads/thumbnails/accreditation_certificate_thumb.jpg',
      institutionId: '1',
      institutionName: 'Example University',
      uploadedBy: 'admin_1',
      uploadedAt: new Date('2024-01-15'),
      status: 'verified',
      expiryDate: new Date('2026-01-15'),
      tags: ['accreditation', 'certificate', 'official'],
      metadata: {
        pages: 3,
        resolution: '300dpi',
        color: true
      },
      version: 1,
      isLatestVersion: true,
      downloadCount: 15,
      lastAccessed: new Date('2024-12-10'),
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    };

    // Check access permissions
    if (req.user.role !== 'admin' && req.user.institutions?.length > 0) {
      if (!req.user.institutions.includes(mockDocument.institutionId)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this document'
        });
      }
      // Check document status for non-admin users
      if (mockDocument.status === 'draft' && mockDocument.uploadedBy !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to draft documents'
        });
      }
    }

    // Update last accessed
    mockDocument.lastAccessed = new Date();

    res.json({
      success: true,
      data: mockDocument
    });
  } catch (error) {
    logger.error('Error fetching document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch document'
    });
  }
});

// Download document
router.get('/:id/download', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // In real implementation, this would:
    // 1. Fetch document from database
    // 2. Check permissions
    // 3. Increment download count
    // 4. Stream the file

    logger.info(`Document downloaded: ${id} by user ${req.user.id}`);

    // Mock response - in real implementation, you'd use res.download() or res.attachment()
    res.json({
      success: true,
      message: 'Download initiated',
      data: {
        downloadUrl: `/api/documents/download/${id}`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
    });
  } catch (error) {
    logger.error('Error downloading document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download document'
    });
  }
});

// Update document
router.put('/:id',
  authenticateToken,
  [
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('type').optional().isIn(['accreditation', 'compliance', 'faculty', 'infrastructure', 'regulatory', 'general']).withMessage('Invalid document type'),
    body('category').optional().isIn(['certificate', 'qualifications', 'infrastructure', 'assessment', 'report', 'policy', 'other']).withMessage('Invalid category'),
    body('status').optional().isIn(['draft', 'pending_review', 'verified', 'rejected', 'expired']).withMessage('Invalid status'),
    body('tags').optional().isString().withMessage('Tags must be a string'),
    body('expiryDate').optional().isISO8601().withMessage('Valid expiry date required')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // This would typically update the database
      logger.info(`Document updated: ${id} by user ${req.user.id}`);

      const updatedDocument = {
        id,
        ...updateData,
        updatedBy: req.user.id,
        updatedAt: new Date()
      };

      res.json({
        success: true,
        message: 'Document updated successfully',
        data: updatedDocument
      });
    } catch (error) {
      logger.error('Error updating document:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update document'
      });
    }
  }
);

// Verify/Reject document (for compliance officers)
router.patch('/:id/verify',
  authenticateToken,
  restrictTo(['compliance_officer', 'admin']),
  [
    body('status').isIn(['verified', 'rejected']).withMessage('Status must be verified or rejected'),
    body('comments').optional().isString().withMessage('Comments must be a string')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status, comments } = req.body;

      const verification = {
        status,
        verifiedBy: req.user.id,
        verifiedAt: new Date(),
        verificationComments: comments,
        verificationHistory: [
          {
            status: 'verified',
            verifiedBy: req.user.id,
            verifiedAt: new Date(),
            comments: comments || ''
          }
        ]
      };

      logger.info(`Document ${status}: ${id} by user ${req.user.id}`);

      res.json({
        success: true,
        message: `Document ${status} successfully`,
        data: {
          documentId: id,
          ...verification
        }
      });
    } catch (error) {
      logger.error('Error verifying document:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify document'
      });
    }
  }
);

// Delete document
router.delete('/:id',
  authenticateToken,
  restrictTo(['admin', 'institution_admin', 'document_owner']),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      // This would typically:
      // 1. Check if user has permission to delete
      // 2. Soft delete from database
      // 3. Archive the file
      logger.info(`Document deleted: ${id} by user ${req.user.id} - Reason: ${reason || 'No reason provided'}`);

      res.json({
        success: true,
        message: 'Document deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting document:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete document'
      });
    }
  }
);

// Get document statistics
router.get('/stats/overview',
  authenticateToken,
  restrictTo(['admin', 'institution_admin', 'compliance_officer']),
  async (req, res) => {
    try {
      const { institutionId, period = 'month' } = req.query;

      // Mock statistics
      const stats = {
        totalDocuments: 145,
        pendingReview: 12,
        verified: 118,
        rejected: 8,
        expired: 7,
        totalSize: 2.4 * 1024 * 1024 * 1024, // 2.4 GB
        averageSize: 16.8 * 1024 * 1024, // 16.8 MB
        byType: {
          accreditation: 25,
          compliance: 45,
          faculty: 35,
          infrastructure: 28,
          regulatory: 8,
          general: 4
        },
        byCategory: {
          certificate: 15,
          qualifications: 32,
          infrastructure: 28,
          assessment: 25,
          report: 22,
          policy: 12,
          other: 11
        },
        uploadTrends: {
          thisMonth: '+15%',
          lastMonth: '+8%',
          lastQuarter: '+22%'
        },
        mostDownloaded: [
          { id: 'doc_1', title: 'Accreditation Certificate', downloads: 45 },
          { id: 'doc_2', title: 'Faculty Guidelines', downloads: 38 },
          { id: 'doc_3', title: 'Infrastructure Standards', downloads: 32 }
        ]
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error fetching document statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch document statistics'
      });
    }
  }
);

module.exports = router;