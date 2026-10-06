# 📸 Property Gallery - Quick Guide

## For Users

### Viewing Property Photos

**On Property Details Page:**
```
┌─────────────────────────────────┐
│                                 │
│         HERO IMAGE              │
│        (Large, Left)            │
│                                 │
│                                 │
├─────────────┬───────────────────┤
│  Thumb 1    │    Thumb 2        │
├─────────────┼───────────────────┤
│  Thumb 3    │    Thumb 4        │
├─────────────┼───────────────────┤
│  Thumb 5    │  Thumb 6 (+10)    │
└─────────────┴───────────────────┘
         [Show all 16 photos]
```

**Click "Show all photos" to open modal:**
```
╔═══════════════════════════════════╗
║  ✕  Property Photos               ║
╠═══════════════════════════════════╣
║                                   ║
║  ⭐ Hero Image                    ║
║  [Large hero image]               ║
║                                   ║
║  🛋️ Living Room                   ║
║  [img] [img] [img]                ║
║                                   ║
║  🍴 Kitchen                        ║
║  [img] [img]                      ║
║                                   ║
║  🛏️ Bedroom 1                     ║
║  [img] [img] [img]                ║
║                                   ║
║  (scroll for more...)             ║
╚═══════════════════════════════════╝
```

**Click any image for full-size view:**
```
╔═══════════════════════════════════╗
║                               ✕   ║
║                                   ║
║                                   ║
║        [FULL SIZE IMAGE]          ║
║                                   ║
║                                   ║
╚═══════════════════════════════════╝
```

## For Developers

### Quick Integration

**1. Include Files:**
```html
<link rel="stylesheet" href="css/property-gallery.css">
<script src="js/property-gallery.js"></script>
```

**2. Add Container:**
```html
<div id="propertyGalleryContainer"></div>
```

**3. Initialize:**
```javascript
await initPropertyGallery(propertyId);
```

**Done!** Gallery will load automatically.

## Image Loading Flow

```
User visits page
    ↓
Load thumbnails (400px) - FAST ⚡
    ↓
User scrolls
    ↓
Upgrade to medium (1024px) - SMOOTH 🎯
    ↓
User opens modal
    ↓
Load full size (1920px) - BEAUTIFUL 🖼️
```

## Category Icons

| Icon | Category | Use For |
|------|----------|---------|
| ⭐ | Hero | Main property image |
| 🛋️ | Living Room | Living areas |
| 🍴 | Kitchen | Kitchen photos |
| 🛏️ | Bedroom | Bedroom photos |
| 🛁 | Bathroom | Bathroom photos |
| 🌳 | Balcony | Outdoor spaces |
| 🏢 | Exterior | Building exterior |
| 🖼️ | Other | Miscellaneous |

## Mobile Experience

**Swipe Gestures:**
- Swipe up: Open modal
- Swipe down: Close modal
- Tap image: View full size
- Tap outside: Close lightbox

**Optimizations:**
- Smaller images on mobile
- Touch-friendly buttons
- Smooth animations
- Fast loading

## Performance Tips

✅ **DO:**
- Upload images in WebP format
- Use appropriate categories
- Set one hero image
- Keep file sizes reasonable

❌ **DON'T:**
- Upload huge images (>5MB)
- Skip categories
- Upload duplicates
- Use low-quality images

## Common Issues

**Gallery not showing?**
→ Check property has images in database

**Images loading slowly?**
→ Check file sizes, optimize images

**Modal not opening?**
→ Check browser console for errors

**Wrong image order?**
→ Check order_index in database

## API Quick Reference

```javascript
// Get property images
GET /api/index.php/property-images/{propertyId}

// Response
{
  "success": true,
  "data": [
    {
      "id": 1,
      "category": "hero",
      "thumbnail_url": "...",
      "md_url": "...",
      "full_url": "..."
    }
  ]
}
```

## Browser Support

✅ Modern browsers (Chrome, Firefox, Safari, Edge)
✅ Mobile browsers (iOS Safari, Chrome Mobile)
✅ Tablets and desktops
⚠️ IE11 not supported (use polyfills if needed)

## File Sizes

| Size | Dimensions | Use Case | Avg Size |
|------|------------|----------|----------|
| Thumb | 400px | Grid thumbnails | ~50KB |
| Medium | 1024px | Modal preview | ~150KB |
| Full | 1920px | Lightbox view | ~300KB |

## Quick Customization

**Change grid columns:**
```css
.gallery-thumbnails {
  grid-template-columns: repeat(3, 1fr); /* 3 columns */
}
```

**Change modal background:**
```css
.property-gallery-modal {
  background: rgba(0, 0, 0, 0.95); /* Darker */
}
```

**Change button color:**
```css
.show-all-photos-btn {
  background: #ffd700; /* Gold */
}
```

## Testing Commands

```bash
# Check if images exist
ls -la uploads/properties/{property_id}/

# Check file sizes
du -h uploads/properties/{property_id}/*/*.webp

# Test API endpoint
curl http://localhost/loft-studio/api/index.php/property-images/1
```

## Support

Need help? Check:
- `read/FRONTEND_GALLERY_COMPLETE.md` - Full documentation
- `read/IMAGE_MANAGEMENT_SYSTEM.md` - Backend system
- Browser console for errors
- Network tab for loading issues

---

**Quick Start:** Just include the CSS/JS files and call `initPropertyGallery(id)`. That's it! 🚀
