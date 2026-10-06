/**
 * LOFT³ Tour Engine - Core Hybrid Rendering System
 * Combines Marzipano (panoramas) + Three.js (parallax layers)
 */

class LoftTourEngine {
    constructor(container, config = {}) {
        this.container = container;
        this.config = {
            controls: {
                mouseViewMode: 'drag',
                scrollZoom: false
            },
            ...config
        };
        
        // State management
        this.tourData = null;
        this.linearPath = []; // Linear walkthrough path following nextNode chain
        this.currentNode = null;
        this.currentNodeIndex = 0;
        this.isTransitioning = false;
        
        // Marzipano components
        this.marzipanoViewer = null;
        this.currentScene = null;
        this.currentView = null;
        
        // Three.js components for layers
        this.layerCanvas = null;
        this.layerScene = null;
        this.layerCamera = null;
        this.layerRenderer = null;
        
        // Managers
        this.transitionManager = null;
        this.layerManager = null;
        this.controlsManager = null;
        this.progressiveLoader = null;
        this.deviceCapabilityManager = null;
        this.performanceProfiler = null;
        this.memoryOptimizer = null;
        
        // Performance tracking
        this.frameCount = 0;
        this.lastFpsUpdate = Date.now();
        this.fps = 0;
        
        // Quality settings
        this.qualitySettings = null;
        
        this.init();
    }
    
    /**
     * Initialize the hybrid rendering system
     */
    async init() {
        try {
            // Initialize device capability manager first
            await this.initDeviceCapabilityManager();
            
            this.setupMarzipano();
            this.setupThreeJS();
            this.setupManagers();
            this.setupEventListeners();
            this.startRenderLoop();
            
            console.log('LOFT³ Tour Engine initialized successfully');
        } catch (error) {
            console.error('Failed to initialize LOFT³ Tour Engine:', error);
            throw error;
        }
    }
    
    /**
     * Initialize device capability manager
     */
    async initDeviceCapabilityManager() {
        // Check if performance monitoring is disabled in config
        if (this.config.enableDeviceCapabilities === false) {
            console.log('Device capability manager disabled by config');
            this.deviceCapabilityManager = null;
            this.qualitySettings = this.getDefaultQualitySettings();
            return;
        }
        
        if (typeof DeviceCapabilityManager !== 'undefined') {
            try {
                this.deviceCapabilityManager = new DeviceCapabilityManager({
                    enableMonitoring: true,
                    enableAdaptiveQuality: true,
                    enableBatteryOptimization: true
                });
                
                // Wait for initialization
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Get quality settings
                const capabilities = this.deviceCapabilityManager.getCapabilities();
                this.qualitySettings = capabilities.currentSettings;
                
                // Register for quality change notifications
                this.deviceCapabilityManager.onQualityChange((direction, settings) => {
                    console.log(`🎮 Engine: Quality adjusted ${direction}`);
                    this.qualitySettings = settings;
                    this.applyQualitySettings(settings);
                });
                
                console.log('✅ Device capability manager integrated with engine:', {
                    tier: capabilities.qualityTier,
                    settings: this.qualitySettings
                });
                
            } catch (error) {
                console.warn('⚠️ Failed to initialize device capability manager in engine:', error);
                this.deviceCapabilityManager = null;
                this.qualitySettings = this.getDefaultQualitySettings();
            }
        } else {
            console.log('DeviceCapabilityManager not available, using default settings');
            this.qualitySettings = this.getDefaultQualitySettings();
        }
    }
    
    /**
     * Get default quality settings
     */
    getDefaultQualitySettings() {
        return {
            pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
            antialias: true,
            targetFPS: 60,
            enableParallax: true,
            maxParallaxLayers: 8,
            enableTransitions: true,
            transitionDuration: 1000
        };
    }
    
    /**
     * Apply quality settings to the engine
     */
    applyQualitySettings(settings) {
        // Ensure settings is defined
        if (!settings) {
            console.warn('Quality settings is null/undefined, using defaults');
            settings = this.getDefaultQualitySettings();
        }
        
        // Update Three.js renderer settings
        if (this.layerRenderer) {
            this.layerRenderer.setPixelRatio(Math.min(settings.pixelRatio || 1, 2));
            
            // Update antialiasing (requires renderer recreation for WebGL)
            if (this.layerRenderer.getContext().getContextAttributes().antialias !== settings.antialias) {
                console.log('Antialiasing setting changed, will apply on next scene load');
            }
        }
        
        // Update layer manager settings
        if (this.layerManager && this.layerManager.setMaxLayers) {
            this.layerManager.setMaxLayers(settings.maxParallaxLayers || settings.maxLayers || 10);
        }
        
        // Update transition manager settings
        if (this.transitionManager && this.transitionManager.setDuration) {
            this.transitionManager.setDuration(settings.transitionDuration || 1000);
            this.transitionManager.setEnabled(settings.enableTransitions !== false);
        }
        
        console.log('Quality settings applied to engine:', settings);
    }
    
    /**
     * Setup Marzipano viewer for panorama rendering
     */
    setupMarzipano() {
        // Check if Marzipano is available
        if (typeof Marzipano === 'undefined') {
            throw new Error('Marzipano library not loaded');
        }
        
        // Use simple viewer configuration like the working basic implementation
        this.marzipanoViewer = new Marzipano.Viewer(this.container, {
            controls: {
                mouseViewMode: 'drag'
            }
        });
        
        console.log('Marzipano viewer initialized with simple configuration');
    }
    
    /**
     * Setup Three.js overlay system for parallax layers
     */
    setupThreeJS() {
        // Check if Three.js is available
        if (typeof THREE === 'undefined') {
            throw new Error('Three.js library not loaded');
        }
        
        // Create overlay canvas
        this.layerCanvas = document.createElement('canvas');
        this.layerCanvas.style.position = 'absolute';
        this.layerCanvas.style.top = '0';
        this.layerCanvas.style.left = '0';
        this.layerCanvas.style.width = '100%';
        this.layerCanvas.style.height = '100%';
        this.layerCanvas.style.pointerEvents = 'none';
        this.layerCanvas.style.zIndex = '10';
        this.container.appendChild(this.layerCanvas);
        
        // Setup Three.js scene
        this.layerScene = new THREE.Scene();
        
        // Setup orthographic camera for 2D overlay
        this.layerCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
        this.layerCamera.position.z = 1;
        
        // Setup WebGL renderer with performance optimizations based on device capabilities
        this.layerRenderer = new THREE.WebGLRenderer({
            canvas: this.layerCanvas,
            alpha: true,
            antialias: this.qualitySettings?.antialias !== false, // Use quality setting
            preserveDrawingBuffer: false,
            powerPreference: 'high-performance', // Request high-performance GPU
            failIfMajorPerformanceCaveat: false,
            precision: 'mediump', // Use medium precision for better performance
            stencil: false, // Disable stencil buffer (not needed)
            depth: false // Disable depth buffer for 2D overlay
        });
        
        this.layerRenderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.layerRenderer.setClearColor(0x000000, 0); // Transparent background
        
        // Use device capability manager pixel ratio if available
        const pixelRatio = this.qualitySettings?.pixelRatio || Math.min(window.devicePixelRatio, 2);
        this.layerRenderer.setPixelRatio(pixelRatio);
        
        // Optimize rendering
        this.layerRenderer.sortObjects = true; // Enable object sorting for transparency
        this.layerRenderer.autoClear = true;
        
        console.log('Three.js overlay system initialized with performance optimizations');
    }
    
    /**
     * Setup component managers
     */
    setupManagers() {
        this.transitionManager = new TransitionManager(this);
        this.layerManager = new LayerManager(this);
        this.controlsManager = new ControlsManager(this);
        
        // Initialize performance profiler and memory optimizer
        if (typeof LoftTourPerformanceProfiler !== 'undefined') {
            this.performanceProfiler = new LoftTourPerformanceProfiler(this, {
                enableProfiling: true,
                enableAutoOptimization: true
            });
            console.log('✅ Performance profiler integrated');
        }
        
        if (typeof LoftTourMemoryOptimizer !== 'undefined') {
            this.memoryOptimizer = new LoftTourMemoryOptimizer(this, {
                enableAutoCleanup: true
            });
            console.log('✅ Memory optimizer integrated');
        }
        
        // Initialize progressive loader if available
        if (typeof ProgressiveImageLoader !== 'undefined') {
            const loaderConfig = {
                strategy: 'adaptive',
                enableCache: true,
                maxCacheSize: this.qualitySettings?.cacheSize || 50 * 1024 * 1024,
                preloadCount: this.qualitySettings?.preloadCount || 2
            };
            
            this.progressiveLoader = new ProgressiveImageLoader(loaderConfig);
            console.log('Progressive image loader initialized with device-optimized settings');
        } else {
            console.warn('ProgressiveImageLoader not available, using standard loading');
        }
        
        console.log('Component managers initialized');
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => this.handleResize());
        
        // Marzipano view change events
        if (this.marzipanoViewer) {
            this.marzipanoViewer.addEventListener('sceneChange', () => {
                this.onSceneChange();
            });
        }
        
        // Performance monitoring
        this.container.addEventListener('click', () => {
            this.logPerformanceStats();
        });
    }
    
    /**
     * Setup camera synchronization between Marzipano and Three.js
     */
    setupCameraSync() {
        if (!this.currentView) {
            console.warn('Cannot setup camera sync: no current view');
            return;
        }
        
        // Listen for view changes from Marzipano with enhanced real-time sync
        this.currentView.addEventListener('change', () => {
            this.syncCameraToLayers();
        });
        
        // Add continuous sync for smooth parallax during user interaction
        this.startContinuousSync();
        
        console.log('Camera synchronization enabled with real-time parallax');
    }
    
    /**
     * Start continuous camera synchronization for real-time parallax
     */
    startContinuousSync() {
        // Clear any existing sync interval
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
        
        // Sync every 16ms (~60fps) for smooth parallax during interaction
        this.syncInterval = setInterval(() => {
            if (this.currentView && this.layerManager && !this.isTransitioning) {
                try {
                    // Get current camera parameters from Marzipano
                    const yaw = this.currentView.yaw();
                    const pitch = this.currentView.pitch();
                    const fov = this.currentView.fov();
                    
                    // Create coordinates object
                    const coords = { yaw, pitch, fov };
                    
                    // Update Three.js layers with real-time parallax effect
                    this.layerManager.updateParallax(coords);
                    
                } catch (error) {
                    // Silently handle if view not ready yet
                }
            }
        }, 16); // 60fps sync rate
        
        console.log('Continuous camera sync started for real-time parallax');
    }
    
    /**
     * Stop continuous camera synchronization
     */
    stopContinuousSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
            console.log('Continuous camera sync stopped');
        }
    }
    
    /**
     * Synchronize Marzipano camera to Three.js layers
     */
    syncCameraToLayers() {
        if (!this.currentView || !this.layerManager) {
            return;
        }
        
        try {
            // Get current camera parameters from Marzipano
            const yaw = this.currentView.yaw();
            const pitch = this.currentView.pitch();
            const fov = this.currentView.fov();
            
            // Create coordinates object
            const coords = { yaw, pitch, fov };
            
            // Update Three.js layers with parallax effect
            this.layerManager.updateParallax(coords);
            
            // Optional: Update Three.js camera to match Marzipano FOV
            if (this.layerCamera && fov) {
                this.updateThreeJSCameraFOV(fov);
            }
            
        } catch (error) {
            console.error('Camera sync error:', error);
        }
    }
    
    /**
     * Update Three.js camera FOV to match Marzipano
     */
    updateThreeJSCameraFOV(marzipanoFov) {
        // Marzipano uses radians, Three.js OrthographicCamera doesn't use FOV
        // But we can adjust the camera frustum to simulate FOV changes
        
        const fovDegrees = this.rad2deg(marzipanoFov);
        const fovFactor = fovDegrees / 75; // Normalize to default 75°
        
        // Adjust orthographic camera frustum
        const aspect = this.container.clientWidth / this.container.clientHeight;
        const frustumSize = fovFactor;
        
        this.layerCamera.left = -frustumSize * aspect;
        this.layerCamera.right = frustumSize * aspect;
        this.layerCamera.top = frustumSize;
        this.layerCamera.bottom = -frustumSize;
        
        this.layerCamera.updateProjectionMatrix();
    }
    
    /**
     * Handle window resize
     */
    handleResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        // Resize Marzipano stage for optimal quality
        if (this.marzipanoViewer && this.marzipanoViewer.stage()) {
            this.marzipanoViewer.stage().setSize({ width, height });
        }
        
        // Resize Three.js renderer
        if (this.layerRenderer) {
            this.layerRenderer.setSize(width, height);
        }
        
        // Update camera aspect ratio if needed
        if (this.layerCamera) {
            const aspect = width / height;
            this.layerCamera.left = -aspect;
            this.layerCamera.right = aspect;
            this.layerCamera.updateProjectionMatrix();
        }
    }
    
    /**
     * Start the main render loop with performance optimizations
     */
    startRenderLoop() {
        let lastSyncTime = 0;
        let lastRenderTime = 0;
        const targetFPS = 60;
        const frameTime = 1000 / targetFPS;
        const syncInterval = 16; // ~60fps, sync every frame
        
        // Performance monitoring
        this.performanceStats = {
            frameDrops: 0,
            avgFrameTime: 0,
            frameTimeSamples: []
        };
        
        // Adaptive quality settings
        this.qualityLevel = this.detectQualityLevel();
        this.applyQualitySettings(this.qualityLevel);
        
        const animate = (timestamp) => {
            this.animationId = requestAnimationFrame(animate);
            
            // Calculate frame time
            const frameTime = timestamp - lastRenderTime;
            
            // Track performance
            this.trackFramePerformance(frameTime);
            
            // Update FPS counter
            this.updateFPS();
            
            // Adaptive quality adjustment
            if (this.frameCount % 60 === 0) { // Check every 60 frames
                this.adjustQualityBasedOnPerformance();
            }
            
            // Sync Marzipano view with Three.js layers (throttled)
            if (timestamp - lastSyncTime >= syncInterval) {
                if (this.currentView && this.layerManager) {
                    try {
                        // Get view parameters from Marzipano
                        const yaw = this.currentView.yaw();
                        const pitch = this.currentView.pitch();
                        const fov = this.currentView.fov();
                        
                        // Create coordinates object for layer manager
                        const coords = { yaw, pitch, fov };
                        this.layerManager.updateParallax(coords);
                    } catch (error) {
                        // Silently handle if view not ready yet
                    }
                }
                lastSyncTime = timestamp;
            }
            
            // Render Three.js layers only if needed
            if (this.layerRenderer && this.layerScene && this.layerCamera) {
                // Only render if layers exist and are visible
                if (this.layerManager && this.layerManager.layers.length > 0) {
                    this.layerRenderer.render(this.layerScene, this.layerCamera);
                }
            }
            
            lastRenderTime = timestamp;
        };
        
        animate(0);
        console.log('Optimized render loop started with adaptive quality');
    }
    
    /**
     * Detect device quality level for adaptive rendering
     */
    detectQualityLevel() {
        // FORCE HIGH QUALITY for professional appearance
        // Adaptive quality was causing blurry images
        console.log('🎨 FORCING HIGH QUALITY MODE - No adaptive downgrade');
        return 'high';
        
        // Check device capabilities
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const hasHighDPI = window.devicePixelRatio > 1.5;
        const screenSize = window.innerWidth * window.innerHeight;
        
        // Check GPU capabilities
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        const debugInfo = gl ? gl.getExtension('WEBGL_debug_renderer_info') : null;
        const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
        
        // Detect low-end devices
        const isLowEnd = isMobile && (
            renderer.includes('Mali-4') ||
            renderer.includes('Adreno (TM) 3') ||
            renderer.includes('PowerVR SGX') ||
            navigator.hardwareConcurrency < 4
        );
        
        if (isLowEnd) {
            return 'low';
        } else if (isMobile) {
            return 'medium';
        } else if (hasHighDPI && screenSize > 2073600) { // > 1920x1080
            return 'high';
        } else {
            return 'medium';
        }
    }
    
    /**
     * Apply quality settings based on detected level
     */
    applyQualitySettings(level) {
        // Handle case where level is an object (from device capability manager)
        if (typeof level === 'object' && level !== null) {
            // If it's already a settings object, use it directly
            const config = level;
            
            // Apply to Three.js renderer
            if (this.layerRenderer && config.pixelRatio) {
                this.layerRenderer.setPixelRatio(config.pixelRatio);
            }
            
            // Apply to layer manager
            if (this.layerManager) {
                if (config.maxLayers) this.layerManager.maxLayers = config.maxLayers;
                if (config.enableParallax !== undefined) this.layerManager.enableParallax = config.enableParallax;
            }
            
            this.currentQualitySettings = config;
            console.log('Quality settings applied (object):', config);
            return;
        }
        
        const settings = {
            low: {
                pixelRatio: 1,
                antialias: false,
                maxLayers: 10,
                textureMaxSize: 1024,
                enableParallax: false
            },
            medium: {
                pixelRatio: Math.min(window.devicePixelRatio, 1.5),
                antialias: true,
                maxLayers: 15,
                textureMaxSize: 2048,
                enableParallax: true
            },
            high: {
                pixelRatio: window.devicePixelRatio,
                antialias: true,
                maxLayers: 20,
                textureMaxSize: 8192, // Increased from 4096 for maximum quality
                enableParallax: true
            }
        };
        
        const config = settings[level] || settings.medium; // Default to medium if level not found
        
        // Apply to Three.js renderer
        if (this.layerRenderer) {
            this.layerRenderer.setPixelRatio(config.pixelRatio);
        }
        
        // Apply to layer manager
        if (this.layerManager) {
            this.layerManager.maxLayers = config.maxLayers;
            this.layerManager.enableParallax = config.enableParallax;
        }
        
        this.currentQualitySettings = config;
        console.log('Quality settings applied:', level, config);
    }
    
    /**
     * Track frame performance for adaptive quality
     */
    trackFramePerformance(frameTime) {
        const samples = this.performanceStats.frameTimeSamples;
        samples.push(frameTime);
        
        // Keep only last 60 samples
        if (samples.length > 60) {
            samples.shift();
        }
        
        // Calculate average
        const sum = samples.reduce((a, b) => a + b, 0);
        this.performanceStats.avgFrameTime = sum / samples.length;
        
        // Track frame drops (>33ms = <30fps)
        if (frameTime > 33) {
            this.performanceStats.frameDrops++;
        }
    }
    
    /**
     * Adjust quality based on performance
     */
    adjustQualityBasedOnPerformance() {
        // DISABLED: Force maximum quality always for professional appearance
        // The adaptive quality was causing blurry images
        return;
        
        const avgFrameTime = this.performanceStats.avgFrameTime;
        const targetFrameTime = 16.67; // 60fps
        
        // If consistently dropping frames, reduce quality
        if (avgFrameTime > targetFrameTime * 1.5 && this.qualityLevel !== 'low') {
            console.warn('Performance degradation detected, reducing quality');
            
            if (this.qualityLevel === 'high') {
                this.qualityLevel = 'medium';
            } else if (this.qualityLevel === 'medium') {
                this.qualityLevel = 'low';
            }
            
            this.applyQualitySettings(this.qualityLevel);
            this.performanceStats.frameDrops = 0;
            this.performanceStats.frameTimeSamples = [];
        }
        
        // If performing well, try increasing quality
        else if (avgFrameTime < targetFrameTime * 0.8 && this.qualityLevel !== 'high') {
            console.log('Performance headroom detected, increasing quality');
            
            if (this.qualityLevel === 'low') {
                this.qualityLevel = 'medium';
            } else if (this.qualityLevel === 'medium') {
                this.qualityLevel = 'high';
            }
            
            this.applyQualitySettings(this.qualityLevel);
            this.performanceStats.frameDrops = 0;
            this.performanceStats.frameTimeSamples = [];
        }
    }
    
    /**
     * Update FPS counter
     */
    updateFPS() {
        this.frameCount++;
        const now = Date.now();
        
        if (now - this.lastFpsUpdate >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
            this.frameCount = 0;
            this.lastFpsUpdate = now;
        }
    }
    
    /**
     * Load tour data and start the experience
     */
    async loadTour(tourData) {
        try {
            this.tourData = tourData;
            
            if (!tourData.nodes || tourData.nodes.length === 0) {
                throw new Error('Tour data must contain at least one node');
            }
            
            // Generate linear walkthrough from "next" field
            this.linearPath = this.generateLinearWalkthrough(tourData);
            
            if (this.linearPath.length === 0) {
                throw new Error('Failed to generate linear walkthrough path');
            }
            
            console.log('Linear walkthrough generated:', this.linearPath.map(n => n.label || n.id).join(' → '));
            
            // Load first node in the linear path
            await this.loadNode(this.linearPath[0], 0);
            
            console.log('Tour loaded successfully:', this.linearPath.length, 'nodes in linear path');
        } catch (error) {
            console.error('Failed to load tour:', error);
            throw error;
        }
    }
    
    /**
     * Generate linear walkthrough from metadata
     * Returns ordered array of nodes following the nextNode chain
     */
    generateLinearWalkthrough(data) {
        if (!data.nodes || data.nodes.length === 0) {
            return [];
        }

        const nodeMap = new Map();
        data.nodes.forEach(node => nodeMap.set(node.id, node));

        // Find entry point (node with no incoming references)
        const hasIncoming = new Set();
        data.nodes.forEach(node => {
            if (node.nextNode) {
                hasIncoming.add(node.nextNode);
            }
        });

        const entryPoints = data.nodes.filter(node => !hasIncoming.has(node.id));
        
        if (entryPoints.length === 0) {
            // No clear entry point, use first node
            console.warn('No entry point found, using first node');
            return data.nodes;
        }
        
        if (entryPoints.length > 1) {
            console.warn('Multiple entry points found:', entryPoints.map(n => n.id).join(', '), '- using first');
        }

        // Build linear path following nextNode chain
        const path = [];
        let current = entryPoints[0];
        const visited = new Set();

        while (current && !visited.has(current.id)) {
            path.push(current);
            visited.add(current.id);
            current = current.nextNode ? nodeMap.get(current.nextNode) : null;
        }
        
        // Warn about orphaned nodes
        if (path.length < data.nodes.length) {
            const orphaned = data.nodes.filter(node => !visited.has(node.id));
            console.warn('Orphaned nodes (not in linear path):', orphaned.map(n => n.id).join(', '));
        }

        return path;
    }
    
    /**
     * Load a specific node (panorama + layers)
     */
    async loadNode(nodeData, nodeIndex = 0) {
        try {
            this.currentNode = nodeData;
            this.currentNodeIndex = nodeIndex;
            
            // Load panorama via Marzipano
            await this.loadPanorama(nodeData);
            
            // Setup camera synchronization for the new view
            this.setupCameraSync();
            
            // Load layers via Three.js
            if (nodeData.layers && this.layerManager) {
                this.layerManager.loadLayers(nodeData.layers);
            }
            
            // Initial sync
            this.syncCameraToLayers();
            
            console.log('Node loaded:', nodeData.id || nodeData.label);
        } catch (error) {
            console.error('Failed to load node:', error);
            throw error;
        }
    }
    
    /**
     * Load panorama using Marzipano with progressive loading
     */
    async loadPanorama(nodeData) {
        return new Promise(async (resolve, reject) => {
            try {
                // Get image URL - prefer imageUrl (set by editor) over image (from metadata)
                const imagePath = nodeData.imageUrl || nodeData.image;
                const baseImageUrl = nodeData.imageUrl || this.resolveImageUrl(nodeData.image);
                let imageUrl = baseImageUrl;
                
                // Use progressive loading if available
                if (this.progressiveLoader) {
                    try {
                        console.log(`🖼️ Loading panorama with progressive quality: ${imagePath}`);
                        
                        // Load image directly without progressive loading to avoid blob issues
                        const progressiveImage = await new Promise((resolve, reject) => {
                            const img = new Image();
                            img.crossOrigin = 'anonymous';
                            img.onload = () => resolve(img);
                            img.onerror = () => reject(new Error(`Failed to load image: ${baseImageUrl}`));
                            img.src = baseImageUrl;
                        });
                        
                        // If we haven't created the scene yet, create it now
                        if (!this.currentScene) {
                            imageUrl = progressiveImage.src;
                            this.createMarzipanoScene(imageUrl, nodeData, resolve, reject);
                        } else {
                            // Scene already created, just resolve
                            resolve();
                        }
                        
                    } catch (progressiveError) {
                        console.warn('Progressive loading failed, falling back to standard loading:', progressiveError);
                        // Fallback to standard loading
                        this.createMarzipanoScene(baseImageUrl, nodeData, resolve, reject);
                    }
                } else {
                    // Standard loading without progressive enhancement
                    this.createMarzipanoScene(baseImageUrl, nodeData, resolve, reject);
                }
                
            } catch (error) {
                reject(error);
            }
        });
    }
    
    /**
     * Create Marzipano scene with given image URL
     */
    createMarzipanoScene(imageUrl, nodeData, resolve, reject) {
        try {
            // Check if Marzipano viewer is available
            if (!this.marzipanoViewer) {
                throw new Error('Marzipano viewer not initialized');
            }
            
            console.log('🖼️ Creating Marzipano scene with image:', imageUrl);
            
            // Create geometry and view - exactly like the working minimal version
            const geometry = new Marzipano.EquirectGeometry([{ width: 4096 }]);
            const limiter = Marzipano.RectilinearView.limit.traditional(1024, 100*Math.PI/180);
            const view = new Marzipano.RectilinearView({ fov: Math.PI/2 }, limiter);
            
            // Create source and scene
            const source = Marzipano.ImageUrlSource.fromString(imageUrl);
            this.currentScene = this.marzipanoViewer.createScene({
                source: source,
                geometry: geometry,
                view: view,
                pinFirstLevel: true
            });
            
            this.currentView = view;
            
            console.log('✅ Scene created, switching to scene...');
            
            // Switch to scene - simple approach like minimal version
            this.currentScene.switchTo();
            
            console.log('✅ Scene switched successfully');
            
            // Resolve immediately - don't wait for events
            if (resolve) resolve();
            
        } catch (error) {
            console.error('❌ Failed to create scene:', error);
            if (reject) reject(error);
        }
    }
    
    /**
     * Update existing scene texture with higher quality image
     */
    updateSceneTexture(newImageUrl) {
        try {
            if (!this.currentScene) return;
            
            // Create new source with higher quality image
            const newSource = Marzipano.ImageUrlSource.fromString(newImageUrl);
            
            // Update the scene source
            // Note: Marzipano doesn't have a direct way to update source,
            // so we'll create a new scene and transition to it smoothly
            const geometry = new Marzipano.EquirectGeometry([{ width: 4096 }]);
            const limiter = Marzipano.RectilinearView.limit.traditional(
                4096,
                100 * Math.PI / 180,
                120 * Math.PI / 180
            );
            
            // Preserve current view parameters
            const currentYaw = this.currentView.yaw();
            const currentPitch = this.currentView.pitch();
            const currentFov = this.currentView.fov();
            
            const newView = new Marzipano.RectilinearView(
                { yaw: currentYaw, pitch: currentPitch, fov: currentFov },
                limiter
            );
            
            const newScene = this.marzipanoViewer.createScene({
                source: newSource,
                geometry: geometry,
                view: newView,
                pinFirstLevel: true
            });
            
            // Smooth transition to higher quality
            newScene.switchTo({ 
                transitionDuration: 300,
                transitionUpdate: (val) => {
                    // Smooth opacity transition
                }
            });
            
            this.currentScene = newScene;
            this.currentView = newView;
            
            console.log(`✨ Updated panorama to higher quality: ${newImageUrl}`);
            
        } catch (error) {
            console.warn('Failed to update scene texture:', error);
        }
    }
    
    /**
     * Create view limiter based on node configuration
     */
    createViewLimiter(nodeData) {
        const rotationLimits = nodeData.rotationLimits || {};
        const maxFov = rotationLimits.maxFov || 140;
        const minFov = rotationLimits.minFov || 60;
        
        // Create a limiter that allows full 360° horizontal and full vertical movement
        const baseLimiter = Marzipano.RectilinearView.limit.traditional(
            4096,
            this.deg2rad(maxFov),
            this.deg2rad(minFov)
        );
        
        // Allow full horizontal rotation (360°)
        const yawLimiter = Marzipano.util.compose(
            baseLimiter,
            Marzipano.RectilinearView.limit.yaw(
                -Math.PI,  // -180°
                Math.PI    // +180°
            )
        );
        
        // Allow full vertical rotation (180°)
        const pitchLimiter = Marzipano.util.compose(
            yawLimiter,
            Marzipano.RectilinearView.limit.pitch(
                -Math.PI/2,  // -90° (straight down)
                Math.PI/2    // +90° (straight up)
            )
        );
        
        return pitchLimiter;
    }
    
    /**
     * Resolve image URL (handle relative paths and data URLs)
     */
    resolveImageUrl(imagePath) {
        // Handle null/undefined
        if (!imagePath) {
            throw new Error('Image path is required');
        }
        
        // Handle data URLs
        if (imagePath.startsWith('data:')) {
            return imagePath;
        }
        
        // Handle absolute URLs
        if (imagePath.startsWith('http') || imagePath.startsWith('/')) {
            return imagePath;
        }
        
        // If path already includes uploads, use it as-is with ../
        if (imagePath.startsWith('uploads/')) {
            return `../${imagePath}`;
        }
        
        // Otherwise assume images are in uploads/loft-tours/ directory
        return `../uploads/loft-tours/${imagePath}`;
    }
    
    /**
     * Navigate to next node
     */
    async nextNode() {
        if (this.isTransitioning) return;
        
        // Use linear path instead of array indices
        const nextIndex = this.currentNodeIndex + 1;
        if (nextIndex >= this.linearPath.length) {
            console.log('End of tour reached');
            return;
        }
        
        const nextNode = this.linearPath[nextIndex];
        await this.transitionTo(nextNode, nextIndex);
    }
    
    /**
     * Navigate to previous node
     */
    async previousNode() {
        if (this.isTransitioning) return;
        
        // Use linear path instead of array indices
        const prevIndex = this.currentNodeIndex - 1;
        if (prevIndex < 0) {
            console.log('Already at first node');
            return;
        }
        
        const prevNode = this.linearPath[prevIndex];
        await this.transitionTo(prevNode, prevIndex);
    }
    
    /**
     * Transition to a specific node with enhanced effects and layer synchronization
     */
    async transitionTo(nextNode, nextIndex) {
        if (this.isTransitioning) {
            console.log('Transition already in progress, skipping');
            return;
        }
        
        try {
            this.isTransitioning = true;
            
            if (this.transitionManager) {
                // Execute smooth transition with all effects
                await this.transitionManager.smoothTransition(this.currentNode, nextNode);
                
                // Load the new node after transition effects
                await this.loadNode(nextNode, nextIndex);
                
                // Smart preload next nodes for smooth future transitions
                if (this.transitionManager && this.transitionManager.smartPreload) {
                    this.transitionManager.smartPreload(nextIndex, this.linearPath, 2);
                } else if (this.progressiveLoader) {
                    // Fallback preloading using progressive loader
                    this.preloadNextNodes(nextIndex);
                }
                
                // Synchronize layers with new panorama
                if (this.layerManager) {
                    this.layerManager.syncWithPanorama();
                }
                
            } else {
                // Fallback to direct loading if no transition manager
                await this.loadNode(nextNode, nextIndex);
            }
            
        } catch (error) {
            console.error('Transition failed:', error);
            // Fallback to direct loading on error
            await this.loadNode(nextNode, nextIndex);
        } finally {
            this.isTransitioning = false;
        }
    }
    
    /**
     * Preload next nodes using progressive loader
     */
    async preloadNextNodes(currentIndex) {
        if (!this.progressiveLoader || !this.linearPath) return;
        
        const preloadPaths = [];
        const preloadCount = 2; // Preload next 2 nodes
        
        for (let i = 1; i <= preloadCount; i++) {
            const nextIndex = currentIndex + i;
            if (nextIndex < this.linearPath.length) {
                const nextNode = this.linearPath[nextIndex];
                if (nextNode.image) {
                    const imageUrl = this.resolveImageUrl(nextNode.image);
                    preloadPaths.push(imageUrl);
                }
            }
        }
        
        if (preloadPaths.length > 0) {
            console.log(`📦 Preloading ${preloadPaths.length} upcoming panoramas`);
            
            // Preload with lower quality for bandwidth efficiency
            this.progressiveLoader.preloadImages(preloadPaths, {
                preloadTier: 'medium',
                count: preloadPaths.length
            }).catch(error => {
                console.warn('Preloading failed:', error);
            });
        }
    }
    
    /**
     * Handle scene change events
     */
    onSceneChange() {
        console.log('Scene changed');
        
        // Update UI if needed
        if (this.onNodeChange) {
            this.onNodeChange(this.currentNode, this.currentNodeIndex);
        }
    }
    
    /**
     * Log performance statistics
     */
    logPerformanceStats() {
        const layerStats = this.layerManager ? this.layerManager.getStats() : {};
        
        console.log('=== Performance Stats ===');
        console.log('FPS:', this.fps);
        console.log('Quality Level:', this.qualityLevel);
        console.log('Avg Frame Time:', this.performanceStats.avgFrameTime.toFixed(2), 'ms');
        console.log('Frame Drops:', this.performanceStats.frameDrops);
        console.log('Current Node:', this.currentNode?.id || this.currentNode?.label);
        console.log('Layer Count:', layerStats.layerCount || 0);
        console.log('Cached Textures:', layerStats.texturesCached || 0);
        console.log('Memory Usage:', layerStats.memoryUsage?.mb || 0, 'MB');
        console.log('Render Efficiency:', ((layerStats.renderEfficiency || 1) * 100).toFixed(1) + '%');
        console.log('Is Transitioning:', this.isTransitioning);
        console.log('========================');
    }
    
    /**
     * Get comprehensive performance report
     */
    getPerformanceReport() {
        return {
            fps: this.fps,
            qualityLevel: this.qualityLevel,
            avgFrameTime: this.performanceStats.avgFrameTime,
            frameDrops: this.performanceStats.frameDrops,
            currentNode: this.currentNode?.id || this.currentNode?.label,
            layerStats: this.layerManager ? this.layerManager.getStats() : {},
            isTransitioning: this.isTransitioning,
            deviceInfo: {
                isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
                pixelRatio: window.devicePixelRatio,
                screenSize: `${window.innerWidth}x${window.innerHeight}`,
                hardwareConcurrency: navigator.hardwareConcurrency
            }
        };
    }
    
    /**
     * Utility: Convert degrees to radians
     */
    deg2rad(degrees) {
        return degrees * Math.PI / 180;
    }
    
    /**
     * Utility: Convert radians to degrees
     */
    rad2deg(radians) {
        return radians * 180 / Math.PI;
    }
    
    /**
     * Cleanup resources with comprehensive disposal
     */
    destroy() {
        console.log('Destroying LOFT³ Tour Engine...');
        
        // Stop continuous sync
        this.stopContinuousSync();
        
        // Stop render loop
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Cleanup layer manager
        if (this.layerManager) {
            this.layerManager.clearLayers();
            this.layerManager.clearTextureCache();
        }
        
        // Cleanup progressive loader
        if (this.progressiveLoader) {
            this.progressiveLoader.destroy();
        }
        
        // Cleanup performance profiler
        if (this.performanceProfiler) {
            this.performanceProfiler.destroy();
        }
        
        // Cleanup memory optimizer
        if (this.memoryOptimizer) {
            this.memoryOptimizer.destroy();
        }
        
        // Cleanup Three.js
        if (this.layerRenderer) {
            this.layerRenderer.dispose();
            this.layerRenderer.forceContextLoss();
        }
        
        if (this.layerScene) {
            this.layerScene.clear();
        }
        
        if (this.layerCanvas && this.layerCanvas.parentNode) {
            this.layerCanvas.parentNode.removeChild(this.layerCanvas);
        }
        
        // Cleanup Marzipano
        if (this.marzipanoViewer) {
            this.marzipanoViewer.destroy();
        }
        
        // Clear references
        this.tourData = null;
        this.currentNode = null;
        this.currentScene = null;
        this.currentView = null;
        
        console.log('LOFT³ Tour Engine destroyed');
    }
}

// Export for use in other modules
window.LoftTourEngine = LoftTourEngine;