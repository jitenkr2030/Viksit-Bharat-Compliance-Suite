# Development Setup Guide

This guide will help you set up a complete development environment for the Viksit Bharat Compliance Suite.

## 🛠️ Prerequisites

### Required Software
- **Node.js 18+** - JavaScript runtime
- **npm 9+** - Package manager
- **PostgreSQL 13+** - Primary database
- **Redis 6+** - Caching and session management
- **Git 2.30+** - Version control
- **Docker** (optional) - Containerization

### Development Tools
- **VS Code** (recommended) - Code editor
- **Chrome/Firefox** - Browser for testing
- **Postman** - API testing
- **pgAdmin** (optional) - Database management
- **Redis Desktop Manager** (optional) - Redis management

## 🚀 Quick Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-org/viksit-bharat-compliance.git
cd viksit-bharat-compliance
```

### 2. Install Dependencies
```bash
# Install all dependencies
npm run install:all

# Or install individually
cd server && npm install
cd ../client && npm install
cd ../mobile && npm install
```

### 3. Setup Environment Variables
```bash
# Copy environment files
cp server/.env.example server/.env
cp client/.env.example client/.env
cp mobile/.env.example mobile/.env

# Edit the files with your configuration
nano server/.env
nano client/.env
nano mobile/.env
```

### 4. Setup Database
```bash
cd server
npm run migrate
npm run seed
```

### 5. Start Development Servers
```bash
# Terminal 1: Backend server
cd server && npm run dev

# Terminal 2: Frontend development server
cd client && npm run dev

# Terminal 3: Mobile app (optional)
cd mobile && npm start
```

### 6. Access Applications
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Mobile App**: http://localhost:19006
- **Database**: localhost:5432
- **Redis**: localhost:6379

## 📋 Detailed Setup Steps

### Database Setup

#### PostgreSQL Installation
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql

# Windows
# Download from https://www.postgresql.org/download/windows/
```

#### Create Database
```sql
-- Connect to PostgreSQL
sudo -u postgres psql

-- Create database and user
CREATE DATABASE viksit_bharat;
CREATE USER viksit_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE viksit_bharat TO viksit_user;
\q
```

#### Run Migrations
```bash
cd server
npm run migrate
npm run seed
```

### Redis Setup

#### Redis Installation
```bash
# Ubuntu/Debian
sudo apt install redis-server

# macOS
brew install redis

# Windows
# Download from https://redis.io/download
```

#### Start Redis
```bash
# Start Redis server
redis-server

# Or with systemctl
sudo systemctl start redis
sudo systemctl enable redis
```

### Environment Configuration

#### Server Environment (.env)
```env
# Database
DATABASE_URL=postgresql://viksit_user:your_password@localhost:5432/viksit_bharat

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=30d

# Redis
REDIS_URL=redis://localhost:6379

# Server
PORT=5000
NODE_ENV=development

# CORS
CLIENT_URL=http://localhost:3000

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# AI Services (for Phase 4)
OPENAI_API_KEY=your-openai-api-key
AI_MODEL_VERSION=gpt-4
```

#### Client Environment (.env)
```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=ws://localhost:5000

# App Configuration
VITE_APP_NAME=Viksit Bharat Compliance Suite
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_AI_ASSISTANT=true
VITE_ENABLE_PHASE4=true

# Analytics (optional)
VITE_ANALYTICS_ID=your-analytics-id
```

#### Mobile Environment (.env)
```env
# API Configuration
API_URL=http://localhost:5000/api
WS_URL=ws://localhost:5000

# App Configuration
APP_NAME=Viksit Bharat
APP_VERSION=1.0.0

# Feature Flags
ENABLE_AI_ASSISTANT=true
ENABLE_PUSH_NOTIFICATIONS=false
```

## 🏗️ Project Structure Setup

### Directory Creation
```bash
# Create additional directories if they don't exist
mkdir -p server/logs
mkdir -p server/uploads
mkdir -p client/src/assets/images
mkdir -p client/public/icons
mkdir -p mobile/src/assets
```

### File Permissions
```bash
# Set proper permissions
chmod +x scripts/setup.sh
chmod +x scripts/build.sh
chmod +x scripts/deploy.sh

# Set permissions for uploads directory
chmod 755 server/uploads
```

## 🔧 Development Tools Setup

### VS Code Extensions
Install these extensions for optimal development experience:

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "ms-vscode.vscode-json",
    "redhat.vscode-yaml",
    "ms-vscode-remote.remote-containers",
    "ms-vscode-remote.remote-ssh",
    "ms-vscode-remote.remote-wsl",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-npm-script",
    "visualstudioexptteam.vscodeintellicode",
    "ms-vscode.vscode-jest"
  ]
}
```

### VS Code Settings
Create `.vscode/settings.json`:

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/build": true,
    "**/.git": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/build": true
  }
}
```

### Debug Configuration
Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Server",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/server/index.js",
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "restart": true,
      "runtimeExecutable": "nodemon"
    },
    {
      "name": "Debug Client",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/client/node_modules/.bin/vite",
      "args": ["dev"],
      "cwd": "${workspaceFolder}/client",
      "console": "integratedTerminal"
    }
  ]
}
```

## 🧪 Testing Setup

### Unit Testing
```bash
# Install testing dependencies
cd server && npm install --save-dev jest supertest
cd ../client && npm install --save-dev jest @testing-library/react @testing-library/jest-dom
cd ../mobile && npm install --save-dev jest @testing-library/react-native
```

### E2E Testing
```bash
# Install Cypress
npm install --save-dev cypress

# Initialize Cypress
npx cypress open
```

### Test Configuration

#### Server Jest Config (jest.config.js)
```javascript
module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    '**/*.js',
    '!node_modules/**',
    '!coverage/**',
    '!uploads/**'
  ],
  testMatch: ['**/tests/**/*.test.js'],
  coverageReporters: ['text', 'lcov', 'html']
};
```

#### Client Jest Config (jest.config.js)
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/index.js',
    '!src/reportWebVitals.js'
  ]
};
```

## 🐳 Docker Development

### Docker Compose Setup
Create `docker-compose.dev.yml`:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:13
    environment:
      POSTGRES_DB: viksit_bharat
      POSTGRES_USER: viksit_user
      POSTGRES_PASSWORD: your_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  server:
    build:
      context: ./server
      dockerfile: Dockerfile.dev
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://viksit_user:your_password@postgres:5432/viksit_bharat
      - REDIS_URL=redis://redis:6379
    volumes:
      - ./server:/app
      - /app/node_modules
    depends_on:
      - postgres
      - redis

  client:
    build:
      context: ./client
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - ./client:/app
      - /app/node_modules
    environment:
      - VITE_API_URL=http://localhost:5000/api

volumes:
  postgres_data:
  redis_data:
```

### Start Development with Docker
```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

## 🔍 Development Workflow

### Daily Development
```bash
# 1. Pull latest changes
git pull origin main

# 2. Start development servers
npm run dev

# 3. Run tests
npm test

# 4. Run linting
npm run lint

# 5. Format code
npm run format
```

### Feature Development
```bash
# 1. Create feature branch
git checkout -b feature/your-feature-name

# 2. Make changes
# ... your code changes ...

# 3. Run tests
npm test

# 4. Commit changes
git add .
git commit -m "feat: add your feature"

# 5. Push and create PR
git push origin feature/your-feature-name
```

## 📊 Monitoring & Debugging

### Health Checks
```bash
# Check server health
curl http://localhost:5000/health

# Check database connection
cd server && npm run db:check

# Check Redis connection
redis-cli ping
```

### Logs
```bash
# View server logs
tail -f server/logs/app.log

# View client console
# Open browser dev tools

# View mobile logs
# Use React Native debugger
```

### Performance Monitoring
```bash
# Install monitoring tools
npm install --save-dev clinic

# Run performance analysis
clinic doctor -- node server/index.js
```

## 🚨 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process using port
lsof -ti:5000 | xargs kill -9

# Or change port in .env file
PORT=5001
```

#### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Check database exists
psql -l | grep viksit_bharat
```

#### Redis Connection Issues
```bash
# Check Redis status
redis-cli ping

# Restart Redis
sudo systemctl restart redis
```

#### Node Module Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Getting Help
- **Documentation**: Check the docs folder
- **Issues**: Create GitHub issue
- **Discussions**: Use GitHub Discussions
- **Support**: Email support@viksitbharat.com

## 📈 Performance Optimization

### Development Tips
- Use `npm run dev` for hot reloading
- Enable browser caching for static assets
- Use database query optimization
- Implement proper error handling
- Monitor memory usage during development

### Code Quality
- Follow ESLint and Prettier configurations
- Write unit tests for new features
- Use TypeScript for type safety
- Implement proper error boundaries
- Follow the established folder structure

---

**Happy Coding! 🚀**

*This setup guide ensures a smooth development experience for the Viksit Bharat Compliance Suite.*