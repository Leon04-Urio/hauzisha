# Camera Synchronization System

## Overview

The LOFT³ Tour Engine implements a sophisticated camera synchronization system that keeps the Marzipano panorama viewer and Three.js parallax layers perfectly in sync. This document explains how the synchronization works and how to use it.

## Architecture

### Components

1. **Marzipano Viewer** - Handles panorama rendering and camera controls
2. **Three.js Overlay** - Renders parallax layers on top of panoramas
3. **Synchronization Bridge** - Keeps both systems aligned

### Data Flow

```
User Input (Mouse/Touch/Gyro)
    ↓
ControlsManager
    ↓
Marzipano View Update
    ↓
View Change Event
    ↓
syncCameraToLayers()
    ↓
LayerManager.updateParallax()
    ↓
Three.js Layer Positions Updated
```

## Implementation Details

### 1. Event-Driven Synchronization

The system uses Marzipano's view change events to trigger synchronization:

```javascript
// Setup camera synchronization for a view
setupCameraSync() {
    if (!this.currentView) return;
    
    // Listen for view changes from Marzipano
    this.currentView.addEventListener('change', () => {
        this.syncCameraToLayers();
    });
}
```

### 2. Render Loop Synchronization

In addition to event-driven updates, the render loop continuously syncs at 60fps:

```javascript
startRenderLoop() {
    const animate = (timestamp) => {
        requestAnimationFrame(animate);
        
        // Sync every frame
        if (this.currentView && this.layerManager) {
            const coords = this.currentView.coordinates();
            if (coords) {
                this.layerManager.updateParallax(coords);
            }
        }
        
        // Render Three.js layers
        this.layerRenderer.render(this.layerScene, this.layerCamera);
    };
    
    animate(0);
}
```

### 3. Coordinate Transformation

Marzipano coordinates are transformed to Three.js layer positions:

```javascript
updateLayerParallax(layer, yaw, pitch, fov) {
    const factor = layer.userData.parallaxFactor;
    const base = layer.userData.basePosition;
    
    // Calculate parallax offset
    // factor = 0: static background
    // factor = 1: full foreground movement
    const parallaxX = yaw * factor * 0.5;
    const parallaxY = pitch * factor * 0.5;
    
    // Apply offset
    layer.position.x = base.x + parallaxX;
    layer.position.y = base.y + parallaxY;
}
```

### 4. FOV Synchronization

The Three.js camera frustum adjusts to match Marzipano's field of view:

```javascript
updateThreeJSCameraFOV(marzipanoFov) {
    const fovDegrees = this.rad2deg(marzipanoFov);
    const fovFactor = fovDegrees / 75; // Normalize to default
    
    const aspect = this.container.clientWidth / this.container.clientHeight;
    const frustumSize = fovFactor;
    
    this.layerCamera.left = -frustumSize * aspect;
    this.layerCamera.right = frustumSize * aspect;
    this.layerCamera.top = frustumSize;
    this.layerCamera.bottom = -frustumSize;
    
    this.layerCamera.updateProjectionMatrix();
}
```

## Parallax Factors

Layers use a `parallaxFactor` to control their movement relative to the camera:

- **0.0** - Static (background elements, distant objects)
- **0.2-0.3** - Slow movement (far background)
- **0.5** - Medium movement (midground)
- **0.7-0.8** - Fast movement (foreground)
- **1.0** - Full movement (very close objects)

## Performance Optimization

### Throttling

The render loop includes optional throttling to maintain 60fps:

```javascript
let lastSyncTime = 0;
const syncInterval = 16; // ~60fps

if (timestamp - lastSyncTime >= syncInterval) {
    // Sync camera
    lastSyncTime = timestamp;
}
```

### Visibility Culling

Only visible layers are updated:

```javascript
this.layers.forEach(layer => {
    if (layer.visible) {
        this.updateLayerParallax(layer, yaw, pitch, fov);
    }
});
```

## Advanced Features

### 1. Scale with FOV

Layers can scale based on field of view for enhanced depth perception:

```javascript
{
    scaleWithFov: true,
    parallaxFactor: 0.5
}
```

### 2. Fade with Distance

Layers can fade as they move away from center:

```javascript
{
    fadeWithDistance: true,
    parallaxFactor: 0.8
}
```

### 3. Rotate with Camera

Layers can rotate slightly based on camera movement:

```javascript
{
    rotateWithCamera: true,
    parallaxFactor: 0.6
}
```

## Testing

### Manual Testing

Use the test file to verify synchronization:

```bash
# Open in browser
loft-tour/test-camera-sync.html
```

### Automated Testing

Check synchronization programmatically:

```javascript
// Get last synchronized coordinates
const coords = engine.layerManager.getLastCoordinates();
console.log('Last sync:', coords);

// Force immediate sync
engine.layerManager.forceSyncWithCamera();
```

## Debugging

### Enable Debug Logging

```javascript
// In loft-tour-core.js
this.debugSync = true;

syncCameraToLayers() {
    const coords = this.currentView.coordinates();
    
    if (this.debugSync) {
        console.log('Camera sync:', {
            yaw: coords.yaw,
            pitch: coords.pitch,
            fov: this.rad2deg(coords.fov)
        });
    }
    
    this.layerManager.updateParallax(coords);
}
```

### Monitor Sync Rate

```javascript
// Check FPS and sync performance
console.log('Performance:', {
    fps: engine.fps,
    layerCount: engine.layerManager.layers.length,
    lastCoords: engine.layerManager.getLastCoordinates()
});
```

## Common Issues

### Issue: Layers not moving

**Solution:** Check that:
1. Layers have `parallaxFactor > 0`
2. Camera synchronization is enabled
3. View change events are firing

### Issue: Jerky movement

**Solution:**
1. Reduce layer count
2. Optimize texture sizes
3. Check for performance bottlenecks

### Issue: Layers out of sync

**Solution:**
1. Call `forceSyncWithCamera()`
2. Check coordinate transformation
3. Verify event listeners are attached

## Best Practices

1. **Use appropriate parallax factors** - Match layer depth to parallax factor
2. **Optimize textures** - Keep layer images small (< 500KB)
3. **Limit layer count** - Stay under 20 layers per scene
4. **Test on mobile** - Verify performance on target devices
5. **Monitor FPS** - Maintain 60fps for smooth experience

## API Reference

### LoftTourEngine

```javascript
// Setup camera sync for current view
engine.setupCameraSync()

// Manually sync camera to layers
engine.syncCameraToLayers()

// Update Three.js camera FOV
engine.updateThreeJSCameraFOV(fov)
```

### LayerManager

```javascript
// Update parallax based on coordinates
layerManager.updateParallax(coords)

// Get last synchronized coordinates
layerManager.getLastCoordinates()

// Force immediate sync
layerManager.forceSyncWithCamera()
```

### ControlsManager

```javascript
// Rotate view (triggers sync)
controlsManager.rotateView(yawDelta, pitchDelta)

// Reset view to center
controlsManager.resetView()
```

## Future Enhancements

1. **Predictive synchronization** - Anticipate camera movement
2. **Interpolation** - Smooth out coordinate updates
3. **Adaptive throttling** - Adjust sync rate based on performance
4. **Multi-view support** - Sync multiple views simultaneously

## Conclusion

The camera synchronization system provides seamless integration between Marzipano's panorama rendering and Three.js parallax layers. By combining event-driven updates with continuous render loop synchronization, the system maintains perfect alignment while delivering smooth 60fps performance.
