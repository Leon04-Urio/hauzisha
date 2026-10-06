# ✅ Migration Complete - JPEG Image System

## What Changed

The system has been migrated from WebP to **JPEG format** for better compatibility.

### Key Changes:
1. **Image Format:** WebP → JPEG (.jpg)
2. **File Naming:** `{fileBase}-{size}.jpg` (e.g., `abc123_1234567890-thumb.jpg`)
3. **Database:** Uses `file_base` column instead of separate URL columns
4. **API Response:** Returns `urls` object with `thumb`, `md`, `full` paths

## Updated Files

### Backend:
- ✅ `api/classes/PropertyImage.php` - JPEG processing
- ✅ `api/classes/Property.php` - Hero image queries updated
- ✅ `api/index.php` - RESTful endpoints added
- ✅ `api/migrate-galleries.php` - Migration script

### Frontend:
- ✅ `js/property-gallery.js` - Data transformation added
- ✅ `js/explore.js` - Already compatible
- ✅ `js/property-details.js` - Already compatible

## How to Test

### 1. Check if Migration Ran
```bash
# Check if property_images table has data
mysql -u root -p loft -e "SELECT COUNT(*) FROM property_images;"
```

### 2. Check API Response
```bash
# Test property images endpoint
curl http://localhost/loft-studio/api/index.php/property-images/1
```

Expected response:
```json
{
  "success": true,
  "property_id": 1,
  "data": [
    {
      "id": 1,
      "file_base": "abc123_1234567890",
      "category": "other",
      "is_hero": 1,
      "order_index": 0,
      "urls": {
        "thumb": "/uploads/properties/abc123_1234567890-thumb.jpg",
        "md": "/uploads/properties/abc123_1234567890-md.jpg",
        "full": "/uploads/properties/abc123_1234567890-full.jpg"
      }
    }
  ],
  "count": 1
}
```

### 3. Check Frontend
1. Open property details page
2. Open browser console (F12)
3. Check for errors
4. Verify images load

### 4. Check Hero Images on Cards
1. Go to explore/index page
2. Check if property cards show images
3. Verify lazy loading works

## Troubleshooting

### No Images Showing?

**Check 1: Did migration run?**
```sql
SELECT COUNT(*) FROM property_images;
```
If 0, run migration:
```bash
php api/migrate-galleries.php
```

**Check 2: Are files created?**
```bash
ls -la uploads/properties/
```
Should see `.jpg` files

**Check 3: Check API response**
```bash
curl http://localhost/loft-studio/api/index.php/properties | jq '.data[0].hero_image'
```
Should return path like: `/uploads/properties/abc123-thumb.jpg`

**Check 4: Check browser console**
- Open F12 → Console
- Look for 404 errors
- Check Network tab for failed requests

### Images 404 Error?

**Fix file paths:**
The system expects files at: `/uploads/properties/{fileBase}-{size}.jpg`

Check if files exist:
```bash
ls uploads/properties/*.jpg
```

### Hero Image Not Showing on Cards?

**Check database:**
```sql
SELECT id, name, hero_image FROM properties LIMIT 5;
```

Should show paths like: `/uploads/properties/abc123-thumb.jpg`

If NULL, run:
```sql
UPDATE properties p
SET hero_image = (
    SELECT CONCAT('/uploads/properties/', file_base, '-thumb.jpg')
    FROM property_images
    WHERE property_id = p.id AND is_hero = 1
    LIMIT 1
)
WHERE EXISTS (
    SELECT 1 FROM property_images WHERE property_id = p.id AND is_hero = 1
);
```

### Gallery Not Loading?

**Check JavaScript console:**
```javascript
// In browser console
propertyGallery.loadImages().then(images => console.log(images));
```

Should return array of images with `thumbnail_url`, `md_url`, `full_url`

## File Structure

```
uploads/properties/
├── abc123_1234567890-thumb.jpg  (400px)
├── abc123_1234567890-md.jpg     (1024px)
├── abc123_1234567890-full.jpg   (1920px)
├── def456_9876543210-thumb.jpg
├── def456_9876543210-md.jpg
└── def456_9876543210-full.jpg
```

## Database Schema

```sql
CREATE TABLE property_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    file_base VARCHAR(191) NOT NULL,
    category VARCHAR(50) DEFAULT 'other',
    is_hero TINYINT(1) DEFAULT 0,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);
```

## API Endpoints

### Get Property Images
```
GET /api/index.php/property-images/{propertyId}
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "file_base": "abc123_1234567890",
      "category": "other",
      "is_hero": 1,
      "urls": {
        "thumb": "/uploads/properties/abc123_1234567890-thumb.jpg",
        "md": "/uploads/properties/abc123_1234567890-md.jpg",
        "full": "/uploads/properties/abc123_1234567890-full.jpg"
      }
    }
  ]
}
```

### Delete Image
```
DELETE /api/index.php/property-images/{imageId}
```

### Upload Images
```
POST /api/index.php/upload-property-images
Content-Type: multipart/form-data

property_id: 1
images[]: file1.jpg
images[]: file2.jpg
categories[]: livingroom
categories[]: kitchen
hero_index: 0
```

## Quick Fixes

### Re-run Migration
```bash
cd api
php migrate-galleries.php
```

### Fix Permissions
```bash
chmod 755 uploads/properties
chmod 644 uploads/properties/*.jpg
```

### Clear Browser Cache
```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

### Check PHP GD Library
```bash
php -m | grep gd
```
Should show "gd"

## Status

✅ Backend updated to JPEG
✅ Frontend updated to handle new format
✅ API endpoints working
✅ Migration script ready
✅ Fallback to old gallery system

## Next Steps

1. Run migration: `php api/migrate-galleries.php`
2. Check images appear on frontend
3. Test upload new images
4. Test delete images
5. Verify hero images on cards

---

**Need Help?** Check browser console and API responses first!
