/**
 * LOFT³ Tour Service Worker
 * Provides advanced caching strategies for 3G network optimization
 */

const CACHE_VERSION = 'loft-tour-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;

// Cache configuration
const CACHE_CONFIG = {
    staticMaxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    dynamicMaxAge: 24 * 60 * 60 * 1000, // 1 day
    imageMaxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
    maxCacheSize: 50 * 1024 * 1024, // 50MB
    maxImageCacheSize: 30 * 1024 * 1024 // 30MB
};

// Static resources to cache immediately
const STATIC_RESOURCES = [
    '/loft-tour/index.html',
    '/loft-tour/css/loft-tour.css',
    '/loft-tour/js/loft-tour-core.js',
    '/loft-tour/js/loft-tour-viewer.js',
    '/loft-tour/js/loft-tour-controls.js',
    '/loft-tour/js/loft-tour-transitions.js',
    '/loft-tour/js/loft-tour-layers.js',
    '/loft-tour/js/loft-tour-mobile-optimization.js',
    '/loft-tour/js/loft-tour-progressive-loader.js',
    '/loft-tour/js/loft-tour-network-optimizer.js',
    '/loft-tour/lib/three.min.js',
    '/loft-tour/lib/marzipano.js'
];

// Network-first resources (always try network first)
const NETWORK_FIRST_PATTERNS = [
    /\/api\//,
    /\.json$/,
    /metadata/
];

// Cache-first resources (serve from cache if available)
const CACHE_FIRST_PATTERNS = [
    /\.js$/,
    /\.css$/,
    /\.html$/
];

// Image patterns for special handling
const IMAGE_PATTERNS = [
    /\.jpg$/i,
    /\.jpeg$/i,
    /\.png$/i,
    /\.webp$/i,
    /panorama/i,
    /layer/i
];

/**
 * Service Worker Installation
 */
self.addEventListener('install', event => {
    console.log('🔧 Service Worker installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('📦 Caching static resources...');
                return cache.addAll(STATIC_RESOURCES);
            })
            .then(() => {
                console.log('✅ Static resources cached');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('❌ Failed to cache static resources:', error);
            })
    );
});

/**
 * Service Worker Activation
 */
self.addEventListener('activate', event => {
    console.log('🚀 Service Worker activating...');
    
    event.waitUntil(
        Promise.all([
            // Clean up old caches
            cleanupOldCaches(),
            // Take control of all clients
            self.clients.claim()
        ]).then(() => {
            console.log('✅ Service Worker activated');
        })
    );
});

/**
 * Fetch Event Handler - Main caching logic
 */
self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip chrome-extension and other non-http requests
    if (!url.protocol.startsWith('http')) {
        return;
    }
    
    // Determine caching strategy based on request
    const strategy = getCachingStrategy(request);
    
    event.respondWith(
        handleRequest(request, strategy)
            .catch(error => {
                console.error('Request handling failed:', error);
                return new Response('Network error', { status: 503 });
            })
    );
});

/**
 * Determine caching strategy for a request
 */
function getCachingStrategy(request) {
    const url = request.url;
    
    // Network-first for API calls and metadata
    if (NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(url))) {
        return 'network-first';
    }
    
    // Special handling for images
    if (IMAGE_PATTERNS.some(pattern => pattern.test(url))) {
        return 'cache-first-image';
    }
    
    // Cache-first for static resources
    if (CACHE_FIRST_PATTERNS.some(pattern => pattern.test(url))) {
        return 'cache-first';
    }
    
    // Default to stale-while-revalidate
    return 'stale-while-revalidate';
}

/**
 * Handle request based on caching strategy
 */
async function handleRequest(request, strategy) {
    switch (strategy) {
        case 'network-first':
            return networkFirst(request);
        case 'cache-first':
            return cacheFirst(request, STATIC_CACHE);
        case 'cache-first-image':
            return cacheFirstImage(request);
        case 'stale-while-revalidate':
            return staleWhileRevalidate(request);
        default:
            return fetch(request);
    }
}

/**
 * Network-first strategy
 */
async function networkFirst(request) {
    try {
        // Try network first
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Cache successful responses
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
        
    } catch (error) {
        // Fallback to cache
        console.log('Network failed, trying cache:', request.url);
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        throw error;
    }
}

/**
 * Cache-first strategy
 */
async function cacheFirst(request, cacheName) {
    // Try cache first
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse && !isCacheExpired(cachedResponse, CACHE_CONFIG.staticMaxAge)) {
        return cachedResponse;
    }
    
    // Fallback to network
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
        
    } catch (error) {
        // Return stale cache if available
        if (cachedResponse) {
            console.log('Network failed, serving stale cache:', request.url);
            return cachedResponse;
        }
        
        throw error;
    }
}

/**
 * Cache-first strategy optimized for images
 */
async function cacheFirstImage(request) {
    // Try cache first
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse && !isCacheExpired(cachedResponse, CACHE_CONFIG.imageMaxAge)) {
        return cachedResponse;
    }
    
    // Network request with optimization for slow connections
    try {
        const networkResponse = await fetchWithOptimization(request);
        
        if (networkResponse.ok) {
            // Cache the image
            const cache = await caches.open(IMAGE_CACHE);
            cache.put(request, networkResponse.clone());
            
            // Cleanup cache if too large
            cleanupImageCache();
        }
        
        return networkResponse;
        
    } catch (error) {
        // Return stale cache if available
        if (cachedResponse) {
            console.log('Network failed, serving stale image cache:', request.url);
            return cachedResponse;
        }
        
        throw error;
    }
}

/**
 * Stale-while-revalidate strategy
 */
async function staleWhileRevalidate(request) {
    const cachedResponse = await caches.match(request);
    
    // Always try to update cache in background
    const networkPromise = fetch(request)
        .then(networkResponse => {
            if (networkResponse.ok) {
                const cache = caches.open(DYNAMIC_CACHE);
                cache.then(c => c.put(request, networkResponse.clone()));
            }
            return networkResponse;
        })
        .catch(error => {
            console.log('Background update failed:', request.url, error);
        });
    
    // Return cached version immediately if available
    if (cachedResponse && !isCacheExpired(cachedResponse, CACHE_CONFIG.dynamicMaxAge)) {
        return cachedResponse;
    }
    
    // Otherwise wait for network
    return networkPromise;
}

/**
 * Fetch with network optimization
 */
async function fetchWithOptimization(request) {
    // Get network information if available
    const connection = navigator.connection;
    let timeout = 10000; // Default 10s timeout
    
    if (connection) {
        // Adjust timeout based on connection type
        switch (connection.effectiveType) {
            case '2g':
            case 'slow-2g':
                timeout = 30000; // 30s for very slow connections
                break;
            case '3g':
                timeout = 20000; // 20s for 3G
                break;
            case '4g':
                timeout = 8000; // 8s for 4G
                break;
        }
    }
    
    // Create request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(request, {
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        return response;
        
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

/**
 * Check if cached response is expired
 */
function isCacheExpired(response, maxAge) {
    const dateHeader = response.headers.get('date');
    if (!dateHeader) return false;
    
    const responseDate = new Date(dateHeader);
    const now = new Date();
    
    return (now - responseDate) > maxAge;
}

/**
 * Clean up old caches
 */
async function cleanupOldCaches() {
    const cacheNames = await caches.keys();
    const oldCaches = cacheNames.filter(name => 
        name.startsWith('loft-tour-') && !name.includes(CACHE_VERSION)
    );
    
    const deletePromises = oldCaches.map(name => {
        console.log('🗑️ Deleting old cache:', name);
        return caches.delete(name);
    });
    
    return Promise.all(deletePromises);
}

/**
 * Clean up image cache if it gets too large
 */
async function cleanupImageCache() {
    try {
        const cache = await caches.open(IMAGE_CACHE);
        const requests = await cache.keys();
        
        // Estimate cache size (rough calculation)
        let estimatedSize = 0;
        const responses = await Promise.all(
            requests.map(async request => {
                const response = await cache.match(request);
                const size = parseInt(response.headers.get('content-length') || '1000000'); // 1MB default
                estimatedSize += size;
                return { request, response, size };
            })
        );
        
        // If cache is too large, remove oldest entries
        if (estimatedSize > CACHE_CONFIG.maxImageCacheSize) {
            console.log('🧹 Image cache too large, cleaning up...');
            
            // Sort by date (oldest first)
            responses.sort((a, b) => {
                const dateA = new Date(a.response.headers.get('date') || 0);
                const dateB = new Date(b.response.headers.get('date') || 0);
                return dateA - dateB;
            });
            
            // Remove oldest entries until under limit
            let currentSize = estimatedSize;
            for (const { request, size } of responses) {
                if (currentSize <= CACHE_CONFIG.maxImageCacheSize * 0.8) break;
                
                await cache.delete(request);
                currentSize -= size;
            }
            
            console.log('✅ Image cache cleanup complete');
        }
        
    } catch (error) {
        console.error('Image cache cleanup failed:', error);
    }
}

/**
 * Handle messages from main thread
 */
self.addEventListener('message', event => {
    const { type, data } = event.data;
    
    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'CLEAR_CACHE':
            clearAllCaches().then(() => {
                event.ports[0].postMessage({ success: true });
            });
            break;
            
        case 'GET_CACHE_INFO':
            getCacheInfo().then(info => {
                event.ports[0].postMessage(info);
            });
            break;
            
        default:
            console.log('Unknown message type:', type);
    }
});

/**
 * Clear all caches
 */
async function clearAllCaches() {
    const cacheNames = await caches.keys();
    const deletePromises = cacheNames
        .filter(name => name.startsWith('loft-tour-'))
        .map(name => caches.delete(name));
    
    return Promise.all(deletePromises);
}

/**
 * Get cache information
 */
async function getCacheInfo() {
    const cacheNames = await caches.keys();
    const loftCaches = cacheNames.filter(name => name.startsWith('loft-tour-'));
    
    const cacheInfo = await Promise.all(
        loftCaches.map(async name => {
            const cache = await caches.open(name);
            const keys = await cache.keys();
            return {
                name,
                entryCount: keys.length
            };
        })
    );
    
    return {
        version: CACHE_VERSION,
        caches: cacheInfo,
        totalCaches: loftCaches.length
    };
}

console.log('🔧 LOFT³ Tour Service Worker loaded');