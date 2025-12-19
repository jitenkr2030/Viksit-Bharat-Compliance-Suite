const jwt = require('jsonwebtoken');
const { AppError, catchAsync } = require('./errorHandler');
const User = require('../models/User');

// Authentication middleware
const authenticateToken = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it's there
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  // 2) Verification token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again!', 401));
    } else if (error.name === 'TokenExpiredError') {
      return next(new AppError('Your token has expired! Please log in again.', 401));
    }
    return next(error);
  }

  // 3) Check if user still exists
  const currentUser = await User.findByPk(decoded.userId);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token does no longer exist.', 401));
  }

  // 4) Check if user is active
  if (!currentUser.is_active) {
    return next(new AppError('Your account has been deactivated. Please contact the administrator.', 403));
  }

  // 5) Check if user changed password after the token was issued
  if (currentUser.password_changed_at) {
    const changedTimestamp = parseInt(currentUser.password_changed_at.getTime() / 1000, 10);
    if (decoded.iat < changedTimestamp) {
      return next(new AppError('User recently changed password! Please log in again.', 401));
    }
  }

  // 6) Check if account is locked
  if (currentUser.locked_until && new Date() < currentUser.locked_until) {
    return next(new AppError('Account is temporarily locked due to multiple failed login attempts.', 423));
  }

  // Grant access to protected route
  req.user = {
    userId: currentUser.id,
    email: currentUser.email,
    role: currentUser.role,
    institutionId: currentUser.institution_id
  };

  next();
});

// Authorization middleware - check user roles
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
};

// Check if user owns resource or has permission
const checkOwnershipOrPermission = (resourceModel, userField = 'institution_id') => {
  return catchAsync(async (req, res, next) => {
    if (!req.user) {
      return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    // System admin and super admin can access everything
    if (['system_admin', 'super_admin'].includes(req.user.role)) {
      return next();
    }

    const resourceId = req.params.id || req.body.resourceId;
    if (!resourceId) {
      return next(new AppError('Resource ID is required', 400));
    }

    const resource = await resourceModel.findByPk(resourceId);
    if (!resource) {
      return next(new AppError('Resource not found', 404));
    }

    // Check if user has access to this institution
    const userInstitutionId = req.user.institutionId;
    const resourceInstitutionId = resource[userField];

    if (userInstitutionId !== resourceInstitutionId) {
      return next(new AppError('You do not have permission to access this resource', 403));
    }

    // Attach resource to request for further use
    req.resource = resource;
    next();
  });
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const currentUser = await User.findByPk(decoded.userId);
      
      if (currentUser && currentUser.is_active && 
          (!currentUser.locked_until || new Date() >= currentUser.locked_until)) {
        req.user = {
          userId: currentUser.id,
          email: currentUser.email,
          role: currentUser.role,
          institutionId: currentUser.institution_id
        };
      }
    } catch (error) {
      // Ignore token errors for optional auth
      console.log('Optional auth failed:', error.message);
    }
  }

  next();
});

// Rate limiting for sensitive operations
const createRateLimiter = (windowMs, max, message) => {
  const rateLimit = require('express-rate-limit');
  
  return rateLimit({
    windowMs,
    max,
    message: {
      error: message,
      code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: message,
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

module.exports = {
  authenticateToken,
  restrictTo,
  checkOwnershipOrPermission,
  optionalAuth,
  createRateLimiter
};