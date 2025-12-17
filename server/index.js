const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const regulatoryRoutes = require('./routes/regulatory');
const standardsRoutes = require('./routes/standards');
const accreditationRoutes = require('./routes/accreditation');
const alertsRoutes = require('./routes/alerts');
const criticalAlertsRoutes = require('./routes/criticalAlerts');
const reportsRoutes = require('./routes/reports');
const documentsRoutes = require('./routes/documents');
const facultyRoutes = require('./routes/faculty');
const institutionsRoutes = require('./routes/institutions');
const notificationsRoutes = require('./routes/notifications');

// Phase 2 Routes - Government Portal Integration, AI Document Processing, Executive Analytics
const governmentPortalRoutes = require('./routes/governmentPortal');
const aiDocumentsRoutes = require('./routes/aiDocuments');
const executiveAnalyticsRoutes = require('./routes/executiveAnalytics');

// Phase 3 Routes - Blockchain Compliance Records, IoT Smart Campus, Advanced AI Assistant
const blockchainRoutes = require('./routes/blockchain');
const iotRoutes = require('./routes/iot');
const aiAssistantRoutes = require('./routes/aiAssistant');

// Phase 4 Routes - Fully Autonomous Compliance Management
const autonomousSystemRoutes = require('./routes/autonomousSystem');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/logger');
const { authenticateToken } = require('./middleware/auth');
const { validateRequest } = require('./middleware/validation');

// Import database and models
const { sequelize } = require('./config/database');
require('./models'); // Import all models to ensure they're registered with Sequelize

// Import services
const { initializeRedis } = require('./config/redis');
const { scheduleJobs } = require('./services/scheduler');

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"]
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per 15 minutes at full speed
  delayMs: 500 // add 500ms delay per request after delayAfter
});

app.use(limiter);
app.use(speedLimiter);

// Middleware
app.use(compression());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', authenticateToken, dashboardRoutes);
app.use('/api/regulatory', authenticateToken, regulatoryRoutes);
app.use('/api/standards', authenticateToken, standardsRoutes);
app.use('/api/accreditation', authenticateToken, accreditationRoutes);
app.use('/api/alerts', authenticateToken, alertsRoutes);
app.use('/api/critical-alerts', authenticateToken, criticalAlertsRoutes);
app.use('/api/reports', authenticateToken, reportsRoutes);
app.use('/api/documents', authenticateToken, documentsRoutes);
app.use('/api/faculty', authenticateToken, facultyRoutes);
app.use('/api/institutions', authenticateToken, institutionsRoutes);
app.use('/api/notifications', authenticateToken, notificationsRoutes);

// Phase 2 Routes - Government Portal Integration, AI Document Processing, Executive Analytics
app.use('/api/government-portal', authenticateToken, governmentPortalRoutes);
app.use('/api/ai-documents', authenticateToken, aiDocumentsRoutes);
app.use('/api/executive-analytics', authenticateToken, executiveAnalyticsRoutes);

// Phase 3 Routes - Blockchain Compliance Records, IoT Smart Campus, Advanced AI Assistant
app.use('/api/blockchain', authenticateToken, blockchainRoutes);
app.use('/api/iot', authenticateToken, iotRoutes);
app.use('/api/ai-assistant', authenticateToken, aiAssistantRoutes);

// Phase 4 Routes - Fully Autonomous Compliance Management
app.use('/api/autonomous-system', authenticateToken, autonomousSystemRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Initialize database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Sync database models (be careful in production)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Database models synchronized.');
    }
    
    // Initialize Redis
    await initializeRedis();
    console.log('✅ Redis connection established.');
    
    // Schedule background jobs
    scheduleJobs();
    console.log('✅ Background jobs scheduled.');
    
    // Start HTTP server
    app.listen(PORT, () => {
      console.log(`
🚀 Server is running on port ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📊 Health check: http://localhost:${PORT}/health
🔐 API Documentation: http://localhost:${PORT}/api/docs
      `);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  
  try {
    await sequelize.close();
    console.log('✅ Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  
  try {
    await sequelize.close();
    console.log('✅ Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Start the server
startServer();

module.exports = app;