/**
 * LOFT³ Performance Profiler and Memory Optimizer
 * Comprehensive performance monitoring, profiling, and memory optimization system
 */

class LoftTourPerformanceProfiler {
    constructor(tourEngine, config = {}) {
        this.engine = tourEngine;
        this.config = {
            // Profiling settings
            enableProfiling: true,
            profilingInterval: 1000, // 1 second
            maxHistorySize: 300, // 5 minutes at 1s intervals
            
            // Memory optimization settings
            enableMemoryOptimization: true,
            memoryCheckInterval: 5000, // 5 seconds
            memoryThreshold: 0.8, // 80% of heap limit
            
            // Performance thresholds
            targetFPS: 60,
            lowFPSThreshold: 45,
            criticalFPSThreshold: 30,
            
            // Optimization settings
            enableAutoOptimization: true,
            optimizationDelay: 2000, // 2 seconds
            
            ...config
        };
        
        // Performance tracking
        this.performanceHistory = [];
        this.currentMetrics = {};
        this.isProfilerActive = false;
        
        // Memory tracking
        this.memoryHistory = [];
        this.memoryPressureLevel = 'normal'; // 'normal', 'moderate', 'high', 'critical'
        
        // Frame timing
        this.frameTimings = [];
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.currentFPS = 0;
        
        // Optimization state
        this.optimizationLevel = 0; // 0 = no optimization, 5 = maximum optimization
        this.lastOptimizationTime = 0;
        
        // Performance observers
        this.performanceObserver = null;
        this.resizeObserver = null;
        
        // Profiling intervals
        this.profilingInterval = null;
        this.memoryInterval = null;
        
        this.init();
    }
    
    /**
     * Initialize the performance profiler
     */
    init() {
        console.log('🔍 Initializing Performance Profiler...');
        
        try {
            this.setupPerformanceObservers();
            this.setupFrameTimingTracking();
            this.setupMemoryMonitoring();
            
            if (this.config.enableProfiling) {
                this.startProfiling();
            }
            
            console.log('✅ Performance Profiler initialized');
        } catch (error) {
            console.error('❌ Failed to initialize Performance Profiler:', error);
        }
    }
    
    /**
     * Setup performance observers for detailed metrics
     */
    setupPerformanceObservers() {
        // Performance Observer for navigation and resource timing
        if ('PerformanceObserver' in window) {
            try {
                this.performanceObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    this.processPerformanceEntries(entries);
                });
                
                // Observe different types of performance entries
                this.performanceObserver.observe({ 
                    entryTypes: ['navigation', 'resource', 'measure', 'mark'] 
                });
                
                console.log('📊 Performance Observer initialized');
            } catch (error) {
                console.warn('Performance Observer not supported:', error);
            }
        }
        
        // Resize Observer for viewport changes
        if ('ResizeObserver' in window) {
            try {
                this.resizeObserver = new ResizeObserver((entries) => {
                    this.handleViewportResize(entries);
                });
                
                this.resizeObserver.observe(this.engine.container);
                console.log('📐 Resize Observer initialized');
            } catch (error) {
                console.warn('Resize Observer not supported:', error);
            }
        }
    }
    
    /**
     * Setup frame timing tracking
     */
    setupFrameTimingTracking() {
        this.lastFrameTime = performance.now();
        
        const trackFrame = (timestamp) => {
            if (this.isProfilerActive) {
                const deltaTime = timestamp - this.lastFrameTime;
                
                // Track frame timing
                this.frameTimings.push(deltaTime);
                
                // Keep only last 60 frames for FPS calculation
                if (this.frameTimings.length > 60) {
                    this.frameTimings.shift();
                }
                
                // Calculate current FPS
                if (this.frameTimings.length >= 10) {
                    const avgFrameTime = this.frameTimings.reduce((a, b) => a + b, 0) / this.frameTimings.length;
                    this.currentFPS = Math.round(1000 / avgFrameTime);
                }
                
                this.frameCount++;
                this.lastFrameTime = timestamp;
            }
            
            requestAnimationFrame(trackFrame);
        };
        
        requestAnimationFrame(trackFrame);
    }
    
    /**
     * Setup memory monitoring
     */
    setupMemoryMonitoring() {
        if (!this.config.enableMemoryOptimization) return;
        
        this.memoryInterval = setInterval(() => {
            this.checkMemoryUsage();
        }, this.config.memoryCheckInterval);
    }
    
    /**
     * Start performance profiling
     */
    startProfiling() {
        if (this.isProfilerActive) return;
        
        this.isProfilerActive = true;
        
        this.profilingInterval = setInterval(() => {
            this.collectPerformanceMetrics();
        }, this.config.profilingInterval);
        
        console.log('📊 Performance profiling started');
    }
    
    /**
     * Stop performance profiling
     */
    stopProfiling() {
        this.isProfilerActive = false;
        
        if (this.profilingInterval) {
            clearInterval(this.profilingInterval);
            this.profilingInterval = null;
        }
        
        console.log('📊 Performance profiling stopped');
    }
    
    /**
     * Collect comprehensive performance metrics
     */
    collectPerformanceMetrics() {
        const timestamp = Date.now();
        
        // Basic performance metrics
        const metrics = {
            timestamp,
            fps: this.currentFPS,
            frameCount: this.frameCount,
            
            // Memory metrics
            memory: this.getMemoryMetrics(),
            
            // Engine-specific metrics
            engine: this.getEngineMetrics(),
            
            // Browser performance metrics
            browser: this.getBrowserMetrics(),
            
            // Network metrics
            network: this.getNetworkMetrics(),
            
            // GPU metrics
            gpu: this.getGPUMetrics(),
            
            // Optimization level
            optimizationLevel: this.optimizationLevel,
            memoryPressure: this.memoryPressureLevel
        };
        
        // Store metrics
        this.currentMetrics = metrics;
        this.performanceHistory.push(metrics);
        
        // Maintain history size limit
        if (this.performanceHistory.length > this.config.maxHistorySize) {
            this.performanceHistory.shift();
        }
        
        // Check if optimization is needed
        if (this.config.enableAutoOptimization) {
            this.checkAndOptimize(metrics);
        }
        
        // Log performance issues
        this.detectPerformanceIssues(metrics);
    }
    
    /**
     * Get memory metrics
     */
    getMemoryMetrics() {
        const metrics = {
            available: false,
            used: 0,
            total: 0,
            limit: 0,
            percentage: 0
        };
        
        if (performance.memory) {
            metrics.available = true;
            metrics.used = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
            metrics.total = Math.round(performance.memory.totalJSHeapSize / 1024 / 1024);
            metrics.limit = Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024);
            metrics.percentage = metrics.limit > 0 ? (metrics.used / metrics.limit) : 0;
        }
        
        return metrics;
    }
    
    /**
     * Get engine-specific metrics
     */
    getEngineMetrics() {
        const metrics = {
            isTransitioning: this.engine.isTransitioning,
            currentNode: this.engine.currentNode?.id || null,
            nodeIndex: this.engine.currentNodeIndex,
            totalNodes: this.engine.linearPath?.length || 0
        };
        
        // Layer manager metrics
        if (this.engine.layerManager) {
            const layerStats = this.engine.layerManager.getStats();
            metrics.layers = {
                count: layerStats.layerCount,
                visible: layerStats.visibleSprites,
                cached: layerStats.texturesCached,
                memoryUsage: layerStats.memoryUsage?.mb || 0,
                renderEfficiency: layerStats.renderEfficiency
            };
        }
        
        // Progressive loader metrics
        if (this.engine.progressiveLoader) {
            const loaderStats = this.engine.progressiveLoader.getStats();
            metrics.loader = {
                imagesLoaded: loaderStats.imagesLoaded,
                avgLoadTime: loaderStats.avgLoadTime,
                cacheHitRate: loaderStats.cacheHitRate,
                cacheSize: loaderStats.cacheSize
            };
        }
        
        // Device capability metrics
        if (this.engine.deviceCapabilityManager) {
            const capabilities = this.engine.deviceCapabilityManager.getCapabilities();
            metrics.device = {
                tier: capabilities.qualityTier,
                score: capabilities.performanceScore,
                currentFPS: capabilities.currentFPS
            };
        }
        
        return metrics;
    }
    
    /**
     * Get browser performance metrics
     */
    getBrowserMetrics() {
        const metrics = {};
        
        // Navigation timing
        if (performance.timing) {
            const timing = performance.timing;
            metrics.pageLoad = timing.loadEventEnd - timing.navigationStart;
            metrics.domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
        }
        
        // Resource timing summary
        if (performance.getEntriesByType) {
            const resources = performance.getEntriesByType('resource');
            metrics.resourceCount = resources.length;
            
            if (resources.length > 0) {
                const totalDuration = resources.reduce((sum, r) => sum + r.duration, 0);
                metrics.avgResourceTime = Math.round(totalDuration / resources.length);
            }
        }
        
        return metrics;
    }
    
    /**
     * Get network metrics
     */
    getNetworkMetrics() {
        const metrics = {};
        
        if (navigator.connection) {
            const conn = navigator.connection;
            metrics.effectiveType = conn.effectiveType;
            metrics.downlink = conn.downlink;
            metrics.rtt = conn.rtt;
            metrics.saveData = conn.saveData;
        }
        
        return metrics;
    }
    
    /**
     * Get GPU metrics
     */
    getGPUMetrics() {
        const metrics = {};
        
        if (this.engine.layerRenderer) {
            const renderer = this.engine.layerRenderer;
            const info = renderer.info;
            
            metrics.geometries = info.memory.geometries;
            metrics.textures = info.memory.textures;
            metrics.programs = info.programs?.length || 0;
            metrics.calls = info.render.calls;
            metrics.triangles = info.render.triangles;
            metrics.points = info.render.points;
            metrics.lines = info.render.lines;
        }
        
        return metrics;
    }
    
    /**
     * Check memory usage and optimize if needed
     */
    checkMemoryUsage() {
        const memoryMetrics = this.getMemoryMetrics();
        
        if (!memoryMetrics.available) return;
        
        // Store memory history
        this.memoryHistory.push({
            timestamp: Date.now(),
            ...memoryMetrics
        });
        
        // Keep only last 60 entries (5 minutes at 5s intervals)
        if (this.memoryHistory.length > 60) {
            this.memoryHistory.shift();
        }
        
        // Determine memory pressure level
        const percentage = memoryMetrics.percentage;
        let newPressureLevel = 'normal';
        
        if (percentage > 0.9) {
            newPressureLevel = 'critical';
        } else if (percentage > 0.8) {
            newPressureLevel = 'high';
        } else if (percentage > 0.6) {
            newPressureLevel = 'moderate';
        }
        
        // If pressure level changed, take action
        if (newPressureLevel !== this.memoryPressureLevel) {
            console.log(`🧠 Memory pressure changed: ${this.memoryPressureLevel} → ${newPressureLevel} (${(percentage * 100).toFixed(1)}%)`);
            this.memoryPressureLevel = newPressureLevel;
            
            // Trigger memory optimization
            this.optimizeMemoryUsage(newPressureLevel);
        }
    }
    
    /**
     * Optimize memory usage based on pressure level
     */
    optimizeMemoryUsage(pressureLevel) {
        console.log(`🧹 Optimizing memory usage for ${pressureLevel} pressure`);
        
        switch (pressureLevel) {
            case 'critical':
                this.performCriticalMemoryOptimization();
                break;
            case 'high':
                this.performHighMemoryOptimization();
                break;
            case 'moderate':
                this.performModerateMemoryOptimization();
                break;
            default:
                // Normal pressure - no immediate action needed
                break;
        }
    }
    
    /**
     * Perform critical memory optimization
     */
    performCriticalMemoryOptimization() {
        let optimized = 0;
        
        // 1. Clear all texture caches
        if (this.engine.layerManager) {
            this.engine.layerManager.clearTextureCache();
            optimized++;
        }
        
        if (this.engine.progressiveLoader) {
            this.engine.progressiveLoader.clearCache();
            optimized++;
        }
        
        // 2. Reduce layer count to minimum
        if (this.engine.layerManager && this.engine.layerManager.layers.length > 5) {
            const layersToRemove = this.engine.layerManager.layers.length - 5;
            for (let i = 0; i < layersToRemove; i++) {
                const layer = this.engine.layerManager.layers.pop();
                this.engine.layerScene.remove(layer);
                if (layer.material) {
                    if (layer.material.map) layer.material.map.dispose();
                    layer.material.dispose();
                }
            }
            optimized++;
        }
        
        // 3. Force garbage collection if available
        if (window.gc) {
            window.gc();
            optimized++;
        }
        
        // 4. Reduce quality settings
        if (this.engine.deviceCapabilityManager) {
            this.engine.deviceCapabilityManager.adjustQualityDown();
            optimized++;
        }
        
        console.log(`🚨 Critical memory optimization applied (${optimized} actions)`);
        this.optimizationLevel = Math.max(this.optimizationLevel, 4);
    }
    
    /**
     * Perform high memory optimization
     */
    performHighMemoryOptimization() {
        let optimized = 0;
        
        // 1. Clean up unused textures
        if (this.engine.layerManager) {
            optimized += this.engine.layerManager.optimizeMemory();
        }
        
        // 2. Reduce cache sizes
        if (this.engine.progressiveLoader) {
            this.engine.progressiveLoader.cleanupCache(true); // Aggressive cleanup
            optimized++;
        }
        
        // 3. Optimize sprite performance
        if (this.engine.layerManager && this.engine.layerManager.optimizeSpritePerformance) {
            optimized += this.engine.layerManager.optimizeSpritePerformance();
        }
        
        console.log(`⚠️ High memory optimization applied (${optimized} actions)`);
        this.optimizationLevel = Math.max(this.optimizationLevel, 3);
    }
    
    /**
     * Perform moderate memory optimization
     */
    performModerateMemoryOptimization() {
        let optimized = 0;
        
        // 1. Clean up old cache entries
        if (this.engine.progressiveLoader) {
            this.engine.progressiveLoader.cleanupCache();
            optimized++;
        }
        
        // 2. Optimize layer rendering
        if (this.engine.layerManager) {
            optimized += this.engine.layerManager.optimizeMemory();
        }
        
        console.log(`ℹ️ Moderate memory optimization applied (${optimized} actions)`);
        this.optimizationLevel = Math.max(this.optimizationLevel, 2);
    }
    
    /**
     * Check performance and apply optimizations
     */
    checkAndOptimize(metrics) {
        const now = Date.now();
        
        // Don't optimize too frequently
        if (now - this.lastOptimizationTime < this.config.optimizationDelay) {
            return;
        }
        
        let needsOptimization = false;
        let optimizationReason = '';
        
        // Check FPS
        if (metrics.fps < this.config.criticalFPSThreshold) {
            needsOptimization = true;
            optimizationReason = `Critical FPS: ${metrics.fps}`;
        } else if (metrics.fps < this.config.lowFPSThreshold) {
            // Check if consistently low
            const recentMetrics = this.performanceHistory.slice(-5);
            const avgFPS = recentMetrics.reduce((sum, m) => sum + m.fps, 0) / recentMetrics.length;
            
            if (avgFPS < this.config.lowFPSThreshold) {
                needsOptimization = true;
                optimizationReason = `Consistently low FPS: ${avgFPS.toFixed(1)}`;
            }
        }
        
        // Check memory pressure
        if (this.memoryPressureLevel === 'high' || this.memoryPressureLevel === 'critical') {
            needsOptimization = true;
            optimizationReason += ` Memory pressure: ${this.memoryPressureLevel}`;
        }
        
        if (needsOptimization) {
            console.log(`🔧 Performance optimization needed: ${optimizationReason}`);
            this.applyPerformanceOptimizations(metrics);
            this.lastOptimizationTime = now;
        }
    }
    
    /**
     * Apply performance optimizations
     */
    applyPerformanceOptimizations(metrics) {
        let optimizations = 0;
        
        // 1. Reduce quality if FPS is critically low
        if (metrics.fps < this.config.criticalFPSThreshold) {
            if (this.engine.deviceCapabilityManager) {
                this.engine.deviceCapabilityManager.adjustQualityDown();
                optimizations++;
            }
        }
        
        // 2. Optimize layer rendering
        if (this.engine.layerManager) {
            if (metrics.engine.layers && metrics.engine.layers.renderEfficiency < 0.7) {
                optimizations += this.engine.layerManager.optimizeSpritePerformance();
            }
        }
        
        // 3. Reduce preloading if memory pressure is high
        if (this.memoryPressureLevel === 'high' && this.engine.progressiveLoader) {
            // Reduce preload count temporarily
            this.engine.progressiveLoader.config.preloadCount = Math.max(1, 
                Math.floor(this.engine.progressiveLoader.config.preloadCount * 0.5));
            optimizations++;
        }
        
        // 4. Disable non-essential features
        if (metrics.fps < this.config.lowFPSThreshold) {
            if (this.engine.layerManager) {
                this.engine.layerManager.enableParallax = false;
                optimizations++;
            }
        }
        
        this.optimizationLevel = Math.min(5, this.optimizationLevel + 1);
        console.log(`⚡ Applied ${optimizations} performance optimizations (level ${this.optimizationLevel})`);
    }
    
    /**
     * Detect and log performance issues
     */
    detectPerformanceIssues(metrics) {
        const issues = [];
        
        // FPS issues
        if (metrics.fps < this.config.criticalFPSThreshold) {
            issues.push(`Critical FPS: ${metrics.fps} (target: ${this.config.targetFPS})`);
        } else if (metrics.fps < this.config.lowFPSThreshold) {
            issues.push(`Low FPS: ${metrics.fps} (target: ${this.config.targetFPS})`);
        }
        
        // Memory issues
        if (metrics.memory.available && metrics.memory.percentage > 0.8) {
            issues.push(`High memory usage: ${(metrics.memory.percentage * 100).toFixed(1)}%`);
        }
        
        // Layer rendering issues
        if (metrics.engine.layers && metrics.engine.layers.renderEfficiency < 0.6) {
            issues.push(`Poor layer render efficiency: ${(metrics.engine.layers.renderEfficiency * 100).toFixed(1)}%`);
        }
        
        // Network issues
        if (metrics.network.effectiveType === '2g' || metrics.network.saveData) {
            issues.push(`Slow network: ${metrics.network.effectiveType}, saveData: ${metrics.network.saveData}`);
        }
        
        // Log issues
        if (issues.length > 0) {
            console.warn('⚠️ Performance issues detected:', issues.join(', '));
        }
    }
    
    /**
     * Process performance entries from PerformanceObserver
     */
    processPerformanceEntries(entries) {
        entries.forEach(entry => {
            if (entry.entryType === 'resource') {
                // Track resource loading performance
                if (entry.duration > 1000) { // Slow resource
                    console.warn(`🐌 Slow resource load: ${entry.name} (${entry.duration.toFixed(0)}ms)`);
                }
            } else if (entry.entryType === 'measure') {
                // Track custom performance measures
                console.log(`📏 Performance measure: ${entry.name} = ${entry.duration.toFixed(2)}ms`);
            }
        });
    }
    
    /**
     * Handle viewport resize events
     */
    handleViewportResize(entries) {
        entries.forEach(entry => {
            const { width, height } = entry.contentRect;
            console.log(`📐 Viewport resized: ${width}x${height}`);
            
            // Trigger optimization check after resize
            setTimeout(() => {
                if (this.isProfilerActive) {
                    this.collectPerformanceMetrics();
                }
            }, 100);
        });
    }
    
    /**
     * Get comprehensive performance report
     */
    getPerformanceReport() {
        const recent = this.performanceHistory.slice(-10);
        const avgFPS = recent.length > 0 ? 
            recent.reduce((sum, m) => sum + m.fps, 0) / recent.length : 0;
        
        const memoryRecent = this.memoryHistory.slice(-5);
        const avgMemoryUsage = memoryRecent.length > 0 ?
            memoryRecent.reduce((sum, m) => sum + m.percentage, 0) / memoryRecent.length : 0;
        
        return {
            // Current state
            current: this.currentMetrics,
            
            // Averages
            averages: {
                fps: Math.round(avgFPS),
                memoryUsage: Math.round(avgMemoryUsage * 100)
            },
            
            // Optimization state
            optimization: {
                level: this.optimizationLevel,
                memoryPressure: this.memoryPressureLevel,
                lastOptimization: this.lastOptimizationTime
            },
            
            // History sizes
            history: {
                performance: this.performanceHistory.length,
                memory: this.memoryHistory.length,
                frames: this.frameTimings.length
            },
            
            // Status
            status: {
                profilerActive: this.isProfilerActive,
                memoryMonitoring: !!this.memoryInterval,
                autoOptimization: this.config.enableAutoOptimization
            }
        };
    }
    
    /**
     * Export performance data for analysis
     */
    exportPerformanceData() {
        return {
            config: this.config,
            performanceHistory: this.performanceHistory,
            memoryHistory: this.memoryHistory,
            frameTimings: this.frameTimings,
            optimizationLevel: this.optimizationLevel,
            memoryPressureLevel: this.memoryPressureLevel,
            exportedAt: Date.now()
        };
    }
    
    /**
     * Reset optimization level (for testing)
     */
    resetOptimizations() {
        this.optimizationLevel = 0;
        this.memoryPressureLevel = 'normal';
        
        // Re-enable features that might have been disabled
        if (this.engine.layerManager) {
            this.engine.layerManager.enableParallax = true;
        }
        
        console.log('🔄 Performance optimizations reset');
    }
    
    /**
     * Destroy the profiler and cleanup
     */
    destroy() {
        console.log('🔍 Destroying Performance Profiler...');
        
        this.stopProfiling();
        
        if (this.memoryInterval) {
            clearInterval(this.memoryInterval);
        }
        
        if (this.performanceObserver) {
            this.performanceObserver.disconnect();
        }
        
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        
        // Clear data
        this.performanceHistory = [];
        this.memoryHistory = [];
        this.frameTimings = [];
        
        console.log('✅ Performance Profiler destroyed');
    }
}

// Export for use in other modules
window.LoftTourPerformanceProfiler = LoftTourPerformanceProfiler;