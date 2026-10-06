# 🚨 FIX IMAGES - DO THIS NOW

## The Problem

Your database has paths to images that don't exist. That's why you see 404 errors.

## The Solution

Run this ONE command:

```bash
php api/fix-images-now.php
```

## What It Does

1. Clears all bad `hero_image` paths
2. Finds existing images in your `uploads/` folder
3. Updates all properties to use those existing images
4. Fixes empty galleries

## After Running

1. Refresh your website
2. Images should now display
3. No more 404 errors

## If It Says "No image files found"

That means your `uploads/` folder is empty. You need to:

1. Upload some images through the admin panel first
2. Or copy some images to the `uploads/` folder manually
3. Then run the script again

## Expected Output

```
=== FIXING ALL IMAGE ISSUES ===

Step 1: Clearing bad hero_image paths...
  ✓ Cleared 15 bad paths

Step 2: Found 50 files in uploads/

Step 3: Using placeholder: /uploads/68b1878aa170e__ (4).jpeg

Step 4: Fixing properties...
  ✓ Fixed: Rafiki Lane Homes
  ✓ Fixed: Karibu Meadows
  - OK: Umoja Ridge
  ...

=== SUMMARY ===
Fixed: 12 properties
Total: 15 properties

✅ DONE! Refresh your website now.
```

## That's It!

After running this script, your images will work.

---

**RUN NOW:** `php api/fix-images-now.php`
