/*
===============================================
ABOUT.JS - About Section Component
Interactive about section with animated counters, cards, and reveal effects
===============================================
*/

/**
 * About Component Class
 * Manages about section with animated statistics, info cards, and scroll reveals
 */
class AboutComponent {
    constructor(options = {}) {
        this.options = {
            counterDuration: 2000,
            counterEasing: 'easeOutQuart',
            revealDelay: 100,
            revealStagger: 150,
            enableCounters: true,
            enableCardAnimations: true,
            enableRevealAnimations: true,
            enableParallax: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
            parallaxIntensity: 0.2,
            observerThreshold: 0.3,
            ...options
        };
        
        // Component state
        this.isInitialized = false;
        this.isVisible = false;
        this.countersAnimated = false;
        this.cardsRevealed = false;
        
        // Animation state
        this.animationFrames = new Set();
        this.observers = new Set();
        
        // DOM elements
        this.aboutSection = null;
        this.counters = [];
        this.infoCards = [];
        this.revealElements = [];
        this.parallaxElements = [];
        
        // Counter data
        this.counterData = [
            { target: 50, suffix: '+', label: 'Proyectos Completados' },
            { target: 3, suffix: '+', label: 'Años de Experiencia' },
            { target: 100, suffix: '%', label: 'Satisfacción Cliente' }
        ];
        
        // Event handlers
        this.handleScroll = this.handleScroll.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
        this.handleCardHover = this.handleCardHover.bind(this);
        
        // Throttled functions
        this.throttledScroll = this.throttle(this.handleScroll, 16);
        this.throttledResize = this.throttle(this.handleResize, 250);
    }

    /**
     * Initialize the about component
     */
    init() {
        console.log('👤 Initializing About Component...');
        
        try {
            // Find DOM elements
            this.findElements();
            
            // Setup intersection observers
            this.setupObservers();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Setup card interactions
            this.setupCardInteractions();
            
            // Setup reveal animations
            this.setupRevealAnimations();
            
            // Setup parallax elements
            if (this.options.enableParallax) {
                this.setupParallaxElements();
            }
            
            this.isInitialized = true;
            console.log('✅ About Component initialized');
            
            // Dispatch ready event
            this.dispatchEvent('about:ready');
            
        } catch (error) {
            console.error('❌ Failed to initialize About:', error);
        }
    }

    /**
     * Find and cache DOM elements
     */
    findElements() {
        this.aboutSection = document.getElementById('about') || document.querySelector('.about-section');
        
        if (!this.aboutSection) {
            throw new Error('About section not found');
        }
        
        // Find counters
        this.counters = Array.from(this.aboutSection.querySelectorAll('.stat-number'));
        
        // Find info cards
        this.infoCards = Array.from(this.aboutSection.querySelectorAll('.info-card'));
        
        // Find reveal elements
        this.revealElements = Array.from(this.aboutSection.querySelectorAll('[data-reveal]'));
        
        // Find parallax elements
        this.parallaxElements = Array.from(this.aboutSection.querySelectorAll('[data-parallax]'));
        
        console.log(`📊 Found ${this.counters.length} counters, ${this.infoCards.length} cards, ${this.revealElements.length} reveal elements`);
    }

    /**
     * Setup intersection observers
     */
    setupObservers() {
        // Main section observer
        this.setupSectionObserver();
        
        // Counter observer
        if (this.options.enableCounters && this.counters.length > 0) {
            this.setupCounterObserver();
        }
        
        // Reveal observer
        if (this.options.enableRevealAnimations && this.revealElements.length > 0) {
            this.setupRevealObserver();
        }
        
        // Card observer
        if (this.options.enableCardAnimations && this.infoCards.length > 0) {
            this.setupCardObserver();
        }
    }

    /**
     * Setup main section observer
     */
    setupSectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const wasVisible = this.isVisible;
                this.isVisible = entry.isIntersecting;
                
                if (wasVisible !== this.isVisible) {
                    this.handleVisibilityChange();
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });
        
        observer.observe(this.aboutSection);
        this.observers.add(observer);
    }

    /**
     * Setup counter observer
     */
    setupCounterObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.countersAnimated) {
                    this.animateCounters();
                    this.countersAnimated = true;
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: this.options.observerThreshold
        });
        
        // Observe counter container
        const counterContainer = this.aboutSection.querySelector('.about-stats');
        if (counterContainer) {
            observer.observe(counterContainer);
            this.observers.add(observer);
        }
    }

    /**
     * Setup reveal observer
     */
    setupRevealObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.revealElement(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        this.revealElements.forEach(element => {
            observer.observe(element);
        });
        
        this.observers.add(observer);
    }

    /**
     * Setup card observer
     */
    setupCardObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.cardsRevealed) {
                    this.animateCards();
                    this.cardsRevealed = true;
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: this.options.observerThreshold
        });
        
        // Observe cards container
        const cardsContainer = this.aboutSection.querySelector('.about-cards');
        if (cardsContainer) {
            observer.observe(cardsContainer);
            this.observers.add(observer);
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Scroll events for parallax
        if (this.options.enableParallax) {
            window.addEventListener('scroll', this.throttledScroll, { passive: true });
        }
        
        // Resize events
        window.addEventListener('resize', this.throttledResize);
        
        // Reduced motion preference changes
        const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        reducedMotionQuery.addEventListener('change', this.handleReducedMotionChange.bind(this));
        
        // Custom events
        document.addEventListener('theme:change', this.handleThemeChange.bind(this));
    }

    /**
     * Setup card interactions
     */
    setupCardInteractions() {
        this.infoCards.forEach((card, index) => {
            // Add staggered animation delay
            card.style.setProperty('--animation-delay', `${index * this.options.revealStagger}ms`);
            
            // Add hover effects
            card.addEventListener('mouseenter', (event) => {
                this.handleCardHover(event, true);
            });
            
            card.addEventListener('mouseleave', (event) => {
                this.handleCardHover(event, false);
            });
            
            // Add click handling
            card.addEventListener('click', (event) => {
                this.handleCardClick(event, index);
            });
            
            // Add focus handling for accessibility
            card.addEventListener('focus', (event) => {
                this.handleCardFocus(event, true);
            });
            
            card.addEventListener('blur', (event) => {
                this.handleCardFocus(event, false);
            });
            
            // Make cards focusable
            if (!card.hasAttribute('tabindex')) {
                card.setAttribute('tabindex', '0');
            }
        });
    }

    /**
     * Setup reveal animations
     */
    setupRevealAnimations() {
        this.revealElements.forEach((element, index) => {
            // Set initial state
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            
            // Add staggered delay
            const delay = index * this.options.revealStagger;
            element.style.transitionDelay = `${delay}ms`;
        });
    }

    /**
     * Setup parallax elements
     */
    setupParallaxElements() {
        this.parallaxElements.forEach(element => {
            const speed = parseFloat(element.getAttribute('data-parallax')) || 0.5;
            element.setAttribute('data-parallax-speed', speed);
        });
    }

    /**
     * Animate counters
     */
    animateCounters() {
        console.log('📊 Starting counter animations');
        
        this.counters.forEach((counter, index) => {
            const targetValue = parseInt(counter.getAttribute('data-target')) || this.counterData[index]?.target || 0;
            const suffix = this.counterData[index]?.suffix || '';
            
            this.animateCounter(counter, targetValue, suffix, index * 200);
        });
        
        // Dispatch event
        this.dispatchEvent('about:counters-animated');
    }

    /**
     * Animate single counter
     */
    animateCounter(element, target, suffix = '', delay = 0) {
        setTimeout(() => {
            const startTime = performance.now();
            const startValue = 0;
            const duration = this.options.counterDuration;
            
            const updateCounter = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Apply easing
                const easedProgress = this.easeOutQuart(progress);
                const currentValue = Math.floor(startValue + (target - startValue) * easedProgress);
                
                element.textContent = currentValue + suffix;
                
                if (progress < 1) {
                    const frameId = requestAnimationFrame(updateCounter);
                    this.animationFrames.add(frameId);
                } else {
                    element.textContent = target + suffix;
                    
                    // Add completion effect
                    this.addCounterCompletionEffect(element);
                }
            };
            
            const frameId = requestAnimationFrame(updateCounter);
            this.animationFrames.add(frameId);
        }, delay);
    }

    /**
     * Add counter completion effect
     */
    addCounterCompletionEffect(element) {
        element.style.transform = 'scale(1.1)';
        element.style.color = 'var(--color-primary-600)';
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
            element.style.color = '';
        }, 300);
    }

    /**
     * Animate cards with staggered effect
     */
    animateCards() {
        console.log('🎴 Starting card animations');
        
        this.infoCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('animate-slideInUp');
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * this.options.revealStagger);
        });
        
        // Dispatch event
        this.dispatchEvent('about:cards-animated');
    }

    /**
     * Reveal element with animation
     */
    revealElement(element) {
        const animationType = element.getAttribute('data-reveal') || 'fadeInUp';
        
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
        element.classList.add(`animate-${animationType}`);
        
        // Dispatch event
        this.dispatchEvent('about:element-revealed', { element, animation: animationType });
    }

    /**
     * Handle card hover
     */
    handleCardHover(event, isHovering) {
        const card = event.currentTarget;
        const icon = card.querySelector('.card-icon');
        
        if (isHovering) {
            card.style.transform = 'translateY(-8px) scale(1.02)';
            card.style.boxShadow = 'var(--shadow-xl)';
            
            if (icon) {
                icon.style.transform = 'scale(1.2) rotate(5deg)';
            }
            
            // Add glow effect
            this.addCardGlowEffect(card, true);
            
        } else {
            card.style.transform = 'translateY(0) scale(1)';
            card.style.boxShadow = '';
            
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0deg)';
            }
            
            // Remove glow effect
            this.addCardGlowEffect(card, false);
        }
        
        // Dispatch event
        this.dispatchEvent('about:card-hover', { card, isHovering });
    }

    /**
     * Add card glow effect
     */
    addCardGlowEffect(card, enable) {
        if (enable) {
            card.style.boxShadow = `
                var(--shadow-xl),
                0 0 20px rgba(59, 130, 246, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `;
        } else {
            card.style.boxShadow = '';
        }
    }

    /**
     * Handle card click
     */
    handleCardClick(event, index) {
        const card = event.currentTarget;
        
        // Add click feedback
        card.style.transform = 'translateY(-4px) scale(0.98)';
        
        setTimeout(() => {
            card.style.transform = 'translateY(-8px) scale(1.02)';
        }, 100);
        
        // Create ripple effect
        this.createCardRipple(event, card);
        
        // Dispatch event
        this.dispatchEvent('about:card-click', { card, index });
        
        console.log(`🎴 Card ${index + 1} clicked`);
    }

    /**
     * Create ripple effect on card
     */
    createCardRipple(event, card) {
        const rect = card.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 0.5;
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(59, 130, 246, 0.2);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
            z-index: 1;
        `;
        
        card.style.position = 'relative';
        card.style.overflow = 'hidden';
        card.appendChild(ripple);
        
        // Remove ripple after animation
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }

    /**
     * Handle card focus for accessibility
     */
    handleCardFocus(event, isFocused) {
        const card = event.currentTarget;
        
        if (isFocused) {
            card.style.outline = '2px solid var(--color-primary-500)';
            card.style.outlineOffset = '2px';
            
            // Apply hover effect for keyboard users
            this.handleCardHover(event, true);
        } else {
            card.style.outline = '';
            card.style.outlineOffset = '';
            
            // Remove hover effect
            this.handleCardHover(event, false);
        }
    }

    /**
     * Handle scroll for parallax
     */
    handleScroll() {
        if (!this.options.enableParallax || !this.isVisible) return;
        
        const scrollTop = window.pageYOffset;
        const sectionTop = this.aboutSection.offsetTop;
        const sectionHeight = this.aboutSection.offsetHeight;
        const windowHeight = window.innerHeight;
        
        // Check if section is in viewport
        const isInViewport = scrollTop + windowHeight > sectionTop && scrollTop < sectionTop + sectionHeight;
        
        if (!isInViewport) return;
        
        // Calculate parallax offset
        const sectionProgress = (scrollTop - sectionTop + windowHeight) / (sectionHeight + windowHeight);
        const clampedProgress = Math.max(0, Math.min(1, sectionProgress));
        
        // Apply parallax to elements
        this.parallaxElements.forEach(element => {
            const speed = parseFloat(element.getAttribute('data-parallax-speed')) || 0.5;
            const offset = (clampedProgress - 0.5) * 100 * speed * this.options.parallaxIntensity;
            
            element.style.transform = `translateY(${offset}px)`;
        });
    }

    /**
     * Handle resize
     */
    handleResize() {
        // Recalculate positions for parallax
        if (this.options.enableParallax) {
            this.handleScroll();
        }
    }

    /**
     * Handle visibility change
     */
    handleVisibilityChange() {
        if (this.isVisible) {
            console.log('👤 About section is visible');
            this.dispatchEvent('about:visible');
        } else {
            console.log('👤 About section is hidden');
            this.dispatchEvent('about:hidden');
        }
    }

    /**
     * Handle reduced motion preference change
     */
    handleReducedMotionChange(event) {
        const prefersReducedMotion = event.matches;
        
        if (prefersReducedMotion) {
            this.options.enableParallax = false;
            this.options.enableCardAnimations = false;
            this.options.enableRevealAnimations = false;
        } else {
            this.options.enableParallax = true;
            this.options.enableCardAnimations = true;
            this.options.enableRevealAnimations = true;
        }
    }

    /**
     * Handle theme change
     */
    handleThemeChange(event) {
        const { theme } = event.detail;
        
        // Update card styles based on theme
        this.infoCards.forEach(card => {
            if (theme === 'dark') {
                card.style.backgroundColor = 'var(--color-dark-100)';
                card.style.borderColor = 'var(--color-dark-200)';
            } else {
                card.style.backgroundColor = 'var(--bg-primary)';
                card.style.borderColor = 'var(--border-light)';
            }
        });
    }

    /**
     * Easing function for smooth animations
     */
    easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
    }

    /**
     * Utility: Throttle function
     */
    throttle(func, wait) {
        let timeout;
        let previous = 0;
        
        return function executedFunction(...args) {
            const now = Date.now();
            const remaining = wait - (now - previous);
            
            if (remaining <= 0 || remaining > wait) {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                previous = now;
                func.apply(this, args);
            } else if (!timeout) {
                timeout = setTimeout(() => {
                    previous = Date.now();
                    timeout = null;
                    func.apply(this, args);
                }, remaining);
            }
        };
    }

    /**
     * Dispatch custom events
     */
    dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, {
            detail,
            bubbles: true,
            cancelable: true
        });
        
        document.dispatchEvent(event);
    }

    /**
     * Get component state
     */
    getState() {
        return {
            isInitialized: this.isInitialized,
            isVisible: this.isVisible,
            countersAnimated: this.countersAnimated,
            cardsRevealed: this.cardsRevealed,
            counterCount: this.counters.length,
            cardCount: this.infoCards.length,
            revealElementCount: this.revealElements.length
        };
    }

    /**
     * Manually trigger counter animation
     */
    triggerCounters() {
        if (!this.countersAnimated) {
            this.animateCounters();
            this.countersAnimated = true;
        }
    }

    /**
     * Manually trigger card animations
     */
    triggerCards() {
        if (!this.cardsRevealed) {
            this.animateCards();
            this.cardsRevealed = true;
        }
    }

    /**
     * Reset animations (for testing/demo purposes)
     */
    resetAnimations() {
        this.countersAnimated = false;
        this.cardsRevealed = false;
        
        // Reset counter values
        this.counters.forEach(counter => {
            counter.textContent = '0';
        });
        
        // Reset card states
        this.infoCards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.classList.remove('animate-slideInUp');
        });
        
        // Reset reveal elements
        this.revealElements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.classList.remove('animate-fadeInUp', 'animate-slideInLeft', 'animate-slideInRight');
        });
    }

    /**
     * Cleanup component
     */
    destroy() {
        console.log('🧹 Destroying About component...');
        
        // Cancel animation frames
        this.animationFrames.forEach(frameId => {
            cancelAnimationFrame(frameId);
        });
        this.animationFrames.clear();
        
        // Disconnect observers
        this.observers.forEach(observer => {
            observer.disconnect();
        });
        this.observers.clear();
        
        // Remove event listeners
        if (this.options.enableParallax) {
            window.removeEventListener('scroll', this.throttledScroll);
        }
        window.removeEventListener('resize', this.throttledResize);
        
        // Reset card styles
        this.infoCards.forEach(card => {
            card.style.transform = '';
            card.style.boxShadow = '';
            card.style.outline = '';
        });
        
        console.log('🧹 About component destroyed');
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AboutComponent };
}

// Export for ES6 modules
export { AboutComponent };

/*
===============================================
END ABOUT.JS
Complete about component with:
- Animated counters with easing
- Interactive info cards
- Staggered reveal animations
- Parallax effects
- Accessibility support
- Performance optimization
- Event system
- Mobile responsiveness
===============================================
*/