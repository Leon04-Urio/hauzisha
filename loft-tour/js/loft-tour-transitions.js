/**
 * LOFT³ Transition Manager - Smooth Walking Transitions
 * Handles Matterport-style transitions between panorama nodes
 */

class TransitionManager {
    constructor(tourEngine) {
        this.engine = tourEngine;
        this.isTransitioning = false;
        this.transitionDuration = 1200; // ms
        this.preloadedImages = new Map();
        
        // Transition effects configuration
        this.effects = {
            crossfade: true,
            zoom: true,
            sway: true,
            fadeOverlay: true
        };
        
        // Performance optimization settings
        this.targetFPS = 60;
        this.frameTime = 1000 / this.targetFPS; // 16.67ms for 60fps
        this.performanceMode = 'auto'; // 'auto', 'high', 'medium', 'low'
        
        // Timing controls
        this.timingProfiles = {
            fast: { duration: 800, effects: { zoom: true, sway: false, crossfade: true, fadeOverlay: true } },
            normal: { duration: 1200, effects: { zoom: true, sway: true, crossfade: true, fadeOverlay: true } },
            slow: { duration: 1800, effects: { zoom: true, sway: true, crossfade: true, fadeOverlay: true } },
            cinematic: { duration: 2400, effects: { zoom: true, sway: true, crossfade: true, fadeOverlay: true } }
        };
        
        // Performance monitoring
        this.performanceStats = {
            transitionCount: 0,
            avgTransitionTime: 0,
            lastTransitionTime: 0,
            frameDrops: 0,
            adaptiveQuality: true
        };
        
        // Auto-detect performance mode
        this.detectPerformanceCapabilities();
        
        console.log('TransitionManager initialized with performance optimization');
    }
    
    /**
     * Execute smooth transition between nodes with enhanced Matterport-style effects
     */
    async smoothTransition(fromNode, toNode) {
        if (this.isTransitioning) {
            console.log('Transition already in progress');
            return;
        }
        
        const transitionStartTime = Date.now();
        
        try {
            this.isTransitioning = true;
            this.engine.isTransitioning = true; // Update engine state
            console.log('Starting enhanced transition:', fromNode?.id, '->', toNode?.id);
            
            // 1. Preload next panorama for smooth switching
            await this.preloadPanorama(toNode);
            
            // 2. Prepare transition overlay with crossfade support
            const overlay = this.createTransitionOverlay();
            
            // 3. Execute enhanced transition sequence with all effects
            await this.executeEnhancedTransitionSequence(overlay, fromNode, toNode);
            
            // 4. Cleanup
            this.removeTransitionOverlay(overlay);
            
            // 5. Record performance metrics
            const transitionEndTime = Date.now();
            this.recordTransitionPerformance(transitionStartTime, transitionEndTime);
            
            console.log('Enhanced transition completed');
            
        } catch (error) {
            console.error('Transition failed:', error);
        } finally {
            this.isTransitioning = false;
            this.engine.isTransitioning = false; // Update engine state
        }
    }
    
    /**
     * Execute the enhanced transition sequence with all Matterport-style effects
     */
    async executeEnhancedTransitionSequence(overlay, fromNode, toNode) {
        const duration = this.transitionDuration;
        
        // Phase 1: Pre-transition setup and crossfade preparation
        if (this.effects.crossfade) {
            await this.prepareCrossfade(overlay, duration * 0.1);
        }
        
        // Phase 2: Fade out current scene with smooth overlay (30% of duration)
        if (this.effects.fadeOverlay) {
            await this.fadeOut(overlay, duration * 0.3);
        }
        
        // Phase 3: Execute panorama switch (handled by engine)
        // Note: The actual panorama switching happens in the main engine after this method
        
        // Phase 4: Apply walking effects simultaneously (70% of duration)
        const effectPromises = [];
        
        // Zoom effect for walking illusion
        if (this.effects.zoom) {
            effectPromises.push(this.enhancedZoomEffect(duration * 0.7));
        }
        
        // Subtle sway for realism
        if (this.effects.sway) {
            effectPromises.push(this.enhancedSwayEffect(duration * 0.8));
        }
        
        // Crossfade effect for smooth panorama blending
        if (this.effects.crossfade) {
            effectPromises.push(this.crossfadeEffect(duration * 0.6));
        }
        
        // Phase 5: Fade in new scene (overlapping with effects)
        if (this.effects.fadeOverlay) {
            effectPromises.push(
                this.delay(duration * 0.2).then(() => 
                    this.fadeIn(overlay, duration * 0.5)
                )
            );
        }
        
        // Wait for all effects to complete
        await Promise.all(effectPromises);
        
        // Phase 6: Final cleanup and layer synchronization
        await this.finalizeTransition(duration * 0.1);
    }
    
    /**
     * Create transition overlay element
     */
    createTransitionOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'loft-transition-overlay';
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            opacity: 0;
            transition: opacity 0.6s ease-in-out;
            pointer-events: none;
            z-index: 100;
        `;
        
        this.engine.container.appendChild(overlay);
        return overlay;
    }
    
    /**
     * Remove transition overlay
     */
    removeTransitionOverlay(overlay) {
        if (overlay && overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
    }
    
    /**
     * Fade out effect
     */
    async fadeOut(overlay, duration) {
        return new Promise(resolve => {
            overlay.style.opacity = '1';
            setTimeout(resolve, duration);
        });
    }
    
    /**
     * Fade in effect
     */
    async fadeIn(overlay, duration) {
        return new Promise(resolve => {
            overlay.style.opacity = '0';
            setTimeout(resolve, duration);
        });
    }
    
    /**
     * Enhanced zoom effect with more realistic walking motion
     */
    async enhancedZoomEffect(duration) {
        if (!this.engine.currentView) return;
        
        const view = this.engine.currentView;
        const startFov = view.fov();
        
        // More pronounced zoom for walking illusion (12% closer)
        const targetFov = startFov * 0.88;
        
        // Three-phase zoom: zoom in -> hold -> zoom back out
        const phaseTime = duration / 3;
        
        // Phase 1: Zoom in (walking forward)
        await this.animateValue(
            startFov, 
            targetFov, 
            phaseTime, 
            (value) => view.setFov(value),
            this.easeInQuad
        );
        
        // Phase 2: Hold zoom (brief pause)
        await this.delay(phaseTime * 0.5);
        
        // Phase 3: Zoom back out (settling into new space)
        await this.animateValue(
            targetFov, 
            startFov, 
            phaseTime * 1.5, 
            (value) => view.setFov(value),
            this.easeOutCubic
        );
    }
    
    /**
     * Enhanced sway effect with more natural walking motion
     */
    async enhancedSwayEffect(duration) {
        if (!this.engine.currentView) return;
        
        const view = this.engine.currentView;
        const startYaw = view.yaw();
        const startPitch = view.pitch();
        
        // More subtle but realistic sway amounts
        const yawSway = this.engine.deg2rad(1.2); // 1.2° horizontal sway
        const pitchSway = this.engine.deg2rad(0.8); // 0.8° vertical sway
        
        // Create natural walking motion with multiple phases
        const phaseTime = duration / 4;
        
        // Phase 1: Initial sway right and slightly down
        await Promise.all([
            this.animateValue(
                startYaw, 
                startYaw + yawSway, 
                phaseTime, 
                (value) => view.setYaw(value),
                this.easeInOutSine
            ),
            this.animateValue(
                startPitch, 
                startPitch - pitchSway * 0.5, 
                phaseTime, 
                (value) => view.setPitch(value),
                this.easeInOutSine
            )
        ]);
        
        // Phase 2: Sway left and slightly up
        await Promise.all([
            this.animateValue(
                startYaw + yawSway, 
                startYaw - yawSway * 0.7, 
                phaseTime, 
                (value) => view.setYaw(value),
                this.easeInOutSine
            ),
            this.animateValue(
                startPitch - pitchSway * 0.5, 
                startPitch + pitchSway * 0.3, 
                phaseTime, 
                (value) => view.setPitch(value),
                this.easeInOutSine
            )
        ]);
        
        // Phase 3: Gentle return to center with slight overshoot
        await Promise.all([
            this.animateValue(
                startYaw - yawSway * 0.7, 
                startYaw + yawSway * 0.2, 
                phaseTime, 
                (value) => view.setYaw(value),
                this.easeInOutSine
            ),
            this.animateValue(
                startPitch + pitchSway * 0.3, 
                startPitch - pitchSway * 0.2, 
                phaseTime, 
                (value) => view.setPitch(value),
                this.easeInOutSine
            )
        ]);
        
        // Phase 4: Final settle to original position
        await Promise.all([
            this.animateValue(
                startYaw + yawSway * 0.2, 
                startYaw, 
                phaseTime, 
                (value) => view.setYaw(value),
                this.easeOutCubic
            ),
            this.animateValue(
                startPitch - pitchSway * 0.2, 
                startPitch, 
                phaseTime, 
                (value) => view.setPitch(value),
                this.easeOutCubic
            )
        ]);
    }
    
    /**
     * Crossfade effect for smooth panorama blending
     */
    async crossfadeEffect(duration) {
        // This effect works in conjunction with the overlay fade
        // to create a smooth crossfade between panoramas
        
        // Create a subtle brightness animation to enhance the crossfade
        if (this.engine.container) {
            const container = this.engine.container;
            const originalFilter = container.style.filter || '';
            
            // Slightly brighten during transition
            await this.animateValue(
                1.0, 
                1.1, 
                duration * 0.3, 
                (value) => {
                    container.style.filter = `brightness(${value})`;
                },
                this.easeInOutQuad
            );
            
            // Return to normal brightness
            await this.animateValue(
                1.1, 
                1.0, 
                duration * 0.7, 
                (value) => {
                    container.style.filter = `brightness(${value})`;
                },
                this.easeOutQuad
            );
            
            // Restore original filter
            container.style.filter = originalFilter;
        }
    }
    
    /**
     * Prepare crossfade by setting up the transition environment
     */
    async prepareCrossfade(overlay, duration) {
        // Pre-transition setup for smooth crossfade
        if (overlay) {
            overlay.style.background = 'radial-gradient(circle, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)';
        }
        
        await this.delay(duration);
    }
    
    /**
     * Finalize transition with layer synchronization
     */
    async finalizeTransition(duration) {
        // Ensure layers are properly synchronized after transition
        if (this.engine.layerManager) {
            // Trigger layer update to sync with new panorama
            this.engine.layerManager.syncWithPanorama();
        }
        
        // Brief delay to ensure everything is settled
        await this.delay(duration);
        
        console.log('Transition finalized with layer synchronization');
    }
    
    /**
     * Enhanced preload panorama image with progress tracking
     */
    async preloadPanorama(nodeData) {
        const imageUrl = this.engine.resolveImageUrl(nodeData.image);
        
        // Check if already preloaded
        if (this.preloadedImages.has(imageUrl)) {
            console.log('Panorama already preloaded:', nodeData.image);
            return this.preloadedImages.get(imageUrl);
        }
        
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            // Use mobile optimization for progressive loading if available
            if (window.MobileOptimization) {
                const mobileOpt = new MobileOptimization();
                const progressiveLoader = mobileOpt.createProgressiveLoader();
                
                progressiveLoader.loadImageProgressive(imageUrl, (progress) => {
                    // Optional: emit progress events for UI feedback
                    console.log(`Preloading ${nodeData.image}: tier ${progress.tier}/${progress.totalTiers} (${progress.resolution})`);
                }).then((img) => {
                    const loadTime = Date.now() - startTime;
                    this.preloadedImages.set(imageUrl, {
                        image: img,
                        loadTime: loadTime,
                        timestamp: Date.now(),
                        nodeId: nodeData.id,
                        progressive: true
                    });
                    
                    console.log(`Panorama preloaded with progressive quality: ${nodeData.image} (${loadTime}ms)`);
                    resolve(img);
                }).catch((error) => {
                    console.warn('Progressive preload failed, falling back to standard preload:', error);
                    this.standardPreload(imageUrl, nodeData, startTime, resolve, reject);
                });
            } else {
                this.standardPreload(imageUrl, nodeData, startTime, resolve, reject);
            }
        });
    }
    
    /**
     * Standard preload fallback
     */
    standardPreload(imageUrl, nodeData, startTime, resolve, reject) {
        const img = new Image();
        
        img.onload = () => {
            const loadTime = Date.now() - startTime;
            this.preloadedImages.set(imageUrl, {
                image: img,
                loadTime: loadTime,
                timestamp: Date.now(),
                nodeId: nodeData.id,
                progressive: false
            });
            
            console.log(`Panorama preloaded: ${nodeData.image} (${loadTime}ms)`);
            resolve(img);
        };
        
        img.onerror = (error) => {
            console.error('Failed to preload panorama:', nodeData.image, error);
            reject(new Error(`Failed to preload ${nodeData.image}`));
        };
        
        // Set timeout for preloading (15 seconds max for slow connections)
        setTimeout(() => {
            if (!this.preloadedImages.has(imageUrl)) {
                reject(new Error(`Preload timeout for ${nodeData.image}`));
            }
        }, 15000);
        
        img.src = imageUrl;
    }
    
    /**
     * Preload multiple panoramas with intelligent prioritization
     */
    async preloadMultiplePanoramas(nodeDataArray) {
        const preloadPromises = nodeDataArray.map((nodeData, index) => {
            // Add slight delay between preloads to avoid overwhelming the browser
            return this.delay(index * 100).then(() => 
                this.preloadPanorama(nodeData).catch(error => {
                    console.warn('Failed to preload:', nodeData.image, error.message);
                    return null;
                })
            );
        });
        
        const results = await Promise.all(preloadPromises);
        const successCount = results.filter(result => result !== null).length;
        
        console.log(`Preloaded ${successCount}/${nodeDataArray.length} panoramas`);
        return results;
    }
    
    /**
     * Smart preloading: preload next few nodes in the linear path
     */
    async smartPreload(currentNodeIndex, linearPath, lookahead = 2) {
        const nodesToPreload = [];
        
        // Preload next nodes in the path
        for (let i = 1; i <= lookahead && currentNodeIndex + i < linearPath.length; i++) {
            nodesToPreload.push(linearPath[currentNodeIndex + i]);
        }
        
        // Also preload previous node if available (for back navigation)
        if (currentNodeIndex > 0) {
            nodesToPreload.push(linearPath[currentNodeIndex - 1]);
        }
        
        if (nodesToPreload.length > 0) {
            console.log('Smart preloading:', nodesToPreload.map(n => n.id).join(', '));
            await this.preloadMultiplePanoramas(nodesToPreload);
        }
    }
    
    /**
     * Generic value animation function with 60fps optimization
     */
    animateValue(start, end, duration, callback, easingFunction = this.easeInOutCubic) {
        return this.optimizeFrameRate((progress) => {
            const eased = easingFunction(progress);
            const value = start + (end - start) * eased;
            callback(value);
        }, duration);
    }
    
    /**
     * Easing function: ease-in-out cubic
     */
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    
    /**
     * Easing function: ease-in-out sine
     */
    easeInOutSine(t) {
        return -(Math.cos(Math.PI * t) - 1) / 2;
    }
    
    /**
     * Easing function: ease-out quad
     */
    easeOutQuad(t) {
        return 1 - (1 - t) * (1 - t);
    }
    
    /**
     * Easing function: ease-in quad
     */
    easeInQuad(t) {
        return t * t;
    }
    
    /**
     * Easing function: ease-in-out quad
     */
    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }
    
    /**
     * Easing function: ease-out cubic
     */
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    
    /**
     * Simple delay utility
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Configure transition effects
     */
    setEffects(effects) {
        this.effects = { ...this.effects, ...effects };
        console.log('Transition effects updated:', this.effects);
    }
    
    /**
     * Set transition duration
     */
    setDuration(duration) {
        this.transitionDuration = Math.max(500, Math.min(3000, duration));
        console.log('Transition duration set to:', this.transitionDuration, 'ms');
    }
    
    /**
     * Clear preloaded images cache
     */
    clearPreloadCache() {
        this.preloadedImages.clear();
        console.log('Preload cache cleared');
    }
    
    /**
     * Preload multiple panoramas
     */
    async preloadMultiplePanoramas(nodeDataArray) {
        const preloadPromises = nodeDataArray.map(nodeData => 
            this.preloadPanorama(nodeData).catch(error => {
                console.warn('Failed to preload:', nodeData.image, error);
                return null;
            })
        );
        
        const results = await Promise.all(preloadPromises);
        const successCount = results.filter(result => result !== null).length;
        
        console.log(`Preloaded ${successCount}/${nodeDataArray.length} panoramas`);
        return results;
    }
    
    /**
     * Get transition statistics with performance metrics
     */
    getStats() {
        return {
            isTransitioning: this.isTransitioning,
            duration: this.transitionDuration,
            effects: this.effects,
            preloadedCount: this.preloadedImages.size,
            preloadedImages: Array.from(this.preloadedImages.keys()),
            performanceMode: this.performanceMode,
            performanceStats: this.performanceStats,
            timingProfile: this.getCurrentTimingProfile()
        };
    }
    
    /**
     * Detect device performance capabilities
     */
    detectPerformanceCapabilities() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!gl) {
            this.performanceMode = 'low';
            console.log('WebGL not supported, using low performance mode');
            return;
        }
        
        // Check for mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Check hardware concurrency (CPU cores)
        const cores = navigator.hardwareConcurrency || 2;
        
        // Check memory (if available)
        const memory = navigator.deviceMemory || 4;
        
        // Determine performance mode
        if (isMobile && (cores < 4 || memory < 3)) {
            this.performanceMode = 'low';
            this.adaptEffectsForPerformance('low');
        } else if (isMobile || cores < 6 || memory < 6) {
            this.performanceMode = 'medium';
            this.adaptEffectsForPerformance('medium');
        } else {
            this.performanceMode = 'high';
        }
        
        console.log(`Performance mode detected: ${this.performanceMode} (cores: ${cores}, memory: ${memory}GB, mobile: ${isMobile})`);
    }
    
    /**
     * Adapt effects based on performance capabilities
     */
    adaptEffectsForPerformance(mode) {
        switch (mode) {
            case 'low':
                this.effects.sway = false; // Disable sway for low-end devices
                this.transitionDuration = 800; // Faster transitions
                break;
            case 'medium':
                this.effects.sway = true;
                this.transitionDuration = 1000; // Slightly faster
                break;
            case 'high':
                // Keep all effects enabled
                break;
        }
        
        console.log(`Effects adapted for ${mode} performance:`, this.effects);
    }
    
    /**
     * Set timing profile
     */
    setTimingProfile(profileName) {
        if (this.timingProfiles[profileName]) {
            const profile = this.timingProfiles[profileName];
            this.transitionDuration = profile.duration;
            this.effects = { ...this.effects, ...profile.effects };
            console.log(`Timing profile set to: ${profileName}`, profile);
        } else {
            console.warn('Unknown timing profile:', profileName);
        }
    }
    
    /**
     * Get current timing profile name
     */
    getCurrentTimingProfile() {
        for (const [name, profile] of Object.entries(this.timingProfiles)) {
            if (profile.duration === this.transitionDuration) {
                return name;
            }
        }
        return 'custom';
    }
    
    /**
     * Monitor transition performance
     */
    recordTransitionPerformance(startTime, endTime) {
        const transitionTime = endTime - startTime;
        this.performanceStats.transitionCount++;
        this.performanceStats.lastTransitionTime = transitionTime;
        
        // Calculate rolling average
        const count = this.performanceStats.transitionCount;
        this.performanceStats.avgTransitionTime = 
            (this.performanceStats.avgTransitionTime * (count - 1) + transitionTime) / count;
        
        // Check for performance issues
        if (transitionTime > this.transitionDuration * 1.5) {
            this.performanceStats.frameDrops++;
            
            // Auto-adapt if enabled
            if (this.performanceStats.adaptiveQuality && this.performanceStats.frameDrops > 3) {
                this.adaptForBetterPerformance();
            }
        }
        
        console.log(`Transition performance: ${transitionTime}ms (avg: ${Math.round(this.performanceStats.avgTransitionTime)}ms)`);
    }
    
    /**
     * Adapt settings for better performance
     */
    adaptForBetterPerformance() {
        console.log('Adapting for better performance due to frame drops');
        
        if (this.effects.sway) {
            this.effects.sway = false;
            console.log('Disabled sway effect for better performance');
        } else if (this.transitionDuration > 800) {
            this.transitionDuration = Math.max(800, this.transitionDuration - 200);
            console.log(`Reduced transition duration to ${this.transitionDuration}ms`);
        }
        
        // Reset frame drop counter
        this.performanceStats.frameDrops = 0;
    }
    
    /**
     * Optimize animation frame rate
     */
    optimizeFrameRate(callback, duration) {
        return new Promise(resolve => {
            const startTime = Date.now();
            let lastFrameTime = startTime;
            
            const animate = () => {
                const currentTime = Date.now();
                const elapsed = currentTime - startTime;
                const deltaTime = currentTime - lastFrameTime;
                
                // Skip frame if we're running too fast (maintain 60fps max)
                if (deltaTime < this.frameTime) {
                    requestAnimationFrame(animate);
                    return;
                }
                
                lastFrameTime = currentTime;
                const progress = Math.min(elapsed / duration, 1);
                
                callback(progress);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            
            animate();
        });
    }
}

// Export for use in other modules
window.TransitionManager = TransitionManager;