/**
 * LOFT³ Memory Optimizer
 * Advanced memory management and optimization utilities
 */

class LoftTourMemoryOptimizer {
    constructor(tourEngine, config = {}) {
        this.engine = tourEngine;
        this.config = {
            // Memory thresholds (as percentage of heap limit)
            warningThreshold: 0.6,
            criticalThreshold: 0.8,
            emergencyThreshold: 0.9,
            
            // Optimization settings
            enableAutoCleanup: true,
            cleanupInterval: 30000, // 30 seconds
            aggressiveCleanupThreshold: 0.85,
            
            // Cache management
            maxTextureCache: 50 * 1024 * 1024, // 50MB
            maxImageCache: 100 * 1024 * 1024, // 100MB
            cacheCleanupRatio: 0.3, // Clean 30% when threshold reached
            
            // Object pooling
            enableObjectPooling: true,
            maxPoolSize: 100,
            
            ...config
        };
        
        // Memory tracking
        this.memoryStats = {
            peak: 0,
            current: 0,
            limit: 0,
            cleanupCount: 0,
            lastCleanup: 0
        };
        
        // Object pools for reuse
        this.objectPools = {
            sprites: [],
            materials: [],
            textures: new Map(),
            geometries: []
        };
        
        // Cleanup intervals
        this.cleanupInterval = null;
        this.monitoringInterval = null;
        
        // Memory pressure callbacks
        this.pressureCallbacks = [];
        
        this.init();
    }
    
    /**
     * Initialize memory optimizer
     */
    init() {
        console.log('🧠 Initializing Memory Optimizer...');
        
        this.startMemoryMonitoring();
        
        if (this.config.enableAutoCleanup) {
            this.startAutoCleanup();
        }
        
        // Setup memory pressure detection
        this.setupMemoryPressureDetection();
        
        console.log('✅ Memory Optimizer initialized');
    }
    
    /**
     * Start memory monitoring
     */
    startMemoryMonitoring() {
        this.monitoringInterval = setInterval(() => {
            this.updateMemoryStats();
            this.checkMemoryPressure();
        }, 5000); // Check every 5 seconds
    }
    
    /**
     * Start automatic cleanup
     */
    startAutoCleanup() {
        this.cleanupInterval = setInterval(() => {
            this.performRoutineCleanup();
        }, this.config.cleanupInterval);
    }
    
    /**
     * Setup memory pressure detection
     */
    setupMemoryPressureDetection() {
        // Listen for memory pressure events if available
        if ('memory' in performance) {
            // Modern browsers with memory API
            this.setupAdvancedMemoryDetection();
        } else {
            // Fallback detection methods
            this.setupFallbackMemoryDetection();
        }
    }
    
    /**
     * Setup advanced memory detection using Performance API
     */
    setupAdvancedMemoryDetection() {
        // Monitor heap size changes
        let lastHeapSize = 0;
        
        setInterval(() => {
            if (performance.memory) {
                const currentHeap = performance.memory.usedJSHeapSize;
                const heapGrowth = currentHeap - lastHeapSize;
                
                // Detect rapid memory growth
                if (heapGrowth > 10 * 1024 * 1024) { // 10MB growth in 5 seconds
                    console.warn('🚨 Rapid memory growth detected:', (heapGrowth / 1024 / 1024).toFixed(1), 'MB');
                    this.handleMemoryPressure('rapid_growth');
                }
                
                lastHeapSize = currentHeap;
            }
        }, 5000);
    }
    
    /**
     * Setup fallback memory detection
     */
    setupFallbackMemoryDetection() {
        // Monitor object creation patterns
        let objectCount = 0;
        
        // Override object creation methods to track allocations
        const originalCreateElement = document.createElement;
        document.createElement = function(...args) {
            objectCount++;
            return originalCreateElement.apply(document, args);
        };
        
        // Monitor object count growth
        setInterval(() => {
            if (objectCount > 1000) { // Arbitrary threshold
                console.warn('🚨 High object creation detected:', objectCount, 'objects');
                objectCount = 0; // Reset counter
            }
        }, 10000);
    }
    
    /**
     * Update memory statistics
     */
    updateMemoryStats() {
        if (!performance.memory) return;
        
        const memory = performance.memory;
        this.memoryStats.current = memory.usedJSHeapSize;
        this.memoryStats.limit = memory.jsHeapSizeLimit;
        this.memoryStats.peak = Math.max(this.memoryStats.peak, this.memoryStats.current);
        
        // Calculate percentage
        const percentage = this.memoryStats.limit > 0 ? 
            this.memoryStats.current / this.memoryStats.limit : 0;
        
        this.memoryStats.percentage = percentage;
    }
    
    /**
     * Check memory pressure and take action
     */
    checkMemoryPressure() {
        if (!this.memoryStats.percentage) return;
        
        const percentage = this.memoryStats.percentage;
        
        if (percentage >= this.config.emergencyThreshold) {
            this.handleMemoryPressure('emergency');
        } else if (percentage >= this.config.criticalThreshold) {
            this.handleMemoryPressure('critical');
        } else if (percentage >= this.config.warningThreshold) {
            this.handleMemoryPressure('warning');
        }
    }
    
    /**
     * Handle memory pressure situations
     */
    handleMemoryPressure(level) {
        console.log(`🧠 Memory pressure detected: ${level} (${(this.memoryStats.percentage * 100).toFixed(1)}%)`);
        
        switch (level) {
            case 'emergency':
                this.performEmergencyCleanup();
                break;
            case 'critical':
                this.performCriticalCleanup();
                break;
            case 'warning':
                this.performWarningCleanup();
                break;
            case 'rapid_growth':
                this.performRapidGrowthCleanup();
                break;
        }
        
        // Notify callbacks
        this.notifyPressureCallbacks(level);
    }
    
    /**
     * Perform emergency memory cleanup
     */
    performEmergencyCleanup() {
        console.log('🚨 Performing emergency memory cleanup');
        let cleaned = 0;
        
        // 1. Clear all caches immediately
        cleaned += this.clearAllCaches();
        
        // 2. Dispose unused Three.js objects
        cleaned += this.disposeUnusedThreeJSObjects();
        
        // 3. Clear object pools
        cleaned += this.clearObjectPools();
        
        // 4. Force garbage collection if available
        if (window.gc) {
            window.gc();
            cleaned++;
        }
        
        // 5. Reduce quality to minimum
        if (this.engine.deviceCapabilityManager) {
            this.engine.deviceCapabilityManager.adjustQualityDown();
            cleaned++;
        }
        
        // 6. Clear performance history
        if (this.engine.performanceProfiler) {
            this.engine.performanceProfiler.performanceHistory = [];
            this.engine.performanceProfiler.memoryHistory = [];
            cleaned++;
        }
        
        this.memoryStats.cleanupCount++;
        this.memoryStats.lastCleanup = Date.now();
        
        console.log(`🧹 Emergency cleanup completed: ${cleaned} actions taken`);
    }
    
    /**
     * Perform critical memory cleanup
     */
    performCriticalCleanup() {
        console.log('⚠️ Performing critical memory cleanup');
        let cleaned = 0;
        
        // 1. Clear texture caches
        cleaned += this.clearTextureCaches();
        
        // 2. Remove non-essential layers
        cleaned += this.removeNonEssentialLayers();
        
        // 3. Clear image caches
        cleaned += this.clearImageCaches();
        
        // 4. Optimize sprite pools
        cleaned += this.optimizeSpritePools();
        
        this.memoryStats.cleanupCount++;
        this.memoryStats.lastCleanup = Date.now();
        
        console.log(`🧹 Critical cleanup completed: ${cleaned} actions taken`);
    }
    
    /**
     * Perform warning level cleanup
     */
    performWarningCleanup() {
        console.log('ℹ️ Performing warning level cleanup');
        let cleaned = 0;
        
        // 1. Clean old cache entries
        cleaned += this.cleanOldCacheEntries();
        
        // 2. Optimize memory usage
        cleaned += this.optimizeMemoryUsage();
        
        this.memoryStats.cleanupCount++;
        this.memoryStats.lastCleanup = Date.now();
        
        console.log(`🧹 Warning cleanup completed: ${cleaned} actions taken`);
    }
    
    /**
     * Perform rapid growth cleanup
     */
    performRapidGrowthCleanup() {
        console.log('📈 Performing rapid growth cleanup');
        let cleaned = 0;
        
        // Focus on stopping the growth source
        cleaned += this.clearTextureCaches();
        cleaned += this.optimizeSpritePools();
        
        console.log(`🧹 Rapid growth cleanup completed: ${cleaned} actions taken`);
    }
    
    /**
     * Perform routine cleanup
     */
    performRoutineCleanup() {
        if (this.memoryStats.percentage < this.config.warningThreshold) {
            return; // No cleanup needed
        }
        
        let cleaned = 0;
        
        // Light cleanup operations
        cleaned += this.cleanOldCacheEntries();
        cleaned += this.optimizeObjectPools();
        
        if (cleaned > 0) {
            console.log(`🧹 Routine cleanup: ${cleaned} actions taken`);
        }
    }
    
    /**
     * Clear all caches
     */
    clearAllCaches() {
        let cleared = 0;
        
        // Layer manager texture cache
        if (this.engine.layerManager && this.engine.layerManager.clearTextureCache) {
            this.engine.layerManager.clearTextureCache();
            cleared++;
        }
        
        // Progressive loader cache
        if (this.engine.progressiveLoader && this.engine.progressiveLoader.clearCache) {
            this.engine.progressiveLoader.clearCache();
            cleared++;
        }
        
        // Clear our own texture pool
        this.objectPools.textures.clear();
        cleared++;
        
        return cleared;
    }
    
    /**
     * Clear texture caches
     */
    clearTextureCaches() {
        let cleared = 0;
        
        if (this.engine.layerManager && this.engine.layerManager.textureCache) {
            const cacheSize = this.engine.layerManager.textureCache.size;
            this.engine.layerManager.clearTextureCache();
            cleared += cacheSize;
        }
        
        return cleared;
    }
    
    /**
     * Clear image caches
     */
    clearImageCaches() {
        let cleared = 0;
        
        if (this.engine.progressiveLoader && this.engine.progressiveLoader.cache) {
            const cacheSize = this.engine.progressiveLoader.cache.size;
            this.engine.progressiveLoader.clearCache();
            cleared += cacheSize;
        }
        
        return cleared;
    }
    
    /**
     * Remove non-essential layers
     */
    removeNonEssentialLayers() {
        let removed = 0;
        
        if (this.engine.layerManager && this.engine.layerManager.layers) {
            const layers = this.engine.layerManager.layers;
            const essentialCount = Math.max(3, Math.floor(layers.length * 0.5));
            
            // Remove layers beyond essential count
            while (layers.length > essentialCount) {
                const layer = layers.pop();
                this.engine.layerScene.remove(layer);
                
                // Dispose resources
                if (layer.material) {
                    if (layer.material.map) layer.material.map.dispose();
                    layer.material.dispose();
                }
                
                removed++;
            }
        }
        
        return removed;
    }
    
    /**
     * Dispose unused Three.js objects
     */
    disposeUnusedThreeJSObjects() {
        let disposed = 0;
        
        if (this.engine.layerRenderer) {
            const renderer = this.engine.layerRenderer;
            
            // Dispose render targets
            renderer.dispose();
            disposed++;
            
            // Clear GPU memory
            if (renderer.forceContextLoss) {
                // Don't actually force context loss, just clean up
                const gl = renderer.getContext();
                if (gl && gl.getExtension) {
                    const ext = gl.getExtension('WEBGL_lose_context');
                    if (ext && false) { // Disabled to prevent breaking the renderer
                        ext.loseContext();
                        disposed++;
                    }
                }
            }
        }
        
        return disposed;
    }
    
    /**
     * Clear object pools
     */
    clearObjectPools() {
        let cleared = 0;
        
        // Clear sprite pool
        this.objectPools.sprites.forEach(sprite => {
            if (sprite.material) sprite.material.dispose();
        });
        cleared += this.objectPools.sprites.length;
        this.objectPools.sprites = [];
        
        // Clear material pool
        this.objectPools.materials.forEach(material => {
            material.dispose();
        });
        cleared += this.objectPools.materials.length;
        this.objectPools.materials = [];
        
        // Clear texture pool
        this.objectPools.textures.forEach(texture => {
            texture.dispose();
        });
        cleared += this.objectPools.textures.size;
        this.objectPools.textures.clear();
        
        return cleared;
    }
    
    /**
     * Clean old cache entries
     */
    cleanOldCacheEntries() {
        let cleaned = 0;
        
        // Clean progressive loader cache
        if (this.engine.progressiveLoader && this.engine.progressiveLoader.cleanupCache) {
            this.engine.progressiveLoader.cleanupCache();
            cleaned++;
        }
        
        // Clean layer manager cache
        if (this.engine.layerManager && this.engine.layerManager.optimizeMemory) {
            cleaned += this.engine.layerManager.optimizeMemory();
        }
        
        return cleaned;
    }
    
    /**
     * Optimize memory usage
     */
    optimizeMemoryUsage() {
        let optimized = 0;
        
        // Optimize sprite performance
        if (this.engine.layerManager && this.engine.layerManager.optimizeSpritePerformance) {
            optimized += this.engine.layerManager.optimizeSpritePerformance();
        }
        
        // Optimize object pools
        optimized += this.optimizeObjectPools();
        
        return optimized;
    }
    
    /**
     * Optimize sprite pools
     */
    optimizeSpritePools() {
        let optimized = 0;
        
        if (this.engine.layerManager && this.engine.layerManager.spritePool) {
            const pool = this.engine.layerManager.spritePool;
            const maxSize = this.engine.layerManager.maxPoolSize || 50;
            
            // Remove excess sprites from pool
            while (pool.length > maxSize) {
                const sprite = pool.pop();
                if (sprite.material) sprite.material.dispose();
                optimized++;
            }
        }
        
        return optimized;
    }
    
    /**
     * Optimize object pools
     */
    optimizeObjectPools() {
        let optimized = 0;
        
        // Limit sprite pool size
        if (this.objectPools.sprites.length > this.config.maxPoolSize) {
            const excess = this.objectPools.sprites.splice(this.config.maxPoolSize);
            excess.forEach(sprite => {
                if (sprite.material) sprite.material.dispose();
            });
            optimized += excess.length;
        }
        
        // Limit material pool size
        if (this.objectPools.materials.length > this.config.maxPoolSize) {
            const excess = this.objectPools.materials.splice(this.config.maxPoolSize);
            excess.forEach(material => material.dispose());
            optimized += excess.length;
        }
        
        return optimized;
    }
    
    /**
     * Get memory usage statistics
     */
    getMemoryStats() {
        this.updateMemoryStats();
        
        return {
            current: {
                used: Math.round(this.memoryStats.current / 1024 / 1024),
                limit: Math.round(this.memoryStats.limit / 1024 / 1024),
                percentage: Math.round(this.memoryStats.percentage * 100)
            },
            peak: Math.round(this.memoryStats.peak / 1024 / 1024),
            cleanup: {
                count: this.memoryStats.cleanupCount,
                lastCleanup: this.memoryStats.lastCleanup
            },
            pools: {
                sprites: this.objectPools.sprites.length,
                materials: this.objectPools.materials.length,
                textures: this.objectPools.textures.size
            },
            caches: this.getCacheStats()
        };
    }
    
    /**
     * Get cache statistics
     */
    getCacheStats() {
        const stats = {};
        
        if (this.engine.layerManager && this.engine.layerManager.textureCache) {
            stats.layerTextures = this.engine.layerManager.textureCache.size;
        }
        
        if (this.engine.progressiveLoader && this.engine.progressiveLoader.cache) {
            stats.progressiveImages = this.engine.progressiveLoader.cache.size;
        }
        
        return stats;
    }
    
    /**
     * Register memory pressure callback
     */
    onMemoryPressure(callback) {
        this.pressureCallbacks.push(callback);
    }
    
    /**
     * Notify memory pressure callbacks
     */
    notifyPressureCallbacks(level) {
        this.pressureCallbacks.forEach(callback => {
            try {
                callback(level, this.memoryStats);
            } catch (error) {
                console.error('Memory pressure callback error:', error);
            }
        });
    }
    
    /**
     * Force memory cleanup (for manual testing)
     */
    forceCleanup(level = 'warning') {
        console.log(`🧹 Forcing ${level} level cleanup`);
        this.handleMemoryPressure(level);
    }
    
    /**
     * Get memory optimization recommendations
     */
    getOptimizationRecommendations() {
        const recommendations = [];
        const stats = this.getMemoryStats();
        
        if (stats.current.percentage > 80) {
            recommendations.push({
                priority: 'high',
                action: 'Clear texture caches',
                impact: 'High memory reduction',
                description: 'Clear all cached textures to free memory'
            });
        }
        
        if (stats.pools.sprites > 50) {
            recommendations.push({
                priority: 'medium',
                action: 'Optimize sprite pools',
                impact: 'Medium memory reduction',
                description: 'Reduce sprite pool size to save memory'
            });
        }
        
        if (stats.caches.progressiveImages > 20) {
            recommendations.push({
                priority: 'medium',
                action: 'Clear image cache',
                impact: 'Medium memory reduction',
                description: 'Clear progressive image cache'
            });
        }
        
        if (stats.current.percentage < 50) {
            recommendations.push({
                priority: 'low',
                action: 'No action needed',
                impact: 'Memory usage is healthy',
                description: 'Current memory usage is within acceptable limits'
            });
        }
        
        return recommendations;
    }
    
    /**
     * Destroy memory optimizer
     */
    destroy() {
        console.log('🧠 Destroying Memory Optimizer...');
        
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
        
        // Clear all pools
        this.clearObjectPools();
        
        // Clear callbacks
        this.pressureCallbacks = [];
        
        console.log('✅ Memory Optimizer destroyed');
    }
}

// Export for use in other modules
window.LoftTourMemoryOptimizer = LoftTourMemoryOptimizer;