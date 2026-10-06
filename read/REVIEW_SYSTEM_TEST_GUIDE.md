# Review System Testing Guide

## Quick Test Steps

### 1. Database Setup
Run this SQL to add the rating column and create the review_likes table:

```sql
-- Add rating column to reviews table
ALTER TABLE reviews ADD COLUMN rating INT DEFAULT NULL AFTER review;

-- Create review_likes table
CREATE TABLE IF NOT EXISTS review_likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  review_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_like (review_id, user_id),
  FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Note**: The Review.php class will automatically add these if they don't exist, but running the SQL manually ensures everything is set up correctly.

### 2. Test Review Submission

#### Test Case 1: Submit Review with Text Only
1. Go to any property details page
2. Log in if not already logged in
3. Type a review in the comment box
4. Click "Post" without selecting stars
5. ✅ Review should be submitted successfully
6. ✅ Review should appear in the list immediately

#### Test Case 2: Submit Review with Rating Only
1. Go to any property details page
2. Start typing in the comment box (stars will appear)
3. Select a star rating (1-5 stars)
4. Delete all text from the comment box
5. Click "Post"
6. ✅ Review should be submitted with rating only
7. ✅ Property rating should update

#### Test Case 3: Submit Review with Both Text and Rating
1. Go to any property details page
2. Type a review in the comment box
3. Select a star rating
4. Click "Post"
5. ✅ Review should be submitted with both text and rating
6. ✅ Review should display with stars
7. ✅ Property rating should update

#### Test Case 4: Unauthenticated User
1. Log out
2. Go to any property details page
3. Try to submit a review
4. ✅ Login modal should appear
5. ✅ No review should be submitted

### 3. Test Like Functionality

#### Test Case 5: Like a Review
1. Log in
2. Go to any property with reviews
3. Click the heart icon on any review
4. ✅ Heart should turn red (filled)
5. ✅ Like count should increase by 1
6. ✅ Refresh page - like should persist

#### Test Case 6: Unlike a Review
1. Click the heart icon on a liked review
2. ✅ Heart should turn gray (outline)
3. ✅ Like count should decrease by 1
4. ✅ Refresh page - unlike should persist

#### Test Case 7: Unauthenticated Like
1. Log out
2. Try to click heart icon on a review
3. ✅ Login modal should appear
4. ✅ Like should not be registered

### 4. Test Review Display

#### Test Case 8: Review List Display
1. Go to a property with multiple reviews
2. ✅ Reviews should show user name and profile picture
3. ✅ Reviews with ratings should show stars
4. ✅ Reviews without ratings should not show stars
5. ✅ Like count should be displayed
6. ✅ Date should be displayed

#### Test Case 9: Pagination
1. Go to a property with more than 5 reviews
2. ✅ Only 5 reviews should show initially
3. Click "See more reviews"
4. ✅ 2 more reviews should load
5. ✅ Button should disappear when all reviews are loaded

### 5. Test Property Rating Update

#### Test Case 10: Average Rating Calculation
1. Submit multiple reviews with different ratings to the same property
2. Check the property rating in the database:
   ```sql
   SELECT id, name, rating FROM properties WHERE id = [property_id];
   ```
3. ✅ Rating should be the average of all ratings
4. ✅ Only non-deleted reviews should be counted

### 6. Test Data Integrity

#### Test Case 11: Existing Reviews
1. Check existing reviews in the database:
   ```sql
   SELECT * FROM reviews WHERE rating IS NULL;
   ```
2. ✅ Old reviews should still exist
3. ✅ Old reviews should have rating = NULL
4. ✅ Old reviews should display correctly on the page

#### Test Case 12: Review Count
1. Submit a new review
2. ✅ Review count in the header should update
3. ✅ Count should match the number of reviews displayed

## API Endpoint Testing

### Using cURL or Postman

#### Submit Review
```bash
curl -X POST http://localhost/loft-studio/api/index.php/submit-review \
  -H "Content-Type: application/json" \
  -d '{
    "property_id": 16,
    "review": "Great property!",
    "rating": 5
  }'
```

#### Get Property Reviews
```bash
curl http://localhost/loft-studio/api/index.php/get-property-reviews?property_id=16
```

#### Like Review
```bash
curl -X POST http://localhost/loft-studio/api/index.php/like-review \
  -H "Content-Type: application/json" \
  -d '{
    "review_id": 1
  }'
```

#### Get User Liked Reviews
```bash
curl http://localhost/loft-studio/api/index.php/get-user-liked-reviews?property_id=16
```

## Expected Database State

### reviews table
```
id | user_id | property_id | review | rating | likes | created_at | is_deleted
---|---------|-------------|--------|--------|-------|------------|------------
1  | 9       | 16          | "..."  | NULL   | 2     | ...        | 0
2  | 8       | 19          | "..."  | NULL   | 0     | ...        | 0
3  | 8       | 16          | "..."  | NULL   | 0     | ...        | 0
4  | 9       | 16          | "..."  | 5      | 0     | ...        | 0  (new)
```

### review_likes table
```
id | review_id | user_id | created_at
---|-----------|---------|------------
1  | 1         | 9       | ...
2  | 1         | 8       | ...
```

## Common Issues & Solutions

### Issue 1: Rating column doesn't exist
**Solution**: Run the ALTER TABLE command or let the Review.php class create it automatically on first use.

### Issue 2: Reviews not showing
**Solution**: Check that `is_deleted = 0` in the reviews table.

### Issue 3: Like count not updating
**Solution**: Check that the review_likes table exists and has the correct foreign keys.

### Issue 4: Property rating not updating
**Solution**: Verify that the properties table has a `rating` column (DECIMAL(2,1)).

### Issue 5: Duplicate likes
**Solution**: The UNIQUE constraint on (review_id, user_id) prevents this. If it's happening, check that the constraint exists.

## Success Criteria

✅ All test cases pass
✅ No console errors in browser
✅ No PHP errors in server logs
✅ Database integrity maintained
✅ Existing data preserved
✅ UI updates in real-time
✅ Login prompts work correctly
✅ Pagination works smoothly

## Performance Check

- Review submission: < 500ms
- Review loading: < 1s for 50 reviews
- Like/unlike: < 300ms
- Page load with reviews: < 2s

## Browser Compatibility

Test in:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

All features should work consistently across browsers.
