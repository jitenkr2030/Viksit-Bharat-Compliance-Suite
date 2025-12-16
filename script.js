// ====================================
// VIKSIT BHARAT COMPLIANCE SUITE SCRIPT
// Interactive functionality for all modules
// ====================================

// Application State Management
const AppState = {
    currentSection: 'dashboard',
    notifications: [],
    complianceScores: {
        regulatory: 75,
        standards: 85,
        accreditation: 60
    },
    alerts: [],
    user: {
        name: 'Compliance Officer',
        role: 'admin',
        institution: 'Delhi Public School'
    }
};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Hide loading screen after delay
    setTimeout(() => {
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
        initializeLucideIcons();
        setupEventListeners();
        initializeAnimations();
        loadDashboardData();
    }, 1500);
}

// Initialize Lucide Icons
function initializeLucideIcons() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Event Listeners Setup
function setupEventListeners() {
    // Navigation
    setupNavigation();
    
    // Quick Actions
    setupQuickActions();
    
    // Table Interactions
    setupTableInteractions();
    
    // Alert Management
    setupAlertManagement();
    
    // Settings Management
    setupSettingsManagement();
    
    // AI Assistant
    setupAIAssistant();
    
    // Mobile Navigation
    setupMobileNavigation();
    
    // Keyboard Shortcuts
    setupKeyboardShortcuts();
    
    // Auto-save functionality
    setupAutoSave();
}

// Navigation System
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const contentSections = document.querySelectorAll('.content-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            navigateToSection(section);
            
            // Update active state
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function navigateToSection(sectionName) {
    // Hide all sections
    const contentSections = document.querySelectorAll('.content-section');
    contentSections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
        AppState.currentSection = sectionName;
        
        // Load section-specific data
        loadSectionData(sectionName);
        
        // Update breadcrumb
        updateBreadcrumb(sectionName);
    }
}

function loadSectionData(sectionName) {
    switch(sectionName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'regulatory':
            loadRegulatoryData();
            break;
        case 'standards':
            loadStandardsData();
            break;
        case 'accreditation':
            loadAccreditationData();
            break;
        case 'alerts':
            loadAlertsData();
            break;
        case 'reports':
            loadReportsData();
            break;
    }
}

function updateBreadcrumb(sectionName) {
    const breadcrumbItems = document.querySelectorAll('.breadcrumb-item');
    if (breadcrumbItems.length >= 2) {
        breadcrumbItems[1].textContent = getSectionDisplayName(sectionName);
    }
}

function getSectionDisplayName(sectionName) {
    const sectionNames = {
        'dashboard': 'Overview',
        'regulatory': 'Viniyaman Parishad',
        'approvals': 'Approval Tracker',
        'documents': 'Document Vault',
        'standards': 'Manak Parishad',
        'curriculum': 'Curriculum Tracker',
        'faculty': 'Faculty Credentials',
        'accreditation': 'Gunvatta Parishad',
        'readiness': 'Accreditation Readiness',
        'audit': 'Self-Audit Reports',
        'alerts': 'Alerts & Reminders',
        'reports': 'Reports & Analytics',
        'settings': 'Settings'
    };
    return sectionNames[sectionName] || sectionName;
}

// Quick Actions
function setupQuickActions() {
    const actionBtns = document.querySelectorAll('.action-btn');
    
    actionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.textContent.trim();
            handleQuickAction(action);
        });
    });
}

function handleQuickAction(action) {
    switch(action) {
        case 'Add New Approval':
            showModal('Add New Approval', createApprovalForm());
            break;
        case 'Upload Documents':
            showModal('Upload Documents', createUploadForm());
            break;
        case 'Generate Report':
            generateComplianceReport();
            break;
        case 'Run Compliance Check':
            runComplianceCheck();
            break;
        default:
            console.log('Action:', action);
    }
}

// Table Interactions
function setupTableInteractions() {
    // Table row interactions
    const tableRows = document.querySelectorAll('.table-row:not(.table-header-row)');
    
    tableRows.forEach(row => {
        row.addEventListener('click', function(e) {
            if (!e.target.closest('button')) {
                const rowData = getRowData(this);
                showRowDetails(rowData);
            }
        });
    });
    
    // Icon button interactions
    document.addEventListener('click', function(e) {
        if (e.target.closest('.icon-btn')) {
            e.stopPropagation();
            const btn = e.target.closest('.icon-btn');
            const action = btn.querySelector('i').getAttribute('data-lucide');
            handleIconAction(action, btn);
        }
    });
}

function getRowData(row) {
    const cells = row.querySelectorAll('.table-cell');
    return {
        type: cells[0]?.querySelector('strong')?.textContent || '',
        description: cells[0]?.querySelector('small')?.textContent || '',
        institution: cells[1]?.textContent || '',
        date: cells[2]?.textContent || '',
        status: cells[3]?.querySelector('.status-pill')?.textContent || ''
    };
}

function showRowDetails(data) {
    const content = `
        <div class="detail-modal">
            <h3>${data.type}</h3>
            <p><strong>Description:</strong> ${data.description}</p>
            <p><strong>Institution:</strong> ${data.institution}</p>
            <p><strong>Date:</strong> ${data.date}</p>
            <p><strong>Status:</strong> ${data.status}</p>
            <div class="modal-actions">
                <button class="btn-primary">Edit</button>
                <button class="btn-secondary">View Document</button>
            </div>
        </div>
    `;
    showModal('Details', content);
}

function handleIconAction(action, btn) {
    switch(action) {
        case 'eye':
            // View action
            showNotification('Opening document...', 'info');
            break;
        case 'edit':
            // Edit action
            showNotification('Opening editor...', 'info');
            break;
        case 'download':
            // Download action
            showNotification('Preparing download...', 'info');
            break;
    }
}

// Alert Management
function setupAlertManagement() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            filterAlerts(filter);
            
            // Update active state
            filterBtns.forEach(f => f.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Alert action buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('alert-action')) {
            e.preventDefault();
            const alertItem = e.target.closest('.alert-item');
            handleAlertAction(alertItem, e.target.textContent.trim());
        }
    });
}

function filterAlerts(filter) {
    const alertItems = document.querySelectorAll('.alert-item');
    
    alertItems.forEach(item => {
        if (filter === 'all') {
            item.style.display = 'flex';
        } else {
            const priority = item.classList.contains(filter) ? 'flex' : 'none';
            item.style.display = priority;
        }
    });
}

function handleAlertAction(alertItem, action) {
    const alertTitle = alertItem.querySelector('h4').textContent;
    
    switch(action) {
        case 'Take Action':
            navigateToSection('regulatory');
            showNotification(`Opening ${alertTitle}...`, 'info');
            break;
        case 'Continue':
            navigateToSection('accreditation');
            showNotification(`Continuing with ${alertTitle}...`, 'info');
            break;
        case 'Assign Training':
            navigateToSection('faculty');
            showNotification(`Assigning training for ${alertTitle}...`, 'info');
            break;
        case 'Review Guidelines':
            showNotification('Opening guidelines...', 'info');
            break;
        default:
            showNotification(`Action: ${action}`, 'info');
    }
}

// Settings Management
function setupSettingsManagement() {
    const settingToggles = document.querySelectorAll('.setting-item input[type="checkbox"]');
    
    settingToggles.forEach(toggle => {
        toggle.addEventListener('change', function() {
            const settingName = this.closest('.setting-item').querySelector('span').textContent;
            const isEnabled = this.checked;
            
            // Save setting
            saveSetting(settingName, isEnabled);
            
            // Show feedback
            const status = isEnabled ? 'enabled' : 'disabled';
            showNotification(`${settingName} ${status}`, 'success');
        });
    });
}

function saveSetting(name, value) {
    const settings = JSON.parse(localStorage.getItem('complianceSettings') || '{}');
    settings[name] = value;
    localStorage.setItem('complianceSettings', JSON.stringify(settings));
}

// AI Assistant
function setupAIAssistant() {
    const aiInput = document.querySelector('.ai-input input');
    const aiSendBtn = document.querySelector('.ai-input button');
    
    if (aiSendBtn) {
        aiSendBtn.addEventListener('click', sendAIMessage);
    }
    
    if (aiInput) {
        aiInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendAIMessage();
            }
        });
    }
}

function toggleAI() {
    const chat = document.querySelector('.ai-chat');
    chat.classList.toggle('hidden');
    
    if (!chat.classList.contains('hidden')) {
        // Focus on input
        setTimeout(() => {
            const aiInput = document.querySelector('.ai-input input');
            if (aiInput) aiInput.focus();
        }, 100);
    }
}

function sendAIMessage() {
    const aiInput = document.querySelector('.ai-input input');
    const messagesContainer = document.querySelector('.ai-messages');
    
    if (!aiInput || !aiInput.value.trim()) return;
    
    const userMessage = aiInput.value.trim();
    aiInput.value = '';
    
    // Add user message
    addAIMessage(userMessage, 'user');
    
    // Simulate AI response
    setTimeout(() => {
        const response = generateAIResponse(userMessage);
        addAIMessage(response, 'ai');
    }, 1000);
}

function addAIMessage(text, sender) {
    const messagesContainer = document.querySelector('.ai-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `ai-message ${sender}`;
    
    if (sender === 'ai') {
        messageDiv.innerHTML = `
            <div class="ai-avatar">AI</div>
            <div class="ai-text">${text}</div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="ai-text" style="background: var(--primary-500); color: white;">${text}</div>
            <div class="ai-avatar">U</div>
        `;
    }
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function generateAIResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('compliance') || lowerMessage.includes('score')) {
        return "Your current compliance scores are: Regulatory (75%), Standards (85%), and Accreditation (60%). The Standards Council is performing excellently, but the Accreditation Council needs attention.";
    } else if (lowerMessage.includes('deadline') || lowerMessage.includes('due')) {
        return "You have 3 critical deadlines approaching: Faculty approval renewal (Jan 15), NAAC documentation (Feb 1), and faculty training updates (Jan 20).";
    } else if (lowerMessage.includes('faculty') || lowerMessage.includes('teacher')) {
        return "You have 45 out of 48 faculty members certified. 3 faculty members need training updates. Would you like me to help you assign training modules?";
    } else if (lowerMessage.includes('document') || lowerMessage.includes('upload')) {
        return "I can help you upload documents to the secure vault. What type of document are you looking to upload? Approvals, licenses, or certificates?";
    } else if (lowerMessage.includes('report') || lowerMessage.includes('generate')) {
        return "I can generate several types of reports: Compliance Summary, Monthly Audit, or Performance Analytics. Which report would you like to create?";
    } else {
        return "I'm here to help with compliance management. You can ask me about compliance scores, deadlines, faculty status, document management, or report generation.";
    }
}

// Mobile Navigation
function setupMobileNavigation() {
    // Add mobile menu toggle if needed
    const header = document.querySelector('.header');
    const sidebar = document.querySelector('.sidebar');
    
    // Create mobile menu button
    const mobileMenuBtn = document.createElement('button');
    mobileMenuBtn.className = 'mobile-menu-btn';
    mobileMenuBtn.innerHTML = '<i data-lucide="menu"></i>';
    mobileMenuBtn.style.cssText = `
        display: none;
        background: none;
        border: none;
        cursor: pointer;
        padding: 8px;
        border-radius: 4px;
    `;
    
    header.querySelector('.header-left').appendChild(mobileMenuBtn);
    
    // Toggle sidebar on mobile
    mobileMenuBtn.addEventListener('click', function() {
        sidebar.classList.toggle('open');
    });
    
    // Close sidebar when clicking outside
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768 && 
            !sidebar.contains(e.target) && 
            !mobileMenuBtn.contains(e.target)) {
            sidebar.classList.remove('open');
        }
    });
}

// Keyboard Shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + number keys for quick navigation
        if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '9') {
            e.preventDefault();
            const sectionIndex = parseInt(e.key) - 1;
            const sections = ['dashboard', 'regulatory', 'standards', 'accreditation', 'alerts', 'reports', 'settings'];
            if (sections[sectionIndex]) {
                navigateToSection(sections[sectionIndex]);
            }
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            closeModal();
            const chat = document.querySelector('.ai-chat');
            if (chat && !chat.classList.contains('hidden')) {
                chat.classList.add('hidden');
            }
        }
    });
}

// Auto-save functionality
function setupAutoSave() {
    // Auto-save form data every 30 seconds
    setInterval(saveFormData, 30000);
    
    // Save before page unload
    window.addEventListener('beforeunload', saveFormData);
}

function saveFormData() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const formData = new FormData(form);
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        localStorage.setItem(`form_${form.id || 'default'}`, JSON.stringify(data));
    });
}

// Animation Initialization
function initializeAnimations() {
    // Animate progress rings
    animateProgressRings();
    
    // Animate score cards
    animateScoreCards();
    
    // Stagger alert animations
    animateAlerts();
}

function animateProgressRings() {
    const progressCircles = document.querySelectorAll('.progress-ring-progress');
    
    progressCircles.forEach((circle, index) => {
        setTimeout(() => {
            const circumference = 2 * Math.PI * 30; // r = 30
            const score = getScoreForCircle(circle);
            const offset = circumference - (score / 100) * circumference;
            
            circle.style.strokeDasharray = circumference;
            circle.style.strokeDashoffset = offset;
        }, index * 200);
    });
}

function getScoreForCircle(circle) {
    const card = circle.closest('.score-card');
    const scoreValue = card.querySelector('.score-value');
    return parseInt(scoreValue.textContent) || 0;
}

function animateScoreCards() {
    const scoreCards = document.querySelectorAll('.score-card');
    
    scoreCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'all 0.6s ease-out';
            
            requestAnimationFrame(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            });
        }, index * 150);
    });
}

function animateAlerts() {
    const alertCards = document.querySelectorAll('.alert-card');
    
    alertCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateX(20px)';
        card.style.transition = 'all 0.4s ease-out';
        
        setTimeout(() => {
            requestAnimationFrame(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateX(0)';
            });
        }, 300 + index * 100);
    });
}

// Data Loading Functions
function loadDashboardData() {
    // Update real-time data
    updateComplianceScores();
    updateNotificationBadge();
    refreshAlertCards();
}

function loadRegulatoryData() {
    // Load regulatory-specific data
    console.log('Loading regulatory data...');
}

function loadStandardsData() {
    // Load standards-specific data
    console.log('Loading standards data...');
}

function loadAccreditationData() {
    // Load accreditation-specific data
    updateChecklistProgress();
}

function loadAlertsData() {
    // Refresh alerts list
    console.log('Loading alerts data...');
}

function loadReportsData() {
    // Load reports data
    console.log('Loading reports data...');
}

function updateComplianceScores() {
    // Simulate real-time score updates
    const scores = {
        regulatory: Math.floor(Math.random() * 20) + 70,
        standards: Math.floor(Math.random() * 15) + 80,
        accreditation: Math.floor(Math.random() * 25) + 55
    };
    
    Object.keys(scores).forEach(council => {
        const scoreCard = document.querySelector(`.score-card.${council}`);
        if (scoreCard) {
            const scoreValue = scoreCard.querySelector('.score-value');
            const progressCircle = scoreCard.querySelector('.progress-ring-progress');
            
            if (scoreValue) scoreValue.textContent = `${scores[council]}%`;
            if (progressCircle) {
                const circumference = 2 * Math.PI * 30;
                const offset = circumference - (scores[council] / 100) * circumference;
                progressCircle.style.strokeDashoffset = offset;
            }
        }
    });
}

function updateNotificationBadge() {
    const badge = document.querySelector('.notification-badge');
    if (badge) {
        const alertCount = document.querySelectorAll('.alert-item').length;
        badge.textContent = alertCount;
    }
}

function updateChecklistProgress() {
    const progressBars = document.querySelectorAll('.progress-fill');
    
    progressBars.forEach(bar => {
        const targetWidth = bar.style.width;
        bar.style.width = '0%';
        
        setTimeout(() => {
            bar.style.width = targetWidth;
        }, 500);
    });
}

// Modal System
function showModal(title, content) {
    // Remove existing modal
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        animation: fadeIn 0.3s ease-out;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.cssText = `
        background: white;
        border-radius: 12px;
        padding: 24px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        animation: slideUp 0.3s ease-out;
    `;
    
    modalContent.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2 style="margin: 0; color: var(--neutral-900);">${title}</h2>
            <button onclick="closeModal()" style="background: none; border: none; cursor: pointer; padding: 4px;">
                <i data-lucide="x" style="width: 20px; height: 20px;"></i>
            </button>
        </div>
        <div class="modal-body">${content}</div>
    `;
    
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
    
    // Initialize icons in modal
    initializeLucideIcons();
    
    // Close on overlay click
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
}

function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'var(--success-500)' : type === 'error' ? 'var(--danger-500)' : 'var(--primary-500)'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: var(--shadow-lg);
        z-index: 1001;
        animation: slideInRight 0.3s ease-out;
        max-width: 300px;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Utility Functions
function createApprovalForm() {
    return `
        <form id="approval-form">
            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 4px; font-weight: 500;">Approval Type</label>
                <select style="width: 100%; padding: 8px; border: 1px solid var(--neutral-200); border-radius: 4px;">
                    <option>Establishment License</option>
                    <option>Faculty Registration</option>
                    <option>Infrastructure Approval</option>
                    <option>Affiliation Certificate</option>
                </select>
            </div>
            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 4px; font-weight: 500;">Institution Name</label>
                <input type="text" style="width: 100%; padding: 8px; border: 1px solid var(--neutral-200); border-radius: 4px;" value="${AppState.user.institution}">
            </div>
            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 4px; font-weight: 500;">Valid Until</label>
                <input type="date" style="width: 100%; padding: 8px; border: 1px solid var(--neutral-200); border-radius: 4px;">
            </div>
            <div style="display: flex; gap: 12px; justify-content: flex-end;">
                <button type="button" onclick="closeModal()" class="btn-secondary">Cancel</button>
                <button type="submit" class="btn-primary">Save Approval</button>
            </div>
        </form>
    `;
}

function createUploadForm() {
    return `
        <form id="upload-form">
            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 4px; font-weight: 500;">Document Type</label>
                <select style="width: 100%; padding: 8px; border: 1px solid var(--neutral-200); border-radius: 4px;">
                    <option>Approval Document</option>
                    <option>License Certificate</option>
                    <option>Affiliation Letter</option>
                    <option>Compliance Report</option>
                </select>
            </div>
            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 4px; font-weight: 500;">Upload File</label>
                <input type="file" style="width: 100%; padding: 8px; border: 1px solid var(--neutral-200); border-radius: 4px;" accept=".pdf,.doc,.docx,.jpg,.png">
            </div>
            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 4px; font-weight: 500;">Description</label>
                <textarea style="width: 100%; padding: 8px; border: 1px solid var(--neutral-200); border-radius: 4px; height: 80px;" placeholder="Brief description of the document..."></textarea>
            </div>
            <div style="display: flex; gap: 12px; justify-content: flex-end;">
                <button type="button" onclick="closeModal()" class="btn-secondary">Cancel</button>
                <button type="submit" class="btn-primary">Upload Document</button>
            </div>
        </form>
    `;
}

// Compliance Functions
function generateComplianceReport() {
    showNotification('Generating comprehensive compliance report...', 'info');
    
    setTimeout(() => {
        const reportData = {
            regulatory: AppState.complianceScores.regulatory,
            standards: AppState.complianceScores.standards,
            accreditation: AppState.complianceScores.accreditation,
            timestamp: new Date().toISOString(),
            institution: AppState.user.institution
        };
        
        // Create downloadable report
        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `compliance-report-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        showNotification('Compliance report generated and downloaded!', 'success');
    }, 2000);
}

function runComplianceCheck() {
    showNotification('Running comprehensive compliance check...', 'info');
    
    // Simulate compliance check
    setTimeout(() => {
        const issues = [
            '3 faculty approvals expiring within 30 days',
            'NAAC documentation incomplete',
            '2 faculty members missing mandatory training'
        ];
        
        const status = issues.length > 0 ? 'warning' : 'success';
        const message = issues.length > 0 
            ? `Compliance check completed. Found ${issues.length} issues that need attention.`
            : 'Compliance check completed. All systems are compliant!';
            
        showNotification(message, status);
        
        // Show detailed results
        if (issues.length > 0) {
            const content = `
                <h4>Compliance Issues Found:</h4>
                <ul style="margin: 16px 0; padding-left: 20px;">
                    ${issues.map(issue => `<li>${issue}</li>`).join('')}
                </ul>
                <p>Please address these issues to maintain full compliance.</p>
            `;
            showModal('Compliance Check Results', content);
        }
    }, 3000);
}

// Data Refresh Functions
function refreshAlertCards() {
    // Simulate real-time alert updates
    const alerts = [
        {
            type: 'critical',
            title: 'Faculty Approval Expiring',
            message: '5 faculty approvals expire in 30 days. Immediate renewal required.',
            time: 'Due: Jan 15, 2025'
        },
        {
            type: 'warning',
            title: 'NAAC Documentation Due',
            message: 'Self-study report submission deadline approaching.',
            time: 'Due: Feb 1, 2025'
        },
        {
            type: 'info',
            title: 'NEP 2020 Policy Update',
            message: 'New curriculum guidelines published by Manak Parishad.',
            time: 'Published: Dec 10, 2025'
        }
    ];
    
    // Update alert cards if needed
    console.log('Alert cards refreshed');
}

// Export functions for global access
window.navigateToSection = navigateToSection;
window.toggleAI = toggleAI;
window.closeModal = closeModal;
window.showNotification = showNotification;

// Add CSS animations for modals and notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes slideUp {
        from {
            transform: translateY(20px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);