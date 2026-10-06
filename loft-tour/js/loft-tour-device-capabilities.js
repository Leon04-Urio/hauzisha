/**
 * LOFT³ Device Capability Detection and Quality Adjustment System
 * Comprehensive device analysis and adaptive quality management
 */

class DeviceCapabilityManager {
    constructor(config = {}) {
        this.config = {
            // Quality adjustment thresholds
            lowEndThreshold: 3,      // Score below this = low quality
            highEndThreshold: 8,     // Score above this = high quality
            
            // Performance monitoring
            enableMonitoring: true,
            monitoringInterval: 5000, // 5 seconds
            
            // Quality adjustment settings
            enableAdaptiveQuality: true,
            qualityAdjustmentDelay: 1000, // 1 second delay before adjustment
            
            // Battery optimization
            enableBatteryOptimization: true,
            lowBatteryThreshold: 0.2, // 20%
            
            ...config
        };
        
        // Device capability data
        this.capabilities = null;
        this.performanceScore = 0;
        this.qualityTier = 'medium';
        this.currentSettings = {};
        
        // Performance monitoring
        this.performanceHistory = [];
        this.monitoringActive = false;
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.currentFPS = 0;
        
        // Quality adjustment callbacks
        this.qualityChangeCallbacks = [];
        
        // Initialize
        this.init();
    }
    
    /**
     * Initialize device capability detection
     */
    async init() {
        console.log('🔍 Initializing Device Capability Manager...');
        
        try {
            // Detect all device capabilities
            this.capabilities = await this.detectAllCapabilities();
            
            // Calculate performance score
            this.performanceScore = this.calculatePerformanceScore();
            
            // Determine quality tier
            this.qualityTier = this.determineQualityTier();
            
            // Generate optimized settings
            this.currentSettings = this.generateQualitySettings();
            
            // Start performance monitoring if enabled
            if (this.config.enableMonitoring) {
                this.startPerformanceMonitoring();
            }
            
            console.log('✅ Device Capability Manager initialized:', {
                tier: this.qualityTier,
                score: this.performanceScore,
                settings: this.currentSettings
            });
            
        } catch (error) {
            console.error('❌ Failed to initialize Device Capability Manager:', error);
            // Fallback to safe defaults
            this.setFallbackCapabilities();
        }
    }
    
    /**
     * Detect comprehensive device capabilities
     */
    async detectAllCapabilities() {
        const capabilities = {
            // Hardware capabilities
            deviceMemory: this.detectMemory(),
            hardwareConcurrency: this.detectCPUCores(),
            pixelRatio: this.detectPixelRatio(),
            screenSize: this.detectScreenSize(),
            
            // GPU capabilities
            gpu: await this.detectGPUCapabilities(),
            webglSupport: this.detectWebGLSupport(),
            
            // Network capabilities
            connection: this.detectNetworkCapabilities(),
            
            // Battery status
            battery: await this.detectBatteryStatus(),
            
            // Device type and platform
            deviceType: this.detectDeviceType(),
            platform: this.detectPlatform(),
            browser: this.detectBrowser(),
            
            // Performance indicators
            performanceMemory: this.detectPerformanceMemory(),
            
            // Feature support
            features: this.detectFeatureSupport(),
            
            // Timestamp
            detectedAt: Date.now()
        };
        
        return capabilities;
    }
    
    /**
     * Detect device memory
     */
    detectMemory() {
        if ('deviceMemory' in navigator) {
            return navigator.deviceMemory;
        }
        
        // Fallback estimation based on other factors
        const userAgent = navigator.userAgent;
        
        if (/iPhone|iPad/.test(userAgent)) {
            // iOS device memory estimation
            if (/iPhone.*15|iPad.*15/.test(userAgent)) return 6;
            if (/iPhone.*14|iPad.*14/.test(userAgent)) return 6;
            if (/iPhone.*13|iPad.*13/.test(userAgent)) return 4;
            if (/iPhone.*12|iPad.*12/.test(userAgent)) return 4;
            return 3; // Older iOS devices
        }
        
        if (/Android/.test(userAgent)) {
            // Android device memory estimation
            const screenWidth = window.screen.width;
            const screenHeight = window.screen.height;
            const totalPixels = screenWidth * screenHeight;
            
            if (totalPixels > 2000000) return 6; // High-res Android
            if (totalPixels > 1000000) return 4; // Mid-range Android
            return 2; // Budget Android
        }
        
        // Desktop fallback
        return 8;
    }
    
    /**
     * Detect CPU cores
     */
    detectCPUCores() {
        return navigator.hardwareConcurrency || 4;
    }
    
    /**
     * Detect pixel ratio with capping
     */
    detectPixelRatio() {
        return Math.min(window.devicePixelRatio || 1, 3); // Cap at 3x for performance
    }
    
    /**
     * Detect screen size and characteristics
     */
    detectScreenSize() {
        return {
            width: window.screen.width,
            height: window.screen.height,
            availWidth: window.screen.availWidth,
            availHeight: window.screen.availHeight,
            innerWidth: window.innerWidth,
            innerHeight: window.innerHeight,
            orientation: window.screen.orientation?.type || 'unknown'
        };
    }
    
    /**
     * Detect GPU capabilities with enhanced analysis
     */
    async detectGPUCapabilities() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            
            if (!gl) {
                return { tier: 'none', renderer: 'none', version: 'none' };
            }
            
            // Get GPU info
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            const renderer = debugInfo ? 
                gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 
                gl.getParameter(gl.RENDERER);
            const vendor = debugInfo ? 
                gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 
                gl.getParameter(gl.VENDOR);
            
            // Detect WebGL version
            const version = gl instanceof WebGL2RenderingContext ? 'webgl2' : 'webgl1';
            
            // Get supported extensions
            const extensions = gl.getSupportedExtensions() || [];
            
            // Get limits
            const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
            const maxViewportDims = gl.getParameter(gl.MAX_VIEWPORT_DIMS);
            const maxVertexAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
            
            // Classify GPU tier based on comprehensive analysis
            const tier = this.classifyGPUTier(renderer, vendor, extensions, maxTextureSize);
            
            // Performance test
            const performanceScore = await this.runGPUPerformanceTest(gl);
            
            return {
                tier,
                renderer,
                vendor,
                version,
                extensions: extensions.length,
                maxTextureSize,
                maxViewportDims,
                maxVertexAttribs,
                performanceScore,
                supportsFloatTextures: extensions.includes('OES_texture_float'),
                supportsHalfFloatTextures: extensions.includes('OES_texture_half_float'),
                supportsAnisotropicFiltering: extensions.includes('EXT_texture_filter_anisotropic')
            };
            
        } catch (error) {
            console.warn('GPU detection failed:', error);
            return { tier: 'low', renderer: 'unknown', version: 'unknown' };
        }
    }
    
    /**
     * Classify GPU tier based on renderer and capabilities
     */
    classifyGPUTier(renderer, vendor, extensions, maxTextureSize) {
        const rendererLower = renderer.toLowerCase();
        const vendorLower = vendor.toLowerCase();
        
        // High-end GPUs
        if (rendererLower.includes('geforce rtx') ||
            rendererLower.includes('geforce gtx 16') ||
            rendererLower.includes('geforce gtx 20') ||
            rendererLower.includes('radeon rx') ||
            rendererLower.includes('apple m1') ||
            rendererLower.includes('apple m2') ||
            rendererLower.includes('apple gpu') ||
            rendererLower.includes('adreno 6') ||
            rendererLower.includes('mali-g7') ||
            rendererLower.includes('mali-g9') ||
            (maxTextureSize >= 16384 && extensions.length > 25)) {
            return 'high';
        }
        
        // Low-end GPUs
        if (rendererLower.includes('mali-4') ||
            rendererLower.includes('adreno 3') ||
            rendererLower.includes('powervr sgx') ||
            rendererLower.includes('intel hd 3000') ||
            rendererLower.includes('intel hd 4000') ||
            (maxTextureSize < 4096 || extensions.length < 10)) {
            return 'low';
        }
        
        // Medium-tier by default
        return 'medium';
    }
    
    /**
     * Run GPU performance test
     */
    async runGPUPerformanceTest(gl) {
        try {
            const startTime = performance.now();
            
            // Create a simple performance test
            const buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(10000), gl.STATIC_DRAW);
            
            // Simple draw operations
            for (let i = 0; i < 100; i++) {
                gl.clear(gl.COLOR_BUFFER_BIT);
            }
            
            gl.finish(); // Wait for GPU operations to complete
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            // Score based on duration (lower is better)
            if (duration < 10) return 'high';
            if (duration < 50) return 'medium';
            return 'low';
            
        } catch (error) {
            return 'unknown';
        }
    }
    
    /**
     * Detect WebGL support level
     */
    detectWebGLSupport() {
        const canvas = document.createElement('canvas');
        
        try {
            const webgl2 = canvas.getContext('webgl2');
            if (webgl2) return 'webgl2';
            
            const webgl1 = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (webgl1) return 'webgl1';
            
            return 'none';
        } catch (error) {
            return 'none';
        }
    }
    
    /**
     * Detect network capabilities
     */
    detectNetworkCapabilities() {
        if (!navigator.connection) {
            return null;
        }
        
        const connection = navigator.connection;
        
        return {
            effectiveType: connection.effectiveType,
            downlink: connection.downlink,
            downlinkMax: connection.downlinkMax,
            rtt: connection.rtt,
            saveData: connection.saveData,
            type: connection.type
        };
    }
    
    /**
     * Detect battery status
     */
    async detectBatteryStatus() {
        try {
            if ('getBattery' in navigator) {
                const battery = await navigator.getBattery();
                return {
                    level: battery.level,
                    charging: battery.charging,
                    chargingTime: battery.chargingTime,
                    dischargingTime: battery.dischargingTime
                };
            }
        } catch (error) {
            // Battery API not available or blocked
        }
        
        return null;
    }
    
    /**
     * Detect device type
     */
    detectDeviceType() {
        const userAgent = navigator.userAgent;
        
        if (/iPad/.test(userAgent)) return 'tablet';
        if (/iPhone|iPod/.test(userAgent)) return 'mobile';
        if (/Android/.test(userAgent)) {
            // Distinguish between Android tablets and phones
            if (window.innerWidth > 768) return 'tablet';
            return 'mobile';
        }
        if (/Windows Phone/.test(userAgent)) return 'mobile';
        
        return 'desktop';
    }
    
    /**
     * Detect platform
     */
    detectPlatform() {
        const userAgent = navigator.userAgent;
        
        if (/Windows/.test(userAgent)) return 'windows';
        if (/Mac OS X/.test(userAgent)) return 'macos';
        if (/Linux/.test(userAgent)) return 'linux';
        if (/Android/.test(userAgent)) return 'android';
        if (/iPhone|iPad|iPod/.test(userAgent)) return 'ios';
        
        return 'unknown';
    }
    
    /**
     * Detect browser
     */
    detectBrowser() {
        const userAgent = navigator.userAgent;
        
        if (/Chrome/.test(userAgent) && !/Edge/.test(userAgent)) return 'chrome';
        if (/Firefox/.test(userAgent)) return 'firefox';
        if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) return 'safari';
        if (/Edge/.test(userAgent)) return 'edge';
        
        return 'unknown';
    }
    
    /**
     * Detect performance memory info
     */
    detectPerformanceMemory() {
        if (performance.memory) {
            return {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            };
        }
        
        return null;
    }
    
    /**
     * Detect feature support
     */
    detectFeatureSupport() {
        return {
            intersectionObserver: 'IntersectionObserver' in window,
            resizeObserver: 'ResizeObserver' in window,
            webWorkers: 'Worker' in window,
            serviceWorkers: 'serviceWorker' in navigator,
            webAssembly: 'WebAssembly' in window,
            offscreenCanvas: 'OffscreenCanvas' in window,
            imageCapture: 'ImageCapture' in window,
            mediaDevices: 'mediaDevices' in navigator,
            geolocation: 'geolocation' in navigator,
            vibration: 'vibrate' in navigator,
            fullscreen: 'requestFullscreen' in document.documentElement,
            pointerEvents: 'PointerEvent' in window,
            touchEvents: 'ontouchstart' in window
        };
    }
    
    /**
     * Calculate overall performance score
     */
    calculatePerformanceScore() {
        let score = 0;
        const caps = this.capabilities;
        
        // Memory score (0-3 points)
        if (caps.deviceMemory >= 8) score += 3;
        else if (caps.deviceMemory >= 4) score += 2;
        else if (caps.deviceMemory >= 2) score += 1;
        
        // CPU score (0-2 points)
        if (caps.hardwareConcurrency >= 8) score += 2;
        else if (caps.hardwareConcurrency >= 4) score += 1;
        
        // GPU score (0-3 points)
        if (caps.gpu.tier === 'high') score += 3;
        else if (caps.gpu.tier === 'medium') score += 2;
        else if (caps.gpu.tier === 'low') score += 1;
        
        // Network score (0-2 points)
        if (caps.connection) {
            if (caps.connection.effectiveType === '4g' && !caps.connection.saveData) score += 2;
            else if (caps.connection.effectiveType === '3g') score += 1;
        } else {
            score += 1; // Assume decent connection if unknown
        }
        
        // Device type bonus/penalty
        if (caps.deviceType === 'desktop') score += 1;
        else if (caps.deviceType === 'mobile') score -= 1;
        
        // WebGL support bonus
        if (caps.webglSupport === 'webgl2') score += 1;
        else if (caps.webglSupport === 'webgl1') score += 0.5;
        
        return Math.max(0, Math.min(12, score)); // Cap between 0-12
    }
    
    /**
     * Determine quality tier based on performance score
     */
    determineQualityTier() {
        if (this.performanceScore >= this.config.highEndThreshold) {
            return 'high';
        } else if (this.performanceScore <= this.config.lowEndThreshold) {
            return 'low';
        } else {
            return 'medium';
        }
    }
    
    /**
     * Generate quality settings based on capabilities
     */
    generateQualitySettings() {
        const caps = this.capabilities;
        const tier = this.qualityTier;
        
        // Base settings by tier
        const tierSettings = {
            low: {
                // Image settings
                maxImageWidth: 1024,
                maxImageHeight: 512,
                imageQuality: 0.5,
                imageFormat: 'jpeg',
                
                // Rendering settings
                pixelRatio: 1,
                antialias: false,
                shadowMapSize: 512,
                maxLights: 2,
                
                // Performance settings
                targetFPS: 30,
                enableParallax: false,
                maxParallaxLayers: 3,
                enableTransitions: false,
                transitionDuration: 500,
                
                // Loading settings
                preloadCount: 1,
                enableProgressiveLoading: true,
                cacheSize: 25 * 1024 * 1024, // 25MB
                
                // Effects settings
                enableBloom: false,
                enableSSAO: false,
                enableMotionBlur: false
            },
            
            medium: {
                // Image settings
                maxImageWidth: 2048,
                maxImageHeight: 1024,
                imageQuality: 0.7,
                imageFormat: 'jpeg',
                
                // Rendering settings
                pixelRatio: Math.min(caps.pixelRatio, 2),
                antialias: true,
                shadowMapSize: 1024,
                maxLights: 4,
                
                // Performance settings
                targetFPS: 60,
                enableParallax: true,
                maxParallaxLayers: 8,
                enableTransitions: true,
                transitionDuration: 1000,
                
                // Loading settings
                preloadCount: 2,
                enableProgressiveLoading: true,
                cacheSize: 50 * 1024 * 1024, // 50MB
                
                // Effects settings
                enableBloom: false,
                enableSSAO: false,
                enableMotionBlur: false
            },
            
            high: {
                // Image settings
                maxImageWidth: 4096,
                maxImageHeight: 2048,
                imageQuality: 0.85,
                imageFormat: 'jpeg',
                
                // Rendering settings
                pixelRatio: Math.min(caps.pixelRatio, 2),
                antialias: true,
                shadowMapSize: 2048,
                maxLights: 8,
                
                // Performance settings
                targetFPS: 60,
                enableParallax: true,
                maxParallaxLayers: 15,
                enableTransitions: true,
                transitionDuration: 1200,
                
                // Loading settings
                preloadCount: 3,
                enableProgressiveLoading: true,
                cacheSize: 100 * 1024 * 1024, // 100MB
                
                // Effects settings
                enableBloom: true,
                enableSSAO: true,
                enableMotionBlur: true
            }
        };
        
        let settings = { ...tierSettings[tier] };
        
        // Apply specific adjustments based on capabilities
        
        // Memory adjustments
        if (caps.deviceMemory < 2) {
            settings.maxImageWidth = Math.min(settings.maxImageWidth, 1024);
            settings.maxImageHeight = Math.min(settings.maxImageHeight, 512);
            settings.cacheSize = Math.min(settings.cacheSize, 25 * 1024 * 1024);
            settings.maxParallaxLayers = Math.min(settings.maxParallaxLayers, 3);
        }
        
        // Network adjustments
        if (caps.connection) {
            if (caps.connection.effectiveType === '2g' || caps.connection.saveData) {
                settings.imageQuality = Math.min(settings.imageQuality, 0.4);
                settings.maxImageWidth = Math.min(settings.maxImageWidth, 1024);
                settings.preloadCount = 1;
                settings.enableProgressiveLoading = true;
            } else if (caps.connection.effectiveType === '3g') {
                settings.imageQuality = Math.min(settings.imageQuality, 0.6);
                settings.maxImageWidth = Math.min(settings.maxImageWidth, 1536);
            }
        }
        
        // GPU adjustments
        if (caps.gpu.tier === 'low') {
            settings.antialias = false;
            settings.shadowMapSize = Math.min(settings.shadowMapSize, 512);
            settings.maxLights = Math.min(settings.maxLights, 2);
            settings.enableBloom = false;
            settings.enableSSAO = false;
            settings.enableMotionBlur = false;
        }
        
        // Battery adjustments
        if (caps.battery && caps.battery.level < this.config.lowBatteryThreshold && !caps.battery.charging) {
            settings.targetFPS = Math.min(settings.targetFPS, 30);
            settings.imageQuality *= 0.8;
            settings.enableParallax = false;
            settings.enableTransitions = false;
            settings.antialias = false;
            console.log('🔋 Low battery detected, reducing quality for power saving');
        }
        
        // Mobile-specific adjustments
        if (caps.deviceType === 'mobile') {
            settings.pixelRatio = Math.min(settings.pixelRatio, 2);
            settings.cacheSize = Math.min(settings.cacheSize, 50 * 1024 * 1024);
            settings.preloadCount = Math.min(settings.preloadCount, 2);
        }
        
        return settings;
    }
    
    /**
     * Set fallback capabilities for error cases
     */
    setFallbackCapabilities() {
        this.capabilities = {
            deviceMemory: 4,
            hardwareConcurrency: 4,
            pixelRatio: 1,
            gpu: { tier: 'medium' },
            webglSupport: 'webgl1',
            connection: null,
            battery: null,
            deviceType: 'desktop',
            platform: 'unknown',
            browser: 'unknown'
        };
        
        this.performanceScore = 5;
        this.qualityTier = 'medium';
        this.currentSettings = this.generateQualitySettings();
        
        console.warn('⚠️ Using fallback device capabilities');
    }
    
    /**
     * Start performance monitoring
     */
    startPerformanceMonitoring() {
        if (this.monitoringActive) return;
        
        this.monitoringActive = true;
        this.lastFrameTime = performance.now();
        
        const monitor = () => {
            if (!this.monitoringActive) return;
            
            const currentTime = performance.now();
            const deltaTime = currentTime - this.lastFrameTime;
            
            this.frameCount++;
            
            // Calculate FPS every second
            if (deltaTime >= 1000) {
                this.currentFPS = Math.round((this.frameCount * 1000) / deltaTime);
                this.frameCount = 0;
                this.lastFrameTime = currentTime;
                
                // Store performance data
                this.performanceHistory.push({
                    timestamp: currentTime,
                    fps: this.currentFPS,
                    memoryUsage: this.getMemoryUsage()
                });
                
                // Keep only last 60 seconds of data
                const cutoff = currentTime - 60000;
                this.performanceHistory = this.performanceHistory.filter(p => p.timestamp > cutoff);
                
                // Check if quality adjustment is needed
                if (this.config.enableAdaptiveQuality) {
                    this.checkPerformanceAndAdjust();
                }
            }
            
            requestAnimationFrame(monitor);
        };
        
        requestAnimationFrame(monitor);
        console.log('📊 Performance monitoring started');
    }
    
    /**
     * Stop performance monitoring
     */
    stopPerformanceMonitoring() {
        this.monitoringActive = false;
        console.log('📊 Performance monitoring stopped');
    }
    
    /**
     * Get current memory usage
     */
    getMemoryUsage() {
        if (performance.memory) {
            return {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            };
        }
        return null;
    }
    
    /**
     * Check performance and adjust quality if needed
     */
    checkPerformanceAndAdjust() {
        if (this.performanceHistory.length < 5) return; // Need some data first
        
        const recentPerformance = this.performanceHistory.slice(-5);
        const avgFPS = recentPerformance.reduce((sum, p) => sum + p.fps, 0) / recentPerformance.length;
        const targetFPS = this.currentSettings.targetFPS;
        
        // Check if performance is consistently poor
        if (avgFPS < targetFPS * 0.7) {
            console.warn(`⚠️ Poor performance detected: ${avgFPS.toFixed(1)} FPS (target: ${targetFPS})`);
            this.adjustQualityDown();
        }
        // Check if performance is consistently good and we can increase quality
        else if (avgFPS > targetFPS * 1.2 && this.qualityTier !== 'high') {
            console.log(`✅ Good performance detected: ${avgFPS.toFixed(1)} FPS, considering quality increase`);
            this.adjustQualityUp();
        }
    }
    
    /**
     * Adjust quality down for better performance
     */
    adjustQualityDown() {
        const settings = this.currentSettings;
        let adjusted = false;
        
        // Reduce image quality first
        if (settings.imageQuality > 0.3) {
            settings.imageQuality = Math.max(0.3, settings.imageQuality * 0.8);
            adjusted = true;
        }
        
        // Reduce parallax layers
        if (settings.maxParallaxLayers > 3) {
            settings.maxParallaxLayers = Math.max(3, Math.floor(settings.maxParallaxLayers * 0.7));
            adjusted = true;
        }
        
        // Disable effects
        if (settings.enableBloom || settings.enableSSAO || settings.enableMotionBlur) {
            settings.enableBloom = false;
            settings.enableSSAO = false;
            settings.enableMotionBlur = false;
            adjusted = true;
        }
        
        // Disable antialiasing
        if (settings.antialias) {
            settings.antialias = false;
            adjusted = true;
        }
        
        // Reduce target FPS as last resort
        if (!adjusted && settings.targetFPS > 30) {
            settings.targetFPS = 30;
            adjusted = true;
        }
        
        if (adjusted) {
            console.log('📉 Quality adjusted down:', settings);
            this.notifyQualityChange('down', settings);
        }
    }
    
    /**
     * Adjust quality up for better visuals
     */
    adjustQualityUp() {
        const settings = this.currentSettings;
        let adjusted = false;
        
        // Increase image quality
        if (settings.imageQuality < 0.8) {
            settings.imageQuality = Math.min(0.8, settings.imageQuality * 1.2);
            adjusted = true;
        }
        
        // Enable antialiasing
        if (!settings.antialias && this.capabilities.gpu.tier !== 'low') {
            settings.antialias = true;
            adjusted = true;
        }
        
        // Increase parallax layers
        if (settings.maxParallaxLayers < 10) {
            settings.maxParallaxLayers = Math.min(10, settings.maxParallaxLayers + 2);
            adjusted = true;
        }
        
        if (adjusted) {
            console.log('📈 Quality adjusted up:', settings);
            this.notifyQualityChange('up', settings);
        }
    }
    
    /**
     * Register callback for quality changes
     */
    onQualityChange(callback) {
        this.qualityChangeCallbacks.push(callback);
    }
    
    /**
     * Notify registered callbacks of quality changes
     */
    notifyQualityChange(direction, settings) {
        this.qualityChangeCallbacks.forEach(callback => {
            try {
                callback(direction, settings, this.capabilities);
            } catch (error) {
                console.error('Quality change callback error:', error);
            }
        });
    }
    
    /**
     * Get current device capabilities
     */
    getCapabilities() {
        return {
            capabilities: this.capabilities,
            performanceScore: this.performanceScore,
            qualityTier: this.qualityTier,
            currentSettings: this.currentSettings,
            currentFPS: this.currentFPS,
            performanceHistory: this.performanceHistory.slice(-10) // Last 10 entries
        };
    }
    
    /**
     * Force quality tier change
     */
    setQualityTier(tier) {
        if (!['low', 'medium', 'high'].includes(tier)) {
            throw new Error('Invalid quality tier. Must be: low, medium, high');
        }
        
        this.qualityTier = tier;
        this.currentSettings = this.generateQualitySettings();
        
        console.log(`🎛️ Quality tier manually set to: ${tier}`);
        this.notifyQualityChange('manual', this.currentSettings);
    }
    
    /**
     * Get performance statistics
     */
    getPerformanceStats() {
        const recent = this.performanceHistory.slice(-10);
        
        if (recent.length === 0) {
            return {
                currentFPS: this.currentFPS,
                avgFPS: 0,
                minFPS: 0,
                maxFPS: 0,
                memoryUsage: this.getMemoryUsage()
            };
        }
        
        const fps = recent.map(p => p.fps);
        
        return {
            currentFPS: this.currentFPS,
            avgFPS: Math.round(fps.reduce((sum, f) => sum + f, 0) / fps.length),
            minFPS: Math.min(...fps),
            maxFPS: Math.max(...fps),
            memoryUsage: this.getMemoryUsage(),
            sampleCount: recent.length
        };
    }
    
    /**
     * Cleanup and destroy
     */
    destroy() {
        this.stopPerformanceMonitoring();
        this.qualityChangeCallbacks = [];
        this.performanceHistory = [];
        
        console.log('🧹 Device Capability Manager destroyed');
    }
}

// Export for use in other modules
window.DeviceCapabilityManager = DeviceCapabilityManager;