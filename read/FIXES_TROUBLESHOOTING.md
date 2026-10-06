# Troubleshooting Guide - Heart Animation & Contact Icons

## Issue 1: Heart Animation Not Working

### Problem
When clicking the heart icon to add to favorites, the icon changes and toast appears, but no floating hearts animation.

### Debugging Steps

1. **Check if heart-animation.js is loaded**
   - Open browser console (F12)
   - Look for: `Heart animation script loaded`
   - If not present, the file isn't loading

2. **Check if animation function exists**
   - In console, type: `typeof window.triggerHeartAnimation`
   - Should return: `"function"`
   - If `"undefined"`, the script didn't load properly

3. **Check console logs when clicking heart**
   - Click a heart icon
   - Look for: `Triggering heart animation`
   - Or: `Heart animation not available`

### Solutions

#### Solution 1: Add Scripts to HTML
Make sure these are in your HTML (in order):

```html
<!-- In <head> -->
<link rel="stylesheet" href="css/heart-animation.css">

<!-- Before </body>, after Font Awesome -->
<script src="js/heart-animation.js"></script>
<script src="js/favorites-handler.js"></script>
```

#### Solution 2: Check File Paths
Verify files exist:
- `css/heart-animation.css`
- `js/heart-animation.js`

#### Solution 3: Clear Browser Cache
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Or clear cache in browser settings

#### Solution 4: Check Console for Errors
Look for JavaScript errors that might prevent script loading:
```
Failed to load resource: css/heart-animation.css
Uncaught SyntaxError: ...
```

### Expected Console Output

When working correctly:
```
Heart animation script loaded
Toggle favorite response: {success: true, is_favorite: true, ...}
Triggering heart animation
```

## Issue 2: WhatsApp/Phone Icons Not Working

### Problem
Clicking WhatsApp or phone icons on property details page does nothing.

### Debugging Steps

1. **Check console logs**
   - Go to property details page
   - Open console (F12)
   - Look for: `Contact buttons: {...}`
   - Look for: `Agent contact info: {...}`

2. **Click the icons**
   - Click WhatsApp icon
   - Look for: `Agent icon clicked: fa-brands fa-whatsapp`
   - Look for: `Opening WhatsApp: 254...`

3. **Check agent data**
   - In console output, verify:
     - `phoneNumber` is not empty
     - `whatsappNumber` is not empty

### Solutions

#### Solution 1: Verify Agent Has Contact Info
Check database:
```sql
SELECT id, firstname, lastname, phone, whatsapp_no 
FROM agents 
WHERE id = [agent_id];
```

Make sure `phone` and `whatsapp_no` are not NULL or empty.

#### Solution 2: Check Property Has Agent
```sql
SELECT p.id, p.name, p.agent_id, a.phone, a.whatsapp_no
FROM properties p
LEFT JOIN agents a ON p.agent_id = a.id
WHERE p.id = [property_id];
```

#### Solution 3: Check Element Structure
In browser console:
```javascript
document.querySelector('.agent-icons')
document.querySelector('.agent-icons .fa-whatsapp')
document.querySelector('.agent-icons .fa-phone')
```

All should return elements, not `null`.

#### Solution 4: Check for Click Blocking
Some parent element might be preventing clicks. The updated code uses event delegation to avoid this.

### Expected Behavior

**WhatsApp Icon:**
1. Click icon
2. Console shows: `Opening WhatsApp: 254...`
3. New tab opens with WhatsApp Web
4. Message pre-filled: "Hi [Agent], I'm interested in [Property]."

**Phone Icon:**
1. Click icon
2. Console shows: `Phone click confirmed: true/false`
3. Confirmation dialog appears: "Call [Agent] at [Number]?"
4. If confirmed, phone dialer opens (mobile) or Skype/etc (desktop)

### Common Issues

#### Issue: WhatsApp opens but no message
**Cause**: Number format incorrect
**Fix**: Number should be in format `254XXXXXXXXX` (no leading 0)

#### Issue: Phone number has leading 0
**Cause**: Database stores as `0712345678`
**Fix**: Code automatically converts `0` to `254`

#### Issue: Icons not clickable
**Cause**: CSS `pointer-events: none` or z-index issue
**Fix**: Check CSS for `.agent-icons` and child elements

#### Issue: Click works but nothing happens
**Cause**: Empty phone/WhatsApp number
**Fix**: Add contact info to agent in database

## Testing Checklist

### Heart Animation
- [ ] Open browser console
- [ ] See "Heart animation script loaded"
- [ ] Click outline heart on property card
- [ ] See "Triggering heart animation" in console
- [ ] See 3 gold hearts float up
- [ ] Main heart pulses
- [ ] Toast shows "Added to favorites"

### WhatsApp Icon
- [ ] Go to property details page
- [ ] See console logs for contact buttons
- [ ] Click WhatsApp icon
- [ ] See "Agent icon clicked" in console
- [ ] See "Opening WhatsApp" in console
- [ ] WhatsApp Web opens in new tab
- [ ] Message is pre-filled

### Phone Icon
- [ ] Click phone icon
- [ ] See "Agent icon clicked" in console
- [ ] Confirmation dialog appears
- [ ] Click OK
- [ ] Phone dialer opens (or Skype on desktop)

## Quick Fixes

### Heart Animation Not Showing
```javascript
// Test manually in console
const event = new MouseEvent('click', { clientX: 100, clientY: 200 });
const icon = document.querySelector('.fa-heart');
window.triggerHeartAnimation(event, icon);
```

### WhatsApp Not Opening
```javascript
// Test manually in console
const number = '254712345678'; // Replace with actual number
const message = encodeURIComponent('Test message');
window.open(`https://wa.me/${number}?text=${message}`, '_blank');
```

### Phone Not Working
```javascript
// Test manually in console
window.location.href = 'tel:254712345678'; // Replace with actual number
```

## Still Not Working?

1. **Check browser console for errors**
2. **Verify all files are loaded** (Network tab in DevTools)
3. **Clear cache and hard refresh**
4. **Try in incognito/private mode**
5. **Test in different browser**

## Contact Info Format

### Phone Numbers
- **Stored in DB**: `0712345678` or `254712345678`
- **Used in code**: `254712345678` (leading 0 converted to 254)
- **For tel: link**: `tel:254712345678`

### WhatsApp Numbers
- **Stored in DB**: `0712345678` or `254712345678`
- **Used in code**: `254712345678` (leading 0 converted to 254)
- **For WhatsApp**: `https://wa.me/254712345678?text=...`

## Summary

Both issues should now be fixed with:
1. **Heart animation**: Added debug logs to identify loading issues
2. **Contact icons**: Changed to event delegation to avoid click blocking

Check the console logs to see exactly what's happening and where the issue is!
