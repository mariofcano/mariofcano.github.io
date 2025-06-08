/*
===============================================
HERO.JS - Hero Section Component
Ultra-visual hero with particles, typed text, and interactive effects
===============================================
*/

/**
 * Hero Component Class
 * Manages hero section with typed text, particles, and interactive animations
 */
class HeroComponent {
    constructor(options = {}) {
        this.options = {
            particleCount: window.innerWidth <= 768 ? 30 : 50,
            particleSpeed: 0.5,
            particleSize: { min: 2, max: 6 },
            particleOpacity: { min: 0.2, max: 0.8 },
            typeSpeed: 100,
            deleteSpeed: 50,
            pauseDuration: 2000,
            cursorBlinkSpeed: 1000,
            enableParticles: true,
            enableTyping: true,
            enableParallax: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
            parallaxIntensity: 0.3,
            ...options
        };
        
        // Component state
        this.isInitialized = false;
        this.isVisible = false;
        this.particles = [];
        this.animationFrame = null;
        this.typewriterInterval = null;
        this.cursorInterval = null;
        
        // Typing animation state
        this.currentTextIndex = 0;
        this.currentCharIndex = 0;
        this.isDeleting = false;
        this.typewriterPaused = false;
        
        // Parallax state
        this.mouseX = 0;
        this.mouseY = 0;
        this.scrollY = 0;
        
        // DOM elements
        this.heroSection = null;
        this.particlesContainer = null;
        this.typedTextElement = null;
        this.avatarElement = null;
        this.heroContent = null;
        this.scrollIndicator = null;
        this.ctaButtons = [];
        
        // Text arrays
        this.typeTexts = [
            'Desarrollador Full Stack',
            'Frontend Developer',
            'Backend Developer',
            'UI/UX Enthusiast',
            'Problem Solver',
            'Code Architect',
            'Tech Innovator'
        ];
        
        // Event handlers
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
        this.handleAvatarInteraction = this.handleAvatarInteraction.bind(this);
        
        // Throttled functions
        this.throttledMouseMove = this.throttle(this.handleMouseMove, 16);
        this.throttledScroll = this.throttle(this.handleScroll, 16);
        this.throttledResize = this.throttle(this.handleResize, 250);
    }

    /**
     * Initialize the hero component
     */
    init() {
        console.log('🌟 Initializing Hero Component...');
        
        try {
            // Find DOM elements
            this.findElements();
            
            // Setup intersection observer
            this.setupVisibilityObserver();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize particles
            if (this.options.enableParticles) {
                this.initializeParticles();
            }
            
            // Initialize typing animation
            if (this.options.enableTyping) {
                this.initializeTyping();
            }
            
            // Setup avatar interactions
            this.setupAvatarInteractions();
            
            // Setup CTA buttons
            this.setupCTAButtons();
            
            // Setup scroll indicator
            this.setupScrollIndicator();
            
            this.isInitialized = true;
            console.log('✅ Hero Component initialized');
            
            // Dispatch ready event
            this.dispatchEvent('hero:ready');
            
        } catch (error) {
            console.error('❌ Failed to initialize Hero:', error);
        }
    }

    /**
     * Find and cache DOM elements
     */
    findElements() {
        this.heroSection = document.getElementById('home') || document.querySelector('.hero-section');
        this.particlesContainer = document.getElementById('particles');
        this.typedTextElement = document.getElementById('typed-text');
        this.avatarElement = document.querySelector('.hero-avatar');
        this.heroContent = document.querySelector('.hero-content');
        this.scrollIndicator = document.querySelector('.scroll-indicator');
        this.ctaButtons = Array.from(document.querySelectorAll('.hero-actions .btn'));
        
        if (!this.heroSection) {
            throw new Error('Hero section not found');
        }
        
        console.log('📍 Hero elements found and cached');
    }

    /**
     * Setup intersection observer for visibility detection
     */
    setupVisibilityObserver() {
        if (!this.heroSection) return;
        
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
        
        observer.observe(this.heroSection);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Mouse movement for parallax
        if (this.options.enableParallax) {
            document.addEventListener('mousemove', this.throttledMouseMove, { passive: true });
        }
        
        // Scroll events
        window.addEventListener('scroll', this.throttledScroll, { passive: true });
        
        // Resize events
        window.addEventListener('resize', this.throttledResize);
        
        // Reduced motion preference changes
        const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        reducedMotionQuery.addEventListener('change', this.handleReducedMotionChange.bind(this));
        
        // Custom events
        document.addEventListener('theme:change', this.handleThemeChange.bind(this));
    }

    /**
     * Initialize particle system
     */
    initializeParticles() {
        if (!this.particlesContainer) {
            console.warn('Particles container not found');
            return;
        }
        
        console.log(`✨ Creating ${this.options.particleCount} particles`);
        
        // Clear existing particles
        this.particlesContainer.innerHTML = '';
        this.particles = [];
        
        // Create particles
        for (let i = 0; i < this.options.particleCount; i++) {
            this.createParticle();
        }
        
        // Start animation
        this.startParticleAnimation();
    }

    /**
     * Create a single particle
     */
    createParticle() {
        const particle = {
            element: document.createElement('div'),
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * (this.options.particleSize.max - this.options.particleSize.min) + this.options.particleSize.min,
            opacity: Math.random() * (this.options.particleOpacity.max - this.options.particleOpacity.min) + this.options.particleOpacity.min,
            speedX: (Math.random() - 0.5) * this.options.particleSpeed,
            speedY: (Math.random() - 0.5) * this.options.particleSpeed,
            life: Math.random() * 100
        };
        
        // Style particle element
        particle.element.className = 'particle';
        particle.element.style.cssText = `
            position: absolute;
            width: ${particle.size}px;
            height: ${particle.size}px;
            background: rgba(102, 126, 234, ${particle.opacity});
            border-radius: 50%;
            pointer-events: none;
            left: ${particle.x}%;
            top: ${particle.y}%;
            animation: particleFloat ${3 + Math.random() * 3}s ease-in-out infinite;
            animation-delay: ${Math.random() * 2}s;
        `;
        
        this.particlesContainer.appendChild(particle.element);
        this.particles.push(particle);
        
        return particle;
    }

    /**
     * Start particle animation loop
     */
    startParticleAnimation() {
        if (!this.options.enableParticles) return;
        
        const animate = () => {
            if (!this.isVisible || document.hidden) {
                this.animationFrame = requestAnimationFrame(animate);
                return;
            }
            
            this.particles.forEach(particle => {
                // Update position
                particle.life += 0.5;
                particle.x += particle.speedX;
                particle.y += particle.speedY;
                
                // Wrap around edges
                if (particle.x > 100) particle.x = -5;
                if (particle.x < -5) particle.x = 100;
                if (particle.y > 100) particle.y = -5;
                if (particle.y < -5) particle.y = 100;
                
                // Update opacity based on life
                const lifeOpacity = Math.sin(particle.life * 0.02) * 0.3 + 0.7;
                const finalOpacity = particle.opacity * lifeOpacity;
                
                // Apply transform
                particle.element.style.transform = `translate(${particle.x}%, ${particle.y}%)`;
                particle.element.style.opacity = finalOpacity;
            });
            
            this.animationFrame = requestAnimationFrame(animate);
        };
        
        animate();
    }

    /**
     * Initialize typing animation
     */
    initializeTyping() {
        if (!this.typedTextElement || this.typeTexts.length === 0) {
            console.warn('Typed text element or texts not found');
            return;
        }
        
        console.log('⌨️ Starting typing animation');
        
        // Start typing after a short delay
        setTimeout(() => {
            this.startTyping();
            this.startCursorBlink();
        }, 1000);
    }

    /**
     * Start typing animation
     */
    startTyping() {
        const typeNextCharacter = () => {
            if (this.typewriterPaused) return;
            
            const currentText = this.typeTexts[this.currentTextIndex];
            
            if (this.isDeleting) {
                // Delete character
                this.currentCharIndex--;
                this.typedTextElement.textContent = currentText.substring(0, this.currentCharIndex);
                
                if (this.currentCharIndex === 0) {
                    this.isDeleting = false;
                    this.currentTextIndex = (this.currentTextIndex + 1) % this.typeTexts.length;
                    
                    // Pause before typing next text
                    this.typewriterPaused = true;
                    setTimeout(() => {
                        this.typewriterPaused = false;
                    }, 500);
                }
            } else {
                // Type character
                this.currentCharIndex++;
                this.typedTextElement.textContent = currentText.substring(0, this.currentCharIndex);
                
                if (this.currentCharIndex === currentText.length) {
                    // Pause before deleting
                    this.typewriterPaused = true;
                    setTimeout(() => {
                        this.isDeleting = true;
                        this.typewriterPaused = false;
                    }, this.options.pauseDuration);
                }
            }
        };
        
        this.typewriterInterval = setInterval(() => {
            typeNextCharacter();
        }, this.isDeleting ? this.options.deleteSpeed : this.options.typeSpeed);
    }

    /**
     * Start cursor blinking
     */
    startCursorBlink() {
        if (!this.typedTextElement) return;
        
        // Add cursor after typed text
        const cursor = document.createElement('span');
        cursor.className = 'typing-cursor';
        cursor.textContent = '|';
        cursor.style.cssText = `
            opacity: 1;
            animation: blinkCursor 1s infinite;
            margin-left: 2px;
            color: currentColor;
        `;
        
        this.typedTextElement.parentNode.appendChild(cursor);
        
        // Blink cursor
        this.cursorInterval = setInterval(() => {
            cursor.style.opacity = cursor.style.opacity === '0' ? '1' : '0';
        }, this.options.cursorBlinkSpeed);
    }

    /**
     * Setup avatar interactions
     */
    setupAvatarInteractions() {
        if (!this.avatarElement) return;
        
        const avatar = this.avatarElement;
        
        // Hover effects
        avatar.addEventListener('mouseenter', () => {
            this.addAvatarHoverEffect(true);
        });
        
        avatar.addEventListener('mouseleave', () => {
            this.addAvatarHoverEffect(false);
        });
        
        // Click effect
        avatar.addEventListener('click', this.handleAvatarInteraction);
        
        // Touch effect for mobile
        avatar.addEventListener('touchstart', this.handleAvatarInteraction, { passive: true });
    }

    /**
     * Add avatar hover effect
     */
    addAvatarHoverEffect(isHovering) {
        if (!this.avatarElement) return;
        
        const img = this.avatarElement.querySelector('img');
        const ring = this.avatarElement.querySelector('.avatar-ring');
        
        if (isHovering) {
            if (img) {
                img.style.transform = 'scale(1.05) rotate(2deg)';
            }
            if (ring) {
                ring.style.transform = 'scale(1.1)';
                ring.style.borderColor = 'var(--color-primary-400)';
            }
        } else {
            if (img) {
                img.style.transform = 'scale(1) rotate(0deg)';
            }
            if (ring) {
                ring.style.transform = 'scale(1)';
                ring.style.borderColor = 'var(--color-primary-300)';
            }
        }
    }

    /**
     * Handle avatar interaction
     */
    handleAvatarInteraction(event) {
        event.preventDefault();
        
        // Add ripple effect
        this.createRippleEffect(event);
        
        // Add feedback animation
        if (this.avatarElement) {
            this.avatarElement.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.avatarElement.style.transform = 'scale(1)';
            }, 150);
        }
        
        // Dispatch interaction event
        this.dispatchEvent('hero:avatar-click');
    }

    /**
     * Create ripple effect on avatar
     */
    createRippleEffect(event) {
        const avatar = this.avatarElement;
        if (!avatar) return;
        
        const rect = avatar.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = (event.clientX || event.touches[0].clientX) - rect.left - size / 2;
        const y = (event.clientY || event.touches[0].clientY) - rect.top - size / 2;
        
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(59, 130, 246, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
            z-index: 1;
        `;
        
        avatar.style.position = 'relative';
        avatar.style.overflow = 'hidden';
        avatar.appendChild(ripple);
        
        // Remove ripple after animation
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }

    /**
     * Setup CTA buttons
     */
    setupCTAButtons() {
        this.ctaButtons.forEach((button, index) => {
            // Add staggered animation delay
            button.style.animationDelay = `${0.5 + index * 0.1}s`;
            
            // Add hover effects
            button.addEventListener('mouseenter', () => {
                this.addButtonHoverEffect(button, true);
            });
            
            button.addEventListener('mouseleave', () => {
                this.addButtonHoverEffect(button, false);
            });
            
            // Add click tracking
            button.addEventListener('click', (event) => {
                this.trackCTAClick(button, event);
            });
        });
    }

    /**
     * Add button hover effect
     */
    addButtonHoverEffect(button, isHovering) {
        if (isHovering) {
            button.style.transform = 'translateY(-3px) scale(1.02)';
            button.style.boxShadow = 'var(--shadow-xl)';
        } else {
            button.style.transform = 'translateY(0) scale(1)';
            button.style.boxShadow = '';
        }
    }

    /**
     * Track CTA button clicks
     */
    trackCTAClick(button, event) {
        const buttonText = button.textContent.trim();
        const href = button.getAttribute('href');
        
        console.log(`🎯 CTA clicked: ${buttonText}`);
        
        // Dispatch analytics event
        this.dispatchEvent('hero:cta-click', {
            button: buttonText,
            href: href,
            position: Array.from(this.ctaButtons).indexOf(button)
        });
        
        // Add click feedback
        button.style.transform = 'scale(0.98)';
        setTimeout(() => {
            button.style.transform = '';
        }, 100);
    }

    /**
     * Setup scroll indicator
     */
    setupScrollIndicator() {
        if (!this.scrollIndicator) return;
        
        this.scrollIndicator.addEventListener('click', (event) => {
            event.preventDefault();
            
            // Smooth scroll to next section
            const nextSection = document.getElementById('about');
            if (nextSection) {
                nextSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
            
            // Dispatch scroll event
            this.dispatchEvent('hero:scroll-indicator-click');
        });
        
        // Auto-hide on scroll
        window.addEventListener('scroll', () => {
            const scrollPercentage = window.scrollY / window.innerHeight;
            const opacity = Math.max(0, 1 - scrollPercentage * 2);
            this.scrollIndicator.style.opacity = opacity;
        }, { passive: true });
    }

    /**
     * Handle mouse movement for parallax
     */
    handleMouseMove(event) {
        if (!this.options.enableParallax || !this.heroContent) return;
        
        this.mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
        this.mouseY = (event.clientY / window.innerHeight - 0.5) * 2;
        
        this.updateParallax();
    }

    /**
     * Handle scroll for parallax
     */
    handleScroll() {
        this.scrollY = window.scrollY;
        this.updateParallax();
    }

    /**
     * Update parallax effect
     */
    updateParallax() {
        if (!this.options.enableParallax || !this.heroContent) return;
        
        const intensity = this.options.parallaxIntensity;
        const translateX = this.mouseX * intensity * 10;
        const translateY = this.mouseY * intensity * 10 + this.scrollY * 0.5;
        
        this.heroContent.style.transform = `translate(${translateX}px, ${translateY}px)`;
        
        // Apply different parallax to particles
        if (this.particlesContainer) {
            const particleTranslateX = this.mouseX * intensity * 5;
            const particleTranslateY = this.mouseY * intensity * 5 + this.scrollY * 0.3;
            this.particlesContainer.style.transform = `translate(${particleTranslateX}px, ${particleTranslateY}px)`;
        }
    }

    /**
     * Handle visibility change
     */
    handleVisibilityChange() {
        if (this.isVisible) {
            // Resume animations
            if (this.typewriterInterval) {
                this.typewriterPaused = false;
            }
            
            console.log('🌟 Hero section is visible');
            this.dispatchEvent('hero:visible');
        } else {
            // Pause animations to save performance
            this.typewriterPaused = true;
            
            console.log('🌟 Hero section is hidden');
            this.dispatchEvent('hero:hidden');
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
        const isMobile = window.innerWidth <= 768;
        const newParticleCount = isMobile ? 30 : 50;
        
        // Recreate particles if count changed
        if (newParticleCount !== this.options.particleCount) {
            this.options.particleCount = newParticleCount;
            if (this.options.enableParticles) {
                this.initializeParticles();
            }
        }
        
        // Update parallax
        this.updateParallax();
    }

    /**
     * Handle reduced motion preference change
     */
    handleReducedMotionChange(event) {
        const prefersReducedMotion = event.matches;
        
        if (prefersReducedMotion) {
            // Disable animations
            this.options.enableParallax = false;
            this.stopAnimations();
        } else {
            // Re-enable animations
            this.options.enableParallax = true;
            this.startAnimations();
        }
    }

    /**
     * Handle theme change
     */
    handleThemeChange(event) {
        const { theme } = event.detail;
        
        // Update particle colors based on theme
        this.particles.forEach(particle => {
            const opacity = particle.opacity;
            if (theme === 'dark') {
                particle.element.style.background = `rgba(147, 197, 253, ${opacity})`;
            } else {
                particle.element.style.background = `rgba(102, 126, 234, ${opacity})`;
            }
        });
    }

    /**
     * Stop all animations
     */
    stopAnimations() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        
        if (this.typewriterInterval) {
            clearInterval(this.typewriterInterval);
            this.typewriterInterval = null;
        }
        
        if (this.cursorInterval) {
            clearInterval(this.cursorInterval);
            this.cursorInterval = null;
        }
    }

    /**
     * Start animations
     */
    startAnimations() {
        if (this.options.enableParticles && !this.animationFrame) {
            this.startParticleAnimation();
        }
        
        if (this.options.enableTyping && !this.typewriterInterval) {
            this.startTyping();
        }
        
        if (this.options.enableTyping && !this.cursorInterval) {
            this.startCursorBlink();
        }
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
            particleCount: this.particles.length,
            currentText: this.typeTexts[this.currentTextIndex],
            isTyping: !this.isDeleting,
            mousePosition: { x: this.mouseX, y: this.mouseY },
            scrollPosition: this.scrollY
        };
    }

    /**
     * Update configuration
     */
    updateConfig(newOptions) {
        this.options = { ...this.options, ...newOptions };
        
        // Reinitialize if needed
        if (newOptions.particleCount || newOptions.enableParticles !== undefined) {
            this.initializeParticles();
        }
    }

    /**
     * Cleanup component
     */
    destroy() {
        console.log('🧹 Destroying Hero component...');
        
        // Stop animations
        this.stopAnimations();
        
        // Remove event listeners
        if (this.options.enableParallax) {
            document.removeEventListener('mousemove', this.throttledMouseMove);
        }
        
        window.removeEventListener('scroll', this.throttledScroll);
        window.removeEventListener('resize', this.throttledResize);
        
        // Clear particles
        if (this.particlesContainer) {
            this.particlesContainer.innerHTML = '';
        }
        this.particles = [];
        
        // Remove avatar effects
        if (this.avatarElement) {
            this.avatarElement.style.transform = '';
        }
        
        console.log('🧹 Hero component destroyed');
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HeroComponent };
}

// Export for ES6 modules
export { HeroComponent };

/*
===============================================
END HERO.JS
Complete hero component with:
- Animated particle system
- Typewriter text effect
- Interactive avatar
- Parallax effects
- CTA button tracking
- Smooth scroll indicator
- Performance optimizations
- Accessibility support
- Mobile responsiveness
===============================================
*/