# API Routing Updates for api/index.php

## Add these routes to api/index.php

### Notification Routes

```php
// Get unread notification count
if ($requestMethod === 'GET' && strpos($requestUri, '/notifications/unread-count') !== false) {
    header('Content-Type: application/json');
    try {
        $notification = new Notification($conn);
        $count = $notification->getUnreadCount();
        echo json_encode(['success' => true, 'count' => $count]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}

// Mark notification as read
if ($requestMethod === 'POST' && strpos($requestUri, '/notifications/mark-read') !== false) {
    header('Content-Type: application/json');
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        $notificationId = $input['notification_id'] ?? null;
        
        if (!$notificationId) {
            throw new Exception('Notification ID required');
        }
        
        $notification = new Notification($conn);
        $result = $notification->markAsRead($notificationId);
        echo json_encode($result);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}

// Get user notifications
if ($requestMethod === 'GET' && strpos($requestUri, '/notifications') !== false) {
    header('Content-Type: application/json');
    try {
        $notification = new Notification($conn);
        $result = $notification->getUserNotifications();
        echo json_encode($result);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}
```

### Booking Routes

```php
// Cancel booking
if ($requestMethod === 'POST' && strpos($requestUri, '/bookings/cancel') !== false) {
    header('Content-Type: application/json');
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        $bookingId = $input['booking_id'] ?? null;
        
        if (!$bookingId) {
            throw new Exception('Booking ID required');
        }
        
        $booking = new Booking($conn);
        $result = $booking->cancelBooking($bookingId);
        echo json_encode($result);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}
```

### Property Routes

```php
// Get similar properties
if ($requestMethod === 'GET' && strpos($requestUri, '/properties/similar') !== false) {
    header('Content-Type: application/json');
    try {
        $propertyId = $_GET['property_id'] ?? null;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 6;
        
        if (!$propertyId) {
            throw new Exception('Property ID required');
        }
        
        $property = new Property($conn);
        $result = $property->getSimilarProperties($propertyId, $limit);
        echo json_encode(['success' => true, 'properties' => $result]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}
```

### Review Routes

```php
// Get property reviews
if ($requestMethod === 'GET' && preg_match('/\/properties\/(\d+)\/reviews/', $requestUri, $matches)) {
    header('Content-Type: application/json');
    try {
        $propertyId = $matches[1];
        $review = new Review($conn);
        $result = $review->getReviewsByProperty($propertyId);
        echo json_encode($result);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}

// Submit review
if ($requestMethod === 'POST' && strpos($requestUri, '/reviews/submit') !== false) {
    header('Content-Type: application/json');
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        $propertyId = $input['property_id'] ?? null;
        $reviewText = $input['review'] ?? '';
        $rating = $input['rating'] ?? null;
        
        if (!$propertyId) {
            throw new Exception('Property ID required');
        }
        
        $review = new Review($conn);
        $result = $review->submitReview($propertyId, $reviewText, $rating);
        echo json_encode($result);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}
```

### User Profile Routes

```php
// Get user profile
if ($requestMethod === 'GET' && strpos($requestUri, '/user/profile') !== false) {
    header('Content-Type: application/json');
    try {
        $user = new User($conn);
        $result = $user->getUserProfile();
        echo json_encode($result);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}

// Update user profile
if ($requestMethod === 'POST' && strpos($requestUri, '/user/update-profile') !== false) {
    header('Content-Type: application/json');
    try {
        $user = new User($conn);
        $result = $user->updateProfile($_POST, $_FILES);
        echo json_encode($result);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}

// Change password
if ($requestMethod === 'POST' && strpos($requestUri, '/user/change-password') !== false) {
    header('Content-Type: application/json');
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        $user = new User($conn);
        $result = $user->changePassword($input['current_password'], $input['new_password']);
        echo json_encode($result);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}

// Check session
if ($requestMethod === 'GET' && strpos($requestUri, '/user/check-session') !== false) {
    header('Content-Type: application/json');
    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }
    echo json_encode([
        'logged_in' => isset($_SESSION['user_id']),
        'user_id' => $_SESSION['user_id'] ?? null
    ]);
    exit;
}
```

## Update Frontend API Calls

### Change these paths:

**From:** `/loft-studio/api/get-unread-count.php`
**To:** `/loft-studio/api/index.php/get-unread-count` (✅ COMPLETED - Uses Notification::getUnreadCount() method)

**From:** `/loft-studio/api/mark-notification-read.php`
**To:** `/loft-studio/api/index.php/mark-notification-read` (✅ COMPLETED - Uses Notification::markAsRead() method)

**From:** `/loft-studio/api/get-notifications.php`
**To:** `/loft-studio/api/index.php/get-notifications` (✅ COMPLETED - Uses Notification::getUserNotifications() method)

**From:** `/loft-studio/api/create-notification.php`
**To:** `/loft-studio/api/index.php/create-notification` (✅ COMPLETED - Uses Notification::createNotification() method)

**From:** `/loft-studio/api/cancel-booking.php`
**To:** `/loft-studio/api/index.php/cancel-booking` (✅ COMPLETED - Uses Booking::cancelBooking() method)

**From:** `/loft-studio/api/get-similar-properties.php`
**To:** `/loft-studio/api/index.php/get-similar-properties` (✅ COMPLETED - Uses Property::getSimilarProperties() method)

**From:** `/loft-studio/api/submit-review.php`
**To:** `/loft-studio/api/index.php/submit-review` (✅ COMPLETED - Uses Review::submitReview() method)

**From:** `/loft-studio/api/get-property-reviews.php`
**To:** `/loft-studio/api/index.php/get-property-reviews` (✅ COMPLETED - Uses Review::getPropertyReviews() method)

**From:** `/loft-studio/api/get-user-profile.php`
**To:** `/loft-studio/api/index.php/get-user-profile` (✅ COMPLETED - Uses User::getUserProfile() method)

**From:** `/loft-studio/api/update-user-profile.php`
**To:** `/loft-studio/api/index.php/update-user-profile` (✅ COMPLETED - Uses User::updateUserProfile() method)

**From:** `/loft-studio/api/change-password.php`
**To:** `/loft-studio/api/index.php/change-password` (✅ COMPLETED - Uses User::changePassword() method)

**From:** `/loft-studio/api/get-user-language.php`
**To:** `/loft-studio/api/index.php/get-user-language` (✅ COMPLETED - Uses User::getUserLanguage() method)

**From:** `/loft-studio/api/update-user-language.php`
**To:** `/loft-studio/api/index.php/update-user-language` (✅ COMPLETED - Uses User::updateUserLanguage() method)

**From:** `/loft-studio/api/check-session.php`
**To:** `/loft-studio/api/index.php/user/check-session`

## Files to Update

1. `js/notification-badge.js`
2. `user-profile/js/notifications.js`
3. `user-profile/js/profile.js`
4. `user-profile/js/dashboard-profile.js`
5. `user-profile/js/security.js`
6. `js/logout-handler.js`
7. `js/favorites-handler.js`
8. `js/property-reviews.js`

## Alternative: Keep Standalone Files

If you prefer to keep the standalone PHP files for simplicity:
- They work as-is
- No routing changes needed
- Easier to maintain
- More straightforward

The class-based approach is more organized but requires more refactoring.

## Recommendation

**Option 1:** Keep standalone files (current setup)
- ✅ Already working
- ✅ No changes needed
- ✅ Easier to debug
- ✅ Simpler structure

**Option 2:** Migrate to class-based routing
- ✅ More organized
- ✅ Follows existing pattern
- ⚠️ Requires updating all frontend paths
- ⚠️ More complex routing logic

I recommend **Option 1** for now since everything is working. You can migrate to classes later if needed.
