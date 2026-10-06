/**
 * LOFT³ Mobile Optimization Module
 * Handles image compression, lazy loading, and mobile-specific performance optimizations
 */

class MobileOptimization {
    constructor() {
        this.isEnabled = this.detectMobile();
        this.compressionSettings = {
            maxWidth: 2048,
            maxHeight: 1024,
            quality: 0.8,
            format: 'image/jpeg'
        };
        
        // Initialize network optimizer integration
        this.networkOptimizer = null;
        this.initNetworkOptimizer();
        
        // Initialize device capability manager if available
        this.deviceCapabilityManager = null;
        this.initDeviceCapabilityManager();
        
        // Fallback to basic detection if manager not available
        if (!this.deviceCapabilityManager) {
            this.deviceCapabilities = this.detectDeviceCapabilities();
            this.adjustSettingsForDevice();
        }
        
        // Setup network optimization event listeners
        this.setupNetworkOptimizationListeners();
        
        console.log('Mobile optimization initialized:', {
            enabled: this.isEnabled,
            hasCapabilityManager: !!this.deviceCapabilityManager,
            hasNetworkOptimizer: !!this.networkOptimizer,
            capabilities: this.deviceCapabilities || 'managed by DeviceCapabilityManager'
        });
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
                    prefetchStrategy: 'smart'
                });
                
                console.log('✅ Network optimizer integrated with mobile optimization');
                
            } catch (error) {
                console.warn('⚠️ Failed to initialize network optimizer:', error);
                this.networkOptimizer = null;
            }
        }
    }
    
    /**
     * Setup network optimization event listeners
     */
    setupNetworkOptimizationListeners() {
        // Listen for network changes
        window.addEventListener('networkchange', (event) => {
            const { networkSpeed, optimizations } = event.detail;
            this.handleNetworkChange(networkSpeed, optimizations);
        });
        
        // Listen for image quality changes
        window.addEventListener('imagequalitychange', (event) => {
            const { mode } = event.detail;
            this.handleImageQualityChange(mode);
        });
        
        // Listen for compression changes
        window.addEventListener('compressionchange', (event) => {
            const { mode } = event.detail;
            this.handleCompressionChange(mode);
        });
    }
    
    /**
     * Handle network change events
     */
    handleNetworkChange(networkSpeed, optimizations) {
        console.log('📡 Mobile optimization responding to network change:', networkSpeed);
        
        // Adjust compression settings based on network speed
        switch (networkSpeed) {
            case 'very-slow':
                this.compressionSettings.quality = 0.3;
                this.compressionSettings.maxWidth = 512;
                this.compressionSettings.maxHeight = 256;
                break;
                
            case 'slow':
                this.compressionSettings.quality = 0.5;
                this.compressionSettings.maxWidth = 1024;
                this.compressionSettings.maxHeight = 512;
                break;
                
            case 'moderate':
                this.compressionSettings.quality = 0.7;
                this.compressionSettings.maxWidth = 1536;
                this.compressionSettings.maxHeight = 768;
                break;
                
            case 'fast':
            case 'very-fast':
                this.compressionSettings.quality = 0.8;
                this.compressionSettings.maxWidth = 2048;
                this.compressionSettings.maxHeight = 1024;
                break;
        }
        
        console.log('🔧 Compression settings updated for network speed:', this.compressionSettings);
    }
    
    /**
     * Handle image quality change events
     */
    handleImageQualityChange(mode) {
        switch (mode) {
            case 'minimal':
                this.compressionSettings.quality = 0.3;
                this.compressionSettings.maxWidth = 512;
                this.compressionSettings.maxHeight = 256;
                break;
                
            case 'low':
                this.compressionSettings.quality = 0.5;
                this.compressionSettings.maxWidth = 1024;
                this.compressionSettings.maxHeight = 512;
                break;
                
            case 'medium':
                this.compressionSettings.quality = 0.7;
                this.compressionSettings.maxWidth = 1536;
                this.compressionSettings.maxHeight = 768;
                break;
                
            case 'high':
                this.compressionSettings.quality = 0.85;
                this.compressionSettings.maxWidth = 2048;
                this.compressionSettings.maxHeight = 1024;
                break;
        }
        
        console.log('🖼️ Image quality mode changed:', mode, this.compressionSettings);
    }
    
    /**
     * Handle compression change events
     */
    handleCompressionChange(mode) {
        switch (mode) {
            case 'aggressive':
                this.compressionSettings.quality *= 0.7;
                this.compressionSettings.targetSize = 1.5 * 1024 * 1024; // 1.5MB
                break;
                
            case 'high':
                this.compressionSettings.quality *= 0.8;
                this.compressionSettings.targetSize = 2 * 1024 * 1024; // 2MB
                break;
                
            case 'standard':
            default:
                // Keep current settings
                break;
        }
        
        console.log('🗜️ Compression mode changed:', mode, this.compressionSettings);
    }
    
    /**
     * Initialize device capability manager integration
     */
    async initDeviceCapabilityManager() {
        if (typeof DeviceCapabilityManager !== 'undefined') {
            try {
                this.deviceCapabilityManager = new DeviceCapabilityManager({
                    enableMonitoring: true,
                    enableAdaptiveQuality: true,
                    enableBatteryOptimization: true
                });
                
                // Wait for initialization
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Get optimized settings from capability manager
                const capabilities = this.deviceCapabilityManager.getCapabilities();
                this.compressionSettings = this.mapCapabilitySettingsToCompression(capabilities.currentSettings);
                
                // Register for quality change notifications
                this.deviceCapabilityManager.onQualityChange((direction, settings) => {
                    console.log(`📱 Mobile optimization: Quality adjusted ${direction}`);
                    this.compressionSettings = this.mapCapabilitySettingsToCompression(settings);
                });
                
                console.log('✅ Device capability manager integrated with mobile optimization');
                
            } catch (error) {
                console.warn('⚠️ Failed to initialize device capability manager:', error);
                this.deviceCapabilityManager = null;
            }
        }
    }
    
    /**
     * Map device capability settings to compression settings
     */
    mapCapabilitySettingsToCompression(capabilitySettings) {
        return {
            maxWidth: capabilitySettings.maxImageWidth,
            maxHeight: capabilitySettings.maxImageHeight,
            quality: capabilitySettings.imageQuality,
            format: capabilitySettings.imageFormat || 'image/jpeg',
            targetSize: 2.5 * 1024 * 1024 // 2.5MB target
        };
    }
    
    /**
     * Get current device capabilities (from manager or fallback)
     */
    getCurrentCapabilities() {
        if (this.deviceCapabilityManager) {
            return this.deviceCapabilityManager.getCapabilities();
        }
        
        return {
            capabilities: this.deviceCapabilities,
            currentSettings: this.compressionSettings,
            qualityTier: this.deviceCapabilities?.performanceTier || 'medium'
        };
    }
    
    /**
     * Detect if device is mobile
     */
    detectMobile() {
        const userAgent = navigator.userAgent;
        const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        const isTouchDevice = navigator.maxTouchPoints && navigator.maxTouchPoints > 2;
        const isSmallScreen = window.innerWidth <= 768;
        
        return isMobileUA || (isTouchDevice && isSmallScreen);
    }
    
    /**
     * Enhanced device capability detection
     */
    detectDeviceCapabilities() {
        const capabilities = {
            deviceMemory: navigator.deviceMemory || 4,
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                saveData: navigator.connection.saveData,
                rtt: navigator.connection.rtt
            } : null,
            pixelRatio: window.devicePixelRatio || 1,
            screenSize: {
                width: window.screen.width,
                height: window.screen.height
            },
            // Enhanced GPU detection
            gpu: this.detectGPUCapabilities(),
            // Battery status for power-aware optimization
            battery: this.detectBatteryStatus(),
            // Performance tier classification
            performanceTier: 'medium'
        };
        
        // Classify performance tier
        capabilities.performanceTier = this.classifyPerformanceTier(capabilities);
        
        return capabilities;
    }
    
    /**
     * Detect GPU capabilities
     */
    detectGPUCapabilities() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            
            if (!gl) {
                return { tier: 'low', renderer: 'unknown' };
            }
            
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            const renderer = debugInfo ? 
                gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 
                gl.getParameter(gl.RENDERER);
            
            // Classify GPU tier based on renderer string
            let tier = 'medium';
            
            if (renderer.includes('Mali-4') || 
                renderer.includes('Adreno (TM) 3') || 
                renderer.includes('PowerVR SGX')) {
                tier = 'low';
            } else if (renderer.includes('Mali-G') || 
                       renderer.includes('Adreno (TM) 6') || 
                       renderer.includes('Apple GPU') ||
                       renderer.includes('GeForce') ||
                       renderer.includes('Radeon')) {
                tier = 'high';
            }
            
            return { tier, renderer };
            
        } catch (error) {
            return { tier: 'medium', renderer: 'unknown' };
        }
    }
    
    /**
     * Detect battery status for power-aware optimization
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
     * Classify overall performance tier
     */
    classifyPerformanceTier(capabilities) {
        let score = 0;
        
        // Memory score (0-3)
        if (capabilities.deviceMemory >= 8) score += 3;
        else if (capabilities.deviceMemory >= 4) score += 2;
        else if (capabilities.deviceMemory >= 2) score += 1;
        
        // GPU score (0-3)
        if (capabilities.gpu.tier === 'high') score += 3;
        else if (capabilities.gpu.tier === 'medium') score += 2;
        else score += 1;
        
        // Connection score (0-2)
        if (capabilities.connection) {
            if (capabilities.connection.effectiveType === '4g' && !capabilities.connection.saveData) {
                score += 2;
            } else if (capabilities.connection.effectiveType === '3g') {
                score += 1;
            }
        } else {
            score += 2; // Assume good connection if unknown
        }
        
        // CPU cores (0-2)
        const cores = navigator.hardwareConcurrency || 4;
        if (cores >= 8) score += 2;
        else if (cores >= 4) score += 1;
        
        // Classify based on total score
        if (score >= 8) return 'high';
        else if (score >= 5) return 'medium';
        else return 'low';
    }
    
    /**
     * Adjust compression settings based on device capabilities and performance tier
     */
    adjustSettingsForDevice() {
        const caps = this.deviceCapabilities;
        const tier = caps.performanceTier;
        
        // Base settings by performance tier
        const tierSettings = {
            low: {
                maxWidth: 1024,
                maxHeight: 512,
                quality: 0.5,
                format: 'image/jpeg'
            },
            medium: {
                maxWidth: 2048,
                maxHeight: 1024,
                quality: 0.7,
                format: 'image/jpeg'
            },
            high: {
                maxWidth: 4096,
                maxHeight: 2048,
                quality: 0.85,
                format: 'image/jpeg'
            }
        };
        
        this.compressionSettings = { ...tierSettings[tier] };
        
        // Fine-tune based on specific conditions
        
        // Adjust for low memory devices
        if (caps.deviceMemory < 2) {
            this.compressionSettings.maxWidth = Math.min(this.compressionSettings.maxWidth, 1024);
            this.compressionSettings.maxHeight = Math.min(this.compressionSettings.maxHeight, 512);
            this.compressionSettings.quality *= 0.8;
        }
        
        // Adjust for slow connections
        if (caps.connection) {
            if (caps.connection.effectiveType === '2g' || caps.connection.saveData) {
                this.compressionSettings.maxWidth = Math.min(this.compressionSettings.maxWidth, 1024);
                this.compressionSettings.maxHeight = Math.min(this.compressionSettings.maxHeight, 512);
                this.compressionSettings.quality = Math.min(this.compressionSettings.quality, 0.5);
            } else if (caps.connection.effectiveType === '3g') {
                this.compressionSettings.maxWidth = Math.min(this.compressionSettings.maxWidth, 1536);
                this.compressionSettings.maxHeight = Math.min(this.compressionSettings.maxHeight, 768);
                this.compressionSettings.quality = Math.min(this.compressionSettings.quality, 0.6);
            }
        }
        
        // Adjust for high DPI displays (but cap to prevent excessive sizes)
        if (caps.pixelRatio > 2 && tier === 'high') {
            const multiplier = Math.min(caps.pixelRatio / 2, 1.5);
            this.compressionSettings.maxWidth = Math.min(this.compressionSettings.maxWidth * multiplier, 4096);
            this.compressionSettings.maxHeight = Math.min(this.compressionSettings.maxHeight * multiplier, 2048);
        }
        
        // Battery-aware optimization
        if (caps.battery && caps.battery.level < 0.2 && !caps.battery.charging) {
            console.log('Low battery detected, reducing quality for power saving');
            this.compressionSettings.quality *= 0.7;
            this.compressionSettings.maxWidth = Math.min(this.compressionSettings.maxWidth, 1536);
            this.compressionSettings.maxHeight = Math.min(this.compressionSettings.maxHeight, 768);
        }
        
        // Ensure we never exceed 3MB target
        this.compressionSettings.targetSize = 2.5 * 1024 * 1024; // 2.5MB target for safety margin
        
        console.log('Compression settings adjusted for', tier, 'tier:', this.compressionSettings);
    }
    
    /**
     * Compress image for mobile devices with enhanced quality control
     */
    async compressImage(file, customSettings = {}) {
        if (!this.isEnabled) {
            return file;
        }
        
        const settings = { ...this.compressionSettings, ...customSettings };
        const maxSize = 3 * 1024 * 1024; // 3MB hard limit
        
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                try {
                    // Calculate new dimensions
                    let { width, height } = this.calculateDimensions(
                        img.width, 
                        img.height, 
                        settings.maxWidth, 
                        settings.maxHeight
                    );
                    
                    // Set canvas dimensions
                    canvas.width = width;
                    canvas.height = height;
                    
                    // Draw with high quality settings
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Try different quality levels to meet size requirement
                    this.compressToTargetSize(canvas, file, settings, maxSize)
                        .then(resolve)
                        .catch(reject);
                    
                } catch (error) {
                    reject(error);
                }
            };
            
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = URL.createObjectURL(file);
        });
    }
    
    /**
     * Compress canvas to target file size with iterative quality adjustment
     */
    async compressToTargetSize(canvas, originalFile, settings, maxSize) {
        return new Promise((resolve, reject) => {
            let quality = settings.quality;
            let attempts = 0;
            const maxAttempts = 5;
            
            const tryCompress = () => {
                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error('Compression failed'));
                        return;
                    }
                    
                    attempts++;
                    
                    // Check if size is acceptable
                    if (blob.size <= maxSize || attempts >= maxAttempts) {
                        const compressedFile = new File([blob], originalFile.name, {
                            type: settings.format,
                            lastModified: Date.now()
                        });
                        
                        const compressionRatio = ((originalFile.size - blob.size) / originalFile.size * 100).toFixed(1);
                        console.log(`Image compressed (attempt ${attempts}): ${(originalFile.size / 1024 / 1024).toFixed(2)}MB → ${(blob.size / 1024 / 1024).toFixed(2)}MB (${compressionRatio}% reduction)`);
                        
                        resolve(compressedFile);
                        return;
                    }
                    
                    // Reduce quality and try again
                    quality *= 0.8;
                    console.log(`File still too large (${(blob.size / 1024 / 1024).toFixed(2)}MB), reducing quality to ${(quality * 100).toFixed(0)}%`);
                    
                    setTimeout(tryCompress, 10); // Small delay to prevent blocking
                    
                }, settings.format, quality);
            };
            
            tryCompress();
        });
    }
    
    /**
     * Calculate optimal dimensions maintaining aspect ratio
     */
    calculateDimensions(originalWidth, originalHeight, maxWidth, maxHeight) {
        let width = originalWidth;
        let height = originalHeight;
        
        // Scale down if too large
        if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
        }
        
        if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
        }
        
        return { width: Math.round(width), height: Math.round(height) };
    }
    
    /**
     * Create progressive loading system with multiple resolution tiers
     */
    createProgressiveLoader() {
        return {
            loadImage: (src, onProgress) => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    
                    // Track loading progress (approximation)
                    let progress = 0;
                    const progressInterval = setInterval(() => {
                        progress += Math.random() * 20;
                        if (progress > 90) progress = 90;
                        onProgress?.(progress);
                    }, 100);
                    
                    img.onload = () => {
                        clearInterval(progressInterval);
                        onProgress?.(100);
                        resolve(img);
                    };
                    
                    img.onerror = () => {
                        clearInterval(progressInterval);
                        reject(new Error(`Failed to load image: ${src}`));
                    };
                    
                    img.src = src;
                });
            },
            
            /**
             * Load image with progressive quality tiers
             */
            loadImageProgressive: (baseSrc, onProgress) => {
                return new Promise((resolve, reject) => {
                    const resolutions = this.getProgressiveResolutions(baseSrc);
                    let currentTier = 0;
                    
                    const loadNextTier = () => {
                        if (currentTier >= resolutions.length) {
                            resolve(resolutions[resolutions.length - 1].img);
                            return;
                        }
                        
                        const tier = resolutions[currentTier];
                        const img = new Image();
                        
                        img.onload = () => {
                            tier.img = img;
                            onProgress?.({
                                tier: currentTier + 1,
                                totalTiers: resolutions.length,
                                resolution: tier.resolution,
                                size: tier.expectedSize
                            });
                            
                            currentTier++;
                            
                            // Continue loading next tier in background
                            if (currentTier < resolutions.length) {
                                setTimeout(loadNextTier, 100);
                            } else {
                                resolve(img);
                            }
                        };
                        
                        img.onerror = () => {
                            console.warn(`Failed to load tier ${currentTier + 1}, trying next`);
                            currentTier++;
                            loadNextTier();
                        };
                        
                        img.src = tier.src;
                    };
                    
                    loadNextTier();
                });
            },
            
            preloadNext: (imageUrls, currentIndex) => {
                // Preload next 1-2 images based on device capabilities
                const preloadCount = this.deviceCapabilities.deviceMemory >= 4 ? 2 : 1;
                
                for (let i = 1; i <= preloadCount; i++) {
                    const nextIndex = currentIndex + i;
                    if (nextIndex < imageUrls.length) {
                        // Use progressive loading for preloading
                        this.preloadImageProgressive(imageUrls[nextIndex]);
                        console.log(`Preloading image ${nextIndex + 1} with progressive quality`);
                    }
                }
            }
        };
    }
    
    /**
     * Get progressive resolution tiers for an image
     */
    getProgressiveResolutions(baseSrc) {
        const tiers = [];
        
        // Low quality tier (fast loading)
        tiers.push({
            src: this.getResolutionVariant(baseSrc, 'low'),
            resolution: '1024x512',
            expectedSize: '200KB'
        });
        
        // Medium quality tier (balanced)
        if (this.deviceCapabilities.deviceMemory >= 2) {
            tiers.push({
                src: this.getResolutionVariant(baseSrc, 'medium'),
                resolution: '2048x1024',
                expectedSize: '800KB'
            });
        }
        
        // High quality tier (full resolution)
        if (this.deviceCapabilities.deviceMemory >= 4 && 
            (!this.deviceCapabilities.connection || 
             this.deviceCapabilities.connection.effectiveType !== '2g')) {
            tiers.push({
                src: this.getResolutionVariant(baseSrc, 'high'),
                resolution: '4096x2048',
                expectedSize: '2.5MB'
            });
        }
        
        return tiers;
    }
    
    /**
     * Get resolution variant URL
     */
    getResolutionVariant(baseSrc, quality) {
        // If the image system supports multiple resolutions, use them
        // Otherwise, return the base source
        const extension = baseSrc.split('.').pop();
        const baseName = baseSrc.replace(`.${extension}`, '');
        
        switch (quality) {
            case 'low':
                return `${baseName}_low.${extension}`;
            case 'medium':
                return `${baseName}_medium.${extension}`;
            case 'high':
            default:
                return baseSrc;
        }
    }
    
    /**
     * Preload image with progressive quality
     */
    async preloadImageProgressive(src) {
        try {
            const resolutions = this.getProgressiveResolutions(src);
            
            // Load lowest quality first for immediate availability
            const lowQualityImg = new Image();
            lowQualityImg.src = resolutions[0].src;
            
            // Load higher qualities in background
            resolutions.slice(1).forEach((tier, index) => {
                setTimeout(() => {
                    const img = new Image();
                    img.src = tier.src;
                }, (index + 1) * 200);
            });
            
        } catch (error) {
            console.warn('Progressive preload failed:', error);
        }
    }
    
    /**
     * Enhanced lazy loading with progressive quality and caching
     */
    setupLazyLoading() {
        if (!('IntersectionObserver' in window)) {
            console.warn('IntersectionObserver not supported, falling back to immediate loading');
            return null;
        }
        
        // Create cache for loaded images
        this.imageCache = new Map();
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.dataset.src;
                    
                    if (src) {
                        this.loadImageLazy(img, src);
                        observer.unobserve(img);
                    }
                }
            });
        }, {
            rootMargin: '100px 0px', // Increased margin for better preloading
            threshold: 0.1
        });
        
        return observer;
    }
    
    /**
     * Load image lazily with progressive quality
     */
    async loadImageLazy(imgElement, src) {
        try {
            // Check cache first
            if (this.imageCache.has(src)) {
                const cachedData = this.imageCache.get(src);
                imgElement.src = cachedData.url;
                imgElement.removeAttribute('data-src');
                return;
            }
            
            // Show loading placeholder
            imgElement.classList.add('loading');
            
            // Load with progressive quality
            const resolutions = this.getProgressiveResolutions(src);
            
            // Load lowest quality first
            const lowQualityImg = new Image();
            lowQualityImg.onload = () => {
                imgElement.src = lowQualityImg.src;
                imgElement.classList.add('low-quality');
                
                // Load higher quality in background
                this.loadHigherQuality(imgElement, resolutions.slice(1));
            };
            
            lowQualityImg.onerror = () => {
                // Fallback to original source
                imgElement.src = src;
                imgElement.classList.remove('loading');
                imgElement.removeAttribute('data-src');
            };
            
            lowQualityImg.src = resolutions[0].src;
            
        } catch (error) {
            console.error('Lazy loading failed:', error);
            imgElement.src = src;
            imgElement.classList.remove('loading');
            imgElement.removeAttribute('data-src');
        }
    }
    
    /**
     * Load higher quality versions progressively
     */
    async loadHigherQuality(imgElement, higherResolutions) {
        for (const resolution of higherResolutions) {
            try {
                const img = new Image();
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                    img.src = resolution.src;
                });
                
                // Update to higher quality
                imgElement.src = img.src;
                imgElement.classList.remove('low-quality');
                imgElement.classList.remove('loading');
                
                // Cache the result
                this.imageCache.set(imgElement.dataset.originalSrc || imgElement.src, {
                    url: img.src,
                    quality: resolution.resolution,
                    loadTime: Date.now()
                });
                
                break; // Use the first successful higher quality load
                
            } catch (error) {
                console.warn(`Failed to load ${resolution.resolution} quality:`, error);
                continue;
            }
        }
        
        imgElement.classList.remove('loading', 'low-quality');
        imgElement.removeAttribute('data-src');
    }
    
    /**
     * Monitor network conditions and adjust quality
     */
    setupNetworkMonitoring() {
        if (!navigator.connection) {
            console.log('Network API not supported');
            return;
        }
        
        const connection = navigator.connection;
        
        const updateQuality = () => {
            const effectiveType = connection.effectiveType;
            const saveData = connection.saveData;
            
            if (saveData || effectiveType === '2g') {
                this.compressionSettings.quality = 0.4;
                this.compressionSettings.maxWidth = 1024;
            } else if (effectiveType === '3g') {
                this.compressionSettings.quality = 0.6;
                this.compressionSettings.maxWidth = 1536;
            } else {
                this.compressionSettings.quality = 0.8;
                this.compressionSettings.maxWidth = 2048;
            }
            
            console.log('Network quality adjusted:', {
                effectiveType,
                saveData,
                settings: this.compressionSettings
            });
        };
        
        // Initial check
        updateQuality();
        
        // Listen for changes
        connection.addEventListener('change', updateQuality);
    }
    
    /**
     * Get memory usage information
     */
    getMemoryInfo() {
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
     * Clean up resources to free memory
     */
    cleanupResources() {
        // Force garbage collection if available (Chrome DevTools)
        if (window.gc) {
            window.gc();
        }
        
        // Clear image caches
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (img.src && img.src.startsWith('blob:')) {
                URL.revokeObjectURL(img.src);
            }
        });
        
        console.log('Resources cleaned up');
    }
    
    /**
     * Get optimization statistics
     */
    getStats() {
        return {
            enabled: this.isEnabled,
            deviceCapabilities: this.deviceCapabilities,
            compressionSettings: this.compressionSettings,
            memoryInfo: this.getMemoryInfo()
        };
    }
}

// Export for use in other modules
window.MobileOptimization = MobileOptimization;