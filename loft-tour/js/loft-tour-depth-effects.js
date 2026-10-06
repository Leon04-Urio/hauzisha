/**
 * LOFT³ Depth Effects - Shadows, Blur, and Depth Perception
 * Provides visual depth cues for parallax layers
 */

class DepthEffectsManager {
    constructor(layerManager) {
        this.layerManager = layerManager;
        this.enabled = true;
        
        // Effect settings
        this.shadowSettings = {
            enabled: true,
            intensity: 0.3,
            blur: 8,
            offsetMultiplier: 2,
            color: 'rgba(0, 0, 0, 0.4)'
        };
        
        this.blurSettings = {
            enabled: true,
            maxBlur: 3,
            distanceThreshold: 0.8
        };
        
        this.scaleSettings = {
            enabled: true,
            minScale: 0.8,
            maxScale: 1.2,
            depthRange: 2.0
        };
        
        this.fogSettings = {
            enabled: true,
            color: 'rgba(255, 255, 255, 0.1)',
            density: 0.1,
            startDistance: 1.5
        };
        
        // Performance settings
        this.updateThrottle = 16; // ~60fps
        this.lastUpdateTime = 0;
        
        console.log('Depth Effects Manager initialized');
    }
    
    /**
     * Apply depth effects to all layers
     */
    applyDepthEffects(cameraCoords) {
        if (!this.enabled) return;
        
        const currentTime = Date.now();
        if (currentTime - this.lastUpdateTime < this.updateThrottle) {
            return;
        }
        
        this.lastUpdateTime = currentTime;
        
        const layers = this.layerManager.layers;
        if (!layers || layers.length === 0) return;
        
        layers.forEach(layer => {
            this.applyLayerDepthEffects(layer, cameraCoords);
        });
    }
    
    /**
     * Apply depth effects to a single layer
     */
    applyLayerDepthEffects(layer, cameraCoords) {
        const userData = layer.userData;
        if (!userData) return;
        
        const parallaxFactor = userData.parallaxFactor || 0.5;
        const distanceFromCamera = this.calculateDistanceFromCamera(layer, cameraCoords);
        
        // Apply shadow effects
        if (this.shadowSettings.enabled) {
            this.applyShadowEffect(layer, parallaxFactor, distanceFromCamera);
        }
        
        // Apply blur effects for depth of field
        if (this.blurSettings.enabled) {
            this.applyBlurEffect(layer, distanceFromCamera);
        }
        
        // Apply scale effects for depth perception
        if (this.scaleSettings.enabled) {
            this.applyScaleEffect(layer, parallaxFactor, distanceFromCamera);
        }
        
        // Apply fog/atmospheric effects
        if (this.fogSettings.enabled) {
            this.applyFogEffect(layer, distanceFromCamera);
        }
    }
    
    /**
     * Calculate perceived distance from camera
     */
    calculateDistanceFromCamera(layer, cameraCoords) {
        const userData = layer.userData;
        const parallaxFactor = userData.parallaxFactor || 0.5;
        
        // Calculate movement offset
        const yaw = cameraCoords?.yaw || 0;
        const pitch = cameraCoords?.pitch || 0;
        
        const parallaxX = yaw * parallaxFactor * 0.5;
        const parallaxY = pitch * parallaxFactor * 0.5;
        
        // Distance based on parallax movement and depth
        const movementDistance = Math.sqrt(parallaxX * parallaxX + parallaxY * parallaxY);
        const depthDistance = Math.abs(layer.position.z);
        
        return movementDistance + depthDistance;
    }
    
    /**
     * Apply shadow effects based on depth
     */
    applyShadowEffect(layer, parallaxFactor, distance) {
        if (!layer.material) return;
        
        // Calculate shadow intensity based on parallax factor
        // Higher parallax = closer = stronger shadow
        const shadowIntensity = this.shadowSettings.intensity * parallaxFactor;
        
        // Calculate shadow offset
        const shadowOffset = this.shadowSettings.offsetMultiplier * parallaxFactor;
        
        // Apply shadow via CSS filter (for canvas-based rendering)
        // This is a simplified approach - in a full implementation,
        // you might use separate shadow sprites or WebGL shaders
        
        const shadowBlur = this.shadowSettings.blur * parallaxFactor;
        const shadowColor = this.shadowSettings.color;
        
        // Store shadow data for rendering
        layer.userData.shadowEffect = {
            enabled: true,
            intensity: shadowIntensity,
            offsetX: shadowOffset,
            offsetY: shadowOffset * 1.5, // Shadows typically fall downward
            blur: shadowBlur,
            color: shadowColor
        };
    }
    
    /**
     * Apply blur effects for depth of field
     */
    applyBlurEffect(layer, distance) {
        if (!layer.material) return;
        
        // Calculate blur amount based on distance from focus point
        let blurAmount = 0;
        
        if (distance > this.blurSettings.distanceThreshold) {
            const excessDistance = distance - this.blurSettings.distanceThreshold;
            blurAmount = Math.min(this.blurSettings.maxBlur, excessDistance * 2);
        }
        
        // Apply blur to material (simplified approach)
        // In a full implementation, this might use WebGL shaders
        layer.userData.blurEffect = {
            enabled: blurAmount > 0,
            amount: blurAmount
        };
        
        // For Three.js sprites, we can't directly apply blur,
        // but we can simulate it by adjusting material properties
        if (blurAmount > 0) {
            // Reduce opacity slightly for distant objects
            const originalOpacity = layer.userData.originalOpacity || layer.material.opacity;
            layer.material.opacity = originalOpacity * (1 - blurAmount * 0.1);
        }
    }
    
    /**
     * Apply scale effects for depth perception
     */
    applyScaleEffect(layer, parallaxFactor, distance) {
        const userData = layer.userData;
        if (!userData.baseScale) return;
        
        // Calculate scale based on parallax factor (depth)
        // Higher parallax = closer = larger
        // Lower parallax = farther = smaller
        
        const depthScale = this.scaleSettings.minScale + 
            (this.scaleSettings.maxScale - this.scaleSettings.minScale) * parallaxFactor;
        
        // Apply distance-based scaling
        const distanceScale = Math.max(0.5, 1 - (distance * 0.1));
        
        const finalScale = depthScale * distanceScale;
        
        // Apply to layer scale
        const baseScale = userData.baseScale;
        layer.scale.set(
            baseScale.x * finalScale,
            baseScale.y * finalScale,
            baseScale.z
        );
        
        // Store depth scale data
        userData.depthScale = finalScale;
    }
    
    /**
     * Apply fog/atmospheric effects
     */
    applyFogEffect(layer, distance) {
        if (!layer.material) return;
        
        // Apply atmospheric perspective
        if (distance > this.fogSettings.startDistance) {
            const fogAmount = (distance - this.fogSettings.startDistance) * this.fogSettings.density;
            const fogIntensity = Math.min(0.5, fogAmount);
            
            // Reduce contrast and saturation for distant objects
            const originalOpacity = layer.userData.originalOpacity || layer.material.opacity;
            layer.material.opacity = originalOpacity * (1 - fogIntensity * 0.3);
            
            // Store fog effect data
            layer.userData.fogEffect = {
                enabled: true,
                intensity: fogIntensity,
                color: this.fogSettings.color
            };
        } else {
            layer.userData.fogEffect = {
                enabled: false,
                intensity: 0
            };
        }
    }
    
    /**
     * Render depth effects (for canvas-based rendering)
     */
    renderDepthEffects(ctx, layer, drawX, drawY, drawWidth, drawHeight) {
        if (!this.enabled || !layer.userData) return;
        
        const userData = layer.userData;
        
        // Render shadow
        if (userData.shadowEffect && userData.shadowEffect.enabled) {
            this.renderShadow(ctx, userData.shadowEffect, drawX, drawY, drawWidth, drawHeight);
        }
        
        // Apply blur filter
        if (userData.blurEffect && userData.blurEffect.enabled) {
            ctx.filter = `blur(${userData.blurEffect.amount}px)`;
        } else {
            ctx.filter = 'none';
        }
    }
    
    /**
     * Render shadow effect
     */
    renderShadow(ctx, shadowEffect, x, y, width, height) {
        ctx.save();
        
        // Set shadow properties
        ctx.shadowColor = shadowEffect.color;
        ctx.shadowBlur = shadowEffect.blur;
        ctx.shadowOffsetX = shadowEffect.offsetX;
        ctx.shadowOffsetY = shadowEffect.offsetY;
        
        // Draw shadow (simplified - just a rectangle)
        ctx.globalAlpha = shadowEffect.intensity;
        ctx.fillStyle = shadowEffect.color;
        ctx.fillRect(
            x + shadowEffect.offsetX,
            y + shadowEffect.offsetY,
            width,
            height
        );
        
        ctx.restore();
    }
    
    /**
     * Update effect settings
     */
    updateSettings(category, settings) {
        switch (category) {
            case 'shadow':
                Object.assign(this.shadowSettings, settings);
                break;
            case 'blur':
                Object.assign(this.blurSettings, settings);
                break;
            case 'scale':
                Object.assign(this.scaleSettings, settings);
                break;
            case 'fog':
                Object.assign(this.fogSettings, settings);
                break;
        }
        
        console.log(`Updated ${category} settings:`, settings);
    }
    
    /**
     * Enable/disable depth effects
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        
        if (!enabled) {
            // Reset all layers to default state
            this.layerManager.layers.forEach(layer => {
                if (layer.userData) {
                    // Reset opacity
                    if (layer.userData.originalOpacity) {
                        layer.material.opacity = layer.userData.originalOpacity;
                    }
                    
                    // Reset scale
                    if (layer.userData.baseScale) {
                        layer.scale.copy(layer.userData.baseScale);
                    }
                    
                    // Clear effect data
                    delete layer.userData.shadowEffect;
                    delete layer.userData.blurEffect;
                    delete layer.userData.fogEffect;
                    delete layer.userData.depthScale;
                }
            });
        }
        
        console.log('Depth effects', enabled ? 'enabled' : 'disabled');
    }
    
    /**
     * Get current settings
     */
    getSettings() {
        return {
            enabled: this.enabled,
            shadow: { ...this.shadowSettings },
            blur: { ...this.blurSettings },
            scale: { ...this.scaleSettings },
            fog: { ...this.fogSettings }
        };
    }
    
    /**
     * Reset to default settings
     */
    resetToDefaults() {
        this.shadowSettings = {
            enabled: true,
            intensity: 0.3,
            blur: 8,
            offsetMultiplier: 2,
            color: 'rgba(0, 0, 0, 0.4)'
        };
        
        this.blurSettings = {
            enabled: true,
            maxBlur: 3,
            distanceThreshold: 0.8
        };
        
        this.scaleSettings = {
            enabled: true,
            minScale: 0.8,
            maxScale: 1.2,
            depthRange: 2.0
        };
        
        this.fogSettings = {
            enabled: true,
            color: 'rgba(255, 255, 255, 0.1)',
            density: 0.1,
            startDistance: 1.5
        };
        
        console.log('Depth effects reset to defaults');
    }
    
    /**
     * Get performance statistics
     */
    getStats() {
        const layerCount = this.layerManager.layers.length;
        const effectsApplied = this.layerManager.layers.filter(layer => 
            layer.userData && (
                layer.userData.shadowEffect?.enabled ||
                layer.userData.blurEffect?.enabled ||
                layer.userData.fogEffect?.enabled
            )
        ).length;
        
        return {
            enabled: this.enabled,
            layerCount,
            effectsApplied,
            effectsRatio: layerCount > 0 ? (effectsApplied / layerCount) : 0,
            updateThrottle: this.updateThrottle,
            lastUpdateTime: this.lastUpdateTime
        };
    }
}

/**
 * Depth Effects UI Controls
 * Provides interface for adjusting depth effect settings
 */
class DepthEffectsUI {
    constructor(depthEffectsManager) {
        this.depthEffects = depthEffectsManager;
        this.panel = null;
    }
    
    /**
     * Create depth effects control panel
     */
    createControlPanel(container) {
        this.panel = document.createElement('div');
        this.panel.className = 'depth-effects-panel';
        this.panel.innerHTML = `
            <div class="panel-header">
                <h4>Depth Effects</h4>
                <button class="btn-icon" onclick="depthEffectsUI.togglePanel()">
                    <i class="fas fa-chevron-up"></i>
                </button>
            </div>
            
            <div class="panel-content">
                <div class="effect-group">
                    <div class="effect-header">
                        <label class="checkbox-label">
                            <input type="checkbox" id="depth-effects-enabled" 
                                   ${this.depthEffects.enabled ? 'checked' : ''}
                                   onchange="depthEffectsUI.toggleEffects(this.checked)">
                            <span>Enable Depth Effects</span>
                        </label>
                    </div>
                </div>
                
                <div class="effect-group">
                    <div class="effect-header">
                        <label class="checkbox-label">
                            <input type="checkbox" id="shadow-enabled" 
                                   ${this.depthEffects.shadowSettings.enabled ? 'checked' : ''}
                                   onchange="depthEffectsUI.updateSetting('shadow', 'enabled', this.checked)">
                            <span>Shadows</span>
                        </label>
                    </div>
                    <div class="effect-controls">
                        <div class="control-group">
                            <label>Intensity: <span id="shadow-intensity-val">${this.depthEffects.shadowSettings.intensity}</span></label>
                            <input type="range" id="shadow-intensity" 
                                   min="0" max="1" step="0.1" 
                                   value="${this.depthEffects.shadowSettings.intensity}"
                                   oninput="depthEffectsUI.updateSetting('shadow', 'intensity', parseFloat(this.value))">
                        </div>
                        <div class="control-group">
                            <label>Blur: <span id="shadow-blur-val">${this.depthEffects.shadowSettings.blur}</span></label>
                            <input type="range" id="shadow-blur" 
                                   min="0" max="20" step="1" 
                                   value="${this.depthEffects.shadowSettings.blur}"
                                   oninput="depthEffectsUI.updateSetting('shadow', 'blur', parseFloat(this.value))">
                        </div>
                    </div>
                </div>
                
                <div class="effect-group">
                    <div class="effect-header">
                        <label class="checkbox-label">
                            <input type="checkbox" id="blur-enabled" 
                                   ${this.depthEffects.blurSettings.enabled ? 'checked' : ''}
                                   onchange="depthEffectsUI.updateSetting('blur', 'enabled', this.checked)">
                            <span>Depth Blur</span>
                        </label>
                    </div>
                    <div class="effect-controls">
                        <div class="control-group">
                            <label>Max Blur: <span id="blur-max-val">${this.depthEffects.blurSettings.maxBlur}</span></label>
                            <input type="range" id="blur-max" 
                                   min="0" max="10" step="0.5" 
                                   value="${this.depthEffects.blurSettings.maxBlur}"
                                   oninput="depthEffectsUI.updateSetting('blur', 'maxBlur', parseFloat(this.value))">
                        </div>
                    </div>
                </div>
                
                <div class="effect-group">
                    <div class="effect-header">
                        <label class="checkbox-label">
                            <input type="checkbox" id="fog-enabled" 
                                   ${this.depthEffects.fogSettings.enabled ? 'checked' : ''}
                                   onchange="depthEffectsUI.updateSetting('fog', 'enabled', this.checked)">
                            <span>Atmospheric Fog</span>
                        </label>
                    </div>
                    <div class="effect-controls">
                        <div class="control-group">
                            <label>Density: <span id="fog-density-val">${this.depthEffects.fogSettings.density}</span></label>
                            <input type="range" id="fog-density" 
                                   min="0" max="0.5" step="0.01" 
                                   value="${this.depthEffects.fogSettings.density}"
                                   oninput="depthEffectsUI.updateSetting('fog', 'density', parseFloat(this.value))">
                        </div>
                    </div>
                </div>
                
                <div class="effect-actions">
                    <button class="btn btn-outline btn-sm" onclick="depthEffectsUI.resetToDefaults()">
                        <i class="fas fa-undo"></i> Reset
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="depthEffectsUI.showStats()">
                        <i class="fas fa-chart-bar"></i> Stats
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(this.panel);
        return this.panel;
    }
    
    /**
     * Toggle effects on/off
     */
    toggleEffects(enabled) {
        this.depthEffects.setEnabled(enabled);
    }
    
    /**
     * Update a specific setting
     */
    updateSetting(category, property, value) {
        const settings = {};
        settings[property] = value;
        this.depthEffects.updateSettings(category, settings);
        
        // Update display value
        const displayEl = document.getElementById(`${category}-${property}-val`);
        if (displayEl) {
            displayEl.textContent = value;
        }
    }
    
    /**
     * Reset to default settings
     */
    resetToDefaults() {
        this.depthEffects.resetToDefaults();
        
        // Update UI controls
        if (this.panel) {
            const container = this.panel.parentElement;
            this.panel.remove();
            this.createControlPanel(container);
        }
    }
    
    /**
     * Show performance statistics
     */
    showStats() {
        const stats = this.depthEffects.getStats();
        
        const message = `
Depth Effects Statistics:
• Status: ${stats.enabled ? 'Enabled' : 'Disabled'}
• Total Layers: ${stats.layerCount}
• Effects Applied: ${stats.effectsApplied}
• Effects Ratio: ${(stats.effectsRatio * 100).toFixed(1)}%
• Update Rate: ${(1000 / stats.updateThrottle).toFixed(0)} FPS
        `.trim();
        
        alert(message);
    }
    
    /**
     * Toggle panel visibility
     */
    togglePanel() {
        if (this.panel) {
            const content = this.panel.querySelector('.panel-content');
            const icon = this.panel.querySelector('.panel-header i');
            
            if (content.style.display === 'none') {
                content.style.display = 'block';
                icon.className = 'fas fa-chevron-up';
            } else {
                content.style.display = 'none';
                icon.className = 'fas fa-chevron-down';
            }
        }
    }
}

// Export for use in other modules
window.DepthEffectsManager = DepthEffectsManager;
window.DepthEffectsUI = DepthEffectsUI;