const express = require('express');
const router = express.Router();
const BlockchainService = require('../services/BlockchainService');
const BlockchainRecord = require('../models/BlockchainRecord');

// Store compliance record on blockchain
router.post('/store-record', async (req, res) => {
  try {
    const {
      documentHash,
      recordType,
      recordTitle,
      recordDescription,
      complianceFramework,
      documentData,
      metadata = {},
      institutionId
    } = req.body;

    if (!documentHash || !recordType || !recordTitle || !complianceFramework) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: documentHash, recordType, recordTitle, complianceFramework'
      });
    }

    const result = await BlockchainService.storeComplianceRecord({
      documentHash,
      recordType,
      recordTitle,
      recordDescription,
      complianceFramework,
      documentData,
      metadata,
      userId: req.user.id,
      institutionId
    });

    res.json({
      success: true,
      message: 'Compliance record stored on blockchain successfully',
      data: result
    });
  } catch (error) {
    console.error('Store blockchain record error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to store record on blockchain',
      error: error.message
    });
  }
});

// Verify blockchain record
router.post('/verify-record/:transactionHash', async (req, res) => {
  try {
    const { transactionHash } = req.params;

    if (!transactionHash) {
      return res.status(400).json({
        success: false,
        message: 'Transaction hash is required'
      });
    }

    const result = await BlockchainService.verifyRecord(transactionHash);

    res.json({
      success: true,
      message: 'Record verification completed',
      data: result
    });
  } catch (error) {
    console.error('Verify blockchain record error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify record',
      error: error.message
    });
  }
});

// Get institution blockchain records
router.get('/records/:institutionId', async (req, res) => {
  try {
    const { institutionId } = req.params;
    const {
      page = 1,
      limit = 20,
      recordType,
      complianceFramework,
      blockchainStatus,
      startDate,
      endDate,
      search
    } = req.query;

    const filters = {
      page: parseInt(page),
      limit: parseInt(limit),
      recordType,
      complianceFramework,
      blockchainStatus,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      search
    };

    const result = await BlockchainService.getInstitutionRecords(institutionId, filters);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get blockchain records error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get blockchain records',
      error: error.message
    });
  }
});

// Get blockchain analytics
router.get('/analytics/:institutionId', async (req, res) => {
  try {
    const { institutionId } = req.params;
    const { period = '30d' } = req.query;

    const analytics = await BlockchainService.getBlockchainAnalytics(institutionId, period);

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Get blockchain analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get blockchain analytics',
      error: error.message
    });
  }
});

// Sync blockchain records
router.post('/sync/:institutionId', async (req, res) => {
  try {
    const { institutionId } = req.params;

    const result = await BlockchainService.syncBlockchainRecords(institutionId);

    res.json({
      success: true,
      message: 'Blockchain sync completed',
      data: result
    });
  } catch (error) {
    console.error('Sync blockchain records error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync blockchain records',
      error: error.message
    });
  }
});

// Get record by transaction hash
router.get('/record-by-hash/:transactionHash', async (req, res) => {
  try {
    const { transactionHash } = req.params;

    const record = await BlockchainRecord.findByTransactionHash(transactionHash);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }

    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    console.error('Get record by hash error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get record',
      error: error.message
    });
  }
});

// Get records by document hash
router.get('/records-by-document/:documentHash', async (req, res) => {
  try {
    const { documentHash } = req.params;

    const records = await BlockchainRecord.findByDocumentHash(documentHash);

    res.json({
      success: true,
      data: records
    });
  } catch (error) {
    console.error('Get records by document hash error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get records by document hash',
      error: error.message
    });
  }
});

// Search blockchain records
router.post('/search', async (req, res) => {
  try {
    const {
      query,
      recordType,
      complianceFramework,
      blockchainNetwork,
      limit = 50,
      offset = 0
    } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const result = await BlockchainRecord.searchRecords(query, {
      recordType,
      complianceFramework,
      blockchainNetwork,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Search blockchain records error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search records',
      error: error.message
    });
  }
});

// Get verification statistics
router.get('/verification-stats', async (req, res) => {
  try {
    const stats = await BlockchainRecord.getVerificationStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get verification stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get verification statistics',
      error: error.message
    });
  }
});

// Get blockchain networks
router.get('/networks', async (req, res) => {
  try {
    const networks = [
      {
        id: 'ethereum',
        name: 'Ethereum',
        chainId: 1,
        status: 'active',
        description: 'Main Ethereum network for production blockchain records'
      },
      {
        id: 'polygon',
        name: 'Polygon',
        chainId: 137,
        status: 'active',
        description: 'Polygon network for faster and cheaper transactions'
      },
      {
        id: 'hyperledger',
        name: 'Hyperledger Fabric',
        networkId: 'fabric-v2.4',
        status: 'active',
        description: 'Private blockchain network for enterprise use'
      }
    ];

    res.json({
      success: true,
      data: networks
    });
  } catch (error) {
    console.error('Get blockchain networks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get blockchain networks',
      error: error.message
    });
  }
});

// Get record details
router.get('/record/:recordId', async (req, res) => {
  try {
    const { recordId } = req.params;

    const record = await BlockchainRecord.findByPk(recordId);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }

    // Calculate verification score
    const verificationScore = record.getVerificationScore();

    res.json({
      success: true,
      data: {
        ...record.toJSON(),
        verificationScore,
        isValid: record.isValid(),
        integrityHash: record.getIntegrityHash()
      }
    });
  } catch (error) {
    console.error('Get record details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get record details',
      error: error.message
    });
  }
});

// Update record metadata
router.put('/record/:recordId', async (req, res) => {
  try {
    const { recordId } = req.params;
    const { metadata, tags } = req.body;

    const record = await BlockchainRecord.findByPk(recordId);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }

    const updateData = {};
    if (metadata) updateData.metadata = metadata;
    if (tags) updateData.tags = tags;

    await record.update(updateData);

    res.json({
      success: true,
      message: 'Record metadata updated successfully',
      data: record
    });
  } catch (error) {
    console.error('Update record metadata error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update record metadata',
      error: error.message
    });
  }
});

// Archive record
router.post('/archive/:recordId', async (req, res) => {
  try {
    const { recordId } = req.params;

    const record = await BlockchainRecord.findByPk(recordId);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }

    await record.update({
      isArchived: true,
      isActive: false
    });

    res.json({
      success: true,
      message: 'Record archived successfully'
    });
  } catch (error) {
    console.error('Archive record error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to archive record',
      error: error.message
    });
  }
});

// Get blockchain health status
router.get('/health', async (req, res) => {
  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        blockchain_networks: {
          ethereum: 'active',
          polygon: 'active',
          hyperledger: 'active'
        },
        ipfs: 'connected',
        smart_contracts: 'deployed'
      },
      metrics: {
        total_records: await BlockchainRecord.count(),
        pending_records: await BlockchainRecord.count({ where: { blockchainStatus: 'pending' } }),
        verified_records: await BlockchainRecord.count({ where: { validationStatus: 'verified' } }),
        average_verification_time: '2.5s'
      }
    };

    res.json({
      success: true,
      data: healthStatus
    });
  } catch (error) {
    console.error('Get blockchain health error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get blockchain health status',
      error: error.message
    });
  }
});

// Export records
router.post('/export/:institutionId', async (req, res) => {
  try {
    const { institutionId } = req.params;
    const { 
      format = 'json',
      startDate,
      endDate,
      recordTypes = [],
      complianceFrameworks = []
    } = req.body;

    const filters = {
      institutionId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      recordType: recordTypes.length > 0 ? { [Op.in]: recordTypes } : undefined,
      complianceFramework: complianceFrameworks.length > 0 ? { [Op.in]: complianceFrameworks } : undefined
    };

    const records = await BlockchainRecord.findAll({
      where: filters,
      order: [['createdAt', 'DESC']]
    });

    // Format export data
    const exportData = records.map(record => ({
      id: record.id,
      transactionHash: record.transactionHash,
      recordType: record.recordType,
      recordTitle: record.recordTitle,
      complianceFramework: record.complianceFramework,
      blockchainStatus: record.blockchainStatus,
      validationStatus: record.validationStatus,
      documentHash: record.documentHash,
      blockTimestamp: record.blockTimestamp,
      createdAt: record.createdAt,
      verificationScore: record.getVerificationScore(),
      explorerUrl: BlockchainService.getExplorerUrl(record.blockchainNetwork, record.transactionHash)
    }));

    res.json({
      success: true,
      message: 'Records exported successfully',
      data: {
        format,
        recordCount: exportData.length,
        exportedAt: new Date(),
        records: exportData
      }
    });
  } catch (error) {
    console.error('Export blockchain records error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export records',
      error: error.message
    });
  }
});

// Get compliance framework statistics
router.get('/framework-stats', async (req, res) => {
  try {
    const stats = await BlockchainRecord.findAll({
      attributes: [
        'complianceFramework',
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalRecords'],
        [sequelize.fn('AVG', sequelize.col('verificationCount')), 'avgVerifications']
      ],
      group: ['complianceFramework'],
      order: [[sequelize.literal('totalRecords'), 'DESC']]
    });

    const frameworkStats = stats.map(stat => ({
      framework: stat.complianceFramework,
      totalRecords: parseInt(stat.dataValues.totalRecords),
      averageVerifications: parseFloat(stat.dataValues.avgVerifications || 0)
    }));

    res.json({
      success: true,
      data: frameworkStats
    });
  } catch (error) {
    console.error('Get framework stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get framework statistics',
      error: error.message
    });
  }
});

// ========================================
// CLIENT-COMPATIBLE ENDPOINTS
// ========================================

// Get blockchain records (client-compatible)
router.get('/records', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      dataType,
      networkType,
      isVerified,
      startDate,
      endDate
    } = req.query;

    const filters = {
      ...(dataType && { dataType }),
      ...(networkType && { networkType }),
      ...(isVerified !== undefined && { isVerified: isVerified === 'true' }),
      ...(startDate && { startDate: new Date(startDate) }),
      ...(endDate && { endDate: new Date(endDate) })
    };

    const records = await BlockchainRecord.findAndCountAll({
      where: filters,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      records: records.rows,
      total: records.count,
      page: parseInt(page),
      totalPages: Math.ceil(records.count / parseInt(limit))
    });
  } catch (error) {
    console.error('Get blockchain records error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get blockchain records',
      error: error.message
    });
  }
});

// Get single blockchain record (client-compatible)
router.get('/records/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const record = await BlockchainRecord.findByPk(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Blockchain record not found'
      });
    }

    res.json(record);
  } catch (error) {
    console.error('Get blockchain record error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get blockchain record',
      error: error.message
    });
  }
});

// Create blockchain record (client-compatible)
router.post('/records', async (req, res) => {
  try {
    const {
      dataType,
      data,
      metadata,
      networkType = 'testnet'
    } = req.body;

    if (!dataType || !data) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: dataType, data'
      });
    }

    const record = await BlockchainRecord.create({
      dataType,
      data,
      metadata,
      networkType,
      isVerified: false
    });

    res.status(201).json(record);
  } catch (error) {
    console.error('Create blockchain record error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create blockchain record',
      error: error.message
    });
  }
});

// Update blockchain record (client-compatible)
router.put('/records/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const record = await BlockchainRecord.findByPk(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Blockchain record not found'
      });
    }

    await record.update(updates);
    res.json(record);
  } catch (error) {
    console.error('Update blockchain record error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update blockchain record',
      error: error.message
    });
  }
});

// Verify blockchain record (client-compatible)
router.post('/records/:id/verify', async (req, res) => {
  try {
    const { id } = req.params;

    const record = await BlockchainRecord.findByPk(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Blockchain record not found'
      });
    }

    // Simulate verification process
    const verified = Math.random() > 0.3; // 70% success rate for demo
    const blockNumber = verified ? Math.floor(Math.random() * 1000000) : null;

    await record.update({
      isVerified: verified,
      ...(verified && { blockNumber })
    });

    res.json({
      verified,
      ...(verified && { blockNumber })
    });
  } catch (error) {
    console.error('Verify blockchain record error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify blockchain record',
      error: error.message
    });
  }
});

// Get blockchain transactions (client-compatible)
router.get('/transactions', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      startDate,
      endDate
    } = req.query;

    // Mock transaction data for demo
    const transactions = Array.from({ length: parseInt(limit) }, (_, i) => ({
      id: `tx_${Date.now()}_${i}`,
      hash: `0x${Math.random().toString(16).substr(2, 64)}`,
      from: `0x${Math.random().toString(16).substr(2, 40)}`,
      to: `0x${Math.random().toString(16).substr(2, 40)}`,
      value: (Math.random() * 10).toFixed(4),
      gasUsed: (Math.floor(Math.random() * 21000) + 21000).toString(),
      gasPrice: '20',
      blockNumber: Math.floor(Math.random() * 1000000),
      status: ['pending', 'confirmed', 'failed'][Math.floor(Math.random() * 3)],
      timestamp: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
      confirmations: Math.floor(Math.random() * 100)
    }));

    res.json({
      transactions,
      total: 100, // Mock total
      page: parseInt(page),
      totalPages: 10 // Mock total pages
    });
  } catch (error) {
    console.error('Get blockchain transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get blockchain transactions',
      error: error.message
    });
  }
});

// Get blockchain analytics (client-compatible)
router.get('/analytics', async (req, res) => {
  try {
    const { period } = req.query;

    // Mock analytics data
    const analytics = {
      totalRecords: 1250,
      recordsByType: {
        compliance: 450,
        accreditation: 320,
        regulatory: 280,
        standards: 200
      },
      transactionVolume: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
        count: Math.floor(Math.random() * 50) + 10
      })),
      networkStats: {
        testnet: { records: 800, transactions: 1200 },
        mainnet: { records: 450, transactions: 750 }
      }
    };

    res.json(analytics);
  } catch (error) {
    console.error('Get blockchain analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get blockchain analytics',
      error: error.message
    });
  }
});

module.exports = router;