# LOFT³ Virtual Tour System

## 🚀 Quick Start

### For Uploading Panoramas
**👉 READ THIS FIRST:** [PANORAMA-REQUIREMENTS.md](./PANORAMA-REQUIREMENTS.md)

This file contains **critical information** about:
- Image resolution requirements (2048-8192px)
- Aspect ratio (must be 2:1)
- File formats and sizes
- Why panoramas display perfectly on all devices

### For Testing
- **Simple Test:** Open `test-simple-basic.html` - Basic panorama viewer
- **Full Test:** Open `test-scene-loading.html` - Complete tour with transitions

---

## 📁 Project Structure

```
loft-tour/
├── README.md                          ← You are here
├── PANORAMA-REQUIREMENTS.md           ← ⭐ READ THIS for image specs
├── index.html                         ← Main tour viewer
│
├── js/                                ← Core engine files
│   ├── loft-tour-core.js             ← Main engine
│   ├── loft-tour-layers.js           ← 3D overlay system
│   ├── loft-tour-transitions.js      ← Scene transitions
│   └── loft-tour-controls.js         ← Mouse/touch controls
│
├── lib/                               ← External libraries
│   └── marzipano.min.js              ← 360° panorama library
│
├── read/                              ← 📚 Documentation
│   ├── START-HERE.md                 ← Getting started guide
│   ├── TROUBLESHOOTING.md            ← Common issues & fixes
│   ├── TESTING-GUIDE.md              ← How to test features
│   └── [other docs...]               ← Feature-specific guides
│
└── test-*.html                        ← Test files for development
```

---

## 🎯 Key Features

- ✅ **360° Panorama Viewing** - Smooth, high-quality panoramas
- ✅ **Multi-Scene Tours** - Navigate between multiple locations
- ✅ **Automatic Linear Walkthrough** - Follows `nextNode` field for correct sequencing
- ✅ **3D Overlay Layers** - Add interactive 3D elements
- ✅ **Smooth Transitions** - Fade between scenes
- ✅ **Mobile & Desktop** - Perfect on all screen sizes
- ✅ **Touch & Mouse Controls** - Intuitive navigation
- ✅ **Rotation Limits** - Optional guided tour mode

---

## 📖 Documentation

All documentation is in the `read/` folder:

### Essential Docs
- **[PANORAMA-REQUIREMENTS.md](./PANORAMA-REQUIREMENTS.md)** - Image requirements (READ FIRST!)
- **[read/START-HERE.md](./read/START-HERE.md)** - Getting started guide
- **[read/TROUBLESHOOTING.md](./read/TROUBLESHOOTING.md)** - Common issues

### Feature Guides
- **[read/LINEAR-WALKTHROUGH-IMPLEMENTATION.md](./read/LINEAR-WALKTHROUGH-IMPLEMENTATION.md)** - Automatic linear walkthrough
- **[read/METADATA-PARSER.md](./read/METADATA-PARSER.md)** - Metadata parsing & validation
- **[read/CAMERA-SYNC.md](./read/CAMERA-SYNC.md)** - Camera synchronization
- **[read/ROTATION-LIMITS.md](./read/ROTATION-LIMITS.md)** - Rotation controls
- **[read/MOBILE-CONTROLS.md](./read/MOBILE-CONTROLS.md)** - Touch controls
- **[read/PERFORMANCE-OPTIMIZATIONS.md](./read/PERFORMANCE-OPTIMIZATIONS.md)** - Performance tuning

### Implementation Details
- **[read/SCENE-LOADING-IMPLEMENTATION.md](./read/SCENE-LOADING-IMPLEMENTATION.md)** - Scene loading
- **[read/TASK-COMPLETION-SUMMARY.md](./read/TASK-COMPLETION-SUMMARY.md)** - Development history

---

## 🎨 Technical Details

### Core Settings (DO NOT CHANGE)
These settings ensure perfect display on all devices:

```javascript
// Field of View - Natural, unzoomed appearance
fov: Math.PI / 2  // 90 degrees

// Geometry - Supports 2048-8192px images
geometry: [{ width: 4096 }]

// View Limits - Comfortable zoom range
maxFov: 100 * Math.PI / 180  // 100 degrees
minFov: 120 * Math.PI / 180  // 120 degrees
```

### Why These Work
- **90° FOV** - Matches human field of view, looks natural
- **4096px geometry** - Optimal for most panorama resolutions
- **100-120° limits** - Prevents over-zooming and distortion

---

## 🧪 Testing

### Quick Test
1. Open `test-simple-basic.html` in browser
2. Should see panorama with natural appearance
3. Test on mobile and desktop

### Full Feature Test
1. Open `test-scene-loading.html`
2. Click "Load Test Tour"
3. Test navigation, rotation, zoom

### What to Check
- ✅ Image looks sharp and clear
- ✅ No "zoomed in" feeling
- ✅ Smooth rotation with mouse/touch
- ✅ Consistent on mobile and desktop

---

## 🐛 Troubleshooting

### Panorama looks zoomed in or blurry
→ Check [PANORAMA-REQUIREMENTS.md](./PANORAMA-REQUIREMENTS.md) for image specs

### Controls not working
→ See [read/TROUBLESHOOTING.md](./read/TROUBLESHOOTING.md)

### Console errors
→ Check browser console (F12) and see troubleshooting guide

---

## 📞 Support

For issues or questions:
1. Check [PANORAMA-REQUIREMENTS.md](./PANORAMA-REQUIREMENTS.md) first
2. Review [read/TROUBLESHOOTING.md](./read/TROUBLESHOOTING.md)
3. Test with `test-simple-basic.html` to isolate issues
4. Check browser console for error messages

---

**Version:** 1.0  
**Last Updated:** January 2026  
**Status:** Production Ready ✅
