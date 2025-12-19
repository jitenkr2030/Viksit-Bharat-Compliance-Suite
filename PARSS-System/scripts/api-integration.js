// Landing Page API Integration
// Connects the landing page with the backend services

class LandingPageAPI {
    constructor() {
        this.baseURL = this.getBaseURL();
        this.init();
    }
    
    getBaseURL() {
        // Determine API base URL based on environment
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:5000/api';
        } else {
            return `${window.location.origin}/api`;
        }
    }
    
    init() {
        // Initialize API integrations when DOM is loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupIntegrations());
        } else {
            this.setupIntegrations();
        }
    }
    
    setupIntegrations() {
        this.setupStatsAPI();
        this.setupDemoFormAPI();
        this.setupIntegrationAPI();
        this.setupAnalyticsAPI();
    }
    
    // ========================================
    // STATISTICS API INTEGRATION
    // ========================================
    
    async setupStatsAPI() {
        try {
            const stats = await this.fetchPlatformStats();
            this.updateStatisticsDisplay(stats);
        } catch (error) {
            console.warn('Could not fetch platform statistics:', error);
            // Use fallback static data
            this.updateStatisticsDisplay(this.getFallbackStats());
        }
    }
    
    async fetchPlatformStats() {
        const response = await fetch(`${this.baseURL}/dashboard/statistics`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return response.json();
    }
    
    updateStatisticsDisplay(stats) {
        const statNumbers = document.querySelectorAll('.stat-number');
        
        statNumbers.forEach(stat => {
            const originalText = stat.textContent;
            
            if (originalText.includes('10,000+')) {
                stat.textContent = this.formatNumber(stats.totalInstitutions || 10247) + '+';
            } else if (originalText.includes('99.9%')) {
                stat.textContent = (stats.complianceRate || 99.2).toFixed(1) + '%';
            } else if (originalText.includes('24/7')) {
                stat.textContent = stats.aiMonitoring ? '24/7' : 'Business Hours';
            }
        });
    }
    
    getFallbackStats() {
        return {
            totalInstitutions: 10247,
            complianceRate: 99.2,
            aiMonitoring: true
        };
    }
    
    // ========================================
    // DEMO FORM API INTEGRATION
    // ========================================
    
    setupDemoFormAPI() {
        const demoForm = document.getElementById('demoForm');
        if (demoForm) {
            demoForm.addEventListener('submit', this.handleDemoSubmission.bind(this));
        }
    }
    
    async handleDemoSubmission(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const data = {
            company: formData.get('company'),
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            industry: formData.get('industry'),
            employees: formData.get('employees'),
            message: formData.get('message'),
            source: 'landing-page',
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            referrer: document.referrer
        };
        
        try {
            const response = await fetch(`${this.baseURL}/demo-requests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            this.showDemoSuccess();
            
            // Track conversion
            this.trackConversion('demo_request_submitted', data);
            
        } catch (error) {
            console.error('Demo submission failed:', error);
            this.showDemoError('Sorry, there was an error submitting your request. Please try again or contact us directly.');
        }
    }
    
    showDemoSuccess() {
        const modal = document.getElementById('demoModal');
        if (modal) {
            const modalBody = modal.querySelector('.modal-body');
            modalBody.innerHTML = `
                <div class="success-message">
                    <div class="success-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M20 6L9 17l-5-5"/>
                        </svg>
                    </div>
                    <h3>Thank You!</h3>
                    <p>Your demo request has been submitted successfully. Our team will contact you within 24 hours to schedule your personalized demo.</p>
                    <button class="btn btn-primary" onclick="document.getElementById('demoModal').classList.remove('active'); document.body.style.overflow = '';">Close</button>
                </div>
            `;
        }
    }
    
    showDemoError(message) {
        // This would be handled by the existing form validation system
        console.error(message);
    }
    
    // ========================================
    // INTEGRATION API INTEGRATION
    // ========================================
    
    setupIntegrationAPI() {
        // Update integration logos with real-time status
        this.updateIntegrationStatus();
    }
    
    async updateIntegrationStatus() {
        try {
            const response = await fetch(`${this.baseURL}/integrations/status`);
            if (response.ok) {
                const status = await response.json();
                this.highlightActiveIntegrations(status);
            }
        } catch (error) {
            console.warn('Could not fetch integration status:', error);
        }
    }
    
    highlightActiveIntegrations(status) {
        const integrationLogos = document.querySelectorAll('.integration-logo');
        
        integrationLogos.forEach(logo => {
            const logoName = logo.querySelector('.logo-text').textContent.toLowerCase();
            
            if (status[logoName] === 'active') {
                logo.classList.add('integration-active');
                logo.title = `${logoName} integration is active`;
            } else {
                logo.classList.add('integration-inactive');
                logo.title = `${logoName} integration is available`;
            }
        });
    }
    
    // ========================================
    // ANALYTICS API INTEGRATION
    // ========================================
    
    setupAnalyticsAPI() {
        this.trackPageView();
        this.setupScrollTracking();
        this.setupClickTracking();
    }
    
    trackPageView() {
        const analyticsData = {
            event: 'page_view',
            page: 'landing-page',
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            referrer: document.referrer,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };
        
        this.sendAnalytics(analyticsData);
    }
    
    setupScrollTracking() {
        let maxScroll = 0;
        const scrollThresholds = [25, 50, 75, 100];
        const trackedThresholds = new Set();
        
        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                
                scrollThresholds.forEach(threshold => {
                    if (scrollPercent >= threshold && !trackedThresholds.has(threshold)) {
                        trackedThresholds.add(threshold);
                        this.trackEvent('scroll_depth', { threshold });
                    }
                });
            }
        });
    }
    
    setupClickTracking() {
        // Track CTA button clicks
        document.addEventListener('click', (event) => {
            const element = event.target.closest('.btn, .nav-link, .integration-logo');
            if (element) {
                this.trackEvent('click', {
                    element: element.className,
                    text: element.textContent.trim(),
                    href: element.href
                });
            }
        });
    }
    
    async trackEvent(eventName, data) {
        const analyticsData = {
            event: eventName,
            data: data,
            timestamp: new Date().toISOString(),
            page: 'landing-page'
        };
        
        this.sendAnalytics(analyticsData);
    }
    
    async trackConversion(conversionType, data) {
        const conversionData = {
            event: 'conversion',
            conversion_type: conversionType,
            data: data,
            timestamp: new Date().toISOString(),
            value: 1
        };
        
        this.sendAnalytics(conversionData);
    }
    
    async sendAnalytics(data) {
        try {
            await fetch(`${this.baseURL}/analytics/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
        } catch (error) {
            // Silently fail analytics to not impact user experience
            console.warn('Analytics send failed:', error);
        }
    }
    
    // ========================================
    // UTILITY FUNCTIONS
    // ========================================
    
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
}

// Initialize the landing page API integration
window.LandingPageAPI = new LandingPageAPI();