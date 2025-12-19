# Penalty Avoidance & Regulatory Survival System (PARSS) - Backend API

A production-grade backend API for the Penalty Avoidance & Regulatory Survival System designed to prevent ₹10L-₹2Cr regulatory fines under the Viksit Bharat Shiksha Adhishthan Bill 2025.

## 📋 Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Database Setup](#-database-setup)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## 🚀 Features

- **Three-Council System**: Regulatory, Standards, and Accreditation councils for penalty avoidance
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Role-Based Access Control**: Granular permissions system for penalty protection
- **File Upload & Management**: Compliance document handling with penalty risk validation
- **Real-time Alerts**: Notification system for penalty risk and violation alerts
- **Background Jobs**: Automated penalty prevention and compliance monitoring tasks
- **Comprehensive Logging**: Winston-based logging system for audit trails
- **Rate Limiting**: Protection against abuse and DDoS
- **Data Validation**: Express-validator for input validation
- **Database Migrations**: Automated schema management
- **API Documentation**: Ready for Swagger/OpenAPI integration

## 🛠 Technology Stack

- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Caching**: Redis
- **Authentication**: JWT with bcrypt
- **Validation**: express-validator
- **File Upload**: multer
- **Logging**: Winston
- **Background Jobs**: node-cron
- **Email**: nodemailer
- **Security**: helmet, cors, express-rate-limit

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v16.0.0 or higher)
- PostgreSQL (v12 or higher)
- Redis (v6 or higher)
- npm or yarn package manager

## 💻 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file with your configuration.

## ⚙️ Configuration

The application uses environment variables for configuration. Copy `.env.example` to `.env` and update the values:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=viksit_bharat_compliance
DB_USER=postgres
DB_PASSWORD=your_password
DB_SSL=false

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@viksitbharat.gov.in

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
ALLOWED_FILE_TYPES=pdf,doc,docx,txt,jpg,jpeg,png

# Security Configuration
BCRYPT_ROUNDS=12
SESSION_SECRET=your_session_secret

# CORS Configuration
CLIENT_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006
```

## 🗄 Database Setup

1. **Create database**
   ```sql
   CREATE DATABASE viksit_bharat_compliance;
   ```

2. **Run migrations**
   ```bash
   npm run migrate
   ```

3. **Seed initial data** (optional)
   ```bash
   npm run seed
   ```

4. **Check migration status**
   ```bash
   node scripts/migrate.js status
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Background Jobs
Background jobs are automatically scheduled when the server starts. To manage them manually:

```bash
# Start server (jobs auto-start)
npm start

# Jobs will run based on their schedules:
# - Session cleanup: hourly
# - Daily reminders: 9 AM IST
# - Weekly reports: 11 PM IST (Sundays)
# - Statistics update: every 15 minutes
```

### Health Check
The server provides a health check endpoint:
```
GET /health
```

Response:
```json
{
  "status": "OK",
  "timestamp": "2024-12-16T19:15:14.000Z",
  "uptime": 1234.56,
  "environment": "development"
}
```

## 📚 API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "role": "compliance_officer",
  "institution_id": "uuid",
  "department": "IT",
  "position": "Officer"
}
```

#### POST /api/auth/login
Authenticate user and get tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "remember_me": false
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "compliance_officer",
    "full_name": "John Doe"
  },
  "tokens": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token",
    "expires_in": "7d"
  }
}
```

#### GET /api/auth/me
Get current user profile (requires authentication).

### Dashboard Endpoints

#### GET /api/dashboard/stats
Get dashboard statistics.

#### GET /api/dashboard/recent-activity
Get recent activity feed.

### Alerts Endpoints

#### GET /api/alerts
Get user alerts with filtering.

**Query Parameters:**
- `status`: unread, read, all
- `type`: info, warning, error, success
- `priority`: low, medium, high
- `page`: page number
- `limit`: items per page

#### PUT /api/alerts/:id/read
Mark alert as read.

#### PUT /api/alerts/:id/unread
Mark alert as unread.

### Documents Endpoints

#### GET /api/documents
Get documents with filtering.

**Query Parameters:**
- `category`: regulatory, standards, accreditation, internal
- `status`: draft, submitted, approved, rejected
- `type`: pdf, doc, image, other
- `search`: search term
- `page`: page number
- `limit`: items per page

#### POST /api/documents
Upload new document.

**Headers:**
- `Content-Type: multipart/form-data`

**Form Data:**
- `file`: document file
- `title`: document title
- `description`: document description
- `category`: document category

#### GET /api/documents/:id
Get specific document details.

#### PUT /api/documents/:id
Update document metadata.

#### DELETE /api/documents/:id
Delete document.

### Standards Endpoints

#### GET /api/standards
Get compliance standards.

#### GET /api/standards/:id
Get specific standard details.

#### POST /api/standards
Create new standard (admin only).

#### PUT /api/standards/:id
Update standard (admin only).

#### DELETE /api/standards/:id
Delete standard (admin only).

### Accreditation Endpoints

#### GET /api/accreditation
Get accreditation records.

#### POST /api/accreditation
Submit accreditation application.

#### PUT /api/accreditation/:id/status
Update accreditation status (admin only).

### Faculty Endpoints

#### GET /api/faculty
Get faculty members.

#### POST /api/faculty
Add new faculty member.

#### PUT /api/faculty/:id
Update faculty information.

#### GET /api/faculty/:id/compliance
Get faculty compliance status.

### Institutions Endpoints

#### GET /api/institutions
Get institutions (admin only).

#### POST /api/institutions
Create new institution (system admin only).

#### GET /api/institutions/:id
Get institution details.

#### PUT /api/institutions/:id
Update institution information.

### Reports Endpoints

#### GET /api/reports/compliance
Generate compliance reports.

#### GET /api/reports/dashboard
Generate dashboard reports.

#### GET /api/reports/export
Export reports in various formats.

## 📁 Project Structure

```
server/
├── config/
│   ├── database.js          # Database configuration
│   └── redis.js            # Redis configuration
├── middleware/
│   ├── auth.js             # Authentication middleware
│   ├── errorHandler.js     # Error handling middleware
│   ├── logger.js           # Logging middleware
│   └── validation.js       # Validation middleware
├── models/
│   ├── Alert.js           # Alert model
│   ├── Approval.js        # Approval model
│   ├── Document.js        # Document model
│   ├── Faculty.js         # Faculty model
│   ├── Institution.js     # Institution model
│   └── User.js            # User model
├── routes/
│   ├── auth.js            # Authentication routes
│   ├── alerts.js          # Alert routes
│   ├── dashboard.js       # Dashboard routes
│   ├── documents.js       # Document routes
│   ├── faculty.js         # Faculty routes
│   ├── institutions.js    # Institution routes
│   ├── notifications.js   # Notification routes
│   ├── regulatory.js      # Regulatory routes
│   ├── reports.js         # Report routes
│   ├── standards.js       # Standards routes
│   └── accreditation.js   # Accreditation routes
├── scripts/
│   ├── migrate.js         # Database migration script
│   └── seed.js           # Database seeding script
├── services/
│   └── scheduler.js       # Background job scheduler
├── .env.example          # Environment variables template
├── package.json          # Dependencies and scripts
├── index.js              # Application entry point
└── README.md             # This file
```

## 🔧 Development

### Adding New Routes

1. Create route file in `routes/` directory
2. Implement route handlers with proper validation
3. Import and register route in `index.js`
4. Add corresponding model if needed
5. Update API documentation

### Database Migrations

1. Create migration file in `migrations/` directory
2. Implement `up` and `down` functions
3. Run migration: `node scripts/migrate.js migrate`
4. Check status: `node scripts/migrate.js status`

### Background Jobs

1. Add job to `services/scheduler.js`
2. Define cron schedule and job function
3. Jobs auto-start with server

### Logging

Use the logger middleware for consistent logging:

```javascript
const logger = require('../middleware/logger');

// Info log
logger.info('User logged in', { userId: user.id, ip: req.ip });

// Error log
logger.error('Database error', { error: error.message, stack: error.stack });

// Warn log
logger.warn('Rate limit exceeded', { ip: req.ip, endpoint: req.path });
```

## 🧪 Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

Run specific test file:
```bash
npm test -- auth.test.js
```

## 🚀 Deployment

### Production Environment

1. **Set NODE_ENV=production**
2. **Configure SSL/TLS**
3. **Set up reverse proxy** (nginx recommended)
4. **Configure process manager** (PM2 recommended)
5. **Set up monitoring** (Prometheus, Grafana)
6. **Configure backup strategy**

### Using PM2

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start index.js --name "viksit-compliance-api"

# Monitor
pm2 monit

# Logs
pm2 logs

# Restart
pm2 restart viksit-compliance-api

# Stop
pm2 stop viksit-compliance-api
```

### Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t viksit-compliance-api .
docker run -p 5000:5000 --env-file .env viksit-compliance-api
```

## 🔒 Security Considerations

- **Authentication**: JWT tokens with expiration
- **Authorization**: Role-based access control
- **Rate Limiting**: Prevent abuse and DDoS
- **Input Validation**: All inputs validated
- **SQL Injection**: Protected by Sequelize ORM
- **XSS Protection**: helmet.js middleware
- **CORS**: Configured for specific origins
- **File Upload**: Type and size validation
- **Password Hashing**: bcrypt with salt rounds
- **Environment Variables**: Sensitive data in env files

## 📊 Monitoring

### Health Checks
- `/health` - Basic health check
- Database connection status
- Redis connection status

### Logging
- Request/response logging
- Error logging with stack traces
- Performance metrics
- Security event logging

### Metrics
- Response times
- Error rates
- Database query performance
- Memory and CPU usage

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Style
- Use ESLint configuration
- Follow RESTful API conventions
- Write comprehensive tests
- Document new features

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation wiki

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
  - JWT authentication
  - Three-council system
  - Document management
  - Alert system
  - Background jobs
  - API documentation

---

**Built with ❤️ for Viksit Bharat Shiksha Adhishthan Bill 2025**