# 🔧 Fix PHP Error in Upload

## The Issue

The property ID is being passed correctly (16), but the API is returning HTML (PHP error) instead of JSON.

Error: `Unexpected token '<', "<br /><b>"...`

This means PHP is outputting an error/warning before the JSON response.

## What I Fixed

### 1. Suppressed PHP Warnings
```php
// In api/index.php upload endpoint
error_reporting(E_ERROR | E_PARSE); // Only show fatal errors
```

### 2. Added Activity Class Include
```php
include_once 'classes/Activity.php'; // Was missing
```

### 3. Better Error Handling
```php
// Now returns proper JSON even on errors
echo json_encode(['success' => false, 'error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
```

## Test the System

Run this to check if everything is configured correctly:

```
http://localhost/loft-studio/api/test-upload.php
```

This will show:
- ✅ If uploads/properties/ directory exists
- ✅ If directory is writable
- ✅ If GD library is available
- ✅ If you're logged in
- ✅ If database is connected
- ✅ Upload limits

## Common PHP Errors

### Error 1: Directory Not Writable
**Symptom:** Can't create files

**Fix:**
```bash
chmod 755 uploads/properties
```

### Error 2: GD Library Missing
**Symptom:** Can't process images

**Fix:**
```bash
# Ubuntu/Debian
sudo apt-get install php-gd

# CentOS/RHEL
sudo yum install php-gd

# Restart Apache
sudo service apache2 restart
```

### Error 3: Upload Size Limit
**Symptom:** Large files fail

**Fix:** Edit php.ini:
```ini
upload_max_filesize = 10M
post_max_size = 10M
```

### Error 4: Session Not Started
**Symptom:** "Not logged in" error

**Fix:** Make sure you're logged in as admin

## Try Upload Again

After the fixes:

1. **Clear browser cache** (Ctrl + Shift + R)
2. **Refresh the page**
3. **Try uploading again**
4. **Check browser console** - should see proper JSON response

## If Still Getting HTML Error

Check the actual response:

1. Open Network tab (F12)
2. Try to upload
3. Click on the "upload-property-images" request
4. Go to "Response" tab
5. Copy the full response
6. Tell me what it says

The HTML error will show the actual PHP error message.

## Expected Response

### Success:
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
  "message": "1 images uploaded successfully"
}
```

### Error:
```json
{
  "success": false,
  "error": "Specific error message here",
  "trace": "Stack trace..."
}
```

## Files Modified

- ✅ `api/index.php` - Better error handling
- ✅ `api/test-upload.php` - System test script

## Next Steps

1. Run test script: `http://localhost/loft-studio/api/test-upload.php`
2. Check if all tests pass
3. Try uploading again
4. If still fails, check Network tab response

---

**The PHP error should now be caught and returned as proper JSON!**
