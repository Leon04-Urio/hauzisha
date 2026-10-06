# 🔍 Debug Images - Step by Step

## Current Status

Images are not showing because the migration created database entries but not the physical files.

## Quick Debug Steps

### Step 1: Test Image Paths
Open in browser: `http://localhost/loft-studio/test-images.html`

This will test:
- ✅ Direct image paths
- ✅ With /loft-studio prefix
- ✅ Full localhost URL
- ✅ Escaped slashes handling
- ✅ API response

### Step 2: Check Browser Console
1. Open your website
2. Press F12
3. Go to Console tab
4. Look for logs like:
```
Property 16: {hero_image: "...", gallery: "[...]"}
Using gallery image for property 16: http://localhost/loft-studio/uploads/...
```

### Step 3: Check Network Tab
1. Press F12
2. Go to Network tab
3. Filter by "Img"
4. Refresh page
5. Look for:
   - ❌ Red = 404 errors (image not found)
   - ✅ Green = 200 (image loaded)

## What Should Happen

### If Gallery Images Exist:
```javascript
Property loads
    ↓
hero_image = "/uploads/properties/xxx.jpg" (doesn't exist)
    ↓
Falls back to gallery[0] = "/uploads/690cd5fbc07be_test7.jpeg"
    ↓
Constructs URL: "http://localhost/loft-studio/uploads/690cd5fbc07be_test7.jpeg"
    ↓
Image loads ✅
```

### If Gallery is Empty:
```javascript
Property loads
    ↓
hero_image = null or doesn't exist
gallery = [] or null
    ↓
Uses fallback: "/loft-studio/images/gallery-2.jpg"
    ↓
Placeholder image loads ✅
```

## Common Issues

### Issue 1: Gallery is String, Not Array
**Symptom:** Console shows `gallery: "[\"\/uploads\/...\"]"`

**Fix:** Already handled - code parses JSON string

### Issue 2: Escaped Slashes
**Symptom:** Paths have `\/` instead of `/`

**Fix:** Already handled - `.replace(/\\/g, '')`

### Issue 3: Wrong Base URL
**Symptom:** Images try to load from wrong domain

**Fix:** Check if you're using correct localhost URL

### Issue 4: CORS Error
**Symptom:** Console shows CORS policy error

**Fix:** Images should be same-origin, shouldn't happen

## Manual Test

Open browser console and run:

```javascript
// Test 1: Fetch properties
fetch('http://localhost/loft-studio/api/index.php/properties')
  .then(res => res.json())
  .then(data => {
    console.log('Properties:', data.data.length);
    const prop = data.data[0];
    console.log('First property:', prop.name);
    console.log('Hero image:', prop.hero_image);
    console.log('Gallery:', prop.gallery);
    
    // Parse gallery
    if (prop.gallery) {
      const gallery = JSON.parse(prop.gallery);
      console.log('Gallery array:', gallery);
      console.log('First image:', gallery[0]);
      
      // Test image load
      const img = new Image();
      img.onload = () => console.log('✅ Image loaded!');
      img.onerror = () => console.log('❌ Image failed!');
      img.src = `http://localhost/loft-studio${gallery[0]}`;
    }
  });
```

## Expected Console Output

```
Property 16: {hero_image: "/uploads/properties/691d9d64cfb3b_1763548516-md.jpg", gallery: "[\"\/uploads\/690cd5fbc07be_test7.jpeg\",...]"}
Using gallery image for property 16: http://localhost/loft-studio/uploads/690cd5fbc07be_test7.jpeg
✅ Image loaded!
```

## If Images Still Don't Show

### Check 1: Do Files Exist?
```bash
ls uploads/690cd5fbc07be_test7.jpeg
```
Should show the file

### Check 2: Check Permissions
```bash
ls -la uploads/*.jpeg
```
Should show `-rw-r--r--` or similar

### Check 3: Check .htaccess
Make sure `.htaccess` doesn't block image access

### Check 4: Check Apache/Nginx Config
Make sure server serves static files from uploads/

## Quick Fix Options

### Option A: Use Absolute Paths (Current)
```javascript
imageUrl = `http://localhost/loft-studio${gallery[0]}`;
```

### Option B: Use Relative Paths
```javascript
imageUrl = gallery[0]; // Already starts with /uploads/
```

### Option C: Add Base Path
```javascript
const basePath = window.location.origin + '/loft-studio';
imageUrl = basePath + gallery[0];
```

## Test Each Property Type

### Active Properties (is_deleted = 0):
- Property ID 16: Rafiki Lane Homes
- Property ID 17: Karibu Meadows  
- Property ID 18: Umoja Ridge

### Gallery Paths:
```
/uploads/690cd5fbc07be_test7.jpeg
/uploads/690cd70a2822a_test8.png
/uploads/690cd7ab3cc8c_test9.jpeg
```

## Next Steps

1. **Open test-images.html** - See which path format works
2. **Check browser console** - Look for debug logs
3. **Check Network tab** - See actual requests
4. **Report back** - Tell me which test passed/failed

## If All Tests Fail

The issue might be:
1. **Apache not running** - Check if localhost works
2. **Wrong document root** - Check Apache config
3. **Files actually missing** - Check uploads folder
4. **Path mismatch** - Database has wrong paths

## Success Criteria

✅ test-images.html shows green checkmarks
✅ Browser console shows "Using gallery image..."
✅ Network tab shows 200 status for images
✅ Property cards display images
✅ No 404 errors

---

**Run test-images.html first and tell me the results!**
