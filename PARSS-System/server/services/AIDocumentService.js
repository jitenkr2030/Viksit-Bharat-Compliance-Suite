const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const Tesseract = require('tesseract.js');
const AIDocument = require('../models/AIDocument');
const { v4: uuidv4 } = require('uuid');

class AIDocumentService {
  constructor() {
    this.uploadPath = process.env.UPLOAD_PATH || './uploads';
    this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024; // 50MB
    this.supportedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/tiff',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    // Initialize upload configuration
    this.storage = multer.diskStorage({
      destination: async (req, file, cb) => {
        try {
          const uploadDir = path.join(this.uploadPath, 'documents');
          await fs.mkdir(uploadDir, { recursive: true });
          cb(null, uploadDir);
        } catch (error) {
          cb(error);
        }
      },
      filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}_${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
      }
    });

    this.upload = multer({
      storage: this.storage,
      limits: {
        fileSize: this.maxFileSize
      },
      fileFilter: (req, file, cb) => {
        if (this.supportedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Unsupported file type'), false);
        }
      }
    });
  }

  // Upload and process document
  async uploadDocument(file, uploadData) {
    try {
      // Create AI document record
      const aiDocument = await AIDocument.create({
        fileName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        fileType: file.mimetype,
        documentType: uploadData.documentType || 'other',
        institutionId: uploadData.institutionId,
        uploadedBy: uploadData.uploadedBy,
        facultyId: uploadData.facultyId,
        processingStatus: 'uploaded',
        uploadedAt: new Date()
      });

      // Start async processing
      this.processDocumentAsync(aiDocument.id);

      return aiDocument;
    } catch (error) {
      console.error('Document upload failed:', error);
      throw error;
    }
  }

  // Process document asynchronously
  async processDocumentAsync(documentId) {
    try {
      const document = await AIDocument.findByPk(documentId);
      if (!document) return;

      // Update status to processing
      document.processingStatus = 'processing';
      document.processingStartedAt = new Date();
      await document.save();

      // Step 1: Validate document
      await this.validateDocument(document);
      document.processingStage = 'validation';
      await document.save();

      // Step 2: Extract text using OCR
      await this.extractText(document);
      document.processingStage = 'ocr';
      await document.save();

      // Step 3: AI Classification
      await this.classifyDocument(document);
      document.processingStage = 'classification';
      await document.save();

      // Step 4: Compliance checking
      await this.checkCompliance(document);
      document.processingStage = 'compliance_check';
      await document.save();

      // Step 5: Entity extraction
      await this.extractEntities(document);
      document.processingStage = 'entity_extraction';
      await document.save();

      // Step 6: Final review
      await this.finalReview(document);
      document.processingStage = 'final_review';
      await document.save();

      // Mark as completed
      document.processingStatus = 'completed';
      document.processingCompletedAt = new Date();
      document.totalProcessingTime = Math.floor(
        (document.processingCompletedAt.getTime() - document.processingStartedAt.getTime()) / 1000
      );
      await document.save();

    } catch (error) {
      console.error('Document processing failed:', error);
      
      const document = await AIDocument.findByPk(documentId);
      if (document) {
        document.processingStatus = 'failed';
        document.errorMessage = error.message;
        document.errorCode = error.code || 'PROCESSING_ERROR';
        await document.save();
      }
    }
  }

  // Validate document
  async validateDocument(document) {
    try {
      // Check if file exists
      await fs.access(document.filePath);
      
      // Validate file type
      if (!this.supportedTypes.includes(document.fileType)) {
        throw new Error('Unsupported file type');
      }

      // Validate file size
      if (document.fileSize > this.maxFileSize) {
        throw new Error('File size exceeds limit');
      }

      // Generate checksum for integrity
      const checksum = await this.generateChecksum(document.filePath);
      document.checksum = checksum;

      document.qualityScore = 100; // Will be updated after processing
      await document.save();
    } catch (error) {
      throw new Error(`Document validation failed: ${error.message}`);
    }
  }

  // Extract text using OCR
  async extractText(document) {
    try {
      let extractedText = '';
      let ocrAccuracy = 100;

      if (document.fileType === 'application/pdf') {
        // Handle PDF text extraction
        const pdfText = await this.extractPdfText(document.filePath);
        extractedText = pdfText.text;
        ocrAccuracy = pdfText.accuracy || 95;
      } else if (document.fileType.startsWith('image/')) {
        // Handle image OCR
        const ocrResult = await Tesseract.recognize(document.filePath, 'eng', {
          logger: m => console.log(m)
        });
        extractedText = ocrResult.data.text;
        ocrAccuracy = ocrResult.data.confidence;
      }

      document.extractedText = extractedText.trim();
      document.ocrAccuracy = ocrAccuracy;
      
      // Calculate readability score
      document.readabilityScore = this.calculateReadabilityScore(extractedText);
      
      await document.save();
    } catch (error) {
      throw new Error(`Text extraction failed: ${error.message}`);
    }
  }

  // Extract text from PDF
  async extractPdfText(filePath) {
    try {
      // This would typically use a PDF parsing library like pdf-parse
      // For now, return mock data
      return {
        text: 'Sample extracted text from PDF document...',
        accuracy: 95
      };
    } catch (error) {
      throw new Error('PDF text extraction failed');
    }
  }

  // AI Classification
  async classifyDocument(document) {
    try {
      // This would typically use a machine learning model
      // For now, implement rule-based classification
      
      const text = document.extractedText.toLowerCase();
      const classification = this.ruleBasedClassification(text);
      
      document.aiClassification = classification;
      document.aiConfidence = classification.confidence;
      document.aiModelVersion = '1.0.0';
      
      // Update document type if AI classification is confident
      if (classification.confidence > 80) {
        document.documentType = classification.predictedType;
      }
      
      await document.save();
    } catch (error) {
      throw new Error(`AI classification failed: ${error.message}`);
    }
  }

  // Rule-based document classification
  ruleBasedClassification(text) {
    const patterns = {
      academic_transcript: ['transcript', 'grades', 'semester', 'cgpa', 'gpa'],
      faculty_credentials: ['faculty', 'teacher', 'qualification', 'degree', 'certification'],
      infrastructure_report: ['infrastructure', 'building', 'facility', 'equipment'],
      financial_statement: ['financial', 'balance', 'revenue', 'expense', 'audit'],
      accreditation_certificate: ['accreditation', 'certified', 'approved', 'recognized'],
      compliance_document: ['compliance', 'regulation', 'requirement', 'standard']
    };

    let bestMatch = { type: 'other', confidence: 0, matchedKeywords: [] };
    
    for (const [type, keywords] of Object.entries(patterns)) {
      const matches = keywords.filter(keyword => text.includes(keyword));
      if (matches.length > 0) {
        const confidence = (matches.length / keywords.length) * 100;
        if (confidence > bestMatch.confidence) {
          bestMatch = {
            type,
            confidence,
            matchedKeywords: matches
          };
        }
      }
    }

    return {
      predictedType: bestMatch.type,
      confidence: Math.round(bestMatch.confidence),
      matchedKeywords: bestMatch.matchedKeywords,
      method: 'rule_based'
    };
  }

  // Compliance checking
  async checkCompliance(document) {
    try {
      const complianceRules = this.getComplianceRules(document.documentType);
      const text = document.extractedText;
      
      const issues = [];
      const recommendations = [];
      let complianceScore = 100;

      // Check for required fields
      for (const rule of complianceRules) {
        const isCompliant = this.checkComplianceRule(text, rule);
        if (!isCompliant) {
          issues.push({
            rule: rule.name,
            description: rule.description,
            severity: rule.severity || 'medium'
          });
          complianceScore -= rule.penalty || 10;
          
          recommendations.push({
            rule: rule.name,
            suggestion: rule.suggestion
          });
        }
      }

      document.complianceCheck = {
        rules: complianceRules,
        issues,
        recommendations,
        checkedAt: new Date()
      };

      document.complianceScore = Math.max(0, complianceScore);
      document.complianceIssues = issues;
      document.complianceRecommendations = recommendations;
      
      await document.save();
    } catch (error) {
      throw new Error(`Compliance checking failed: ${error.message}`);
    }
  }

  // Get compliance rules for document type
  getComplianceRules(documentType) {
    const ruleSets = {
      academic_transcript: [
        {
          name: 'student_information',
          description: 'Student name and ID should be present',
          severity: 'high',
          penalty: 20,
          suggestion: 'Ensure student name and ID are clearly visible',
          check: (text) => /(student|name|id|roll)/i.test(text)
        },
        {
          name: 'institution_details',
          description: 'Institution name and seal should be present',
          severity: 'high',
          penalty: 15,
          suggestion: 'Include institution name and official seal',
          check: (text) => /(university|college|institution|seal)/i.test(text)
        }
      ],
      faculty_credentials: [
        {
          name: 'qualification_details',
          description: 'Educational qualifications should be clearly stated',
          severity: 'high',
          penalty: 20,
          suggestion: 'List all educational qualifications with degrees',
          check: (text) => /(degree|bachelor|master|phd|qualification)/i.test(text)
        },
        {
          name: 'experience_details',
          description: 'Teaching experience should be documented',
          severity: 'medium',
          penalty: 10,
          suggestion: 'Include years of teaching experience',
          check: (text) => /(experience|years|teaching)/i.test(text)
        }
      ],
      compliance_document: [
        {
          name: 'regulation_reference',
          description: 'Should reference relevant regulations',
          severity: 'high',
          penalty: 15,
          suggestion: 'Include specific regulation references',
          check: (text) => /(regulation|act|rule|section|ugc|aicte|naac)/i.test(text)
        }
      ]
    };

    return ruleSets[documentType] || [];
  }

  // Check individual compliance rule
  checkComplianceRule(text, rule) {
    try {
      return rule.check(text);
    } catch (error) {
      return false;
    }
  }

  // Extract entities from document
  async extractEntities(document) {
    try {
      const text = document.extractedText;
      const entities = this.extractNamedEntities(text);
      const keyFields = this.extractKeyFields(text);
      
      document.extractedEntities = entities;
      document.keyFields = keyFields;
      
      await document.save();
    } catch (error) {
      throw new Error(`Entity extraction failed: ${error.message}`);
    }
  }

  // Extract named entities
  extractNamedEntities(text) {
    const entities = {
      persons: this.extractPersonNames(text),
      organizations: this.extractOrganizations(text),
      dates: this.extractDates(text),
      amounts: this.extractAmounts(text),
      locations: this.extractLocations(text)
    };

    return entities;
  }

  // Extract person names
  extractPersonNames(text) {
    // Simple pattern matching for names (capitalized words)
    const namePattern = /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g;
    return [...new Set(text.match(namePattern) || [])];
  }

  // Extract organizations
  extractOrganizations(text) {
    const orgPatterns = [
      /\b(University|College|Institute|School)\b[^\n]*/gi,
      /\b[A-Z][a-z]+ (University|College|Institute)\b/gi
    ];
    
    const organizations = [];
    for (const pattern of orgPatterns) {
      const matches = text.match(pattern);
      if (matches) organizations.push(...matches);
    }
    
    return [...new Set(organizations)];
  }

  // Extract dates
  extractDates(text) {
    const datePatterns = [
      /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g,  // DD/MM/YYYY
      /\b\d{1,2}-\d{1,2}-\d{4}\b/g,   // DD-MM-YYYY
      /\b\d{4}-\d{1,2}-\d{1,2}\b/g,   // YYYY-MM-DD
      /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi
    ];
    
    const dates = [];
    for (const pattern of datePatterns) {
      const matches = text.match(pattern);
      if (matches) dates.push(...matches);
    }
    
    return [...new Set(dates)];
  }

  // Extract monetary amounts
  extractAmounts(text) {
    const amountPattern = /[₹$£€]\s?[\d,]+\.?\d*/g;
    const percentagePattern = /\d+\.?\d*%/g;
    
    const amounts = text.match(amountPattern) || [];
    const percentages = text.match(percentagePattern) || [];
    
    return [...new Set([...amounts, ...percentages])];
  }

  // Extract locations
  extractLocations(text) {
    const locationPattern = /\b[A-Z][a-z]+,\s*[A-Z][a-z]+\b/g;
    return [...new Set(text.match(locationPattern) || [])];
  }

  // Extract key fields
  extractKeyFields(text) {
    const fields = {};
    
    // Extract dates
    const dates = this.extractDates(text);
    if (dates.length > 0) fields.dates = dates;
    
    // Extract amounts
    const amounts = this.extractAmounts(text);
    if (amounts.length > 0) fields.amounts = amounts;
    
    // Extract registration numbers or IDs
    const idPattern = /\b[A-Z]{2,}\d{4,}\b/g;
    const ids = text.match(idPattern);
    if (ids) fields.identifiers = [...new Set(ids)];
    
    return fields;
  }

  // Final review and quality assessment
  async finalReview(document) {
    try {
      // Calculate overall quality score
      const qualityScore = this.calculateQualityScore(document);
      document.qualityScore = qualityScore;

      // Determine if manual review is needed
      const needsReview = this.needsManualReview(document);
      if (needsReview) {
        document.processingStatus = 'review_required';
      }

      await document.save();
    } catch (error) {
      throw new Error(`Final review failed: ${error.message}`);
    }
  }

  // Calculate document quality score
  calculateQualityScore(document) {
    const weights = {
      ocrAccuracy: 0.4,
      readabilityScore: 0.3,
      aiConfidence: 0.2,
      complianceScore: 0.1
    };

    return (
      (document.ocrAccuracy * weights.ocrAccuracy) +
      (document.readabilityScore * weights.readabilityScore) +
      (document.aiConfidence * weights.aiConfidence) +
      (document.complianceScore * weights.complianceScore)
    );
  }

  // Calculate readability score
  calculateReadabilityScore(text) {
    if (!text || text.length < 10) return 0;

    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).length;
    const avgWordsPerSentence = words / sentences;
    
    // Simple readability score (0-100)
    const score = Math.max(0, Math.min(100, 100 - (avgWordsPerSentence - 15) * 2));
    return Math.round(score);
  }

  // Check if manual review is needed
  needsManualReview(document) {
    return (
      document.aiConfidence < 80 ||
      document.ocrAccuracy < 70 ||
      document.complianceScore < 60 ||
      document.extractedText.length < 50
    );
  }

  // Generate file checksum
  async generateChecksum(filePath) {
    try {
      const data = await fs.readFile(filePath);
      return crypto.createHash('sha256').update(data).digest('hex');
    } catch (error) {
      throw new Error('Failed to generate checksum');
    }
  }

  // Validate document manually
  async validateDocument(documentId, validatorId, validationData) {
    try {
      const document = await AIDocument.findByPk(documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      document.isValidated = true;
      document.validatedBy = validatorId;
      document.validatedAt = new Date();
      document.validationNotes = validationData.notes;
      
      // Update AI results based on human validation
      if (validationData.corrections) {
        document.humanCorrections = validationData.corrections;
      }

      if (validationData.accuracyRating) {
        document.accuracyRating = validationData.accuracyRating;
        document.aiFeedback = {
          accuracyRating: validationData.accuracyRating,
          feedback: validationData.feedback,
          validatedAt: new Date()
        };
      }

      await document.save();
      return document;
    } catch (error) {
      throw new Error(`Document validation failed: ${error.message}`);
    }
  }

  // Get documents requiring review
  async getDocumentsRequiringReview(institutionId) {
    return await AIDocument.getDocumentsNeedingReview(institutionId);
  }

  // Get processing statistics
  async getProcessingStats(institutionId, days = 30) {
    return await AIDocument.getProcessingStats(institutionId, days);
  }

  // Batch process documents
  async batchProcessDocuments(documentIds) {
    const results = {
      successful: 0,
      failed: 0,
      errors: []
    };

    for (const documentId of documentIds) {
      try {
        await this.processDocumentAsync(documentId);
        results.successful++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          documentId,
          error: error.message
        });
      }
    }

    return results;
  }
}

module.exports = new AIDocumentService();