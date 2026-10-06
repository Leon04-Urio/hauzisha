# Debug Guide - Like Review Error

## What I've Fixed

### 1. Better Error Handling in Review.php
- Added try-catch wrapper around entire `likeReview()` method
- Added validation for review existence
- Added input validation for reviewId and userId
- Returns proper error messages instead of throwing exceptions
- Logs errors to PHP error log

### 2. Better Error Reporting in JavaScript
- Added response status check
- Added console logging for debugging
- Shows actual error message from server
- Better error message handling

## How to Debug

### Step 1: Open Browser Console
1. Open the property details page
2. Press F12 to open Developer Tools
3. Go to the "Console" tab
4. Try to like a review
5. Look for these messages:
   - `Like response: {...}` - Shows the server response
   - Any error messages in red

### Step 2: Check Network Tab
1. In Developer Tools, go to "Network" tab
2. Try to like a review
3. Find the request to `like-review`
4. Click on it and check:
   - **Status**: Should be 200 (if not, note the status code)
   - **Response**: Shows what the server returned
   - **Preview**: Shows formatted JSON response

### Step 3: Check PHP Error Log
Look for errors in your PHP error log. The location depends on your setup:
- XAMPP: `xampp/apache/logs/error.log`
- WAMP: `wamp/logs/php_error.log`
- Linux: `/var/log/apache2/error.log` or `/var/log/php-fpm/error.log`

Look for lines starting with: `Like review error:`

## Common Issues & Solutions

### Issue 1: Review Not Found
**Error**: "Review not found"
**Cause**: The review ID doesn't exist or is soft-deleted
**Solution**: 
```sql
-- Check if review exists
SELECT * FROM reviews WHERE id = [review_id];

-- Check if it's deleted
SELECT * FROM reviews WHERE id = [review_id] AND is_deleted = 0;
```

### Issue 2: Table Creation Failed
**Error**: SQL syntax error or table creation error
**Cause**: Database permissions or existing table with wrong structure
**Solution**:
```sql
-- Manually drop and recreate the table
DROP TABLE IF EXISTS review_likes;

CREATE TABLE review_likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  review_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_like (review_id, user_id),
  FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Issue 3: Session Not Set
**Error**: "You must be logged in"
**Cause**: Session not properly initialized
**Solution**: Check that you're logged in and session is active
```javascript
// In browser console
console.log(document.body.dataset.loggedIn); // Should be "true"
```

### Issue 4: Invalid Review/User ID
**Error**: "Invalid review or user ID"
**Cause**: Non-numeric IDs being passed
**Solution**: Check the review ID in the HTML
```javascript
// In browser console
document.querySelectorAll('.like-button').forEach(btn => {
    console.log('Review ID:', btn.dataset.reviewId);
});
```

### Issue 5: Foreign Key Constraint
**Error**: "Cannot add or update a child row"
**Cause**: review_likes table still has wrong foreign key
**Solution**: The code should auto-fix this, but if not:
```sql
-- Check current foreign keys
SHOW CREATE TABLE review_likes;

-- If it shows property_reviews, drop and recreate
DROP TABLE review_likes;
-- Then run the CREATE TABLE from Issue 2
```

## What to Look For

### In Browser Console
```javascript
// You should see:
Like response: {
  success: true,
  liked: true,
  likes: 1,
  message: "Review liked"
}

// If you see success: false, check the error field:
Like response: {
  success: false,
  error: "Actual error message here",
  message: "Actual error message here"
}
```

### In Network Tab Response
```json
{
  "success": true,
  "liked": true,
  "likes": 1,
  "message": "Review liked"
}
```

### In PHP Error Log
```
[timestamp] Like review error: Review not found.
[timestamp] Like review error: Invalid review or user ID.
```

## Testing Steps

1. **Clear browser cache** and reload the page
2. **Check you're logged in**: Look for user menu/profile icon
3. **Try to like a review**: Click the heart icon
4. **Check console**: Look for the "Like response" log
5. **Check network**: Look at the actual server response
6. **Check PHP logs**: Look for any server-side errors

## Quick Test Script

Run this in browser console to test the API directly:

```javascript
// Test like review API
fetch('/loft-studio/api/index.php/like-review', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ review_id: 1 }) // Change to actual review ID
})
.then(r => r.json())
.then(data => console.log('API Response:', data))
.catch(err => console.error('API Error:', err));
```

## Expected Behavior

### First Like
- Heart icon turns red (filled)
- Like count increases by 1
- Console shows: `liked: true`
- Toast shows: "Review liked"

### Unlike
- Heart icon turns gray (outline)
- Like count decreases by 1
- Console shows: `liked: false`
- Toast shows: "Review unliked"

## Next Steps

1. Try liking a review again
2. Check the browser console for the actual error message
3. Share the error message you see in:
   - Browser console
   - Network tab response
   - PHP error log

The improved error handling will now show you exactly what's going wrong! 🔍
