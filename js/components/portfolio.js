/*
===============================================
PORTFOLIO.JS - Portfolio Section Component
Dynamic portfolio with filtering, masonry grid, and interactive modals
===============================================
*/

/**
 * Portfolio Component Class
 * Manages portfolio section with filtering, animations, and modal interactions
 */
class PortfolioComponent {
    constructor(options = {}) {
        this.options = {
            animationDuration: 400,
            filterTransition: 'fade',
            gridGap: 20,
            enableMasonry: true,
            enableLazyLoading: true,
            enableInfiniteScroll: false,
            itemsPerPage: 12,
            revealDelay: 100,
            hoverScale: 1.05,
            modalAnimationDuration: 300,
            enableKeyboardNavigation: true,
            ...options
        };
        
        // Component state
        this.isInitialized = false;
        this.isVisible = false;
        this.currentFilter = 'all';
        this.filteredItems = [];
        this.allItems = [];
        this.isFiltering = false;
        this.currentPage = 1;
        this.isLoading = false;
        
        // Animation tracking
        this.animationFrames = new Set();
        this.observers = new Set();
        
        // DOM elements
        this.portfolioSection = null;
        this.filterButtons = [];
        this.portfolioGrid = null;
        this.portfolioItems = [];
        this.loadMoreButton = null;
        this.modal = null;
        this.modalContent = null;
        
        // Portfolio data (could be loaded from API)
        this.portfolioData = [];
        
        // Event handlers
        this.handleFilterClick = this.handleFilterClick.bind(this);
        this.handleItemClick = this.handleItemClick.bind(this);
        this.handleModalClose = this.handleModalClose.bind(this);
        this.handleKeydown = this.handleKeydown.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
        
        // Throttled functions
        this.throttledResize = this.throttle(this.handleResize, 250);
        this.throttledScroll = this.throttle(this.handleScroll, 16);
    }

    /**
     * Initialize the portfolio component
     */
    init() {
        console.log('🎨 Initializing Portfolio Component...');
        
        try {
            // Find DOM elements
            this.findElements();
            
            // Load portfolio data
            this.loadPortfolioData();
            
            // Setup intersection observer
            this.setupVisibilityObserver();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Setup filter system
            this.setupFilters();
            
            // Setup grid and items
            this.setupGrid();
            
            // Setup lazy loading
            if (this.options.enableLazyLoading) {
                this.setupLazyLoading();
            }
            
            // Setup modal
            this.setupModal();
            
            // Initialize masonry if enabled
            if (this.options.enableMasonry) {
                this.initializeMasonry();
            }
            
            this.isInitialized = true;
            console.log('✅ Portfolio Component initialized');
            
            // Dispatch ready event
            this.dispatchEvent('portfolio:ready');
            
        } catch (error) {
            console.error('❌ Failed to initialize Portfolio:', error);
        }
    }

    /**
     * Find and cache DOM elements
     */
    findElements() {
        this.portfolioSection = document.getElementById('portfolio') || document.querySelector('.portfolio-section');
        
        if (!this.portfolioSection) {
            throw new Error('Portfolio section not found');
        }
        
        // Find filter buttons
        this.filterButtons = Array.from(this.portfolioSection.querySelectorAll('.filter-btn'));
        
        // Find portfolio grid
        this.portfolioGrid = this.portfolioSection.querySelector('.portfolio-grid');
        
        // Find portfolio items
        this.portfolioItems = Array.from(this.portfolioSection.querySelectorAll('.portfolio-item'));
        
        // Find load more button
        this.loadMoreButton = this.portfolioSection.querySelector('.load-more-btn');
        
        // Find modal
        this.modal = document.getElementById('portfolio-modal');
        this.modalContent = this.modal?.querySelector('.modal-content');
        
        console.log(`🎨 Found ${this.portfolioItems.length} portfolio items, ${this.filterButtons.length} filters`);
    }

    /**
     * Load portfolio data
     */
    loadPortfolioData() {
        // Extract data from DOM items
        this.allItems = this.portfolioItems.map((item, index) => {
            const category = item.getAttribute('data-category') || 'all';
            const title = item.querySelector('.portfolio-title')?.textContent || `Project ${index + 1}`;
            const description = item.querySelector('.portfolio-description')?.textContent || '';
            const image = item.querySelector('img')?.src || '';
            const techTags = Array.from(item.querySelectorAll('.tech-tag')).map(tag => tag.textContent);
            
            return {
                id: index + 1,
                element: item,
                category,
                title,
                description,
                image,
                technologies: techTags,
                visible: true
            };
        });
        
        this.filteredItems = [...this.allItems];
        
        console.log(`📊 Loaded ${this.allItems.length} portfolio items`);
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
            threshold: 0.1,
            rootMargin: '50px'
        });
        
        observer.observe(this.portfolioSection);
        this.observers.add(observer);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Filter button clicks
        this.filterButtons.forEach(button => {
            button.addEventListener('click', this.handleFilterClick);
        });
        
        // Portfolio item clicks
        this.portfolioItems.forEach(item => {
            const viewButton = item.querySelector('[data-action="view"]');
            if (viewButton) {
                viewButton.addEventListener('click', this.handleItemClick);
            }
            
            // Add hover effects
            this.setupItemHoverEffects(item);
        });
        
        // Modal events
        if (this.modal) {
            const closeButton = this.modal.querySelector('.modal-close');
            const overlay = this.modal.querySelector('.modal-overlay');
            
            if (closeButton) {
                closeButton.addEventListener('click', this.handleModalClose);
            }
            
            if (overlay) {
                overlay.addEventListener('click', this.handleModalClose);
            }
        }
        
        // Keyboard events
        if (this.options.enableKeyboardNavigation) {
            document.addEventListener('keydown', this.handleKeydown);
        }
        
        // Resize events
        window.addEventListener('resize', this.throttledResize);
        
        // Scroll events for infinite scroll
        if (this.options.enableInfiniteScroll) {
            window.addEventListener('scroll', this.throttledScroll, { passive: true });
        }
        
        // Load more button
        if (this.loadMoreButton) {
            this.loadMoreButton.addEventListener('click', this.loadMoreItems.bind(this));
        }
        
        // Custom events
        document.addEventListener('theme:change', this.handleThemeChange.bind(this));
    }

    /**
     * Setup filter system
     */
    setupFilters() {
        // Set initial active filter
        const activeFilter = this.filterButtons.find(btn => btn.classList.contains('active'));
        if (activeFilter) {
            this.currentFilter = activeFilter.getAttribute('data-filter') || 'all';
        }
        
        console.log(`🔍 Filter system initialized with '${this.currentFilter}' filter`);
    }

    /**
     * Setup grid layout
     */
    setupGrid() {
        if (!this.portfolioGrid) return;
        
        // Set initial grid styles
        this.portfolioGrid.style.display = 'grid';
        this.portfolioGrid.style.gap = `${this.options.gridGap}px`;
        
        // Setup responsive grid
        this.updateGridLayout();
    }

    /**
     * Update grid layout based on screen size
     */
    updateGridLayout() {
        if (!this.portfolioGrid) return;
        
        const screenWidth = window.innerWidth;
        let columns = 1;
        
        if (screenWidth >= 1200) {
            columns = 3;
        } else if (screenWidth >= 768) {
            columns = 2;
        } else {
            columns = 1;
        }
        
        this.portfolioGrid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    }

    /**
     * Setup lazy loading for images
     */
    setupLazyLoading() {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.getAttribute('data-src');
                    
                    if (src) {
                        img.src = src;
                        img.removeAttribute('data-src');
                        img.classList.add('loaded');
                    }
                    
                    imageObserver.unobserve(img);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });
        
        // Observe all images with data-src
        const lazyImages = this.portfolioSection.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => imageObserver.observe(img));
        
        this.observers.add(imageObserver);
    }

    /**
     * Setup modal functionality
     */
    setupModal() {
        if (!this.modal) return;
        
        // Setup focus trap
        this.setupModalFocusTrap();
        
        console.log('🖼️ Modal system initialized');
    }

    /**
     * Setup modal focus trap for accessibility
     */
    setupModalFocusTrap() {
        const focusableElements = [
            'button:not([disabled])',
            'a[href]',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])'
        ];
        
        this.modalFocusableElements = () => {
            return Array.from(this.modal.querySelectorAll(focusableElements.join(', ')))
                .filter(el => el.offsetParent !== null);
        };
    }

    /**
     * Setup hover effects for portfolio items
     */
    setupItemHoverEffects(item) {
        const image = item.querySelector('.portfolio-image img');
        const overlay = item.querySelector('.portfolio-overlay');
        
        item.addEventListener('mouseenter', () => {
            item.style.transform = `translateY(-8px) scale(${this.options.hoverScale})`;
            item.style.transition = `transform ${this.options.animationDuration}ms ease`;
            
            if (image) {
                image.style.transform = 'scale(1.1)';
                image.style.transition = `transform ${this.options.animationDuration}ms ease`;
            }
            
            if (overlay) {
                overlay.style.opacity = '1';
            }
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'translateY(0) scale(1)';
            
            if (image) {
                image.style.transform = 'scale(1)';
            }
            
            if (overlay) {
                overlay.style.opacity = '0';
            }
        });
    }

    /**
     * Initialize masonry layout
     */
    initializeMasonry() {
        // Simple masonry implementation
        this.updateMasonryLayout();
    }

    /**
     * Update masonry layout
     */
    updateMasonryLayout() {
        if (!this.options.enableMasonry || !this.portfolioGrid) return;
        
        const items = this.portfolioGrid.children;
        const gap = this.options.gridGap;
        const columns = this.getColumnCount();
        const columnHeights = new Array(columns).fill(0);
        
        Array.from(items).forEach((item, index) => {
            if (!item.classList.contains('hidden')) {
                const columnIndex = index % columns;
                const x = columnIndex * (item.offsetWidth + gap);
                const y = columnHeights[columnIndex];
                
                item.style.position = 'absolute';
                item.style.left = `${x}px`;
                item.style.top = `${y}px`;
                
                columnHeights[columnIndex] += item.offsetHeight + gap;
            }
        });
        
        // Set container height
        const maxHeight = Math.max(...columnHeights);
        this.portfolioGrid.style.height = `${maxHeight}px`;
        this.portfolioGrid.style.position = 'relative';
    }

    /**
     * Get current column count
     */
    getColumnCount() {
        const screenWidth = window.innerWidth;
        
        if (screenWidth >= 1200) return 3;
        if (screenWidth >= 768) return 2;
        return 1;
    }

    /**
     * Handle filter button click
     */
    handleFilterClick(event) {
        event.preventDefault();
        
        if (this.isFiltering) return;
        
        const button = event.currentTarget;
        const filter = button.getAttribute('data-filter');
        
        if (filter === this.currentFilter) return;
        
        // Update button states
        this.updateFilterButtons(button);
        
        // Apply filter
        this.applyFilter(filter);
    }

    /**
     * Update filter button states
     */
    updateFilterButtons(activeButton) {
        this.filterButtons.forEach(button => {
            button.classList.remove('active');
        });
        
        activeButton.classList.add('active');
    }

    /**
     * Apply filter to portfolio items
     */
    async applyFilter(filter) {
        if (this.isFiltering) return;
        
        this.isFiltering = true;
        this.currentFilter = filter;
        
        console.log(`🔍 Applying filter: ${filter}`);
        
        // Animate out current items
        await this.animateItemsOut();
        
        // Filter items
        this.filterItems(filter);
        
        // Animate in filtered items
        await this.animateItemsIn();
        
        // Update layout
        if (this.options.enableMasonry) {
            this.updateMasonryLayout();
        } else {
            this.updateGridLayout();
        }
        
        this.isFiltering = false;
        
        // Dispatch event
        this.dispatchEvent('portfolio:filtered', { filter, itemCount: this.filteredItems.length });
    }

    /**
     * Animate items out
     */
    animateItemsOut() {
        return new Promise(resolve => {
            const visibleItems = this.portfolioItems.filter(item => !item.classList.contains('hidden'));
            
            visibleItems.forEach((item, index) => {
                setTimeout(() => {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8) translateY(20px)';
                }, index * 50);
            });
            
            setTimeout(resolve, visibleItems.length * 50 + this.options.animationDuration);
        });
    }

    /**
     * Filter items based on category
     */
    filterItems(filter) {
        this.portfolioItems.forEach(item => {
            const category = item.getAttribute('data-category');
            const shouldShow = filter === 'all' || category === filter;
            
            if (shouldShow) {
                item.classList.remove('hidden');
                item.style.display = 'block';
            } else {
                item.classList.add('hidden');
                item.style.display = 'none';
            }
        });
        
        // Update filtered items array
        this.filteredItems = this.allItems.filter(item => {
            return filter === 'all' || item.category === filter;
        });
    }

    /**
     * Animate items in
     */
    animateItemsIn() {
        return new Promise(resolve => {
            const visibleItems = this.portfolioItems.filter(item => !item.classList.contains('hidden'));
            
            visibleItems.forEach((item, index) => {
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'scale(1) translateY(0)';
                }, index * this.options.revealDelay);
            });
            
            setTimeout(resolve, visibleItems.length * this.options.revealDelay + this.options.animationDuration);
        });
    }

    /**
     * Handle portfolio item click
     */
    handleItemClick(event) {
        event.preventDefault();
        
        const button = event.currentTarget;
        const projectId = button.getAttribute('data-project');
        const item = button.closest('.portfolio-item');
        
        if (projectId && this.modal) {
            this.openModal(projectId, item);
        }
        
        // Dispatch event
        this.dispatchEvent('portfolio:item-clicked', { projectId, item });
    }

    /**
     * Open modal with project details
     */
    openModal(projectId, item) {
        if (!this.modal) return;
        
        console.log(`🖼️ Opening modal for project ${projectId}`);
        
        // Populate modal content
        this.populateModal(projectId, item);
        
        // Show modal
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus first focusable element
        const focusableElements = this.modalFocusableElements();
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
        
        // Dispatch event
        this.dispatchEvent('portfolio:modal-opened', { projectId });
    }

    /**
     * Populate modal with project data
     */
    populateModal(projectId, item) {
        if (!this.modal || !item) return;
        
        // Get project data
        const title = item.querySelector('.portfolio-title')?.textContent || 'Project';
        const description = item.querySelector('.portfolio-description')?.textContent || '';
        const image = item.querySelector('img')?.src || '';
        const techTags = Array.from(item.querySelectorAll('.tech-tag')).map(tag => tag.textContent);
        
        // Update modal content
        const modalTitle = this.modal.querySelector('#modal-title');
        const modalImage = this.modal.querySelector('#modal-image');
        const modalDescription = this.modal.querySelector('#modal-description');
        const modalTechList = this.modal.querySelector('#modal-tech-list');
        
        if (modalTitle) modalTitle.textContent = title;
        if (modalImage) {
            modalImage.src = image;
            modalImage.alt = title;
        }
        if (modalDescription) modalDescription.textContent = description;
        if (modalTechList) {
            modalTechList.innerHTML = techTags.map(tech => 
                `<span class="tech-tag">${tech}</span>`
            ).join('');
        }
        
        // Could populate more fields based on portfolio data structure
    }

    /**
     * Close modal
     */
    handleModalClose(event) {
        event.preventDefault();
        this.closeModal();
    }

    /**
     * Close modal
     */
    closeModal() {
        if (!this.modal) return;
        
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
        
        console.log('🖼️ Modal closed');
        
        // Dispatch event
        this.dispatchEvent('portfolio:modal-closed');
    }

    /**
     * Handle keyboard events
     */
    handleKeydown(event) {
        // Modal keyboard navigation
        if (this.modal && this.modal.classList.contains('active')) {
            switch (event.key) {
                case 'Escape':
                    this.closeModal();
                    break;
                    
                case 'Tab':
                    this.handleModalTabNavigation(event);
                    break;
            }
        }
        
        // Filter keyboard shortcuts
        if (!this.modal?.classList.contains('active')) {
            const key = event.key.toLowerCase();
            const filterMap = {
                '1': 'all',
                '2': 'web',
                '3': 'mobile',
                '4': 'design'
            };
            
            if (filterMap[key]) {
                event.preventDefault();
                const targetButton = this.filterButtons.find(btn => 
                    btn.getAttribute('data-filter') === filterMap[key]
                );
                if (targetButton) {
                    targetButton.click();
                }
            }
        }
    }

    /**
     * Handle tab navigation in modal
     */
    handleModalTabNavigation(event) {
        const focusableElements = this.modalFocusableElements();
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (event.shiftKey) {
            if (document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Update grid layout
        this.updateGridLayout();
        
        // Update masonry if enabled
        if (this.options.enableMasonry) {
            this.updateMasonryLayout();
        }
    }

    /**
     * Handle scroll for infinite loading
     */
    handleScroll() {
        if (!this.options.enableInfiniteScroll || this.isLoading) return;
        
        const scrollTop = window.pageYOffset;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        // Check if near bottom
        if (scrollTop + windowHeight >= documentHeight - 1000) {
            this.loadMoreItems();
        }
    }

    /**
     * Load more items (for infinite scroll)
     */
    async loadMoreItems() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        
        console.log('📄 Loading more portfolio items...');
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Would load more items from API here
        
        this.isLoading = false;
        
        // Dispatch event
        this.dispatchEvent('portfolio:items-loaded');
    }

    /**
     * Handle visibility change
     */
    handleVisibilityChange() {
        if (this.isVisible) {
            console.log('🎨 Portfolio section is visible');
            this.dispatchEvent('portfolio:visible');
        } else {
            console.log('🎨 Portfolio section is hidden');
            this.dispatchEvent('portfolio:hidden');
        }
    }

    /**
     * Handle theme change
     */
    handleThemeChange(event) {
        const { theme } = event.detail;
        
        // Update portfolio item styles based on theme
        this.portfolioItems.forEach(item => {
            if (theme === 'dark') {
                item.style.backgroundColor = 'var(--color-dark-100)';
                item.style.borderColor = 'var(--color-dark-200)';
            } else {
                item.style.backgroundColor = 'var(--bg-primary)';
                item.style.borderColor = 'var(--border-light)';
            }
        });
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
            currentFilter: this.currentFilter,
            totalItems: this.allItems.length,
            filteredItems: this.filteredItems.length,
            isFiltering: this.isFiltering,
            currentPage: this.currentPage,
            isLoading: this.isLoading
        };
    }

    /**
     * Set filter programmatically
     */
    setFilter(filter) {
        const targetButton = this.filterButtons.find(btn => 
            btn.getAttribute('data-filter') === filter
        );
        
        if (targetButton) {
            targetButton.click();
        }
    }

    /**
     * Refresh portfolio layout
     */
    refreshLayout() {
        if (this.options.enableMasonry) {
            this.updateMasonryLayout();
        } else {
            this.updateGridLayout();
        }
    }

    /**
     * Cleanup component
     */
    destroy() {
        console.log('🧹 Destroying Portfolio component...');
        
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
        this.filterButtons.forEach(button => {
            button.removeEventListener('click', this.handleFilterClick);
        });
        
        document.removeEventListener('keydown', this.handleKeydown);
        window.removeEventListener('resize', this.throttledResize);
        window.removeEventListener('scroll', this.throttledScroll);
        
        // Close modal if open
        if (this.modal && this.modal.classList.contains('active')) {
            this.closeModal();
        }
        
        // Reset item styles
        this.portfolioItems.forEach(item => {
            item.style.transform = '';
            item.style.opacity = '';
            item.style.transition = '';
        });
        
        console.log('🧹 Portfolio component destroyed');
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PortfolioComponent };
}

// Export for ES6 modules
export { PortfolioComponent };

/*
===============================================
END PORTFOLIO.JS
Complete portfolio component with:
- Dynamic filtering system
- Masonry grid layout
- Interactive modals
- Lazy loading
- Hover animations
- Keyboard navigation
- Infinite scroll support
- Accessibility features
- Performance optimization
===============================================
*/