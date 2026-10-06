# 🚀 Property Image System - Quick Reference

## For Admins

### Upload Images
1. Go to **Control Room → Properties**
2. Click **Edit** (eye icon) on property
3. Click **"Add More Images"**
4. Select files → Choose categories → Mark hero
5. Click **"Upload Images"**
6. Done! ✅

### Delete Images
1. Open property edit modal
2. Find image
3. Click red **Delete** button
4. Confirm
5. Done! ✅

## For Developers

### Initialize Gallery
```javascript
await initPropertyGallery(propertyId);
```

### API Endpoints
```
GET  /api/index.php/properties → includes hero_image
GET  /api/index.php/property/{id} → includes hero_image
GET  /api/index.php/property-images/{id} → all images
POST /api/index.php/upload-property-images
DELETE /api/index.php/property-images/{id}
```

### Image Sizes
- **Thumbnail:** 400px (_thumb.webp)
- **Medium:** 1024px (_md.webp)
- **Full:** 1920px (_full.webp)

### Categories
- hero, livingroom, kitchen, bedroom1, bedroom2
- bathroom, balcony, exterior, other

## File Locations

### Frontend
- `js/property-gallery.js` - Gallery system
- `css/property-gallery.css` - Gallery styles
- `js/explore.js` - Card rendering
- `js/property-details.js` - Details page

### Backend
- `api/classes/PropertyImage.php` - Image management
- `api/classes/Property.php` - Property API
- `api/index.php` - Routes

### Admin
- `control-room/properties.php` - Property management
- `control-room/js/properties.js` - Admin logic
- `control-room/js/property-image-upload.js` - Upload handler

## Common Tasks

### Add New Category
1. Update `IMAGE_CATEGORIES` in `property-image-upload.js`
2. Add icon in `getCategoryIcon()` in `property-gallery.js`
3. Add title in `formatCategoryTitle()` in `property-gallery.js`

### Change Image Sizes
Edit `PropertyImage.php`:
```php
const THUMB_SIZE = 400;
const MD_SIZE = 1024;
const FULL_SIZE = 1920;
```

### Customize Grid Layout
Edit `property-gallery.css`:
```css
.property-gallery-grid {
  grid-template-columns: 2fr 1fr; /* Adjust ratio */
}
```

### Change Number of Thumbnails
Edit `property-gallery.js`:
```javascript
.slice(0, 6); // Change to desired number
```

## Keyboard Shortcuts

### Lightbox
- **←** Previous image
- **→** Next image
- **ESC** Close lightbox

## Touch Gestures

### Mobile
- **Swipe Left** Next image
- **Swipe Right** Previous image
- **Tap Outside** Close

## Troubleshooting

### Images not showing?
```bash
# Check permissions
chmod 755 uploads/properties
chmod 644 uploads/properties/*/*.webp

# Check API
curl http://localhost/loft-studio/api/index.php/property-images/1
```

### Lazy loading not working?
```javascript
// Check browser support
if ('IntersectionObserver' in window) {
  console.log('Supported');
}
```

### Modal not opening?
```javascript
// Check initialization
console.log(propertyGallery);
```

## Performance Tips

✅ Upload WebP format
✅ Keep files <5MB
✅ Use appropriate categories
✅ Set one hero image
✅ Delete unused images

## Browser Support

✅ Chrome 90+
✅ Firefox 88+
✅ Safari 14+
✅ Edge 90+
✅ Mobile browsers

## Quick Links

- Full Docs: `read/COMPLETE_IMAGE_SYSTEM.md`
- API Docs: `read/IMAGE_API_REFERENCE.md`
- Frontend: `read/FRONTEND_GALLERY_COMPLETE.md`
- Admin: `read/PROPERTY_MODAL_IMAGE_INTEGRATION.md`

## Status

🟢 **All Systems Operational**

---

**Need Help?** Check the documentation in `read/` folder!
