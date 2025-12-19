const crypto = require('crypto');
const BlockchainRecord = require('../models/BlockchainRecord');
const { Op } = require('sequelize');

class BlockchainService {
  constructor() {
    this.networks = {
      ethereum: {
        name: 'Ethereum',
        chainId: 1,
        rpcUrl: process.env.ETHEREUM_RPC_URL,
        explorerUrl: 'https://etherscan.io'
      },
      polygon: {
        name: 'Polygon',
        chainId: 137,
        rpcUrl: process.env.POLYGON_RPC_URL,
        explorerUrl: 'https://polygonscan.com'
      },
      hyperledger: {
        name: 'Hyperledger Fabric',
        networkId: process.env.HYPERLEDGER_NETWORK_ID,
        connectionProfile: process.env.HYPERLEDGER_CONNECTION_PROFILE
      }
    };
  }

  /**
   * Store compliance record on blockchain
   * @param {Object} recordData - Record data to store
   * @returns {Promise<Object>} Blockchain transaction result
   */
  async storeComplianceRecord(recordData) {
    try {
      const {
        documentHash,
        recordType,
        recordTitle,
        recordDescription,
        complianceFramework,
        documentData,
        metadata = {},
        userId,
        institutionId
      } = recordData;

      // Generate unique transaction hash
      const transactionHash = this.generateTransactionHash();

      // Create blockchain record in database first
      const blockchainRecord = await BlockchainRecord.create({
        blockchainNetwork: 'ethereum', // Default network
        networkType: 'mainnet',
        transactionHash,
        recordType,
        recordTitle,
        recordDescription,
        documentHash,
        documentSize: documentData?.size || 0,
        documentType: documentData?.type || 'application/json',
        fileName: documentData?.name || 'compliance_record.json',
        complianceFramework,
        complianceCategory: metadata.category || 'general',
        regulationReference: metadata.regulationReference || null,
        blockchainStatus: 'pending',
        validationStatus: 'unverified',
        createdBy: userId,
        accessLevel: metadata.accessLevel || 'public',
        metadata,
        tags: metadata.tags || [],
        onChainData: {
          documentHash,
          recordType,
          complianceFramework,
          timestamp: new Date().toISOString(),
          metadata: {
            ...metadata,
            recordVersion: 1
          }
        },
        offChainDataHash: await this.calculateDataHash(documentData),
        offChainDataUrl: await this.storeOffChainData(documentData),
        version: 1,
        isActive: true
      });

      // Simulate blockchain transaction (in real implementation, use actual blockchain API)
      const blockchainResult = await this.submitToBlockchain(blockchainRecord);

      // Update record with blockchain information
      await blockchainRecord.update({
        blockHash: blockchainResult.blockHash,
        smartContractAddress: blockchainResult.contractAddress,
        blockTimestamp: blockchainResult.blockTimestamp,
        confirmedAt: blockchainResult.confirmedAt,
        gasUsed: blockchainResult.gasUsed,
        gasPrice: blockchainResult.gasPrice,
        transactionCost: blockchainResult.transactionCost,
        blockchainStatus: blockchainResult.status,
        nodeId: blockchainResult.nodeId,
        lastSyncAt: new Date()
      });

      return {
        success: true,
        transactionHash: blockchainRecord.transactionHash,
        blockHash: blockchainRecord.blockHash,
        recordId: blockchainRecord.id,
        status: blockchainResult.status,
        cost: blockchainResult.transactionCost,
        explorerUrl: this.getExplorerUrl(blockchainRecord.blockchainNetwork, blockchainRecord.transactionHash)
      };

    } catch (error) {
      console.error('Blockchain storage error:', error);
      throw new Error(`Failed to store compliance record on blockchain: ${error.message}`);
    }
  }

  /**
   * Verify blockchain record integrity
   * @param {string} transactionHash - Transaction hash to verify
   * @returns {Promise<Object>} Verification result
   */
  async verifyRecord(transactionHash) {
    try {
      const record = await BlockchainRecord.findByTransactionHash(transactionHash);
      
      if (!record) {
        return {
          verified: false,
          reason: 'Record not found'
        };
      }

      // Verify against blockchain
      const blockchainVerification = await this.verifyAgainstBlockchain(record);

      // Verify document integrity
      const documentIntegrity = await this.verifyDocumentIntegrity(record);

      // Update verification status
      const verificationScore = this.calculateVerificationScore(
        blockchainVerification,
        documentIntegrity,
        record
      );

      await record.update({
        validationStatus: verificationScore.overall > 80 ? 'verified' : 'disputed',
        verificationCount: record.verificationCount + 1,
        metadata: {
          ...record.metadata,
          lastVerification: {
            timestamp: new Date(),
            blockchainVerified: blockchainVerification.verified,
            documentIntegrity: documentIntegrity.integrity,
            score: verificationScore
          }
        }
      });

      return {
        verified: verificationScore.overall > 80,
        score: verificationScore,
        blockchainVerification,
        documentIntegrity,
        record: record.toJSON()
      };

    } catch (error) {
      console.error('Record verification error:', error);
      throw new Error(`Failed to verify record: ${error.message}`);
    }
  }

  /**
   * Get blockchain records for an institution
   * @param {string} institutionId - Institution ID
   * @param {Object} filters - Query filters
   * @returns {Promise<Object>} Paginated results
   */
  async getInstitutionRecords(institutionId, filters = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        recordType,
        complianceFramework,
        blockchainStatus,
        startDate,
        endDate,
        search
      } = filters;

      const whereClause = { institutionId };

      if (recordType) whereClause.recordType = recordType;
      if (complianceFramework) whereClause.complianceFramework = complianceFramework;
      if (blockchainStatus) whereClause.blockchainStatus = blockchainStatus;

      if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) whereClause.createdAt[Op.gte] = startDate;
        if (endDate) whereClause.createdAt[Op.lte] = endDate;
      }

      if (search) {
        whereClause[Op.or] = [
          { recordTitle: { [Op.iLike]: `%${search}%` } },
          { recordDescription: { [Op.iLike]: `%${search}%` } },
          { tags: { [Op.overlap]: [search] } }
        ];
      }

      const { rows, count } = await BlockchainRecord.findAndCountAll({
        where: whereClause,
        limit,
        offset: (page - 1) * limit,
        order: [['createdAt', 'DESC']],
        include: [{
          model: require('../models/User'),
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }]
      });

      return {
        records: rows,
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit)
        }
      };

    } catch (error) {
      console.error('Get institution records error:', error);
      throw new Error(`Failed to get institution records: ${error.message}`);
    }
  }

  /**
   * Get blockchain analytics and statistics
   * @param {string} institutionId - Institution ID
   * @param {string} period - Time period (30d, 90d, 1y)
   * @returns {Promise<Object>} Analytics data
   */
  async getBlockchainAnalytics(institutionId, period = '30d') {
    try {
      const startDate = this.getPeriodStartDate(period);

      // Get basic statistics
      const stats = await BlockchainRecord.findAll({
        where: {
          institutionId,
          createdAt: { [Op.gte]: startDate }
        },
        attributes: [
          'blockchainStatus',
          'validationStatus',
          'recordType',
          'complianceFramework',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('AVG', sequelize.col('verificationCount')), 'avgVerificationCount']
        ],
        group: ['blockchainStatus', 'validationStatus', 'recordType', 'complianceFramework']
      });

      // Get transaction cost analysis
      const costAnalysis = await BlockchainRecord.findAll({
        where: {
          institutionId,
          createdAt: { [Op.gte]: startDate },
          transactionCost: { [Op.not]: null }
        },
        attributes: [
          [sequelize.fn('SUM', sequelize.col('transactionCost')), 'totalCost'],
          [sequelize.fn('AVG', sequelize.col('transactionCost')), 'avgCost'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'transactionCount']
        ]
      });

      // Get monthly trends
      const trends = await this.getMonthlyTrends(institutionId, period);

      // Calculate verification scores
      const verificationScores = await this.getVerificationScoreDistribution(institutionId, period);

      return {
        summary: {
          totalRecords: stats.reduce((sum, stat) => sum + parseInt(stat.dataValues.count), 0),
          verifiedRecords: stats.filter(s => s.validationStatus === 'verified')
            .reduce((sum, s) => sum + parseInt(s.dataValues.count), 0),
          pendingRecords: stats.filter(s => s.blockchainStatus === 'pending')
            .reduce((sum, s) => sum + parseInt(s.dataValues.count), 0),
          averageVerificationCount: stats.length > 0 ? 
            stats.reduce((sum, s) => sum + parseFloat(s.dataValues.avgVerificationCount || 0), 0) / stats.length : 0
        },
        costAnalysis: costAnalysis[0]?.dataValues || {},
        trends,
        verificationScores,
        period,
        generatedAt: new Date()
      };

    } catch (error) {
      console.error('Blockchain analytics error:', error);
      throw new Error(`Failed to get blockchain analytics: ${error.message}`);
    }
  }

  /**
   * Sync blockchain records with actual blockchain
   * @param {string} institutionId - Institution ID
   * @returns {Promise<Object>} Sync results
   */
  async syncBlockchainRecords(institutionId) {
    try {
      const pendingRecords = await BlockchainRecord.findAll({
        where: {
          institutionId,
          blockchainStatus: 'pending'
        }
      });

      const results = {
        totalRecords: pendingRecords.length,
        successful: 0,
        failed: 0,
        errors: []
      };

      for (const record of pendingRecords) {
        try {
          const syncResult = await this.syncRecordWithBlockchain(record);
          
          if (syncResult.success) {
            await record.update({
              blockchainStatus: syncResult.status,
              blockHash: syncResult.blockHash,
              confirmedAt: syncResult.confirmedAt,
              lastSyncAt: new Date()
            });
            results.successful++;
          } else {
            results.failed++;
            results.errors.push({
              recordId: record.id,
              error: syncResult.error
            });
          }
        } catch (error) {
          results.failed++;
          results.errors.push({
            recordId: record.id,
            error: error.message
          });
        }
      }

      return results;

    } catch (error) {
      console.error('Blockchain sync error:', error);
      throw new Error(`Failed to sync blockchain records: ${error.message}`);
    }
  }

  // Private helper methods

  generateTransactionHash() {
    return '0x' + crypto.randomBytes(32).toString('hex');
  }

  async calculateDataHash(data) {
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    return crypto.createHash('sha256').update(dataString).digest('hex');
  }

  async storeOffChainData(data) {
    // Simulate IPFS or cloud storage
    // In real implementation, upload to IPFS, AWS S3, etc.
    const hash = await this.calculateDataHash(data);
    return `ipfs://${hash}`;
  }

  async submitToBlockchain(record) {
    // Simulate blockchain submission
    // In real implementation, use web3.js or ethers.js
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing time

    return {
      blockHash: '0x' + crypto.randomBytes(32).toString('hex'),
      contractAddress: '0x' + crypto.randomBytes(20).toString('hex'),
      blockTimestamp: new Date(),
      confirmedAt: new Date(),
      gasUsed: 21000n,
      gasPrice: 20000000000n, // 20 gwei
      transactionCost: 0.00042, // ETH
      status: 'confirmed',
      nodeId: 'node-' + crypto.randomBytes(8).toString('hex')
    };
  }

  async verifyAgainstBlockchain(record) {
    // Simulate blockchain verification
    // In real implementation, query blockchain explorer or node
    return {
      verified: true,
      blockNumber: Math.floor(Math.random() * 1000000) + 10000000,
      confirmations: Math.floor(Math.random() * 100) + 12,
      contractVerified: true
    };
  }

  async verifyDocumentIntegrity(record) {
    // Simulate document integrity verification
    return {
      integrity: true,
      originalHash: record.documentHash,
      currentHash: await this.calculateDataHash(record.offChainDataHash),
      timestampVerified: true
    };
  }

  calculateVerificationScore(blockchainVerification, documentIntegrity, record) {
    let score = 0;

    // Blockchain verification (40%)
    if (blockchainVerification.verified) score += 40;
    if (blockchainVerification.confirmations > 12) score += 10;

    // Document integrity (30%)
    if (documentIntegrity.integrity) score += 30;

    // Record age and verification count (20%)
    const ageInDays = (new Date() - record.createdAt) / (1000 * 60 * 60 * 24);
    score += Math.min(ageInDays * 0.2, 10);
    score += Math.min(record.verificationCount * 2, 10);

    // Validation status (10%)
    if (record.validationStatus === 'verified') score += 10;

    return {
      overall: Math.min(score, 100),
      breakdown: {
        blockchain: blockchainVerification.verified ? 40 : 0,
        document: documentIntegrity.integrity ? 30 : 0,
        age: Math.min(ageInDays * 0.2, 10),
        verification: Math.min(record.verificationCount * 2, 10),
        status: record.validationStatus === 'verified' ? 10 : 0
      }
    };
  }

  getPeriodStartDate(period) {
    const now = new Date();
    switch (period) {
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case '1y':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }

  async getMonthlyTrends(institutionId, period) {
    // Implementation for monthly trends
    return [];
  }

  async getVerificationScoreDistribution(institutionId, period) {
    // Implementation for verification score distribution
    return [];
  }

  async syncRecordWithBlockchain(record) {
    // Implementation for syncing individual record
    try {
      // Simulate blockchain query
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        success: true,
        status: 'confirmed',
        blockHash: '0x' + crypto.randomBytes(32).toString('hex'),
        confirmedAt: new Date()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  getExplorerUrl(network, transactionHash) {
    const explorers = {
      ethereum: 'https://etherscan.io/tx/',
      polygon: 'https://polygonscan.com/tx/',
      hyperledger: '#'
    };
    
    return (explorers[network] || '#') + transactionHash;
  }
}

module.exports = new BlockchainService();