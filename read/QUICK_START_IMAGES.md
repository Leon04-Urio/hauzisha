# Quick Start - Property Images

## 🚀 How to Add Images to Properties

### Step 1: Create or Find Property
- Go to **Control Room → Properties**
- Either create a new property OR find existing one

### Step 2: Open Edit Modal
- Click the **eye icon** (View/Edit) on the property
- Edit modal opens

### Step 3: Add Images
- Scroll to **"Property Images"** section
- Click **"Add More Images"** button
- Upload modal opens

### Step 4: Upload
- Click **"Select Images"** and choose files
- For each image:
  - Select **category** (Living Room, Kitchen, etc.)
  - Optionally mark one as **"Hero"** (main image)
- Click **"Upload Images"**

### Step 5: Done!
- Images auto-convert to WebP
- Three sizes generated automatically
- Preview updates in real-time
- No page reload needed

## 🗑️ How to Delete Images

1. Open property edit modal
2. Find image you want to delete
3. Click red **"Delete"** button
4. Confirm deletion
5. Image removed immediately

## 📋 Image Categories

- **Other** - Miscellaneous
- **Living Room** - Main living area
- **Kitchen** - Kitchen area
- **Balcony** - Outdoor balcony
- **Bedroom 1** - First bedroom
- **Bedroom 2** - Second bedroom
- **Bathroom** - Bathroom
- **Exterior** - Building exterior

## 🎯 Hero Image

The **Hero Image** is the main display image for the property:
- Shows first in galleries
- Used in property cards
- Featured in listings
- Only ONE hero per property

## ✨ What Happens Automatically

✅ WebP conversion (smaller file size)
✅ Three sizes generated (400px, 1024px, 1920px)
✅ Organized by category
✅ Optimized for web
✅ Responsive loading

## 📁 Where Images Are Stored

```
uploads/properties/{property_id}/{category}/
```

Example:
```
uploads/properties/123/livingroom/image_thumb.webp
uploads/properties/123/livingroom/image_md.webp
uploads/properties/123/livingroom/image_full.webp
```

## 🎨 Badge Colors in Modal

- 🟡 **Yellow** = Hero image
- 🔵 **Blue** = Interior images
- 🟢 **Green** = Exterior images

## ⚠️ Important Notes

1. **Save property first** before adding images
2. **Supported formats**: JPG, PNG, WebP
3. **Multiple uploads**: Select multiple files at once
4. **No duplicates**: System prevents duplicate uploads
5. **Auto-optimization**: All images optimized automatically

## 🔧 Troubleshooting

**Images not uploading?**
- Check file format (JPG, PNG, WebP only)
- Ensure property is saved first
- Check file size (max 10MB per image)

**Images not showing?**
- Refresh the edit modal
- Check browser console for errors
- Verify uploads folder permissions

**Can't delete image?**
- Ensure you have admin permissions
- Check if image is in use elsewhere

## 📚 More Info

- Full docs: `read/IMAGE_MANAGEMENT_SYSTEM.md`
- API reference: `read/IMAGE_API_REFERENCE.md`
- Integration details: `read/PROPERTY_MODAL_IMAGE_INTEGRATION.md`

---

**That's it! Start uploading beautiful property images! 📸**
