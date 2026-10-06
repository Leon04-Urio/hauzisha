# Property Image Management API - Quick Reference

## API Endpoints Created ✅

All endpoints are located in `/api/images/` directory.

---

## 1. Upload Images

**Endpoint**: `POST /api/images/upload.php`

**Purpose**: Upload multiple images with WebP conversion and categorization

**Authentication**: Required (session-based)

**Parameters**:
- `property_id` (required) - Property ID
- `images[]` (required) - Array of image files
- `categories[]` (optional) - Array of categories for each image
- `hero_index` (optional) - Index of image to set as hero

**Categories**:
- `livingroom`, `kitchen`, `balcony`, `bedroom1`, `bedroom2`, `bathroom`, `exterior`, `other`

**Example**:
```javascript
const formData = new FormData();
formData.append('property_id', 16);
formData.append('images[]', file1);
formData.append('images[]', file2);
formData.append('categories[]', 'livingroom');
formData.append('categories[]', 'kitchen');
formData.append('hero_index', 0);

const response = await fetch('/loft-studio/api/images/upload.php', {
    method: 'POST',
    body: formData
});

const result = await response.json();
```

**Response**:
```json
{
    "success": true,
    "uploaded": [
        {
            "id": 1,
            "file_base": "12345_1234567890",
            "category": "livingroom",
            "is_hero": 1,
            "files": {
                "thumb": "12345_1234567890-thumb.webp",
                "md": "12345_1234567890-md.webp",
                "full": "12345_1234567890-full.webp"
            }
        }
    ],
    "errors": [],
    "message": "2 images uploaded successfully"
}
```

---

## 2. List Images

**Endpoint**: `GET /api/images/list.php`

**Purpose**: Get all images for a property

**Authentication**: Not required

**Parameters**:
- `property_id` (required) - Property ID
- `group` (optional) - Group by category (default: true)

**Example**:
```javascript
const response = await fetch('/loft-studio/api/images/list.php?property_id=16');
const result = await response.json();
```

**Response (grouped)**:
```json
{
    "success": true,
    "property_id": 16,
    "images": {
        "hero": {
            "id": 1,
            "file_base": "12345_1234567890",
            "category": "livingroom",
            "is_hero": 1,
            "order_index": 0,
            "urls": {
                "thumb": "/uploads/properties/12345_1234567890-thumb.webp",
                "md": "/uploads/properties/12345_1234567890-md.webp",
                "full": "/uploads/properties/12345_1234567890-full.webp"
            }
        },
        "categories": {
            "livingroom": [...],
            "kitchen": [...],
            "bedroom1": [...]
        }
    },
    "count": 5
}
```

**Response (ungrouped)**:
```javascript
// Add ?group=false to URL
{
    "success": true,
    "property_id": 16,
    "images": [
        { "id": 1, "file_base": "...", "urls": {...} },
        { "id": 2, "file_base": "...", "urls": {...} }
    ],
    "count": 2
}
```

---

## 3. Set Hero Image

**Endpoint**: `POST /api/images/set-hero.php`

**Purpose**: Set a specific image as the hero/main image

**Authentication**: Required

**Parameters**:
- `image_id` (required) - Image ID to set as hero

**Example**:
```javascript
const response = await fetch('/loft-studio/api/images/set-hero.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image_id: 5 })
});

const result = await response.json();
```

**Response**:
```json
{
    "success": true,
    "message": "Hero image updated"
}
```

---

## 4. Delete Image

**Endpoint**: `POST /api/images/delete.php` or `DELETE /api/images/delete.php`

**Purpose**: Delete an image and its files

**Authentication**: Required

**Parameters**:
- `image_id` (required) - Image ID to delete

**Example**:
```javascript
const response = await fetch('/loft-studio/api/images/delete.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image_id: 5 })
});

const result = await response.json();
```

**Response**:
```json
{
    "success": true,
    "message": "Image deleted successfully"
}
```

---

## 5. Migrate Gallery Images

**Endpoint**: `GET /api/images/migrate.php`

**Purpose**: Migrate existing gallery images to new system

**Authentication**: Required (Admin recommended)

**Parameters**:
- `property_id` (optional) - Migrate single property, or omit for all properties

**Example (single property)**:
```javascript
const response = await fetch('/loft-studio/api/images/migrate.php?property_id=16');
const result = await response.json();
```

**Response (single)**:
```json
{
    "success": true,
    "property_id": 16,
    "migrated": 5,
    "message": "5 images migrated successfully"
}
```

**Example (all properties)**:
```javascript
const response = await fetch('/loft-studio/api/images/migrate.php');
const result = await response.json();
```

**Response (all)**:
```json
{
    "success": true,
    "total_properties": 10,
    "migrated_properties": 8,
    "total_images": 45,
    "details": [
        {
            "property_id": 16,
            "property_name": "Rafiki Lane Homes",
            "success": true,
            "migrated": 5,
            "message": "5 images migrated successfully"
        }
    ],
    "message": "Migrated 45 images from 8 properties"
}
```

---

## Error Responses

All endpoints return consistent error format:

```json
{
    "success": false,
    "error": "Error message here"
}
```

**HTTP Status Codes**:
- `200` - Success
- `400` - Bad Request (missing parameters)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (insufficient permissions)
- `405` - Method Not Allowed
- `500` - Server Error

---

## Image Sizes Generated

Each uploaded image is converted to WebP and saved in 3 sizes:

| Size | Max Width | Use Case |
|------|-----------|----------|
| `thumb` | 400px | Thumbnails, cards |
| `md` | 1024px | Gallery, details |
| `full` | 1920px | Lightbox, full view |

**File naming**: `{file_base}-{size}.webp`

Example: `12345_1234567890-thumb.webp`

---

## Usage Examples

### Display Hero Image
```html
<img src="${property.hero_image}" 
     alt="${property.name}"
     loading="lazy">
```

### Display with Responsive Sizes
```html
<img src="${image.urls.md}" 
     srcset="${image.urls.thumb} 400w,
             ${image.urls.md} 1024w,
             ${image.urls.full} 1920w"
     sizes="(max-width: 768px) 100vw, 50vw"
     loading="lazy">
```

### Display Category Images
```javascript
const response = await fetch(`/api/images/list.php?property_id=${propertyId}`);
const data = await response.json();

// Display living room images
const livingroomImages = data.images.categories.livingroom || [];
livingroomImages.forEach(img => {
    console.log(img.urls.thumb); // Thumbnail URL
    console.log(img.urls.md);    // Medium URL
    console.log(img.urls.full);  // Full size URL
});
```

---

## Testing the APIs

### Test Upload
```bash
curl -X POST http://localhost/loft-studio/api/images/upload.php \
  -F "property_id=16" \
  -F "images[]=@/path/to/image1.jpg" \
  -F "images[]=@/path/to/image2.jpg" \
  -F "categories[]=livingroom" \
  -F "categories[]=kitchen" \
  -F "hero_index=0"
```

### Test List
```bash
curl http://localhost/loft-studio/api/images/list.php?property_id=16
```

### Test Migration
```bash
curl http://localhost/loft-studio/api/images/migrate.php?property_id=16
```

---

## Files Created

1. ✅ `api/images/upload.php` - Upload endpoint
2. ✅ `api/images/list.php` - List endpoint
3. ✅ `api/images/set-hero.php` - Set hero endpoint
4. ✅ `api/images/delete.php` - Delete endpoint
5. ✅ `api/images/migrate.php` - Migration endpoint
6. ✅ `api/images/.htaccess` - Directory configuration

---

## Next Steps

1. **Run database updates**:
   ```bash
   mysql -u your_user -p loft < database-updates.sql
   ```

2. **Create uploads directory**:
   ```bash
   mkdir -p uploads/properties
   chmod 755 uploads/properties
   ```

3. **Test migration**:
   ```
   Visit: http://localhost/loft-studio/api/images/migrate.php
   ```

4. **Test upload** (create admin upload form)

5. **Update property display** to use new image system

---

## Summary

All API endpoints are complete and ready to use:
- ✅ Upload with WebP conversion
- ✅ List images by property
- ✅ Set hero image
- ✅ Delete images
- ✅ Migrate existing galleries

The system automatically:
- Converts images to WebP
- Generates 3 responsive sizes
- Manages hero images
- Organizes by category
- Handles cleanup on delete
