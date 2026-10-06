# Quick Start - Favorites System

## 🚀 It Just Works!

The favorites system is now fully functional across all pages. No setup needed!

## How to Use

### For Users
1. **Click the heart icon** on any property
2. **Outline → Gold**: Added to favorites
3. **Gold → Outline**: Removed from favorites
4. **Not logged in?** Login modal appears automatically

### For Developers

#### Add Favorite Icon to Property Card
```html
<span class="favorite-icon" data-property-id="<?= $property['id'] ?>">
    <i class="far fa-heart"></i>
</span>
```

That's it! The centralized handler takes care of everything.

#### Include Required Scripts
```html
<script src="js/favorites-handler.js"></script>
```

## API Quick Reference

### Toggle Favorite (Recommended)
```javascript
fetch('/loft-studio/api/index.php/toggle-favorite-property', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ property_id: 16 })
})
.then(r => r.json())
.then(data => {
    console.log(data.is_favorite); // true or false
});
```

### Get Favorite IDs
```javascript
fetch('/loft-studio/api/index.php/get-favorite-ids')
.then(r => r.json())
.then(data => {
    console.log(data.favorite_ids); // [16, 17, 19]
});
```

## Visual States

| State | Icon | Color | Class |
|-------|------|-------|-------|
| Not Favorited | ♡ | Default | `far fa-heart` |
| Favorited | ♥ | Gold (#ffd700) | `fas fa-heart` |

## Features

✅ **Auto-sync** - All hearts for same property update together
✅ **Persistent** - State saved in database
✅ **Fast** - Instant UI updates
✅ **Universal** - Works on all pages
✅ **Smart** - Login modal for guests

## Common Tasks

### Check if Property is Favorited
```javascript
const isFavorited = await checkFavoriteStatus(propertyId);
```

### Manually Update Icons
```javascript
await updateFavoriteIcons();
```

### Toggle Favorite Programmatically
```javascript
const heartIcon = document.querySelector(`[data-property-id="${propertyId}"] i`);
await toggleFavorite(propertyId, heartIcon);
```

## Troubleshooting

### Hearts not gold after page load?
- Check browser console for errors
- Verify `favorites-handler.js` is loaded
- Ensure user is logged in

### Click not working?
- Check `data-property-id` attribute exists
- Verify icon has `fa-heart` class
- Check browser console for errors

### Database not updating?
- Check PHP error logs
- Verify `favorites_properties` table exists
- Ensure foreign keys are set up

## That's It!

The system handles everything automatically:
- Login checks
- Database updates
- UI synchronization
- Toast messages
- Error handling

Just add the HTML and it works! 🎉
