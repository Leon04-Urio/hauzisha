# LOFT³ Scene Loading - Quick Start Guide

## 🚀 Quick Start

### 1. Initialize the Engine

```javascript
const container = document.getElementById('viewer-container');
const engine = new LoftTourEngine(container);
```

### 2. Prepare Tour Data

```javascript
const tourData = {
    tourName: "My Property Tour",
    nodes: [
        {
            id: "node1",
            label: "Entrance",
            image: "entrance.jpg",
            initialYaw: 0,
            initialPitch: 0,
            initialFov: 75,
            rotationLimits: { h: 30, v: 10, maxFov: 120, minFov: 60 },
            layers: []
        },
        {
            id: "node2",
            label: "Living Room",
            image: "living.jpg",
            rotationLimits: { h: 45, v: 15 },
            layers: []
        }
    ]
};
```

### 3. Load the Tour

```javascript
await engine.loadTour(tourData);
```

### 4. Navigate Between Nodes

```javascript
// Go to next node
await engine.nextNode();

// Go to previous node
await engine.previousNode();

// Jump to specific node
await engine.transitionTo(tourData.nodes[2], 2);
```

---

## 📋 Node Data Structure

### Required Fields

```javascript
{
    id: "unique-id",           // Unique identifier
    label: "Node Name",        // Display name
    image: "panorama.jpg"      // Image filename or URL
}
```

### Optional Fields

```javascript
{
    initialYaw: 0,             // Initial horizontal rotation (radians)
    initialPitch: 0,           // Initial vertical rotation (radians)
    initialFov: 75,            // Initial field of view (degrees)
    
    rotationLimits: {
        h: 30,                 // Horizontal limit (±degrees)
        v: 10,                 // Vertical limit (±degrees)
        maxFov: 120,           // Maximum FOV (degrees)
        minFov: 60             // Minimum FOV (degrees)
    },
    
    layers: []                 // Array of parallax layers
}
```

---

## 🎮 Navigation API

### Check Current State

```javascript
// Current node
console.log(engine.currentNode);

// Current index
console.log(engine.currentNodeIndex);

// Is transitioning?
console.log(engine.isTransitioning);

// Total nodes
console.log(engine.tourData.nodes.length);
```

### Navigation Methods

```javascript
// Next node (with boundary check)
await engine.nextNode();

// Previous node (with boundary check)
await engine.previousNode();

// Direct jump
const targetNode = engine.tourData.nodes[3];
await engine.transitionTo(targetNode, 3);
```

### Node Change Callback

```javascript
engine.onNodeChange = (node, index) => {
    console.log(`Switched to: ${node.label} (${index + 1})`);
    updateUI(node, index);
};
```

---

## 🧪 Testing

### Run Verification

```bash
node loft-tour/verify-scene-loading.js
```

### Open Test Page

```bash
# Option 1: Direct file access
open loft-tour/test-scene-loading.html

# Option 2: Local server
cd loft-tour
python3 -m http.server 8000
# Open http://localhost:8000/test-scene-loading.html
```

### Test Checklist

- [ ] Tour loads successfully
- [ ] First node displays correctly
- [ ] Next button navigates forward
- [ ] Previous button navigates backward
- [ ] Jump buttons work correctly
- [ ] Navigation buttons disable at boundaries
- [ ] Current node info updates
- [ ] FPS counter shows ~60fps
- [ ] No console errors

---

## 🔧 Troubleshooting

### Tour Won't Load

**Problem**: `loadTour()` fails

**Solutions**:
- Check that `tourData.nodes` exists and has at least one node
- Verify image URLs are correct
- Check browser console for errors
- Ensure Marzipano and Three.js are loaded

### Panorama Not Displaying

**Problem**: Black screen after loading

**Solutions**:
- Verify image format is equirectangular (2:1 aspect ratio)
- Check image URL is accessible
- Ensure container has width and height
- Check WebGL support in browser

### Navigation Not Working

**Problem**: Next/Previous buttons don't work

**Solutions**:
- Check `isTransitioning` flag (wait for transitions to complete)
- Verify node index is within bounds
- Check that tour is loaded (`tourData` exists)
- Look for JavaScript errors in console

### Camera Not Syncing

**Problem**: Layers don't move with camera

**Solutions**:
- Verify `setupCameraSync()` was called
- Check that `currentView` exists
- Ensure LayerManager is initialized
- Verify render loop is running

---

## 📊 Performance Tips

### Optimize Images

```javascript
// Use multiple resolutions
const geometry = new Marzipano.EquirectGeometry([
    { width: 4096 },  // High quality
    { width: 2048 },  // Medium quality
    { width: 1024 }   // Low quality
]);
```

### Preload Next Node

```javascript
// Preload in TransitionManager
await transitionManager.preloadPanorama(nextNode);
```

### Monitor Performance

```javascript
// Check FPS
console.log('FPS:', engine.fps);

// Get detailed stats
engine.logPerformanceStats();
```

---

## 🎯 Common Patterns

### Linear Walkthrough

```javascript
// Auto-advance through tour
async function autoPlay() {
    for (let i = 0; i < tourData.nodes.length; i++) {
        await engine.transitionTo(tourData.nodes[i], i);
        await delay(3000); // Wait 3 seconds
    }
}
```

### Keyboard Navigation

```javascript
document.addEventListener('keydown', (event) => {
    if (event.code === 'ArrowRight') {
        engine.nextNode();
    } else if (event.code === 'ArrowLeft') {
        engine.previousNode();
    }
});
```

### Progress Indicator

```javascript
function updateProgress() {
    const progress = (engine.currentNodeIndex + 1) / engine.tourData.nodes.length;
    progressBar.style.width = `${progress * 100}%`;
}

engine.onNodeChange = updateProgress;
```

---

## 📚 Next Steps

After mastering scene loading, explore:

1. **Mobile Controls** - Touch and gyroscope support
2. **Transitions** - Smooth walking effects
3. **Layers** - Parallax overlays
4. **UI** - Custom viewer interface
5. **Analytics** - Track user behavior

---

## 💡 Tips

- Always `await` navigation methods
- Check `isTransitioning` before navigation
- Use `onNodeChange` callback for UI updates
- Monitor FPS for performance issues
- Test on mobile devices early
- Preload images for smooth transitions

---

## 🔗 Resources

- [Full Implementation Guide](SCENE-LOADING-IMPLEMENTATION.md)
- [Marzipano Documentation](https://www.marzipano.net/docs.html)
- [Three.js Documentation](https://threejs.org/docs/)
- [Test Page](test-scene-loading.html)
- [Verification Script](verify-scene-loading.js)

---

**Status**: ✅ Fully Implemented and Tested

**Last Updated**: January 2026
