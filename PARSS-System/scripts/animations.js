// Advanced animations for Viksit Bharat Landing Page

// ========================================
// ADVANCED SCROLL ANIMATIONS
// ========================================

class ScrollAnimations {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupIntersectionObserver();
        this.setupScrollTriggers();
        this.setupParallaxElements();
        this.setupMorphingAnimations();
    }
    
    setupIntersectionObserver() {
        const options = {
            threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
            rootMargin: '0px 0px -100px 0px'
        };
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                this.handleIntersection(entry);
            });
        }, options);
        
        // Observe all animatable elements
        const elements = document.querySelectorAll(`
            .phase-card,
            .feature-card,
            .benefit-item,
            .integration-logo,
            .hero-visual,
            .stat-number,
            .progress-fill
        `);
        
        elements.forEach(element => {
            element.classList.add('scroll-animatable');
            this.observer.observe(element);
        });
    }
    
    handleIntersection(entry) {
        const element = entry.target;
        
        if (entry.isIntersecting) {
            const delay = element.dataset.delay || 0;
            
            setTimeout(() => {
                element.classList.add('animate-in');
                
                // Trigger specific animations based on element type
                if (element.classList.contains('stat-number')) {
                    this.animateCounter(element);
                }
                
                if (element.classList.contains('progress-fill')) {
                    this.animateProgressBar(element);
                }
                
                if (element.classList.contains('phase-card')) {
                    this.animatePhaseCard(element);
                }
                
                if (element.classList.contains('feature-card')) {
                    this.animateFeatureCard(element);
                }
            }, delay);
        }
    }
    
    animateCounter(element) {
        const target = element.textContent;
        const numericValue = parseInt(target.replace(/[^\d]/g, ''));
        const suffix = target.replace(/[\d,]/g, '');
        let current = 0;
        const increment = numericValue / 60; // 60 frames
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= numericValue) {
                current = numericValue;
                clearInterval(timer);
            }
            
            element.textContent = Math.floor(current).toLocaleString() + suffix;
        }, 1000 / 60);
    }
    
    animateProgressBar(element) {
        const targetWidth = element.dataset.width || '100%';
        element.style.width = '0%';
        
        setTimeout(() => {
            element.style.transition = 'width 2s ease-out';
            element.style.width = targetWidth;
        }, 200);
    }
    
    animatePhaseCard(element) {
        // Add stagger effect for child elements
        const children = element.children;
        Array.from(children).forEach((child, index) => {
            setTimeout(() => {
                child.style.opacity = '1';
                child.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
    
    animateFeatureCard(element) {
        // Add hover effect on animation
        element.addEventListener('mouseenter', () => {
            element.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        element.addEventListener('mouseleave', () => {
            element.style.transform = 'translateY(0) scale(1)';
        });
    }
}

// ========================================
// MORPHING ANIMATIONS
// ========================================

class MorphingAnimations {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupLogoMorph();
        this.setupButtonMorphs();
        this.setupCardMorphs();
    }
    
    setupLogoMorph() {
        const logo = document.querySelector('.nav-logo');
        if (logo) {
            logo.addEventListener('mouseenter', () => {
                logo.style.transform = 'scale(1.1) rotate(5deg)';
                logo.style.transition = 'transform 0.3s ease-out';
            });
            
            logo.addEventListener('mouseleave', () => {
                logo.style.transform = 'scale(1) rotate(0deg)';
            });
        }
    }
    
    setupButtonMorphs() {
        const buttons = document.querySelectorAll('.btn');
        
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'translateY(-2px)';
                button.style.boxShadow = '0 10px 25px rgba(234, 88, 12, 0.3)';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translateY(0)';
                button.style.boxShadow = '';
            });
        });
    }
    
    setupCardMorphs() {
        const cards = document.querySelectorAll('.phase-card, .feature-card');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px) scale(1.02)';
                card.style.boxShadow = '0 25px 50px rgba(15, 23, 42, 0.15)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
                card.style.boxShadow = '';
            });
        });
    }
}

// ========================================
// PARTICLE SYSTEM
// ========================================

class ParticleSystem {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.animationId = null;
        this.init();
    }
    
    init() {
        this.createCanvas();
        this.createParticles();
        this.animate();
    }
    
    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '-1';
        this.canvas.style.opacity = '0.1';
        
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createParticles() {
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.1
            });
        }
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Wrap around edges
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;
            
            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(234, 88, 12, ${particle.opacity})`;
            this.ctx.fill();
        });
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.canvas) {
            this.canvas.remove();
        }
    }
}

// ========================================
// TEXT ANIMATIONS
// ========================================

class TextAnimations {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupTypewriter();
        this.setupTextReveal();
        this.setupFloatingText();
    }
    
    setupTypewriter() {
        const typewriterElements = document.querySelectorAll('.typewriter');
        
        typewriterElements.forEach(element => {
            const text = element.textContent;
            element.textContent = '';
            element.style.borderRight = '2px solid var(--color-primary)';
            
            let i = 0;
            const timer = setInterval(() => {
                element.textContent += text.charAt(i);
                i++;
                
                if (i >= text.length) {
                    clearInterval(timer);
                    setTimeout(() => {
                        element.style.borderRight = 'none';
                    }, 1000);
                }
            }, 50);
        });
    }
    
    setupTextReveal() {
        const revealElements = document.querySelectorAll('.text-reveal');
        
        revealElements.forEach(element => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        element.classList.add('revealed');
                    }
                });
            });
            
            observer.observe(element);
        });
    }
    
    setupFloatingText() {
        const floatingElements = document.querySelectorAll('.floating-text');
        
        floatingElements.forEach(element => {
            let position = 0;
            const speed = 0.5;
            
            const animate = () => {
                position += speed;
                element.style.transform = `translateY(${Math.sin(position) * 10}px)`;
                requestAnimationFrame(animate);
            };
            
            animate();
        });
    }
}

// ========================================
// GSAP-LIKE ANIMATIONS (Simplified)
// ========================================

class GSAPAnimations {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupTimelineAnimations();
        this.setupStaggerAnimations();
        this.setupElasticAnimations();
    }
    
    setupTimelineAnimations() {
        const timelines = document.querySelectorAll('.timeline-animation');
        
        timelines.forEach(timeline => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.playTimeline(timeline);
                    }
                });
            });
            
            observer.observe(timeline);
        });
    }
    
    playTimeline(element) {
        const children = element.children;
        Array.from(children).forEach((child, index) => {
            setTimeout(() => {
                child.style.opacity = '1';
                child.style.transform = 'translateY(0)';
                child.style.transform = `translateY(0) scale(${child.dataset.scale || 1})`;
            }, index * 200);
        });
    }
    
    setupStaggerAnimations() {
        const staggerContainers = document.querySelectorAll('.stagger-container');
        
        staggerContainers.forEach(container => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.staggerChildren(container);
                    }
                });
            });
            
            observer.observe(container);
        });
    }
    
    staggerChildren(container) {
        const children = container.children;
        Array.from(children).forEach((child, index) => {
            setTimeout(() => {
                child.style.opacity = '1';
                child.style.transform = 'translateY(0) scale(1)';
                child.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            }, index * 100);
        });
    }
    
    setupElasticAnimations() {
        const elasticElements = document.querySelectorAll('.elastic-animation');
        
        elasticElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                this.elasticScale(element, 1.1);
            });
            
            element.addEventListener('mouseleave', () => {
                this.elasticScale(element, 1);
            });
        });
    }
    
    elasticScale(element, scale) {
        element.style.transition = 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        element.style.transform = `scale(${scale})`;
    }
}

// ========================================
// PERFORMANCE OPTIMIZATION
// ========================================

class AnimationOptimizer {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupRAF();
        this.setupVisibilityAPI();
        this.setupMemoryManagement();
    }
    
    setupRAF() {
        // Use requestAnimationFrame for smooth animations
        this.originalRequestAnimationFrame = window.requestAnimationFrame;
        window.requestAnimationFrame = (callback) => {
            return this.originalRequestAnimationFrame((timestamp) => {
                if (document.hidden) return; // Skip animations when tab is not visible
                callback(timestamp);
            });
        };
    }
    
    setupVisibilityAPI() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAnimations();
            } else {
                this.resumeAnimations();
            }
        });
    }
    
    pauseAnimations() {
        const animatedElements = document.querySelectorAll('[style*="animation"]');
        animatedElements.forEach(element => {
            element.style.animationPlayState = 'paused';
        });
    }
    
    resumeAnimations() {
        const animatedElements = document.querySelectorAll('[style*="animation"]');
        animatedElements.forEach(element => {
            element.style.animationPlayState = 'running';
        });
    }
    
    setupMemoryManagement() {
        // Clean up animations when elements are removed
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.removedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.cleanupAnimations(node);
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    cleanupAnimations(element) {
        // Remove event listeners and clean up animations
        const animatedElements = element.querySelectorAll('*');
        animatedElements.forEach(el => {
            el.style.animation = '';
            el.style.transition = '';
        });
    }
}

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Only initialize advanced animations if not reduced motion
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        new ScrollAnimations();
        new MorphingAnimations();
        new TextAnimations();
        new GSAPAnimations();
        new AnimationOptimizer();
        
        // Initialize particle system for hero section
        setTimeout(() => {
            new ParticleSystem();
        }, 1000);
    }
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ScrollAnimations,
        MorphingAnimations,
        ParticleSystem,
        TextAnimations,
        GSAPAnimations,
        AnimationOptimizer
    };
}