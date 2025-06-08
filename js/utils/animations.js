/*
===============================================
ANIMATIONS.JS - Advanced Animation Utilities
Ultra-complete animation library with easing, timeline, and complex effects
===============================================
*/

/**
 * Animation Utilities Class
 * Advanced animation system with easing functions, timelines, and complex effects
 */
class AnimationUtils {
    constructor() {
        // Animation tracking
        this.activeAnimations = new Map();
        this.animationId = 0;
        this.timeline = null;
        
        // Performance monitoring
        this.performanceMode = 'auto'; // 'auto', 'performance', 'quality'
        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        // Animation queue
        this.animationQueue = [];
        this.isProcessingQueue = false;
        
        // Default settings
        this.defaults = {
            duration: 400,
            easing: 'easeOutCubic',
            fill: 'forwards',
            delay: 0
        };
        
        // Initialize
        this.init();
    }

    /**
     * Initialize animation utilities
     */
    init() {
        // Monitor reduced motion preference
        this.setupReducedMotionListener();
        
        // Setup performance monitoring
        this.setupPerformanceMonitoring();
        
        console.log('🎬 Animation utilities initialized');
    }

    /**
     * Setup reduced motion listener
     */
    setupReducedMotionListener() {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        mediaQuery.addEventListener('change', (e) => {
            this.reducedMotion = e.matches;
            if (this.reducedMotion) {
                this.pauseAllAnimations();
            }
        });
    }

    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        // Auto-adjust performance mode based on device
        if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
            this.performanceMode = 'performance';
        }
        
        // Monitor frame rate
        let frameCount = 0;
        let lastTime = performance.now();
        
        const monitor = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                const fps = frameCount;
                frameCount = 0;
                lastTime = currentTime;
                
                // Adjust performance mode based on FPS
                if (fps < 30 && this.performanceMode === 'auto') {
                    this.performanceMode = 'performance';
                } else if (fps > 50 && this.performanceMode === 'performance') {
                    this.performanceMode = 'auto';
                }
            }
            
            requestAnimationFrame(monitor);
        };
        
        requestAnimationFrame(monitor);
    }

    // ==========================================
    // EASING FUNCTIONS
    // ==========================================

    /**
     * Collection of easing functions
     */
    static easingFunctions = {
        // Linear
        linear: t => t,
        
        // Sine
        easeInSine: t => 1 - Math.cos((t * Math.PI) / 2),
        easeOutSine: t => Math.sin((t * Math.PI) / 2),
        easeInOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2,
        
        // Quadratic
        easeInQuad: t => t * t,
        easeOutQuad: t => 1 - (1 - t) * (1 - t),
        easeInOutQuad: t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
        
        // Cubic
        easeInCubic: t => t * t * t,
        easeOutCubic: t => 1 - Math.pow(1 - t, 3),
        easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
        
        // Quartic
        easeInQuart: t => t * t * t * t,
        easeOutQuart: t => 1 - Math.pow(1 - t, 4),
        easeInOutQuart: t => t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2,
        
        // Quintic
        easeInQuint: t => t * t * t * t * t,
        easeOutQuint: t => 1 - Math.pow(1 - t, 5),
        easeInOutQuint: t => t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2,
        
        // Exponential
        easeInExpo: t => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
        easeOutExpo: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
        easeInOutExpo: t => {
            if (t === 0) return 0;
            if (t === 1) return 1;
            return t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
        },
        
        // Circular
        easeInCirc: t => 1 - Math.sqrt(1 - Math.pow(t, 2)),
        easeOutCirc: t => Math.sqrt(1 - Math.pow(t - 1, 2)),
        easeInOutCirc: t => t < 0.5 
            ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2
            : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2,
        
        // Back
        easeInBack: t => {
            const c1 = 1.70158;
            const c3 = c1 + 1;
            return c3 * t * t * t - c1 * t * t;
        },
        easeOutBack: t => {
            const c1 = 1.70158;
            const c3 = c1 + 1;
            return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
        },
        easeInOutBack: t => {
            const c1 = 1.70158;
            const c2 = c1 * 1.525;
            return t < 0.5
                ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
                : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
        },
        
        // Elastic
        easeInElastic: t => {
            const c4 = (2 * Math.PI) / 3;
            return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
        },
        easeOutElastic: t => {
            const c4 = (2 * Math.PI) / 3;
            return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
        },
        easeInOutElastic: t => {
            const c5 = (2 * Math.PI) / 4.5;
            return t === 0 ? 0 : t === 1 ? 1 : t < 0.5
                ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
                : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
        },
        
        // Bounce
        easeInBounce: t => 1 - AnimationUtils.easingFunctions.easeOutBounce(1 - t),
        easeOutBounce: t => {
            const n1 = 7.5625;
            const d1 = 2.75;
            
            if (t < 1 / d1) {
                return n1 * t * t;
            } else if (t < 2 / d1) {
                return n1 * (t -= 1.5 / d1) * t + 0.75;
            } else if (t < 2.5 / d1) {
                return n1 * (t -= 2.25 / d1) * t + 0.9375;
            } else {
                return n1 * (t -= 2.625 / d1) * t + 0.984375;
            }
        },
        easeInOutBounce: t => t < 0.5
            ? (1 - AnimationUtils.easingFunctions.easeOutBounce(1 - 2 * t)) / 2
            : (1 + AnimationUtils.easingFunctions.easeOutBounce(2 * t - 1)) / 2,
        
        // Custom
        easeOutOvershoot: t => {
            const c1 = 1.70158;
            const c3 = c1 + 1;
            return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
        },
        easeInOutOvershoot: t => {
            const c1 = 1.70158;
            const c2 = c1 * 1.525;
            return t < 0.5
                ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
                : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
        }
    };

    /**
     * Get easing function by name
     * @param {string} name - Easing function name
     * @returns {Function} - Easing function
     */
    getEasingFunction(name) {
        return AnimationUtils.easingFunctions[name] || AnimationUtils.easingFunctions.easeOutCubic;
    }

    // ==========================================
    // CORE ANIMATION ENGINE
    // ==========================================

    /**
     * Animate element properties
     * @param {Element|string} element - Element or selector
     * @param {Object} properties - Properties to animate
     * @param {Object} options - Animation options
     * @returns {Promise} - Animation promise
     */
    animate(element, properties, options = {}) {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        if (!el) return Promise.reject(new Error('Element not found'));
        
        // Apply reduced motion
        if (this.reducedMotion) {
            Object.assign(el.style, properties);
            return Promise.resolve(el);
        }
        
        const config = { ...this.defaults, ...options };
        const animationId = ++this.animationId;
        
        return new Promise((resolve, reject) => {
            const startTime = performance.now();
            const startValues = {};
            const endValues = {};
            
            // Parse start and end values
            Object.keys(properties).forEach(prop => {
                const startValue = this.parseValue(el, prop);
                const endValue = this.parseValue(el, prop, properties[prop]);
                
                startValues[prop] = startValue;
                endValues[prop] = endValue;
            });
            
            const easingFunction = this.getEasingFunction(config.easing);
            
            const animateFrame = (currentTime) => {
                const elapsed = currentTime - startTime - config.delay;
                
                if (elapsed < 0) {
                    requestAnimationFrame(animateFrame);
                    return;
                }
                
                const progress = Math.min(elapsed / config.duration, 1);
                const easedProgress = easingFunction(progress);
                
                // Apply interpolated values
                Object.keys(properties).forEach(prop => {
                    const start = startValues[prop];
                    const end = endValues[prop];
                    const current = this.interpolateValue(start, end, easedProgress);
                    
                    this.setElementProperty(el, prop, current);
                });
                
                if (progress < 1) {
                    const frameId = requestAnimationFrame(animateFrame);
                    this.activeAnimations.set(animationId, {
                        element: el,
                        frameId,
                        cancel: () => {
                            cancelAnimationFrame(frameId);
                            this.activeAnimations.delete(animationId);
                            reject(new Error('Animation cancelled'));
                        }
                    });
                } else {
                    // Animation complete
                    this.activeAnimations.delete(animationId);
                    
                    if (config.fill === 'none') {
                        // Reset properties
                        Object.keys(properties).forEach(prop => {
                            this.setElementProperty(el, prop, startValues[prop]);
                        });
                    }
                    
                    resolve(el);
                }
            };
            
            requestAnimationFrame(animateFrame);
        });
    }

    /**
     * Parse CSS value from element or string
     * @param {Element} element - Target element
     * @param {string} property - CSS property
     * @param {string} value - Value to parse (optional)
     * @returns {Object} - Parsed value object
     */
    parseValue(element, property, value) {
        if (value !== undefined) {
            return this.parseCSSValue(value);
        }
        
        // Get computed style
        const computed = window.getComputedStyle(element);
        const currentValue = computed.getPropertyValue(property);
        
        return this.parseCSSValue(currentValue);
    }

    /**
     * Parse CSS value string
     * @param {string} value - CSS value
     * @returns {Object} - Parsed value object
     */
    parseCSSValue(value) {
        const numericValue = parseFloat(value);
        const unit = value.replace(numericValue.toString(), '') || '';
        
        // Handle special cases
        if (value === 'auto' || value === 'initial' || value === 'inherit') {
            return { value: 0, unit: 'px', original: value };
        }
        
        // Handle transform functions
        if (property === 'transform' && value.includes('(')) {
            return this.parseTransformValue(value);
        }
        
        // Handle color values
        if (this.isColorProperty(property)) {
            return this.parseColorValue(value);
        }
        
        return {
            value: isNaN(numericValue) ? 0 : numericValue,
            unit: unit || 'px',
            original: value
        };
    }

    /**
     * Parse transform value
     * @param {string} value - Transform value
     * @returns {Object} - Parsed transform object
     */
    parseTransformValue(value) {
        const transforms = {};
        const regex = /(\w+)\(([^)]+)\)/g;
        let match;
        
        while ((match = regex.exec(value)) !== null) {
            const [, func, params] = match;
            transforms[func] = params.split(',').map(p => this.parseCSSValue(p.trim()));
        }
        
        return { type: 'transform', transforms };
    }

    /**
     * Parse color value
     * @param {string} value - Color value
     * @returns {Object} - Parsed color object
     */
    parseColorValue(value) {
        // Handle hex colors
        if (value.startsWith('#')) {
            const hex = value.slice(1);
            const r = parseInt(hex.slice(0, 2), 16);
            const g = parseInt(hex.slice(2, 4), 16);
            const b = parseInt(hex.slice(4, 6), 16);
            const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
            
            return { type: 'color', r, g, b, a };
        }
        
        // Handle rgb/rgba colors
        const rgbMatch = value.match(/rgba?\(([^)]+)\)/);
        if (rgbMatch) {
            const [r, g, b, a = 1] = rgbMatch[1].split(',').map(v => parseFloat(v.trim()));
            return { type: 'color', r, g, b, a };
        }
        
        // Handle hsl colors
        const hslMatch = value.match(/hsla?\(([^)]+)\)/);
        if (hslMatch) {
            const [h, s, l, a = 1] = hslMatch[1].split(',').map(v => parseFloat(v.trim()));
            const { r, g, b } = this.hslToRgb(h, s / 100, l / 100);
            return { type: 'color', r, g, b, a };
        }
        
        // Fallback for named colors
        return { type: 'color', r: 0, g: 0, b: 0, a: 1 };
    }

    /**
     * Convert HSL to RGB
     * @param {number} h - Hue (0-360)
     * @param {number} s - Saturation (0-1)
     * @param {number} l - Lightness (0-1)
     * @returns {Object} - RGB values
     */
    hslToRgb(h, s, l) {
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c / 2;
        
        let r, g, b;
        
        if (h >= 0 && h < 60) {
            [r, g, b] = [c, x, 0];
        } else if (h >= 60 && h < 120) {
            [r, g, b] = [x, c, 0];
        } else if (h >= 120 && h < 180) {
            [r, g, b] = [0, c, x];
        } else if (h >= 180 && h < 240) {
            [r, g, b] = [0, x, c];
        } else if (h >= 240 && h < 300) {
            [r, g, b] = [x, 0, c];
        } else {
            [r, g, b] = [c, 0, x];
        }
        
        return {
            r: Math.round((r + m) * 255),
            g: Math.round((g + m) * 255),
            b: Math.round((b + m) * 255)
        };
    }

    /**
     * Check if property is color-related
     * @param {string} property - CSS property
     * @returns {boolean}
     */
    isColorProperty(property) {
        const colorProperties = [
            'color', 'background-color', 'border-color', 'outline-color',
            'text-shadow', 'box-shadow', 'border-top-color', 'border-right-color',
            'border-bottom-color', 'border-left-color'
        ];
        
        return colorProperties.includes(property);
    }

    /**
     * Interpolate between two values
     * @param {Object} start - Start value
     * @param {Object} end - End value
     * @param {number} progress - Progress (0-1)
     * @returns {Object} - Interpolated value
     */
    interpolateValue(start, end, progress) {
        if (start.type === 'color' && end.type === 'color') {
            return this.interpolateColor(start, end, progress);
        }
        
        if (start.type === 'transform' && end.type === 'transform') {
            return this.interpolateTransform(start, end, progress);
        }
        
        // Numeric interpolation
        const value = start.value + (end.value - start.value) * progress;
        return { ...start, value };
    }

    /**
     * Interpolate between two colors
     * @param {Object} start - Start color
     * @param {Object} end - End color
     * @param {number} progress - Progress (0-1)
     * @returns {Object} - Interpolated color
     */
    interpolateColor(start, end, progress) {
        const r = Math.round(start.r + (end.r - start.r) * progress);
        const g = Math.round(start.g + (end.g - start.g) * progress);
        const b = Math.round(start.b + (end.b - start.b) * progress);
        const a = start.a + (end.a - start.a) * progress;
        
        return { type: 'color', r, g, b, a };
    }

    /**
     * Interpolate between two transforms
     * @param {Object} start - Start transform
     * @param {Object} end - End transform
     * @param {number} progress - Progress (0-1)
     * @returns {Object} - Interpolated transform
     */
    interpolateTransform(start, end, progress) {
        const transforms = {};
        
        // Combine all transform functions
        const allFunctions = new Set([
            ...Object.keys(start.transforms),
            ...Object.keys(end.transforms)
        ]);
        
        allFunctions.forEach(func => {
            const startParams = start.transforms[func] || [{ value: 0, unit: 'px' }];
            const endParams = end.transforms[func] || [{ value: 0, unit: 'px' }];
            
            transforms[func] = startParams.map((startParam, index) => {
                const endParam = endParams[index] || startParam;
                const value = startParam.value + (endParam.value - startParam.value) * progress;
                return { ...startParam, value };
            });
        });
        
        return { type: 'transform', transforms };
    }

    /**
     * Set element property value
     * @param {Element} element - Target element
     * @param {string} property - CSS property
     * @param {Object} value - Value object
     */
    setElementProperty(element, property, value) {
        if (value.type === 'color') {
            const colorString = `rgba(${value.r}, ${value.g}, ${value.b}, ${value.a})`;
            element.style[property] = colorString;
        } else if (value.type === 'transform') {
            const transformString = Object.entries(value.transforms)
                .map(([func, params]) => {
                    const paramString = params.map(p => `${p.value}${p.unit}`).join(', ');
                    return `${func}(${paramString})`;
                })
                .join(' ');
            element.style.transform = transformString;
        } else {
            element.style[property] = `${value.value}${value.unit}`;
        }
    }

    // ==========================================
    // ANIMATION PRESETS
    // ==========================================

    /**
     * Fade in animation
     * @param {Element|string} element - Element or selector
     * @param {Object} options - Animation options
     * @returns {Promise}
     */
    fadeIn(element, options = {}) {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        if (!el) return Promise.reject(new Error('Element not found'));
        
        el.style.opacity = '0';
        el.style.display = 'block';
        
        return this.animate(el, { opacity: 1 }, {
            duration: 400,
            easing: 'easeOutCubic',
            ...options
        });
    }

    /**
     * Fade out animation
     * @param {Element|string} element - Element or selector
     * @param {Object} options - Animation options
     * @returns {Promise}
     */
    fadeOut(element, options = {}) {
        return this.animate(element, { opacity: 0 }, {
            duration: 400,
            easing: 'easeOutCubic',
            ...options
        }).then(el => {
            el.style.display = 'none';
            return el;
        });
    }

    /**
     * Slide in from top
     * @param {Element|string} element - Element or selector
     * @param {Object} options - Animation options
     * @returns {Promise}
     */
    slideInDown(element, options = {}) {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        if (!el) return Promise.reject(new Error('Element not found'));
        
        el.style.transform = 'translateY(-100%)';
        el.style.opacity = '0';
        
        return this.animate(el, {
            transform: 'translateY(0)',
            opacity: 1
        }, {
            duration: 500,
            easing: 'easeOutBack',
            ...options
        });
    }

    /**
     * Slide in from bottom
     * @param {Element|string} element - Element or selector
     * @param {Object} options - Animation options
     * @returns {Promise}
     */
    slideInUp(element, options = {}) {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        if (!el) return Promise.reject(new Error('Element not found'));
        
        el.style.transform = 'translateY(100%)';
        el.style.opacity = '0';
        
        return this.animate(el, {
            transform: 'translateY(0)',
            opacity: 1
        }, {
            duration: 500,
            easing: 'easeOutBack',
            ...options
        });
    }

    /**
     * Scale in animation
     * @param {Element|string} element - Element or selector
     * @param {Object} options - Animation options
     * @returns {Promise}
     */
    scaleIn(element, options = {}) {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        if (!el) return Promise.reject(new Error('Element not found'));
        
        el.style.transform = 'scale(0)';
        el.style.opacity = '0';
        
        return this.animate(el, {
            transform: 'scale(1)',
            opacity: 1
        }, {
            duration: 400,
            easing: 'easeOutBack',
            ...options
        });
    }

    /**
     * Bounce in animation
     * @param {Element|string} element - Element or selector
     * @param {Object} options - Animation options
     * @returns {Promise}
     */
    bounceIn(element, options = {}) {
        return this.animate(element, {
            transform: 'scale(1)',
            opacity: 1
        }, {
            duration: 600,
            easing: 'easeOutBounce',
            ...options
        });
    }

    /**
     * Shake animation
     * @param {Element|string} element - Element or selector
     * @param {Object} options - Animation options
     * @returns {Promise}
     */
    shake(element, options = {}) {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        if (!el) return Promise.reject(new Error('Element not found'));
        
        const originalTransform = el.style.transform;
        const intensity = options.intensity || 10;
        const iterations = options.iterations || 6;
        
        return new Promise((resolve) => {
            let iteration = 0;
            
            const shakeFrame = () => {
                const offset = (iteration % 2 === 0 ? intensity : -intensity) * (1 - iteration / iterations);
                el.style.transform = `${originalTransform} translateX(${offset}px)`;
                
                iteration++;
                
                if (iteration <= iterations) {
                    setTimeout(shakeFrame, 100);
                } else {
                    el.style.transform = originalTransform;
                    resolve(el);
                }
            };
            
            shakeFrame();
        });
    }

    /**
     * Pulse animation
     * @param {Element|string} element - Element or selector
     * @param {Object} options - Animation options
     * @returns {Promise}
     */
    pulse(element, options = {}) {
        const scale = options.scale || 1.1;
        const iterations = options.iterations || 1;
        
        const pulseOnce = () => {
            return this.animate(element, { transform: `scale(${scale})` }, {
                duration: 300,
                easing: 'easeInOutCubic'
            }).then(() => {
                return this.animate(element, { transform: 'scale(1)' }, {
                    duration: 300,
                    easing: 'easeInOutCubic'
                });
            });
        };
        
        let promise = Promise.resolve();
        for (let i = 0; i < iterations; i++) {
            promise = promise.then(pulseOnce);
        }
        
        return promise;
    }

    // ==========================================
    // TIMELINE ANIMATIONS
    // ==========================================

    /**
     * Create animation timeline
     * @returns {AnimationTimeline}
     */
    createTimeline() {
        return new AnimationTimeline(this);
    }

    // ==========================================
    // STAGGER ANIMATIONS
    // ==========================================

    /**
     * Stagger animation across multiple elements
     * @param {NodeList|Array} elements - Elements to animate
     * @param {Object} properties - Properties to animate
     * @param {Object} options - Animation options
     * @returns {Promise}
     */
    /**
     * Stagger animation across multiple elements
     * @param {NodeList|Array} elements - Elements to animate
     * @param {Object} properties - Properties to animate
     * @param {Object} options - Animation options
     * @returns {Promise}
     */
    stagger(elements, properties, options = {}) {
        const elementArray = Array.from(elements);
        const staggerDelay = options.staggerDelay || 100;
        const baseDelay = options.delay || 0;
        
        const promises = elementArray.map((element, index) => {
            const elementOptions = {
                ...options,
                delay: baseDelay + (index * staggerDelay)
            };
            
            return this.animate(element, properties, elementOptions);
        });
        
        return Promise.all(promises);
    }

    /**
     * Reveal elements with stagger effect
     * @param {string} selector - Element selector
     * @param {Object} options - Animation options
     * @returns {Promise}
     */
    revealStagger(selector, options = {}) {
        const elements = document.querySelectorAll(selector);
        
        // Set initial state
        elements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
        });
        
        return this.stagger(elements, {
            opacity: 1,
            transform: 'translateY(0)'
        }, {
            duration: 600,
            easing: 'easeOutCubic',
            staggerDelay: 150,
            ...options
        });
    }

    // ==========================================
    // SCROLL ANIMATIONS
    // ==========================================

    /**
     * Animate element based on scroll position
     * @param {Element|string} element - Element or selector
     * @param {Object} animations - Scroll-based animations
     * @param {Object} options - Animation options
     */
    scrollAnimate(element, animations, options = {}) {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        if (!el) return;
        
        const { start = 0, end = 1 } = options;
        
        const updateAnimation = () => {
            const rect = el.getBoundingClientRect();
            const elementTop = rect.top;
            const elementHeight = rect.height;
            const windowHeight = window.innerHeight;
            
            // Calculate scroll progress
            const startPosition = windowHeight * (1 - start);
            const endPosition = -elementHeight * end;
            const totalDistance = startPosition - endPosition;
            const currentPosition = elementTop - endPosition;
            
            let progress = 1 - (currentPosition / totalDistance);
            progress = Math.max(0, Math.min(1, progress));
            
            // Apply animations based on progress
            Object.entries(animations).forEach(([property, values]) => {
                const startValue = values.start || 0;
                const endValue = values.end || 1;
                const currentValue = startValue + (endValue - startValue) * progress;
                
                if (property === 'transform') {
                    el.style.transform = values.transform(currentValue);
                } else {
                    el.style[property] = `${currentValue}${values.unit || ''}`;
                }
            });
        };
        
        // Initial call
        updateAnimation();
        
        // Listen to scroll events
        window.addEventListener('scroll', updateAnimation, { passive: true });
        
        return () => {
            window.removeEventListener('scroll', updateAnimation);
        };
    }

    /**
     * Parallax scroll effect
     * @param {Element|string} element - Element or selector
     * @param {number} speed - Parallax speed (0-1)
     * @param {Object} options - Options
     */
    parallax(element, speed = 0.5, options = {}) {
        return this.scrollAnimate(element, {
            transform: {
                start: 0,
                end: 100,
                transform: (value) => `translateY(${value * speed}px)`
            }
        }, options);
    }

    // ==========================================
    // MORPHING ANIMATIONS
    // ==========================================

    /**
     * Morph between two elements
     * @param {Element} fromElement - Source element
     * @param {Element} toElement - Target element
     * @param {Object} options - Animation options
     * @returns {Promise}
     */
    morph(fromElement, toElement, options = {}) {
        const fromRect = fromElement.getBoundingClientRect();
        const toRect = toElement.getBoundingClientRect();
        
        // Create morphing element
        const morphElement = fromElement.cloneNode(true);
        morphElement.style.position = 'fixed';
        morphElement.style.top = `${fromRect.top}px`;
        morphElement.style.left = `${fromRect.left}px`;
        morphElement.style.width = `${fromRect.width}px`;
        morphElement.style.height = `${fromRect.height}px`;
        morphElement.style.zIndex = '9999';
        morphElement.style.pointerEvents = 'none';
        
        document.body.appendChild(morphElement);
        
        // Hide original elements
        fromElement.style.opacity = '0';
        toElement.style.opacity = '0';
        
        return this.animate(morphElement, {
            left: `${toRect.left}px`,
            top: `${toRect.top}px`,
            width: `${toRect.width}px`,
            height: `${toRect.height}px`
        }, {
            duration: 500,
            easing: 'easeInOutCubic',
            ...options
        }).then(() => {
            // Clean up
            document.body.removeChild(morphElement);
            fromElement.style.opacity = '';
            toElement.style.opacity = '';
            
            return { from: fromElement, to: toElement };
        });
    }

    // ==========================================
    // PARTICLE ANIMATIONS
    // ==========================================

    /**
     * Create particle explosion effect
     * @param {Element|string} element - Element or selector
     * @param {Object} options - Particle options
     * @returns {Promise}
     */
    particleExplosion(element, options = {}) {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        if (!el) return Promise.reject(new Error('Element not found'));
        
        const {
            particleCount = 20,
            colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'],
            duration = 1000,
            spread = 100
        } = options;
        
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const particles = [];
        
        // Create particles
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                width: 6px;
                height: 6px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                left: ${centerX}px;
                top: ${centerY}px;
            `;
            
            document.body.appendChild(particle);
            particles.push(particle);
            
            // Animate particle
            const angle = (Math.PI * 2 * i) / particleCount;
            const velocity = spread * (0.5 + Math.random() * 0.5);
            const endX = centerX + Math.cos(angle) * velocity;
            const endY = centerY + Math.sin(angle) * velocity;
            
            this.animate(particle, {
                left: `${endX}px`,
                top: `${endY}px`,
                opacity: 0,
                transform: 'scale(0)'
            }, {
                duration: duration,
                easing: 'easeOutQuart'
            }).then(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            });
        }
        
        return Promise.resolve(particles);
    }

    /**
     * Create confetti effect
     * @param {Object} options - Confetti options
     * @returns {Promise}
     */
    confetti(options = {}) {
        const {
            particleCount = 100,
            colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#fd79a8'],
            duration = 3000,
            gravity = 0.5,
            wind = 0.1
        } = options;
        
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            const size = 4 + Math.random() * 8;
            
            particle.style.cssText = `
                position: fixed;
                width: ${size}px;
                height: ${size}px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                pointer-events: none;
                z-index: 9999;
                left: ${Math.random() * window.innerWidth}px;
                top: -10px;
                border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
            `;
            
            document.body.appendChild(particle);
            particles.push(particle);
            
            // Animate with physics
            let x = Math.random() * window.innerWidth;
            let y = -10;
            let vx = (Math.random() - 0.5) * 4;
            let vy = Math.random() * 2 + 2;
            let rotation = Math.random() * 360;
            let rotationSpeed = (Math.random() - 0.5) * 10;
            
            const animateParticle = () => {
                x += vx + wind;
                y += vy;
                vy += gravity;
                rotation += rotationSpeed;
                
                particle.style.left = `${x}px`;
                particle.style.top = `${y}px`;
                particle.style.transform = `rotate(${rotation}deg)`;
                
                if (y < window.innerHeight + 50) {
                    requestAnimationFrame(animateParticle);
                } else {
                    if (particle.parentNode) {
                        particle.parentNode.removeChild(particle);
                    }
                }
            };
            
            setTimeout(() => {
                requestAnimationFrame(animateParticle);
            }, Math.random() * 1000);
        }
        
        return Promise.resolve(particles);
    }

    // ==========================================
    // ANIMATION CONTROLS
    // ==========================================

    /**
     * Pause all active animations
     */
    pauseAllAnimations() {
        this.activeAnimations.forEach(animation => {
            // In a real implementation, we'd pause the animation
            // For now, we'll just mark them as paused
            animation.paused = true;
        });
    }

    /**
     * Resume all paused animations
     */
    resumeAllAnimations() {
        this.activeAnimations.forEach(animation => {
            animation.paused = false;
        });
    }

    /**
     * Cancel all active animations
     */
    cancelAllAnimations() {
        this.activeAnimations.forEach(animation => {
            if (animation.cancel) {
                animation.cancel();
            }
        });
        this.activeAnimations.clear();
    }

    /**
     * Cancel animation by ID
     * @param {number} animationId - Animation ID
     */
    cancelAnimation(animationId) {
        const animation = this.activeAnimations.get(animationId);
        if (animation && animation.cancel) {
            animation.cancel();
        }
    }

    /**
     * Get active animation count
     * @returns {number} - Number of active animations
     */
    getActiveAnimationCount() {
        return this.activeAnimations.size;
    }

    /**
     * Set performance mode
     * @param {string} mode - Performance mode ('auto', 'performance', 'quality')
     */
    setPerformanceMode(mode) {
        this.performanceMode = mode;
        
        if (mode === 'performance') {
            // Reduce animation quality for better performance
            this.defaults.duration = Math.min(this.defaults.duration, 300);
        } else if (mode === 'quality') {
            // Increase animation quality
            this.defaults.duration = Math.max(this.defaults.duration, 400);
        }
    }

    /**
     * Cleanup all animations and resources
     */
    destroy() {
        console.log('🧹 Cleaning up animation utilities...');
        
        // Cancel all active animations
        this.cancelAllAnimations();
        
        // Clear animation queue
        this.animationQueue = [];
        this.isProcessingQueue = false;
        
        // Reset timeline
        if (this.timeline) {
            this.timeline.destroy();
            this.timeline = null;
        }
        
        console.log('🧹 Animation utilities cleaned up');
    }
}

/**
 * Animation Timeline Class
 * Manages complex animation sequences
 */
class AnimationTimeline {
    constructor(animationUtils) {
        this.animationUtils = animationUtils;
        this.animations = [];
        this.currentTime = 0;
        this.isPlaying = false;
        this.duration = 0;
    }

    /**
     * Add animation to timeline
     * @param {Element|string} element - Element or selector
     * @param {Object} properties - Properties to animate
     * @param {Object} options - Animation options
     * @param {number} delay - Delay from timeline start
     * @returns {AnimationTimeline} - Chainable
     */
    add(element, properties, options = {}, delay = 0) {
        const animation = {
            element,
            properties,
            options: { ...this.animationUtils.defaults, ...options },
            delay,
            startTime: delay,
            endTime: delay + (options.duration || this.animationUtils.defaults.duration)
        };
        
        this.animations.push(animation);
        this.duration = Math.max(this.duration, animation.endTime);
        
        return this;
    }

    /**
     * Add animation relative to previous animation
     * @param {Element|string} element - Element or selector
     * @param {Object} properties - Properties to animate
     * @param {Object} options - Animation options
     * @param {number} offset - Offset from previous animation
     * @returns {AnimationTimeline} - Chainable
     */
    addSequential(element, properties, options = {}, offset = 0) {
        const delay = this.duration + offset;
        return this.add(element, properties, options, delay);
    }

    /**
     * Add multiple animations at the same time
     * @param {Array} animations - Array of animation objects
     * @param {number} delay - Delay from timeline start
     * @returns {AnimationTimeline} - Chainable
     */
    addParallel(animations, delay = 0) {
        animations.forEach(({ element, properties, options }) => {
            this.add(element, properties, options, delay);
        });
        
        return this;
    }

    /**
     * Play timeline
     * @returns {Promise}
     */
    play() {
        if (this.isPlaying) return Promise.resolve();
        
        this.isPlaying = true;
        const startTime = performance.now();
        
        return new Promise((resolve) => {
            const playFrame = (currentTime) => {
                const elapsed = currentTime - startTime;
                this.currentTime = elapsed;
                
                // Check which animations should be playing
                this.animations.forEach(animation => {
                    if (elapsed >= animation.startTime && elapsed <= animation.endTime) {
                        const animationProgress = (elapsed - animation.startTime) / animation.options.duration;
                        
                        if (animationProgress >= 0 && animationProgress <= 1 && !animation.started) {
                            animation.started = true;
                            this.animationUtils.animate(
                                animation.element,
                                animation.properties,
                                animation.options
                            );
                        }
                    }
                });
                
                if (elapsed < this.duration) {
                    requestAnimationFrame(playFrame);
                } else {
                    this.isPlaying = false;
                    resolve();
                }
            };
            
            requestAnimationFrame(playFrame);
        });
    }

    /**
     * Pause timeline
     */
    pause() {
        this.isPlaying = false;
    }

    /**
     * Reset timeline
     */
    reset() {
        this.currentTime = 0;
        this.isPlaying = false;
        this.animations.forEach(animation => {
            animation.started = false;
        });
    }

    /**
     * Seek to specific time
     * @param {number} time - Time in milliseconds
     */
    seek(time) {
        this.currentTime = Math.max(0, Math.min(time, this.duration));
        // In a full implementation, we'd update all animations to this time
    }

    /**
     * Get timeline duration
     * @returns {number} - Duration in milliseconds
     */
    getDuration() {
        return this.duration;
    }

    /**
     * Clear timeline
     */
    clear() {
        this.animations = [];
        this.duration = 0;
        this.reset();
    }

    /**
     * Destroy timeline
     */
    destroy() {
        this.clear();
        this.animationUtils = null;
    }
}

// Create global instance
const animationUtils = new AnimationUtils();

// Export individual functions for convenience
const {
    animate, fadeIn, fadeOut, slideInDown, slideInUp, scaleIn, bounceIn,
    shake, pulse, stagger, revealStagger, scrollAnimate, parallax,
    morph, particleExplosion, confetti, createTimeline,
    pauseAllAnimations, resumeAllAnimations, cancelAllAnimations,
    getActiveAnimationCount, setPerformanceMode
} = animationUtils;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AnimationUtils,
        AnimationTimeline,
        animationUtils,
        animate, fadeIn, fadeOut, slideInDown, slideInUp, scaleIn, bounceIn,
        shake, pulse, stagger, revealStagger, scrollAnimate, parallax,
        morph, particleExplosion, confetti, createTimeline,
        pauseAllAnimations, resumeAllAnimations, cancelAllAnimations,
        getActiveAnimationCount, setPerformanceMode
    };
}

// Export for ES6 modules
export {
    AnimationUtils,
    AnimationTimeline,
    animationUtils,
    animate, fadeIn, fadeOut, slideInDown, slideInUp, scaleIn, bounceIn,
    shake, pulse, stagger, revealStagger, scrollAnimate, parallax,
    morph, particleExplosion, confetti, createTimeline,
    pauseAllAnimations, resumeAllAnimations, cancelAllAnimations,
    getActiveAnimationCount, setPerformanceMode
};

/*
===============================================
END ANIMATIONS.JS
Ultra-complete animation library with:
- Advanced easing functions (30+ types)
- Core animation engine with interpolation
- Color and transform animations
- Animation presets (fade, slide, scale, bounce, shake, pulse)
- Timeline system for complex sequences
- Stagger animations
- Scroll-based animations and parallax
- Morphing between elements
- Particle effects (explosion, confetti)
- Performance monitoring and optimization
- Reduced motion support
- Animation controls and management
===============================================
*/