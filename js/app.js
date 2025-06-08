/*
===============================================
APP.JS - SPA Core Application
Ultra-modern Single Page Application controller
===============================================
*/

/**
 * Main Application Class
 * Manages the entire SPA lifecycle and coordination
 */
class PortfolioApp {
    constructor() {
        this.isInitialized = false;
        this.currentSection = 'home';
        this.isLoading = true;
        this.isMobile = window.innerWidth <= 768;
        this.scrollPosition = 0;
        this.isScrolling = false;
        
        // Component instances
        this.router = null;
        this.themeManager = null;
        this.animationManager = null;
        this.scrollManager = null;
        this.formManager = null;
        this.modalManager = null;
        
        // Performance tracking
        this.performanceMetrics = {
            loadStart: performance.now(),
            domReady: null,
            appReady: null
        };
        
        // Bind methods
        this.handleResize = this.handleResize.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
        this.handleKeydown = this.handleKeydown.bind(this);
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            console.log('🚀 Initializing Portfolio SPA...');
            
            // Wait for DOM to be ready
            await this.waitForDOM();
            this.performanceMetrics.domReady = performance.now();
            
            // Initialize core systems
            await this.initializeCore();
            
            // Initialize components
            await this.initializeComponents();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize router and load initial page
            await this.initializeRouter();
            
            // Setup scroll reveal animations
            this.setupScrollReveal();
            
            // Hide loading screen
            await this.hideLoadingScreen();
            
            // Mark as initialized
            this.isInitialized = true;
            this.isLoading = false;
            this.performanceMetrics.appReady = performance.now();
            
            console.log('✅ Portfolio SPA initialized successfully');
            this.logPerformanceMetrics();
            
            // Dispatch app ready event
            this.dispatchEvent('app:ready');
            
        } catch (error) {
            console.error('❌ Failed to initialize app:', error);
            this.handleInitError(error);
        }
    }

    /**
     * Wait for DOM to be ready
     */
    waitForDOM() {
        return new Promise((resolve) => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }

    /**
     * Initialize core application systems
     */
    async initializeCore() {
        console.log('🔧 Initializing core systems...');
        
        // Initialize theme manager
        this.themeManager = new ThemeManager();
        this.themeManager.init();
        
        // Initialize performance monitor
        this.setupPerformanceMonitoring();
        
        // Setup error handling
        this.setupErrorHandling();
        
        // Initialize intersection observer
        this.setupIntersectionObserver();
        
        // Check for browser support
        this.checkBrowserSupport();
    }

    /**
     * Initialize application components
     */
    async initializeComponents() {
        console.log('🎨 Initializing components...');
        
        // Initialize animation manager
        this.animationManager = new AnimationManager();
        this.animationManager.init();
        
        // Initialize scroll manager
        this.scrollManager = new ScrollManager();
        this.scrollManager.init();
        
        // Initialize form manager
        this.formManager = new FormManager();
        this.formManager.init();
        
        // Initialize modal manager
        this.modalManager = new ModalManager();
        this.modalManager.init();
        
        // Initialize navigation
        this.initializeNavigation();
        
        // Initialize hero section
        this.initializeHero();
        
        // Initialize portfolio
        this.initializePortfolio();
        
        // Initialize skills
        this.initializeSkills();
        
        // Initialize contact form
        this.initializeContact();
        
        // Initialize cursor effect (desktop only)
        if (!this.isMobile) {
            this.initializeCursor();
        }
    }

    /**
     * Initialize router
     */
    async initializeRouter() {
        console.log('🧭 Initializing router...');
        
        // Dynamic import of router
        const { Router } = await import('./router.js');
        this.router = new Router();
        
        // Setup routes
        this.router.addRoute('home', () => this.navigateToSection('home'));
        this.router.addRoute('about', () => this.navigateToSection('about'));
        this.router.addRoute('skills', () => this.navigateToSection('skills'));
        this.router.addRoute('portfolio', () => this.navigateToSection('portfolio'));
        this.router.addRoute('experience', () => this.navigateToSection('experience'));
        this.router.addRoute('contact', () => this.navigateToSection('contact'));
        
        // Initialize router
        this.router.init();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        console.log('👂 Setting up event listeners...');
        
        // Window events
        window.addEventListener('resize', this.handleResize, { passive: true });
        window.addEventListener('scroll', this.handleScroll, { passive: true });
        window.addEventListener('orientationchange', this.handleOrientationChange.bind(this));
        window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
        
        // Document events
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
        document.addEventListener('keydown', this.handleKeydown);
        
        // Custom events
        document.addEventListener('section:change', this.handleSectionChange.bind(this));
        document.addEventListener('theme:change', this.handleThemeChange.bind(this));
        
        // Performance events
        window.addEventListener('load', this.handleWindowLoad.bind(this));
    }

    /**
     * Initialize navigation
     */
    initializeNavigation() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        const navLinks = document.querySelectorAll('.nav-link');
        const header = document.getElementById('header');
        
        // Mobile menu toggle
        if (navToggle) {
            navToggle.addEventListener('click', () => {
                navToggle.classList.toggle('active');
                navMenu.classList.toggle('active');
                document.body.classList.toggle('nav-open');
            });
        }
        
        // Navigation links
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                if (section) {
                    this.navigateToSection(section);
                    
                    // Close mobile menu
                    if (navToggle) {
                        navToggle.classList.remove('active');
                        navMenu.classList.remove('active');
                        document.body.classList.remove('nav-open');
                    }
                }
            });
        });
        
        // Header scroll effect
        let lastScrollY = window.scrollY;
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            if (header) {
                if (currentScrollY > 100) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            }
            
            lastScrollY = currentScrollY;
        }, { passive: true });
    }

    /**
     * Initialize hero section
     */
    initializeHero() {
        console.log('🌟 Initializing hero section...');
        
        // Typed text effect
        this.initializeTypedText();
        
        // Particle system
        this.initializeParticles();
        
        // Scroll indicator
        const scrollIndicator = document.querySelector('.scroll-indicator');
        if (scrollIndicator) {
            scrollIndicator.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateToSection('about');
            });
        }
        
        // Avatar hover effect
        const avatar = document.querySelector('.hero-avatar');
        if (avatar) {
            avatar.addEventListener('mouseenter', () => {
                avatar.style.transform = 'scale(1.05) rotate(2deg)';
            });
            
            avatar.addEventListener('mouseleave', () => {
                avatar.style.transform = 'scale(1) rotate(0deg)';
            });
        }
    }

    /**
     * Initialize typed text effect
     */
    initializeTypedText() {
        const typedElement = document.getElementById('typed-text');
        if (!typedElement) return;
        
        const texts = [
            'Desarrollador Full Stack',
            'Frontend Developer',
            'Backend Developer',
            'UI/UX Enthusiast',
            'Problem Solver'
        ];
        
        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typingSpeed = 100;
        
        const typeText = () => {
            const currentText = texts[textIndex];
            
            if (isDeleting) {
                typedElement.textContent = currentText.substring(0, charIndex - 1);
                charIndex--;
                typingSpeed = 50;
            } else {
                typedElement.textContent = currentText.substring(0, charIndex + 1);
                charIndex++;
                typingSpeed = 100;
            }
            
            if (!isDeleting && charIndex === currentText.length) {
                isDeleting = true;
                typingSpeed = 2000; // Pause before deleting
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                textIndex = (textIndex + 1) % texts.length;
            }
            
            setTimeout(typeText, typingSpeed);
        };
        
        // Start typing effect
        setTimeout(typeText, 1000);
    }

    /**
     * Initialize particle system
     */
    initializeParticles() {
        const particlesContainer = document.getElementById('particles');
        if (!particlesContainer) return;
        
        const particleCount = this.isMobile ? 30 : 50;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 4 + 2}px;
                height: ${Math.random() * 4 + 2}px;
                background: rgba(102, 126, 234, ${Math.random() * 0.5 + 0.2});
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: particleFloat ${Math.random() * 3 + 3}s ease-in-out infinite;
                animation-delay: ${Math.random() * 2}s;
            `;
            particlesContainer.appendChild(particle);
        }
    }

    /**
     * Initialize portfolio section
     */
    initializePortfolio() {
        console.log('🎨 Initializing portfolio...');
        
        const filterButtons = document.querySelectorAll('.filter-btn');
        const portfolioItems = document.querySelectorAll('.portfolio-item');
        
        // Filter functionality
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.getAttribute('data-filter');
                
                // Update active button
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Filter items
                portfolioItems.forEach(item => {
                    const category = item.getAttribute('data-category');
                    if (filter === 'all' || category === filter) {
                        item.style.display = 'block';
                        item.style.animation = 'fadeIn 0.5s ease forwards';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
        
        // Portfolio item click handlers
        portfolioItems.forEach(item => {
            const viewButton = item.querySelector('[data-action="view"]');
            if (viewButton) {
                viewButton.addEventListener('click', () => {
                    const projectId = viewButton.getAttribute('data-project');
                    this.modalManager.openPortfolioModal(projectId);
                });
            }
        });
    }

    /**
     * Initialize skills section
     */
    initializeSkills() {
        console.log('🛠️ Initializing skills...');
        
        const skillBars = document.querySelectorAll('.skill-progress');
        
        // Animate skill bars when in view
        const animateSkills = () => {
            skillBars.forEach(bar => {
                const width = bar.getAttribute('data-width');
                if (width) {
                    bar.style.width = width + '%';
                }
            });
        };
        
        // Setup intersection observer for skills
        const skillsSection = document.getElementById('skills');
        if (skillsSection) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateSkills();
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            
            observer.observe(skillsSection);
        }
    }

    /**
     * Initialize contact form
     */
    initializeContact() {
        console.log('📧 Initializing contact form...');
        
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            this.formManager.setupForm(contactForm, {
                onSubmit: this.handleContactSubmit.bind(this),
                onValidate: this.validateContactForm.bind(this)
            });
        }
    }

    /**
     * Handle contact form submission
     */
    async handleContactSubmit(formData) {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Show success message
            this.showNotification('¡Mensaje enviado correctamente! Te responderé pronto.', 'success');
            
            // Reset form
            document.getElementById('contact-form').reset();
            
            return true;
        } catch (error) {
            console.error('Error sending message:', error);
            this.showNotification('Error al enviar el mensaje. Inténtalo de nuevo.', 'error');
            return false;
        }
    }

    /**
     * Validate contact form
     */
    validateContactForm(formData) {
        const errors = {};
        
        if (!formData.name || formData.name.length < 2) {
            errors.name = 'El nombre debe tener al menos 2 caracteres';
        }
        
        if (!formData.email || !this.isValidEmail(formData.email)) {
            errors.email = 'Por favor, introduce un email válido';
        }
        
        if (!formData.message || formData.message.length < 10) {
            errors.message = 'El mensaje debe tener al menos 10 caracteres';
        }
        
        if (!formData.privacy) {
            errors.privacy = 'Debes aceptar la política de privacidad';
        }
        
        return Object.keys(errors).length === 0 ? null : errors;
    }

    /**
     * Validate email format
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Initialize cursor effect (desktop only)
     */
    initializeCursor() {
        const cursor = document.getElementById('cursor');
        if (!cursor) return;
        
        let mouseX = 0;
        let mouseY = 0;
        let cursorX = 0;
        let cursorY = 0;
        
        // Update mouse position
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        
        // Animate cursor
        const animateCursor = () => {
            cursorX += (mouseX - cursorX) * 0.1;
            cursorY += (mouseY - cursorY) * 0.1;
            
            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';
            
            requestAnimationFrame(animateCursor);
        };
        
        animateCursor();
        
        // Cursor hover effects
        const hoverElements = document.querySelectorAll('a, button, .btn, .card');
        hoverElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                cursor.classList.add('hover');
            });
            
            element.addEventListener('mouseleave', () => {
                cursor.classList.remove('hover');
            });
        });
    }

    /**
     * Setup scroll reveal animations
     */
    setupScrollReveal() {
        const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
        
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        revealElements.forEach(element => {
            revealObserver.observe(element);
        });
        
        // Setup staggered animations
        const staggerElements = document.querySelectorAll('.reveal-stagger');
        const staggerObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.1 });
        
        staggerElements.forEach(element => {
            staggerObserver.observe(element);
        });
    }

    /**
     * Setup intersection observer for sections
     */
    setupIntersectionObserver() {
        const sections = document.querySelectorAll('.section');
        
        this.sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    this.updateActiveSection(sectionId);
                }
            });
        }, {
            threshold: 0.5,
            rootMargin: '-20% 0px -20% 0px'
        });
        
        sections.forEach(section => {
            this.sectionObserver.observe(section);
        });
    }

    /**
     * Navigate to section
     */
    navigateToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return;
        
        // Update URL
        if (this.router) {
            this.router.navigate(sectionId);
        }
        
        // Smooth scroll to section
        this.scrollToElement(section);
        
        // Update current section
        this.currentSection = sectionId;
        
        // Dispatch section change event
        this.dispatchEvent('section:change', { section: sectionId });
    }

    /**
     * Smooth scroll to element
     */
    scrollToElement(element) {
        const headerHeight = this.isMobile ? 60 : 70;
        const elementPosition = element.offsetTop - headerHeight;
        
        window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
        });
    }

    /**
     * Update active section in navigation
     */
    updateActiveSection(sectionId) {
        // Update navigation links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === sectionId) {
                link.classList.add('active');
            }
        });
        
        // Update current section
        this.currentSection = sectionId;
        
        // Update progress bar
        this.updateProgressBar();
    }

    /**
     * Update scroll progress bar
     */
    updateProgressBar() {
        const progressBar = document.getElementById('progress-bar');
        if (!progressBar) return;
        
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (window.scrollY / totalHeight) * 100;
        
        progressBar.style.width = `${Math.min(progress, 100)}%`;
    }

    /**
     * Hide loading screen
     */
    async hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (!loadingScreen) return;
        
        return new Promise((resolve) => {
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    resolve();
                }, 500);
            }, 1000);
        });
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 350px;
        `;
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Setup close button
        const closeButton = notification.querySelector('.notification-close');
        closeButton.addEventListener('click', () => {
            this.hideNotification(notification);
        });
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            this.hideNotification(notification);
        }, 5000);
    }

    /**
     * Hide notification
     */
    hideNotification(notification) {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    /**
     * Event handlers
     */
    handleResize() {
        const wasDesktop = !this.isMobile;
        this.isMobile = window.innerWidth <= 768;
        
        // Handle desktop/mobile transition
        if (wasDesktop && this.isMobile) {
            // Switched to mobile
            this.handleDesktopToMobile();
        } else if (!wasDesktop && !this.isMobile) {
            // Switched to desktop
            this.handleMobileToDesktop();
        }
        
        // Update components
        if (this.animationManager) {
            this.animationManager.handleResize();
        }
    }

    handleScroll() {
        if (this.isScrolling) return;
        
        this.isScrolling = true;
        this.scrollPosition = window.scrollY;
        
        // Update progress bar
        this.updateProgressBar();
        
        // Handle back to top button
        this.updateBackToTopButton();
        
        // Reset scrolling flag
        requestAnimationFrame(() => {
            this.isScrolling = false;
        });
    }

    handleVisibilityChange() {
        if (document.hidden) {
            // Page is hidden
            this.dispatchEvent('app:hidden');
        } else {
            // Page is visible
            this.dispatchEvent('app:visible');
        }
    }

    handleKeydown(e) {
        // Handle keyboard navigation
        if (e.key === 'Escape') {
            // Close any open modals
            if (this.modalManager) {
                this.modalManager.closeAll();
            }
            
            // Close mobile menu
            const navToggle = document.getElementById('nav-toggle');
            const navMenu = document.getElementById('nav-menu');
            if (navToggle && navToggle.classList.contains('active')) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('nav-open');
            }
        }
    }

    handleOrientationChange() {
        // Handle orientation change
        setTimeout(() => {
            this.handleResize();
        }, 100);
    }

    handleBeforeUnload() {
        // Cleanup before page unload
        this.cleanup();
    }

    handleWindowLoad() {
        // Page fully loaded
        this.dispatchEvent('app:loaded');
    }

    handleSectionChange(e) {
        console.log('Section changed to:', e.detail.section);
    }

    handleThemeChange(e) {
        console.log('Theme changed to:', e.detail.theme);
    }

    handleInitError(error) {
        // Show error message to user
        document.body.innerHTML = `
            <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                flex-direction: column;
                font-family: system-ui, sans-serif;
                text-align: center;
                padding: 20px;
            ">
                <h1 style="color: #ef4444; margin-bottom: 20px;">Error de Inicialización</h1>
                <p style="color: #6b7280; margin-bottom: 20px;">
                    Lo siento, hubo un problema al cargar la aplicación.
                </p>
                <button onclick="window.location.reload()" style="
                    padding: 12px 24px;
                    background: #3b82f6;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                ">
                    Recargar Página
                </button>
            </div>
        `;
    }

    /**
     * Helper methods
     */
    updateBackToTopButton() {
        const backToTopButton = document.getElementById('back-to-top');
        if (!backToTopButton) return;
        
        if (window.scrollY > 500) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    }

    handleDesktopToMobile() {
        // Remove desktop-specific features
        const cursor = document.getElementById('cursor');
        if (cursor) {
            cursor.style.display = 'none';
        }
    }

    handleMobileToDesktop() {
        // Add desktop-specific features
        const cursor = document.getElementById('cursor');
        if (cursor) {
            cursor.style.display = 'block';
        }
        
        // Close mobile menu if open
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        if (navToggle && navToggle.classList.contains('active')) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.classList.remove('nav-open');
        }
    }

    setupPerformanceMonitoring() {
        // Monitor performance
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    if (entry.entryType === 'navigation') {
                        console.log('Navigation timing:', entry);
                    }
                });
            });
            observer.observe({ entryTypes: ['navigation'] });
        }
    }

    setupErrorHandling() {
        // Global error handling
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
        });
    }

    checkBrowserSupport() {
        // Check for required features
        const requiredFeatures = [
            'IntersectionObserver',
            'requestAnimationFrame',
            'Promise',
            'fetch'
        ];
        
        const missingFeatures = requiredFeatures.filter(feature => !(feature in window));
        
        if (missingFeatures.length > 0) {
            console.warn('Missing features:', missingFeatures);
            // Could show a warning to the user
        }
    }

    logPerformanceMetrics() {
        const metrics = this.performanceMetrics;
        const domTime = metrics.domReady - metrics.loadStart;
        const appTime = metrics.appReady - metrics.loadStart;
        
        console.log('⚡ Performance Metrics:');
        console.log(`  DOM Ready: ${domTime.toFixed(2)}ms`);
        console.log(`  App Ready: ${appTime.toFixed(2)}ms`);
    }

    dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
    }

    cleanup() {
        // Remove event listeners
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('orientationchange', this.handleOrientationChange);
        window.removeEventListener('beforeunload', this.handleBeforeUnload);
        
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        document.removeEventListener('keydown', this.handleKeydown);
        
        // Cleanup observers
        if (this.sectionObserver) {
            this.sectionObserver.disconnect();
        }
        
        // Cleanup components
        if (this.router) this.router.cleanup();
        if (this.themeManager) this.themeManager.cleanup();
        if (this.animationManager) this.animationManager.cleanup();
        if (this.scrollManager) this.scrollManager.cleanup();
        if (this.formManager) this.formManager.cleanup();
        if (this.modalManager) this.modalManager.cleanup();
    }
}

/**
 * Theme Manager Class
 * Handles dark/light theme switching
 */
class ThemeManager {
    constructor() {
        this.currentTheme = this.getStoredTheme() || this.getSystemTheme();
        this.themeButton = null;
    }

    init() {
        this.themeButton = document.getElementById('theme-btn');
        this.applyTheme(this.currentTheme);
        this.setupEventListeners();
    }

    getStoredTheme() {
        return localStorage.getItem('theme');
    }

    getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        localStorage.setItem('theme', theme);
        
        // Update theme button
        if (this.themeButton) {
            const sunIcon = this.themeButton.querySelector('.sun');
            const moonIcon = this.themeButton.querySelector('.moon');
            
            if (theme === 'dark') {
                sunIcon.style.opacity = '0';
                moonIcon.style.opacity = '1';
            } else {
                sunIcon.style.opacity = '1';
                moonIcon.style.opacity = '0';
            }
        }
        
        // Dispatch theme change event
        document.dispatchEvent(new CustomEvent('theme:change', {
            detail: { theme }
        }));
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
    }

    setupEventListeners() {
        if (this.themeButton) {
            this.themeButton.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!this.getStoredTheme()) {
                this.applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    cleanup() {
        // Remove event listeners if needed
    }
}

/**
 * Animation Manager Class
 * Handles scroll animations and performance
 */
class AnimationManager {
    constructor() {
        this.animatedElements = new Set();
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    init() {
        this.setupScrollAnimations();
        this.setupCounterAnimations();
        this.setupStaggeredAnimations();
    }

    setupScrollAnimations() {
        const elements = document.querySelectorAll('[data-animate]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
                    this.animateElement(entry.target);
                    this.animatedElements.add(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        elements.forEach(element => observer.observe(element));
    }

    animateElement(element) {
        if (this.isReducedMotion) return;
        
        const animationType = element.getAttribute('data-animate');
        const delay = element.getAttribute('data-delay') || 0;
        
        setTimeout(() => {
            element.classList.add(`animate-${animationType}`);
        }, parseInt(delay));
    }

    setupCounterAnimations() {
        const counters = document.querySelectorAll('.stat-number');
        
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => counterObserver.observe(counter));
    }

    animateCounter(element) {
        const target = parseInt(element.getAttribute('data-target'));
        const duration = 2000; // 2 seconds
        const start = performance.now();
        const startValue = 0;

        const updateCounter = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(startValue + (target - startValue) * easeOut);
            
            element.textContent = currentValue;
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
            }
        };

        requestAnimationFrame(updateCounter);
    }

    setupStaggeredAnimations() {
        const staggerGroups = document.querySelectorAll('[data-stagger]');
        
        staggerGroups.forEach(group => {
            const children = group.children;
            const staggerDelay = parseInt(group.getAttribute('data-stagger')) || 100;
            
            Array.from(children).forEach((child, index) => {
                child.style.animationDelay = `${index * staggerDelay}ms`;
            });
        });
    }

    handleResize() {
        // Handle any resize-related animations
    }

    cleanup() {
        this.animatedElements.clear();
    }
}

/**
 * Scroll Manager Class
 * Handles smooth scrolling and scroll effects
 */
class ScrollManager {
    constructor() {
        this.isScrolling = false;
        this.scrollTimeout = null;
    }

    init() {
        this.setupSmoothScrolling();
        this.setupBackToTop();
        this.setupScrollProgress();
    }

    setupSmoothScrolling() {
        // Already handled by CSS scroll-behavior: smooth
        // This is for additional JavaScript-based smooth scrolling if needed
    }

    setupBackToTop() {
        const backToTopButton = document.getElementById('back-to-top');
        if (!backToTopButton) return;

        backToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // Show/hide based on scroll position
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        }, { passive: true });
    }

    setupScrollProgress() {
        // Already handled in main app class
    }

    cleanup() {
        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
        }
    }
}

/**
 * Form Manager Class
 * Handles form validation and submission
 */
class FormManager {
    constructor() {
        this.forms = new Map();
    }

    init() {
        // Forms will be registered individually
    }

    setupForm(formElement, options = {}) {
        const formId = formElement.id || 'form-' + Date.now();
        
        const formConfig = {
            element: formElement,
            onSubmit: options.onSubmit || this.defaultSubmitHandler,
            onValidate: options.onValidate || this.defaultValidateHandler,
            realTimeValidation: options.realTimeValidation !== false
        };

        this.forms.set(formId, formConfig);
        this.setupFormEventListeners(formConfig);
        
        return formId;
    }

    setupFormEventListeners(config) {
        const form = config.element;
        
        // Form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // Validate
            const errors = config.onValidate(data);
            if (errors) {
                this.displayErrors(form, errors);
                return;
            }
            
            // Clear previous errors
            this.clearErrors(form);
            
            // Show loading state
            this.setFormLoading(form, true);
            
            try {
                const success = await config.onSubmit(data);
                if (success) {
                    this.setFormSuccess(form);
                }
            } catch (error) {
                this.setFormError(form, error.message);
            } finally {
                this.setFormLoading(form, false);
            }
        });

        // Real-time validation
        if (config.realTimeValidation) {
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.addEventListener('blur', () => {
                    this.validateField(input, config.onValidate);
                });
                
                input.addEventListener('input', () => {
                    this.clearFieldError(input);
                });
            });
        }
    }

    validateField(field, validateFunction) {
        const formData = new FormData(field.form);
        const data = Object.fromEntries(formData.entries());
        const errors = validateFunction(data);
        
        if (errors && errors[field.name]) {
            this.displayFieldError(field, errors[field.name]);
        } else {
            this.clearFieldError(field);
        }
    }

    displayErrors(form, errors) {
        Object.keys(errors).forEach(fieldName => {
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (field) {
                this.displayFieldError(field, errors[fieldName]);
            }
        });
    }

    displayFieldError(field, message) {
        field.classList.add('error');
        
        const errorElement = document.getElementById(`${field.name}-error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    clearFieldError(field) {
        field.classList.remove('error');
        
        const errorElement = document.getElementById(`${field.name}-error`);
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    }

    clearErrors(form) {
        const errorElements = form.querySelectorAll('.form-error');
        errorElements.forEach(element => {
            element.textContent = '';
            element.style.display = 'none';
        });
        
        const inputs = form.querySelectorAll('.error');
        inputs.forEach(input => {
            input.classList.remove('error');
        });
    }

    setFormLoading(form, isLoading) {
        const submitButton = form.querySelector('[type="submit"]');
        if (submitButton) {
            if (isLoading) {
                submitButton.classList.add('loading');
                submitButton.disabled = true;
            } else {
                submitButton.classList.remove('loading');
                submitButton.disabled = false;
            }
        }
    }

    setFormSuccess(form) {
        const statusElement = form.querySelector('.form-status');
        if (statusElement) {
            statusElement.className = 'form-status success';
            statusElement.textContent = '¡Mensaje enviado correctamente!';
            statusElement.style.display = 'block';
        }
    }

    setFormError(form, message) {
        const statusElement = form.querySelector('.form-status');
        if (statusElement) {
            statusElement.className = 'form-status error';
            statusElement.textContent = message || 'Error al enviar el formulario';
            statusElement.style.display = 'block';
        }
    }

    defaultSubmitHandler(data) {
        console.log('Form submitted:', data);
        return Promise.resolve(true);
    }

    defaultValidateHandler(data) {
        return null; // No errors
    }

    cleanup() {
        this.forms.clear();
    }
}

/**
 * Modal Manager Class
 * Handles modal dialogs and overlays
 */
class ModalManager {
    constructor() {
        this.activeModals = new Set();
        this.portfolioData = this.getPortfolioData();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Close modal on overlay click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeModal(e.target.closest('.modal'));
            }
        });

        // Close modal on close button click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-close')) {
                this.closeModal(e.target.closest('.modal'));
            }
        });

        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAll();
            }
        });
    }

    openPortfolioModal(projectId) {
        const modal = document.getElementById('portfolio-modal');
        if (!modal) return;

        const project = this.portfolioData[projectId];
        if (!project) return;

        // Populate modal content
        this.populatePortfolioModal(modal, project);
        
        // Show modal
        this.showModal(modal);
    }

    populatePortfolioModal(modal, project) {
        // Update title
        const title = modal.querySelector('#modal-title');
        if (title) title.textContent = project.title;

        // Update image
        const image = modal.querySelector('#modal-image');
        if (image) {
            image.src = project.image;
            image.alt = project.title;
        }

        // Update description
        const description = modal.querySelector('#modal-description');
        if (description) description.textContent = project.description;

        // Update details
        const client = modal.querySelector('#modal-client');
        if (client) client.textContent = project.client;

        const duration = modal.querySelector('#modal-duration');
        if (duration) duration.textContent = project.duration;

        const year = modal.querySelector('#modal-year');
        if (year) year.textContent = project.year;

        // Update tech list
        const techList = modal.querySelector('#modal-tech-list');
        if (techList) {
            techList.innerHTML = project.technologies.map(tech => 
                `<span class="tech-tag">${tech}</span>`
            ).join('');
        }

        // Update features list
        const featuresList = modal.querySelector('#modal-features-list');
        if (featuresList) {
            featuresList.innerHTML = project.features.map(feature => 
                `<li>${feature}</li>`
            ).join('');
        }

        // Update action buttons
        const demoButton = modal.querySelector('#modal-demo');
        if (demoButton) {
            demoButton.href = project.demoUrl || '#';
            demoButton.style.display = project.demoUrl ? 'inline-flex' : 'none';
        }

        const codeButton = modal.querySelector('#modal-code');
        if (codeButton) {
            codeButton.href = project.codeUrl || '#';
            codeButton.style.display = project.codeUrl ? 'inline-flex' : 'none';
        }
    }

    showModal(modal) {
        modal.classList.add('active');
        this.activeModals.add(modal);
        document.body.style.overflow = 'hidden';
        
        // Focus management
        const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
            firstFocusable.focus();
        }
    }

    closeModal(modal) {
        if (!modal) return;
        
        modal.classList.remove('active');
        this.activeModals.delete(modal);
        
        if (this.activeModals.size === 0) {
            document.body.style.overflow = '';
        }
    }

    closeAll() {
        this.activeModals.forEach(modal => {
            this.closeModal(modal);
        });
    }

    getPortfolioData() {
        return {
            '1': {
                title: 'E-commerce Platform',
                image: 'assets/images/project1.jpg',
                description: 'Plataforma completa de comercio electrónico con panel administrativo, gestión de inventario, procesamiento de pagos y analytics en tiempo real.',
                client: 'TechCorp Solutions',
                duration: '4 meses',
                year: '2024',
                technologies: ['React', 'Node.js', 'MongoDB', 'Stripe', 'Redis'],
                features: [
                    'Sistema de autenticación y autorización',
                    'Carrito de compras con persistencia',
                    'Procesamiento de pagos con Stripe',
                    'Panel administrativo completo',
                    'Analytics y reportes en tiempo real',
                    'Responsive design mobile-first'
                ],
                demoUrl: 'https://demo.example.com',
                codeUrl: 'https://github.com/mariofca/ecommerce'
            },
            '2': {
                title: 'Task Management App',
                image: 'assets/images/project2.jpg',
                description: 'Aplicación de gestión de tareas con colaboración en tiempo real, notificaciones push y sincronización multiplataforma.',
                client: 'StartUp Innovate',
                duration: '3 meses',
                year: '2024',
                technologies: ['Vue.js', 'Socket.io', 'Express', 'PostgreSQL', 'PWA'],
                features: [
                    'Colaboración en tiempo real',
                    'Notificaciones push',
                    'Drag & drop interface',
                    'Offline functionality',
                    'Team management',
                    'Time tracking'
                ],
                demoUrl: 'https://tasks.example.com',
                codeUrl: 'https://github.com/mariofca/taskmanager'
            },
            '3': {
                title: 'Weather App',
                image: 'assets/images/project3.jpg',
                description: 'Aplicación del clima con geolocalización, pronósticos detallados, mapas interactivos y notificaciones de clima severo.',
                client: 'Personal Project',
                duration: '2 meses',
                year: '2023',
                technologies: ['React Native', 'OpenWeather API', 'MapBox', 'AsyncStorage'],
                features: [
                    'Geolocalización automática',
                    'Pronósticos de 7 días',
                    'Mapas interactivos',
                    'Notificaciones clima severo',
                    'Múltiples ubicaciones',
                    'Widgets personalizables'
                ],
                demoUrl: 'https://weather.example.com',
                codeUrl: 'https://github.com/mariofca/weather-app'
            },
            '4': {
                title: 'Brand Identity',
                image: 'assets/images/project4.jpg',
                description: 'Identidad visual completa para startup tecnológica incluyendo logo, paleta de colores, tipografías y guidelines.',
                client: 'TechStart Inc.',
                duration: '6 semanas',
                year: '2023',
                technologies: ['Figma', 'Adobe Illustrator', 'Adobe Photoshop', 'Principle'],
                features: [
                    'Investigación de mercado',
                    'Desarrollo de logo',
                    'Paleta de colores',
                    'Selección tipográfica',
                    'Brand guidelines',
                    'Aplicaciones de marca'
                ],
                demoUrl: 'https://brand.example.com',
                codeUrl: null
            }
        };
    }

    cleanup() {
        this.closeAll();
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.portfolioApp = new PortfolioApp();
    window.portfolioApp.init();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PortfolioApp, ThemeManager, AnimationManager, ScrollManager, FormManager, ModalManager };
}

/*
===============================================
END APP.JS
Complete SPA application with all features:
- Theme management
- Smooth animations  
- Form handling
- Modal system
- Router integration
- Performance monitoring
- Error handling
- Accessibility support
===============================================
*/