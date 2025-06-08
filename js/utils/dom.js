/*
===============================================
DOM.JS - DOM Utilities & Helpers
Ultra-complete DOM manipulation and utility functions
===============================================
*/

/**
 * DOM Utilities Class
 * Collection of useful DOM manipulation and utility functions
 */
class DOMUtils {
    constructor() {
        // Performance tracking
        this.performanceMarks = new Map();
        
        // Element cache for better performance
        this.elementCache = new Map();
        
        // Intersection observers cache
        this.observers = new Map();
        
        // Animation frame tracking
        this.animationFrames = new Set();
        
        // Mutation observer for dynamic content
        this.mutationObserver = null;
        
        // Device detection cache
        this.deviceInfo = this.getDeviceInfo();
        
        // Initialize utilities
        this.init();
    }

    /**
     * Initialize DOM utilities
     */
    init() {
        // Setup mutation observer for dynamic content
        this.setupMutationObserver();
        
        // Add CSS helper classes
        this.addHelperClasses();
        
        // Setup performance monitoring
        this.setupPerformanceMonitoring();
        
        console.log('🛠️ DOM Utilities initialized');
    }

    /**
     * Setup mutation observer for dynamic content
     */
    setupMutationObserver() {
        if (!window.MutationObserver) return;
        
        this.mutationObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    // Clear element cache for modified nodes
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.clearElementCache(node);
                        }
                    });
                }
            });
        });
        
        this.mutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Add helper CSS classes to document
     */
    addHelperClasses() {
        document.documentElement.classList.add(
            `is-${this.deviceInfo.type}`,
            `is-${this.deviceInfo.os}`,
            `is-${this.deviceInfo.browser}`
        );
        
        if (this.deviceInfo.isRetina) {
            document.documentElement.classList.add('is-retina');
        }
        
        if (this.deviceInfo.isTouch) {
            document.documentElement.classList.add('is-touch');
        }
    }

    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        if (typeof performance !== 'undefined' && performance.mark) {
            this.mark('dom-utils-init');
        }
    }

    // ==========================================
    // ELEMENT SELECTION & MANIPULATION
    // ==========================================

    /**
     * Enhanced querySelector with caching
     * @param {string} selector - CSS selector
     * @param {Element} context - Context element (default: document)
     * @param {boolean} useCache - Whether to use cache (default: true)
     * @returns {Element|null}
     */
    $(selector, context = document, useCache = true) {
        const cacheKey = `${selector}-${context.nodeType}`;
        
        if (useCache && this.elementCache.has(cacheKey)) {
            return this.elementCache.get(cacheKey);
        }
        
        const element = context.querySelector(selector);
        
        if (useCache && element) {
            this.elementCache.set(cacheKey, element);
        }
        
        return element;
    }

    /**
     * Enhanced querySelectorAll with array conversion
     * @param {string} selector - CSS selector
     * @param {Element} context - Context element (default: document)
     * @returns {Array}
     */
    $$(selector, context = document) {
        return Array.from(context.querySelectorAll(selector));
    }

    /**
     * Get element by ID with caching
     * @param {string} id - Element ID
     * @param {boolean} useCache - Whether to use cache
     * @returns {Element|null}
     */
    getElementById(id, useCache = true) {
        const cacheKey = `id-${id}`;
        
        if (useCache && this.elementCache.has(cacheKey)) {
            return this.elementCache.get(cacheKey);
        }
        
        const element = document.getElementById(id);
        
        if (useCache && element) {
            this.elementCache.set(cacheKey, element);
        }
        
        return element;
    }

    /**
     * Create element with attributes and content
     * @param {string} tagName - Tag name
     * @param {Object} attributes - Element attributes
     * @param {string|Node|Array} content - Element content
     * @returns {Element}
     */
    createElement(tagName, attributes = {}, content = '') {
        const element = document.createElement(tagName);
        
        // Set attributes
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className' || key === 'class') {
                element.className = value;
            } else if (key === 'style' && typeof value === 'object') {
                Object.assign(element.style, value);
            } else if (key === 'dataset' && typeof value === 'object') {
                Object.entries(value).forEach(([dataKey, dataValue]) => {
                    element.dataset[dataKey] = dataValue;
                });
            } else if (key.startsWith('on') && typeof value === 'function') {
                element.addEventListener(key.slice(2).toLowerCase(), value);
            } else {
                element.setAttribute(key, value);
            }
        });
        
        // Set content
        if (content) {
            if (typeof content === 'string') {
                element.textContent = content;
            } else if (content instanceof Node) {
                element.appendChild(content);
            } else if (Array.isArray(content)) {
                content.forEach(child => {
                    if (typeof child === 'string') {
                        element.appendChild(document.createTextNode(child));
                    } else if (child instanceof Node) {
                        element.appendChild(child);
                    }
                });
            }
        }
        
        return element;
    }

    /**
     * Remove element safely
     * @param {Element|string} element - Element or selector
     */
    removeElement(element) {
        const el = typeof element === 'string' ? this.$(element) : element;
        if (el && el.parentNode) {
            el.parentNode.removeChild(el);
            this.clearElementCache(el);
        }
    }

    /**
     * Clear element from cache
     * @param {Element} element - Element to clear
     */
    clearElementCache(element) {
        const keysToDelete = [];
        this.elementCache.forEach((value, key) => {
            if (value === element || (element.contains && element.contains(value))) {
                keysToDelete.push(key);
            }
        });
        keysToDelete.forEach(key => this.elementCache.delete(key));
    }

    // ==========================================
    // CSS CLASS MANIPULATION
    // ==========================================

    /**
     * Add class with animation support
     * @param {Element|string} element - Element or selector
     * @param {string|Array} classes - Class name(s) to add
     * @param {number} delay - Animation delay in ms
     */
    addClass(element, classes, delay = 0) {
        const el = typeof element === 'string' ? this.$(element) : element;
        if (!el) return;
        
        const classArray = Array.isArray(classes) ? classes : [classes];
        
        if (delay > 0) {
            setTimeout(() => {
                classArray.forEach(className => el.classList.add(className));
            }, delay);
        } else {
            classArray.forEach(className => el.classList.add(className));
        }
    }

    /**
     * Remove class with animation support
     * @param {Element|string} element - Element or selector
     * @param {string|Array} classes - Class name(s) to remove
     * @param {number} delay - Animation delay in ms
     */
    removeClass(element, classes, delay = 0) {
        const el = typeof element === 'string' ? this.$(element) : element;
        if (!el) return;
        
        const classArray = Array.isArray(classes) ? classes : [classes];
        
        if (delay > 0) {
            setTimeout(() => {
                classArray.forEach(className => el.classList.remove(className));
            }, delay);
        } else {
            classArray.forEach(className => el.classList.remove(className));
        }
    }

    /**
     * Toggle class with callback
     * @param {Element|string} element - Element or selector
     * @param {string} className - Class name to toggle
     * @param {Function} callback - Callback function
     * @returns {boolean} - New class state
     */
    toggleClass(element, className, callback) {
        const el = typeof element === 'string' ? this.$(element) : element;
        if (!el) return false;
        
        const newState = el.classList.toggle(className);
        
        if (typeof callback === 'function') {
            callback(newState, el);
        }
        
        return newState;
    }

    /**
     * Check if element has class
     * @param {Element|string} element - Element or selector
     * @param {string} className - Class name to check
     * @returns {boolean}
     */
    hasClass(element, className) {
        const el = typeof element === 'string' ? this.$(element) : element;
        return el ? el.classList.contains(className) : false;
    }

    // ==========================================
    // ELEMENT PROPERTIES & ATTRIBUTES
    // ==========================================

    /**
     * Get/Set element attributes
     * @param {Element|string} element - Element or selector
     * @param {string|Object} attr - Attribute name or object of attributes
     * @param {*} value - Attribute value (if setting single attribute)
     * @returns {*} - Attribute value or element
     */
    attr(element, attr, value) {
        const el = typeof element === 'string' ? this.$(element) : element;
        if (!el) return null;
        
        if (typeof attr === 'object') {
            // Set multiple attributes
            Object.entries(attr).forEach(([key, val]) => {
                el.setAttribute(key, val);
            });
            return el;
        } else if (value !== undefined) {
            // Set single attribute
            el.setAttribute(attr, value);
            return el;
        } else {
            // Get attribute
            return el.getAttribute(attr);
        }
    }

    /**
     * Remove attributes
     * @param {Element|string} element - Element or selector
     * @param {string|Array} attributes - Attribute name(s) to remove
     */
    removeAttr(element, attributes) {
        const el = typeof element === 'string' ? this.$(element) : element;
        if (!el) return;
        
        const attrArray = Array.isArray(attributes) ? attributes : [attributes];
        attrArray.forEach(attr => el.removeAttribute(attr));
    }

    /**
     * Get/Set element data attributes
     * @param {Element|string} element - Element or selector
     * @param {string|Object} key - Data key or object of data
     * @param {*} value - Data value (if setting single data)
     * @returns {*} - Data value or element
     */
    data(element, key, value) {
        const el = typeof element === 'string' ? this.$(element) : element;
        if (!el) return null;
        
        if (typeof key === 'object') {
            // Set multiple data attributes
            Object.entries(key).forEach(([k, v]) => {
                el.dataset[k] = v;
            });
            return el;
        } else if (value !== undefined) {
            // Set single data attribute
            el.dataset[key] = value;
            return el;
        } else {
            // Get data attribute
            return el.dataset[key];
        }
    }

    /**
     * Get/Set element styles
     * @param {Element|string} element - Element or selector
     * @param {string|Object} property - Style property or object of styles
     * @param {string} value - Style value (if setting single style)
     * @returns {*} - Style value or element
     */
    css(element, property, value) {
        const el = typeof element === 'string' ? this.$(element) : element;
        if (!el) return null;
        
        if (typeof property === 'object') {
            // Set multiple styles
            Object.entries(property).forEach(([prop, val]) => {
                el.style[prop] = val;
            });
            return el;
        } else if (value !== undefined) {
            // Set single style
            el.style[property] = value;
            return el;
        } else {
            // Get computed style
            return window.getComputedStyle(el).getPropertyValue(property);
        }
    }

    // ==========================================
    // ELEMENT DIMENSIONS & POSITION
    // ==========================================

    /**
     * Get element dimensions
     * @param {Element|string} element - Element or selector
     * @returns {Object} - Dimensions object
     */
    getDimensions(element) {
        const el = typeof element === 'string' ? this.$(element) : element;
        if (!el) return null;
        
        const rect = el.getBoundingClientRect();
        const computed = window.getComputedStyle(el);
        
        return {
            width: rect.width,
            height: rect.height,
            outerWidth: el.offsetWidth,
            outerHeight: el.offsetHeight,
            innerWidth: el.clientWidth,
            innerHeight: el.clientHeight,
            scrollWidth: el.scrollWidth,
            scrollHeight: el.scrollHeight,
            padding: {
                top: parseFloat(computed.paddingTop),
                right: parseFloat(computed.paddingRight),
                bottom: parseFloat(computed.paddingBottom),
                left: parseFloat(computed.paddingLeft)
            },
            margin: {
                top: parseFloat(computed.marginTop),
                right: parseFloat(computed.marginRight),
                bottom: parseFloat(computed.marginBottom),
                left: parseFloat(computed.marginLeft)
            },
            border: {
                top: parseFloat(computed.borderTopWidth),
                right: parseFloat(computed.borderRightWidth),
                bottom: parseFloat(computed.borderBottomWidth),
                left: parseFloat(computed.borderLeftWidth)
            }
        };
    }

    /**
     * Get element position
     * @param {Element|string} element - Element or selector
     * @param {boolean} relative - Get position relative to offset parent
     * @returns {Object} - Position object
     */
    getPosition(element, relative = false) {
        const el = typeof element === 'string' ? this.$(element) : element;
        if (!el) return null;
        
        if (relative) {
            return {
                top: el.offsetTop,
                left: el.offsetLeft,
                right: el.offsetLeft + el.offsetWidth,
                bottom: el.offsetTop + el.offsetHeight
            };
        } else {
            const rect = el.getBoundingClientRect();
            return {
                top: rect.top + window.pageYOffset,
                left: rect.left + window.pageXOffset,
                right: rect.right + window.pageXOffset,
                bottom: rect.bottom + window.pageYOffset,
                x: rect.x + window.pageXOffset,
                y: rect.y + window.pageYOffset
            };
        }
    }

    /**
     * Get viewport dimensions
     * @returns {Object} - Viewport dimensions
     */
    getViewport() {
        return {
            width: window.innerWidth || document.documentElement.clientWidth,
            height: window.innerHeight || document.documentElement.clientHeight,
            scrollTop: window.pageYOffset || document.documentElement.scrollTop,
            scrollLeft: window.pageXOffset || document.documentElement.scrollLeft
        };
    }

    /**
     * Check if element is in viewport
     * @param {Element|string} element - Element or selector
     * @param {number} threshold - Threshold percentage (0-1)
     * @returns {boolean}
     */
    isInViewport(element, threshold = 0) {
        const el = typeof element === 'string' ? this.$(element) : element;
        if (!el) return false;
        
        const rect = el.getBoundingClientRect();
        const viewport = this.getViewport();
        
        const elementArea = rect.width * rect.height;
        const visibleArea = Math.max(0, Math.min(rect.right, viewport.width) - Math.max(rect.left, 0)) *
                           Math.max(0, Math.min(rect.bottom, viewport.height) - Math.max(rect.top, 0));
        
        return (visibleArea / elementArea) >= threshold;
    }

    // ==========================================
    // EVENT HANDLING
    // ==========================================

    /**
     * Add event listener with options
     * @param {Element|string} element - Element or selector
     * @param {string} events - Event name(s) (space-separated)
     * @param {Function} handler - Event handler
     * @param {Object} options - Event options
     */
    on(element, events, handler, options = {}) {
        const el = typeof element === 'string' ? this.$(element) : element;
        if (!el) return;
        
        const eventArray = events.split(' ');
        eventArray.forEach(event => {
            el.addEventListener(event, handler, options);
        });
    }

    /**
     * Remove event listener
     * @param {Element|string} element - Element or selector
     * @param {string} events - Event name(s) (space-separated)
     * @param {Function} handler - Event handler
     */
    off(element, events, handler) {
        const el = typeof element === 'string' ? this.$(element) : element;
        if (!el) return;
        
        const eventArray = events.split(' ');
        eventArray.forEach(event => {
            el.removeEventListener(event, handler);
        });
    }

    /**
     * Add one-time event listener
     * @param {Element|string} element - Element or selector
     * @param {string} event - Event name
     * @param {Function} handler - Event handler
     * @param {Object} options - Event options
     */
    once(element, event, handler, options = {}) {
        const el = typeof element === 'string' ? this.$(element) : element;
        if (!el) return;
        
        el.addEventListener(event, handler, { ...options, once: true });
    }

    /**
     * Trigger custom event
     * @param {Element|string} element - Element or selector
     * @param {string} eventName - Event name
     * @param {*} detail - Event detail data
     * @param {Object} options - Event options
     */
    trigger(element, eventName, detail = null, options = {}) {
        const el = typeof element === 'string' ? this.$(element) : element;
        if (!el) return;
        
        const event = new CustomEvent(eventName, {
            detail,
            bubbles: true,
            cancelable: true,
            ...options
        });
        
        el.dispatchEvent(event);
    }

    /**
     * Delegate event handling
     * @param {Element|string} parent - Parent element or selector
     * @param {string} childSelector - Child selector
     * @param {string} event - Event name
     * @param {Function} handler - Event handler
     */
    delegate(parent, childSelector, event, handler) {
        const parentEl = typeof parent === 'string' ? this.$(parent) : parent;
        if (!parentEl) return;
        
        parentEl.addEventListener(event, (e) => {
            const target = e.target.closest(childSelector);
            if (target && parentEl.contains(target)) {
                handler.call(target, e);
            }
        });
    }

    // ==========================================
    // ANIMATION UTILITIES
    // ==========================================

    /**
     * Animate element with requestAnimationFrame
     * @param {Element|string} element - Element or selector
     * @param {Object} properties - CSS properties to animate
     * @param {Object} options - Animation options
     * @returns {Promise}
     */
    animate(element, properties, options = {}) {
        const el = typeof element === 'string' ? this.$(element) : element;
        if (!el) return Promise.resolve();
        
        const {
            duration = 300,
            easing = 'ease-out',
            delay = 0,
            fill = 'forwards'
        } = options;
        
        return new Promise((resolve) => {
            // Apply CSS transition
            el.style.transition = `all ${duration}ms ${easing}`;
            
            const applyAnimation = () => {
                Object.entries(properties).forEach(([prop, value]) => {
                    el.style[prop] = value;
                });
                
                setTimeout(() => {
                    if (fill === 'none') {
                        el.style.transition = '';
                        Object.keys(properties).forEach(prop => {
                            el.style[prop] = '';
                        });
                    } else {
                        el.style.transition = '';
                    }
                    resolve(el);
                }, duration);
            };
            
            if (delay > 0) {
                setTimeout(applyAnimation, delay);
            } else {
                applyAnimation();
            }
        });
    }

    /**
     * Fade in element
     * @param {Element|string} element - Element or selector
     * @param {number} duration - Animation duration in ms
     * @returns {Promise}
     */
    fadeIn(element, duration = 300) {
        const el = typeof element === 'string' ? this.$(element) : element;
        if (!el) return Promise.resolve();
        
        el.style.opacity = '0';
        el.style.display = 'block';
        
        return this.animate(el, { opacity: '1' }, { duration });
    }

    /**
     * Fade out element
     * @param {Element|string} element - Element or selector
     * @param {number} duration - Animation duration in ms
     * @returns {Promise}
     */
    fadeOut(element, duration = 300) {
        const el = typeof element === 'string' ? this.$(element) : element;
        if (!el) return Promise.resolve();
        
        return this.animate(el, { opacity: '0' }, { duration })
            .then(() => {
                el.style.display = 'none';
                return el;
            });
    }

    /**
     * Slide down element
     * @param {Element|string} element - Element or selector
     * @param {number} duration - Animation duration in ms
     * @returns {Promise}
     */
    slideDown(element, duration = 300) {
        const el = typeof element === 'string' ? this.$(element) : element;
        if (!el) return Promise.resolve();
        
        const originalHeight = el.scrollHeight;
        el.style.height = '0';
        el.style.overflow = 'hidden';
        el.style.display = 'block';
        
        return this.animate(el, { height: `${originalHeight}px` }, { duration })
            .then(() => {
                el.style.height = '';
                el.style.overflow = '';
                return el;
            });
    }

    /**
     * Slide up element
     * @param {Element|string} element - Element or selector
     * @param {number} duration - Animation duration in ms
     * @returns {Promise}
     */
    slideUp(element, duration = 300) {
        const el = typeof element === 'string' ? this.$(element) : element;
        if (!el) return Promise.resolve();
        
        el.style.overflow = 'hidden';
        
        return this.animate(el, { height: '0' }, { duration })
            .then(() => {
                el.style.display = 'none';
                el.style.height = '';
                el.style.overflow = '';
                return el;
            });
    }

    // ==========================================
    // SCROLL UTILITIES
    // ==========================================

    /**
     * Smooth scroll to element
     * @param {Element|string} element - Element or selector
     * @param {Object} options - Scroll options
     */
    scrollTo(element, options = {}) {
        const el = typeof element === 'string' ? this.$(element) : element;
        if (!el) return;
        
        const {
            behavior = 'smooth',
            block = 'start',
            inline = 'nearest',
            offset = 0
        } = options;
        
        if (offset !== 0) {
            const elementPosition = this.getPosition(el);
            window.scrollTo({
                top: elementPosition.top + offset,
                behavior
            });
        } else {
            el.scrollIntoView({ behavior, block, inline });
        }
    }

    /**
     * Get scroll position
     * @param {Element} element - Element (default: window)
     * @returns {Object} - Scroll position
     */
    getScrollPosition(element = window) {
        if (element === window) {
            return {
                x: window.pageXOffset || document.documentElement.scrollLeft,
                y: window.pageYOffset || document.documentElement.scrollTop
            };
        } else {
            return {
                x: element.scrollLeft,
                y: element.scrollTop
            };
        }
    }

    /**
     * Set scroll position
     * @param {Element} element - Element (default: window)
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} behavior - Scroll behavior
     */
    setScrollPosition(element = window, x = 0, y = 0, behavior = 'smooth') {
        if (element === window) {
            window.scrollTo({ left: x, top: y, behavior });
        } else {
            element.scrollTo({ left: x, top: y, behavior });
        }
    }

    // ==========================================
    // DEVICE & BROWSER DETECTION
    // ==========================================

    /**
     * Get device information
     * @returns {Object} - Device info
     */
    getDeviceInfo() {
        const userAgent = navigator.userAgent.toLowerCase();
        const platform = navigator.platform.toLowerCase();
        
        // Device type detection
        const isMobile = /iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent);
        const isTablet = /ipad|android|tablet|kindle|playbook|silk/i.test(userAgent);
        const isDesktop = !isMobile && !isTablet;
        
        // OS detection
        let os = 'unknown';
        if (/windows/.test(userAgent)) os = 'windows';
        else if (/macintosh|mac os x/.test(userAgent)) os = 'macos';
        else if (/linux/.test(userAgent)) os = 'linux';
        else if (/android/.test(userAgent)) os = 'android';
        else if (/iphone|ipad|ipod/.test(userAgent)) os = 'ios';
        
        // Browser detection
        let browser = 'unknown';
        if (/chrome/.test(userAgent) && !/edge/.test(userAgent)) browser = 'chrome';
        else if (/firefox/.test(userAgent)) browser = 'firefox';
        else if (/safari/.test(userAgent) && !/chrome/.test(userAgent)) browser = 'safari';
        else if (/edge/.test(userAgent)) browser = 'edge';
        else if (/msie|trident/.test(userAgent)) browser = 'ie';
        
        // Feature detection
        const isRetina = window.devicePixelRatio > 1;
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const isOnline = navigator.onLine;
        
        return {
            type: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
            isMobile,
            isTablet,
            isDesktop,
            os,
            browser,
            isRetina,
            isTouch,
            isOnline,
            userAgent,
            platform,
            screen: {
                width: screen.width,
                height: screen.height,
                availWidth: screen.availWidth,
                availHeight: screen.availHeight,
                pixelRatio: window.devicePixelRatio || 1
            },
            viewport: this.getViewport()
        };
    }

    /**
     * Check if browser supports feature
     * @param {string} feature - Feature to check
     * @returns {boolean}
     */
    supportsFeature(feature) {
        const features = {
            localStorage: () => {
                try {
                    const test = '__test__';
                    localStorage.setItem(test, test);
                    localStorage.removeItem(test);
                    return true;
                } catch {
                    return false;
                }
            },
            sessionStorage: () => {
                try {
                    const test = '__test__';
                    sessionStorage.setItem(test, test);
                    sessionStorage.removeItem(test);
                    return true;
                } catch {
                    return false;
                }
            },
            webgl: () => {
                try {
                    const canvas = document.createElement('canvas');
                    return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
                } catch {
                    return false;
                }
            },
            webgl2: () => {
                try {
                    const canvas = document.createElement('canvas');
                    return !!canvas.getContext('webgl2');
                } catch {
                    return false;
                }
            },
            webrtc: () => !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia),
            geolocation: () => !!navigator.geolocation,
            notifications: () => 'Notification' in window,
            serviceWorker: () => 'serviceWorker' in navigator,
            intersectionObserver: () => 'IntersectionObserver' in window,
            mutationObserver: () => 'MutationObserver' in window,
            resizeObserver: () => 'ResizeObserver' in window,
            requestAnimationFrame: () => 'requestAnimationFrame' in window,
            webWorkers: () => 'Worker' in window,
            webAssembly: () => 'WebAssembly' in window,
            fetch: () => 'fetch' in window,
            promises: () => 'Promise' in window,
            proxy: () => 'Proxy' in window,
            es6Classes: () => {
                try {
                    new Function('class Test {}');
                    return true;
                } catch {
                    return false;
                }
            },
            asyncAwait: () => {
                try {
                    new Function('async function test() { await Promise.resolve(); }');
                    return true;
                } catch {
                    return false;
                }
            },
            modules: () => {
                try {
                    new Function('import("")');
                    return true;
                } catch {
                    return false;
                }
            },
            customElements: () => 'customElements' in window,
            shadowDOM: () => 'attachShadow' in Element.prototype,
            css: {
                grid: () => CSS.supports('display', 'grid'),
                flexbox: () => CSS.supports('display', 'flex'),
                customProperties: () => CSS.supports('color', 'var(--test)'),
                backdrop: () => CSS.supports('backdrop-filter', 'blur(1px)'),
                objectFit: () => CSS.supports('object-fit', 'cover'),
                clipPath: () => CSS.supports('clip-path', 'circle(50%)'),
                transforms3d: () => CSS.supports('transform', 'translateZ(0)'),
                filters: () => CSS.supports('filter', 'blur(1px)')
            }
        };
        
        if (feature.includes('.')) {
            const [category, subFeature] = feature.split('.');
            return features[category] && typeof features[category][subFeature] === 'function' 
                ? features[category][subFeature]() 
                : false;
        }
        
        return typeof features[feature] === 'function' ? features[feature]() : false;
    }

    // ==========================================
    // PERFORMANCE UTILITIES
    // ==========================================

    /**
     * Mark performance point
     * @param {string} name - Mark name
     */
    mark(name) {
        if (typeof performance !== 'undefined' && performance.mark) {
            performance.mark(name);
            this.performanceMarks.set(name, performance.now());
        }
    }

    /**
     * Measure performance between marks
     * @param {string} name - Measure name
     * @param {string} startMark - Start mark name
     * @param {string} endMark - End mark name (optional)
     * @returns {number} - Duration in milliseconds
     */
    measure(name, startMark, endMark) {
        if (typeof performance !== 'undefined' && performance.measure) {
            if (endMark) {
                performance.measure(name, startMark, endMark);
            } else {
                performance.measure(name, startMark);
            }
            
            const measure = performance.getEntriesByName(name, 'measure')[0];
            return measure ? measure.duration : 0;
        }
        
        // Fallback calculation
        const startTime = this.performanceMarks.get(startMark);
        const endTime = endMark ? this.performanceMarks.get(endMark) : performance.now();
        
        return endTime && startTime ? endTime - startTime : 0;
    }

    /**
     * Throttle function execution
     * @param {Function} func - Function to throttle
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} - Throttled function
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
     * Debounce function execution
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @param {boolean} immediate - Execute immediately on first call
     * @returns {Function} - Debounced function
     */
    debounce(func, wait, immediate = false) {
        let timeout;
        
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func.apply(this, args);
            };
            
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            
            if (callNow) func.apply(this, args);
        };
    }

    /**
     * Request animation frame with fallback
     * @param {Function} callback - Animation callback
     * @returns {number} - Frame ID
     */
    requestFrame(callback) {
        const frameId = (window.requestAnimationFrame || 
                        window.webkitRequestAnimationFrame || 
                        window.mozRequestAnimationFrame || 
                        window.oRequestAnimationFrame || 
                        window.msRequestAnimationFrame ||
                        function(cb) { return setTimeout(cb, 1000 / 60); })(callback);
        
        this.animationFrames.add(frameId);
        return frameId;
    }

    /**
     * Cancel animation frame
     * @param {number} frameId - Frame ID to cancel
     */
    cancelFrame(frameId) {
        (window.cancelAnimationFrame || 
         window.webkitCancelAnimationFrame || 
         window.mozCancelAnimationFrame || 
         window.oCancelAnimationFrame || 
         window.msCancelAnimationFrame ||
         clearTimeout)(frameId);
        
        this.animationFrames.delete(frameId);
    }

    // ==========================================
    // INTERSECTION OBSERVER UTILITIES
    // ==========================================

    /**
     * Create intersection observer
     * @param {Function} callback - Observer callback
     * @param {Object} options - Observer options
     * @returns {IntersectionObserver}
     */
    createIntersectionObserver(callback, options = {}) {
        const defaultOptions = {
            threshold: 0.1,
            rootMargin: '0px'
        };
        
        const observerOptions = { ...defaultOptions, ...options };
        const observer = new IntersectionObserver(callback, observerOptions);
        
        // Store observer for cleanup
        const observerId = Date.now() + Math.random();
        this.observers.set(observerId, observer);
        
        return observer;
    }

    /**
     * Observe element visibility
     * @param {Element|string} element - Element or selector
     * @param {Function} callback - Visibility callback
     * @param {Object} options - Observer options
     * @returns {IntersectionObserver}
     */
    observeVisibility(element, callback, options = {}) {
        const el = typeof element === 'string' ? this.$(element) : element;
        if (!el) return null;
        
        const observer = this.createIntersectionObserver((entries) => {
            entries.forEach(entry => {
                callback(entry.isIntersecting, entry);
            });
        }, options);
        
        observer.observe(el);
        return observer;
    }

    /**
     * Lazy load images
     * @param {string} selector - Image selector
     * @param {Object} options - Lazy load options
     */
    lazyLoadImages(selector = 'img[data-src]', options = {}) {
        const images = this.$(selector);
        if (images.length === 0) return;
        
        const defaultOptions = {
            threshold: 0.1,
            rootMargin: '50px'
        };
        
        const observer = this.createIntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.getAttribute('data-src');
                    
                    if (src) {
                        img.src = src;
                        img.removeAttribute('data-src');
                        img.classList.add('loaded');
                        
                        // Add fade-in effect
                        img.style.opacity = '0';
                        img.onload = () => {
                            this.animate(img, { opacity: '1' }, { duration: 300 });
                        };
                    }
                    
                    observer.unobserve(img);
                }
            });
        }, { ...defaultOptions, ...options });
        
        images.forEach(img => observer.observe(img));
    }

    // ==========================================
    // FORM UTILITIES
    // ==========================================

    /**
     * Serialize form data
     * @param {Element|string} form - Form element or selector
     * @param {boolean} asObject - Return as object instead of FormData
     * @returns {FormData|Object}
     */
    serializeForm(form, asObject = false) {
        const formEl = typeof form === 'string' ? this.$(form) : form;
        if (!formEl) return asObject ? {} : new FormData();
        
        const formData = new FormData(formEl);
        
        if (asObject) {
            const obj = {};
            for (const [key, value] of formData.entries()) {
                if (obj[key]) {
                    // Handle multiple values (checkboxes, multiple selects)
                    if (Array.isArray(obj[key])) {
                        obj[key].push(value);
                    } else {
                        obj[key] = [obj[key], value];
                    }
                } else {
                    obj[key] = value;
                }
            }
            return obj;
        }
        
        return formData;
    }

    /**
     * Populate form with data
     * @param {Element|string} form - Form element or selector
     * @param {Object} data - Data to populate
     */
    populateForm(form, data) {
        const formEl = typeof form === 'string' ? this.$(form) : form;
        if (!formEl || !data) return;
        
        Object.entries(data).forEach(([name, value]) => {
            const field = formEl.querySelector(`[name="${name}"]`);
            if (!field) return;
            
            if (field.type === 'checkbox' || field.type === 'radio') {
                field.checked = Boolean(value);
            } else if (field.tagName === 'SELECT') {
                field.value = value;
            } else {
                field.value = value;
            }
        });
    }

    /**
     * Validate form field
     * @param {Element} field - Form field element
     * @param {Object} rules - Validation rules
     * @returns {Object} - Validation result
     */
    validateField(field, rules = {}) {
        const value = field.value.trim();
        const errors = [];
        
        // Required validation
        if (rules.required && !value) {
            errors.push('This field is required');
        }
        
        // Only validate other rules if field has value
        if (value) {
            // Min/Max length
            if (rules.minLength && value.length < rules.minLength) {
                errors.push(`Minimum length is ${rules.minLength} characters`);
            }
            
            if (rules.maxLength && value.length > rules.maxLength) {
                errors.push(`Maximum length is ${rules.maxLength} characters`);
            }
            
            // Pattern validation
            if (rules.pattern && !rules.pattern.test(value)) {
                errors.push(rules.patternMessage || 'Invalid format');
            }
            
            // Email validation
            if (rules.email) {
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(value)) {
                    errors.push('Invalid email address');
                }
            }
            
            // URL validation
            if (rules.url) {
                try {
                    new URL(value);
                } catch {
                    errors.push('Invalid URL');
                }
            }
            
            // Number validation
            if (rules.number) {
                if (isNaN(value)) {
                    errors.push('Must be a number');
                } else {
                    const num = parseFloat(value);
                    if (rules.min !== undefined && num < rules.min) {
                        errors.push(`Minimum value is ${rules.min}`);
                    }
                    if (rules.max !== undefined && num > rules.max) {
                        errors.push(`Maximum value is ${rules.max}`);
                    }
                }
            }
            
            // Custom validation
            if (rules.custom && typeof rules.custom === 'function') {
                const customResult = rules.custom(value, field);
                if (customResult !== true) {
                    errors.push(customResult || 'Invalid value');
                }
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            value
        };
    }

    // ==========================================
    // STORAGE UTILITIES
    // ==========================================

    /**
     * Local storage wrapper with JSON support
     * @param {string} key - Storage key
     * @param {*} value - Value to store (if undefined, gets value)
     * @param {number} expiry - Expiry time in milliseconds
     * @returns {*} - Stored value or null
     */
    storage(key, value, expiry) {
        if (!this.supportsFeature('localStorage')) {
            console.warn('LocalStorage not supported');
            return null;
        }
        
        if (value === undefined) {
            // Get value
            try {
                const item = localStorage.getItem(key);
                if (!item) return null;
                
                const parsed = JSON.parse(item);
                
                // Check expiry
                if (parsed.expiry && Date.now() > parsed.expiry) {
                    localStorage.removeItem(key);
                    return null;
                }
                
                return parsed.value;
            } catch {
                localStorage.removeItem(key);
                return null;
            }
        } else {
            // Set value
            try {
                const item = {
                    value,
                    expiry: expiry ? Date.now() + expiry : null
                };
                localStorage.setItem(key, JSON.stringify(item));
                return value;
            } catch {
                console.warn('Failed to store item in localStorage');
                return null;
            }
        }
    }

    /**
     * Remove item from storage
     * @param {string} key - Storage key
     */
    removeStorage(key) {
        if (this.supportsFeature('localStorage')) {
            localStorage.removeItem(key);
        }
    }

    /**
     * Clear all storage
     */
    clearStorage() {
        if (this.supportsFeature('localStorage')) {
            localStorage.clear();
        }
    }

    // ==========================================
    // UTILITY FUNCTIONS
    // ==========================================

    /**
     * Generate unique ID
     * @param {string} prefix - ID prefix
     * @returns {string} - Unique ID
     */
    generateId(prefix = 'id') {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Deep clone object
     * @param {*} obj - Object to clone
     * @returns {*} - Cloned object
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const clonedObj = {};
            Object.keys(obj).forEach(key => {
                clonedObj[key] = this.deepClone(obj[key]);
            });
            return clonedObj;
        }
    }

    /**
     * Convert string to camelCase
     * @param {string} str - String to convert
     * @returns {string} - CamelCase string
     */
    toCamelCase(str) {
        return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
    }

    /**
     * Convert string to kebab-case
     * @param {string} str - String to convert
     * @returns {string} - Kebab-case string
     */
    toKebabCase(str) {
        return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }

    /**
     * Format number with locale
     * @param {number} number - Number to format
     * @param {Object} options - Formatting options
     * @returns {string} - Formatted number
     */
    formatNumber(number, options = {}) {
        const defaultOptions = {
            locale: 'en-US',
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        };
        
        const formatOptions = { ...defaultOptions, ...options };
        const { locale, ...intlOptions } = formatOptions;
        
        return new Intl.NumberFormat(locale, intlOptions).format(number);
    }

    /**
     * Format date with locale
     * @param {Date|string|number} date - Date to format
     * @param {Object} options - Formatting options
     * @returns {string} - Formatted date
     */
    formatDate(date, options = {}) {
        const defaultOptions = {
            locale: 'en-US',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        
        const formatOptions = { ...defaultOptions, ...options };
        const { locale, ...intlOptions } = formatOptions;
        
        const dateObj = new Date(date);
        return new Intl.DateTimeFormat(locale, intlOptions).format(dateObj);
    }

    /**
     * Get relative time
     * @param {Date|string|number} date - Date to compare
     * @param {string} locale - Locale for formatting
     * @returns {string} - Relative time string
     */
    getRelativeTime(date, locale = 'en-US') {
        const now = new Date();
        const dateObj = new Date(date);
        const diffMs = dateObj - now;
        
        const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
        
        const absDiff = Math.abs(diffMs);
        
        if (absDiff < 1000 * 60) {
            return rtf.format(Math.round(diffMs / 1000), 'second');
        } else if (absDiff < 1000 * 60 * 60) {
            return rtf.format(Math.round(diffMs / (1000 * 60)), 'minute');
        } else if (absDiff < 1000 * 60 * 60 * 24) {
            return rtf.format(Math.round(diffMs / (1000 * 60 * 60)), 'hour');
        } else if (absDiff < 1000 * 60 * 60 * 24 * 30) {
            return rtf.format(Math.round(diffMs / (1000 * 60 * 60 * 24)), 'day');
        } else if (absDiff < 1000 * 60 * 60 * 24 * 365) {
            return rtf.format(Math.round(diffMs / (1000 * 60 * 60 * 24 * 30)), 'month');
        } else {
            return rtf.format(Math.round(diffMs / (1000 * 60 * 60 * 24 * 365)), 'year');
        }
    }

    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @returns {Promise<boolean>} - Success status
     */
    async copyToClipboard(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                const success = document.execCommand('copy');
                document.body.removeChild(textArea);
                return success;
            }
        } catch {
            return false;
        }
    }

    /**
     * Download file from URL or data
     * @param {string} url - File URL or data URL
     * @param {string} filename - Filename for download
     */
    downloadFile(url, filename) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || 'download';
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Convert object to query string
     * @param {Object} obj - Object to convert
     * @returns {string} - Query string
     */
    objectToQueryString(obj) {
        const params = new URLSearchParams();
        
        Object.entries(obj).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach(item => params.append(key, item));
            } else if (value !== null && value !== undefined) {
                params.append(key, value);
            }
        });
        
        return params.toString();
    }

    /**
     * Parse query string to object
     * @param {string} queryString - Query string to parse
     * @returns {Object} - Parsed object
     */
    queryStringToObject(queryString = window.location.search) {
        const params = new URLSearchParams(queryString);
        const obj = {};
        
        for (const [key, value] of params.entries()) {
            if (obj[key]) {
                if (Array.isArray(obj[key])) {
                    obj[key].push(value);
                } else {
                    obj[key] = [obj[key], value];
                }
            } else {
                obj[key] = value;
            }
        }
        
        return obj;
    }

    /**
     * Cleanup all utilities
     */
    destroy() {
        console.log('🧹 Cleaning up DOM utilities...');
        
        // Cancel all animation frames
        this.animationFrames.forEach(frameId => {
            this.cancelFrame(frameId);
        });
        this.animationFrames.clear();
        
        // Disconnect all observers
        this.observers.forEach(observer => {
            observer.disconnect();
        });
        this.observers.clear();
        
        // Disconnect mutation observer
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
            this.mutationObserver = null;
        }
        
        // Clear caches
        this.elementCache.clear();
        this.performanceMarks.clear();
        
        console.log('🧹 DOM utilities cleaned up');
    }
}

// Create global instance
const domUtils = new DOMUtils();

// Export individual functions for convenience
const {
    $, $, getElementById, createElement, removeElement,
    addClass, removeClass, toggleClass, hasClass,
    attr, removeAttr, data, css,
    getDimensions, getPosition, getViewport, isInViewport,
    on, off, once, trigger, delegate,
    animate, fadeIn, fadeOut, slideDown, slideUp,
    scrollTo, getScrollPosition, setScrollPosition,
    getDeviceInfo, supportsFeature,
    mark, measure, throttle, debounce, requestFrame, cancelFrame,
    createIntersectionObserver, observeVisibility, lazyLoadImages,
    serializeForm, populateForm, validateField,
    storage, removeStorage, clearStorage,
    generateId, deepClone, toCamelCase, toKebabCase,
    formatNumber, formatDate, getRelativeTime,
    copyToClipboard, downloadFile, objectToQueryString, queryStringToObject
} = domUtils;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DOMUtils,
        domUtils,
        $, $, getElementById, createElement, removeElement,
        addClass, removeClass, toggleClass, hasClass,
        attr, removeAttr, data, css,
        getDimensions, getPosition, getViewport, isInViewport,
        on, off, once, trigger, delegate,
        animate, fadeIn, fadeOut, slideDown, slideUp,
        scrollTo, getScrollPosition, setScrollPosition,
        getDeviceInfo, supportsFeature,
        mark, measure, throttle, debounce, requestFrame, cancelFrame,
        createIntersectionObserver, observeVisibility, lazyLoadImages,
        serializeForm, populateForm, validateField,
        storage, removeStorage, clearStorage,
        generateId, deepClone, toCamelCase, toKebabCase,
        formatNumber, formatDate, getRelativeTime,
        copyToClipboard, downloadFile, objectToQueryString, queryStringToObject
    };
}

// Export for ES6 modules
export {
    DOMUtils,
    domUtils,
    $, $, getElementById, createElement, removeElement,
    addClass, removeClass, toggleClass, hasClass,
    attr, removeAttr, data, css,
    getDimensions, getPosition, getViewport, isInViewport,
    on, off, once, trigger, delegate,
    animate, fadeIn, fadeOut, slideDown, slideUp,
    scrollTo, getScrollPosition, setScrollPosition,
    getDeviceInfo, supportsFeature,
    mark, measure, throttle, debounce, requestFrame, cancelFrame,
    createIntersectionObserver, observeVisibility, lazyLoadImages,
    serializeForm, populateForm, validateField,
    storage, removeStorage, clearStorage,
    generateId, deepClone, toCamelCase, toKebabCase,
    formatNumber, formatDate, getRelativeTime,
    copyToClipboard, downloadFile, objectToQueryString, queryStringToObject
};

/*
===============================================
END DOM.JS
Ultra-complete DOM utilities library with:
- Enhanced element selection & manipulation
- Advanced CSS class & style management
- Comprehensive animation utilities
- Performance monitoring & optimization
- Device & browser detection
- Form utilities & validation
- Storage management
- Event handling & delegation
- Intersection observer helpers
- Utility functions for common tasks
===============================================
*/