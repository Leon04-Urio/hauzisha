# ✅ Image Upload/Delete Fix

## Issues Fixed

### 1. Delete Image - "ID is required" Error
**Problem:** When clicking delete on an image, got "ID is required" error

**Root Cause:** 
- API endpoint wasn't properly validating the image ID
- Missing Activity class include
- Poor error messages

**Fix Applied:**
- ✅ Added proper validation for image ID
- ✅ Added Activity class include
- ✅ Improved error messages
- ✅ Better error handling

### 2. Upload Image - Property ID Not Set
**Problem:** When uploading images, property ID wasn't being passed correctly

**Root Cause:**
- `openImageUploadForEdit()` wasn't setting the form field
- Modal opened without property ID in form

**Fix Applied:**
- ✅ Set `uploadPropertyId` field when opening modal
- ✅ Use `window.currentPropertyIdForImages` as fallback
- ✅ Call `openImageUploadModal()` function properly

## Changes Made

### api/index.php
```php
// DELETE /property-images/{id}
- Added image ID validation
- Added Activity class include
- Improved error messages
- Better exception handling
```

### control-room/js/properties.js
```javascript
// openImageUploadForEdit()
- Sets uploadPropertyId form field
- Calls openImageUploadModal() if available
- Ensures property ID is always set
```

## How It Works Now

### Delete Image Flow:
```
User clicks Delete button
    ↓
deletePropertyImage(imageId, propertyId) called
    ↓
DELETE /api/index.php/property-images/{imageId}
    ↓
Validates: imageId exists and is numeric
    ↓
Validates: User is logged in
    ↓
Deletes image from database and files
    ↓
Logs activity
    ↓
Returns success
    ↓
Reloads property images
```

### Upload Image Flow:
```
User clicks "Add More Images"
    ↓
openImageUploadForEdit() called
    ↓
Gets propertyId from editPropertyForm.dataset.id
    ↓
Sets window.currentPropertyIdForImages = propertyId
    ↓
Sets uploadPropertyId form field = propertyId
    ↓
Opens upload modal
    ↓
User selects images and categories
    ↓
Form submits with property_id
    ↓
POST /api/index.php/upload-property-images
    ↓
Validates: property_id exists
    ↓
Validates: images provided
    ↓
Uploads and processes images
    ↓
Returns success with uploaded images
    ↓
Reloads property images in modal
```

## Testing

### Test Delete:
1. Go to Control Room → Properties
2. Click Edit (eye icon) on any property
3. Click "Add More Images" (if no images)
4. Upload some test images
5. Click Delete on an image
6. Should delete successfully ✅

### Test Upload:
1. Go to Control Room → Properties
2. Click Edit (eye icon) on any property
3. Click "Add More Images"
4. Select image files
5. Choose categories
6. Mark one as hero (optional)
7. Click "Upload Images"
8. Should upload successfully ✅

## Error Messages

### Before:
- "ID is required" (unclear)
- Generic errors

### After:
- "Image ID is required" (clear)
- "Authentication required - Please log in"
- "Property ID is required"
- "No images provided"
- Specific exception messages

## API Endpoints

### DELETE /property-images/{id}
**Request:**
```
DELETE /api/index.php/property-images/123
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Image deleted successfully"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Image ID is required",
  "message": "Image ID is required"
}
```

### POST /upload-property-images
**Request:**
```
POST /api/index.php/upload-property-images
Content-Type: multipart/form-data

property_id: 16
images[]: file1.jpg
images[]: file2.jpg
categories[]: livingroom
categories[]: kitchen
hero_index: 0
```

**Response (Success):**
```json
{
  "success": true,
  "uploaded": [
    {
      "id": 100,
      "file_base": "abc123_1234567890",
      "category": "livingroom",
      "is_hero": 1,
      "files": {
        "thumb": "abc123_1234567890-thumb.jpg",
        "md": "abc123_1234567890-md.jpg",
        "full": "abc123_1234567890-full.jpg"
      }
    }
  ],
  "errors": [],
  "message": "2 images uploaded successfully"
}
```

## Troubleshooting

### Still Getting "ID is required"?

**Check 1: Is user logged in?**
- Must be logged in as admin
- Check session in browser dev tools

**Check 2: Is image ID being passed?**
- Open browser console
- Check network tab
- Look at DELETE request URL
- Should be: `/api/index.php/property-images/123`

**Check 3: Check API response**
- Look at response in Network tab
- Should show specific error message

### Upload Not Working?

**Check 1: Is property ID set?**
```javascript
// In browser console
console.log(document.getElementById('uploadPropertyId').value);
```
Should show a number

**Check 2: Are files selected?**
- Check file input has files
- Check categories are set

**Check 3: Check API response**
- Network tab → upload-property-images
- Look at response for specific error

## Files Modified

- ✅ `api/index.php` - Improved DELETE endpoint
- ✅ `control-room/js/properties.js` - Fixed openImageUploadForEdit

## Status

✅ **FIXED** - Upload and delete should now work correctly!

---

**Test it now and let me know if you still have issues!**
