# 📸 PANORAMA IMAGE REQUIREMENTS

## ⚠️ CRITICAL - READ BEFORE UPLOADING

This document contains the **essential requirements** for panorama images to display perfectly in the LOFT³ Tour system.

---

## ✅ Optimal Panorama Specifications

### Image Format
- **Type:** Equirectangular 360° panorama
- **File Format:** JPG or PNG
- **Aspect Ratio:** 2:1 (width:height) - REQUIRED for 360° panoramas

### Resolution Guidelines

| Resolution | Use Case | Quality |
|------------|----------|---------|
| **2048 x 1024px** | Mobile-optimized, small file size | Good on mobile, softer on desktop |
| **4096 x 2048px** | ⭐ **RECOMMENDED** - Best balance | Perfect for most screens |
| **6000 x 3000px** | High-end desktop displays | Excellent on all screens |
| **8192 x 4096px** | Maximum quality, 4K displays | Crystal clear everywhere |

### File Size
- **Recommended:** 2-10 MB per image
- **Maximum:** 15 MB (for performance)
- Compress images to balance quality and loading speed

---

## 🎯 Why These Settings Work

The LOFT³ Tour engine uses these **fixed, proven settings**:

```javascript
// FOV (Field of View)
fov: Math.PI / 2  // 90 degrees - natural, unzoomed view

// Geometry
geometry: [{ width: 4096 }]  // Handles 2048-8192px images

// View Limits
maxFov: 100 * Math.PI / 180  // Maximum zoom out
minFov: 120 * Math.PI / 180  // Maximum zoom in
```

These settings ensure:
- ✅ Natural appearance on mobile AND laptop
- ✅ No "zoomed in" feeling
- ✅ Consistent quality across all screen sizes
- ✅ Smooth performance

---

## 🚫 Common Issues to Avoid

### ❌ Wrong Aspect Ratio
- **Problem:** Non-2:1 images will appear distorted
- **Solution:** Always use 2:1 aspect ratio (width = 2 × height)

### ❌ Too Small Resolution
- **Problem:** Images under 2048px will look pixelated on large screens
- **Solution:** Use at least 2048 x 1024px, preferably 4096 x 2048px

### ❌ Too Large File Size
- **Problem:** Images over 15MB will load slowly
- **Solution:** Compress images using tools like Photoshop, TinyPNG, or ImageOptim

### ❌ Not Equirectangular
- **Problem:** Cubemap or other formats won't display correctly
- **Solution:** Convert to equirectangular format using tools like PTGui or Hugin

---

## 📱 Testing Your Panoramas

After uploading, test on:
1. **Mobile device** (phone in portrait and landscape)
2. **Laptop/Desktop** (standard 1920x1080 or higher)
3. **Large display** (if available, 4K or ultrawide)

The panorama should look:
- ✅ Natural and unzoomed
- ✅ Sharp and clear
- ✅ Smooth when rotating
- ✅ Consistent across all devices

---

## 🛠️ Recommended Tools

### Creating 360° Panoramas
- **Ricoh Theta** - Consumer 360° camera
- **Insta360** - Professional 360° camera
- **Google Street View App** - Free mobile option

### Editing & Stitching
- **PTGui** - Professional stitching software
- **Hugin** - Free open-source stitching
- **Adobe Photoshop** - Manual editing

### Compression
- **TinyPNG** - Online compression
- **ImageOptim** - Mac compression tool
- **Squoosh** - Google's web-based tool

---

## 💡 Pro Tips

1. **Shoot in good lighting** - Better source = better result
2. **Use a tripod** - Reduces stitching errors
3. **Overlap shots** - If stitching manually, use 30-50% overlap
4. **Test before batch upload** - Upload one panorama first to verify quality
5. **Keep originals** - Always save high-res originals before compression

---

## 📞 Need Help?

If panoramas don't look right:
1. Check the aspect ratio (must be 2:1)
2. Verify resolution (minimum 2048 x 1024px)
3. Test with the simple test file: `test-simple-basic.html`
4. Check browser console for errors

---

**Last Updated:** January 2026
**System Version:** LOFT³ Tour Engine v1.0
