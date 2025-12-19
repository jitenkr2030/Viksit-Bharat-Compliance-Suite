#!/bin/bash

# ============================================
# VKSIT BHARAT COMPLIANCE SUITE - DEPLOYMENT SCRIPT
# ============================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="viksit-bharat-compliance"
DOCKER_IMAGE_NAME="viksit-bharat-compliance"
BACKUP_RETENTION_DAYS=30

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        log_warning "Running as root. Consider using a non-root user for security."
    fi
}

# Check system requirements
check_requirements() {
    log_info "Checking system requirements..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check available disk space (minimum 5GB)
    available_space=$(df / | awk 'NR==2 {print $4}')
    if [[ $available_space -lt 5242880 ]]; then  # 5GB in KB
        log_warning "Less than 5GB disk space available. Consider freeing up space."
    fi
    
    log_success "System requirements check completed."
}

# Create necessary directories
setup_directories() {
    log_info "Setting up directories..."
    
    mkdir -p database/init
    mkdir -p database/backups
    mkdir -p logs
    mkdir -p uploads
    mkdir -p ssl
    mkdir -p scripts
    mkdir -p monitoring/{grafana/{dashboards,datasources},prometheus}
    
    # Set proper permissions
    chmod 755 database/backups logs uploads scripts
    chmod 600 ssl
    
    log_success "Directories created successfully."
}

# Generate SSL certificates (self-signed for development)
generate_ssl_certs() {
    if [[ ! -f ssl/server.crt ]]; then
        log_info "Generating self-signed SSL certificates..."
        
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout ssl/server.key \
            -out ssl/server.crt \
            -subj "/C=IN/ST=Maharashtra/L=Mumbai/O=Viksit Bharat/OU=IT/CN=localhost"
        
        log_success "SSL certificates generated."
    else
        log_info "SSL certificates already exist."
    fi
}

# Setup environment variables
setup_environment() {
    log_info "Setting up environment variables..."
    
    if [[ ! -f .env ]]; then
        cp .env.example .env
        log_warning "Please update .env file with your configuration before proceeding."
        log_warning "Key variables to update:"
        log_warning "  - JWT_SECRET and JWT_REFRESH_SECRET"
        log_warning "  - Database passwords"
        log_warning "  - Email configuration"
        log_warning "  - SMS configuration"
        
        read -p "Do you want to continue with default values? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Please update .env file and run this script again."
            exit 1
        fi
    else
        log_info "Environment file already exists."
    fi
}

# Build and deploy the application
deploy_application() {
    log_info "Building and deploying application..."
    
    # Stop existing containers
    log_info "Stopping existing containers..."
    docker-compose down || true
    
    # Build new images
    log_info "Building Docker images..."
    docker-compose build --no-cache
    
    # Start services
    log_info "Starting services..."
    docker-compose up -d
    
    # Wait for services to be healthy
    log_info "Waiting for services to be ready..."
    sleep 30
    
    # Check service health
    log_info "Checking service health..."
    if docker-compose ps | grep -q "Up (healthy)"; then
        log_success "Services are healthy."
    else
        log_warning "Some services may not be fully ready yet."
    fi
    
    log_success "Application deployed successfully."
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."
    
    # Wait for database to be ready
    until docker-compose exec -T postgres pg_isready -U postgres; do
        log_info "Waiting for database to be ready..."
        sleep 2
    done
    
    # Run migrations
    docker-compose exec -T app npm run migrate || {
        log_warning "Migration script not found. Database will be initialized automatically."
    }
    
    # Seed initial data if needed
    if [[ -f scripts/seed.js ]]; then
        log_info "Seeding initial data..."
        docker-compose exec -T app npm run seed || {
            log_warning "Seeding script failed or not found."
        }
    fi
    
    log_success "Database setup completed."
}

# Setup monitoring (optional)
setup_monitoring() {
    if [[ "$1" == "--monitoring" ]]; then
        log_info "Setting up monitoring stack..."
        
        docker-compose --profile monitoring up -d
        
        log_success "Monitoring stack started."
        log_info "Access Grafana at: http://localhost:3001 (admin/admin123)"
        log_info "Access Prometheus at: http://localhost:9090"
        log_info "Access Kibana at: http://localhost:5601"
    fi
}

# Create backup
create_backup() {
    log_info "Creating database backup..."
    
    backup_name="backup_$(date +%Y%m%d_%H%M%S).sql"
    backup_path="database/backups/$backup_name"
    
    docker-compose exec -T postgres pg_dump -U postgres viksit_bharat_compliance > "$backup_path"
    
    if [[ -f "$backup_path" ]]; then
        log_success "Backup created: $backup_path"
        
        # Clean old backups
        find database/backups -name "backup_*.sql" -mtime +$BACKUP_RETENTION_DAYS -delete
        log_info "Old backups cleaned up (retention: $BACKUP_RETENTION_DAYS days)"
    else
        log_error "Failed to create backup."
    fi
}

# Show status
show_status() {
    log_info "Application Status:"
    docker-compose ps
    
    echo
    log_info "Application URLs:"
    log_info "  Main Application: http://localhost"
    log_info "  API Health Check: http://localhost/health"
    
    echo
    log_info "Service URLs:"
    log_info "  PostgreSQL: localhost:5432"
    log_info "  Redis: localhost:6379"
    log_info "  Prometheus: http://localhost:9090 (if monitoring enabled)"
    log_info "  Grafana: http://localhost:3001 (if monitoring enabled)"
    
    echo
    log_info "Default Credentials:"
    log_info "  Database: postgres/postgres123"
    log_info "  Redis: redis123"
}

# Cleanup function
cleanup() {
    log_info "Cleaning up..."
    
    # Stop all services
    docker-compose down
    
    # Remove unused images and volumes (optional)
    if [[ "$1" == "--cleanup" ]]; then
        log_info "Removing unused Docker resources..."
        docker system prune -af --volumes
    fi
}

# Help function
show_help() {
    echo "Viksit Bharat Compliance Suite - Deployment Script"
    echo
    echo "Usage: $0 [OPTIONS]"
    echo
    echo "Options:"
    echo "  deploy           Full deployment (default)"
    echo "  --monitoring     Deploy with monitoring stack"
    echo "  --cleanup        Clean up after deployment"
    echo "  --backup         Create database backup"
    echo "  --status         Show application status"
    echo "  --help           Show this help message"
    echo
    echo "Examples:"
    echo "  $0 deploy                    # Full deployment"
    echo "  $0 --monitoring             # Deploy with monitoring"
    echo "  $0 --backup                 # Create backup"
    echo "  $0 --status                 # Show status"
}

# Main script execution
main() {
    echo "============================================"
    echo "Viksit Bharat Compliance Suite Deployment"
    echo "============================================"
    echo
    
    case "${1:-deploy}" in
        "deploy")
            check_root
            check_requirements
            setup_directories
            generate_ssl_certs
            setup_environment
            deploy_application
            run_migrations
            show_status
            ;;
        "--monitoring")
            check_root
            check_requirements
            setup_directories
            generate_ssl_certs
            setup_environment
            deploy_application
            run_migrations
            setup_monitoring --monitoring
            show_status
            ;;
        "--cleanup")
            cleanup --cleanup
            ;;
        "--backup")
            create_backup
            ;;
        "--status")
            show_status
            ;;
        "--help"|"-h")
            show_help
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
}

# Trap errors and cleanup
trap 'log_error "Script failed. Cleaning up..."; cleanup' ERR

# Run main function
main "$@"