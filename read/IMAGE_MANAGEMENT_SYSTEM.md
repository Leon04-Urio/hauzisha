# Property Image Management System - Implementation Guide

## Overview

Complete image management system with WebP conversion, multiple sizes, categorization, and hero image support.

## What's Been Created

### 1. Database Schema (database-updates.sql)

**property_images table**:
```sql
- id: Primary key
- property_id: Foreign key to properties
- file_base: Base filename (without size suffix)
- category: livingroom, kitchen, balcony, bedroom1, bedroom2, bathroom, exterior, other
- is_hero: Flag for hero/main image
- order_index: Display order within category
- created_at, updated_at: Timestamps
```

**properties table update**:
- Added `hero_image` column for quick access to hero image

### 2. PropertyImage Class (api/classes/PropertyImage.php)

**Features**:
- ✅ Multi-file upload with category selection
- ✅ WebP conversion for all images
- ✅ 3 sizes generated: thumb (400px), md (1024px), full (1920px)
- ✅ Hero image management
- ✅ Image categorization
- ✅ Order management
- ✅ Migration from old gallery system

**Key Methods**:
```php
uploadImages($propertyId, $files, $categories, $heroIndex)
getPropertyImages($propertyId, $groupByCategory)
deleteImage($imageId)
setHeroImage($imageId)
migrateGalleryImages($propertyId)
```

## Next Steps to Complete

### 3. API Endpoints (Need to Create)

**api/images/upload.php**:
```php
<?php
require_once '../config/database.php';
require_once '../classes/PropertyImage.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$propertyId = $_POST['property_id'] ?? null;
$categories = $_POST['categories'] ?? [];
$heroIndex = $_POST['hero_index'] ?? null;

if (!$propertyId || !isset($_FILES['images'])) {
    echo json_encode(['error' => 'Missing required parameters']);
    exit();
}

try {
    $imageManager = new PropertyImage($conn);
    $result = $imageManager->uploadImages($propertyId, $_FILES['images'], $categories, $heroIndex);
    echo json_encode($result);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
```

**api/images/list.php**:
```php
<?php
require_once '../config/database.php';
require_once '../classes/PropertyImage.php';

header('Content-Type: application/json');

$propertyId = $_GET['property_id'] ?? null;

if (!$propertyId) {
    echo json_encode(['error' => 'Property ID required']);
    exit();
}

try {
    $imageManager = new PropertyImage($conn);
    $images = $imageManager->getPropertyImages($propertyId, true);
    echo json_encode(['success' => true, 'images' => $images]);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
```

### 4. Admin Upload Modal (Frontend)

**HTML Structure**:
```html
<div class="modal" id="imageUploadModal">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5>Upload Property Images</h5>
                <button type="button" class="close" data-dismiss="modal">&times;</button>
            </div>
            <div class="modal-body">
                <form id="imageUploadForm" enctype="multipart/form-data">
                    <input type="hidden" name="property_id" id="propertyId">
                    
                    <div class="form-group">
                        <label>Select Images</label>
                        <input type="file" name="images[]" multiple accept="image/*" 
                               class="form-control" id="imageFiles">
                    </div>
                    
                    <div id="imagePreviewContainer"></div>
                    
                    <button type="submit" class="btn btn-primary">Upload Images</button>
                </form>
            </div>
        </div>
    </div>
</div>
```

**JavaScript**:
```javascript
document.getElementById('imageFiles').addEventListener('change', function(e) {
    const container = document.getElementById('imagePreviewContainer');
    container.innerHTML = '';
    
    Array.from(e.target.files).forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = `
                <div class="image-preview-item">
                    <img src="${e.target.result}" style="max-width: 150px;">
                    <select name="categories[]" class="form-control">
                        <option value="other">Other</option>
                        <option value="livingroom">Living Room</option>
                        <option value="kitchen">Kitchen</option>
                        <option value="balcony">Balcony</option>
                        <option value="bedroom1">Bedroom 1</option>
                        <option value="bedroom2">Bedroom 2</option>
                        <option value="bathroom">Bathroom</option>
                        <option value="exterior">Exterior</option>
                    </select>
                    <label>
                        <input type="radio" name="hero_index" value="${index}">
                        Set as Hero
                    </label>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', preview);
        };
        reader.readAsDataURL(file);
    });
});

document.getElementById('imageUploadForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    
    try {
        const response = await fetch('/loft-studio/api/images/upload.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(`${result.uploaded.length} images uploaded successfully!`);
            location.reload();
        } else {
            alert('Upload failed: ' + (result.errors || []).join(', '));
        }
    } catch (error) {
        alert('Upload error: ' + error.message);
    }
});
```

### 5. Migration Script

**api/images/migrate.php**:
```php
<?php
require_once '../config/database.php';
require_once '../classes/PropertyImage.php';

// Get all properties with gallery images
$stmt = $conn->query("SELECT id FROM properties WHERE gallery IS NOT NULL AND gallery != '[]'");
$properties = $stmt->fetchAll(PDO::FETCH_ASSOC);

$imageManager = new PropertyImage($conn);
$results = [];

foreach ($properties as $property) {
    $result = $imageManager->migrateGalleryImages($property['id']);
    $results[] = [
        'property_id' => $property['id'],
        'result' => $result
    ];
}

echo json_encode([
    'success' => true,
    'migrated_properties' => count($results),
    'details' => $results
]);
?>
```

## Image Storage Structure

```
uploads/
└── properties/
    ├── 12345_1234567890-thumb.webp   (400px)
    ├── 12345_1234567890-md.webp      (1024px)
    ├── 12345_1234567890-full.webp    (1920px)
    ├── 67890_1234567891-thumb.webp
    ├── 67890_1234567891-md.webp
    └── 67890_1234567891-full.webp
```

## Usage Examples

### Upload Images
```javascript
const formData = new FormData();
formData.append('property_id', 16);
formData.append('images[]', file1);
formData.append('images[]', file2);
formData.append('categories[]', 'livingroom');
formData.append('categories[]', 'kitchen');
formData.append('hero_index', 0);

const response = await fetch('/api/images/upload.php', {
    method: 'POST',
    body: formData
});
```

### Get Property Images
```javascript
const response = await fetch('/api/images/list.php?property_id=16');
const data = await response.json();

// data.images structure:
{
    hero: { id, file_base, urls: {thumb, md, full}, category },
    categories: {
        livingroom: [...],
        kitchen: [...],
        bedroom1: [...]
    }
}
```

### Display Images
```html
<!-- Hero image -->
<img src="${data.images.hero.urls.md}" 
     srcset="${data.images.hero.urls.thumb} 400w,
             ${data.images.hero.urls.md} 1024w,
             ${data.images.hero.urls.full} 1920w"
     sizes="(max-width: 768px) 100vw, 50vw"
     loading="lazy">

<!-- Category images -->
<div class="livingroom-images">
    ${data.images.categories.livingroom.map(img => `
        <img src="${img.urls.thumb}" 
             data-full="${img.urls.full}"
             loading="lazy">
    `).join('')}
</div>
```

## Benefits

1. **Performance**:
   - WebP format (30-50% smaller than JPEG)
   - Multiple sizes for responsive images
   - Lazy loading support
   - Browser caching

2. **Organization**:
   - Images categorized by room/area
   - Hero image clearly marked
   - Order management within categories

3. **Storage**:
   - Efficient WebP compression
   - Only necessary sizes generated
   - Easy to add/remove sizes

4. **Flexibility**:
   - Easy to change hero image
   - Reorder images within categories
   - Delete individual images

## Database Queries

### Get hero image for property
```sql
SELECT file_base, category 
FROM property_images 
WHERE property_id = ? AND is_hero = 1;
```

### Get images by category
```sql
SELECT * FROM property_images 
WHERE property_id = ? AND category = 'livingroom' 
ORDER BY order_index;
```

### Count images per property
```sql
SELECT property_id, COUNT(*) as image_count 
FROM property_images 
GROUP BY property_id;
```

## Integration with Existing System

### Update Property Display
Replace old gallery usage:
```php
// Old
$gallery = json_decode($property['gallery'], true);

// New
$imageManager = new PropertyImage($conn);
$images = $imageManager->getPropertyImages($property['id']);
$heroImage = $images['hero']['urls']['md'];
$galleryImages = array_merge(...array_values($images['categories']));
```

### Update Property Cards
```php
// Use hero image or first image
$heroImage = $property['hero_image'] ?? 
             $images['hero']['urls']['thumb'] ?? 
             '/images/placeholder.jpg';
```

## Summary

This system provides:
- ✅ Modern WebP image format
- ✅ Multiple responsive sizes
- ✅ Organized categorization
- ✅ Hero image management
- ✅ Easy migration from old system
- ✅ Efficient storage and loading
- ✅ Admin-friendly upload interface

**Files Created**:
1. `database-updates.sql` - Database schema
2. `api/classes/PropertyImage.php` - Core image management class

**Files to Create**:
1. `api/images/upload.php` - Upload endpoint
2. `api/images/list.php` - List endpoint
3. `api/images/migrate.php` - Migration script
4. Admin upload modal HTML/JS

The foundation is complete and ready for the API endpoints and frontend integration!
