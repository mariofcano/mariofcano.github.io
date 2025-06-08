/*
===============================================
ROUTER.JS - SPA Router System
Ultra-modern client-side routing for Single Page Application
===============================================
*/

/**
 * Router Class
 * Handles client-side routing with hash-based navigation
 */
class Router {
    constructor(options = {}) {
        this.routes = new Map();
        this.currentRoute = null;
        this.previousRoute = null;
        this.isNavigating = false;
        
        // Configuration
        this.config = {
            hashPrefix: '#',
            defaultRoute: 'home',
            scrollOffset: 70, // Header height offset
            animationDuration: 600,
            enableTransitions: true,
            enableAnalytics: false,
            ...options
        };
        
        // Event listeners
        this.listeners = {
            beforeRoute: [],
            afterRoute: [],
            routeError: []
        };
        
        // History management
        this.history = [];
        this.maxHistoryLength = 50;
        
        // Performance tracking
        this.navigationMetrics = new Map();
        
        // Bind methods
        this.handleHashChange = this.handleHashChange.bind(this);
        this.handlePopState = this.handlePopState.bind(this);
        this.handleLinkClick = this.handleLinkClick.bind(this);
    }

    /**
     * Initialize the router
     */
    init() {
        console.log('🧭 Initializing SPA Router...');
        
        try {
            // Setup event listeners
            this.setupEventListeners();
            
            // Setup link interception
            this.setupLinkInterception();
            
            // Load initial route
            this.loadInitialRoute();
            
            console.log('✅ Router initialized successfully');
            
            // Dispatch router ready event
            this.dispatchEvent('router:ready');
            
        } catch (error) {
            console.error('❌ Failed to initialize router:', error);
            this.handleError('initialization', error);
        }
    }

    /**
     * Add a route to the router
     * @param {string} path - Route path
     * @param {Function} handler - Route handler function
     * @param {Object} options - Route options
     */
    addRoute(path, handler, options = {}) {
        if (typeof path !== 'string' || typeof handler !== 'function') {
            throw new Error('Route path must be string and handler must be function');
        }
        
        const route = {
            path: path.toLowerCase(),
            handler,
            title: options.title || this.formatTitle(path),
            meta: options.meta || {},
            beforeEnter: options.beforeEnter || null,
            afterEnter: options.afterEnter || null,
            data: options.data || {},
            cache: options.cache !== false,
            transition: options.transition || 'fade'
        };
        
        this.routes.set(path.toLowerCase(), route);
        
        console.log(`📍 Route added: ${path}`);
        return this;
    }

    /**
     * Remove a route from the router
     * @param {string} path - Route path to remove
     */
    removeRoute(path) {
        const removed = this.routes.delete(path.toLowerCase());
        if (removed) {
            console.log(`🗑️ Route removed: ${path}`);
        }
        return removed;
    }

    /**
     * Navigate to a specific route
     * @param {string} path - Target route path
     * @param {Object} options - Navigation options
     */
    async navigate(path, options = {}) {
        if (this.isNavigating) {
            console.warn('Navigation already in progress, ignoring duplicate request');
            return false;
        }

        const startTime = performance.now();
        this.isNavigating = true;
        
        try {
            const normalizedPath = this.normalizePath(path);
            const route = this.routes.get(normalizedPath);
            
            if (!route) {
                console.warn(`Route not found: ${path}`);
                return this.handleNotFound(path);
            }
            
            // Check if same route
            if (this.currentRoute === normalizedPath && !options.force) {
                console.log('Already on target route, skipping navigation');
                this.isNavigating = false;
                return true;
            }
            
            // Store previous route
            this.previousRoute = this.currentRoute;
            
            // Run beforeRoute listeners
            const beforeResult = await this.runBeforeListeners(normalizedPath, route);
            if (beforeResult === false) {
                this.isNavigating = false;
                return false;
            }
            
            // Run route-specific beforeEnter guard
            if (route.beforeEnter) {
                const guardResult = await this.runGuard(route.beforeEnter, route);
                if (guardResult === false) {
                    this.isNavigating = false;
                    return false;
                }
            }
            
            // Update URL if not from hash change
            if (!options.fromHashChange) {
                this.updateURL(normalizedPath);
            }
            
            // Update current route
            this.currentRoute = normalizedPath;
            
            // Add to history
            this.addToHistory(normalizedPath, route);
            
            // Handle page transition
            if (this.config.enableTransitions && !options.skipTransition) {
                await this.handleTransition(route);
            }
            
            // Execute route handler
            await this.executeRoute(route);
            
            // Update page title and meta
            this.updatePageMeta(route);
            
            // Update navigation state
            this.updateNavigationState(normalizedPath);
            
            // Scroll to section
            if (!options.skipScroll) {
                this.scrollToSection(normalizedPath);
            }
            
            // Run afterRoute listeners
            await this.runAfterListeners(normalizedPath, route);
            
            // Run route-specific afterEnter hook
            if (route.afterEnter) {
                await this.runGuard(route.afterEnter, route);
            }
            
            // Track performance
            const endTime = performance.now();
            this.trackNavigation(normalizedPath, endTime - startTime);
            
            // Analytics
            if (this.config.enableAnalytics) {
                this.trackPageView(normalizedPath, route);
            }
            
            console.log(`🎯 Navigation completed: ${normalizedPath}`);
            
            // Dispatch navigation event
            this.dispatchEvent('router:navigated', {
                from: this.previousRoute,
                to: normalizedPath,
                route: route
            });
            
            return true;
            
        } catch (error) {
            console.error('Navigation error:', error);
            this.handleError('navigation', error, path);
            return false;
        } finally {
            this.isNavigating = false;
        }
    }

    /**
     * Go back in history
     */
    back() {
        if (this.history.length > 1) {
            // Remove current route from history
            this.history.pop();
            // Get previous route
            const previousRoute = this.history[this.history.length - 1];
            if (previousRoute) {
                return this.navigate(previousRoute.path, { skipHistory: true });
            }
        }
        
        // Fallback to browser back
        if (window.history.length > 1) {
            window.history.back();
            return true;
        }
        
        // Fallback to home
        return this.navigate(this.config.defaultRoute);
    }

    /**
     * Go forward in history
     */
    forward() {
        window.history.forward();
        return true;
    }

    /**
     * Replace current route
     * @param {string} path - New route path
     */
    replace(path) {
        return this.navigate(path, { replace: true });
    }

    /**
     * Get current route information
     */
    getCurrentRoute() {
        return {
            path: this.currentRoute,
            route: this.routes.get(this.currentRoute),
            previous: this.previousRoute,
            history: [...this.history]
        };
    }

    /**
     * Check if a route exists
     * @param {string} path - Route path to check
     */
    hasRoute(path) {
        return this.routes.has(this.normalizePath(path));
    }

    /**
     * Get all registered routes
     */
    getRoutes() {
        return Array.from(this.routes.entries()).map(([path, route]) => ({
            path,
            title: route.title,
            meta: route.meta
        }));
    }

    /**
     * Add event listener
     * @param {string} event - Event type (beforeRoute, afterRoute, routeError)
     * @param {Function} callback - Event callback
     */
    on(event, callback) {
        if (this.listeners[event] && typeof callback === 'function') {
            this.listeners[event].push(callback);
        }
        return this;
    }

    /**
     * Remove event listener
     * @param {string} event - Event type
     * @param {Function} callback - Event callback to remove
     */
    off(event, callback) {
        if (this.listeners[event]) {
            const index = this.listeners[event].indexOf(callback);
            if (index > -1) {
                this.listeners[event].splice(index, 1);
            }
        }
        return this;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Hash change event
        window.addEventListener('hashchange', this.handleHashChange);
        
        // Pop state event for browser navigation
        window.addEventListener('popstate', this.handlePopState);
        
        // Page visibility change
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.currentRoute) {
                this.validateCurrentRoute();
            }
        });
    }

    /**
     * Setup link interception for SPA navigation
     */
    setupLinkInterception() {
        document.addEventListener('click', this.handleLinkClick);
    }

    /**
     * Handle link clicks for SPA navigation
     */
    handleLinkClick(event) {
        const link = event.target.closest('a');
        if (!link) return;
        
        const href = link.getAttribute('href');
        if (!href) return;
        
        // Check if it's a hash link (internal navigation)
        if (href.startsWith('#')) {
            event.preventDefault();
            const path = href.substring(1);
            if (path && this.hasRoute(path)) {
                this.navigate(path);
            }
            return;
        }
        
        // Check if it's an internal link
        if (this.isInternalLink(href)) {
            // Extract route from internal link
            const route = this.extractRouteFromURL(href);
            if (route && this.hasRoute(route)) {
                event.preventDefault();
                this.navigate(route);
            }
        }
    }

    /**
     * Handle hash change events
     */
    handleHashChange(event) {
        const hash = window.location.hash;
        const path = hash ? hash.substring(1) : this.config.defaultRoute;
        
        if (path !== this.currentRoute) {
            this.navigate(path, { fromHashChange: true });
        }
    }

    /**
     * Handle pop state events
     */
    handlePopState(event) {
        const path = this.getPathFromURL();
        if (path !== this.currentRoute) {
            this.navigate(path, { fromPopState: true });
        }
    }

    /**
     * Load initial route
     */
    loadInitialRoute() {
        const initialPath = this.getPathFromURL() || this.config.defaultRoute;
        this.navigate(initialPath, { initial: true });
    }

    /**
     * Execute route handler
     */
    async executeRoute(route) {
        try {
            await route.handler(route);
        } catch (error) {
            console.error('Route handler error:', error);
            this.handleError('handler', error, route.path);
        }
    }

    /**
     * Handle page transitions
     */
    async handleTransition(route) {
        const transitionType = route.transition || 'fade';
        const duration = this.config.animationDuration;
        
        // Add transition class to body
        document.body.classList.add(`transition-${transitionType}`);
        
        // Wait for transition
        await this.delay(50);
        
        // Remove transition class
        setTimeout(() => {
            document.body.classList.remove(`transition-${transitionType}`);
        }, duration);
    }

    /**
     * Update page title and meta tags
     */
    updatePageMeta(route) {
        // Update title
        if (route.title) {
            document.title = route.title;
        }
        
        // Update meta tags
        if (route.meta) {
            Object.keys(route.meta).forEach(key => {
                const metaTag = document.querySelector(`meta[name="${key}"]`);
                if (metaTag) {
                    metaTag.setAttribute('content', route.meta[key]);
                }
            });
        }
        
        // Update canonical URL
        const canonicalLink = document.querySelector('link[rel="canonical"]');
        if (canonicalLink) {
            const baseURL = window.location.origin + window.location.pathname;
            canonicalLink.setAttribute('href', `${baseURL}#${route.path}`);
        }
    }

    /**
     * Update navigation state
     */
    updateNavigationState(path) {
        // Update active navigation links
        const navLinks = document.querySelectorAll('.nav-link, [data-route]');
        navLinks.forEach(link => {
            link.classList.remove('active');
            
            const linkRoute = link.getAttribute('data-section') || 
                             link.getAttribute('data-route') ||
                             link.getAttribute('href')?.substring(1);
            
            if (linkRoute === path) {
                link.classList.add('active');
            }
        });
    }

    /**
     * Scroll to section
     */
    scrollToSection(path) {
        const section = document.getElementById(path);
        if (section) {
            const offset = this.config.scrollOffset;
            const elementPosition = section.offsetTop - offset;
            
            window.scrollTo({
                top: Math.max(0, elementPosition),
                behavior: 'smooth'
            });
        }
    }

    /**
     * Update URL without triggering navigation
     */
    updateURL(path) {
        const newURL = `${window.location.pathname}${window.location.search}#${path}`;
        
        if (window.location.href !== newURL) {
            window.history.pushState({ route: path }, '', newURL);
        }
    }

    /**
     * Add route to history
     */
    addToHistory(path, route) {
        // Prevent duplicates
        if (this.history.length > 0 && this.history[this.history.length - 1].path === path) {
            return;
        }
        
        this.history.push({
            path,
            route: route.title,
            timestamp: Date.now()
        });
        
        // Limit history size
        if (this.history.length > this.maxHistoryLength) {
            this.history.shift();
        }
    }

    /**
     * Run before route listeners
     */
    async runBeforeListeners(path, route) {
        for (const listener of this.listeners.beforeRoute) {
            try {
                const result = await listener(path, route, this.currentRoute);
                if (result === false) {
                    return false;
                }
            } catch (error) {
                console.error('Before route listener error:', error);
            }
        }
        return true;
    }

    /**
     * Run after route listeners
     */
    async runAfterListeners(path, route) {
        for (const listener of this.listeners.afterRoute) {
            try {
                await listener(path, route, this.previousRoute);
            } catch (error) {
                console.error('After route listener error:', error);
            }
        }
    }

    /**
     * Run route guard
     */
    async runGuard(guard, route) {
        try {
            return await guard(route, this);
        } catch (error) {
            console.error('Route guard error:', error);
            return false;
        }
    }

    /**
     * Handle not found routes
     */
    handleNotFound(path) {
        console.warn(`Route not found: ${path}, redirecting to default`);
        
        // Try to find similar route
        const similarRoute = this.findSimilarRoute(path);
        if (similarRoute) {
            console.log(`Found similar route: ${similarRoute}, redirecting...`);
            return this.navigate(similarRoute);
        }
        
        // Fallback to default route
        return this.navigate(this.config.defaultRoute);
    }

    /**
     * Find similar route using fuzzy matching
     */
    findSimilarRoute(path) {
        const routes = Array.from(this.routes.keys());
        let bestMatch = null;
        let bestScore = 0;
        
        routes.forEach(route => {
            const score = this.calculateSimilarity(path, route);
            if (score > bestScore && score > 0.6) {
                bestScore = score;
                bestMatch = route;
            }
        });
        
        return bestMatch;
    }

    /**
     * Calculate similarity between two strings
     */
    calculateSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1.0;
        
        const editDistance = this.calculateEditDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }

    /**
     * Calculate edit distance between strings
     */
    calculateEditDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    /**
     * Validate current route
     */
    validateCurrentRoute() {
        const currentPath = this.getPathFromURL();
        if (currentPath !== this.currentRoute) {
            this.navigate(currentPath || this.config.defaultRoute);
        }
    }

    /**
     * Track navigation performance
     */
    trackNavigation(path, duration) {
        this.navigationMetrics.set(path, {
            duration,
            timestamp: Date.now(),
            count: (this.navigationMetrics.get(path)?.count || 0) + 1
        });
        
        console.log(`📊 Navigation to ${path}: ${duration.toFixed(2)}ms`);
    }

    /**
     * Track page view for analytics
     */
    trackPageView(path, route) {
        // Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('config', 'GA_MEASUREMENT_ID', {
                page_title: route.title,
                page_location: window.location.href
            });
        }
        
        // Custom analytics
        this.dispatchEvent('router:pageview', {
            path,
            title: route.title,
            url: window.location.href
        });
    }

    /**
     * Handle routing errors
     */
    handleError(type, error, context = null) {
        const errorData = {
            type,
            error,
            context,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        // Run error listeners
        this.listeners.routeError.forEach(listener => {
            try {
                listener(errorData);
            } catch (err) {
                console.error('Error listener failed:', err);
            }
        });
        
        // Dispatch error event
        this.dispatchEvent('router:error', errorData);
    }

    /**
     * Utility methods
     */
    normalizePath(path) {
        return path ? path.toLowerCase().trim() : this.config.defaultRoute;
    }

    formatTitle(path) {
        return path.charAt(0).toUpperCase() + path.slice(1).replace(/[-_]/g, ' ');
    }

    getPathFromURL() {
        const hash = window.location.hash;
        return hash ? hash.substring(1) : null;
    }

    isInternalLink(href) {
        try {
            const url = new URL(href, window.location.origin);
            return url.origin === window.location.origin;
        } catch {
            return false;
        }
    }

    extractRouteFromURL(href) {
        try {
            const url = new URL(href, window.location.origin);
            return url.hash ? url.hash.substring(1) : null;
        } catch {
            return null;
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
    }

    /**
     * Get router statistics
     */
    getStats() {
        return {
            totalRoutes: this.routes.size,
            currentRoute: this.currentRoute,
            historyLength: this.history.length,
            navigationMetrics: Object.fromEntries(this.navigationMetrics),
            routeList: this.getRoutes()
        };
    }

    /**
     * Clear router history
     */
    clearHistory() {
        this.history = [];
        this.navigationMetrics.clear();
    }

    /**
     * Cleanup router resources
     */
    cleanup() {
        // Remove event listeners
        window.removeEventListener('hashchange', this.handleHashChange);
        window.removeEventListener('popstate', this.handlePopState);
        document.removeEventListener('click', this.handleLinkClick);
        
        // Clear data
        this.routes.clear();
        this.history = [];
        this.navigationMetrics.clear();
        
        // Clear listeners
        Object.keys(this.listeners).forEach(key => {
            this.listeners[key] = [];
        });
        
        console.log('🧹 Router cleanup completed');
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Router };
}

// Export for ES6 modules
export { Router };

/*
===============================================
END ROUTER.JS
Complete SPA routing system with:
- Hash-based navigation
- Route guards and hooks  
- History management
- Error handling
- Performance tracking
- Analytics integration
- Fuzzy route matching
- Transition effects
- SEO-friendly URLs
===============================================
*/