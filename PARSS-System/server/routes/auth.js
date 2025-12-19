const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for auth endpoints
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 login requests per windowMs
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true
});

// Validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('username')
    .isAlphanumeric('en-US', { ignore: '_-' })
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be 3-50 characters long and contain only letters, numbers, underscores, and hyphens'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('first_name')
    .isLength({ min: 2, max: 100 })
    .withMessage('First name must be 2-100 characters long'),
  body('last_name')
    .isLength({ min: 2, max: 100 })
    .withMessage('Last name must be 2-100 characters long'),
  body('role')
    .isIn(['admin', 'compliance_officer', 'principal', 'vice_principal', 'department_head', 'faculty', 'auditor', 'viewer'])
    .withMessage('Invalid role specified')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const changePasswordValidation = [
  body('current_password')
    .notEmpty()
    .withMessage('Current password is required'),
  body('new_password')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', authLimiter, registerValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      email,
      username,
      password,
      first_name,
      last_name,
      role,
      institution_id,
      department,
      position,
      phone
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        message: existingUser.email === email 
          ? 'Email address is already registered' 
          : 'Username is already taken'
      });
    }

    // Create new user
    const user = await User.create({
      email,
      username,
      password,
      first_name,
      last_name,
      role,
      institution_id,
      department,
      position,
      phone,
      is_verified: false // Email verification required
    });

    // Log the registration
    user.addActivityLog('user_registered', {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Generate tokens
    const authToken = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        full_name: user.getFullName(),
        role: user.role,
        institution_id: user.institution_id,
        is_verified: user.is_verified
      },
      tokens: {
        access_token: authToken,
        refresh_token: refreshToken,
        expires_in: '7d'
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: 'An error occurred during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user and get token
// @access  Public
router.post('/login', loginLimiter, loginValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password, remember_me } = req.body;

    // Find user by email
    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: require('../models/Institution'),
          as: 'Institution'
        }
      ]
    });

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Check if account is locked
    if (user.locked_until && new Date() < user.locked_until) {
      return res.status(423).json({
        error: 'Account locked',
        message: 'Account is temporarily locked due to multiple failed login attempts'
      });
    }

    // Check if account is active
    if (!user.is_active) {
      return res.status(403).json({
        error: 'Account inactive',
        message: 'Your account has been deactivated. Please contact the administrator.'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      await user.incrementFailedLogin();
      user.addActivityLog('failed_login_attempt', {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Update last login
    await user.updateLastLogin(req.ip, {
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip
    });

    // Generate tokens
    const authToken = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();

    // Log successful login
    user.addActivityLog('user_login', {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      remember_me: remember_me || false
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        full_name: user.getFullName(),
        role: user.role,
        institution_id: user.institution_id,
        institution: user.Institution ? {
          id: user.Institution.id,
          name: user.Institution.name,
          code: user.Institution.code
        } : null,
        permissions: user.permissions,
        preferences: user.preferences,
        last_login_at: user.last_login_at
      },
      tokens: {
        access_token: authToken,
        refresh_token: refreshToken,
        expires_in: remember_me ? '30d' : '7d'
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'An error occurred during login'
    });
  }
});

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        error: 'Refresh token required',
        message: 'Please provide a refresh token'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Invalid refresh token'
      });
    }

    // Find user
    const user = await User.findByPk(decoded.userId);
    
    if (!user || !user.is_active) {
      return res.status(401).json({
        error: 'User not found',
        message: 'User account not found or inactive'
      });
    }

    // Generate new tokens
    const authToken = user.generateAuthToken();
    const newRefreshToken = user.generateRefreshToken();

    res.json({
      message: 'Token refreshed successfully',
      tokens: {
        access_token: authToken,
        refresh_token: newRefreshToken,
        expires_in: '7d'
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Refresh token is invalid or expired'
      });
    }

    res.status(500).json({
      error: 'Token refresh failed',
      message: 'An error occurred while refreshing token'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (invalidate tokens)
// @access  Private
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    
    // Log logout activity
    await user.addActivityLog('user_logout', {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      message: 'An error occurred during logout'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      include: [
        {
          model: require('../models/Institution'),
          as: 'Institution'
        }
      ]
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User account not found'
      });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        full_name: user.getFullName(),
        role: user.role,
        institution_id: user.institution_id,
        institution: user.Institution ? {
          id: user.Institution.id,
          name: user.Institution.name,
          code: user.Institution.code,
          type: user.Institution.type
        } : null,
        department: user.department,
        position: user.position,
        phone: user.phone,
        profile_image: user.profile_image,
        permissions: user.permissions,
        preferences: user.preferences,
        compliance_scope: user.compliance_scope,
        last_login_at: user.last_login_at,
        login_count: user.login_count,
        is_verified: user.is_verified,
        two_factor_enabled: user.two_factor_enabled
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to get profile',
      message: 'An error occurred while fetching user profile'
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticateToken, [
  body('first_name').optional().isLength({ min: 2, max: 100 }).withMessage('First name must be 2-100 characters long'),
  body('last_name').optional().isLength({ min: 2, max: 100 }).withMessage('Last name must be 2-100 characters long'),
  body('department').optional().isLength({ max: 100 }),
  body('position').optional().isLength({ max: 100 }),
  body('phone').optional().isMobilePhone()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const user = await User.findByPk(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User account not found'
      });
    }

    // Update allowed fields
    const allowedFields = ['first_name', 'last_name', 'department', 'position', 'phone', 'preferences'];
    const updates = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    await user.update(updates);

    // Log profile update
    await user.addActivityLog('profile_updated', {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      updated_fields: Object.keys(updates)
    });

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        full_name: user.getFullName(),
        department: user.department,
        position: user.position,
        phone: user.phone,
        preferences: user.preferences
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      error: 'Profile update failed',
      message: 'An error occurred while updating profile'
    });
  }
});

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', authenticateToken, changePasswordValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { current_password, new_password } = req.body;
    const user = await User.findByPk(req.user.userId);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User account not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(current_password);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        error: 'Invalid current password',
        message: 'The current password you provided is incorrect'
      });
    }

    // Update password
    user.password = new_password;
    await user.save();

    // Log password change
    await user.addActivityLog('password_changed', {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Password change failed',
      message: 'An error occurred while changing password'
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password', authLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    // Always return success for security (don't reveal if email exists)
    const response = {
      message: 'If an account with that email exists, a password reset link has been sent.'
    };

    if (user) {
      // Generate reset token
      const resetToken = jwt.sign(
        { userId: user.id, type: 'password_reset' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Save reset token
      user.reset_password_token = resetToken;
      user.reset_password_expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save();

      // TODO: Send email with reset link
      // For now, we'll just log it (in production, integrate with email service)
      console.log(`Password reset token for ${email}: ${resetToken}`);
      
      await user.addActivityLog('password_reset_requested', {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
    }

    res.json(response);

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      error: 'Request failed',
      message: 'An error occurred while processing password reset request'
    });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', authLimiter, [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { token, password } = req.body;

    // Verify reset token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({
        error: 'Invalid token',
        message: 'Password reset token is invalid or expired'
      });
    }

    if (decoded.type !== 'password_reset') {
      return res.status(400).json({
        error: 'Invalid token',
        message: 'Invalid password reset token'
      });
    }

    // Find user
    const user = await User.findOne({
      where: {
        id: decoded.userId,
        reset_password_token: token,
        reset_password_expires: {
          [require('sequelize').Op.gt]: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({
        error: 'Invalid token',
        message: 'Password reset token is invalid or expired'
      });
    }

    // Update password and clear reset token
    user.password = password;
    user.reset_password_token = null;
    user.reset_password_expires = null;
    user.password_changed_at = new Date();
    await user.save();

    // Log password reset
    await user.addActivityLog('password_reset_completed', {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      error: 'Password reset failed',
      message: 'An error occurred while resetting password'
    });
  }
});

module.exports = router;