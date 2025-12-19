const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AIDocument = sequelize.define('AIDocument', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  // Document Information
  fileName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Original file name'
  },
  
  filePath: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Path where document is stored'
  },
  
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'File size in bytes'
  },
  
  fileType: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'MIME type of the file'
  },
  
  documentType: {
    type: DataTypes.ENUM(
      'academic_transcript',
      'faculty_credentials',
      'infrastructure_report',
      'financial_statement',
      'accreditation_certificate',
      'compliance_document',
      'annual_report',
      'quality_assurance_report',
      'research_publication',
      'student_record',
      'faculty_degree',
      'institution_affiliation',
      'other'
    ),
    allowNull: false,
    comment: 'Type of document'
  },
  
  // AI Classification
  aiClassification: {
    type: DataTypes.JSON,
    comment: 'AI-generated classification results'
  },
  
  aiConfidence: {
    type: DataTypes.DECIMAL(5, 2),
    comment: 'AI confidence score for classification (0-100)'
  },
  
  aiModelVersion: {
    type: DataTypes.STRING,
    comment: 'Version of AI model used for classification'
  },
  
  // Extracted Content
  extractedText: {
    type: DataTypes.TEXT,
    comment: 'Text extracted from document using OCR'
  },
  
  extractedMetadata: {
    type: DataTypes.JSON,
    comment: 'Metadata extracted from document'
  },
  
  // Compliance Assessment
  complianceCheck: {
    type: DataTypes.JSON,
    comment: 'AI compliance checking results'
  },
  
  complianceScore: {
    type: DataTypes.DECIMAL(5, 2),
    comment: 'AI-generated compliance score (0-100)'
  },
  
  complianceIssues: {
    type: DataTypes.JSON,
    comment: 'JSON array of compliance issues identified'
  },
  
  complianceRecommendations: {
    type: DataTypes.JSON,
    comment: 'JSON array of AI recommendations'
  },
  
  // Entity Extraction
  extractedEntities: {
    type: DataTypes.JSON,
    comment: 'Named entities extracted from document'
  },
  
  keyFields: {
    type: DataTypes.JSON,
    comment: 'Key fields extracted (dates, amounts, names, etc.)'
  },
  
  // Document Quality
  qualityScore: {
    type: DataTypes.DECIMAL(5, 2),
    comment: 'Document quality score (0-100)'
  },
  
  readabilityScore: {
    type: DataTypes.DECIMAL(5, 2),
    comment: 'Text readability score (0-100)'
  },
  
  ocrAccuracy: {
    type: DataTypes.DECIMAL(5, 2),
    comment: 'OCR accuracy score (0-100)'
  },
  
  // Processing Status
  processingStatus: {
    type: DataTypes.ENUM('pending', 'uploaded', 'processing', 'completed', 'failed', 'review_required'),
    defaultValue: 'pending',
    comment: 'Current processing status'
  },
  
  processingStage: {
    type: DataTypes.ENUM('upload', 'validation', 'ocr', 'classification', 'compliance_check', 'entity_extraction', 'final_review'),
    comment: 'Current stage in processing pipeline'
  },
  
  // Related Entities
  institutionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Institutions',
      key: 'id'
    }
  },
  
  uploadedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  
  facultyId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Faculty',
      key: 'id'
    },
    comment: 'Associated faculty member (if applicable)'
  },
  
  // Validation and Verification
  isValidated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether document has been manually validated'
  },
  
  validatedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    },
    comment: 'User who validated the document'
  },
  
  validatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When document was validated'
  },
  
  validationNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notes from manual validation'
  },
  
  // Compliance Linking
  complianceVerificationId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'ComplianceVerifications',
      key: 'id'
    },
    comment: 'Associated compliance verification'
  },
  
  // Security and Access
  isEncrypted: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether document is encrypted'
  },
  
  accessLevel: {
    type: DataTypes.ENUM('public', 'institution', 'department', 'restricted'),
    defaultValue: 'institution',
    comment: 'Access level for the document'
  },
  
  checksum: {
    type: DataTypes.STRING,
    comment: 'File checksum for integrity verification'
  },
  
  // Processing Times
  uploadedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: 'When document was uploaded'
  },
  
  processingStartedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When AI processing started'
  },
  
  processingCompletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When AI processing completed'
  },
  
  totalProcessingTime: {
    type: DataTypes.INTEGER, // in seconds
    comment: 'Total time taken for AI processing'
  },
  
  // Error Handling
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Error message if processing failed'
  },
  
  errorCode: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Error code from processing'
  },
  
  retryCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of processing retry attempts'
  },
  
  maxRetries: {
    type: DataTypes.INTEGER,
    defaultValue: 3,
    comment: 'Maximum number of retries allowed'
  },
  
  // AI Learning and Feedback
  aiFeedback: {
    type: DataTypes.JSON,
    comment: 'Feedback on AI processing accuracy'
  },
  
  humanCorrections: {
    type: DataTypes.JSON,
    comment: 'Corrections made by humans to AI output'
  },
  
  accuracyRating: {
    type: DataTypes.INTEGER,
    validate: { min: 1, max: 5 },
    comment: 'Human rating of AI accuracy (1-5)'
  },
  
  // Metadata
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'Tags for document categorization'
  },
  
  customMetadata: {
    type: DataTypes.JSON,
    comment: 'Custom metadata as JSON'
  },
  
  // Version Control
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: 'Document version number'
  },
  
  parentDocumentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'AIDocuments',
      key: 'id'
    },
    comment: 'ID of parent document if this is a version'
  },
  
  // Soft Delete and Archive
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether document is active'
  },
  
  isArchived: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether document is archived'
  },
  
  archivedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When document was archived'
  }
}, {
  tableName: 'ai_documents',
  timestamps: true,
  indexes: [
    {
      fields: ['institutionId']
    },
    {
      fields: ['uploadedBy']
    },
    {
      fields: ['documentType']
    },
    {
      fields: ['processingStatus']
    },
    {
      fields: ['processingStage']
    },
    {
      fields: ['complianceVerificationId']
    },
    {
      fields: ['isValidated']
    },
    {
      name: 'document_type_status_idx',
      fields: ['documentType', 'processingStatus']
    },
    {
      name: 'document_compliance_idx',
      fields: ['complianceScore', 'processingStatus']
    }
  ]
});

// Instance methods
AIDocument.prototype.isProcessingComplete = function() {
  return this.processingStatus === 'completed';
};

AIDocument.prototype.needsReview = function() {
  return this.processingStatus === 'review_required' || 
         (this.isValidated === false && this.aiConfidence < 90);
};

AIDocument.prototype.canRetry = function() {
  return this.processingStatus === 'failed' && 
         this.retryCount < this.maxRetries;
};

AIDocument.prototype.getProcessingDuration = function() {
  if (!this.processingStartedAt || !this.processingCompletedAt) return null;
  
  const start = new Date(this.processingStartedAt);
  const end = new Date(this.processingCompletedAt);
  return Math.floor((end.getTime() - start.getTime()) / 1000); // in seconds
};

AIDocument.prototype.getQualityRating = function() {
  const weights = {
    qualityScore: 0.4,
    readabilityScore: 0.3,
    ocrAccuracy: 0.3
  };
  
  return (
    (this.qualityScore * weights.qualityScore) +
    (this.readabilityScore * weights.readabilityScore) +
    (this.ocrAccuracy * weights.ocrAccuracy)
  );
};

// Class methods
AIDocument.getPendingProcessing = function() {
  return this.findAll({
    where: {
      processingStatus: ['uploaded', 'processing'],
      isActive: true
    },
    order: [['uploadedAt', 'ASC']]
  });
};

AIDocument.getDocumentsNeedingReview = function(institutionId) {
  return this.findAll({
    where: {
      institutionId,
      isActive: true,
      [sequelize.Sequelize.Op.or]: [
        { processingStatus: 'review_required' },
        {
          [sequelize.Sequelize.Op.and]: [
            { isValidated: false },
            { aiConfidence: { [sequelize.Sequelize.Op.lt]: 90 } }
          ]
        }
      ]
    },
    order: [['uploadedAt', 'DESC']]
  });
};

AIDocument.getDocumentsByType = function(institutionId, documentType) {
  return this.findAll({
    where: {
      institutionId,
      documentType,
      isActive: true
    },
    order: [['uploadedAt', 'DESC']]
  });
};

AIDocument.getProcessingStats = function(institutionId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.findAll({
    where: {
      institutionId,
      uploadedAt: { [sequelize.Sequelize.Op.gte]: startDate },
      isActive: true
    },
    attributes: [
      [sequelize.Sequelize.fn('COUNT', sequelize.Sequelize.col('id')), 'totalDocuments'],
      [sequelize.Sequelize.fn('AVG', sequelize.Sequelize.col('aiConfidence')), 'avgConfidence'],
      [sequelize.Sequelize.fn('AVG', sequelize.Sequelize.col('complianceScore')), 'avgComplianceScore'],
      [sequelize.Sequelize.fn('COUNT', sequelize.Sequelize.literal('CASE WHEN processing_status = \'completed\' THEN 1 ELSE 0 END')), 'completed'],
      [sequelize.Sequelize.fn('COUNT', sequelize.Sequelize.literal('CASE WHEN processing_status = \'failed\' THEN 1 ELSE 0 END')), 'failed']
    ],
    raw: true
  });
};

module.exports = AIDocument;