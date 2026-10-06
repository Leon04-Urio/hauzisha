# 🧪 How to Test Scene Loading & Node Switching

## Quick Test Guide

### Step 1: Open the Test Page

**Option A: Direct File Access**
```bash
# Navigate to the file
open loft-tour/test-scene-loading.html

# Or on Linux
xdg-open loft-tour/test-scene-loading.html
```

**Option B: Local Server (Recommended)**
```bash
# Start a local server
cd loft-tour
python3 -m http.server 8000

# Open in browser
# http://localhost:8000/test-scene-loading.html
```

---

### Step 2: Load the Test Tour

1. You'll see a black screen with test controls on the left
2. Click the **"Load Test Tour"** button
3. Wait for the first panorama to load (1-2 seconds)
4. You should see a panoramic image appear

**Expected Result**: 
- Button changes to "Tour Loaded ✓"
- Navigation buttons become enabled
- Status panel shows tour info
- First panorama displays

---

### Step 3: Test Navigation

#### Forward Navigation
1. Click **"Next Node →"** button
2. Watch the panorama change
3. Status panel updates with new node info

**Expected Result**:
- Smooth transition to next panorama
- Current node changes from "Entrance" to "Living Room"
- Node index increases (1 → 2)
- Previous button becomes enabled

#### Backward Navigation
1. Click **"← Previous Node"** button
2. Watch the panorama change back
3. Status panel updates

**Expected Result**:
- Smooth transition to previous panorama
- Current node changes back to "Entrance"
- Node index decreases (2 → 1)
- Previous button becomes disabled (at first node)

---

### Step 4: Test Jump Navigation

#### Jump to First
1. Navigate to any middle node
2. Click **"Jump to First"** button

**Expected Result**:
- Instantly loads first node ("Entrance")
- Previous button disabled
- Node index shows 1

#### Jump to Middle
1. Click **"Jump to Middle"** button

**Expected Result**:
- Loads middle node ("Kitchen")
- Both navigation buttons enabled
- Node index shows 3

#### Jump to Last
1. Click **"Jump to Last"** button

**Expected Result**:
- Loads last node ("Balcony")
- Next button disabled
- Node index shows 5

---

### Step 5: Verify Status Panel

The status panel should show:

```
Tour Loaded: Yes
Current Node: [Node Name]
Node Index: [1-5]
Total Nodes: 5
FPS: ~60
Transitioning: No (or Yes during transitions)
```

**Check**:
- ✅ Tour Loaded changes to "Yes" after loading
- ✅ Current Node updates with each navigation
- ✅ Node Index matches current position
- ✅ Total Nodes shows 5
- ✅ FPS is around 60
- ✅ Transitioning shows "Yes" briefly during navigation

---

### Step 6: Test Camera Controls

1. Click and drag on the panorama
2. Move your mouse left/right
3. Move your mouse up/down

**Expected Result**:
- Panorama rotates with mouse movement
- Horizontal rotation limited to ±30°
- Vertical rotation limited to ±10°
- Smooth, responsive movement
- Cursor changes to "grabbing" while dragging

---

### Step 7: Check Performance

1. Watch the FPS counter in the status panel
2. Navigate between nodes multiple times
3. Drag the camera around

**Expected Result**:
- FPS stays around 60
- No stuttering or lag
- Smooth transitions
- No console errors

---

## 🔍 What to Look For

### ✅ Success Indicators

1. **Visual**
   - Panoramas load and display correctly
   - Smooth transitions between nodes
   - No black screens or flickering
   - Camera movement is smooth

2. **Functional**
   - All buttons work as expected
   - Navigation respects boundaries
   - Status updates in real-time
   - No JavaScript errors in console

3. **Performance**
   - FPS stays at ~60
   - No lag or stuttering
   - Quick load times
   - Responsive controls

### ❌ Issues to Report

1. **Visual Problems**
   - Black screen after loading
   - Panoramas don't display
   - Flickering or artifacts
   - Distorted images

2. **Functional Problems**
   - Buttons don't work
   - Navigation fails
   - Status doesn't update
   - Console errors

3. **Performance Problems**
   - FPS below 30
   - Stuttering or lag
   - Slow transitions
   - Unresponsive controls

---

## 🐛 Troubleshooting

### Problem: Tour Won't Load

**Symptoms**: Button stays on "Loading..." or shows error

**Solutions**:
1. Check browser console for errors (F12)
2. Verify internet connection (test images load from picsum.photos)
3. Try refreshing the page
4. Check if WebGL is supported (visit https://get.webgl.org/)

### Problem: Black Screen

**Symptoms**: Tour loads but shows black screen

**Solutions**:
1. Check browser console for image loading errors
2. Wait a few seconds (images may be loading)
3. Check if container has proper dimensions
4. Verify WebGL is working

### Problem: Navigation Not Working

**Symptoms**: Buttons don't respond or navigation fails

**Solutions**:
1. Check if tour is fully loaded
2. Wait for transitions to complete
3. Check console for JavaScript errors
4. Verify button states (disabled/enabled)

### Problem: Low FPS

**Symptoms**: FPS counter shows <30

**Solutions**:
1. Close other browser tabs
2. Check GPU acceleration is enabled
3. Try a different browser
4. Check system resources

---

## 📊 Test Checklist

Use this checklist to verify all functionality:

### Initial Load
- [ ] Test page opens without errors
- [ ] Test controls are visible
- [ ] "Load Test Tour" button is enabled
- [ ] Status panel shows default values

### Tour Loading
- [ ] Click "Load Test Tour" works
- [ ] First panorama loads and displays
- [ ] Button changes to "Tour Loaded ✓"
- [ ] Navigation buttons become enabled
- [ ] Status panel updates with tour info

### Forward Navigation
- [ ] "Next Node →" button works
- [ ] Panorama changes to next node
- [ ] Status updates correctly
- [ ] Previous button becomes enabled
- [ ] Next button disables at last node

### Backward Navigation
- [ ] "← Previous Node" button works
- [ ] Panorama changes to previous node
- [ ] Status updates correctly
- [ ] Previous button disables at first node
- [ ] Next button becomes enabled

### Jump Navigation
- [ ] "Jump to First" works
- [ ] "Jump to Middle" works
- [ ] "Jump to Last" works
- [ ] Status updates for each jump
- [ ] Buttons enable/disable correctly

### Camera Controls
- [ ] Click and drag rotates panorama
- [ ] Horizontal rotation is limited
- [ ] Vertical rotation is limited
- [ ] Movement is smooth
- [ ] Cursor changes appropriately

### Performance
- [ ] FPS counter shows ~60
- [ ] No stuttering or lag
- [ ] Transitions are smooth
- [ ] No memory leaks (test for 5+ minutes)

### Error Handling
- [ ] No console errors
- [ ] No console warnings
- [ ] Graceful handling of edge cases
- [ ] Proper state management

---

## 🎯 Expected Test Results

### Successful Test Session

```
✅ Tour loaded successfully
✅ All 5 nodes accessible
✅ Forward navigation works
✅ Backward navigation works
✅ Jump navigation works
✅ Camera controls responsive
✅ FPS at ~60
✅ No console errors
✅ Smooth transitions
✅ Proper state management
```

### Test Duration
- **Quick Test**: 2-3 minutes
- **Thorough Test**: 5-10 minutes
- **Stress Test**: 15+ minutes

---

## 📸 Screenshots

### Initial State
```
┌─────────────────────────────────────┐
│ 🧪 Scene Loading Test               │
│                                     │
│ [Load Test Tour]                    │
│ [← Previous] [Next →]               │
│ [Jump First] [Middle] [Last]        │
│                                     │
│ Status:                             │
│ Tour Loaded: No                     │
│ Current Node: -                     │
│ Node Index: -                       │
│ Total Nodes: -                      │
│ FPS: -                              │
│ Transitioning: No                   │
└─────────────────────────────────────┘
```

### After Loading
```
┌─────────────────────────────────────┐
│ 🧪 Scene Loading Test               │
│                                     │
│ [Tour Loaded ✓]                     │
│ [← Previous] [Next →]               │
│ [Jump First] [Middle] [Last]        │
│                                     │
│ Status:                             │
│ Tour Loaded: Yes                    │
│ Current Node: Entrance              │
│ Node Index: 1                       │
│ Total Nodes: 5                      │
│ FPS: 60                             │
│ Transitioning: No                   │
│                                     │
│ ✅ Tour loaded successfully!        │
└─────────────────────────────────────┘
```

---

## 🚀 Advanced Testing

### Stress Test
1. Navigate rapidly between nodes
2. Click buttons repeatedly
3. Drag camera aggressively
4. Monitor FPS and memory

### Edge Cases
1. Try to navigate beyond boundaries
2. Click buttons during transitions
3. Resize browser window
4. Switch browser tabs

### Mobile Testing
1. Open on mobile device
2. Test touch controls
3. Test gyroscope (if available)
4. Check performance on mobile

---

## 📝 Reporting Results

If you find issues, report with:

1. **Browser**: Chrome 120, Firefox 121, etc.
2. **OS**: Windows 11, macOS 14, etc.
3. **Issue**: Description of problem
4. **Steps**: How to reproduce
5. **Console**: Any error messages
6. **Screenshot**: If visual issue

---

## ✅ Success!

If all tests pass, you've successfully verified:
- ✅ Scene loading works
- ✅ Node switching works
- ✅ Navigation works
- ✅ Camera controls work
- ✅ Performance is good
- ✅ No errors or issues

**The implementation is ready for production use!**

---

## 🔗 Related Documentation

- [Implementation Guide](SCENE-LOADING-IMPLEMENTATION.md)
- [Quick Start Guide](SCENE-LOADING-QUICK-START.md)
- [Task Completion Summary](TASK-2-SCENE-LOADING-COMPLETE.md)
- [Verification Script](verify-scene-loading.js)

---

**Happy Testing! 🎉**
