/**
 * LOFT³ Controls Manager - Input Handling & Camera Controls
 * Manages touch, mouse, and gyroscope controls with view limits
 */

class ControlsManager {
    constructor(tourEngine) {
        this.engine = tourEngine;
        this.isEnabled = true;
        
        // Control settings - Increased for smoother movement
        this.settings = {
            mouseSensitivity: 1.2,  // Increased from 0.5 for better responsiveness
            touchSensitivity: 1.0,  // Increased from 0.5 for better responsiveness
            gyroSensitivity: 0.8,
            enableGyroscope: true,
            enableTouch: true,
            enableMouse: true,
            enableKeyboard: false
        };
        
        // State tracking
        this.isPointerDown = false;
        this.lastPointerPosition = { x: 0, y: 0 };
        this.gyroPermission = null;
        this.gyroOrientation = null;
        
        // Device detection
        this.isMobile = this.detectMobile();
        this.hasGyroscope = this.detectGyroscope();
        
        this.init();
    }
    
    /**
     * Initialize controls
     */
    init() {
        // Detect device capabilities and apply optimizations
        this.deviceCapabilities = this.applyPerformanceOptimizations();
        
        this.setupMouseControls();
        this.setupTouchControls();
        this.setupKeyboardControls();
        
        if (this.isMobile && this.hasGyroscope) {
            this.setupGyroscopeControls();
        }
        
        // Setup orientation change handling for mobile
        if (this.isMobile) {
            this.setupOrientationHandling();
        }
        
        console.log('ControlsManager initialized', {
            mobile: this.isMobile,
            gyroscope: this.hasGyroscope,
            performanceTier: this.deviceCapabilities.performanceTier
        });
    }
    
    /**
     * Setup orientation change handling for mobile devices
     */
    setupOrientationHandling() {
        const handleOrientationChange = () => {
            // Reset gyroscope baseline on orientation change
            if (this.gyroOrientation) {
                this.gyroOrientation = null;
            }
            
            // Recalibrate after orientation change
            setTimeout(() => {
                this.calibrateGyroscope();
                console.log('Gyroscope recalibrated after orientation change');
            }, 500);
        };
        
        // Listen for orientation changes
        window.addEventListener('orientationchange', handleOrientationChange);
        
        // Also listen for resize events as fallback
        window.addEventListener('resize', () => {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(handleOrientationChange, 300);
        });
        
        console.log('Orientation change handling setup');
    }
    
    /**
     * Setup mouse controls for desktop
     */
    setupMouseControls() {
        if (!this.settings.enableMouse) return;
        
        const container = this.engine.container;
        
        // Mouse down
        container.addEventListener('mousedown', (event) => {
            if (!this.isEnabled) return;
            
            this.isPointerDown = true;
            this.lastPointerPosition = {
                x: event.clientX,
                y: event.clientY
            };
            
            container.style.cursor = 'grabbing';
            event.preventDefault();
        });
        
        // Mouse move
        container.addEventListener('mousemove', (event) => {
            if (!this.isEnabled || !this.isPointerDown) return;
            
            const deltaX = event.clientX - this.lastPointerPosition.x;
            const deltaY = event.clientY - this.lastPointerPosition.y;
            
            this.handlePointerMove(deltaX, deltaY);
            
            this.lastPointerPosition = {
                x: event.clientX,
                y: event.clientY
            };
            
            event.preventDefault();
        });
        
        // Mouse up
        const handleMouseUp = () => {
            this.isPointerDown = false;
            container.style.cursor = 'grab';
        };
        
        container.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('mouseup', handleMouseUp);
        
        // Mouse leave
        container.addEventListener('mouseleave', handleMouseUp);
        
        // Disable context menu
        container.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });
        
        // Set initial cursor
        container.style.cursor = 'grab';
        
        console.log('Mouse controls setup');
    }
    
    /**
     * Setup touch controls for mobile
     */
    setupTouchControls() {
        if (!this.settings.enableTouch) return;
        
        const container = this.engine.container;
        
        // Touch state for multi-touch gestures
        this.touchState = {
            touches: [],
            initialDistance: 0,
            initialFov: 0,
            lastTouchTime: 0,
            tapCount: 0,
            longPressTimer: null,
            isLongPress: false
        };
        
        // Touch start
        container.addEventListener('touchstart', (event) => {
            if (!this.isEnabled) return;
            
            const now = Date.now();
            this.touchState.touches = Array.from(event.touches);
            
            if (event.touches.length === 1) {
                // Single touch - rotation or tap detection
                this.isPointerDown = true;
                const touch = event.touches[0];
                this.lastPointerPosition = {
                    x: touch.clientX,
                    y: touch.clientY
                };
                
                // Tap detection for double-tap
                if (now - this.touchState.lastTouchTime < 300) {
                    this.touchState.tapCount++;
                } else {
                    this.touchState.tapCount = 1;
                }
                this.touchState.lastTouchTime = now;
                
                // Long press detection
                this.touchState.isLongPress = false;
                this.touchState.longPressTimer = setTimeout(() => {
                    this.touchState.isLongPress = true;
                    this.handleLongPress(touch.clientX, touch.clientY);
                }, 500);
                
            } else if (event.touches.length === 2) {
                // Two finger touch - prepare for pinch zoom
                this.isPointerDown = false;
                this.clearLongPressTimer();
                
                const touch1 = event.touches[0];
                const touch2 = event.touches[1];
                
                this.touchState.initialDistance = this.getTouchDistance(touch1, touch2);
                
                if (this.engine.currentView) {
                    this.touchState.initialFov = this.engine.currentView.fov();
                }
            } else {
                // Three or more fingers - reset view
                this.clearLongPressTimer();
                this.handleMultiTouchGesture(event.touches.length);
            }
            
            event.preventDefault();
        }, { passive: false });
        
        // Touch move
        container.addEventListener('touchmove', (event) => {
            if (!this.isEnabled) return;
            
            // Clear long press if finger moves
            if (this.touchState.longPressTimer) {
                this.clearLongPressTimer();
            }
            
            if (event.touches.length === 1 && this.isPointerDown) {
                // Single touch - rotation
                const touch = event.touches[0];
                const deltaX = touch.clientX - this.lastPointerPosition.x;
                const deltaY = touch.clientY - this.lastPointerPosition.y;
                
                // Only rotate if movement is significant (prevents accidental rotation on tap)
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                if (distance > 5) {
                    this.handlePointerMove(deltaX, deltaY);
                    
                    this.lastPointerPosition = {
                        x: touch.clientX,
                        y: touch.clientY
                    };
                }
            } else if (event.touches.length === 2) {
                // Two finger touch - pinch zoom
                const touch1 = event.touches[0];
                const touch2 = event.touches[1];
                
                const currentDistance = this.getTouchDistance(touch1, touch2);
                const distanceRatio = currentDistance / this.touchState.initialDistance;
                
                this.handlePinchZoom(distanceRatio);
            }
            
            event.preventDefault();
        }, { passive: false });
        
        // Touch end
        const handleTouchEnd = (event) => {
            this.clearLongPressTimer();
            
            // Handle tap gestures
            if (event.touches.length === 0 && this.touchState.tapCount > 0 && !this.touchState.isLongPress) {
                if (this.touchState.tapCount === 2) {
                    // Double tap - toggle fullscreen or next node
                    this.handleDoubleTap();
                } else if (this.touchState.tapCount === 1) {
                    // Single tap - show/hide UI
                    setTimeout(() => {
                        if (this.touchState.tapCount === 1) {
                            this.handleSingleTap();
                        }
                    }, 300);
                }
            }
            
            this.isPointerDown = false;
            
            // Reset touch state if all fingers lifted
            if (event.touches.length === 0) {
                this.touchState.touches = [];
                this.touchState.initialDistance = 0;
                setTimeout(() => {
                    this.touchState.tapCount = 0;
                }, 300);
            }
        };
        
        container.addEventListener('touchend', handleTouchEnd);
        container.addEventListener('touchcancel', handleTouchEnd);
        
        // Prevent default touch behaviors
        container.addEventListener('touchforcechange', (event) => {
            event.preventDefault();
        }, { passive: false });
        
        console.log('Enhanced touch controls setup with gestures');
    }
    
    /**
     * Clear long press timer
     */
    clearLongPressTimer() {
        if (this.touchState.longPressTimer) {
            clearTimeout(this.touchState.longPressTimer);
            this.touchState.longPressTimer = null;
        }
    }
    
    /**
     * Handle single tap gesture
     */
    handleSingleTap() {
        // Toggle UI visibility
        if (this.engine.viewer) {
            this.engine.viewer.toggleUI();
        }
        console.log('Single tap: UI toggled');
    }
    
    /**
     * Handle double tap gesture
     */
    handleDoubleTap() {
        // Navigate to next node or toggle fullscreen
        if (this.engine.viewer) {
            this.engine.viewer.nextNode();
        }
        console.log('Double tap: Next node');
    }
    
    /**
     * Handle long press gesture
     */
    handleLongPress(x, y) {
        // Reset view to center
        this.resetView();
        
        // Provide haptic feedback if available
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
        
        console.log('Long press: View reset');
    }
    
    /**
     * Handle multi-touch gesture (3+ fingers)
     */
    handleMultiTouchGesture(fingerCount) {
        if (fingerCount >= 3) {
            // Three finger tap - reset view
            this.resetView();
            
            // Provide haptic feedback
            if (navigator.vibrate) {
                navigator.vibrate([50, 100, 50]);
            }
            
            console.log(`${fingerCount} finger gesture: View reset`);
        }
    }
    
    /**
     * Calculate distance between two touch points
     */
    getTouchDistance(touch1, touch2) {
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * Handle pinch zoom gesture
     */
    handlePinchZoom(distanceRatio) {
        if (!this.engine.currentView) return;
        
        const view = this.engine.currentView;
        const currentFov = view.fov();
        
        // Calculate new FOV (inverse relationship with distance)
        const newFov = this.touchState.initialFov / distanceRatio;
        
        // Get FOV limits from view limiter
        const minFov = this.engine.deg2rad(60);
        const maxFov = this.engine.deg2rad(120);
        
        // Clamp FOV to limits
        const clampedFov = Math.max(minFov, Math.min(maxFov, newFov));
        
        // Apply FOV change
        view.setFov(clampedFov);
    }
    
    /**
     * Setup keyboard controls (optional)
     */
    setupKeyboardControls() {
        if (!this.settings.enableKeyboard) return;
        
        document.addEventListener('keydown', (event) => {
            if (!this.isEnabled || !this.engine.currentView) return;
            
            const view = this.engine.currentView;
            const moveAmount = this.engine.deg2rad(5); // 5 degrees
            
            switch (event.code) {
                case 'ArrowLeft':
                    this.rotateView(-moveAmount, 0);
                    event.preventDefault();
                    break;
                case 'ArrowRight':
                    this.rotateView(moveAmount, 0);
                    event.preventDefault();
                    break;
                case 'ArrowUp':
                    this.rotateView(0, moveAmount);
                    event.preventDefault();
                    break;
                case 'ArrowDown':
                    this.rotateView(0, -moveAmount);
                    event.preventDefault();
                    break;
                case 'Space':
                    this.engine.nextNode();
                    event.preventDefault();
                    break;
            }
        });
        
        console.log('Keyboard controls setup');
    }
    
    /**
     * Setup gyroscope controls for mobile
     */
    async setupGyroscopeControls() {
        if (!this.settings.enableGyroscope || !this.hasGyroscope) return;
        
        try {
            // Request permission for iOS 13+
            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                // Show gyroscope permission UI
                this.showGyroscopePermissionUI();
                console.log('Gyroscope available, permission required (iOS 13+)');
                this.gyroPermission = 'prompt';
                return;
            }
            
            // For Android and older iOS, directly setup listener
            this.enableGyroscopeListener();
            
            console.log('Gyroscope controls setup');
            
        } catch (error) {
            console.error('Failed to setup gyroscope:', error);
        }
    }
    
    /**
     * Show gyroscope permission UI
     */
    showGyroscopePermissionUI() {
        // Create permission button overlay
        const overlay = document.createElement('div');
        overlay.className = 'gyro-permission-overlay';
        overlay.innerHTML = `
            <div class="gyro-permission-content">
                <i class="fas fa-mobile-alt"></i>
                <h3>Enable Device Motion</h3>
                <p>Allow device motion to control the view with your phone's gyroscope for an immersive experience.</p>
                <div class="gyro-permission-actions">
                    <button class="btn btn-primary" id="enable-gyro">Enable Gyroscope</button>
                    <button class="btn btn-outline" id="skip-gyro">Skip</button>
                </div>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .gyro-permission-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                padding: 2rem;
            }
            .gyro-permission-content {
                background: var(--bg-card);
                border-radius: 12px;
                padding: 2rem;
                text-align: center;
                max-width: 400px;
                width: 100%;
            }
            .gyro-permission-content i {
                font-size: 3rem;
                color: var(--primary);
                margin-bottom: 1rem;
            }
            .gyro-permission-content h3 {
                color: var(--white);
                margin-bottom: 1rem;
                font-size: 1.5rem;
            }
            .gyro-permission-content p {
                color: var(--gray-light);
                margin-bottom: 2rem;
                line-height: 1.5;
            }
            .gyro-permission-actions {
                display: flex;
                gap: 1rem;
                flex-direction: column;
            }
            @media (min-width: 480px) {
                .gyro-permission-actions {
                    flex-direction: row;
                }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(overlay);
        
        // Handle button clicks
        document.getElementById('enable-gyro').addEventListener('click', async () => {
            const granted = await this.requestGyroscopePermission();
            if (granted) {
                overlay.remove();
                style.remove();
            }
        });
        
        document.getElementById('skip-gyro').addEventListener('click', () => {
            overlay.remove();
            style.remove();
            this.gyroPermission = 'denied';
        });
    }
    
    /**
     * Enable gyroscope event listener with enhanced mobile support
     */
    enableGyroscopeListener() {
        // Enhanced device orientation handling
        const handleOrientation = (event) => {
            if (!this.isEnabled) return;
            this.handleGyroscopeMove(event);
        };
        
        // Listen for device orientation with better mobile support
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', handleOrientation, true);
        }
        
        // Also listen for device motion for additional data
        if (window.DeviceMotionEvent) {
            window.addEventListener('devicemotion', (event) => {
                if (!this.isEnabled) return;
                this.handleDeviceMotion(event);
            }, true);
        }
        
        this.gyroPermission = 'granted';
        console.log('Enhanced gyroscope listener enabled');
    }
    
    /**
     * Handle device motion events for additional mobile features
     */
    handleDeviceMotion(event) {
        if (!this.engine.currentView) return;
        
        const acceleration = event.acceleration;
        const rotationRate = event.rotationRate;
        
        if (!acceleration || !rotationRate) return;
        
        // Detect shake gesture for view reset
        const totalAcceleration = Math.abs(acceleration.x) + 
                                Math.abs(acceleration.y) + 
                                Math.abs(acceleration.z);
        
        if (totalAcceleration > 20) {
            // Shake detected - reset view
            if (!this.lastShakeTime || Date.now() - this.lastShakeTime > 1000) {
                this.lastShakeTime = Date.now();
                this.resetView();
                
                // Provide haptic feedback
                if (navigator.vibrate) {
                    navigator.vibrate([100, 50, 100]);
                }
                
                console.log('Shake gesture detected: View reset');
            }
        }
    }
    
    /**
     * Handle pointer movement (mouse/touch)
     */
    handlePointerMove(deltaX, deltaY) {
        if (!this.engine.currentView) return;
        
        const sensitivity = this.isMobile ? 
            this.settings.touchSensitivity : 
            this.settings.mouseSensitivity;
        
        // Convert pixel movement to radians (increased multiplier for better responsiveness)
        const yawDelta = -deltaX * 0.005 * sensitivity;  // Increased from 0.003
        const pitchDelta = deltaY * 0.005 * sensitivity;  // Increased from 0.003
        
        this.rotateView(yawDelta, pitchDelta);
    }
    
    /**
     * Handle gyroscope movement with enhanced processing
     */
    handleGyroscopeMove(event) {
        if (!this.engine.currentView) return;
        
        // Get orientation values
        const alpha = event.alpha; // Z axis (compass heading, 0-360)
        const beta = event.beta;   // X axis (front-back tilt, -180 to 180)
        const gamma = event.gamma; // Y axis (left-right tilt, -90 to 90)
        
        // Validate orientation data
        if (alpha === null || beta === null || gamma === null || 
            isNaN(alpha) || isNaN(beta) || isNaN(gamma)) {
            return;
        }
        
        // Initialize baseline orientation on first reading
        if (this.gyroOrientation === null) {
            this.gyroOrientation = { 
                alpha: alpha,
                beta: beta,
                gamma: gamma,
                timestamp: Date.now(),
                samples: 1
            };
            console.log('Gyroscope baseline set:', this.gyroOrientation);
            return;
        }
        
        // Calculate deltas from baseline
        let deltaAlpha = alpha - this.gyroOrientation.alpha;
        let deltaBeta = beta - this.gyroOrientation.beta;
        let deltaGamma = gamma - this.gyroOrientation.gamma;
        
        // Handle alpha wraparound (0-360 degrees)
        if (deltaAlpha > 180) deltaAlpha -= 360;
        if (deltaAlpha < -180) deltaAlpha += 360;
        
        // Apply dead zone to reduce jitter
        const deadZone = 0.5; // degrees
        if (Math.abs(deltaGamma) < deadZone) deltaGamma = 0;
        if (Math.abs(deltaBeta) < deadZone) deltaBeta = 0;
        
        // Convert to radians and apply sensitivity
        const yawDelta = this.engine.deg2rad(deltaGamma) * this.settings.gyroSensitivity;
        const pitchDelta = this.engine.deg2rad(deltaBeta) * this.settings.gyroSensitivity;
        
        // Apply smoothing based on device performance
        const smoothingFactor = this.deviceCapabilities.performanceTier === 'high' ? 0.4 : 0.2;
        
        // Apply rotation with enhanced smoothing
        this.rotateView(yawDelta * smoothingFactor, -pitchDelta * smoothingFactor);
        
        // Update baseline with exponential moving average for drift compensation
        const driftCompensation = 0.01; // Reduced for better stability
        this.gyroOrientation.alpha += deltaAlpha * driftCompensation;
        this.gyroOrientation.beta += deltaBeta * driftCompensation;
        this.gyroOrientation.gamma += deltaGamma * driftCompensation;
        this.gyroOrientation.samples++;
        
        // Periodic recalibration to prevent drift
        if (this.gyroOrientation.samples % 1000 === 0) {
            console.log('Gyroscope drift compensation applied');
        }
    }
    
    /**
     * Rotate the view with limits
     */
    rotateView(yawDelta, pitchDelta) {
        if (!this.engine.currentView) return;
        
        const view = this.engine.currentView;
        // Fix: Use yaw(), pitch() methods instead of coordinates()
        const currentYaw = view.yaw();
        const currentPitch = view.pitch();
        
        // Calculate new coordinates
        let newYaw = currentYaw + yawDelta;
        let newPitch = currentPitch + pitchDelta;
        
        // Apply view limits (these are handled by Marzipano's limiter)
        // The limiter was set up in the main engine when creating the view
        
        // Set new view coordinates
        view.setYaw(newYaw);
        view.setPitch(newPitch);
        
        // Trigger immediate synchronization with Three.js layers
        this.engine.syncCameraToLayers();
    }
    
    /**
     * Detect if device is mobile with enhanced detection
     */
    detectMobile() {
        const userAgent = navigator.userAgent;
        const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        const isTouchDevice = navigator.maxTouchPoints && navigator.maxTouchPoints > 2;
        const isSmallScreen = window.innerWidth <= 768;
        
        // Enhanced mobile detection
        const mobileChecks = {
            userAgent: isMobileUA,
            touchPoints: isTouchDevice,
            screenSize: isSmallScreen,
            orientation: 'orientation' in window,
            deviceMemory: navigator.deviceMemory ? navigator.deviceMemory <= 4 : false
        };
        
        const isMobile = isMobileUA || (isTouchDevice && isSmallScreen);
        
        console.log('Mobile detection:', mobileChecks, 'Result:', isMobile);
        return isMobile;
    }
    
    /**
     * Detect device capabilities for performance optimization
     */
    detectDeviceCapabilities() {
        const capabilities = {
            // Performance indicators
            deviceMemory: navigator.deviceMemory || 4,
            hardwareConcurrency: navigator.hardwareConcurrency || 4,
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt
            } : null,
            
            // Display capabilities
            pixelRatio: window.devicePixelRatio || 1,
            screenSize: {
                width: window.screen.width,
                height: window.screen.height
            },
            
            // Feature support
            webGL: this.detectWebGLSupport(),
            gyroscope: this.detectGyroscope(),
            vibration: 'vibrate' in navigator,
            fullscreen: document.fullscreenEnabled || document.webkitFullscreenEnabled,
            
            // Battery status (if available)
            battery: navigator.getBattery ? 'available' : 'unavailable'
        };
        
        // Determine performance tier
        capabilities.performanceTier = this.determinePerformanceTier(capabilities);
        
        console.log('Device capabilities:', capabilities);
        return capabilities;
    }
    
    /**
     * Detect WebGL support
     */
    detectWebGLSupport() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            return !!gl;
        } catch (e) {
            return false;
        }
    }
    
    /**
     * Determine device performance tier
     */
    determinePerformanceTier(capabilities) {
        let score = 0;
        
        // Memory score
        if (capabilities.deviceMemory >= 8) score += 3;
        else if (capabilities.deviceMemory >= 4) score += 2;
        else score += 1;
        
        // CPU score
        if (capabilities.hardwareConcurrency >= 8) score += 3;
        else if (capabilities.hardwareConcurrency >= 4) score += 2;
        else score += 1;
        
        // Connection score
        if (capabilities.connection) {
            if (capabilities.connection.effectiveType === '4g') score += 2;
            else if (capabilities.connection.effectiveType === '3g') score += 1;
        } else {
            score += 1; // Assume decent connection
        }
        
        // Pixel ratio penalty for high-DPI displays
        if (capabilities.pixelRatio > 2) score -= 1;
        
        // Determine tier
        if (score >= 7) return 'high';
        else if (score >= 5) return 'medium';
        else return 'low';
    }
    
    /**
     * Apply performance optimizations based on device capabilities
     */
    applyPerformanceOptimizations() {
        const capabilities = this.detectDeviceCapabilities();
        
        // Adjust settings based on performance tier
        switch (capabilities.performanceTier) {
            case 'low':
                this.settings.mouseSensitivity = 0.8;  // Increased from 0.3
                this.settings.touchSensitivity = 0.8;  // Increased from 0.3
                this.settings.gyroSensitivity = 0.6;
                console.log('Applied low-performance optimizations');
                break;
                
            case 'medium':
                this.settings.mouseSensitivity = 1.0;  // Increased from 0.4
                this.settings.touchSensitivity = 1.0;  // Increased from 0.4
                this.settings.gyroSensitivity = 0.7;
                console.log('Applied medium-performance optimizations');
                break;
                
            case 'high':
                this.settings.mouseSensitivity = 1.2;  // Increased from 0.5
                this.settings.touchSensitivity = 1.2;  // Increased from 0.5
                this.settings.gyroSensitivity = 0.8;
                console.log('Applied high-performance optimizations');
                break;
        }
        
        // Disable gyroscope on very low-end devices
        if (capabilities.performanceTier === 'low' && capabilities.deviceMemory < 2) {
            this.settings.enableGyroscope = false;
            console.log('Gyroscope disabled for low-end device');
        }
        
        return capabilities;
    }
    
    /**
     * Detect if device has gyroscope
     */
    detectGyroscope() {
        return 'DeviceOrientationEvent' in window;
    }
    
    /**
     * Request gyroscope permission (iOS 13+)
     */
    async requestGyroscopePermission() {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            try {
                const permission = await DeviceOrientationEvent.requestPermission();
                this.gyroPermission = permission;
                
                if (permission === 'granted') {
                    this.enableGyroscopeListener();
                    return true;
                } else {
                    console.log('Gyroscope permission denied by user');
                    return false;
                }
            } catch (error) {
                console.error('Gyroscope permission request failed:', error);
                return false;
            }
        } else {
            // Already enabled for non-iOS 13+ devices
            console.log('Gyroscope permission not required on this device');
            return true;
        }
    }
    
    /**
     * Calibrate gyroscope (reset baseline) with enhanced validation
     */
    calibrateGyroscope() {
        if (!this.gyroOrientation) {
            console.warn('No gyroscope data available for calibration');
            return false;
        }
        
        // Validate current orientation data
        const { alpha, beta, gamma } = this.gyroOrientation;
        if (alpha === null || beta === null || gamma === null ||
            isNaN(alpha) || isNaN(beta) || isNaN(gamma)) {
            console.warn('Invalid gyroscope data for calibration');
            return false;
        }
        
        // Reset baseline to current orientation
        this.gyroOrientation = {
            alpha: alpha,
            beta: beta,
            gamma: gamma,
            timestamp: Date.now(),
            samples: 0
        };
        
        console.log('Gyroscope calibrated successfully:', this.gyroOrientation);
        
        // Trigger calibration event if available
        if (this.engine.onGyroscopeCalibrated) {
            this.engine.onGyroscopeCalibrated(this.gyroOrientation);
        }
        
        return true;
    }
    
    /**
     * Get gyroscope status and data
     */
    getGyroscopeStatus() {
        return {
            supported: this.hasGyroscope,
            permission: this.gyroPermission,
            active: this.isGyroscopeActive(),
            calibrated: this.gyroOrientation !== null,
            baseline: this.gyroOrientation,
            sensitivity: this.settings.gyroSensitivity,
            enabled: this.settings.enableGyroscope
        };
    }
    
    /**
     * Update gyroscope sensitivity with validation
     */
    setGyroscopeSensitivity(sensitivity) {
        // Validate sensitivity range
        if (typeof sensitivity !== 'number' || sensitivity < 0.1 || sensitivity > 2.0) {
            console.warn('Invalid gyroscope sensitivity. Must be between 0.1 and 2.0');
            return false;
        }
        
        this.settings.gyroSensitivity = sensitivity;
        console.log('Gyroscope sensitivity updated to:', sensitivity);
        return true;
    }
    
    /**
     * Enable/disable gyroscope with proper cleanup
     */
    setGyroscopeEnabled(enabled) {
        this.settings.enableGyroscope = enabled;
        
        if (!enabled) {
            // Reset gyroscope state when disabled
            this.gyroOrientation = null;
            this.gyroPermission = null;
            console.log('Gyroscope disabled and state reset');
        } else if (this.hasGyroscope && this.isMobile) {
            // Re-initialize gyroscope when enabled
            this.setupGyroscopeControls();
            console.log('Gyroscope re-enabled');
        }
        
        return true;
    }
    
    /**
     * Check if gyroscope is active
     */
    isGyroscopeActive() {
        return this.gyroPermission === 'granted' && this.gyroOrientation !== null;
    }
    
    /**
     * Enable/disable controls
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        
        if (!enabled) {
            this.isPointerDown = false;
        }
        
        console.log('Controls', enabled ? 'enabled' : 'disabled');
    }
    
    /**
     * Update control settings
     */
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        console.log('Control settings updated:', this.settings);
    }
    
    /**
     * Reset view to center
     */
    resetView() {
        if (!this.engine.currentView) return;
        
        const view = this.engine.currentView;
        
        // Animate to center position
        const currentYaw = view.yaw();
        const currentPitch = view.pitch();
        const targetYaw = 0;
        const targetPitch = 0;
        
        this.animateViewTo(targetYaw, targetPitch, 1000);
    }
    
    /**
     * Animate view to specific coordinates
     */
    animateViewTo(targetYaw, targetPitch, duration = 1000) {
        if (!this.engine.currentView) return;
        
        const view = this.engine.currentView;
        const startYaw = view.yaw();
        const startPitch = view.pitch();
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = this.easeInOutCubic(progress);
            
            const yaw = startYaw + (targetYaw - startYaw) * eased;
            const pitch = startPitch + (targetPitch - startPitch) * eased;
            
            view.setYaw(yaw);
            view.setPitch(pitch);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    /**
     * Easing function
     */
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    
    /**
     * Get control statistics
     */
    getStats() {
        return {
            enabled: this.isEnabled,
            mobile: this.isMobile,
            gyroscope: this.hasGyroscope,
            gyroPermission: this.gyroPermission,
            settings: this.settings,
            isPointerDown: this.isPointerDown
        };
    }
    
    /**
     * Cleanup event listeners
     */
    destroy() {
        // Remove event listeners
        // Note: In a full implementation, you'd store references to the listeners
        // and remove them here to prevent memory leaks
        
        console.log('ControlsManager destroyed');
    }
}

// Export for use in other modules
window.ControlsManager = ControlsManager;