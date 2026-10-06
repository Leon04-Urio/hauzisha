// Modern Loading Manager - Airbnb-style Loading Experience

class LoadingManager {
    constructor() {
        this.loadingStates = new Map();
        this.init();
    }

    init() {
        // Add skeleton CSS if not already added
        if (!document.getElementById('skeleton-css')) {
            const link = document.createElement('link');
            link.id = 'skeleton-css';
            link.rel = 'stylesheet';
            link.href = 'css/skeleton-loading.css';
            document.head.appendChild(link);
        }
    }

    // Show skeleton for property cards
    showPropertyCardsSkeleton(container, count = 6) {
        const skeletonHTML = Array(count).fill().map(() => `
            <div class="property-card-skeleton">
                <div class="skeleton-image skeleton-dark"></div>
                <div class="skeleton-content">
                    <div class="skeleton-title skeleton-dark"></div>
                    <div class="skeleton-text skeleton-dark"></div>
                    <div class="skeleton-text skeleton-dark"></div>
                    <div class="skeleton-price skeleton-dark"></div>
                </div>
            </div>
        `).join('');

        if (typeof container === 'string') {
            container = document.getElementById(container) || document.querySelector(container);
        }
        
        if (container) {
            container.innerHTML = skeletonHTML;
            container.classList.add('loading-skeleton');
        }
    }

    // Show skeleton for property details
    showPropertyDetailsSkeleton(container) {
        const skeletonHTML = `
            <div class="property-details-skeleton">
                <!-- Hero Skeleton -->
                <div class="property-hero-skeleton skeleton-dark"></div>
                
                <!-- Gallery Skeleton -->
                <div class="gallery-skeleton">
                    <div class="gallery-hero-skeleton"></div>
                    <div class="gallery-thumbs-skeleton">
                        <div class="gallery-thumb-skeleton"></div>
                        <div class="gallery-thumb-skeleton"></div>
                        <div class="gallery-thumb-skeleton"></div>
                        <div class="gallery-thumb-skeleton"></div>
                        <div class="gallery-thumb-skeleton"></div>
                        <div class="gallery-thumb-skeleton"></div>
                    </div>
                </div>
                
                <!-- Info Sections Skeleton -->
                <div class="property-info-skeleton">
                    <div class="skeleton-section">
                        <div class="skeleton-heading skeleton-dark"></div>
                        <div class="skeleton-paragraph skeleton-dark"></div>
                        <div class="skeleton-paragraph skeleton-dark"></div>
                        <div class="skeleton-paragraph skeleton-dark"></div>
                    </div>
                    
                    <div class="skeleton-section">
                        <div class="skeleton-heading skeleton-dark"></div>
                        <div class="skeleton-paragraph skeleton-dark"></div>
                        <div class="skeleton-paragraph skeleton-dark"></div>
                    </div>
                    
                    <div class="skeleton-section">
                        <div class="skeleton-heading skeleton-dark"></div>
                        <div class="skeleton-paragraph skeleton-dark"></div>
                        <div class="skeleton-paragraph skeleton-dark"></div>
                        <div class="skeleton-paragraph skeleton-dark"></div>
                    </div>
                </div>
            </div>
        `;

        if (typeof container === 'string') {
            container = document.getElementById(container) || document.querySelector(container);
        }
        
        if (container) {
            container.innerHTML = skeletonHTML;
            container.classList.add('loading-skeleton');
        }
    }

    // Show skeleton for featured properties
    showFeaturedSkeleton(container, count = 6) {
        const skeletonHTML = `
            <div class="featured-skeleton">
                ${Array(count).fill().map(() => `
                    <div class="featured-card-skeleton"></div>
                `).join('')}
            </div>
        `;

        if (typeof container === 'string') {
            container = document.getElementById(container) || document.querySelector(container);
        }
        
        if (container) {
            container.innerHTML = skeletonHTML;
            container.classList.add('loading-skeleton');
        }
    }

    // Show content with smooth transition
    showContent(container, content, fadeIn = true) {
        if (typeof container === 'string') {
            container = document.getElementById(container) || document.querySelector(container);
        }
        
        if (container) {
            container.classList.remove('loading-skeleton');
            container.innerHTML = content;
            
            if (fadeIn) {
                container.classList.add('fade-in');
            }
            
            // Mark as loaded
            container.classList.add('content-loaded');
        }
    }

    // Progressive loading for images
    setupProgressiveImages(container) {
        if (typeof container === 'string') {
            container = document.getElementById(container) || document.querySelector(container);
        }

        const images = container?.querySelectorAll('img[data-src]') || [];
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const placeholder = img.previousElementSibling;
                    
                    img.src = img.dataset.src;
                    img.onload = () => {
                        img.classList.add('fade-in');
                        if (placeholder && placeholder.classList.contains('skeleton')) {
                            placeholder.style.display = 'none';
                        }
                    };
                    
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    // Smart loading with retry
    async loadWithRetry(loadFunction, maxRetries = 3, delay = 1000) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await loadFunction();
            } catch (error) {
                console.warn(`Loading attempt ${i + 1} failed:`, error);
                if (i === maxRetries - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
            }
        }
    }

    // Preload critical resources
    preloadCriticalResources(resources) {
        resources.forEach(resource => {
            if (resource.type === 'image') {
                const img = new Image();
                img.src = resource.url;
            } else if (resource.type === 'fetch') {
                fetch(resource.url).catch(() => {}); // Silent preload
            }
        });
    }

    // Show minimal loading for fast operations
    showMinimalLoading(container, message = 'Loading...') {
        if (typeof container === 'string') {
            container = document.getElementById(container) || document.querySelector(container);
        }
        
        if (container) {
            container.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; padding: 2rem; color: #999;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <div style="width: 16px; height: 16px; border: 2px solid #333; border-top: 2px solid #ff7b00; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                        <span style="font-size: 0.9rem;">${message}</span>
                    </div>
                </div>
                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            `;
        }
    }
}

// Global instance
window.loadingManager = new LoadingManager();

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoadingManager;
}