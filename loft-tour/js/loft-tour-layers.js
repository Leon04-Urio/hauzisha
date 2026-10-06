/**
 * LOFT³ Layer Manager - Three.js Parallax Layer System
 * Handles PNG overlays with parallax effects synchronized with Marzipano camera
 */

class LayerManager {
    constructor(tourEngine) {
        this.engine = tourEngine;
        this.layers = [];
        this.textureLoader = new THREE.TextureLoader();
        
        // Performance settings
        this.maxLayers = 20;
        this.enableDepthSorting = true;
        this.enableParallax = true;
        
        // Texture cache for reuse
        this.textureCache = new Map();
        
        // Visibility culling
        this.enableFrustumCulling = true;
        this.visibilityThreshold = 0.01; // Minimum opacity to render
        
        // Performance tracking
        this.renderCount = 0;
        this.skippedRenderCount = 0;
        
        // Enhanced sprite rendering features
        this.enableBatching = true; // Batch similar sprites for performance
        this.enableLOD = true; // Level of detail based on distance/size
        this.enableOcclusion = false; // Occlusion culling (disabled by default)
        this.spriteBatches = new Map(); // Batched sprites by material
        
        // Advanced rendering options
        this.enableAntialiasing = true;
        this.enableMipmapping = false; // Disabled for sprites to save memory
        this.textureFilterMode = THREE.LinearFilter; // High quality filtering
        
        // Sprite-specific optimizations
        this.enableSpritePooling = true; // Reuse sprite objects
        this.spritePool = []; // Pool of reusable sprites
        this.maxPoolSize = 50;
        
        // Initialize depth effects manager
        this.depthEffects = new DepthEffectsManager(this);
        
        console.log('LayerManager initialized with performance optimizations and depth effects');
    }
    
    /**
     * Load layers for current node
     */
    loadLayers(layerDataArray) {
        try {
            // Clear existing layers
            this.clearLayers();
            
            if (!layerDataArray || layerDataArray.length === 0) {
                console.log('No layers to load');
                return;
            }
            
            // Load each layer
            layerDataArray.forEach((layerData, index) => {
                this.addLayer(layerData, index);
            });
            
            // Sort layers by depth
            if (this.enableDepthSorting) {
                this.sortLayersByDepth();
            }
            
            console.log(`Loaded ${layerDataArray.length} layers`);
        } catch (error) {
            console.error('Failed to load layers:', error);
        }
    }
    
    /**
     * Add a single layer to the scene with enhanced sprite features and texture caching
     */
    addLayer(layerData, index = 0) {
        try {
            // Validate layer data
            if (!layerData.image) {
                console.warn('Layer missing image property:', layerData);
                return null;
            }
            
            // Check layer limit
            if (this.layers.length >= this.maxLayers) {
                console.warn('Maximum layer limit reached:', this.maxLayers);
                return null;
            }
            
            // Load texture with caching and enhanced options
            const imageUrl = this.resolveLayerImageUrl(layerData.image);
            let texture;
            
            // Check cache first
            if (this.textureCache.has(imageUrl)) {
                texture = this.textureCache.get(imageUrl);
                console.log('Using cached texture:', layerData.image);
            } else {
                // Load new texture with enhanced settings
                texture = this.textureLoader.load(
                    imageUrl,
                    (loadedTexture) => {
                        // Enhanced texture optimization for sprites
                        loadedTexture.minFilter = this.textureFilterMode;
                        loadedTexture.magFilter = this.textureFilterMode;
                        loadedTexture.generateMipmaps = this.enableMipmapping;
                        loadedTexture.flipY = false; // Sprites don't need Y flip
                        loadedTexture.premultiplyAlpha = false; // Better transparency
                        
                        // Enable anisotropic filtering if available
                        if (this.enableAntialiasing) {
                            const maxAnisotropy = this.engine.layerRenderer.capabilities.getMaxAnisotropy();
                            loadedTexture.anisotropy = Math.min(4, maxAnisotropy);
                        }
                        
                        // Cache the texture
                        this.textureCache.set(imageUrl, loadedTexture);
                        console.log('Enhanced texture loaded and cached:', layerData.image);
                    },
                    undefined,
                    (error) => {
                        console.error('Failed to load layer texture:', layerData.image, error);
                    }
                );
                
                // Set initial optimization settings
                texture.minFilter = this.textureFilterMode;
                texture.magFilter = this.textureFilterMode;
                texture.generateMipmaps = this.enableMipmapping;
                texture.flipY = false;
                texture.premultiplyAlpha = false;
            }
            
            // Create or reuse sprite from pool
            let sprite;
            if (this.enableSpritePooling && this.spritePool.length > 0) {
                sprite = this.spritePool.pop();
                // Update material with new texture
                sprite.material.map = texture;
                sprite.material.needsUpdate = true;
                console.log('Reused sprite from pool');
            } else {
                // Create enhanced sprite material with advanced blending options
                const material = new THREE.SpriteMaterial({
                    map: texture,
                    transparent: true,
                    opacity: layerData.opacity !== undefined ? layerData.opacity : 1.0,
                    depthTest: false,
                    depthWrite: false,
                    blending: this.getBlendingMode(layerData.blendMode),
                    fog: false, // Disable fog calculations for sprites
                    precision: 'mediump', // Use medium precision for better performance
                    alphaTest: layerData.alphaTest || 0.01, // Discard transparent pixels
                    side: THREE.DoubleSide // Render both sides for flexibility
                });
                
                // Create sprite
                sprite = new THREE.Sprite(material);
            }
            
            // Set position (convert from 0-1 range to -1 to 1 range)
            const position = layerData.position || { x: 0.5, y: 0.5 };
            sprite.position.set(
                (position.x * 2) - 1,  // Convert 0-1 to -1 to 1
                -((position.y * 2) - 1), // Convert 0-1 to -1 to 1, flip Y
                -(layerData.depth || (index * 0.1 + 1)) // Depth for sorting
            );
            
            // Set scale with enhanced aspect ratio handling
            const scale = layerData.scale || 1.0;
            const aspectRatio = this.engine.container.clientWidth / this.engine.container.clientHeight;
            const scaleMultiplier = layerData.maintainAspectRatio !== false ? aspectRatio : 1.0;
            
            sprite.scale.set(
                scale * 0.3 * scaleMultiplier,
                scale * 0.3,
                1
            );
            
            // Set rotation
            if (layerData.rotation) {
                sprite.material.rotation = this.engine.deg2rad(layerData.rotation);
            }
            
            // Enhanced sprite properties
            sprite.userData = {
                layerData: layerData,
                parallaxFactor: layerData.parallaxFactor !== undefined ? layerData.parallaxFactor : 0.5,
                basePosition: sprite.position.clone(),
                baseScale: sprite.scale.clone(),
                index: index,
                id: layerData.id || `layer_${index}`,
                name: layerData.name || layerData.image,
                lastUpdateTime: 0, // For throttling updates
                needsUpdate: true,
                // Enhanced sprite features
                lodLevel: 0, // Level of detail
                isVisible: true,
                distanceFromCenter: 0,
                originalOpacity: layerData.opacity || 1.0,
                animationState: null // For future animation support
            };
            
            // Enhanced rendering optimizations
            sprite.frustumCulled = this.enableFrustumCulling;
            sprite.matrixAutoUpdate = true; // Enable automatic matrix updates
            sprite.castShadow = false; // Sprites don't cast shadows
            sprite.receiveShadow = false; // Sprites don't receive shadows
            
            // Set render order for proper depth sorting
            sprite.renderOrder = layerData.renderOrder || index;
            
            // Add to scene and tracking array
            this.layers.push(sprite);
            this.engine.layerScene.add(sprite);
            
            console.log('Enhanced sprite added with optimizations:', sprite.userData.name);
            return sprite;
            
        } catch (error) {
            console.error('Failed to add enhanced sprite layer:', error);
            return null;
        }
    }
    
    /**
     * Get blending mode for sprite material
     */
    getBlendingMode(blendMode) {
        switch (blendMode) {
            case 'normal':
                return THREE.NormalBlending;
            case 'additive':
                return THREE.AdditiveBlending;
            case 'subtractive':
                return THREE.SubtractiveBlending;
            case 'multiply':
                return THREE.MultiplyBlending;
            case 'screen':
                return THREE.CustomBlending; // Can be customized further
            default:
                return THREE.NormalBlending;
        }
    }
    
    /**
     * Update parallax effect based on camera coordinates with enhanced optimizations
     */
    updateParallax(marzipanoCoords) {
        if (!marzipanoCoords || this.layers.length === 0) {
            return;
        }
        
        // Skip if parallax is disabled (low-end devices)
        if (!this.enableParallax) {
            return;
        }
        
        const yaw = marzipanoCoords.yaw || 0;
        const pitch = marzipanoCoords.pitch || 0;
        const fov = marzipanoCoords.fov || this.engine.deg2rad(75);
        
        // Store last coordinates for debugging
        this.lastCoords = { yaw, pitch, fov };
        
        // Batch update layers
        const currentTime = Date.now();
        let updatedCount = 0;
        
        // Update each layer with synchronized camera data
        for (let i = 0; i < this.layers.length; i++) {
            const layer = this.layers[i];
            
            // Skip invisible layers
            if (!layer.visible || layer.material.opacity < this.visibilityThreshold) {
                this.skippedRenderCount++;
                continue;
            }
            
            // Throttle updates for distant layers (optional optimization)
            const userData = layer.userData;
            const timeSinceLastUpdate = currentTime - userData.lastUpdateTime;
            
            // Update high-priority layers every frame, low-priority every other frame
            const updateInterval = userData.parallaxFactor > 0.7 ? 0 : 16;
            
            if (timeSinceLastUpdate >= updateInterval || userData.needsUpdate) {
                this.updateLayerParallax(layer, yaw, pitch, fov);
                userData.lastUpdateTime = currentTime;
                userData.needsUpdate = false;
                updatedCount++;
            }
        }
        
        // Apply depth effects
        if (this.depthEffects) {
            this.depthEffects.applyDepthEffects({ yaw, pitch, fov });
        }
        
        this.renderCount++;
        
        // Log performance stats periodically
        if (this.renderCount % 300 === 0) {
            const skipRatio = this.skippedRenderCount / (this.renderCount * this.layers.length);
            console.log('Layer render stats:', {
                totalLayers: this.layers.length,
                updatedThisFrame: updatedCount,
                skipRatio: (skipRatio * 100).toFixed(1) + '%'
            });
        }
    }
    
    /**
     * Update parallax for a single layer with enhanced sprite features
     */
    updateLayerParallax(layer, yaw, pitch, fov) {
        const userData = layer.userData;
        const factor = userData.parallaxFactor;
        const base = userData.basePosition;
        
        // Enhanced parallax calculation with improved algorithm
        // The parallax factor determines how much the layer moves relative to camera
        // factor = 0: layer is static (background)
        // factor = 1: layer moves with full camera movement (foreground)
        
        const parallaxX = yaw * factor * 0.5;
        const parallaxY = pitch * factor * 0.5;
        
        // Apply parallax offset
        layer.position.x = base.x + parallaxX;
        layer.position.y = base.y + parallaxY;
        
        // Enhanced sprite features
        
        // 1. Scale based on FOV for depth perception
        if (userData.layerData.scaleWithFov) {
            const fovFactor = fov / this.engine.deg2rad(75); // Normalize to default FOV
            layer.scale.copy(userData.baseScale).multiplyScalar(fovFactor);
        }
        
        // 2. Fade based on distance from center for focus effect
        if (userData.layerData.fadeWithDistance) {
            const distance = Math.sqrt(parallaxX * parallaxX + parallaxY * parallaxY);
            const maxDistance = 1.0;
            const fadeFactor = Math.max(0, 1 - (distance / maxDistance));
            layer.material.opacity = userData.originalOpacity * fadeFactor;
        }
        
        // 3. Rotation based on camera movement for enhanced depth
        if (userData.layerData.rotateWithCamera) {
            const rotationAmount = (yaw * factor * 0.1); // Subtle rotation
            layer.material.rotation = userData.layerData.rotation ? 
                this.engine.deg2rad(userData.layerData.rotation) + rotationAmount : 
                rotationAmount;
        }
        
        // 4. Level of Detail (LOD) based on distance and size
        if (this.enableLOD) {
            const distanceFromCenter = Math.sqrt(parallaxX * parallaxX + parallaxY * parallaxY);
            userData.distanceFromCenter = distanceFromCenter;
            
            // Adjust sprite quality based on distance
            if (distanceFromCenter > 0.8) {
                userData.lodLevel = 2; // Low quality
                layer.material.precision = 'lowp';
            } else if (distanceFromCenter > 0.4) {
                userData.lodLevel = 1; // Medium quality
                layer.material.precision = 'mediump';
            } else {
                userData.lodLevel = 0; // High quality
                layer.material.precision = 'highp';
            }
        }
        
        // 5. Visibility culling based on position and opacity
        const isInView = Math.abs(parallaxX) < 2 && Math.abs(parallaxY) < 2;
        const isVisible = layer.material.opacity > this.visibilityThreshold && isInView;
        
        if (userData.isVisible !== isVisible) {
            userData.isVisible = isVisible;
            layer.visible = isVisible;
        }
        
        // 6. Update render order for proper sprite sorting
        if (userData.layerData.dynamicDepth) {
            const depthFactor = factor * 10; // Higher parallax = closer = higher render order
            layer.renderOrder = userData.index + depthFactor;
        }
    }
    
    /**
     * Get last synchronized camera coordinates (for debugging)
     */
    getLastCoordinates() {
        return this.lastCoords || { yaw: 0, pitch: 0, fov: 0 };
    }
    
    /**
     * Synchronize layers with panorama after transition
     */
    syncWithPanorama() {
        if (!this.engine.currentView) {
            console.warn('Cannot sync layers: no current view');
            return;
        }
        
        try {
            // Force immediate synchronization with current camera
            this.forceSyncWithCamera();
            
            // Reset any transition-related layer states
            this.layers.forEach(layer => {
                const userData = layer.userData;
                
                // Reset update flags
                userData.needsUpdate = true;
                userData.lastUpdateTime = 0;
                
                // Ensure layer is properly positioned
                if (userData.layerData) {
                    const pos = userData.layerData.position || { x: 0.5, y: 0.5 };
                    const baseX = pos.x * 2 - 1;
                    const baseY = -(pos.y * 2 - 1);
                    
                    userData.basePosition.set(baseX, baseY, userData.layerData.depth || -1);
                    layer.position.copy(userData.basePosition);
                }
                
                // Ensure proper visibility
                if (userData.layerData.opacity !== undefined) {
                    layer.material.opacity = userData.layerData.opacity;
                    layer.visible = userData.layerData.opacity > 0;
                }
            });
            
            // Sort layers by depth after sync
            if (this.enableDepthSorting) {
                this.sortLayersByDepth();
            }
            
            console.log('Layers synchronized with panorama');
            
        } catch (error) {
            console.error('Failed to sync layers with panorama:', error);
        }
    }
    
    /**
     * Force immediate synchronization with current camera
     */
    forceSyncWithCamera() {
        if (this.engine.currentView) {
            const coords = this.engine.currentView.coordinates();
            if (coords) {
                this.updateParallax(coords);
                console.log('Forced camera sync:', coords);
            }
        }
    }
    
    /**
     * Sort layers by depth (back to front)
     */
    sortLayersByDepth() {
        this.layers.sort((a, b) => {
            return a.position.z - b.position.z; // Further layers first
        });
        
        // Update render order
        this.layers.forEach((layer, index) => {
            layer.renderOrder = index;
        });
    }
    
    /**
     * Clear all layers from scene with proper cleanup and sprite pooling
     */
    clearLayers() {
        this.layers.forEach(layer => {
            // Remove from scene
            this.engine.layerScene.remove(layer);
            
            // Add to sprite pool for reuse if pooling is enabled
            if (this.enableSpritePooling && this.spritePool.length < this.maxPoolSize) {
                // Reset sprite properties for reuse
                layer.position.set(0, 0, 0);
                layer.scale.set(1, 1, 1);
                layer.material.opacity = 1.0;
                layer.material.rotation = 0;
                layer.visible = true;
                layer.renderOrder = 0;
                
                // Clear userData but keep structure
                layer.userData = {
                    layerData: null,
                    parallaxFactor: 0.5,
                    basePosition: layer.position.clone(),
                    baseScale: layer.scale.clone(),
                    index: 0,
                    id: null,
                    name: null,
                    lastUpdateTime: 0,
                    needsUpdate: true,
                    lodLevel: 0,
                    isVisible: true,
                    distanceFromCenter: 0,
                    originalOpacity: 1.0,
                    animationState: null
                };
                
                this.spritePool.push(layer);
                console.log('Sprite added to pool for reuse');
            } else {
                // Dispose of resources (but keep cached textures)
                if (layer.material) {
                    // Don't dispose cached textures, just the material
                    layer.material.dispose();
                }
            }
        });
        
        this.layers = [];
        console.log(`All layers cleared (${this.spritePool.length} sprites pooled for reuse, textures cached)`);
    }
    
    /**
     * Clear texture cache and free memory
     */
    clearTextureCache() {
        this.textureCache.forEach((texture, url) => {
            texture.dispose();
        });
        this.textureCache.clear();
        console.log('Texture cache cleared');
    }
    
    /**
     * Preload textures for next node
     */
    async preloadTextures(layerDataArray) {
        if (!layerDataArray || layerDataArray.length === 0) {
            return;
        }
        
        const promises = layerDataArray.map(layerData => {
            const imageUrl = this.resolveLayerImageUrl(layerData.image);
            
            // Skip if already cached
            if (this.textureCache.has(imageUrl)) {
                return Promise.resolve();
            }
            
            return new Promise((resolve, reject) => {
                this.textureLoader.load(
                    imageUrl,
                    (texture) => {
                        texture.minFilter = THREE.LinearFilter;
                        texture.magFilter = THREE.LinearFilter;
                        texture.generateMipmaps = false;
                        this.textureCache.set(imageUrl, texture);
                        resolve();
                    },
                    undefined,
                    reject
                );
            });
        });
        
        try {
            await Promise.all(promises);
            console.log('Preloaded', layerDataArray.length, 'layer textures');
        } catch (error) {
            console.error('Failed to preload some textures:', error);
        }
    }
    
    /**
     * Get layer by ID
     */
    getLayerById(id) {
        return this.layers.find(layer => layer.userData.id === id);
    }
    
    /**
     * Remove layer by ID
     */
    removeLayerById(id) {
        const layerIndex = this.layers.findIndex(layer => layer.userData.id === id);
        
        if (layerIndex !== -1) {
            const layer = this.layers[layerIndex];
            
            // Remove from scene
            this.engine.layerScene.remove(layer);
            
            // Dispose resources
            if (layer.material) {
                if (layer.material.map) {
                    layer.material.map.dispose();
                }
                layer.material.dispose();
            }
            
            // Remove from array
            this.layers.splice(layerIndex, 1);
            
            console.log('Layer removed:', id);
            return true;
        }
        
        return false;
    }
    
    /**
     * Update layer properties
     */
    updateLayer(id, updates) {
        const layer = this.getLayerById(id);
        
        if (!layer) {
            console.warn('Layer not found:', id);
            return false;
        }
        
        const userData = layer.userData;
        
        // Update position
        if (updates.position) {
            const pos = updates.position;
            layer.position.set(
                (pos.x * 2) - 1,
                -((pos.y * 2) - 1),
                layer.position.z
            );
            userData.basePosition = layer.position.clone();
        }
        
        // Update scale
        if (updates.scale !== undefined) {
            const aspectRatio = this.engine.container.clientWidth / this.engine.container.clientHeight;
            layer.scale.set(
                updates.scale * 0.3 * aspectRatio,
                updates.scale * 0.3,
                1
            );
            userData.baseScale = layer.scale.clone();
        }
        
        // Update opacity
        if (updates.opacity !== undefined) {
            layer.material.opacity = updates.opacity;
            userData.layerData.opacity = updates.opacity;
        }
        
        // Update parallax factor
        if (updates.parallaxFactor !== undefined) {
            userData.parallaxFactor = updates.parallaxFactor;
            userData.layerData.parallaxFactor = updates.parallaxFactor;
        }
        
        // Update rotation
        if (updates.rotation !== undefined) {
            layer.material.rotation = this.engine.deg2rad(updates.rotation);
            userData.layerData.rotation = updates.rotation;
        }
        
        console.log('Layer updated:', id);
        return true;
    }
    
    /**
     * Toggle layer visibility
     */
    toggleLayerVisibility(id) {
        const layer = this.getLayerById(id);
        
        if (layer) {
            layer.visible = !layer.visible;
            console.log('Layer visibility toggled:', id, layer.visible);
            return layer.visible;
        }
        
        return false;
    }
    
    /**
     * Get all layer data for export
     */
    exportLayerData() {
        return this.layers.map(layer => {
            const userData = layer.userData;
            return {
                id: userData.id,
                name: userData.name,
                image: userData.layerData.image,
                position: {
                    x: (userData.basePosition.x + 1) / 2,
                    y: (-userData.basePosition.y + 1) / 2
                },
                scale: userData.layerData.scale,
                opacity: userData.layerData.opacity,
                parallaxFactor: userData.parallaxFactor,
                rotation: userData.layerData.rotation || 0,
                depth: -userData.basePosition.z
            };
        });
    }
    
    /**
     * Resolve layer image URL
     */
    resolveLayerImageUrl(imagePath) {
        // Handle base64 data URLs directly
        if (imagePath.startsWith('data:')) {
            return imagePath;
        }
        
        // Handle absolute URLs and paths
        if (imagePath.startsWith('http') || imagePath.startsWith('/')) {
            return imagePath;
        }
        
        // Assume layer images are in uploads/loft-tours/layers/ directory
        return `../uploads/loft-tours/layers/${imagePath}`;
    }
    
    /**
     * Handle window resize
     */
    handleResize() {
        const aspectRatio = this.engine.container.clientWidth / this.engine.container.clientHeight;
        
        // Update layer scales to maintain aspect ratio
        this.layers.forEach(layer => {
            const userData = layer.userData;
            const scale = userData.layerData.scale || 1.0;
            
            layer.scale.set(
                scale * 0.3 * aspectRatio,
                scale * 0.3,
                1
            );
            
            userData.baseScale = layer.scale.clone();
        });
    }
    
    /**
     * Get comprehensive performance statistics including sprite-specific metrics
     */
    getStats() {
        return {
            layerCount: this.layers.length,
            maxLayers: this.maxLayers,
            texturesLoaded: this.layers.filter(layer => 
                layer.material.map && layer.material.map.image
            ).length,
            texturesCached: this.textureCache.size,
            memoryUsage: this.estimateMemoryUsage(),
            renderCount: this.renderCount,
            skippedRenderCount: this.skippedRenderCount,
            renderEfficiency: this.renderCount > 0 ? 
                (1 - this.skippedRenderCount / (this.renderCount * this.layers.length)) : 1,
            // Enhanced sprite-specific stats
            spritePoolSize: this.spritePool.length,
            maxPoolSize: this.maxPoolSize,
            visibleSprites: this.layers.filter(layer => layer.visible).length,
            lodLevels: this.getLODDistribution(),
            blendingModes: this.getBlendingModeStats(),
            averageParallaxFactor: this.getAverageParallaxFactor(),
            performanceLevel: this.getPerformanceLevel()
        };
    }
    
    /**
     * Get Level of Detail distribution
     */
    getLODDistribution() {
        const lodCounts = { 0: 0, 1: 0, 2: 0 };
        this.layers.forEach(layer => {
            const lod = layer.userData.lodLevel || 0;
            lodCounts[lod]++;
        });
        return lodCounts;
    }
    
    /**
     * Get blending mode statistics
     */
    getBlendingModeStats() {
        const blendingCounts = {};
        this.layers.forEach(layer => {
            const blending = layer.material.blending;
            const blendName = this.getBlendingName(blending);
            blendingCounts[blendName] = (blendingCounts[blendName] || 0) + 1;
        });
        return blendingCounts;
    }
    
    /**
     * Get blending mode name from constant
     */
    getBlendingName(blending) {
        switch (blending) {
            case THREE.NormalBlending: return 'Normal';
            case THREE.AdditiveBlending: return 'Additive';
            case THREE.SubtractiveBlending: return 'Subtractive';
            case THREE.MultiplyBlending: return 'Multiply';
            case THREE.CustomBlending: return 'Custom';
            default: return 'Unknown';
        }
    }
    
    /**
     * Get average parallax factor
     */
    getAverageParallaxFactor() {
        if (this.layers.length === 0) return 0;
        const sum = this.layers.reduce((acc, layer) => acc + layer.userData.parallaxFactor, 0);
        return sum / this.layers.length;
    }
    
    /**
     * Get current performance level
     */
    getPerformanceLevel() {
        const efficiency = this.renderCount > 0 ? 
            (1 - this.skippedRenderCount / (this.renderCount * this.layers.length)) : 1;
        
        if (efficiency > 0.9) return 'Excellent';
        if (efficiency > 0.7) return 'Good';
        if (efficiency > 0.5) return 'Fair';
        return 'Poor';
    }
    
    /**
     * Optimize sprite rendering performance
     */
    optimizeSpritePerformance() {
        let optimizations = 0;
        
        // 1. Disable features on low-end devices
        if (this.layers.length > 15) {
            this.enableLOD = true;
            this.enableFrustumCulling = true;
            optimizations++;
        }
        
        // 2. Batch sprites with similar properties
        if (this.enableBatching) {
            this.batchSimilarSprites();
            optimizations++;
        }
        
        // 3. Adjust quality based on performance
        const efficiency = this.renderCount > 0 ? 
            (1 - this.skippedRenderCount / (this.renderCount * this.layers.length)) : 1;
        
        if (efficiency < 0.6) {
            // Reduce quality for better performance
            this.textureFilterMode = THREE.NearestFilter;
            this.enableAntialiasing = false;
            optimizations++;
        }
        
        // 4. Clean up unused sprites from pool
        if (this.spritePool.length > this.maxPoolSize) {
            const excess = this.spritePool.splice(this.maxPoolSize);
            excess.forEach(sprite => {
                if (sprite.material) sprite.material.dispose();
            });
            optimizations++;
        }
        
        console.log(`Applied ${optimizations} sprite performance optimizations`);
        return optimizations;
    }
    
    /**
     * Batch similar sprites for improved performance
     */
    batchSimilarSprites() {
        // Group sprites by material properties
        const batches = new Map();
        
        this.layers.forEach(layer => {
            const key = `${layer.material.blending}_${layer.material.opacity}_${layer.userData.parallaxFactor}`;
            if (!batches.has(key)) {
                batches.set(key, []);
            }
            batches.get(key).push(layer);
        });
        
        // Log batching information
        console.log(`Sprites batched into ${batches.size} groups for optimized rendering`);
        
        return batches;
    }
    
    /**
     * Estimate memory usage of loaded textures
     */
    estimateMemoryUsage() {
        let totalBytes = 0;
        
        // Count cached textures
        this.textureCache.forEach((texture) => {
            if (texture.image) {
                const img = texture.image;
                // Rough estimate: width * height * 4 bytes (RGBA)
                totalBytes += img.width * img.height * 4;
            }
        });
        
        return {
            bytes: totalBytes,
            mb: Math.round(totalBytes / (1024 * 1024) * 100) / 100,
            cachedTextures: this.textureCache.size
        };
    }
    
    /**
     * Optimize memory usage by clearing unused textures
     */
    optimizeMemory() {
        // Get list of currently used texture URLs
        const usedUrls = new Set();
        this.layers.forEach(layer => {
            if (layer.material.map && layer.material.map.image) {
                const url = this.resolveLayerImageUrl(layer.userData.layerData.image);
                usedUrls.add(url);
            }
        });
        
        // Remove unused textures from cache
        let removedCount = 0;
        this.textureCache.forEach((texture, url) => {
            if (!usedUrls.has(url)) {
                texture.dispose();
                this.textureCache.delete(url);
                removedCount++;
            }
        });
        
        if (removedCount > 0) {
            console.log('Memory optimized: removed', removedCount, 'unused textures');
        }
        
        return removedCount;
    }
}

// Export for use in other modules
window.LayerManager = LayerManager;