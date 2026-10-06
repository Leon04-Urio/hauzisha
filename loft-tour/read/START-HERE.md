# 🚀 START HERE - Quick Testing Guide

## What's Working Right Now?

You have a **working 360° panorama viewer** with:
- ✅ Smooth mouse/touch controls
- ✅ Rotation limits (±30° horizontal, ±10° vertical)
- ✅ Parallax layers that move with camera
- ✅ Mobile support (touch, pinch, gyroscope)
- ✅ 60fps performance optimization

## 3-Minute Quick Test

### Step 1: Test Basic Viewing (1 min)
```
1. Open: loft-tour/test-scene-loading.html
2. You should see a panorama load
3. Click and drag to look around
4. It should rotate smoothly
```

**✅ Success:** Panorama loads and you can rotate the view  
**❌ Problem:** Check browser console for errors (F12)

**Note:** Marzipano is now loaded locally from `lib/marzipano.min.js` - no internet required!

---

### Step 2: Test Rotation Limits (1 min)
```
1. Open: loft-tour/test-rotation-limits.html
2. Try to rotate left/right as far as possible
3. You should hit a limit at ±30° (red lines)
4. Try to look up/down - limit at ±10°
```

**✅ Success:** View stops at the red limit lines  
**❌ Problem:** If you can rotate 360°, limits aren't working

---

### Step 3: Test Performance (1 min)
```
1. Open: loft-tour/test-performance.html
2. Check the FPS counter (top right)
3. Should show 55-60 FPS
4. Click "Stress Test" button
```

**✅ Success:** FPS stays above 50  
**❌ Problem:** FPS below 30 means performance issues

---

## What Each Test Page Does

| Open This File | To Test This |
|----------------|--------------|
| `test-scene-loading.html` | Basic panorama viewing |
| `test-rotation-limits.html` | View limits (±30°/±10°) |
| `test-camera-sync.html` | Parallax layers moving |
| `test-mobile-controls.html` | Touch & gyroscope (mobile) |
| `test-performance.html` | FPS & performance monitoring |

---

## Mobile Testing (Optional)

If you have a phone:
```
1. Open: loft-tour/test-mobile-controls.html on phone
2. Touch and drag to rotate
3. Pinch to zoom in/out
4. Allow gyroscope permission
5. Tilt phone to rotate view
```

---

## What's NOT Working Yet

These features are planned but not implemented:

❌ **Smooth transitions** between scenes (currently instant)  
❌ **Upload interface** for panoramas (must code manually)  
❌ **Visual layer editor** (must position layers in code)  
❌ **Premium UI** with auto-hiding controls  
❌ **Tour generation** from JSON/CSV files  

---

## Quick Troubleshooting

### Panorama doesn't load?
- Check browser console (F12) for errors
- Verify Three.js and Marzipano loaded (Network tab)
- Try a different test page

### Low FPS (<30)?
- Normal on low-end devices
- System should auto-reduce quality
- Check quality level in performance test

### Controls don't work?
- Make sure you clicked on the panorama
- Check console for JavaScript errors
- Try refreshing the page

### Gyroscope doesn't work?
- iOS requires permission (click "Enable Gyroscope")
- Some browsers don't support it
- Try in Safari on iOS or Chrome on Android

---

## Next: Full Testing Guide

For complete testing instructions, see:
- **`TESTING-GUIDE.md`** - Detailed testing instructions
- **`STATUS-DASHBOARD.md`** - What's done vs. what's not
- **`PERFORMANCE-QUICK-START.md`** - Performance testing guide

---

## Summary

**✅ Working:** Core viewer with panoramas, controls, and performance  
**❌ Not Yet:** Upload UI, smooth transitions, visual editor  
**Progress:** 2 of 8 tasks complete (25%)  

**Start with:** `test-scene-loading.html` to see it in action!
