# Quick Start: Camera Synchronization

## Overview

The LOFT³ Tour Engine automatically synchronizes the Marzipano panorama camera with Three.js parallax layers. This guide shows you how to use it.

## Basic Usage

### 1. Initialize Engine

```javascript
const container = document.getElementById('tour-container');
const engine = new LoftTourEngine(container);
```

### 2. Load Tour with Layers

```javascript
await engine.loadTour({
    nodes: [{
        id: 'room-1',
        label: 'Living Room',
        image: 'panorama.jpg',
        initialYaw: 0,
        initialPitch: 0,
        rotationLimits: {
            h: 45,  // ±45° horizontal
            v: 15   // ±15° vertical
        },
        layers: [
            {
                image: 'furniture.png',
                position: { x: 0.5, y: 0.5 },  // Center
                scale: 1.0,
                parallaxFactor: 0.5,  // Medium depth
                opacity: 1.0
            }
        ]
    }]
});
```

### 3. That's It!

Camera synchronization happens automatically. Users can:
- Drag to rotate the view
- Layers move with parallax effect
- Everything stays in sync at 60fps

## Parallax Factors

Choose the right parallax factor for your layers:

| Factor | Effect | Use Case |
|--------|--------|----------|
| 0.0 | Static | Background elements, sky |
| 0.2 | Very slow | Distant objects, mountains |
| 0.5 | Medium | Furniture, decorations |
| 0.8 | Fast | Close objects, foreground |
| 1.0 | Full motion | Very close elements |

## Advanced Features

### Manual Synchronization

```javascript
// Force immediate sync
engine.layerManager.forceSyncWithCamera();
```

### Check Sync Status

```javascript
// Get last synchronized coordinates
const coords = engine.layerManager.getLastCoordinates();
console.log('Yaw:', coords.yaw);
console.log('Pitch:', coords.pitch);
console.log('FOV:', coords.fov);
```

### Monitor Performance

```javascript
// Check FPS
console.log('FPS:', engine.fps);

// Get layer stats
const stats = engine.layerManager.getStats();
console.log('Layers:', stats.layerCount);
console.log('Memory:', stats.memoryUsage.mb, 'MB');
```

## Layer Options

### Scale with FOV

Layers scale when zooming:

```javascript
{
    image: 'object.png',
    parallaxFactor: 0.5,
    scaleWithFov: true  // Enable FOV scaling
}
```

### Fade with Distance

Layers fade as they move from center:

```javascript
{
    image: 'object.png',
    parallaxFactor: 0.8,
    fadeWithDistance: true  // Enable distance fading
}
```

### Rotate with Camera

Layers rotate slightly with camera movement:

```javascript
{
    image: 'object.png',
    parallaxFactor: 0.6,
    rotateWithCamera: true  // Enable rotation
}
```

## Testing

### Interactive Test

Open the test page in your browser:

```
loft-tour/test-camera-sync.html
```

### Programmatic Verification

```javascript
// Load verification script
<script src="verify-camera-sync.js"></script>

// Run tests
const verifier = new CameraSyncVerifier(engine);
await verifier.runAll();
```

## Common Issues

### Layers not moving?

Check that:
1. `parallaxFactor > 0`
2. Layers are visible
3. Camera sync is enabled

```javascript
// Debug
console.log('Layers:', engine.layerManager.layers.length);
console.log('Visible:', engine.layerManager.layers.filter(l => l.visible).length);
```

### Jerky movement?

Reduce layer count or optimize textures:

```javascript
// Check performance
const stats = engine.layerManager.getStats();
if (stats.layerCount > 10) {
    console.warn('Too many layers, consider reducing');
}
```

### Out of sync?

Force a manual sync:

```javascript
engine.layerManager.forceSyncWithCamera();
```

## Performance Tips

1. **Limit layers** - Keep under 10 for best performance
2. **Optimize textures** - Use compressed images < 500KB
3. **Use appropriate parallax** - Higher factors = more GPU work
4. **Test on mobile** - Verify 60fps on target devices

## API Quick Reference

### Engine Methods

```javascript
engine.setupCameraSync()           // Setup sync for current view
engine.syncCameraToLayers()        // Manually sync camera
engine.updateThreeJSCameraFOV(fov) // Update Three.js FOV
```

### Layer Manager Methods

```javascript
layerManager.updateParallax(coords)    // Update all layers
layerManager.getLastCoordinates()      // Get last sync coords
layerManager.forceSyncWithCamera()     // Force immediate sync
```

### Controls Manager Methods

```javascript
controlsManager.rotateView(yaw, pitch) // Rotate (triggers sync)
controlsManager.resetView()            // Reset to center
```

## Examples

### Example 1: Simple Room with Furniture

```javascript
{
    id: 'living-room',
    image: 'room.jpg',
    layers: [
        {
            image: 'sofa.png',
            position: { x: 0.3, y: 0.6 },
            parallaxFactor: 0.5
        },
        {
            image: 'lamp.png',
            position: { x: 0.7, y: 0.4 },
            parallaxFactor: 0.7
        }
    ]
}
```

### Example 2: Outdoor Scene with Depth

```javascript
{
    id: 'garden',
    image: 'garden.jpg',
    layers: [
        {
            image: 'mountains.png',
            position: { x: 0.5, y: 0.3 },
            parallaxFactor: 0.1,  // Far background
            scaleWithFov: true
        },
        {
            image: 'tree.png',
            position: { x: 0.4, y: 0.5 },
            parallaxFactor: 0.6,  // Midground
            fadeWithDistance: true
        },
        {
            image: 'flower.png',
            position: { x: 0.6, y: 0.7 },
            parallaxFactor: 0.9,  // Foreground
            rotateWithCamera: true
        }
    ]
}
```

## Next Steps

- Read the full documentation: `CAMERA-SYNC.md`
- Try the interactive demo: `demo-overlay-system.html`
- Run the test suite: `test-camera-sync.html`
- Check implementation notes: `IMPLEMENTATION-NOTES.md`

## Support

For issues or questions:
1. Check the full documentation
2. Run the verification script
3. Review the test examples
4. Check browser console for errors

---

**Camera synchronization is automatic and requires no additional configuration!**
