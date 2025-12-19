const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BlockchainRecord = sequelize.define('BlockchainRecord', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  
  // Blockchain Information
  blockchainNetwork: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Blockchain network (e.g., Ethereum, Polygon, Hyperledger)',
  },
  networkType: {
    type: DataTypes.ENUM('mainnet', 'testnet', 'private'),
    allowNull: false,
    defaultValue: 'mainnet',
  },
  blockHash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Hash of the block containing this record',
  },
  transactionHash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Hash of the blockchain transaction',
  },
  smartContractAddress: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Address of the smart contract (if applicable)',
  },
  
  // Record Metadata
  recordType: {
    type: DataTypes.ENUM(
      'compliance_document',
      'audit_trail',
      'certification',
      'approval',
      'violation_record',
      'remediation_action',
      'compliance_report',
      'stakeholder_agreement'
    ),
    allowNull: false,
    comment: 'Type of compliance record stored on blockchain',
  },
  recordTitle: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'Title or description of the record',
  },
  recordDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Detailed description of the record',
  },
  
  // Document Information
  documentHash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Hash of the original document for integrity verification',
  },
  documentSize: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Size of the original document in bytes',
  },
  documentType: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'MIME type of the original document',
  },
  fileName: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Original filename of the document',
  },
  
  // Blockchain Data Storage
  onChainData: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Data stored directly on the blockchain',
  },
  offChainDataHash: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Hash of data stored off-chain (IPFS, etc.)',
  },
  offChainDataUrl: {
    type: DataTypes.STRING(1000),
    allowNull: true,
    comment: 'URL to off-chain stored data (IPFS, cloud storage)',
  },
  
  // Compliance Context
  complianceFramework: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Applicable compliance framework (UGC, AICTE, NAAC, etc.)',
  },
  complianceCategory: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Category within the compliance framework',
  },
  regulationReference: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Reference to specific regulation or requirement',
  },
  
  // Status and Validation
  blockchainStatus: {
    type: DataTypes.ENUM('pending', 'confirmed', 'failed', 'rolled_back'),
    allowNull: false,
    defaultValue: 'pending',
    comment: 'Status of blockchain transaction',
  },
  validationStatus: {
    type: DataTypes.ENUM('unverified', 'verified', 'disputed', 'expired'),
    allowNull: false,
    defaultValue: 'unverified',
    comment: 'Validation status of the record',
  },
  verificationCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of independent verifications',
  },
  
  // Timestamps
  blockTimestamp: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Timestamp when record was added to blockchain',
  },
  confirmedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When the transaction was confirmed',
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When this record expires (if applicable)',
  },
  
  // Cost and Gas Information
  gasUsed: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: 'Gas used for the blockchain transaction',
  },
  gasPrice: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: 'Gas price in wei',
  },
  transactionCost: {
    type: DataTypes.DECIMAL(18, 8),
    allowNull: true,
    comment: 'Total cost of the transaction in native currency',
  },
  
  // Audit and Access Control
  createdBy: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'User ID who created this record',
  },
  accessLevel: {
    type: DataTypes.ENUM('public', 'restricted', 'confidential', 'private'),
    defaultValue: 'public',
    comment: 'Access level for this record',
  },
  immutableFlag: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether this record is immutable',
  },
  
  // Additional Metadata
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Additional metadata as JSON',
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'Tags for categorization and search',
  },
  
  // Digital Signature
  digitalSignature: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Digital signature of the record',
  },
  signatureAlgorithm: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Algorithm used for digital signature',
  },
  
  // Version Control
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: 'Version number of the record',
  },
  parentRecordId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'ID of parent record for versioning',
  },
  
  // Verification and Consensus
  consensusMechanism: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Consensus mechanism used (PoW, PoS, etc.)',
  },
  nodeId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'ID of the blockchain node that processed this',
  },
  
  // Cross-chain Information
  crossChainData: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Data related to cross-chain operations',
  },
  
  // Sync and Replication
  replicationCount: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: 'Number of blockchain networks this record is replicated on',
  },
  lastSyncAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Last synchronization timestamp',
  },
  
  // Status Flags
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether this record is currently active',
  },
  isArchived: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether this record has been archived',
  },
  
}, {
  tableName: 'blockchain_records',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  
  indexes: [
    {
      fields: ['blockchainNetwork', 'networkType'],
    },
    {
      fields: ['transactionHash'],
      unique: true,
    },
    {
      fields: ['documentHash'],
    },
    {
      fields: ['recordType'],
    },
    {
      fields: ['complianceFramework'],
    },
    {
      fields: ['blockchainStatus'],
    },
    {
      fields: ['validationStatus'],
    },
    {
      fields: ['createdAt'],
    },
    {
      fields: ['blockTimestamp'],
    },
    {
      fields: ['tags'],
      using: 'gin',
    },
    {
      fields: ['offChainDataHash'],
    },
  ],
});

// Instance methods
BlockchainRecord.prototype.getVerificationScore = function() {
  // Calculate verification score based on various factors
  let score = 0;
  
  // Base score for confirmation
  if (this.blockchainStatus === 'confirmed') score += 50;
  
  // Additional points for verification count
  score += Math.min(this.verificationCount * 10, 30);
  
  // Points for age (older records are more trusted)
  const ageInDays = (new Date() - this.createdAt) / (1000 * 60 * 60 * 24);
  score += Math.min(ageInDays * 0.5, 20);
  
  return Math.min(score, 100);
};

BlockchainRecord.prototype.isValid = function() {
  // Check if record is still valid
  if (this.blockchainStatus !== 'confirmed') return false;
  if (this.expiresAt && new Date() > this.expiresAt) return false;
  if (this.isArchived) return false;
  return true;
};

BlockchainRecord.prototype.getIntegrityHash = function() {
  // Generate hash for integrity verification
  const crypto = require('crypto');
  const data = JSON.stringify({
    documentHash: this.documentHash,
    recordType: this.recordType,
    complianceFramework: this.complianceFramework,
    createdAt: this.createdAt,
    createdBy: this.createdBy,
  });
  return crypto.createHash('sha256').update(data).digest('hex');
};

// Class methods
BlockchainRecord.findByTransactionHash = function(hash) {
  return this.findOne({
    where: { transactionHash: hash }
  });
};

BlockchainRecord.findByDocumentHash = function(hash) {
  return this.findAll({
    where: { documentHash: hash },
    order: [['createdAt', 'DESC']]
  });
};

BlockchainRecord.getVerificationStats = async function() {
  const stats = await this.findAll({
    attributes: [
      'blockchainStatus',
      'validationStatus',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: ['blockchainStatus', 'validationStatus']
  });
  return stats;
};

BlockchainRecord.searchRecords = async function(query, options = {}) {
  const { 
    recordType, 
    complianceFramework, 
    blockchainNetwork, 
    limit = 50, 
    offset = 0 
  } = options;
  
  const whereClause = {};
  
  if (query) {
    whereClause.$or = [
      { recordTitle: { $like: `%${query}%` } },
      { recordDescription: { $like: `%${query}%` } },
      { tags: { $overlap: [query] } }
    ];
  }
  
  if (recordType) whereClause.recordType = recordType;
  if (complianceFramework) whereClause.complianceFramework = complianceFramework;
  if (blockchainNetwork) whereClause.blockchainNetwork = blockchainNetwork;
  
  return this.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    order: [['createdAt', 'DESC']]
  });
};

module.exports = BlockchainRecord;