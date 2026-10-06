/**
 * Property Cache Manager
 * Prevents page reload flashing by caching property data and images
 */

// Cache configuration
const CACHE_CONFIG = {
    PROPERTY_DATA_KEY: 'loft_property_data',
    PROPERTY_IMAGES_KEY: 'loft_property_images',
    CACHE_DURATION: 30 * 60 * 1000, // 30 minutes
    MAX_CACHED_IMAGES: 100
};

// In-memory cache for instant access
const memoryCache = {
    properties: null,
    images: new Map(),
    timestamp: null
};

// Property Data Cache
const PropertyCache = {
    // Save properties to cache
    save(properties) {
        try {
            const cacheData = {
                properties: properties,
                timestamp: Date.now()
            };
            
            // Save to sessionStorage (persists during session, cleared on tab close)
            sessionStorage.setItem(CACHE_CONFIG.PROPERTY_DATA_KEY, JSON.stringify(cacheData));
            
            // Save to memory cache
            memoryCache.properties = properties;
            memoryCache.timestamp = Date.now();
            
            console.log(`Cached ${properties.length} properties`);
        } catch (e) {
            console.warn('Failed to cache properties:', e);
        }
    },
    
    // Load properties from cache
    load() {
        // Try memory cache first (fastest)
        if (memoryCache.properties && this.isValid(memoryCache.timestamp)) {
            console.log('Loaded properties from memory cache');
            return memoryCache.properties;
        }
        
        // Try sessionStorage
        try {
            const cached = sessionStorage.getItem(CACHE_CONFIG.PROPERTY_DATA_KEY);
            if (cached) {
                const cacheData = JSON.parse(cached);
                if (this.isValid(cacheData.timestamp)) {
                    // Restore to memory cache
                    memoryCache.properties = cacheData.properties;
                    memoryCache.timestamp = cacheData.timestamp;
                    console.log('Loaded properties from sessionStorage');
                    return cacheData.properties;
                }
            }
        } catch (e) {
            console.warn('Failed to load cached properties:', e);
        }
        
        return null;
    },
    
    // Check if cache is still valid
    isValid(timestamp) {
        if (!timestamp) return false;
        return (Date.now() - timestamp) < CACHE_CONFIG.CACHE_DURATION;
    },
    
    // Clear cache
    clear() {
        sessionStorage.removeItem(CACHE_CONFIG.PROPERTY_DATA_KEY);
        memoryCache.properties = null;
        memoryCache.timestamp = null;
        console.log('Property cache cleared');
    }
};

// Image Cache Manager
const ImageCache = {
    // Preload and cache an image
    preload(url) {
        return new Promise((resolve, reject) => {
            // Check memory cache first
            if (memoryCache.images.has(url)) {
                resolve(url);
                return;
            }
            
            const img = new Image();
            img.onload = () => {
                // Store in memory cache
                memoryCache.images.set(url, true);
                resolve(url);
            };
            img.onerror = () => reject(url);
            img.src = url;
        });
    },
    
    // Preload multiple images
    async preloadBatch(urls) {
        const uniqueUrls = [...new Set(urls)].slice(0, CACHE_CONFIG.MAX_CACHED_IMAGES);
        console.log(`Preloading ${uniqueUrls.length} images...`);
        
        const promises = uniqueUrls.map(url => 
            this.preload(url).catch(err => console.warn('Failed to preload:', url))
        );
        
        await Promise.allSettled(promises);
        console.log('Image preloading complete');
    },
    
    // Check if image is cached
    isCached(url) {
        return memoryCache.images.has(url);
    },
    
    // Clear image cache
    clear() {
        memoryCache.images.clear();
        console.log('Image cache cleared');
    }
};

// Fetch properties with caching
async function fetchPropertiesWithCache(apiUrl, forceRefresh = false) {
    // Try cache first unless force refresh
    if (!forceRefresh) {
        const cached = PropertyCache.load();
        if (cached) {
            // Return cached data immediately
            return { data: cached, fromCache: true };
        }
    }
    
    // Fetch from API
    try {
        const response = await fetch(apiUrl);
        const result = await response.json();
        const properties = Array.isArray(result.data) ? result.data : [];
        
        // Cache the data
        PropertyCache.save(properties);
        
        // Preload images in background
        const imageUrls = extractImageUrls(properties);
        ImageCache.preloadBatch(imageUrls);
        
        return { data: properties, fromCache: false };
    } catch (error) {
        console.error('Failed to fetch properties:', error);
        
        // Try to return stale cache as fallback
        const cached = PropertyCache.load();
        if (cached) {
            console.warn('Using stale cache due to fetch error');
            return { data: cached, fromCache: true, stale: true };
        }
        
        throw error;
    }
}

// Extract image URLs from properties
function extractImageUrls(properties) {
    const urls = [];
    const basePath = 'http://localhost/loft-studio';
    
    properties.forEach(property => {
        // Parse gallery
        let gallery = property.gallery;
        if (typeof gallery === 'string') {
            try {
                gallery = JSON.parse(gallery);
            } catch (e) {
                gallery = [];
            }
        }
        
        // Add gallery images
        if (Array.isArray(gallery)) {
            gallery.forEach(img => {
                if (img) {
                    urls.push(`${basePath}${img.replace(/\\/g, '')}`);
                }
            });
        }
        
        // Add hero image if exists
        if (property.hero_image) {
            urls.push(`${basePath}${property.hero_image}`);
        }
    });
    
    return urls;
}

// BFCache optimization - prevent page from being excluded from BFCache
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        // Page was restored from BFCache
        console.log('Page restored from BFCache');
        
        // Refresh any dynamic content if needed
        if (typeof updateFavoriteIcons === 'function') {
            updateFavoriteIcons();
        }
    }
});

// Prevent BFCache exclusion
window.addEventListener('beforeunload', () => {
    // Don't do anything that would prevent BFCache
    // No unload handlers, no open connections
});

// Export functions
window.PropertyCache = PropertyCache;
window.ImageCache = ImageCache;
window.fetchPropertiesWithCache = fetchPropertiesWithCache;

console.log('Property cache manager loaded');
