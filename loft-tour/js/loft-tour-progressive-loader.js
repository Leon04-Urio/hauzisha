/**
 * LOFT³ Progressive Image Loader
 * Implements progressive loading with multiple resolution tiers for optimal performance
 */

class ProgressiveImageLoader {
    constructor(config = {}) {
        this.config = {
            // Resolution tiers configuration
            tiers: {
                low: { width: 1024, height: 512, quality: 0.5, suffix: '' },
                medium: { width: 2048, height: 1024, quality: 0.7, suffix: '' },
                high: { width: 4096, height: 2048, quality: 0.85, suffix: '' }
            },
            
            // Loading strategy
            strategy: 'adaptive', // 'adaptive', 'progressive', 'single'
            
            // Cache settings
            enableCache: true,
            maxCacheSize: 100 * 1024 * 1024, // 100MB
            
            // Performance settings
            preloadCount: 2,
            loadTimeout: 30000,
            
            ...config
        };
        
        // State management
        this.cache = new Map();
        this.loadingPromises = new Map();
        this.deviceCapabilities = null;
        this.currentCacheSize = 0;
        
        // Network optimizer integration
        this.networkOptimizer = null;
        this.initNetworkOptimizer();
        
        // Performance tracking
        this.stats = {
            imagesLoaded: 0,
            totalLoadTime: 0,
            cacheHits: 0,
            cacheMisses: 0,
            tierUsage: { low: 0, medium: 0, high: 0 }
        };
        
        this.init();
    }
    
    /**
     * Initialize network optimizer integration
     */
    async initNetworkOptimizer() {
        if (typeof NetworkOptimizer !== 'undefined') {
            try {
                this.networkOptimizer = new NetworkOptimizer({
                    enable3GOptimization: true,
                    adaptiveQuality: true,
                    prefetchStrategy: this.config.strategy === 'adaptive' ? 'smart' : 'conservative'
                });
                
                // Listen for network optimization events
                window.addEventListener('networkchange', (event) => {
                    this.handleNetworkChange(event.detail);
                });
                
                console.log('✅ Network optimizer integrated with progressive loader');
                
            } catch (error) {
                console.warn('⚠️ Failed to initialize network optimizer:', error);
                this.networkOptimizer = null;
            }
        }
    }
    
    /**
     * Handle network change events from network optimizer
     */
    handleNetworkChange(networkDetail) {
        const { networkSpeed, optimizations } = networkDetail;
        
        // Adjust optimal tier based on network conditions
        const previousTier = this.optimalTier;
        
        switch (networkSpeed) {
            case 'very-slow':
                this.optimalTier = 'low';
                this.config.preloadCount = 0; // Disable preloading
                break;
                
            case 'slow':
                this.optimalTier = 'low';
                this.config.preloadCount = 1;
                break;
                
            case 'moderate':
                this.optimalTier = 'medium';
                this.config.preloadCount = 2;
                break;
                
            case 'fast':
            case 'very-fast':
                this.optimalTier = this.deviceCapabilities?.performanceTier === 'high' ? 'high' : 'medium';
                this.config.preloadCount = 3;
                break;
        }
        
        if (previousTier !== this.optimalTier) {
            console.log(`📶 Progressive loader tier adjusted: ${previousTier} → ${this.optimalTier}`);
        }
    }
    
    /**
     * Initialize the progressive loader
     */
    init() {
        this.detectDeviceCapabilities();
        this.setupCacheManagement();
        
        console.log('Progressive Image Loader initialized:', {
            strategy: this.config.strategy,
            deviceTier: this.deviceCapabilities?.performanceTier,
            cacheEnabled: this.config.enableCache
        });
    }
    
    /**
     * Detect device capabilities for adaptive loading
     */
    detectDeviceCapabilities() {
        // Use DeviceCapabilityManager if available
        if (window.DeviceCapabilityManager) {
            try {
                const manager = new DeviceCapabilityManager();
                // Wait for initialization and get capabilities
                setTimeout(() => {
                    const capabilities = manager.getCapabilities();
                    this.deviceCapabilities = capabilities.capabilities;
                    this.optimalTier = this.determineOptimalTier();
                    
                    console.log('Progressive loader using DeviceCapabilityManager:', {
                        tier: capabilities.qualityTier,
                        optimalTier: this.optimalTier
                    });
                }, 500);
                
                // Return basic capabilities immediately for initialization
                return this.basicCapabilityDetection();
                
            } catch (error) {
                console.warn('Failed to use DeviceCapabilityManager, falling back to basic detection:', error);
            }
        }
        
        // Use existing mobile optimization if available
        if (window.MobileOptimization) {
            const mobileOpt = new MobileOptimization();
            this.deviceCapabilities = mobileOpt.getCurrentCapabilities().capabilities;
        } else {
            // Fallback capability detection
            this.deviceCapabilities = this.basicCapabilityDetection();
        }
        
        // Determine optimal tier based on capabilities
        this.optimalTier = this.determineOptimalTier();
        
        console.log('Device capabilities detected:', {
            tier: this.deviceCapabilities.performanceTier,
            memory: this.deviceCapabilities.deviceMemory,
            connection: this.deviceCapabilities.connection?.effectiveType,
            optimalTier: this.optimalTier
        });
    }
    
    /**
     * Basic capability detection fallback
     */
    basicCapabilityDetection() {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const memory = navigator.deviceMemory || 4;
        const connection = navigator.connection;
        
        let performanceTier = 'medium';
        
        if (memory < 2 || (connection && connection.effectiveType === '2g')) {
            performanceTier = 'low';
        } else if (memory >= 8 && !isMobile) {
            performanceTier = 'high';
        }
        
        return {
            performanceTier,
            deviceMemory: memory,
            connection: connection ? {
                effectiveType: connection.effectiveType,
                saveData: connection.saveData
            } : null,
            isMobile
        };
    }
    
    /**
     * Determine optimal tier based on device capabilities
     */
    determineOptimalTier() {
        const caps = this.deviceCapabilities;
        
        // Force low quality for very constrained devices
        if (caps.deviceMemory < 2 || 
            (caps.connection && caps.connection.effectiveType === '2g') ||
            (caps.connection && caps.connection.saveData)) {
            return 'low';
        }
        
        // Use high quality for powerful devices with good connections
        if (caps.deviceMemory >= 8 && 
            !caps.isMobile &&
            (!caps.connection || caps.connection.effectiveType === '4g')) {
            return 'high';
        }
        
        // Default to medium quality
        return 'medium';
    }
    
    /**
     * Setup cache management
     */
    setupCacheManagement() {
        if (!this.config.enableCache) return;
        
        // Periodic cache cleanup
        setInterval(() => {
            this.cleanupCache();
        }, 60000); // Every minute
        
        // Listen for memory pressure events
        if ('memory' in performance) {
            setInterval(() => {
                const memoryInfo = performance.memory;
                const memoryUsage = memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit;
                
                if (memoryUsage > 0.8) {
                    console.warn('High memory usage detected, cleaning cache');
                    this.cleanupCache(true); // Aggressive cleanup
                }
            }, 30000);
        }
    }
    
    /**
     * Load image with progressive quality tiers
     */
    async loadImageProgressive(imagePath, options = {}) {
        const startTime = Date.now();
        const cacheKey = this.getCacheKey(imagePath, options);
        
        // Check cache first
        if (this.config.enableCache && this.cache.has(cacheKey)) {
            this.stats.cacheHits++;
            const cached = this.cache.get(cacheKey);
            console.log(`📦 Cache hit for ${imagePath} (${cached.tier})`);
            return cached.image;
        }
        
        this.stats.cacheMisses++;
        
        // Check if already loading
        if (this.loadingPromises.has(cacheKey)) {
            return this.loadingPromises.get(cacheKey);
        }
        
        // Use network optimizer if available
        let loadingPromise;
        if (this.networkOptimizer) {
            loadingPromise = this.loadWithNetworkOptimizer(imagePath, options);
        } else {
            loadingPromise = this.executeProgressiveLoad(imagePath, options);
        }
        
        this.loadingPromises.set(cacheKey, loadingPromise);
        
        try {
            const result = await loadingPromise;
            
            // Cache the result
            if (this.config.enableCache) {
                this.cacheImage(cacheKey, result, imagePath);
            }
            
            // Update stats
            this.stats.imagesLoaded++;
            this.stats.totalLoadTime += Date.now() - startTime;
            this.stats.tierUsage[result.tier]++;
            
            return result.image;
            
        } finally {
            this.loadingPromises.delete(cacheKey);
        }
    }
    
    /**
     * Load image using network optimizer
     */
    async loadWithNetworkOptimizer(imagePath, options) {
        const targetTier = options.tier || this.optimalTier;
        const tierUrl = this.getTierUrl(imagePath, targetTier);
        
        try {
            // Use network optimizer's optimized loading
            const imageBlob = await this.networkOptimizer.loadResource(tierUrl, {
                priority: options.priority || 'normal',
                timeout: options.timeout
            });
            
            // Convert blob to image
            const image = await this.blobToImage(imageBlob);
            
            return { image, tier: targetTier, url: tierUrl };
            
        } catch (error) {
            console.warn(`Network optimizer load failed for ${imagePath}, falling back to standard loading`);
            
            // Fallback to standard progressive loading
            return this.executeProgressiveLoad(imagePath, options);
        }
    }
    
    /**
     * Convert blob to image element
     */
    blobToImage(blob) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(blob);
            
            img.onload = () => {
                URL.revokeObjectURL(url);
                resolve(img);
            };
            
            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('Failed to create image from blob'));
            };
            
            img.src = url;
        });
    }
    
    /**
     * Execute progressive loading strategy
     */
    async executeProgressiveLoad(imagePath, options) {
        const strategy = options.strategy || this.config.strategy;
        const targetTier = options.tier || this.optimalTier;
        
        switch (strategy) {
            case 'progressive':
                return this.loadProgressiveStrategy(imagePath, targetTier, options);
            case 'single':
                return this.loadSingleStrategy(imagePath, targetTier, options);
            case 'adaptive':
            default:
                return this.loadAdaptiveStrategy(imagePath, targetTier, options);
        }
    }
    
    /**
     * Progressive loading strategy - load low quality first, then upgrade
     */
    async loadProgressiveStrategy(imagePath, targetTier, options) {
        const tiers = this.getTierSequence(targetTier);
        let currentResult = null;
        
        for (const tier of tiers) {
            try {
                const tierUrl = this.getTierUrl(imagePath, tier);
                const image = await this.loadSingleImage(tierUrl, options.timeout);
                
                currentResult = { image, tier, url: tierUrl };
                
                // Notify progress if callback provided
                if (options.onProgress) {
                    options.onProgress({
                        tier,
                        tierIndex: tiers.indexOf(tier),
                        totalTiers: tiers.length,
                        image,
                        isComplete: tier === targetTier
                    });
                }
                
                // If this is not the target tier, continue loading higher quality
                if (tier !== targetTier) {
                    console.log(`📶 Loaded ${tier} quality for ${imagePath}, upgrading...`);
                }
                
            } catch (error) {
                console.warn(`Failed to load ${tier} quality for ${imagePath}:`, error);
                
                // If we have a previous result, use it
                if (currentResult) {
                    console.log(`Using previous ${currentResult.tier} quality as fallback`);
                    break;
                }
                
                // If this is the last tier, throw the error
                if (tier === tiers[tiers.length - 1]) {
                    throw error;
                }
            }
        }
        
        if (!currentResult) {
            throw new Error(`Failed to load any quality tier for ${imagePath}`);
        }
        
        console.log(`✅ Progressive loading complete: ${imagePath} (${currentResult.tier})`);
        return currentResult;
    }
    
    /**
     * Single tier loading strategy
     */
    async loadSingleStrategy(imagePath, targetTier, options) {
        const tierUrl = this.getTierUrl(imagePath, targetTier);
        
        try {
            const image = await this.loadSingleImage(tierUrl, options.timeout);
            return { image, tier: targetTier, url: tierUrl };
        } catch (error) {
            // Fallback to lower quality
            const fallbackTier = this.getFallbackTier(targetTier);
            if (fallbackTier !== targetTier) {
                console.warn(`Failed to load ${targetTier}, falling back to ${fallbackTier}`);
                const fallbackUrl = this.getTierUrl(imagePath, fallbackTier);
                const image = await this.loadSingleImage(fallbackUrl, options.timeout);
                return { image, tier: fallbackTier, url: fallbackUrl };
            }
            throw error;
        }
    }
    
    /**
     * Adaptive loading strategy - choose best tier based on current conditions
     */
    async loadAdaptiveStrategy(imagePath, targetTier, options) {
        // Check current network conditions
        const currentTier = this.adaptTierToConditions(targetTier);
        
        return this.loadSingleStrategy(imagePath, currentTier, options);
    }
    
    /**
     * Adapt tier based on current network and device conditions
     */
    adaptTierToConditions(baseTier) {
        const connection = navigator.connection;
        
        if (connection) {
            // Downgrade for slow connections
            if (connection.effectiveType === '2g' || connection.saveData) {
                return 'low';
            }
            
            if (connection.effectiveType === '3g' && baseTier === 'high') {
                return 'medium';
            }
        }
        
        // Check memory pressure
        if (performance.memory) {
            const memoryUsage = performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit;
            if (memoryUsage > 0.7 && baseTier === 'high') {
                return 'medium';
            }
        }
        
        return baseTier;
    }
    
    /**
     * Get tier sequence for progressive loading
     */
    getTierSequence(targetTier) {
        const allTiers = ['low', 'medium', 'high'];
        const targetIndex = allTiers.indexOf(targetTier);
        
        if (targetIndex === -1) return ['medium'];
        
        // Return sequence up to target tier
        return allTiers.slice(0, targetIndex + 1);
    }
    
    /**
     * Get fallback tier for failed loads
     */
    getFallbackTier(tier) {
        const fallbacks = {
            'high': 'medium',
            'medium': 'low',
            'low': 'low'
        };
        
        return fallbacks[tier] || 'medium';
    }
    
    /**
     * Generate tier-specific URL
     */
    getTierUrl(basePath, tier) {
        if (!basePath) return null;
        
        // Handle data URLs
        if (basePath.startsWith('data:')) {
            return basePath;
        }
        
        // Handle absolute URLs
        if (basePath.startsWith('http')) {
            return basePath;
        }
        
        const tierConfig = this.config.tiers[tier];
        if (!tierConfig) return basePath;
        
        // Extract file extension
        const lastDot = basePath.lastIndexOf('.');
        if (lastDot === -1) return basePath;
        
        const baseName = basePath.substring(0, lastDot);
        const extension = basePath.substring(lastDot);
        
        // Generate tier URL
        return `${baseName}${tierConfig.suffix}${extension}`;
    }
    
    /**
     * Load a single image with timeout
     */
    loadSingleImage(url, timeout = this.config.loadTimeout) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            const timeoutId = setTimeout(() => {
                reject(new Error(`Image load timeout: ${url}`));
            }, timeout);
            
            img.onload = () => {
                clearTimeout(timeoutId);
                resolve(img);
            };
            
            img.onerror = () => {
                clearTimeout(timeoutId);
                reject(new Error(`Failed to load image: ${url}`));
            };
            
            img.crossOrigin = 'anonymous';
            img.src = url;
        });
    }
    
    /**
     * Generate cache key
     */
    getCacheKey(imagePath, options) {
        const tier = options.tier || this.optimalTier;
        return `${imagePath}:${tier}`;
    }
    
    /**
     * Cache loaded image
     */
    cacheImage(cacheKey, result, originalPath) {
        // Estimate image size for cache management
        const estimatedSize = this.estimateImageSize(result.image);
        
        // Check if we have space
        if (this.currentCacheSize + estimatedSize > this.config.maxCacheSize) {
            this.cleanupCache();
        }
        
        // Cache the image
        this.cache.set(cacheKey, {
            ...result,
            originalPath,
            cachedAt: Date.now(),
            estimatedSize
        });
        
        this.currentCacheSize += estimatedSize;
        
        console.log(`💾 Cached ${originalPath} (${result.tier}) - Cache size: ${(this.currentCacheSize / 1024 / 1024).toFixed(1)}MB`);
    }
    
    /**
     * Estimate image memory size
     */
    estimateImageSize(image) {
        // Rough estimate: width * height * 4 bytes (RGBA)
        return image.width * image.height * 4;
    }
    
    /**
     * Cleanup cache based on LRU and size constraints
     */
    cleanupCache(aggressive = false) {
        if (!this.config.enableCache || this.cache.size === 0) return;
        
        const entries = Array.from(this.cache.entries());
        const threshold = aggressive ? 0.5 : 0.8;
        const targetSize = this.config.maxCacheSize * threshold;
        
        // Sort by last access time (LRU)
        entries.sort((a, b) => a[1].cachedAt - b[1].cachedAt);
        
        let removedSize = 0;
        let removedCount = 0;
        
        while (this.currentCacheSize > targetSize && entries.length > 0) {
            const [key, entry] = entries.shift();
            this.cache.delete(key);
            this.currentCacheSize -= entry.estimatedSize;
            removedSize += entry.estimatedSize;
            removedCount++;
        }
        
        if (removedCount > 0) {
            console.log(`🧹 Cache cleanup: removed ${removedCount} images (${(removedSize / 1024 / 1024).toFixed(1)}MB)`);
        }
    }
    
    /**
     * Preload images for smooth navigation
     */
    async preloadImages(imagePaths, options = {}) {
        const preloadCount = Math.min(imagePaths.length, options.count || this.config.preloadCount);
        
        // Use network optimizer's smart prefetching if available
        if (this.networkOptimizer && preloadCount > 0) {
            const urls = imagePaths.slice(0, preloadCount).map(path => 
                this.getTierUrl(path, options.preloadTier || this.getFallbackTier(this.optimalTier))
            );
            
            try {
                await this.networkOptimizer.smartPrefetch(urls, {
                    priority: 'low',
                    ...options
                });
                
                console.log(`📦 Smart prefetched ${urls.length} images via network optimizer`);
                return urls.map(url => ({ url, prefetched: true }));
                
            } catch (error) {
                console.warn('Smart prefetch failed, falling back to standard preloading:', error);
            }
        }
        
        // Fallback to standard preloading
        const preloadPromises = [];
        
        for (let i = 0; i < preloadCount; i++) {
            const imagePath = imagePaths[i];
            if (imagePath) {
                // Use lower quality for preloading to save bandwidth
                const preloadOptions = {
                    ...options,
                    tier: options.preloadTier || this.getFallbackTier(this.optimalTier),
                    strategy: 'single'
                };
                
                preloadPromises.push(
                    this.loadImageProgressive(imagePath, preloadOptions)
                        .catch(error => {
                            console.warn(`Preload failed for ${imagePath}:`, error);
                            return null;
                        })
                );
            }
        }
        
        const results = await Promise.all(preloadPromises);
        const successful = results.filter(r => r !== null).length;
        
        console.log(`📦 Preloaded ${successful}/${preloadCount} images`);
        return results;
    }
    
    /**
     * Get loading statistics
     */
    getStats() {
        const avgLoadTime = this.stats.imagesLoaded > 0 ? 
            this.stats.totalLoadTime / this.stats.imagesLoaded : 0;
        
        const cacheHitRate = (this.stats.cacheHits + this.stats.cacheMisses) > 0 ?
            this.stats.cacheHits / (this.stats.cacheHits + this.stats.cacheMisses) : 0;
        
        return {
            imagesLoaded: this.stats.imagesLoaded,
            avgLoadTime: Math.round(avgLoadTime),
            cacheHitRate: Math.round(cacheHitRate * 100),
            cacheSize: Math.round(this.currentCacheSize / 1024 / 1024),
            tierUsage: { ...this.stats.tierUsage },
            optimalTier: this.optimalTier,
            deviceTier: this.deviceCapabilities?.performanceTier
        };
    }
    
    /**
     * Clear all cached images
     */
    clearCache() {
        this.cache.clear();
        this.currentCacheSize = 0;
        console.log('🧹 Image cache cleared');
    }
    
    /**
     * Destroy the loader and cleanup resources
     */
    destroy() {
        this.clearCache();
        this.loadingPromises.clear();
        console.log('Progressive Image Loader destroyed');
    }
}

// Export for use in other modules
window.ProgressiveImageLoader = ProgressiveImageLoader;