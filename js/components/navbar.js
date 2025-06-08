/*
===============================================
NAVBAR.JS - Navigation Component
Ultra-responsive navigation with mobile menu and scroll effects
===============================================
*/

/**
 * Navbar Component Class
 * Handles navigation functionality, mobile menu, and scroll effects
 */
class NavbarComponent {
    constructor(options = {}) {
        this.options = {
            breakpoint: 768,
            scrollThreshold: 100,
            animationDuration: 300,
            autoClose: true,
            scrollOffset: 70,
            ...options
        };
        
        // Component state
        this.isOpen = false;
        this.isScrolled = false;
        this.currentSection = 'home';
        this.lastScrollY = 0;
        this.scrollDirection = 'up';
        this.isMobile = window.innerWidth <= this.options.breakpoint;
        
        // DOM elements
        this.navbar = null;
        this.header = null;
        this.toggle = null;
        this.menu = null;
        this.links = [];
        this.logo = null;
        this.themeToggle = null;
        
        // Event handlers bound to this
        this.handleToggleClick = this.handleToggleClick.bind(this);
        this.handleLinkClick = this.handleLinkClick.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.handleOutsideClick = this.handleOutsideClick.bind(this);
        this.handleKeydown = this.handleKeydown.bind(this);
        this.handleThemeToggle = this.handleThemeToggle.bind(this);
        
        // Throttled functions
        this.throttledScroll = this.throttle(this.handleScroll, 16); // ~60fps
        this.throttledResize = this.throttle(this.handleResize, 250);
        
        // Intersection observer for active sections
        this.sectionObserver = null;
        this.observedSections = [];
    }

    /**
     * Initialize the navbar component
     */
    init() {
        console.log('🧭 Initializing Navbar Component...');
        
        try {
            // Find DOM elements
            this.findElements();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Setup intersection observer
            this.setupSectionObserver();
            
            // Initialize state
            this.updateScrollState();
            this.updateMobileState();
            
            console.log('✅ Navbar Component initialized');
            
            // Dispatch ready event
            this.dispatchEvent('navbar:ready');
            
        } catch (error) {
            console.error('❌ Failed to initialize Navbar:', error);
        }
    }

    /**
     * Find and cache DOM elements
     */
    findElements() {
        this.header = document.getElementById('header');
        this.navbar = document.querySelector('.navbar');
        this.toggle = document.getElementById('nav-toggle');
        this.menu = document.getElementById('nav-menu');
        this.logo = document.querySelector('.nav-logo');
        this.themeToggle = document.getElementById('theme-btn');
        
        // Get all navigation links
        this.links = Array.from(document.querySelectorAll('.nav-link'));
        
        // Validate required elements
        if (!this.header || !this.navbar) {
            throw new Error('Required navbar elements not found');
        }
        
        console.log(`📍 Found ${this.links.length} navigation links`);
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Mobile toggle
        if (this.toggle) {
            this.toggle.addEventListener('click', this.handleToggleClick);
        }
        
        // Navigation links
        this.links.forEach(link => {
            link.addEventListener('click', this.handleLinkClick);
        });
        
        // Theme toggle
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', this.handleThemeToggle);
        }
        
        // Window events
        window.addEventListener('scroll', this.throttledScroll, { passive: true });
        window.addEventListener('resize', this.throttledResize);
        
        // Document events
        document.addEventListener('click', this.handleOutsideClick);
        document.addEventListener('keydown', this.handleKeydown);
        
        // Custom events
        document.addEventListener('section:change', this.handleSectionChange.bind(this));
        document.addEventListener('router:navigated', this.handleRouterNavigation.bind(this));
    }

    /**
     * Setup intersection observer for section detection
     */
    setupSectionObserver() {
        // Find all sections
        this.observedSections = Array.from(document.querySelectorAll('.section[id]'));
        
        if (this.observedSections.length === 0) {
            console.warn('No sections found for navbar observation');
            return;
        }
        
        // Create intersection observer
        this.sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    this.setActiveSection(sectionId);
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '-20% 0px -20% 0px'
        });
        
        // Observe all sections
        this.observedSections.forEach(section => {
            this.sectionObserver.observe(section);
        });
        
        console.log(`👀 Observing ${this.observedSections.length} sections`);
    }

    /**
     * Handle mobile menu toggle
     */
    handleToggleClick(event) {
        event.preventDefault();
        event.stopPropagation();
        
        this.toggleMenu();
    }

    /**
     * Handle navigation link clicks
     */
    handleLinkClick(event) {
        event.preventDefault();
        
        const link = event.currentTarget;
        const section = link.getAttribute('data-section');
        const href = link.getAttribute('href');
        
        // Extract section from href if data-section not available
        const targetSection = section || (href && href.startsWith('#') ? href.substring(1) : null);
        
        if (targetSection) {
            // Navigate to section
            this.navigateToSection(targetSection);
            
            // Close mobile menu if open
            if (this.isOpen && this.isMobile) {
                this.closeMenu();
            }
            
            // Dispatch navigation event
            this.dispatchEvent('navbar:navigate', { section: targetSection });
        }
    }

    /**
     * Handle theme toggle
     */
    handleThemeToggle(event) {
        event.preventDefault();
        
        // Dispatch theme toggle event
        this.dispatchEvent('navbar:theme-toggle');
        
        // Add visual feedback
        this.addButtonFeedback(event.currentTarget);
    }

    /**
     * Handle scroll events
     */
    handleScroll() {
        const currentScrollY = window.scrollY;
        
        // Update scroll direction
        this.scrollDirection = currentScrollY > this.lastScrollY ? 'down' : 'up';
        this.lastScrollY = currentScrollY;
        
        // Update scroll state
        const wasScrolled = this.isScrolled;
        this.isScrolled = currentScrollY > this.options.scrollThreshold;
        
        if (wasScrolled !== this.isScrolled) {
            this.updateScrollState();
        }
        
        // Auto-hide on mobile when scrolling down
        if (this.isMobile && this.isOpen && this.scrollDirection === 'down') {
            this.closeMenu();
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= this.options.breakpoint;
        
        // Handle mobile/desktop transition
        if (wasMobile !== this.isMobile) {
            this.updateMobileState();
            
            // Close menu when switching to desktop
            if (!this.isMobile && this.isOpen) {
                this.closeMenu();
            }
        }
    }

    /**
     * Handle clicks outside the navbar
     */
    handleOutsideClick(event) {
        if (!this.isOpen || !this.isMobile) return;
        
        // Check if click is outside navbar
        if (this.navbar && !this.navbar.contains(event.target)) {
            this.closeMenu();
        }
    }

    /**
     * Handle keyboard events
     */
    handleKeydown(event) {
        switch (event.key) {
            case 'Escape':
                if (this.isOpen) {
                    this.closeMenu();
                    // Focus toggle button
                    if (this.toggle) {
                        this.toggle.focus();
                    }
                }
                break;
                
            case 'Tab':
                if (this.isOpen && this.isMobile) {
                    this.handleTabNavigation(event);
                }
                break;
        }
    }

    /**
     * Handle tab navigation in mobile menu
     */
    handleTabNavigation(event) {
        const focusableElements = this.getFocusableElements();
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (event.shiftKey) {
            // Shift + Tab (backward)
            if (document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            }
        } else {
            // Tab (forward)
            if (document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        }
    }

    /**
     * Toggle mobile menu
     */
    toggleMenu() {
        if (this.isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    /**
     * Open mobile menu
     */
    openMenu() {
        if (this.isOpen) return;
        
        this.isOpen = true;
        
        // Update classes
        if (this.toggle) {
            this.toggle.classList.add('active');
            this.toggle.setAttribute('aria-expanded', 'true');
        }
        
        if (this.menu) {
            this.menu.classList.add('active');
            this.menu.setAttribute('aria-hidden', 'false');
        }
        
        // Prevent body scroll
        document.body.classList.add('nav-open');
        
        // Focus first link
        setTimeout(() => {
            const firstLink = this.menu?.querySelector('.nav-link');
            if (firstLink) {
                firstLink.focus();
            }
        }, this.options.animationDuration);
        
        // Dispatch event
        this.dispatchEvent('navbar:open');
        
        console.log('📱 Mobile menu opened');
    }

    /**
     * Close mobile menu
     */
    closeMenu() {
        if (!this.isOpen) return;
        
        this.isOpen = false;
        
        // Update classes
        if (this.toggle) {
            this.toggle.classList.remove('active');
            this.toggle.setAttribute('aria-expanded', 'false');
        }
        
        if (this.menu) {
            this.menu.classList.remove('active');
            this.menu.setAttribute('aria-hidden', 'true');
        }
        
        // Restore body scroll
        document.body.classList.remove('nav-open');
        
        // Dispatch event
        this.dispatchEvent('navbar:close');
        
        console.log('📱 Mobile menu closed');
    }

    /**
     * Navigate to a section
     */
    navigateToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) {
            console.warn(`Section not found: ${sectionId}`);
            return;
        }
        
        // Calculate scroll position
        const headerHeight = this.options.scrollOffset;
        const sectionTop = section.offsetTop - headerHeight;
        
        // Smooth scroll to section
        window.scrollTo({
            top: Math.max(0, sectionTop),
            behavior: 'smooth'
        });
        
        // Update active section immediately
        this.setActiveSection(sectionId);
        
        // Update URL
        if (window.history && window.history.pushState) {
            const newURL = `${window.location.pathname}${window.location.search}#${sectionId}`;
            window.history.pushState({ section: sectionId }, '', newURL);
        }
    }

    /**
     * Set active section
     */
    setActiveSection(sectionId) {
        if (this.currentSection === sectionId) return;
        
        const previousSection = this.currentSection;
        this.currentSection = sectionId;
        
        // Update navigation links
        this.updateActiveLinks(sectionId);
        
        // Dispatch section change event
        this.dispatchEvent('navbar:section-change', {
            current: sectionId,
            previous: previousSection
        });
        
        console.log(`🎯 Active section changed: ${previousSection} → ${sectionId}`);
    }

    /**
     * Update active navigation links
     */
    updateActiveLinks(activeSection) {
        this.links.forEach(link => {
            const linkSection = link.getAttribute('data-section') || 
                               link.getAttribute('href')?.substring(1);
            
            if (linkSection === activeSection) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            } else {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
            }
        });
    }

    /**
     * Update scroll-related styles
     */
    updateScrollState() {
        if (this.header) {
            if (this.isScrolled) {
                this.header.classList.add('scrolled');
            } else {
                this.header.classList.remove('scrolled');
            }
        }
    }

    /**
     * Update mobile-related state
     */
    updateMobileState() {
        if (this.navbar) {
            this.navbar.classList.toggle('mobile', this.isMobile);
        }
        
        // Update ARIA attributes
        if (this.toggle) {
            this.toggle.style.display = this.isMobile ? 'flex' : 'none';
        }
        
        if (this.menu) {
            if (this.isMobile) {
                this.menu.setAttribute('aria-hidden', this.isOpen ? 'false' : 'true');
            } else {
                this.menu.removeAttribute('aria-hidden');
            }
        }
    }

    /**
     * Add button feedback animation
     */
    addButtonFeedback(button) {
        button.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    }

    /**
     * Get focusable elements in navbar
     */
    getFocusableElements() {
        const selectors = [
            'a[href]',
            'button:not([disabled])',
            'input:not([disabled])',
            '[tabindex]:not([tabindex="-1"])'
        ];
        
        return Array.from(this.navbar.querySelectorAll(selectors.join(', ')))
            .filter(el => el.offsetParent !== null); // Only visible elements
    }

    /**
     * Handle section change events
     */
    handleSectionChange(event) {
        const { section } = event.detail;
        if (section) {
            this.setActiveSection(section);
        }
    }

    /**
     * Handle router navigation events
     */
    handleRouterNavigation(event) {
        const { to } = event.detail;
        if (to) {
            this.setActiveSection(to);
        }
    }

    /**
     * Get current state
     */
    getState() {
        return {
            isOpen: this.isOpen,
            isScrolled: this.isScrolled,
            currentSection: this.currentSection,
            isMobile: this.isMobile,
            scrollDirection: this.scrollDirection,
            lastScrollY: this.lastScrollY
        };
    }

    /**
     * Programmatically open/close menu
     */
    setMenuState(isOpen) {
        if (isOpen) {
            this.openMenu();
        } else {
            this.closeMenu();
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
     * Cleanup component
     */
    destroy() {
        // Remove event listeners
        if (this.toggle) {
            this.toggle.removeEventListener('click', this.handleToggleClick);
        }
        
        this.links.forEach(link => {
            link.removeEventListener('click', this.handleLinkClick);
        });
        
        if (this.themeToggle) {
            this.themeToggle.removeEventListener('click', this.handleThemeToggle);
        }
        
        window.removeEventListener('scroll', this.throttledScroll);
        window.removeEventListener('resize', this.throttledResize);
        document.removeEventListener('click', this.handleOutsideClick);
        document.removeEventListener('keydown', this.handleKeydown);
        
        // Disconnect intersection observer
        if (this.sectionObserver) {
            this.sectionObserver.disconnect();
        }
        
        // Reset state
        this.closeMenu();
        document.body.classList.remove('nav-open');
        
        console.log('🧹 Navbar component destroyed');
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NavbarComponent };
}

// Export for ES6 modules
export { NavbarComponent };

/*
===============================================
END NAVBAR.JS
Complete navigation component with:
- Responsive mobile menu
- Smooth section navigation
- Scroll effects and detection
- Active section highlighting
- Accessibility support
- Theme toggle integration
- Event system
- Performance optimization
===============================================
*/