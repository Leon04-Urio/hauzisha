# LOFT³ Troubleshooting Guide

## Common Issues & Solutions

### Issue: "Marzipano library not loaded"

**Symptoms:**
- Error in console: "Failed to initialize engine: Marzipano library not loaded"
- Panorama doesn't load
- Black screen

**Solution:**
✅ **FIXED** - Marzipano is now loaded locally from `lib/marzipano.min.js`

All test files have been updated to use the local version instead of CDN.

**If you still see this error:**
1. Check that `loft-tour/lib/marzipano.min.js` exists
2. Verify file size: `ls -lh loft-tour/lib/marzipano.min.js` (should be ~212KB)
3. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
4. Check browser console for 404 errors

---

### Issue: Three.js not loading

**Symptoms:**
- Error: "THREE is not defined"
- Layers don't appear

**Solution:**
Three.js is loaded from CDN. If offline:
1. Download Three.js r128: https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js
2. Save to `loft-tour/lib/three.min.js`
3. Update HTML files to use local version

---

### Issue: Images don't load (404 errors)

**Symptoms:**
- Console shows 404 errors for image files
- Panorama is black or shows error texture

**Solution:**
Test files use placeholder images from picsum.photos. This requires internet connection.

**For offline testing:**
1. Use your own panorama images
2. Place them in `uploads/loft-tours/`
3. Update test file image URLs to point to your images

---

### Issue: Low FPS (<30)

**Symptoms:**
- Choppy rotation
- Laggy controls
- FPS counter shows <30

**Solutions:**
1. **Check quality level:** Open performance test, verify quality isn't stuck on "high"
2. **Reduce layers:** Stress test adds 15 layers - click "Optimize Memory" to clean up
3. **Check device:** Low-end devices may not reach 60fps
4. **Close other tabs:** Free up GPU resources
5. **Update graphics drivers:** Ensure WebGL is working properly

---

### Issue: Rotation limits don't work

**Symptoms:**
- Can rotate 360° instead of stopping at ±30°
- No red limit lines visible

**Solution:**
1. Open `test-rotation-limits.html` specifically
2. Check console for errors
3. Verify Marzipano loaded correctly
4. Try refreshing the page

---

### Issue: Touch controls don't work on mobile

**Symptoms:**
- Can't drag to rotate on phone/tablet
- Pinch zoom doesn't work

**Solutions:**
1. **Ensure you're on mobile test page:** `test-mobile-controls.html`
2. **Check touch events:** Some browsers block touch events in iframes
3. **Try different browser:** Test in Chrome, Safari, Firefox
4. **Clear cache:** Mobile browsers cache aggressively

---

### Issue: Gyroscope doesn't work

**Symptoms:**
- Tilting phone doesn't rotate view
- No permission prompt appears

**Solutions:**
1. **iOS 13+:** Must click "Enable Gyroscope" button for permission
2. **Check browser support:** Not all browsers support gyroscope
3. **HTTPS required:** Gyroscope requires secure context (https:// or localhost)
4. **Try Safari on iOS:** Best gyroscope support
5. **Check device:** Some devices don't have gyroscope hardware

---

### Issue: Parallax layers don't move

**Symptoms:**
- Colored squares/layers are static
- No parallax effect when rotating

**Solutions:**
1. **Check camera sync:** Open `test-camera-sync.html`
2. **Verify Three.js loaded:** Check console for THREE errors
3. **Check layer manager:** Ensure `loft-tour-layers.js` loaded
4. **Look for errors:** Open browser console (F12)

---

### Issue: Performance test shows errors

**Symptoms:**
- Can't run automated tests
- `window.runPerformanceTests()` is undefined

**Solution:**
1. **Load verification script:** Ensure `verify-performance.js` is loaded
2. **Check test page:** Some test pages don't include verification scripts
3. **Try different test page:** Use `test-performance.html`

---

### Issue: Blank/black screen

**Symptoms:**
- Nothing appears
- No errors in console

**Solutions:**
1. **Check container size:** Viewer needs width/height
2. **Verify WebGL support:** Visit https://get.webgl.org/
3. **Check GPU:** Some devices have WebGL disabled
4. **Try different browser:** Test in Chrome/Firefox
5. **Check console:** Look for hidden errors

---

### Issue: Memory usage keeps growing

**Symptoms:**
- Browser becomes slow over time
- Memory usage in performance test keeps increasing

**Solutions:**
1. **Run memory optimization:** Click "Optimize Memory" in performance test
2. **Clear texture cache:** `engine.layerManager.clearTextureCache()`
3. **Reload page:** Fresh start clears all memory
4. **Reduce layer count:** Don't add too many layers

---

### Issue: Can't find test files

**Symptoms:**
- 404 error when opening test pages
- Files not found

**Solution:**
All test files are in the `loft-tour/` directory:
```
loft-tour/
├── test-scene-loading.html
├── test-rotation-limits.html
├── test-camera-sync.html
├── test-mobile-controls.html
├── test-performance.html
└── lib/
    └── marzipano.min.js
```

Access via: `http://localhost/loft-studio/loft-tour/test-scene-loading.html`

---

## Browser Compatibility

### Supported Browsers
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Known Issues
- **Safari < 14:** WebGL issues
- **IE 11:** Not supported (no WebGL 2.0)
- **Old Android:** May have performance issues

---

## Quick Diagnostics

### Check WebGL Support
```javascript
// In browser console:
const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl');
console.log('WebGL supported:', !!gl);
```

### Check Marzipano Loaded
```javascript
// In browser console:
console.log('Marzipano loaded:', typeof Marzipano !== 'undefined');
```

### Check Three.js Loaded
```javascript
// In browser console:
console.log('Three.js loaded:', typeof THREE !== 'undefined');
```

### Check Engine Status
```javascript
// After loading a test page:
console.log('Engine:', engine);
console.log('FPS:', engine.fps);
console.log('Quality:', engine.qualityLevel);
```

---

## Getting Help

If you're still stuck:

1. **Check browser console** (F12) for errors
2. **Try different test page** to isolate the issue
3. **Test on different device/browser**
4. **Review documentation:**
   - `START-HERE.md` - Quick start guide
   - `TESTING-GUIDE.md` - Complete testing instructions
   - `STATUS-DASHBOARD.md` - What's working vs. not

5. **Common error patterns:**
   - 404 errors → File paths wrong
   - "undefined" errors → Library not loaded
   - Black screen → WebGL or image loading issue
   - Low FPS → Performance/device issue

---

## System Requirements

### Minimum
- Modern browser with WebGL support
- 2GB RAM
- Dual-core CPU
- Internet connection (for CDN libraries)

### Recommended
- Chrome 90+ or Firefox 88+
- 4GB+ RAM
- Quad-core CPU
- Dedicated GPU
- Fast internet connection

---

**Last Updated:** January 16, 2026  
**Marzipano Issue:** ✅ FIXED (now using local file)
