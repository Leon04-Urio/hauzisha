# Quick Guide - Add Heart Animation to Pages

## Files Created ✅

1. ✅ `css/heart-animation.css` - Animation styles
2. ✅ `js/heart-animation.js` - Animation logic
3. ✅ `js/favorites-handler.js` - Updated with animation trigger

## How to Add to Your Pages

### Step 1: Add CSS
Add this line in the `<head>` section of your HTML pages:

```html
<link rel="stylesheet" href="css/heart-animation.css">
```

### Step 2: Add JavaScript
Add these lines before the closing `</body>` tag (after Font Awesome):

```html
<script src="js/heart-animation.js"></script>
<script src="js/favorites-handler.js"></script>
```

### Complete Example

```html
<!DOCTYPE html>
<html>
<head>
    <!-- Other CSS files -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link rel="stylesheet" href="css/heart-animation.css"> <!-- ADD THIS -->
</head>
<body>
    
    <!-- Your content -->
    
    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="js/heart-animation.js"></script> <!-- ADD THIS -->
    <script src="js/favorites-handler.js"></script> <!-- Already exists -->
</body>
</html>
```

## Pages to Update

Add the CSS and JS to these pages:

- [ ] `index.php`
- [ ] `home.php`
- [ ] `property-details.php`
- [ ] `agency-properties.php`
- [ ] Any other page with property cards

## That's It!

Once you add these two lines to your pages, the animation will work automatically when users click the heart icon to add properties to favorites.

## Test It

1. Go to any page with property cards
2. Click an outline heart icon
3. ✨ Watch the gold hearts float up!
4. Click the gold heart again
5. No animation (only plays when adding)

## What You'll See

When a user adds a property to favorites:
- 3 gold hearts float upward
- Each heart follows a slightly different path
- Hearts fade out as they rise
- Main heart icon pulses
- Toast message shows "Added to favorites"

When a user removes from favorites:
- No animation
- Heart turns outline
- Toast message shows "Removed from favorites"

## Customization

Want to change something? Edit these files:
- **Colors/sizes**: `css/heart-animation.css`
- **Number of hearts**: `js/heart-animation.js` (line with `count = 3`)
- **Animation speed**: `css/heart-animation.css` (animation-duration)

## Need Help?

See the full guide: `read/HEART_ANIMATION_GUIDE.md`
