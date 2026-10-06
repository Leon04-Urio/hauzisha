/**
 * LOFT³ Network Optimizer
 * Implements 3G network optimization and advanced caching strategies
 */

class NetworkOptimizer {
    constructor(config = {}) {
        this.config = {
            // Network detection thresholds
            slowNetworkThreshold: 1.5, // Mbps
            fastNetworkThreshold: 10, // Mbps
            
            // Cache configuration
            enableServiceWorker: true,
            cacheVersion: 'loft-tour-v1',
            maxCacheAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            maxCacheSize: 50 * 1024 * 1024, // 50MB
            
            // 3G optimization settings
            enable3GOptimization: true,
            adaptiveQuality: true,
            prefetchStrategy: 'smart', // 'aggressive', 'smart', 'conservative'
            
            // Bandwidth management
            bandwidthBudget: 5 * 1024 * 1024, // 5MB per session
            priorityLoading: true,
            
            ...config
        };
        
        // State management
        this.networkInfo = null;
        this.cacheManager = null;
        this.bandwidthUsed = 0;
        this.sessionStartTime = Date.now();
        
        // Performance tracking
        this.stats = {
            networkType: 'unknown',
            effectiveType: 'unknown',
            downlink: 0,
            rtt: 0,
            saveData: false,
            cacheHits: 0,
            cacheMisses: 0,
            bytesTransferred: 0,
            bytesSaved: 0,
            optimizationsApplied: []
        };
        
        this.init();
    }
    
    /**
     * Initialize network optimizer
     */
    async init() {
        try {
            // Detect network capabilities
            this.detectNetworkCapabilities();
            
            // Initialize service worker cache
            if (this.config.enableServiceWorker) {
                await this.initServiceWorkerCache();
            }
            
            // Initialize cache manager
            this.initCacheManager();
            
            // Setup network monitoring
            this.setupNetworkMonitoring();
            
            // Apply initial optimizations
            this.applyNetworkOptimizations();
            
            console.log('🌐 Network Optimizer initialized:', {
                networkType: this.stats.networkType,
                effectiveType: this.stats.effectiveType,
                downlink: this.stats.downlink,
                cacheEnabled: !!this.cacheManager
            });
            
        } catch (error) {
            console.error('Failed to initialize Network Optimizer:', error);
        }
    }
    
    /**
     * Detect network capabilities and connection quality
     */
    detectNetworkCapabilities() {
        if (navigator.connection) {
            const connection = navigator.connection;
            
            this.networkInfo = {
                type: connection.type || 'unknown',
                effectiveType: connection.effectiveType || 'unknown',
                downlink: connection.downlink || 0,
                rtt: connection.rtt || 0,
                saveData: connection.saveData || false
            };
            
            // Update stats
            this.stats.networkType = this.networkInfo.type;
            this.stats.effectiveType = this.networkInfo.effectiveType;
            this.stats.downlink = this.networkInfo.downlink;
            this.stats.rtt = this.networkInfo.rtt;
            this.stats.saveData = this.networkInfo.saveData;
            
        } else {
            // Fallback detection
            this.networkInfo = {
                type: 'unknown',
                effectiveType: 'unknown',
                downlink: 0,
                rtt: 0,
                saveData: false
            };
            
            console.warn('Network Information API not supported, using fallback detection');
        }
        
        // Classify network speed
        this.networkSpeed = this.classifyNetworkSpeed();
        
        console.log('📡 Network detected:', {
            ...this.networkInfo,
            speed: this.networkSpeed
        });
    }
    
    /**
     * Classify network speed based on connection info
     */
    classifyNetworkSpeed() {
        const effectiveType = this.networkInfo.effectiveType;
        const downlink = this.networkInfo.downlink;
        
        // Use effective type as primary indicator
        if (effectiveType === '2g' || effectiveType === 'slow-2g') {
            return 'very-slow';
        } else if (effectiveType === '3g') {
            return 'slow';
        } else if (effectiveType === '4g') {
            // Further classify 4G based on downlink
            if (downlink < this.config.slowNetworkThreshold) {
                return 'moderate';
            } else if (downlink < this.config.fastNetworkThreshold) {
                return 'fast';
            } else {
                return 'very-fast';
            }
        }
        
        // Fallback to downlink-based classification
        if (downlink > 0) {
            if (downlink < 0.5) return 'very-slow';
            if (downlink < 1.5) return 'slow';
            if (downlink < 5) return 'moderate';
            if (downlink < 10) return 'fast';
            return 'very-fast';
        }
        
        return 'unknown';
    }
    
    /**
     * Initialize Service Worker for advanced caching
     */
    async initServiceWorkerCache() {
        if (!('serviceWorker' in navigator)) {
            console.warn('Service Worker not supported');
            return;
        }
        
        try {
            // Try to register service worker, but don't fail if it's not found
            const registration = await navigator.serviceWorker.register('/loft-tour/sw.js');
            console.log('✅ Service Worker registered:', registration);
            
            // Wait for service worker to be ready
            await navigator.serviceWorker.ready;
            
            // Initialize cache through service worker
            this.serviceWorkerReady = true;
            
        } catch (error) {
            // Service worker is optional - don't fail if sw.js is not found
            console.warn('Service Worker registration failed (this is optional):', error.message);
            this.serviceWorkerReady = false;
        }
    }
    
    /**
     * Initialize cache manager
     */
    initCacheManager() {
        this.cacheManager = {
            // Memory cache for frequently accessed items
            memoryCache: new Map(),
            
            // IndexedDB cache for persistent storage
            dbCache: null,
            
            // Cache statistics
            stats: {
                hits: 0,
                misses: 0,
                size: 0
            }
        };
        
        // Initialize IndexedDB cache
        this.initIndexedDBCache();
    }
    
    /**
     * Initialize IndexedDB cache for persistent storage
     */
    async initIndexedDBCache() {
        if (!('indexedDB' in window)) {
            console.warn('IndexedDB not supported');
            return;
        }
        
        try {
            const dbName = 'loft-tour-cache';
            const dbVersion = 1;
            
            const request = indexedDB.open(dbName, dbVersion);
            
            request.onerror = () => {
                console.error('IndexedDB open failed:', request.error);
            };
            
            request.onsuccess = () => {
                this.cacheManager.dbCache = request.result;
                console.log('✅ IndexedDB cache initialized');
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores
                if (!db.objectStoreNames.contains('images')) {
                    const imageStore = db.createObjectStore('images', { keyPath: 'url' });
                    imageStore.createIndex('timestamp', 'timestamp');
                    imageStore.createIndex('size', 'size');
                }
                
                if (!db.objectStoreNames.contains('metadata')) {
                    const metaStore = db.createObjectStore('metadata', { keyPath: 'key' });
                    metaStore.createIndex('timestamp', 'timestamp');
                }
            };
            
        } catch (error) {
            console.error('IndexedDB initialization failed:', error);
        }
    }
    
    /**
     * Setup network monitoring for dynamic optimization
     */
    setupNetworkMonitoring() {
        if (!navigator.connection) return;
        
        const connection = navigator.connection;
        
        // Monitor connection changes
        connection.addEventListener('change', () => {
            console.log('📡 Network connection changed');
            
            // Update network info
            this.detectNetworkCapabilities();
            
            // Reapply optimizations
            this.applyNetworkOptimizations();
            
            // Notify other components
            this.notifyNetworkChange();
        });
        
        // Periodic network quality assessment
        setInterval(() => {
            this.assessNetworkQuality();
        }, 30000); // Every 30 seconds
    }
    
    /**
     * Apply network-specific optimizations
     */
    applyNetworkOptimizations() {
        const optimizations = [];
        
        // 3G-specific optimizations
        if (this.networkSpeed === 'slow' || this.networkSpeed === 'very-slow') {
            optimizations.push(...this.apply3GOptimizations());
        }
        
        // Save Data mode optimizations
        if (this.networkInfo.saveData) {
            optimizations.push(...this.applySaveDataOptimizations());
        }
        
        // High latency optimizations
        if (this.networkInfo.rtt > 300) {
            optimizations.push(...this.applyHighLatencyOptimizations());
        }
        
        // Low bandwidth optimizations
        if (this.networkInfo.downlink < this.config.slowNetworkThreshold) {
            optimizations.push(...this.applyLowBandwidthOptimizations());
        }
        
        this.stats.optimizationsApplied = optimizations;
        
        if (optimizations.length > 0) {
            console.log('🔧 Applied network optimizations:', optimizations);
        }
    }
    
    /**
     * Apply 3G-specific optimizations
     */
    apply3GOptimizations() {
        const optimizations = [];
        
        if (!this.config.enable3GOptimization) return optimizations;
        
        // Reduce image quality
        this.setImageQualityMode('low');
        optimizations.push('low-quality-images');
        
        // Enable aggressive compression
        this.setCompressionMode('aggressive');
        optimizations.push('aggressive-compression');
        
        // Reduce prefetch count
        this.setPrefetchStrategy('conservative');
        optimizations.push('conservative-prefetch');
        
        // Enable request batching
        this.enableRequestBatching(true);
        optimizations.push('request-batching');
        
        // Prioritize critical resources
        this.enableResourcePrioritization(true);
        optimizations.push('resource-prioritization');
        
        return optimizations;
    }
    
    /**
     * Apply Save Data mode optimizations
     */
    applySaveDataOptimizations() {
        const optimizations = [];
        
        // Disable prefetching
        this.setPrefetchStrategy('none');
        optimizations.push('no-prefetch');
        
        // Use lowest quality images
        this.setImageQualityMode('minimal');
        optimizations.push('minimal-quality');
        
        // Disable non-essential features
        this.disableNonEssentialFeatures();
        optimizations.push('disable-non-essential');
        
        return optimizations;
    }
    
    /**
     * Apply high latency optimizations
     */
    applyHighLatencyOptimizations() {
        const optimizations = [];
        
        // Enable connection pooling
        this.enableConnectionPooling(true);
        optimizations.push('connection-pooling');
        
        // Increase request timeout
        this.setRequestTimeout(15000);
        optimizations.push('extended-timeout');
        
        // Enable request retry with backoff
        this.enableRequestRetry(true);
        optimizations.push('request-retry');
        
        return optimizations;
    }
    
    /**
     * Apply low bandwidth optimizations
     */
    applyLowBandwidthOptimizations() {
        const optimizations = [];
        
        // Enable bandwidth throttling
        this.enableBandwidthThrottling(true);
        optimizations.push('bandwidth-throttling');
        
        // Prioritize visible content
        this.enableVisibilityBasedLoading(true);
        optimizations.push('visibility-based-loading');
        
        // Use progressive loading
        this.enableProgressiveLoading(true);
        optimizations.push('progressive-loading');
        
        return optimizations;
    }
    
    /**
     * Optimized resource loading with caching
     */
    async loadResource(url, options = {}) {
        const startTime = Date.now();
        
        try {
            // Check cache first
            const cached = await this.getCachedResource(url);
            if (cached && !this.isCacheExpired(cached)) {
                this.stats.cacheHits++;
                this.stats.bytesSaved += cached.size || 0;
                
                console.log(`💾 Cache hit: ${url}`);
                return cached.data;
            }
            
            // Apply network-specific loading strategy
            const loadingStrategy = this.getLoadingStrategy(options);
            const resource = await this.loadWithStrategy(url, loadingStrategy);
            
            // Cache the resource
            await this.cacheResource(url, resource);
            
            // Update statistics
            this.stats.cacheMisses++;
            this.stats.bytesTransferred += resource.size || 0;
            this.bandwidthUsed += resource.size || 0;
            
            const loadTime = Date.now() - startTime;
            console.log(`🌐 Loaded: ${url} (${loadTime}ms)`);
            
            return resource.data;
            
        } catch (error) {
            console.error(`Failed to load resource: ${url}`, error);
            throw error;
        }
    }
    
    /**
     * Get loading strategy based on network conditions
     */
    getLoadingStrategy(options) {
        const strategy = {
            timeout: 10000,
            retries: 1,
            // Remove invalid priority - not supported in all browsers
            compression: 'standard',
            ...options
        };
        
        // Adjust based on network speed
        switch (this.networkSpeed) {
            case 'very-slow':
                strategy.timeout = 30000;
                strategy.retries = 3;
                strategy.compression = 'aggressive';
                break;
                
            case 'slow':
                strategy.timeout = 20000;
                strategy.retries = 2;
                strategy.compression = 'high';
                break;
                
            case 'moderate':
                strategy.timeout = 15000;
                strategy.retries = 2;
                break;
                
            case 'fast':
            case 'very-fast':
                strategy.timeout = 8000;
                strategy.retries = 1;
                break;
        }
        
        // Adjust for high latency
        if (this.networkInfo.rtt > 500) {
            strategy.timeout *= 1.5;
            strategy.retries += 1;
        }
        
        return strategy;
    }
    
    /**
     * Load resource with specific strategy
     */
    async loadWithStrategy(url, strategy) {
        let lastError;
        
        for (let attempt = 0; attempt <= strategy.retries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), strategy.timeout);
                
                const response = await fetch(url, {
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.blob();
                
                return {
                    data,
                    size: data.size,
                    type: response.headers.get('content-type'),
                    timestamp: Date.now()
                };
                
            } catch (error) {
                lastError = error;
                
                if (attempt < strategy.retries) {
                    const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
                    console.warn(`Retry ${attempt + 1} for ${url} in ${delay}ms`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        
        throw lastError;
    }
    
    /**
     * Get cached resource
     */
    async getCachedResource(url) {
        // Ensure cache manager is initialized
        if (!this.cacheManager) {
            console.warn('Cache manager not initialized');
            return null;
        }
        
        // Check memory cache first
        if (this.cacheManager.memoryCache && this.cacheManager.memoryCache.has(url)) {
            return this.cacheManager.memoryCache.get(url);
        }
        
        // Check IndexedDB cache
        if (this.cacheManager.dbCache) {
            try {
                const transaction = this.cacheManager.dbCache.transaction(['images'], 'readonly');
                const store = transaction.objectStore('images');
                const request = store.get(url);
                
                return new Promise((resolve, reject) => {
                    request.onsuccess = () => {
                        const result = request.result;
                        if (result && this.cacheManager.memoryCache) {
                            // Add to memory cache for faster access
                            this.cacheManager.memoryCache.set(url, result);
                        }
                        resolve(result);
                    };
                    request.onerror = () => reject(request.error);
                });
                
            } catch (error) {
                console.error('Cache read error:', error);
            }
        }
        
        return null;
    }
    
    /**
     * Cache resource
     */
    async cacheResource(url, resource) {
        const cacheEntry = {
            url,
            data: resource.data,
            size: resource.size,
            type: resource.type,
            timestamp: Date.now()
        };
        
        // Add to memory cache
        this.cacheManager.memoryCache.set(url, cacheEntry);
        
        // Add to IndexedDB cache
        if (this.cacheManager.dbCache) {
            try {
                const transaction = this.cacheManager.dbCache.transaction(['images'], 'readwrite');
                const store = transaction.objectStore('images');
                store.put(cacheEntry);
                
            } catch (error) {
                console.error('Cache write error:', error);
            }
        }
        
        // Update cache size
        this.cacheManager.stats.size += resource.size;
        
        // Cleanup if cache is too large
        if (this.cacheManager.stats.size > this.config.maxCacheSize) {
            await this.cleanupCache();
        }
    }
    
    /**
     * Check if cached resource is expired
     */
    isCacheExpired(cached) {
        const age = Date.now() - cached.timestamp;
        return age > this.config.maxCacheAge;
    }
    
    /**
     * Cleanup old cache entries
     */
    async cleanupCache() {
        console.log('🧹 Cleaning up cache...');
        
        // Clean memory cache
        const memoryEntries = Array.from(this.cacheManager.memoryCache.entries());
        const expiredMemory = memoryEntries.filter(([url, entry]) => this.isCacheExpired(entry));
        
        expiredMemory.forEach(([url]) => {
            this.cacheManager.memoryCache.delete(url);
        });
        
        // Clean IndexedDB cache
        if (this.cacheManager.dbCache) {
            try {
                const transaction = this.cacheManager.dbCache.transaction(['images'], 'readwrite');
                const store = transaction.objectStore('images');
                const index = store.index('timestamp');
                
                const cutoffTime = Date.now() - this.config.maxCacheAge;
                const range = IDBKeyRange.upperBound(cutoffTime);
                
                const request = index.openCursor(range);
                request.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor) {
                        cursor.delete();
                        cursor.continue();
                    }
                };
                
            } catch (error) {
                console.error('Cache cleanup error:', error);
            }
        }
        
        console.log(`🧹 Cache cleanup complete: removed ${expiredMemory.length} expired entries`);
    }
    
    /**
     * Smart prefetching based on network conditions
     */
    async smartPrefetch(urls, options = {}) {
        if (!Array.isArray(urls) || urls.length === 0) return;
        
        const strategy = this.config.prefetchStrategy;
        
        // Skip prefetching on very slow networks or save data mode
        if (strategy === 'none' || 
            this.networkSpeed === 'very-slow' || 
            this.networkInfo.saveData) {
            console.log('⏭️ Prefetching skipped due to network conditions');
            return;
        }
        
        // Determine prefetch count based on network speed and strategy
        let prefetchCount;
        switch (strategy) {
            case 'aggressive':
                prefetchCount = Math.min(urls.length, this.networkSpeed === 'fast' ? 5 : 3);
                break;
            case 'smart':
                prefetchCount = Math.min(urls.length, this.networkSpeed === 'fast' ? 3 : 2);
                break;
            case 'conservative':
                prefetchCount = Math.min(urls.length, 1);
                break;
            default:
                prefetchCount = 2;
        }
        
        // Check bandwidth budget
        if (this.bandwidthUsed > this.config.bandwidthBudget * 0.8) {
            console.log('⏭️ Prefetching limited due to bandwidth budget');
            prefetchCount = Math.min(prefetchCount, 1);
        }
        
        console.log(`🔄 Smart prefetching ${prefetchCount} resources (strategy: ${strategy})`);
        
        // Prefetch with low priority
        const prefetchPromises = urls.slice(0, prefetchCount).map(url => 
            this.loadResource(url, { 
                ...options 
            }).catch(error => {
                console.warn(`Prefetch failed for ${url}:`, error);
                return null;
            })
        );
        
        // Don't wait for prefetch to complete
        Promise.all(prefetchPromises).then(results => {
            const successful = results.filter(r => r !== null).length;
            console.log(`✅ Prefetched ${successful}/${prefetchCount} resources`);
        });
    }
    
    /**
     * Assess network quality periodically
     */
    async assessNetworkQuality() {
        if (!navigator.connection) return;
        
        const connection = navigator.connection;
        const previousSpeed = this.networkSpeed;
        
        // Update network info
        this.networkInfo.downlink = connection.downlink;
        this.networkInfo.rtt = connection.rtt;
        this.networkInfo.effectiveType = connection.effectiveType;
        
        // Reclassify network speed
        this.networkSpeed = this.classifyNetworkSpeed();
        
        // If network speed changed significantly, reapply optimizations
        if (this.networkSpeed !== previousSpeed) {
            console.log(`📡 Network speed changed: ${previousSpeed} → ${this.networkSpeed}`);
            this.applyNetworkOptimizations();
        }
    }
    
    /**
     * Notify other components of network changes
     */
    notifyNetworkChange() {
        const event = new CustomEvent('networkchange', {
            detail: {
                networkInfo: this.networkInfo,
                networkSpeed: this.networkSpeed,
                optimizations: this.stats.optimizationsApplied
            }
        });
        
        window.dispatchEvent(event);
    }
    
    /**
     * Configuration setters for optimization modes
     */
    setImageQualityMode(mode) {
        const event = new CustomEvent('imagequalitychange', { detail: { mode } });
        window.dispatchEvent(event);
    }
    
    setCompressionMode(mode) {
        const event = new CustomEvent('compressionchange', { detail: { mode } });
        window.dispatchEvent(event);
    }
    
    setPrefetchStrategy(strategy) {
        this.config.prefetchStrategy = strategy;
    }
    
    enableRequestBatching(enabled) {
        const event = new CustomEvent('requestbatchingchange', { detail: { enabled } });
        window.dispatchEvent(event);
    }
    
    enableResourcePrioritization(enabled) {
        const event = new CustomEvent('resourceprioritizationchange', { detail: { enabled } });
        window.dispatchEvent(event);
    }
    
    enableConnectionPooling(enabled) {
        // Implementation would depend on specific networking library
        console.log(`Connection pooling ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    setRequestTimeout(timeout) {
        this.config.requestTimeout = timeout;
    }
    
    enableRequestRetry(enabled) {
        this.config.enableRetry = enabled;
    }
    
    enableBandwidthThrottling(enabled) {
        const event = new CustomEvent('bandwidththrottlingchange', { detail: { enabled } });
        window.dispatchEvent(event);
    }
    
    enableVisibilityBasedLoading(enabled) {
        const event = new CustomEvent('visibilityloadingchange', { detail: { enabled } });
        window.dispatchEvent(event);
    }
    
    enableProgressiveLoading(enabled) {
        const event = new CustomEvent('progressiveloadingchange', { detail: { enabled } });
        window.dispatchEvent(event);
    }
    
    disableNonEssentialFeatures() {
        const event = new CustomEvent('disablenonessential');
        window.dispatchEvent(event);
    }
    
    /**
     * Get network optimization statistics
     */
    getStats() {
        const sessionDuration = Date.now() - this.sessionStartTime;
        const avgBandwidthUsage = this.bandwidthUsed / (sessionDuration / 1000); // bytes per second
        
        return {
            ...this.stats,
            networkSpeed: this.networkSpeed,
            bandwidthUsed: this.bandwidthUsed,
            bandwidthBudget: this.config.bandwidthBudget,
            avgBandwidthUsage,
            cacheSize: this.cacheManager.stats.size,
            sessionDuration
        };
    }
    
    /**
     * Clear all caches
     */
    async clearCache() {
        // Clear memory cache
        this.cacheManager.memoryCache.clear();
        
        // Clear IndexedDB cache
        if (this.cacheManager.dbCache) {
            try {
                const transaction = this.cacheManager.dbCache.transaction(['images'], 'readwrite');
                const store = transaction.objectStore('images');
                store.clear();
                
            } catch (error) {
                console.error('Cache clear error:', error);
            }
        }
        
        // Reset stats
        this.cacheManager.stats.size = 0;
        this.stats.cacheHits = 0;
        this.stats.cacheMisses = 0;
        
        console.log('🧹 All caches cleared');
    }
    
    /**
     * Destroy the network optimizer
     */
    destroy() {
        // Clear caches
        this.clearCache();
        
        // Remove event listeners
        if (navigator.connection) {
            navigator.connection.removeEventListener('change', this.handleNetworkChange);
        }
        
        console.log('🌐 Network Optimizer destroyed');
    }
}

// Export for use in other modules
window.NetworkOptimizer = NetworkOptimizer;