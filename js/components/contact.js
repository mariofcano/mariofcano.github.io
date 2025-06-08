/*
===============================================
CONTACT.JS - Contact Section Component
Advanced contact form with validation, animations, and interactive effects
===============================================
*/

/**
 * Contact Component Class
 * Manages contact section with form validation, submission, and visual effects
 */
class ContactComponent {
    constructor(options = {}) {
        this.options = {
            enableRealTimeValidation: true,
            enableSubmitValidation: true,
            enableVisualFeedback: true,
            animationDuration: 300,
            debounceDelay: 300,
            maxFileSize: 5 * 1024 * 1024, // 5MB
            allowedFileTypes: ['pdf', 'doc', 'docx', 'txt'],
            autoSave: true,
            autoSaveInterval: 30000, // 30 seconds
            submitTimeout: 10000, // 10 seconds
            enableTypingIndicator: true,
            enableCharacterCount: true,
            enableSubmitAnimation: true,
            ...options
        };
        
        // Component state
        this.isInitialized = false;
        this.isVisible = false;
        this.isSubmitting = false;
        this.isValid = false;
        this.formData = {};
        this.validationErrors = {};
        this.isDirty = false;
        
        // Form state
        this.hasInteracted = false;
        this.submitAttempted = false;
        this.lastAutoSave = null;
        this.typingTimer = null;
        
        // Animation tracking
        this.animationFrames = new Set();
        this.observers = new Set();
        
        // DOM elements
        this.contactSection = null;
        this.contactForm = null;
        this.formFields = new Map();
        this.submitButton = null;
        this.statusElement = null;
        this.progressBar = null;
        this.contactInfo = null;
        
        // Field configurations
        this.fieldConfig = {
            name: {
                required: true,
                minLength: 2,
                maxLength: 50,
                pattern: /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$/,
                errorMessages: {
                    required: 'El nombre es obligatorio',
                    minLength: 'El nombre debe tener al menos 2 caracteres',
                    maxLength: 'El nombre no puede superar 50 caracteres',
                    pattern: 'El nombre solo puede contener letras y espacios'
                }
            },
            email: {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                errorMessages: {
                    required: 'El email es obligatorio',
                    pattern: 'Por favor, introduce un email válido'
                }
            },
            subject: {
                required: false,
                maxLength: 100,
                errorMessages: {
                    maxLength: 'El asunto no puede superar 100 caracteres'
                }
            },
            message: {
                required: true,
                minLength: 10,
                maxLength: 1000,
                errorMessages: {
                    required: 'El mensaje es obligatorio',
                    minLength: 'El mensaje debe tener al menos 10 caracteres',
                    maxLength: 'El mensaje no puede superar 1000 caracteres'
                }
            },
            privacy: {
                required: true,
                errorMessages: {
                    required: 'Debes aceptar la política de privacidad'
                }
            }
        };
        
        // Event handlers
        this.handleFieldInput = this.handleFieldInput.bind(this);
        this.handleFieldBlur = this.handleFieldBlur.bind(this);
        this.handleFieldFocus = this.handleFieldFocus.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.handleFileInput = this.handleFileInput.bind(this);
        this.handleContactInfoClick = this.handleContactInfoClick.bind(this);
        
        // Debounced functions
        this.debouncedValidation = this.debounce(this.validateField.bind(this), this.options.debounceDelay);
        this.debouncedAutoSave = this.debounce(this.autoSaveForm.bind(this), this.options.autoSaveInterval);
    }

    /**
     * Initialize the contact component
     */
    init() {
        console.log('📧 Initializing Contact Component...');
        
        try {
            // Find DOM elements
            this.findElements();
            
            // Setup intersection observer
            this.setupVisibilityObserver();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Setup form validation
            this.setupFormValidation();
            
            // Setup contact info interactions
            this.setupContactInfoInteractions();
            
            // Setup auto-save if enabled
            if (this.options.autoSave) {
                this.setupAutoSave();
            }
            
            // Load saved form data
            this.loadSavedFormData();
            
            // Setup visual enhancements
            this.setupVisualEnhancements();
            
            this.isInitialized = true;
            console.log('✅ Contact Component initialized');
            
            // Dispatch ready event
            this.dispatchEvent('contact:ready');
            
        } catch (error) {
            console.error('❌ Failed to initialize Contact:', error);
        }
    }

    /**
     * Find and cache DOM elements
     */
    findElements() {
        this.contactSection = document.getElementById('contact') || document.querySelector('.contact-section');
        
        if (!this.contactSection) {
            throw new Error('Contact section not found');
        }
        
        // Find form elements
        this.contactForm = this.contactSection.querySelector('#contact-form');
        this.submitButton = this.contactForm?.querySelector('[type="submit"]');
        this.statusElement = this.contactForm?.querySelector('.form-status');
        this.progressBar = this.contactForm?.querySelector('.form-progress');
        
        // Find contact info
        this.contactInfo = this.contactSection.querySelector('.contact-info');
        
        // Cache form fields
        if (this.contactForm) {
            const fieldElements = this.contactForm.querySelectorAll('input, textarea, select');
            fieldElements.forEach(field => {
                const name = field.name || field.id;
                if (name) {
                    this.formFields.set(name, {
                        element: field,
                        errorElement: document.getElementById(`${name}-error`),
                        config: this.fieldConfig[name] || {},
                        isValid: false,
                        value: field.value || ''
                    });
                }
            });
        }
        
        console.log(`📧 Found ${this.formFields.size} form fields`);
    }

    /**
     * Setup visibility observer
     */
    setupVisibilityObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const wasVisible = this.isVisible;
                this.isVisible = entry.isIntersecting;
                
                if (wasVisible !== this.isVisible) {
                    this.handleVisibilityChange();
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '50px'
        });
        
        observer.observe(this.contactSection);
        this.observers.add(observer);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        if (!this.contactForm) return;
        
        // Form submission
        this.contactForm.addEventListener('submit', this.handleFormSubmit);
        
        // Field events
        this.formFields.forEach((fieldData, fieldName) => {
            const field = fieldData.element;
            
            // Input events
            field.addEventListener('input', (e) => this.handleFieldInput(e, fieldName));
            field.addEventListener('blur', (e) => this.handleFieldBlur(e, fieldName));
            field.addEventListener('focus', (e) => this.handleFieldFocus(e, fieldName));
            
            // Special handling for file inputs
            if (field.type === 'file') {
                field.addEventListener('change', this.handleFileInput);
            }
            
            // Character count for textareas
            if (field.tagName === 'TEXTAREA' && this.options.enableCharacterCount) {
                this.setupCharacterCount(field, fieldName);
            }
        });
        
        // Contact info interactions
        if (this.contactInfo) {
            const contactItems = this.contactInfo.querySelectorAll('.contact-item');
            contactItems.forEach(item => {
                item.addEventListener('click', this.handleContactInfoClick);
            });
        }
        
        // Custom events
        document.addEventListener('theme:change', this.handleThemeChange.bind(this));
    }

    /**
     * Setup form validation
     */
    setupFormValidation() {
        // Initial validation state
        this.updateFormValidity();
        
        console.log('✅ Form validation system initialized');
    }

    /**
     * Setup contact info interactions
     */
    setupContactInfoInteractions() {
        if (!this.contactInfo) return;
        
        const contactItems = this.contactInfo.querySelectorAll('.contact-item');
        
        contactItems.forEach(item => {
            // Add hover effects
            item.addEventListener('mouseenter', () => {
                item.style.transform = 'translateX(8px)';
                item.style.boxShadow = 'var(--shadow-md)';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.transform = 'translateX(0)';
                item.style.boxShadow = '';
            });
            
            // Add click animations
            item.addEventListener('click', () => {
                this.addClickFeedback(item);
            });
        });
    }

    /**
     * Setup auto-save functionality
     */
    setupAutoSave() {
        setInterval(() => {
            if (this.isDirty && this.hasInteracted) {
                this.autoSaveForm();
            }
        }, this.options.autoSaveInterval);
    }

    /**
     * Setup character count for textareas
     */
    setupCharacterCount(field, fieldName) {
        const config = this.fieldConfig[fieldName];
        const maxLength = config?.maxLength;
        
        if (!maxLength) return;
        
        // Create character count element
        const countElement = document.createElement('div');
        countElement.className = 'character-count';
        countElement.style.cssText = `
            text-align: right;
            font-size: 0.875rem;
            color: var(--text-tertiary);
            margin-top: 0.25rem;
        `;
        
        field.parentNode.appendChild(countElement);
        
        // Update character count
        const updateCount = () => {
            const currentLength = field.value.length;
            const remaining = maxLength - currentLength;
            
            countElement.textContent = `${currentLength}/${maxLength}`;
            
            if (remaining < 50) {
                countElement.style.color = 'var(--color-warning)';
            } else if (remaining < 0) {
                countElement.style.color = 'var(--color-error)';
            } else {
                countElement.style.color = 'var(--text-tertiary)';
            }
        };
        
        field.addEventListener('input', updateCount);
        updateCount(); // Initial count
    }

    /**
     * Setup visual enhancements
     */
    setupVisualEnhancements() {
        // Add floating labels effect
        this.formFields.forEach((fieldData, fieldName) => {
            const field = fieldData.element;
            const label = this.contactForm.querySelector(`label[for="${field.id}"]`);
            
            if (label && field.type !== 'checkbox') {
                this.setupFloatingLabel(field, label);
            }
        });
        
        // Add input focus animations
        this.setupInputAnimations();
    }

    /**
     * Setup floating label effect
     */
    setupFloatingLabel(field, label) {
        const wrapper = field.parentNode;
        wrapper.style.position = 'relative';
        
        // Style label as floating
        label.style.cssText = `
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            background: var(--bg-primary);
            padding: 0 4px;
            color: var(--text-tertiary);
            transition: all 0.3s ease;
            pointer-events: none;
            z-index: 1;
        `;
        
        const moveLabel = (up) => {
            if (up) {
                label.style.top = '0';
                label.style.transform = 'translateY(-50%) scale(0.85)';
                label.style.color = 'var(--text-accent)';
            } else {
                label.style.top = '50%';
                label.style.transform = 'translateY(-50%) scale(1)';
                label.style.color = 'var(--text-tertiary)';
            }
        };
        
        // Check initial state
        if (field.value) {
            moveLabel(true);
        }
        
        // Handle focus/blur
        field.addEventListener('focus', () => moveLabel(true));
        field.addEventListener('blur', () => {
            if (!field.value) moveLabel(false);
        });
        
        // Handle input
        field.addEventListener('input', () => {
            if (field.value) {
                moveLabel(true);
            }
        });
    }

    /**
     * Setup input animations
     */
    setupInputAnimations() {
        this.formFields.forEach((fieldData) => {
            const field = fieldData.element;
            
            field.addEventListener('focus', () => {
                field.style.transform = 'scale(1.02)';
                field.style.borderColor = 'var(--color-primary-500)';
                field.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            });
            
            field.addEventListener('blur', () => {
                field.style.transform = 'scale(1)';
                field.style.borderColor = '';
                field.style.boxShadow = '';
            });
        });
    }

    /**
     * Handle field input
     */
    handleFieldInput(event, fieldName) {
        const field = event.target;
        const fieldData = this.formFields.get(fieldName);
        
        if (!fieldData) return;
        
        // Update field data
        fieldData.value = field.value;
        this.formData[fieldName] = field.value;
        this.isDirty = true;
        this.hasInteracted = true;
        
        // Real-time validation
        if (this.options.enableRealTimeValidation && this.hasInteracted) {
            this.debouncedValidation(fieldName);
        }
        
        // Auto-save
        if (this.options.autoSave) {
            this.debouncedAutoSave();
        }
        
        // Typing indicator
        if (this.options.enableTypingIndicator) {
            this.showTypingIndicator(fieldName);
        }
        
        // Dispatch event
        this.dispatchEvent('contact:field-changed', { fieldName, value: field.value });
    }

    /**
     * Handle field blur
     */
    handleFieldBlur(event, fieldName) {
        const field = event.target;
        
        // Always validate on blur if user has interacted
        if (this.hasInteracted) {
            this.validateField(fieldName);
        }
        
        // Hide typing indicator
        this.hideTypingIndicator(fieldName);
        
        // Add visual feedback
        this.addFieldBlurEffect(field);
        
        // Dispatch event
        this.dispatchEvent('contact:field-blur', { fieldName });
    }

    /**
     * Handle field focus
     */
    handleFieldFocus(event, fieldName) {
        const field = event.target;
        
        // Mark as interacted
        this.hasInteracted = true;
        
        // Clear previous errors on focus
        if (this.validationErrors[fieldName]) {
            this.clearFieldError(fieldName);
        }
        
        // Add visual feedback
        this.addFieldFocusEffect(field);
        
        // Dispatch event
        this.dispatchEvent('contact:field-focus', { fieldName });
    }

    /**
     * Validate single field
     */
    validateField(fieldName) {
        const fieldData = this.formFields.get(fieldName);
        const config = fieldData?.config;
        
        if (!fieldData || !config) return true;
        
        const value = fieldData.value.trim();
        const errors = [];
        
        // Required validation
        if (config.required && !value) {
            errors.push(config.errorMessages.required);
        }
        
        // Only validate other rules if field has value
        if (value) {
            // Pattern validation
            if (config.pattern && !config.pattern.test(value)) {
                errors.push(config.errorMessages.pattern);
            }
            
            // Length validations
            if (config.minLength && value.length < config.minLength) {
                errors.push(config.errorMessages.minLength);
            }
            
            if (config.maxLength && value.length > config.maxLength) {
                errors.push(config.errorMessages.maxLength);
            }
        }
        
        // Special validation for checkbox (privacy)
        if (fieldData.element.type === 'checkbox' && config.required && !fieldData.element.checked) {
            errors.push(config.errorMessages.required);
        }
        
        // Update field validation state
        fieldData.isValid = errors.length === 0;
        
        if (errors.length > 0) {
            this.showFieldError(fieldName, errors[0]);
            this.validationErrors[fieldName] = errors[0];
        } else {
            this.clearFieldError(fieldName);
            delete this.validationErrors[fieldName];
        }
        
        // Update overall form validity
        this.updateFormValidity();
        
        return fieldData.isValid;
    }

    /**
     * Show field error
     */
    showFieldError(fieldName, message) {
        const fieldData = this.formFields.get(fieldName);
        if (!fieldData) return;
        
        const field = fieldData.element;
        const errorElement = fieldData.errorElement;
        
        // Add error class to field
        field.classList.add('error');
        
        // Show error message
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            errorElement.style.opacity = '1';
        }
        
        // Add shake animation
        field.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            field.style.animation = '';
        }, 500);
    }

    /**
     * Clear field error
     */
    clearFieldError(fieldName) {
        const fieldData = this.formFields.get(fieldName);
        if (!fieldData) return;
        
        const field = fieldData.element;
        const errorElement = fieldData.errorElement;
        
        // Remove error class
        field.classList.remove('error');
        
        // Hide error message
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
            errorElement.style.opacity = '0';
        }
    }

    /**
     * Update overall form validity
     */
    updateFormValidity() {
        const allValid = Array.from(this.formFields.values()).every(fieldData => fieldData.isValid);
        this.isValid = allValid;
        
        // Update submit button state
        if (this.submitButton) {
            this.submitButton.disabled = !allValid || this.isSubmitting;
            
            if (allValid) {
                this.submitButton.classList.add('ready');
            } else {
                this.submitButton.classList.remove('ready');
            }
        }
    }

    /**
     * Handle form submission
     */
    async handleFormSubmit(event) {
        event.preventDefault();
        
        if (this.isSubmitting) return;
        
        this.submitAttempted = true;
        
        // Validate all fields
        const isFormValid = this.validateAllFields();
        
        if (!isFormValid) {
            this.showFormError('Por favor, corrige los errores antes de enviar');
            this.focusFirstError();
            return;
        }
        
        // Start submission
        await this.submitForm();
    }

    /**
     * Validate all fields
     */
    validateAllFields() {
        let allValid = true;
        
        this.formFields.forEach((fieldData, fieldName) => {
            const isValid = this.validateField(fieldName);
            if (!isValid) allValid = false;
        });
        
        return allValid;
    }

    /**
     * Submit form
     */
    async submitForm() {
        this.isSubmitting = true;
        this.setSubmitButtonLoading(true);
        
        try {
            console.log('📧 Submitting contact form...');
            
            // Collect form data
            const formData = new FormData(this.contactForm);
            const data = Object.fromEntries(formData.entries());
            
            // Show progress
            this.showSubmissionProgress();
            
            // Simulate API call (replace with actual endpoint)
            await this.simulateFormSubmission(data);
            
            // Success
            this.handleSubmissionSuccess();
            
            // Clear saved form data
            this.clearSavedFormData();
            
        } catch (error) {
            console.error('Submission error:', error);
            this.handleSubmissionError(error);
        } finally {
            this.isSubmitting = false;
            this.setSubmitButtonLoading(false);
            this.hideSubmissionProgress();
        }
    }

    /**
     * Simulate form submission
     */
    async simulateFormSubmission(data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate random success/failure for demo
                if (Math.random() > 0.1) { // 90% success rate
                    resolve(data);
                } else {
                    reject(new Error('Error de conexión. Inténtalo de nuevo.'));
                }
            }, 2000);
        });
    }

    /**
     * Handle submission success
     */
    handleSubmissionSuccess() {
        this.showFormSuccess('¡Mensaje enviado correctamente! Te responderé pronto.');
        
        // Reset form
        this.contactForm.reset();
        this.resetFormState();
        
        // Add success animation
        this.addSuccessAnimation();
        
        // Dispatch event
        this.dispatchEvent('contact:form-submitted');
        
        console.log('✅ Form submitted successfully');
    }

    /**
     * Handle submission error
     */
    handleSubmissionError(error) {
        const message = error.message || 'Error al enviar el mensaje. Inténtalo de nuevo.';
        this.showFormError(message);
        
        // Dispatch event
        this.dispatchEvent('contact:form-error', { error });
    }

    /**
     * Set submit button loading state
     */
    setSubmitButtonLoading(isLoading) {
        if (!this.submitButton) return;
        
        if (isLoading) {
            this.submitButton.classList.add('loading');
            this.submitButton.disabled = true;
            
            // Show loading text
            const textElement = this.submitButton.querySelector('.btn-text');
            const loadingElement = this.submitButton.querySelector('.btn-loading');
            
            if (textElement) textElement.style.opacity = '0';
            if (loadingElement) loadingElement.style.display = 'block';
            
        } else {
            this.submitButton.classList.remove('loading');
            this.submitButton.disabled = !this.isValid;
            
            // Show normal text
            const textElement = this.submitButton.querySelector('.btn-text');
            const loadingElement = this.submitButton.querySelector('.btn-loading');
            
            if (textElement) textElement.style.opacity = '1';
            if (loadingElement) loadingElement.style.display = 'none';
        }
    }

    /**
     * Show submission progress
     */
    showSubmissionProgress() {
        if (!this.progressBar) return;
        
        this.progressBar.style.display = 'block';
        this.progressBar.style.width = '0%';
        
        // Animate progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 30;
            if (progress > 90) progress = 90;
            
            this.progressBar.style.width = `${progress}%`;
            
            if (progress >= 90) {
                clearInterval(interval);
            }
        }, 200);
        
        // Complete progress after submission
        setTimeout(() => {
            this.progressBar.style.width = '100%';
        }, 1800);
    }

    /**
     * Hide submission progress
     */
    hideSubmissionProgress() {
        if (!this.progressBar) return;
        
        setTimeout(() => {
            this.progressBar.style.display = 'none';
        }, 500);
    }

    /**
     * Show form success message
     */
    showFormSuccess(message) {
        if (!this.statusElement) return;
        
        this.statusElement.className = 'form-status success';
        this.statusElement.textContent = message;
        this.statusElement.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.statusElement.style.display = 'none';
        }, 5000);
    }

    /**
     * Show form error message
     */
    showFormError(message) {
        if (!this.statusElement) return;
        
        this.statusElement.className = 'form-status error';
        this.statusElement.textContent = message;
        this.statusElement.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.statusElement.style.display = 'none';
        }, 5000);
    }

    /**
     * Focus first error field
     */
    focusFirstError() {
        for (const [fieldName, fieldData] of this.formFields) {
            if (!fieldData.isValid) {
                fieldData.element.focus();
                break;
            }
        }
    }

    /**
     * Reset form state
     */
    resetFormState() {
        this.formData = {};
        this.validationErrors = {};
        this.isDirty = false;
        this.submitAttempted = false;
        
        // Reset field states
        this.formFields.forEach((fieldData, fieldName) => {
            fieldData.isValid = false;
            fieldData.value = '';
            this.clearFieldError(fieldName);
        });
        
        this.updateFormValidity();
    }

    /**
     * Auto-save form data
     */
    autoSaveForm() {
        const formData = {};
        
        this.formFields.forEach((fieldData, fieldName) => {
            if (fieldData.element.type !== 'password') {
                formData[fieldName] = fieldData.value;
            }
        });
        
        localStorage.setItem('contact-form-draft', JSON.stringify({
            data: formData,
            timestamp: Date.now()
        }));
        
        this.lastAutoSave = Date.now();
        console.log('💾 Form auto-saved');
    }

    /**
     * Load saved form data
     */
    loadSavedFormData() {
        try {
            const saved = localStorage.getItem('contact-form-draft');
            if (!saved) return;
            
            const { data, timestamp } = JSON.parse(saved);
            
            // Don't load if older than 24 hours
            if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
                localStorage.removeItem('contact-form-draft');
                return;
            }
            
            // Restore form data
            Object.entries(data).forEach(([fieldName, value]) => {
                const fieldData = this.formFields.get(fieldName);
                if (fieldData && value) {
                    fieldData.element.value = value;
                    fieldData.value = value;
                    this.formData[fieldName] = value;
                }
            });
            
            this.isDirty = true;
            console.log('📝 Form data restored from auto-save');
            
        } catch (error) {
            console.error('Error loading saved form data:', error);
            localStorage.removeItem('contact-form-draft');
        }
    }

    /**
     * Clear saved form data
     */
    clearSavedFormData() {
        localStorage.removeItem('contact-form-draft');
    }

    /**
     * Show typing indicator
     */
    showTypingIndicator(fieldName) {
        // Clear existing timer
        if (this.typingTimer) {
            clearTimeout(this.typingTimer);
        }
        
        // Show indicator
        const fieldData = this.formFields.get(fieldName);
        if (fieldData?.element) {
            fieldData.element.classList.add('typing');
        }
        
        // Hide after delay
        this.typingTimer = setTimeout(() => {
            this.hideTypingIndicator(fieldName);
        }, 1000);
    }

    /**
     * Hide typing indicator
     */
    hideTypingIndicator(fieldName) {
        const fieldData = this.formFields.get(fieldName);
        if (fieldData?.element) {
            fieldData.element.classList.remove('typing');
        }
    }

    /**
     * Add field focus effect
     */
    addFieldFocusEffect(field) {
        field.style.transform = 'scale(1.02)';
        field.style.transition = 'transform 0.2s ease';
    }

    /**
     * Add field blur effect
     */
    addFieldBlurEffect(field) {
        field.style.transform = 'scale(1)';
    }

    /**
     * Add success animation
     */
    addSuccessAnimation() {
        if (!this.contactForm) return;
        
        // Create success checkmark
        const checkmark = document.createElement('div');
        checkmark.innerHTML = '✓';
        checkmark.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            font-size: 4rem;
            color: var(--color-success);
            background: white;
            border-radius: 50%;
            width: 100px;
            height: 100px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: var(--shadow-xl);
            z-index: 10000;
            animation: successPop 0.6s ease-out forwards;
        `;
        
        document.body.appendChild(checkmark);
        
        // Remove after animation
        setTimeout(() => {
            if (checkmark.parentNode) {
                checkmark.parentNode.removeChild(checkmark);
            }
        }, 2000);
    }

    /**
     * Add click feedback to contact info
     */
    addClickFeedback(element) {
        element.style.transform = 'translateX(4px) scale(0.98)';
        
        setTimeout(() => {
            element.style.transform = 'translateX(8px) scale(1)';
        }, 100);
    }

    /**
     * Handle contact info click
     */
    handleContactInfoClick(event) {
        const item = event.currentTarget;
        const link = item.querySelector('a');
        
        if (link) {
            // Track contact method used
            const method = link.href.startsWith('mailto:') ? 'email' : 
                         link.href.startsWith('tel:') ? 'phone' : 'other';
            
            this.dispatchEvent('contact:info-clicked', { method, href: link.href });
            
            console.log(`📞 Contact method used: ${method}`);
        }
    }

    /**
     * Handle file input
     */
    handleFileInput(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Validate file size
        if (file.size > this.options.maxFileSize) {
            this.showFormError(`El archivo es demasiado grande. Máximo ${this.options.maxFileSize / 1024 / 1024}MB.`);
            event.target.value = '';
            return;
        }
        
        // Validate file type
        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (!this.options.allowedFileTypes.includes(fileExtension)) {
            this.showFormError(`Tipo de archivo no permitido. Formatos válidos: ${this.options.allowedFileTypes.join(', ')}`);
            event.target.value = '';
            return;
        }
        
        console.log(`📎 File attached: ${file.name} (${file.size} bytes)`);
        
        // Dispatch event
        this.dispatchEvent('contact:file-attached', { file });
    }

    /**
     * Handle visibility change
     */
    handleVisibilityChange() {
        if (this.isVisible) {
            console.log('📧 Contact section is visible');
            this.dispatchEvent('contact:visible');
        } else {
            console.log('📧 Contact section is hidden');
            this.dispatchEvent('contact:hidden');
        }
    }

    /**
     * Handle theme change
     */
    handleThemeChange(event) {
        const { theme } = event.detail;
        
        // Update form styles based on theme
        this.formFields.forEach((fieldData) => {
            const field = fieldData.element;
            if (theme === 'dark') {
                field.style.backgroundColor = 'var(--color-dark-100)';
                field.style.borderColor = 'var(--color-dark-200)';
                field.style.color = 'var(--color-dark-900)';
            } else {
                field.style.backgroundColor = 'var(--bg-primary)';
                field.style.borderColor = 'var(--border-light)';
                field.style.color = 'var(--text-primary)';
            }
        });
    }

    /**
     * Utility: Debounce function
     */
    debounce(func, wait) {
        let timeout;
        
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
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
            isSubmitting: this.isSubmitting,
            isValid: this.isValid,
            isDirty: this.isDirty,
            hasInteracted: this.hasInteracted,
            submitAttempted: this.submitAttempted,
            fieldCount: this.formFields.size,
            errorCount: Object.keys(this.validationErrors).length,
            lastAutoSave: this.lastAutoSave
        };
    }

    /**
     * Get form data
     */
    getFormData() {
        const data = {};
        
        this.formFields.forEach((fieldData, fieldName) => {
            if (fieldData.element.type === 'checkbox') {
                data[fieldName] = fieldData.element.checked;
            } else {
                data[fieldName] = fieldData.value;
            }
        });
        
        return data;
    }

    /**
     * Set form data programmatically
     */
    setFormData(data) {
        Object.entries(data).forEach(([fieldName, value]) => {
            const fieldData = this.formFields.get(fieldName);
            if (fieldData) {
                if (fieldData.element.type === 'checkbox') {
                    fieldData.element.checked = Boolean(value);
                } else {
                    fieldData.element.value = value;
                    fieldData.value = value;
                }
                
                this.formData[fieldName] = value;
            }
        });
        
        // Revalidate all fields
        this.validateAllFields();
    }

    /**
     * Clear form
     */
    clearForm() {
        this.contactForm.reset();
        this.resetFormState();
        this.clearSavedFormData();
        
        // Clear visual states
        this.formFields.forEach((fieldData) => {
            fieldData.element.classList.remove('error', 'typing');
            fieldData.element.style.transform = '';
            fieldData.element.style.borderColor = '';
            fieldData.element.style.boxShadow = '';
        });
        
        // Hide status
        if (this.statusElement) {
            this.statusElement.style.display = 'none';
        }
    }

    /**
     * Validate form programmatically
     */
    validateForm() {
        return this.validateAllFields();
    }

    /**
     * Submit form programmatically
     */
    submitFormProgrammatically() {
        if (this.validateAllFields()) {
            return this.submitForm();
        } else {
            throw new Error('Form validation failed');
        }
    }

    /**
     * Focus specific field
     */
    focusField(fieldName) {
        const fieldData = this.formFields.get(fieldName);
        if (fieldData) {
            fieldData.element.focus();
        }
    }

    /**
     * Highlight field with error
     */
    highlightFieldError(fieldName, message) {
        this.showFieldError(fieldName, message);
        this.focusField(fieldName);
    }

    /**
     * Get validation errors
     */
    getValidationErrors() {
        return { ...this.validationErrors };
    }

    /**
     * Check if field is valid
     */
    isFieldValid(fieldName) {
        const fieldData = this.formFields.get(fieldName);
        return fieldData ? fieldData.isValid : false;
    }

    /**
     * Enable/disable auto-save
     */
    setAutoSave(enabled) {
        this.options.autoSave = enabled;
        
        if (enabled) {
            this.setupAutoSave();
        }
    }

    /**
     * Enable/disable real-time validation
     */
    setRealTimeValidation(enabled) {
        this.options.enableRealTimeValidation = enabled;
    }

    /**
     * Update field configuration
     */
    updateFieldConfig(fieldName, config) {
        if (this.fieldConfig[fieldName]) {
            this.fieldConfig[fieldName] = { ...this.fieldConfig[fieldName], ...config };
            
            // Update in formFields
            const fieldData = this.formFields.get(fieldName);
            if (fieldData) {
                fieldData.config = this.fieldConfig[fieldName];
            }
        }
    }

    /**
     * Add custom validation rule
     */
    addCustomValidation(fieldName, validator, errorMessage) {
        const fieldData = this.formFields.get(fieldName);
        if (fieldData) {
            fieldData.customValidator = validator;
            fieldData.customErrorMessage = errorMessage;
        }
    }

    /**
     * Remove custom validation rule
     */
    removeCustomValidation(fieldName) {
        const fieldData = this.formFields.get(fieldName);
        if (fieldData) {
            delete fieldData.customValidator;
            delete fieldData.customErrorMessage;
        }
    }

    /**
     * Get form statistics
     */
    getFormStatistics() {
        const totalFields = this.formFields.size;
        const validFields = Array.from(this.formFields.values()).filter(f => f.isValid).length;
        const completionPercentage = totalFields > 0 ? (validFields / totalFields) * 100 : 0;
        
        return {
            totalFields,
            validFields,
            invalidFields: totalFields - validFields,
            completionPercentage: Math.round(completionPercentage),
            hasInteracted: this.hasInteracted,
            isDirty: this.isDirty,
            submitAttempted: this.submitAttempted
        };
    }

    /**
     * Export form data
     */
    exportFormData() {
        return {
            formData: this.getFormData(),
            validationErrors: this.getValidationErrors(),
            statistics: this.getFormStatistics(),
            timestamp: Date.now()
        };
    }

    /**
     * Import form data
     */
    importFormData(exportedData) {
        if (exportedData.formData) {
            this.setFormData(exportedData.formData);
        }
    }

    /**
     * Cleanup component
     */
    destroy() {
        console.log('🧹 Destroying Contact component...');
        
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
        
        // Clear timers
        if (this.typingTimer) {
            clearTimeout(this.typingTimer);
        }
        
        // Remove event listeners
        if (this.contactForm) {
            this.contactForm.removeEventListener('submit', this.handleFormSubmit);
        }
        
        this.formFields.forEach((fieldData) => {
            const field = fieldData.element;
            field.removeEventListener('input', this.handleFieldInput);
            field.removeEventListener('blur', this.handleFieldBlur);
            field.removeEventListener('focus', this.handleFieldFocus);
        });
        
        // Reset form state
        this.clearForm();
        
        console.log('🧹 Contact component destroyed');
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ContactComponent };
}

// Export for ES6 modules
export { ContactComponent };

/*
===============================================
END CONTACT.JS
Complete contact component with:
- Advanced form validation
- Real-time validation
- Auto-save functionality
- Visual feedback and animations
- Accessibility support
- File upload handling
- Progress indicators
- Error handling
- Theme integration
- Mobile optimization
===============================================
*/