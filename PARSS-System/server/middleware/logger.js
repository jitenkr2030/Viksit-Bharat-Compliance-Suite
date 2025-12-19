const winston = require('winston');
const { v4: uuidv4 } = require('uuid');

// Configure logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'viksit-bharat-api' },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  const requestId = uuidv4();
  
  // Add request ID to request object
  req.requestId = requestId;
  
  // Log request start
  logger.info('Request started', {
    requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    
    // Log response
    logger.info('Request completed', {
      requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length') || 0,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });

    // Log errors
    if (statusCode >= 400) {
      logger.warn('Request error', {
        requestId,
        method: req.method,
        url: req.originalUrl,
        statusCode,
        duration: `${duration}ms`,
        error: true,
        timestamp: new Date().toISOString()
      });
    }

    // Call original end function
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

// User activity logging
const logUserActivity = (action, details = {}) => {
  return (req, res, next) => {
    // Store original res.json to intercept responses
    const originalJson = res.json;
    res.json = function(data) {
      // Log user activity if user is authenticated
      if (req.user) {
        logger.info('User activity', {
          userId: req.user.userId,
          userEmail: req.user.email,
          userRole: req.user.role,
          action,
          resource: req.originalUrl,
          method: req.method,
          statusCode: res.statusCode,
          details,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          timestamp: new Date().toISOString()
        });
      }

      // Call original json function
      originalJson.call(this, data);
    };

    next();
  };
};

// Database operation logging
const logDbOperation = (operation, model, details = {}) => {
  logger.info('Database operation', {
    operation,
    model,
    details,
    timestamp: new Date().toISOString()
  });
};

// Security event logging
const logSecurityEvent = (eventType, details = {}) => {
  logger.warn('Security event', {
    eventType,
    ...details,
    timestamp: new Date().toISOString()
  });
};

// Performance monitoring
const performanceMonitor = (threshold = 1000) => {
  return (req, res, next) => {
    const start = process.hrtime();
    
    res.on('finish', () => {
      const diff = process.hrtime(start);
      const duration = diff[0] * 1000 + diff[1] * 1000000; // Convert to milliseconds
      
      if (duration > threshold) {
        logger.warn('Slow request detected', {
          method: req.method,
          url: req.originalUrl,
          duration: `${duration.toFixed(2)}ms`,
          threshold: `${threshold}ms`,
          userId: req.user?.userId,
          timestamp: new Date().toISOString()
        });
      }
    });

    next();
  };
};

// Error logging helper
const logError = (error, context = {}) => {
  logger.error('Application error', {
    message: error.message,
    stack: error.stack,
    name: error.name,
    code: error.code,
    statusCode: error.statusCode,
    ...context,
    timestamp: new Date().toISOString()
  });
};

// Compliance event logging
const logComplianceEvent = (eventType, institutionId, details = {}) => {
  logger.info('Compliance event', {
    eventType,
    institutionId,
    ...details,
    timestamp: new Date().toISOString()
  });
};

// API usage statistics
const logApiUsage = (endpoint, method, responseTime, statusCode, userId = null) => {
  logger.info('API usage', {
    endpoint,
    method,
    responseTime: `${responseTime}ms`,
    statusCode,
    userId,
    timestamp: new Date().toISOString()
  });
};

// Export logger instance and utilities
module.exports = {
  logger,
  requestLogger,
  logUserActivity,
  logDbOperation,
  logSecurityEvent,
  logError,
  performanceMonitor,
  logComplianceEvent,
  logApiUsage
};