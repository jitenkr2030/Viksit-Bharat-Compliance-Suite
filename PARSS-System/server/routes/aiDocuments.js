const express = require('express');
const router = express.Router();
const AIDocumentService = require('../services/AIDocumentService');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image, PDF, and document files are allowed'));
    }
  }
});

// Upload and process document
router.post('/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No document file uploaded'
      });
    }
    
    const { documentType = 'general', priority = 'medium', autoClassify = true } = req.body;
    
    const result = await AIDocumentService.processDocument(
      req.file.path,
      documentType,
      priority,
      autoClassify
    );
    
    res.json({
      success: true,
      message: 'Document uploaded and processed successfully',
      data: result
    });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process document',
      error: error.message
    });
  }
});

// Get all documents with pagination and filters
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      documentType,
      status,
      priority,
      dateFrom,
      dateTo,
      search
    } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      documentType,
      status,
      priority,
      dateFrom,
      dateTo,
      search
    };
    
    const result = await AIDocumentService.getDocuments(options);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve documents',
      error: error.message
    });
  }
});

// Get document by ID
router.get('/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    
    const document = await AIDocumentService.getDocumentById(documentId);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve document',
      error: error.message
    });
  }
});

// Extract text from document
router.post('/:documentId/extract-text', async (req, res) => {
  try {
    const { documentId } = req.params;
    const { method = 'auto' } = req.body;
    
    const result = await AIDocumentService.extractTextFromDocument(documentId, method);
    
    res.json({
      success: true,
      message: 'Text extracted successfully',
      data: result
    });
  } catch (error) {
    console.error('Text extraction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to extract text',
      error: error.message
    });
  }
});

// Classify document using AI
router.post('/:documentId/classify', async (req, res) => {
  try {
    const { documentId } = req.params;
    const { confidence = 0.8 } = req.body;
    
    const result = await AIDocumentService.classifyDocument(documentId, confidence);
    
    res.json({
      success: true,
      message: 'Document classified successfully',
      data: result
    });
  } catch (error) {
    console.error('Document classification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to classify document',
      error: error.message
    });
  }
});

// Analyze document for compliance requirements
router.post('/:documentId/analyze-compliance', async (req, res) => {
  try {
    const { documentId } = req.params;
    const { complianceFrameworks = ['general'] } = req.body;
    
    const result = await AIDocumentService.analyzeComplianceRequirements(documentId, complianceFrameworks);
    
    res.json({
      success: true,
      message: 'Compliance analysis completed',
      data: result
    });
  } catch (error) {
    console.error('Compliance analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze compliance requirements',
      error: error.message
    });
  }
});

// Extract key information from document
router.post('/:documentId/extract-key-info', async (req, res) => {
  try {
    const { documentId } = req.params;
    const { extractionType = 'comprehensive' } = req.body;
    
    const result = await AIDocumentService.extractKeyInformation(documentId, extractionType);
    
    res.json({
      success: true,
      message: 'Key information extracted successfully',
      data: result
    });
  } catch (error) {
    console.error('Key information extraction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to extract key information',
      error: error.message
    });
  }
});

// Generate compliance summary
router.post('/:documentId/generate-summary', async (req, res) => {
  try {
    const { documentId } = req.params;
    const { summaryType = 'executive' } = req.body;
    
    const result = await AIDocumentService.generateComplianceSummary(documentId, summaryType);
    
    res.json({
      success: true,
      message: 'Compliance summary generated successfully',
      data: result
    });
  } catch (error) {
    console.error('Summary generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate summary',
      error: error.message
    });
  }
});

// Update document metadata
router.put('/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    const { metadata } = req.body;
    
    const result = await AIDocumentService.updateDocumentMetadata(documentId, metadata);
    
    res.json({
      success: true,
      message: 'Document metadata updated successfully',
      data: result
    });
  } catch (error) {
    console.error('Update document metadata error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update document metadata',
      error: error.message
    });
  }
});

// Re-process document
router.post('/:documentId/reprocess', async (req, res) => {
  try {
    const { documentId } = req.params;
    const { processingOptions = {} } = req.body;
    
    const result = await AIDocumentService.reprocessDocument(documentId, processingOptions);
    
    res.json({
      success: true,
      message: 'Document reprocessed successfully',
      data: result
    });
  } catch (error) {
    console.error('Document reprocessing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reprocess document',
      error: error.message
    });
  }
});

// Delete document
router.delete('/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    
    await AIDocumentService.deleteDocument(documentId);
    
    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document',
      error: error.message
    });
  }
});

// Batch process documents
router.post('/batch-process', async (req, res) => {
  try {
    const { documentIds, processingOptions = {} } = req.body;
    
    if (!Array.isArray(documentIds) || documentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Document IDs array is required'
      });
    }
    
    const result = await AIDocumentService.batchProcessDocuments(documentIds, processingOptions);
    
    res.json({
      success: true,
      message: 'Batch processing completed',
      data: result
    });
  } catch (error) {
    console.error('Batch processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process documents in batch',
      error: error.message
    });
  }
});

// Get document statistics
router.get('/statistics', async (req, res) => {
  try {
    const { period = '30d', documentType } = req.query;
    
    const stats = await AIDocumentService.getDocumentStatistics(period, documentType);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get document statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get document statistics',
      error: error.message
    });
  }
});

// Search documents by content
router.post('/search', async (req, res) => {
  try {
    const { query, filters = {}, limit = 20 } = req.body;
    
    const results = await AIDocumentService.searchDocuments(query, filters, limit);
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Document search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search documents',
      error: error.message
    });
  }
});

// Get document processing queue status
router.get('/queue/status', async (req, res) => {
  try {
    const queueStatus = await AIDocumentService.getProcessingQueueStatus();
    
    res.json({
      success: true,
      data: queueStatus
    });
  } catch (error) {
    console.error('Get queue status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get queue status',
      error: error.message
    });
  }
});

// Export documents
router.post('/export', async (req, res) => {
  try {
    const { documentIds, format = 'json', filters = {} } = req.body;
    
    const exportData = await AIDocumentService.exportDocuments(documentIds, format, filters);
    
    res.json({
      success: true,
      message: 'Documents exported successfully',
      data: exportData
    });
  } catch (error) {
    console.error('Export documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export documents',
      error: error.message
    });
  }
});

// Validate document quality
router.post('/:documentId/validate-quality', async (req, res) => {
  try {
    const { documentId } = req.params;
    const { qualityChecks = ['completeness', 'readability', 'format'] } = req.body;
    
    const validation = await AIDocumentService.validateDocumentQuality(documentId, qualityChecks);
    
    res.json({
      success: true,
      message: 'Document quality validation completed',
      data: validation
    });
  } catch (error) {
    console.error('Document quality validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate document quality',
      error: error.message
    });
  }
});

module.exports = router;