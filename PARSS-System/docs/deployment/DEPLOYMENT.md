# Viksit Bharat Compliance Suite - Deployment Guide

## 🚀 Production Deployment Guide

This guide covers deploying the Viksit Bharat Compliance Suite in production environments with proper security, monitoring, and scalability considerations.

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Pre-Deployment Setup](#pre-deployment-setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Security Configuration](#security-configuration)
6. [Deployment Options](#deployment-options)
7. [Monitoring & Logging](#monitoring--logging)
8. [Backup & Recovery](#backup--recovery)
9. [Troubleshooting](#troubleshooting)

## 🖥️ System Requirements

### Minimum Requirements
- **CPU**: 4 cores, 2.4GHz
- **RAM**: 8GB
- **Storage**: 100GB SSD
- **Network**: 1Gbps
- **OS**: Ubuntu 20.04 LTS / CentOS 8 / RHEL 8

### Recommended Requirements
- **CPU**: 8 cores, 3.0GHz
- **RAM**: 16GB
- **Storage**: 500GB NVMe SSD
- **Network**: 10Gbps
- **OS**: Ubuntu 22.04 LTS

### Dependencies
- **Docker**: 24.0+
- **Docker Compose**: 2.20+
- **Node.js**: 18+
- **PostgreSQL**: 15+
- **Redis**: 7+
- **Nginx**: 1.20+

## 🔧 Pre-Deployment Setup

### 1. Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl wget git build-essential

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Configure firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 5000/tcp
sudo ufw enable
```

### 2. SSL Certificate Setup

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Generate SSL certificate (replace your-domain.com)
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal setup
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 3. Domain & DNS Configuration

```bash
# Update DNS records to point to your server IP:
# A record: your-domain.com -> YOUR_SERVER_IP
# A record: www.your-domain.com -> YOUR_SERVER_IP
# CNAME: api.your-domain.com -> your-domain.com
```

## ⚙️ Environment Configuration

### 1. Environment Variables

Create production `.env` file:

```bash
# Application Environment
NODE_ENV=production
PORT=5000

# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=viksit_bharat_compliance
DB_USER=postgres
DB_PASSWORD=GENERATE_STRONG_PASSWORD

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=GENERATE_STRONG_REDIS_PASSWORD

# JWT Configuration
JWT_SECRET=GENERATE_32_CHAR_SECRET_KEY
JWT_REFRESH_SECRET=GENERATE_32_CHAR_REFRESH_KEY
JWT_EXPIRES_IN=7d

# Security Configuration
CORS_ORIGIN=https://your-domain.com
BCRYPT_ROUNDS=12
ENCRYPTION_KEY=GENERATE_32_CHAR_ENCRYPTION_KEY

# Email Configuration (Production SMTP)
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=noreply@your-domain.com
SMTP_PASS=YOUR_SMTP_PASSWORD
EMAIL_FROM=noreply@your-domain.com

# Client Configuration
CLIENT_URL=https://your-domain.com
VITE_API_BASE_URL=https://your-domain.com/api

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOGIN_RATE_LIMIT_MAX=5

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# Monitoring
SENTRY_DSN=YOUR_SENTRY_DSN
LOG_LEVEL=info
```

### 2. Security Hardening

```bash
# Create security configuration
sudo nano /etc/security/limits.conf
# Add:
# * soft nofile 65536
# * hard nofile 65536

# Configure SSH (disable root login, password auth)
sudo nano /etc/ssh/sshd_config
# PermitRootLogin no
# PasswordAuthentication no
# PubkeyAuthentication yes

# Restart SSH service
sudo systemctl restart sshd

# Configure fail2ban
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## 🗄️ Database Setup

### 1. PostgreSQL Configuration

```bash
# Create database initialization script
mkdir -p database/init
nano database/init/01-init.sql

# Add initialization SQL:
-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set timezone
SET timezone = 'Asia/Kolkata';

-- Create database schema (run migrations)
-- This will be handled by Sequelize migrations
```

### 2. Redis Configuration

```bash
# Create Redis configuration
nano redis.conf

# Add configuration:
# requirepass your_redis_password
# maxmemory 2gb
# maxmemory-policy allkeys-lru
# save 900 1
# save 300 10
# save 60 10000
```

## 🔒 Security Configuration

### 1. Nginx Configuration

Create `/etc/nginx/sites-available/viksit-bharat`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.your-domain.com;";

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

    # Main application
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # API endpoints with rate limiting
    location /api/auth/login {
        limit_req zone=login burst=3 nodelay;
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files (if serving from nginx)
    location /static/ {
        alias /app/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Health check
    location /health {
        proxy_pass http://localhost:5000/health;
        access_log off;
    }

    # Block common attack vectors
    location ~ /\. {
        deny all;
    }
    
    location ~ \.(php|pl|py|jsp|asp|sh|cgi)$ {
        deny all;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/viksit-bharat /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🚀 Deployment Options

### Option 1: Docker Compose (Recommended)

```bash
# Clone repository
git clone https://github.com/your-repo/viksit-bharat-compliance.git
cd viksit-bharat-compliance

# Setup environment
cp .env.example .env
# Edit .env with production values

# Deploy with monitoring
chmod +x deploy.sh
./deploy.sh --monitoring

# Check status
./deploy.sh --status
```

### Option 2: Manual Deployment

```bash
# Build application
cd client && npm run build
cd ../server && npm ci --only=production

# Start services
docker-compose up -d postgres redis
docker-compose exec postgres createdb viksit_bharat_compliance
docker-compose up -d app

# Run migrations
docker-compose exec app npm run migrate

# Setup reverse proxy
sudo ln -s /etc/nginx/sites-available/viksit-bharat /etc/nginx/sites-enabled/
sudo systemctl reload nginx
```

### Option 3: Kubernetes Deployment

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: viksit-bharat

---
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: viksit-config
  namespace: viksit-bharat
data:
  NODE_ENV: "production"
  PORT: "5000"

---
# k8s/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: viksit-secrets
  namespace: viksit-bharat
type: Opaque
stringData:
  DB_PASSWORD: "your-db-password"
  JWT_SECRET: "your-jwt-secret"
  REDIS_PASSWORD: "your-redis-password"

---
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: viksit-app
  namespace: viksit-bharat
spec:
  replicas: 3
  selector:
    matchLabels:
      app: viksit-app
  template:
    metadata:
      labels:
        app: viksit-app
    spec:
      containers:
      - name: app
        image: viksit-bharat:latest
        ports:
        - containerPort: 5000
        env:
        - name: DB_HOST
          value: "postgres-service"
        - name: REDIS_HOST
          value: "redis-service"
        envFrom:
        - configMapRef:
            name: viksit-config
        - secretRef:
            name: viksit-secrets
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"

---
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: viksit-service
  namespace: viksit-bharat
spec:
  selector:
    app: viksit-app
  ports:
  - protocol: TCP
    port: 80
    targetPort: 5000
  type: ClusterIP
```

Deploy to Kubernetes:

```bash
kubectl apply -f k8s/
kubectl get pods -n viksit-bharat
```

## 📊 Monitoring & Logging

### 1. Application Monitoring

```bash
# Enable monitoring in docker-compose
docker-compose --profile monitoring up -d

# Access monitoring services:
# Grafana: http://your-domain.com:3001 (admin/admin123)
# Prometheus: http://your-domain.com:9090
# Kibana: http://your-domain.com:5601
```

### 2. Log Management

```bash
# Configure log rotation
sudo nano /etc/logrotate.d/viksit-bharat

# Add:
/var/log/viksit-bharat/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 0644 nodejs nodejs
    postrotate
        docker-compose restart app
    endscript
}

# Apply log rotation
sudo logrotate -f /etc/logrotate.d/viksit-bharat
```

### 3. Performance Monitoring

```bash
# Install monitoring tools
sudo apt install -y htop iotop nethogs

# Monitor resource usage
htop
iotop
nethogs

# Database monitoring
docker-compose exec postgres psql -U postgres -c "SELECT * FROM pg_stat_activity;"
```

## 💾 Backup & Recovery

### 1. Automated Backup Script

Create `/usr/local/bin/viksit-backup.sh`:

```bash
#!/bin/bash

# Configuration
BACKUP_DIR="/backup/viksit-bharat"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
docker-compose exec -T postgres pg_dump -U postgres viksit_bharat_compliance | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# File backups
tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz ./uploads/
tar -czf $BACKUP_DIR/configs_backup_$DATE.tar.gz ./.env ./nginx/

# Clean old backups
find $BACKUP_DIR -name "*.gz" -mtime +$RETENTION_DAYS -delete

# Upload to cloud storage (optional)
# aws s3 cp $BACKUP_DIR/ s3://your-backup-bucket/viksit-bharat/ --recursive

echo "Backup completed: $BACKUP_DIR"
```

Make executable and schedule:

```bash
sudo chmod +x /usr/local/bin/viksit-backup.sh
sudo crontab -e

# Add daily backup at 2 AM
0 2 * * * /usr/local/bin/viksit-backup.sh >> /var/log/viksit-backup.log 2>&1
```

### 2. Recovery Procedures

```bash
# Database recovery
gunzip -c db_backup_20231216_020000.sql.gz | docker-compose exec -T postgres psql -U postgres viksit_bharat_compliance

# File recovery
tar -xzf uploads_backup_20231216_020000.tar.gz

# Full system recovery
./deploy.sh --cleanup
./deploy.sh --monitoring
./deploy.sh --backup
```

## 🔧 Troubleshooting

### Common Issues

1. **Application won't start**
   ```bash
   # Check logs
   docker-compose logs app
   docker-compose logs postgres
   docker-compose logs redis
   
   # Check disk space
   df -h
   
   # Check memory
   free -h
   ```

2. **Database connection issues**
   ```bash
   # Test database connection
   docker-compose exec postgres pg_isready -U postgres
   
   # Check database logs
   docker-compose logs postgres
   
   # Reset database if needed
   docker-compose down -v
   docker-compose up -d postgres
   ```

3. **SSL certificate issues**
   ```bash
   # Renew certificate
   sudo certbot renew
   
   # Check certificate status
   sudo certbot certificates
   
   # Test nginx configuration
   sudo nginx -t
   ```

4. **Performance issues**
   ```bash
   # Monitor resource usage
   htop
   iotop
   
   # Check application metrics
   curl http://localhost:5000/health
   
   # Monitor database performance
   docker-compose exec postgres psql -U postgres -c "SELECT * FROM pg_stat_activity;"
   ```

### Health Checks

```bash
# Application health
curl -f http://localhost/health

# Database health
docker-compose exec postgres pg_isready -U postgres

# Redis health
docker-compose exec redis redis-cli ping

# Nginx health
curl -I http://localhost
```

### Emergency Procedures

1. **Complete system failure**:
   ```bash
   # Stop all services
   docker-compose down
   
   # Restore from backup
   gunzip -c latest_backup.sql.gz | docker-compose exec -T postgres psql -U postgres viksit_bharat_compliance
   
   # Restart services
   docker-compose up -d
   ```

2. **Security incident**:
   ```bash
   # Block all incoming traffic
   sudo ufw deny incoming
   
   # Rotate all secrets
   # Generate new JWT secrets
   # Generate new database passwords
   # Update .env file
   
   # Restart with new configuration
   docker-compose down
   docker-compose up -d
   
   # Unblock traffic
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw allow 22/tcp
   ```

## 📈 Scaling & Performance

### Horizontal Scaling

```yaml
# docker-compose.scale.yml
version: '3.8'
services:
  app:
    scale: 3
    
  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx/nginx-lb.conf:/etc/nginx/nginx.conf
    ports:
      - "80:80"
      - "443:443"
```

### Load Balancing Configuration

Update nginx configuration for load balancing:

```nginx
upstream viksit_backend {
    server localhost:5000;
    server localhost:5001;
    server localhost:5002;
}

server {
    location / {
        proxy_pass http://viksit_backend;
    }
}
```

### Database Optimization

```sql
-- PostgreSQL optimization
-- Add to postgresql.conf:
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB
random_page_cost = 1.1
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
```

## 🔒 Security Checklist

- [ ] SSL/TLS certificates installed and configured
- [ ] Strong passwords for all accounts
- [ ] JWT secrets are unique and secure
- [ ] Database credentials are strong
- [ ] Firewall configured (only ports 22, 80, 443 open)
- [ ] SSH key-based authentication enabled
- [ ] Root login disabled
- [ ] Regular security updates applied
- [ ] Fail2ban configured
- [ ] Application logs monitored
- [ ] Backup encryption enabled
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Security headers implemented
- [ ] File upload restrictions in place
- [ ] Database access restricted to application

## 📞 Support & Maintenance

### Regular Maintenance Tasks

1. **Weekly**:
   - Check application logs
   - Monitor disk usage
   - Review security alerts

2. **Monthly**:
   - Apply security updates
   - Review backup integrity
   - Performance optimization review
   - Security audit

3. **Quarterly**:
   - Complete security assessment
   - Disaster recovery testing
   - Performance benchmarking
   - Dependency updates

### Getting Help

- **Documentation**: `/docs` endpoint
- **Health Check**: `/health` endpoint
- **Logs**: `docker-compose logs app`
- **Support**: support@viksitbharat.com

---

## ✅ Production Checklist

Before going live:

- [ ] All environment variables configured
- [ ] SSL certificates installed
- [ ] Database migrations completed
- [ ] Monitoring stack deployed
- [ ] Backup system configured
- [ ] Security scan completed
- [ ] Load testing performed
- [ ] Disaster recovery tested
- [ ] Documentation updated
- [ ] Team trained on deployment procedures

**🎉 Your Viksit Bharat Compliance Suite is now ready for production use!**