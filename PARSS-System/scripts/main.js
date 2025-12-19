// Main JavaScript for Viksit Bharat Landing Page

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavigation();
    initScrollAnimations();
    initIntersectionObserver();
    initCounters();
    initProgressBars();
    initModal();
    initFormHandling();
    initMobileMenu();
    initSmoothScrolling();
    initParallaxEffects();
    initLoadingStates();
    initAppPreview();
});

// ========================================
// NAVIGATION FUNCTIONALITY
// ========================================

function initNavigation() {
    const nav = document.querySelector('.nav');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Add scroll effect to navigation
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });
    
    // Highlight active navigation link
    highlightActiveNavLink();
    window.addEventListener('scroll', highlightActiveNavLink);
}

function highlightActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// ========================================
// SCROLL ANIMATIONS
// ========================================

function initScrollAnimations() {
    // Add animation classes to elements
    const animatedElements = document.querySelectorAll(
        '.phase-card, .feature-card, .integration-logo, .benefit-item'
    );
    
    animatedElements.forEach((element, index) => {
        element.style.animationDelay = `${index * 0.1}s`;
        element.classList.add('animate-on-scroll');
    });
}

// ========================================
// INTERSECTION OBSERVER
// ========================================

function initIntersectionObserver() {
    // Create intersection observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                
                // Special handling for specific elements
                if (entry.target.classList.contains('stat-number')) {
                    animateCounter(entry.target);
                }
                
                if (entry.target.classList.contains('progress-fill')) {
                    animateProgressBar(entry.target);
                }
            }
        });
    }, observerOptions);
    
    // Observe elements
    const elementsToObserve = document.querySelectorAll(
        '.animate-on-scroll, .stat-number, .progress-fill, .reveal-up, .reveal-left, .reveal-right, .reveal-scale'
    );
    
    elementsToObserve.forEach(element => {
        observer.observe(element);
    });
}

// ========================================
// COUNTER ANIMATIONS
// ========================================

function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.textContent.replace(/[^\d]/g, ''));
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60 FPS
        let current = 0;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                if (counter.textContent.includes('%')) {
                    counter.textContent = Math.ceil(current) + '%';
                } else if (counter.textContent.includes('+')) {
                    counter.textContent = Math.ceil(current).toLocaleString() + '+';
                } else {
                    counter.textContent = Math.ceil(current).toLocaleString();
                }
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = counter.textContent; // Reset to original
            }
        };
        
        // Store the update function for later use
        counter.updateCounter = updateCounter;
    });
}

function animateCounter(counterElement) {
    if (counterElement.updateCounter) {
        counterElement.updateCounter();
    }
}

// ========================================
// PROGRESS BAR ANIMATIONS
// ========================================

function initProgressBars() {
    const progressBars = document.querySelectorAll('.progress-fill');
    
    progressBars.forEach(bar => {
        const targetWidth = bar.getAttribute('data-width') || '100%';
        bar.style.width = '0%';
        bar.setAttribute('data-width', targetWidth);
    });
}

function animateProgressBar(progressElement) {
    const targetWidth = progressElement.getAttribute('data-width');
    if (targetWidth) {
        setTimeout(() => {
            progressElement.style.width = targetWidth;
        }, 200);
    }
}

// ========================================
// MODAL FUNCTIONALITY
// ========================================

function initModal() {
    const modal = document.getElementById('demoModal');
    const modalOpeners = document.querySelectorAll('a[href="#demo"], .btn[href="#demo"]');
    const modalCloser = document.getElementById('modalClose');
    
    // Open modal
    modalOpeners.forEach(opener => {
        opener.addEventListener('click', function(e) {
            e.preventDefault();
            openModal(modal);
        });
    });
    
    // Close modal
    if (modalCloser) {
        modalCloser.addEventListener('click', () => closeModal(modal));
    }
    
    // Close on overlay click
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    }
    
    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal(modal);
        }
    });
}

function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus first input
    const firstInput = modal.querySelector('input, select, textarea');
    if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
    }
}

function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// ========================================
// FORM HANDLING
// ========================================

function initFormHandling() {
    const demoForm = document.getElementById('demoForm');
    
    if (demoForm) {
        demoForm.addEventListener('submit', handleDemoFormSubmit);
        
        // Add real-time validation
        const inputs = demoForm.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', validateField);
            input.addEventListener('input', clearFieldError);
        });
    }
}

function handleDemoFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Validate form
    if (!validateForm(form)) {
        showFormMessage('Please correct the errors above.', 'error');
        return;
    }
    
    // Show loading state
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Submitting...';
    submitButton.disabled = true;
    
    // Simulate form submission (replace with actual API call)
    setTimeout(() => {
        // Reset button
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        
        // Show success message
        showFormMessage('Thank you! We\'ll contact you within 24 hours to schedule your demo.', 'success');
        
        // Close modal and reset form
        setTimeout(() => {
            closeModal(document.getElementById('demoModal'));
            form.reset();
        }, 2000);
    }, 2000);
}

function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!validateField({ target: field })) {
            isValid = false;
        }
    });
    
    return isValid;
}

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Remove existing error
    clearFieldError({ target: field });
    
    // Check if required field is empty
    if (field.hasAttribute('required') && !value) {
        errorMessage = 'This field is required.';
        isValid = false;
    }
    
    // Email validation
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            errorMessage = 'Please enter a valid email address.';
            isValid = false;
        }
    }
    
    // Phone validation
    if (field.type === 'tel' && value) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
            errorMessage = 'Please enter a valid phone number.';
            isValid = false;
        }
    }
    
    // Show error if invalid
    if (!isValid) {
        showFieldError(field, errorMessage);
    }
    
    return isValid;
}

function showFieldError(field, message) {
    field.classList.add('error');
    
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    
    field.parentNode.appendChild(errorElement);
}

function clearFieldError(e) {
    const field = e.target;
    field.classList.remove('error');
    
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
}

function showFormMessage(message, type) {
    // Remove existing messages
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create new message
    const messageElement = document.createElement('div');
    messageElement.className = `form-message ${type}`;
    messageElement.textContent = message;
    
    // Insert message
    const form = document.getElementById('demoForm');
    form.insertBefore(messageElement, form.firstChild);
    
    // Remove message after 5 seconds
    setTimeout(() => {
        messageElement.remove();
    }, 5000);
}

// ========================================
// MOBILE MENU
// ========================================

function initMobileMenu() {
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        const mobileNavLinks = navLinks.querySelectorAll('a');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
    }
}

// ========================================
// SMOOTH SCROLLING
// ========================================

function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#') return;
            
            e.preventDefault();
            
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // Account for fixed nav
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ========================================
// PARALLAX EFFECTS
// ========================================

function initParallaxEffects() {
    const parallaxElements = document.querySelectorAll('.parallax');
    
    if (parallaxElements.length > 0) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            parallaxElements.forEach(element => {
                element.style.transform = `translateY(${rate}px)`;
            });
        });
    }
}

// ========================================
// LOADING STATES
// ========================================

function initLoadingStates() {
    // Add loading class to buttons when clicked
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            if (this.classList.contains('btn-loading')) return;
            
            this.classList.add('btn-loading');
            
            // Remove loading class after a delay (adjust as needed)
            setTimeout(() => {
                this.classList.remove('btn-loading');
            }, 2000);
        });
    });
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Throttle function for performance
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Debounce function for performance
function debounce(func, wait, immediate) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// ========================================
// ERROR HANDLING
// ========================================

window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
    // You can add error reporting here
});

// ========================================
// APP PREVIEW FUNCTIONALITY
// ========================================

function initAppPreview() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const appScreens = document.querySelectorAll('.app-screen');
    
    if (tabButtons.length === 0) return;
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and screens
            tabButtons.forEach(btn => btn.classList.remove('active'));
            appScreens.forEach(screen => {
                screen.classList.remove('active');
            });
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Show corresponding screen
            const targetScreen = document.getElementById(targetTab);
            if (targetScreen) {
                setTimeout(() => {
                    targetScreen.classList.add('active');
                }, 150);
            }
        });
    });
    
    // Add hover effects to interactive elements
    const interactiveElements = document.querySelectorAll('.document-item, .activity-item, .sensor-card, .action-btn');
    
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        element.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Add click animations to buttons
    const clickableButtons = document.querySelectorAll('.action-btn, .nav-btn, .control-btn');
    
    clickableButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Create ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Auto-rotate tabs every 5 seconds
    let currentTabIndex = 0;
    const tabInterval = setInterval(() => {
        currentTabIndex = (currentTabIndex + 1) % tabButtons.length;
        tabButtons[currentTabIndex].click();
    }, 5000);
    
    // Pause auto-rotation on user interaction
    document.addEventListener('click', function() {
        clearInterval(tabInterval);
    }, { once: true });
}

// Add CSS for ripple animation
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ========================================
// PERFORMANCE MONITORING
// ========================================

// Monitor page load performance
window.addEventListener('load', function() {
    if ('performance' in window) {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`Page load time: ${loadTime}ms`);
        
        // You can send this data to analytics
    }
});

// ========================================
// ACCESSIBILITY ENHANCEMENTS
// ========================================

// Add keyboard navigation support
document.addEventListener('keydown', function(e) {
    // Handle tab navigation
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
    }
});

// Remove keyboard navigation class on mouse use
document.addEventListener('mousedown', function() {
    document.body.classList.remove('keyboard-navigation');
});

// Handle reduced motion preference
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.body.classList.add('reduce-motion');
}