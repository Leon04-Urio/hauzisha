# LOFT³ Tour System - Testing Guide

## 🎯 Current Status Overview

### ✅ COMPLETED & WORKING (Task 2)
**Core Viewer Engine with Performance Optimizations**

The following features are fully implemented and ready to test:

1. **Marzipano Panorama Rendering** ✅
2. **Three.js Parallax Layer System** ✅
3. **Camera Synchronization** ✅
4. **Rotation Limits (±30° horizontal, ±10° vertical)** ✅
5. **Scene Loading & Node Switching** ✅
6. **Mobile Touch Controls** ✅
7. **Gyroscope Support** ✅
8. **Performance Optimizations (60fps)** ✅

### ⏳ NOT YET IMPLEMENTED (Future Tasks)
1. ❌ Smooth Walking Transitions (Task 4)
2. ❌ Automated Tour Generation from JSON/CSV (Task 3)
3. ❌ Visual Layer Editor (Task 5)
4. ❌ Upload Interface (Task 3)
5. ❌ Premium UI/UX (Task 7)
6. ❌ Analytics (Task 8)

---

## 🧪 How to Test What's Working

### Test 1: Basic Panorama Viewing ✅
**File:** `test-scene-loading.html`

**What it tests:**
- Marzipano panorama rendering
- Basic camera controls (mouse drag)
- Scene initialization

**How to test:**
1. Open `loft-tour/test-scene-loading.html` in browser
2. You should see a panorama load
3. Click and drag to look around
4. Verify smooth rotation

**Expected behavior:**
- Panorama loads within 2-3 seconds
- Mouse drag rotates the view smoothly
- No console errors

---

### Test 2: Rotation Limits ✅
**File:** `test-rotation-limits.html`

**What it tests:**
- ±30° horizontal rotation limit
- ±10° vertical rotation limit
- Visual limit indicators

**How to test:**
1. Open `loft-tour/test-rotation-limits.html`
2. Try to rotate left/right - should stop at ±30°
3. Try to look up/down - should stop at ±10°
4. Red lines show the limits

**Expected behavior:**
- Can't rotate beyond the red limit lines
- Smooth resistance at limits
- Limits are clearly visible

---

### Test 3: Camera Synchronization ✅
**File:** `test-camera-sync.html`

**What it tests:**
- Marzipano camera syncs with Three.js layers
- Parallax effect on layers
- Real-time coordinate display

**How to test:**
1. Open `loft-tour/test-camera-sync.html`
2. Drag to rotate the view
3. Watch the colored squares move (parallax effect)
4. Check the coordinate display updates

**Expected behavior:**
- Layers move relative to camera rotation
- Different layers move at different speeds (parallax)
- Coordinates update in real-time
- No lag between camera and layers

---

### Test 4: Mobile Controls ✅
**File:** `test-mobile-controls.html`

**What it tests:**
- Touch drag controls
- Pinch-to-zoom
- Gyroscope support (on mobile)

**How to test on mobile:**
1. Open `loft-tour/test-mobile-controls.html` on phone
2. Touch and drag to rotate
3. Pinch to zoom in/out
4. Tilt phone to use gyroscope (may need permission)

**Expected behavior:**
- Smooth touch rotation
- Pinch zoom works
- Gyroscope rotates view when tilting phone
- No lag or jitter

---

### Test 5: Performance Monitoring ✅
**File:** `test-performance.html`

**What it tests:**
- 60fps rendering
- Adaptive quality system
- Memory management
- Texture caching

**How to test:**
1. Open `loft-tour/test-performance.html`
2. Check FPS counter (should be 55-60)
3. Click "Stress Test" to add 15 layers
4. Watch FPS and memory usage
5. Try "Toggle Quality" button

**Expected behavior:**
- FPS stays at 55-60 on decent hardware
- Quality adjusts automatically if FPS drops
- Memory usage tracked in real-time
- Stress test may reduce FPS but should recover

---

## 🔍 Automated Verification Tests

Each feature has an automated test script you can run in the browser console:

### Run All Tests
```javascript
// Open any test page, then in console:
window.runPerformanceTests()      // Performance tests
window.runCameraSyncTests()       // Camera sync tests
window.runRotationLimitTests()    // Rotation limit tests
window.runMobileControlsTests()   // Mobile control tests
window.runSceneLoadingTests()     // Scene loading tests
```

---

## 📊 What Each Test File Does

| File | Purpose | What Works |
|------|---------|------------|
| `test-scene-loading.html` | Basic panorama viewing | ✅ Loads panorama, mouse controls |
| `test-rotation-limits.html` | View limit testing | ✅ ±30° H, ±10° V limits |
| `test-camera-sync.html` | Layer synchronization | ✅ Parallax layers sync with camera |
| `test-mobile-controls.html` | Touch & gyro controls | ✅ Touch, pinch, gyroscope |
| `test-performance.html` | Performance monitoring | ✅ FPS, quality, memory tracking |
| `demo-overlay-system.html` | Three.js overlay demo | ✅ Basic overlay rendering |

---

## 🚫 What DOESN'T Work Yet

### Missing Features (Not Implemented)

1. **Smooth Transitions Between Nodes**
   - Currently: Instant scene switching
   - Planned: Matterport-style walking transitions with crossfade

2. **Automated Tour Generation**
   - Currently: Manual tour data creation
   - Planned: Upload JSON/CSV to auto-generate tours

3. **Upload Interface**
   - Currently: No upload UI
   - Planned: Drag & drop panoramas and metadata

4. **Visual Layer Editor**
   - Currently: Layers defined in code
   - Planned: Drag & drop layer positioning

5. **Premium UI**
   - Currently: Basic test interfaces
   - Planned: Auto-hiding UI, room labels, distance indicators

6. **Analytics**
   - Currently: No tracking
   - Planned: View counts, completion rates

---

## 🎮 Quick Test Workflow

### For Desktop Testing:
```
1. Open test-scene-loading.html
   → Verify panorama loads and mouse drag works

2. Open test-rotation-limits.html
   → Try to rotate beyond limits (should stop)

3. Open test-camera-sync.html
   → Drag and watch layers move (parallax)

4. Open test-performance.html
   → Check FPS is 55-60, run stress test
```

### For Mobile Testing:
```
1. Open test-mobile-controls.html on phone
   → Test touch drag, pinch zoom

2. Allow gyroscope permission
   → Tilt phone to rotate view

3. Open test-performance.html
   → Check FPS on mobile device
```

---

## 🐛 Common Issues & Solutions

### Issue: Panorama doesn't load
**Cause:** Missing image files  
**Solution:** Test files use placeholder paths. Check console for 404 errors.

### Issue: FPS is low (<30)
**Cause:** Device is low-end or too many layers  
**Solution:** System should auto-reduce quality. Check quality level in performance test.

### Issue: Gyroscope doesn't work
**Cause:** Permission not granted (iOS 13+)  
**Solution:** Click "Enable Gyroscope" button in mobile test page.

### Issue: Layers don't move
**Cause:** Camera sync not working  
**Solution:** Check console for errors. Verify Marzipano and Three.js loaded.

### Issue: Can rotate beyond limits
**Cause:** Limits not applied correctly  
**Solution:** Check rotation-limits test page, verify limiter is set.

---

## 📝 Testing Checklist

Use this checklist to verify everything works:

### Desktop Tests
- [ ] Panorama loads in test-scene-loading.html
- [ ] Mouse drag rotates view smoothly
- [ ] Rotation stops at ±30° horizontal
- [ ] Rotation stops at ±10° vertical
- [ ] Layers move with parallax effect
- [ ] FPS is 55-60 in performance test
- [ ] Stress test (15 layers) runs
- [ ] Quality adjusts automatically

### Mobile Tests
- [ ] Touch drag works on mobile
- [ ] Pinch zoom works
- [ ] Gyroscope permission requested
- [ ] Gyroscope rotates view
- [ ] FPS is acceptable on mobile
- [ ] Touch controls are responsive

### Automated Tests
- [ ] Scene loading tests pass (5/5)
- [ ] Rotation limit tests pass (5/5)
- [ ] Camera sync tests pass (5/5)
- [ ] Mobile control tests pass (5/5)
- [ ] Performance tests pass (10/10)

---

## 🎯 Next Steps

### To Test Current Features:
1. Start with `test-scene-loading.html` - basic functionality
2. Move to `test-rotation-limits.html` - verify limits work
3. Try `test-camera-sync.html` - see parallax in action
4. Test `test-performance.html` - check FPS and quality
5. On mobile: `test-mobile-controls.html` - touch & gyro

### When Ready for More:
- Task 3: Automated tour generation (upload system)
- Task 4: Smooth transitions (walking effect)
- Task 5: Visual layer editor (drag & drop)
- Task 7: Premium UI (auto-hiding, labels)

---

## 💡 Pro Tips

1. **Open Browser Console** - All test pages log useful info
2. **Check FPS Counter** - Should be visible in performance test
3. **Try Stress Test** - Adds 15 layers to test performance
4. **Export Reports** - Performance test can export JSON reports
5. **Test on Real Devices** - Mobile performance varies greatly

---

## 📞 Need Help?

If something doesn't work:
1. Check browser console for errors
2. Verify Three.js and Marzipano loaded (check Network tab)
3. Try different test pages to isolate issue
4. Check if it's a "not yet implemented" feature
5. Review the completion summaries for each feature

---

**Current Status:** Task 2 Complete (Core Engine + Performance)  
**Next Task:** Task 3 (Automated Tour Generation)  
**Overall Progress:** ~25% (2 of 8 tasks complete)
