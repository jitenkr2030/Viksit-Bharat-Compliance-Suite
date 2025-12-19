// Demo form handling for PARSS (Penalty Avoidance & Regulatory Survival System) Landing Page

class DemoFormHandler {
    constructor() {
        this.form = null;
        this.isSubmitting = false;
        this.validationRules = {};
        this.init();
    }
    
    init() {
        this.form = document.getElementById('demoForm');
        if (this.form) {
            this.setupValidationRules();
            this.bindEvents();
            this.setupAutoSave();
        }
    }
    
    setupValidationRules() {
        this.validationRules = {
            company: {
                required: true,
                minLength: 2,
                maxLength: 100,
                pattern: /^[a-zA-Z0-9\s\-\.&,()]+$/,
                message: 'Company name must be 2-100 characters and contain only letters, numbers, spaces, and basic punctuation'
            },
            firstName: {
                required: true,
                minLength: 2,
                maxLength: 50,
                pattern: /^[a-zA-Z\s]+$/,
                message: 'First name must be 2-50 characters and contain only letters'
            },
            lastName: {
                required: true,
                minLength: 2,
                maxLength: 50,
                pattern: /^[a-zA-Z\s]+$/,
                message: 'Last name must be 2-50 characters and contain only letters'
            },
            email: {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Please enter a valid email address'
            },
            phone: {
                required: true,
                pattern: /^[\+]?[1-9][\d]{0,15}$/,
                message: 'Please enter a valid phone number'
            },
            industry: {
                required: true,
                message: 'Please select an industry'
            },
            employees: {
                required: true,
                message: 'Please select the number of employees'
            },
            message: {
                maxLength: 500,
                message: 'Message must be less than 500 characters'
            }
        };
    }
    
    bindEvents() {
        // Form submission
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        
        // Real-time validation
        const inputs = this.form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', this.validateField.bind(this));
            input.addEventListener('input', this.clearFieldError.bind(this));
            input.addEventListener('change', this.validateField.bind(this));
        });
        
        // Phone number formatting
        const phoneInput = this.form.querySelector('#phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', this.formatPhoneNumber.bind(this));
        }
        
        // Auto-save functionality
        this.setupAutoSave();
    }
    
    validateField(event) {
        const field = event.target;
        const name = field.name;
        const value = field.value.trim();
        
        // Remove existing error
        this.clearFieldError(event);
        
        // Get validation rule
        const rule = this.validationRules[name];
        if (!rule) return true;
        
        // Required field validation
        if (rule.required && !value) {
            this.showFieldError(field, 'This field is required');
            return false;
        }
        
        // Skip other validations if field is empty and not required
        if (!value && !rule.required) return true;
        
        // Pattern validation
        if (rule.pattern && !rule.pattern.test(value)) {
            this.showFieldError(field, rule.message);
            return false;
        }
        
        // Length validation
        if (rule.minLength && value.length < rule.minLength) {
            this.showFieldError(field, `Minimum ${rule.minLength} characters required`);
            return false;
        }
        
        if (rule.maxLength && value.length > rule.maxLength) {
            this.showFieldError(field, `Maximum ${rule.maxLength} characters allowed`);
            return false;
        }
        
        // Custom validations
        if (name === 'email') {
            return this.validateEmail(field, value);
        }
        
        if (name === 'phone') {
            return this.validatePhone(field, value);
        }
        
        return true;
    }
    
    validateEmail(field, value) {
        // Additional email validations
        const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
        const domain = value.split('@')[1];
        
        if (domain && !commonDomains.includes(domain.toLowerCase())) {
            // This is actually good for business emails, so we'll allow it
            // but could add a warning if desired
        }
        
        return true;
    }
    
    validatePhone(field, value) {
        // Clean phone number
        const cleanNumber = value.replace(/[\s\-\(\)\+]/g, '');
        
        if (cleanNumber.length < 10) {
            this.showFieldError(field, 'Phone number must be at least 10 digits');
            return false;
        }
        
        if (cleanNumber.length > 15) {
            this.showFieldError(field, 'Phone number cannot exceed 15 digits');
            return false;
        }
        
        return true;
    }
    
    formatPhoneNumber(event) {
        const field = event.target;
        let value = field.value.replace(/\D/g, '');
        
        // Format as (XXX) XXX-XXXX for US numbers or +XX XXX XXX XXXX for international
        if (value.startsWith('1') && value.length === 11) {
            value = value.substring(1);
        }
        
        if (value.length >= 6) {
            field.value = `(${value.substring(0, 3)}) ${value.substring(3, 6)}-${value.substring(6, 10)}`;
        } else if (value.length >= 3) {
            field.value = `(${value.substring(0, 3)}) ${value.substring(3)}`;
        } else {
            field.value = value;
        }
    }
    
    showFieldError(field, message) {
        field.classList.add('error');
        field.setAttribute('aria-invalid', 'true');
        
        // Remove existing error message
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Add new error message
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.setAttribute('role', 'alert');
        errorElement.textContent = message;
        
        field.parentNode.appendChild(errorElement);
        
        // Add error to aria-describedby
        const errorId = `error-${field.name}`;
        errorElement.id = errorId;
        field.setAttribute('aria-describedby', errorId);
    }
    
    clearFieldError(event) {
        const field = event.target;
        field.classList.remove('error');
        field.setAttribute('aria-invalid', 'false');
        
        // Remove error message
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
        
        // Remove aria-describedby
        field.removeAttribute('aria-describedby');
    }
    
    async handleSubmit(event) {
        event.preventDefault();
        
        if (this.isSubmitting) return;
        
        // Validate entire form
        if (!this.validateForm()) {
            this.showFormMessage('Please correct the errors above and try again.', 'error');
            return;
        }
        
        this.isSubmitting = true;
        this.setSubmitButtonState(true);
        
        try {
            // Collect form data
            const formData = this.collectFormData();
            
            // Simulate API call (replace with actual endpoint)
            await this.submitFormData(formData);
            
            // Success handling
            this.handleSuccess();
            
        } catch (error) {
            console.error('Form submission error:', error);
            this.handleError(error);
        } finally {
            this.isSubmitting = false;
            this.setSubmitButtonState(false);
        }
    }
    
    validateForm() {
        const inputs = this.form.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            const fieldEvent = { target: input };
            if (!this.validateField(fieldEvent)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    collectFormData() {
        const formData = new FormData(this.form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        // Add metadata
        data.timestamp = new Date().toISOString();
        data.userAgent = navigator.userAgent;
        data.referrer = document.referrer;
        
        return data;
    }
    
    async submitFormData(data) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate random failure for testing (remove in production)
        if (Math.random() < 0.1) {
            throw new Error('Network error. Please try again.');
        }
        
        // In production, replace this with actual API call:
        /*
        const response = await fetch('/api/demo-requests', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return response.json();
        */
        
        console.log('Demo request submitted:', data);
        return { success: true, message: 'Demo request submitted successfully' };
    }
    
    handleSuccess() {
        // Show success message
        this.showFormMessage(
            'Thank you for your interest! Our team will contact you within 24 hours to schedule your personalized demo.',
            'success'
        );
        
        // Reset form
        setTimeout(() => {
            this.form.reset();
            this.clearAllErrors();
        }, 1000);
        
        // Close modal after delay
        setTimeout(() => {
            this.closeModal();
        }, 3000);
        
        // Track conversion (if analytics is set up)
        this.trackConversion();
    }
    
    handleError(error) {
        this.showFormMessage(
            'Sorry, there was an error submitting your request. Please try again or contact us directly.',
            'error'
        );
    }
    
    setSubmitButtonState(isSubmitting) {
        const button = this.form.querySelector('button[type="submit"]');
        if (button) {
            if (isSubmitting) {
                button.textContent = 'Submitting...';
                button.disabled = true;
                button.classList.add('loading');
            } else {
                button.textContent = 'Request Demo';
                button.disabled = false;
                button.classList.remove('loading');
            }
        }
    }
    
    showFormMessage(message, type) {
        // Remove existing messages
        const existingMessage = this.form.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Create new message
        const messageElement = document.createElement('div');
        messageElement.className = `form-message ${type}`;
        messageElement.setAttribute('role', 'alert');
        messageElement.textContent = message;
        
        // Insert at top of form
        this.form.insertBefore(messageElement, this.form.firstChild);
        
        // Auto-remove success messages
        if (type === 'success') {
            setTimeout(() => {
                messageElement.remove();
            }, 8000);
        }
    }
    
    clearAllErrors() {
        const errorElements = this.form.querySelectorAll('.field-error');
        errorElements.forEach(error => error.remove());
        
        const errorFields = this.form.querySelectorAll('.error');
        errorFields.forEach(field => {
            field.classList.remove('error');
            field.setAttribute('aria-invalid', 'false');
            field.removeAttribute('aria-describedby');
        });
    }
    
    closeModal() {
        const modal = document.getElementById('demoModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    setupAutoSave() {
        const inputs = this.form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('input', this.debounce(this.saveFormData.bind(this), 1000));
        });
        
        // Load saved data on page load
        this.loadFormData();
    }
    
    saveFormData() {
        const formData = new FormData(this.form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        // Save to localStorage
        localStorage.setItem('demoFormData', JSON.stringify(data));
    }
    
    loadFormData() {
        const savedData = localStorage.getItem('demoFormData');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                
                Object.keys(data).forEach(key => {
                    const field = this.form.querySelector(`[name="${key}"]`);
                    if (field) {
                        field.value = data[key];
                    }
                });
            } catch (error) {
                console.error('Error loading saved form data:', error);
                localStorage.removeItem('demoFormData');
            }
        }
    }
    
    trackConversion() {
        // Google Analytics tracking (if available)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'conversion', {
                send_to: 'AW-CONVERSION_ID/CONVERSION_LABEL',
                value: 1.0,
                currency: 'INR'
            });
        }
        
        // Facebook Pixel tracking (if available)
        if (typeof fbq !== 'undefined') {
            fbq('track', 'Lead');
        }
        
        // Custom analytics
        console.log('Demo request conversion tracked');
    }
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// ========================================
// ENHANCED FORM VALIDATION
// ========================================

class FormValidator {
    constructor(form) {
        this.form = form;
        this.rules = {};
        this.init();
    }
    
    init() {
        this.setupCustomValidation();
        this.setupFieldDependencies();
    }
    
    setupCustomValidation() {
        // Company size validation based on industry
        const industrySelect = this.form.querySelector('#industry');
        const employeesSelect = this.form.querySelector('#employees');
        
        if (industrySelect && employeesSelect) {
            industrySelect.addEventListener('change', () => {
                this.validateIndustryEmployees(industrySelect.value, employeesSelect.value);
            });
            
            employeesSelect.addEventListener('change', () => {
                this.validateIndustryEmployees(industrySelect.value, employeesSelect.value);
            });
        }
    }
    
    validateIndustryEmployees(industry, employees) {
        // Add logic to validate if the company size makes sense for the industry
        const field = this.form.querySelector('#employees');
        const existingError = field.parentNode.querySelector('.field-error');
        
        // Example validation (customize based on your needs)
        if (industry === 'education' && employees === '1-50') {
            // This might be unusual for education institutions
            if (!existingError) {
                this.showFieldError(field, 'For education institutions, larger organizations are more common. Please verify your selection.');
            }
        } else if (existingError) {
            existingError.remove();
        }
    }
    
    setupFieldDependencies() {
        // Setup conditional field validation
        const messageField = this.form.querySelector('#message');
        const phoneField = this.form.querySelector('#phone');
        
        // Make message required if no phone number
        if (messageField && phoneField) {
            phoneField.addEventListener('blur', () => {
                if (!phoneField.value.trim()) {
                    messageField.setAttribute('required', 'true');
                    messageField.setAttribute('aria-required', 'true');
                } else {
                    messageField.removeAttribute('required');
                    messageField.removeAttribute('aria-required');
                }
            });
        }
    }
    
    showFieldError(field, message) {
        field.classList.add('error');
        field.setAttribute('aria-invalid', 'true');
        
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.setAttribute('role', 'alert');
        errorElement.textContent = message;
        
        field.parentNode.appendChild(errorElement);
    }
}

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    const demoForm = document.getElementById('demoForm');
    if (demoForm) {
        new DemoFormHandler(demoForm);
        new FormValidator(demoForm);
    }
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DemoFormHandler,
        FormValidator
    };
}