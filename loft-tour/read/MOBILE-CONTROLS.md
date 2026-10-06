# Mobile Touch & Gyroscope Controls - Implementation Guide

## Overview

The LOFT³ Tour system now includes comprehensive mobile support with:
- ✋ **Touch Controls**: Single-finger drag to rotate, pinch-to-zoom
- 📱 **Gyroscope**: Motion-based camera control
- 🎯 **Optimized Performance**: 60fps on mid-range devices
- 🔒 **iOS 13+ Permission Handling**: Proper permission flow for gyroscope

---

## Features Implemented

### 1. Touch Controls

#### Single-Finger Drag
- Drag anywhere on the screen to rotate the camera
- Smooth, responsive movement with configurable sensitivity
- Respects rotation limits (±30° horizontal, ±10° vertical)

#### Pinch-to-Zoom
- Use two fingers to pinch in/out
- Adjusts field of view (FOV) between 60° and 120°
- Smooth zoom with proper clamping

#### Touch State Tracking
```javascript
touchState: {
    touches: [],           // Current touch points
    initialDistance: 0,    // Starting distance for pinch
    initialFov: 0         // Starting FOV for zoom
}
```

### 2. Gyroscope Controls

#### Motion Tracking
- Tilt device to rotate camera view
- Smooth, natural movement with drift compensation
- Configurable sensitivity (default: 0.8)

#### Permission Handling
- **iOS 13+**: Requires explicit user permission
- **Android**: Works automatically
- **Older iOS**: Works automatically

#### Calibration
- Automatic baseline on first reading
- Manual calibration available via `calibrateGyroscope()`
- Drift compensation with exponential moving average

### 3. Device Detection

```javascript
// Automatic detection
isMobile: boolean        // Is this a mobile device?
hasGyroscope: boolean    // Does device have gyroscope?
gyroPermission: string   // 'granted', 'denied', 'prompt'
```

---

## API Reference

### ControlsManager Class

#### Constructor
```javascript
const controls = new ControlsManager(tourEngine);
```

#### Properties
```javascript
controls.isMobile          // boolean - Is mobile device
controls.hasGyroscope      // boolean - Has gyroscope
controls.gyroPermission    // string - Permission status
controls.isEnabled         // boolean - Controls enabled
controls.settings          // object - Control settings
```

#### Methods

##### Touch Controls
```javascript
// Setup touch event listeners
controls.setupTouchControls()

// Calculate distance between two touch points
controls.getTouchDistance(touch1, touch2)

// Handle pinch zoom gesture
controls.handlePinchZoom(distanceRatio)
```

##### Gyroscope Controls
```javascript
// Setup gyroscope (async for iOS 13+)
await controls.setupGyroscopeControls()

// Request permission (iOS 13+)
const granted = await controls.requestGyroscopePermission()

// Enable gyroscope listener
controls.enableGyroscopeListener()

// Handle gyroscope movement
controls.handleGyroscopeMove(event)

// Calibrate (reset baseline)
controls.calibrateGyroscope()

// Check if active
const active = controls.isGyroscopeActive()
```

##### General Controls
```javascript
// Enable/disable controls
controls.setEnabled(true/false)

// Update settings
controls.updateSettings({
    touchSensitivity: 1.5,
    gyroSensitivity: 0.8
})

// Get statistics
const stats = controls.getStats()

// Reset view to center
controls.resetView()
```

---

## Settings Configuration

### Default Settings
```javascript
settings: {
    mouseSensitivity: 1.0,
    touchSensitivity: 1.0,
    gyroSensitivity: 0.8,
    enableGyroscope: true,
    enableTouch: true,
    enableMouse: true,
    enableKeyboard: false
}
```

### Adjusting Sensitivity
```javascript
// Make touch more sensitive
engine.controlsManager.updateSettings({
    touchSensitivity: 1.5
});

// Make gyroscope less sensitive
engine.controlsManager.updateSettings({
    gyroSensitivity: 0.5
});
```

---

## Usage Examples

### Basic Setup
```javascript
// Initialize engine
const engine = new LoftTourEngine(container);

// Controls are automatically set up
// Access via engine.controlsManager
```

### Request Gyroscope Permission (iOS 13+)
```javascript
// Show a button to request permission
document.getElementById('enable-gyro-btn').addEventListener('click', async () => {
    const granted = await engine.controlsManager.requestGyroscopePermission();
    
    if (granted) {
        console.log('Gyroscope enabled!');
    } else {
        console.log('Permission denied');
    }
});
```

### Disable Gyroscope
```javascript
// Disable gyroscope but keep touch
engine.controlsManager.updateSettings({
    enableGyroscope: false
});
```

### Calibrate Gyroscope
```javascript
// Add a calibration button
document.getElementById('calibrate-btn').addEventListener('click', () => {
    engine.controlsManager.calibrateGyroscope();
    console.log('Gyroscope calibrated');
});
```

### Monitor Control Status
```javascript
setInterval(() => {
    const stats = engine.controlsManager.getStats();
    
    console.log('Controls Status:', {
        enabled: stats.enabled,
        mobile: stats.mobile,
        gyroscope: stats.gyroscope,
        permission: stats.gyroPermission
    });
}, 1000);
```

---

## Testing

### Desktop Testing
```bash
# Open in browser
open loft-tour/test-mobile-controls.html
```

### Mobile Testing

#### Option 1: Local Network
1. Start a local server:
   ```bash
   python3 -m http.server 8000
   ```
2. Find your local IP: `ifconfig` or `ipconfig`
3. Open on mobile: `http://YOUR_IP:8000/loft-tour/test-mobile-controls.html`

#### Option 2: Deploy to Server
1. Upload to your web server
2. Access via HTTPS (required for gyroscope on iOS)
3. Test on actual devices

### Verification Script
```bash
# Run verification in browser console
# Open: loft-tour/test-mobile-controls.html
# Then run:
node loft-tour/verify-mobile-controls.js
```

---

## Browser Compatibility

### Touch Support
- ✅ iOS Safari 10+
- ✅ Chrome Mobile 60+
- ✅ Firefox Mobile 60+
- ✅ Samsung Internet 8+

### Gyroscope Support
- ✅ iOS Safari 13+ (with permission)
- ✅ Chrome Mobile 60+
- ✅ Firefox Mobile 60+
- ⚠️ iOS Safari 12 and below (no permission required)

---

## Performance Optimization

### Touch Performance
- Uses `passive: false` for preventDefault
- Throttled updates at 60fps
- Minimal DOM manipulation

### Gyroscope Performance
- Smoothing factor: 0.3 (configurable)
- Drift compensation: 0.02
- Exponential moving average for stability

### Memory Management
- Event listeners properly cleaned up
- No memory leaks from touch/gyro events
- Efficient state tracking

---

## Troubleshooting

### Gyroscope Not Working on iOS

**Problem**: Gyroscope doesn't activate on iOS 13+

**Solution**: 
1. Must request permission via user interaction
2. Must be served over HTTPS
3. Use the `requestGyroscopePermission()` method

```javascript
// Add button for user to click
<button onclick="enableGyro()">Enable Gyroscope</button>

async function enableGyro() {
    await engine.controlsManager.requestGyroscopePermission();
}
```

### Touch Lag or Stuttering

**Problem**: Touch controls feel laggy

**Solution**:
1. Reduce touch sensitivity
2. Check for other heavy JavaScript
3. Ensure 60fps rendering

```javascript
engine.controlsManager.updateSettings({
    touchSensitivity: 0.8  // Reduce from 1.0
});
```

### Pinch Zoom Not Working

**Problem**: Two-finger pinch doesn't zoom

**Solution**:
1. Ensure `enableTouch` is true
2. Check viewport meta tag
3. Verify FOV limits are set

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

### Gyroscope Drift

**Problem**: View slowly drifts over time

**Solution**:
1. Calibrate gyroscope periodically
2. Adjust drift compensation
3. Use manual reset button

```javascript
// Add calibration button
setInterval(() => {
    engine.controlsManager.calibrateGyroscope();
}, 30000); // Every 30 seconds
```

---

## Best Practices

### 1. Always Request Permission Properly
```javascript
// ❌ Bad: Auto-request on page load
window.addEventListener('load', async () => {
    await controls.requestGyroscopePermission();
});

// ✅ Good: Request on user interaction
button.addEventListener('click', async () => {
    await controls.requestGyroscopePermission();
});
```

### 2. Provide Visual Feedback
```javascript
// Show gyroscope status
if (controls.isGyroscopeActive()) {
    showGyroIndicator();
} else {
    hideGyroIndicator();
}
```

### 3. Handle Permission Denial Gracefully
```javascript
const granted = await controls.requestGyroscopePermission();

if (!granted) {
    // Fall back to touch-only controls
    showMessage('Gyroscope not available - use touch to navigate');
}
```

### 4. Test on Real Devices
- Emulators don't accurately simulate gyroscope
- Test on both iOS and Android
- Test on different screen sizes

---

## Future Enhancements

### Planned Features
- [ ] Gesture recognition (swipe to navigate)
- [ ] Haptic feedback on touch
- [ ] Adaptive sensitivity based on device
- [ ] Multi-finger gestures (3+ fingers)
- [ ] Orientation lock handling

### Experimental Features
- [ ] WebXR integration for VR headsets
- [ ] Gamepad API support
- [ ] Voice control integration

---

## Related Files

- `js/loft-tour-controls.js` - Main controls implementation
- `test-mobile-controls.html` - Mobile testing interface
- `verify-mobile-controls.js` - Verification script
- `js/loft-tour-core.js` - Core engine integration

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the test file: `test-mobile-controls.html`
3. Run verification: `verify-mobile-controls.js`
4. Check browser console for errors

---

**Last Updated**: January 2026
**Version**: 1.0.0
**Status**: ✅ Production Ready
