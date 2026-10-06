/**
 * Property Gallery System with WebP Support
 * Handles lazy loading, modal gallery, and category-based display
 */

class PropertyGallery {
    constructor(propertyId) {
        this.propertyId = propertyId;
        this.images = [];
        this.currentImageIndex = 0;
        this.modalOpen = false;
        this.BASE_API = window.APP_CONFIG ? window.APP_CONFIG.API_URL : 'http://localhost/hauzisha/api/index.php';
    }

    /**
     * Load property images from API
     */
    async loadImages() {
        try {
            const response = await fetch(`${this.BASE_API}/property-images/${this.propertyId}`);
            const result = await response.json();
            
            if (result.success) {
                // Transform the data to match expected format
                const rawImages = result.data || [];
                this.images = rawImages.map(img => ({
                    id: img.id,
                    category: img.category,
                    is_hero: img.is_hero,
                    order_index: img.order_index,
                    thumbnail_url: img.urls?.thumb || img.thumbnail_url,
                    md_url: img.urls?.md || img.md_url,
                    full_url: img.urls?.full || img.full_url
                }));
                return this.images;
            } else {
                console.error('Failed to load images:', result.message);
                return [];
            }
        } catch (error) {
            console.error('Error loading property images:', error);
            return [];
        }
    }

    /**
     * Render main gallery grid (hero + 6 thumbnails)
     */
    renderMainGallery(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const heroImage = this.images.find(img => img.category === 'hero') || this.images[0];
        const additionalImages = this.images.filter(img => img.id !== heroImage?.id).slice(0, 6);
        
        const totalImages = this.images.length;

        container.innerHTML = `
            <div class="property-gallery-grid">
                <!-- Left: Hero Image -->
                <div class="gallery-hero" onclick="propertyGallery.openModal(0)">
                    <img 
                        src="${heroImage?.thumbnail_url || '/images/placeholder.jpg'}" 
                        data-full="${heroImage?.full_url}"
                        data-md="${heroImage?.md_url}"
                        alt="Property Hero Image"
                        class="gallery-hero-img lazy-load"
                        loading="lazy">
                </div>
                
                <!-- Right: Thumbnails Grid + Button -->
                <div class="gallery-right-section">
                    <div class="gallery-thumbnails">
                        ${additionalImages.map((img, index) => `
                            <div class="gallery-thumb-item" onclick="propertyGallery.openModal(${index + 1})">
                                <img 
                                    src="${img.thumbnail_url}" 
                                    data-full="${img.full_url}"
                                    data-md="${img.md_url}"
                                    alt="${img.category}"
                                    class="gallery-thumb-img lazy-load"
                                    loading="lazy">
                                ${index === 5 && totalImages > 7 ? `
                                    <div class="gallery-overlay">
                                        <span class="gallery-more-text">+${totalImages - 7} more</span>
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                    
                    <!-- Show All Photos Button (floats at bottom) -->
                    <button class="show-all-photos-btn" onclick="propertyGallery.openModal(0)">
                        <i class="fas fa-images"></i> Show all ${totalImages} photos
                    </button>
                </div>
            </div>
        `;

        // Initialize lazy loading
        this.initLazyLoad();
    }

    /**
     * Initialize lazy loading for images
     */
    initLazyLoad() {
        const lazyImages = document.querySelectorAll('.lazy-load');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const mdSrc = img.dataset.md;
                    
                    // Upgrade from thumbnail to medium size
                    if (mdSrc && img.src !== mdSrc) {
                        const tempImg = new Image();
                        tempImg.onload = () => {
                            img.src = mdSrc;
                        };
                        tempImg.src = mdSrc;
                    }
                    
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px'
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    }

    /**
     * Open modal gallery - Use the improved photo-tour modal with categories
     */
    openModal(startIndex = 0) {
        this.currentImageIndex = startIndex;
        this.modalOpen = true;
        
        // Use the photo-tour modal instead of creating a new one
        const overlay = document.getElementById("photo-tour-overlay");
        const content = document.getElementById("photo-tour-content");
        
        if (!overlay || !content) {
            console.error('Photo tour modal not found');
            return;
        }
        
        // Group images by category and render with clean sections
        const groupedImages = this.groupByCategory();
        const categoryOrder = ['hero', 'livingroom', 'kitchen', 'bedroom1', 'bedroom2', 'bathroom', 'balcony', 'exterior', 'other'];
        
        let html = '';
        
        categoryOrder.forEach(categoryKey => {
            const images = groupedImages[categoryKey];
            if (!images || images.length === 0) return;
            
            const categoryTitle = this.formatCategoryTitle(categoryKey);
            const categoryIcon = this.getCategoryIcon(categoryKey);
            
            html += `
                <div class="photo-category-section">
                    <div class="photo-category-header">
                        ${categoryIcon}
                        <h4 class="photo-category-title">${categoryTitle}</h4>
                        <span class="photo-count">${images.length} photo${images.length > 1 ? 's' : ''}</span>
                    </div>
                    <div class="photo-tour-grid">
                        ${images.map(img => `
                            <img src="${img.thumbnail_url}" 
                                 data-full="${img.full_url}"
                                 alt="${categoryTitle}" 
                                 class="photo-tour-img"
                                 onclick="propertyGallery.viewFullImage('${img.full_url}')">
                        `).join("")}
                    </div>
                </div>
            `;
        });
        
        content.innerHTML = html;
        overlay.classList.add("active");
        document.body.style.overflow = 'hidden';
        
        console.log('Opened photo-tour modal with categories');
    }

    /**
     * Close modal gallery - Use the photo-tour modal
     */
    closeModal() {
        this.modalOpen = false;
        const overlay = document.getElementById("photo-tour-overlay");
        if (overlay) {
            overlay.classList.remove('active');
        }
        document.body.style.overflow = '';
    }

    /**
     * Create modal structure
     */
    createModal() {
        const modalHTML = `
            <div id="propertyGalleryModal" class="property-gallery-modal">
                <div class="gallery-modal-header">
                    <h3 class="gallery-modal-title">Property Photos</h3>
                    <button class="gallery-modal-close" onclick="propertyGallery.closeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="gallery-modal-content" id="galleryModalContent">
                    <!-- Content will be injected here -->
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    /**
     * Render modal content with categories
     */
    renderModalContent() {
        const content = document.getElementById('galleryModalContent');
        if (!content) return;

        // Group images by category
        const groupedImages = this.groupByCategory();
        
        let html = '';
        
        // Hero image section
        const heroImage = this.images.find(img => img.category === 'hero');
        if (heroImage) {
            html += `
                <div class="gallery-category-section">
                    <h3 class="gallery-category-title">
                        <i class="fas fa-star"></i> Hero Image
                    </h3>
                    <div class="gallery-modal-grid">
                        <div class="gallery-modal-item">
                            <img 
                                src="${heroImage.thumbnail_url}" 
                                data-full="${heroImage.full_url}"
                                alt="Hero Image"
                                class="gallery-modal-img"
                                onclick="propertyGallery.viewFullImage('${heroImage.full_url}')">
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Other categories
        Object.keys(groupedImages).forEach(category => {
            if (category === 'hero') return; // Already handled
            
            const images = groupedImages[category];
            const categoryTitle = this.formatCategoryTitle(category);
            
            html += `
                <div class="gallery-category-section">
                    <h3 class="gallery-category-title">
                        ${this.getCategoryIcon(category)} ${categoryTitle}
                    </h3>
                    <div class="gallery-modal-grid">
                        ${images.map(img => `
                            <div class="gallery-modal-item">
                                <img 
                                    src="${img.thumbnail_url}" 
                                    data-full="${img.full_url}"
                                    alt="${category}"
                                    class="gallery-modal-img"
                                    onclick="propertyGallery.viewFullImage('${img.full_url}')">
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });
        
        content.innerHTML = html;
        
        // Lazy load modal images
        this.lazyLoadModalImages();
    }

    /**
     * Group images by category
     */
    groupByCategory() {
        const grouped = {};
        
        this.images.forEach(img => {
            const category = img.category || 'other';
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(img);
        });
        
        // Sort by order_index within each category
        Object.keys(grouped).forEach(category => {
            grouped[category].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
        });
        
        return grouped;
    }

    /**
     * Format category title - Clean and simple
     */
    formatCategoryTitle(category) {
        const titles = {
            'hero': 'Featured Photo',
            'livingroom': 'Living Room',
            'kitchen': 'Kitchen',
            'bedroom1': 'Master Bedroom',
            'bedroom2': 'Bedroom',
            'bedroom3': 'Bedroom',
            'bathroom': 'Bathroom',
            'balcony': 'Balcony',
            'exterior': 'Exterior',
            'other': 'Additional Photos'
        };
        
        return titles[category] || category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1');
    }

    /**
     * Get category icon - Subtle and elegant
     */
    getCategoryIcon(category) {
        const icons = {
            'hero': '<i class="fas fa-star"></i>',
            'livingroom': '<i class="fas fa-couch"></i>',
            'kitchen': '<i class="fas fa-utensils"></i>',
            'bedroom1': '<i class="fas fa-bed"></i>',
            'bedroom2': '<i class="fas fa-bed"></i>',
            'bedroom3': '<i class="fas fa-bed"></i>',
            'bathroom': '<i class="fas fa-bath"></i>',
            'balcony': '<i class="fas fa-tree"></i>',
            'exterior': '<i class="fas fa-building"></i>',
            'other': '<i class="fas fa-images"></i>'
        };
        
        return icons[category] || '<i class="fas fa-image"></i>';
    }

    /**
     * Lazy load modal images
     */
    lazyLoadModalImages() {
        const modalImages = document.querySelectorAll('.gallery-modal-img');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const fullSrc = img.dataset.full;
                    
                    // Load full size image
                    const tempImg = new Image();
                    tempImg.onload = () => {
                        img.src = fullSrc;
                        img.classList.add('loaded');
                    };
                    tempImg.src = fullSrc;
                    
                    observer.unobserve(img);
                }
            });
        }, {
            root: document.getElementById('galleryModalContent'),
            rootMargin: '100px'
        });

        modalImages.forEach(img => observer.observe(img));
    }

    /**
     * View full image in lightbox with navigation
     */
    viewFullImage(imageUrl) {
        // Find the index of this image
        const imageIndex = this.images.findIndex(img => img.full_url === imageUrl);
        this.currentLightboxIndex = imageIndex >= 0 ? imageIndex : 0;
        
        this.openLightbox();
    }

    /**
     * Open lightbox with navigation
     */
    openLightbox() {
        // Remove existing lightbox if any
        const existing = document.querySelector('.gallery-lightbox');
        if (existing) existing.remove();
        
        const currentImage = this.images[this.currentLightboxIndex];
        
        const lightbox = document.createElement('div');
        lightbox.className = 'gallery-lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-content">
                <button class="lightbox-close" onclick="propertyGallery.closeLightbox()">
                    <i class="fas fa-times"></i>
                </button>
                ${this.images.length > 1 ? `
                    <button class="lightbox-prev" onclick="propertyGallery.prevLightboxImage()">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <button class="lightbox-next" onclick="propertyGallery.nextLightboxImage()">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                ` : ''}
                <img src="${currentImage.full_url}" alt="Full size image" id="lightboxImage">
                <div class="lightbox-counter">${this.currentLightboxIndex + 1} / ${this.images.length}</div>
            </div>
        `;
        
        // Close on background click
        lightbox.onclick = (e) => {
            if (e.target === lightbox) {
                this.closeLightbox();
            }
        };
        
        document.body.appendChild(lightbox);
        
        // Add keyboard navigation
        this.addLightboxKeyboardNav();
        
        // Add touch swipe support
        this.addLightboxSwipeSupport();
    }

    /**
     * Close lightbox
     */
    closeLightbox() {
        const lightbox = document.querySelector('.gallery-lightbox');
        if (lightbox) lightbox.remove();
        
        // Remove keyboard listener
        document.removeEventListener('keydown', this.lightboxKeyHandler);
    }

    /**
     * Navigate to previous image in lightbox
     */
    prevLightboxImage() {
        this.currentLightboxIndex = (this.currentLightboxIndex - 1 + this.images.length) % this.images.length;
        this.updateLightboxImage();
    }

    /**
     * Navigate to next image in lightbox
     */
    nextLightboxImage() {
        this.currentLightboxIndex = (this.currentLightboxIndex + 1) % this.images.length;
        this.updateLightboxImage();
    }

    /**
     * Update lightbox image
     */
    updateLightboxImage() {
        const img = document.getElementById('lightboxImage');
        const counter = document.querySelector('.lightbox-counter');
        
        if (img && this.images[this.currentLightboxIndex]) {
            img.src = this.images[this.currentLightboxIndex].full_url;
            if (counter) {
                counter.textContent = `${this.currentLightboxIndex + 1} / ${this.images.length}`;
            }
        }
    }

    /**
     * Add keyboard navigation
     */
    addLightboxKeyboardNav() {
        this.lightboxKeyHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeLightbox();
            } else if (e.key === 'ArrowLeft') {
                this.prevLightboxImage();
            } else if (e.key === 'ArrowRight') {
                this.nextLightboxImage();
            }
        };
        
        document.addEventListener('keydown', this.lightboxKeyHandler);
    }

    /**
     * Add touch swipe support
     */
    addLightboxSwipeSupport() {
        const lightbox = document.querySelector('.gallery-lightbox');
        if (!lightbox) return;
        
        let touchStartX = 0;
        let touchEndX = 0;
        
        lightbox.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        lightbox.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(touchStartX, touchEndX);
        });
    }

    /**
     * Handle swipe gesture
     */
    handleSwipe(startX, endX) {
        const swipeThreshold = 50;
        const diff = startX - endX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next image
                this.nextLightboxImage();
            } else {
                // Swipe right - previous image
                this.prevLightboxImage();
            }
        }
    }
}

// Global instance
let propertyGallery = null;

// Initialize gallery when property is loaded
async function initPropertyGallery(propertyId) {
    // Wait for config to be available
    if (!window.APP_CONFIG) {
        console.warn('APP_CONFIG not available, waiting...');
        await new Promise(resolve => {
            const checkConfig = () => {
                if (window.APP_CONFIG) {
                    resolve();
                } else {
                    setTimeout(checkConfig, 100);
                }
            };
            checkConfig();
        });
    }
    
    propertyGallery = new PropertyGallery(propertyId);
    await propertyGallery.loadImages();
    propertyGallery.renderMainGallery('propertyGalleryContainer');
}

// Export for use in other scripts
window.PropertyGallery = PropertyGallery;
window.initPropertyGallery = initPropertyGallery;
window.propertyGallery = propertyGallery;
