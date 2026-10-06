# Automated Notifications System

## Overview
Complete notification system with automated triggers, badge counter, booking management, and similar properties.

## Files Created

### Backend APIs
1. `api/index.php/get-unread-count` - Get unread notification count (uses Notification.php class)
2. `api/index.php/create-notification` - Create notifications (uses Notification.php class)
3. `api/index.php/get-notifications` - Get user notifications (uses Notification.php class)
4. `api/index.php/mark-notification-read` - Mark notification as read (uses Notification.php class)
5. `api/index.php/cancel-booking` - Cancel user bookings (uses Booking.php class)
6. `api/index.php/get-similar-properties` - Get similar properties (uses Property.php class)

### Frontend
5. `js/notification-badge.js` - Red badge counter on notification icon

## Notification Triggers

### 1. New Property Added (Admin Action)
```php
// In admin property creation
require_once 'api/classes/Notification.php';
require_once 'api/config/database.php';

$db = Database::getInstance();
$notification = new Notification($db);
$notification->createNotification([
    'message' => "New property available: {$propertyName}",
    'type' => 'property'
    // No user_id means broadcast to all users
]);
```

### 2. Booking Status Updated
```php
// When admin updates booking status
createNotification($userId, "Your booking for {$propertyName} has been {$status}", 'booking');
```

### 3. Similar Property Recommendations
```php
// Based on user viewing history
createNotification($userId, "Check out properties similar to {$propertyName}", 'property');
```

### 4. Booking Confirmation
```php
// When user makes booking
createNotification($userId, "Booking confirmed for {$propertyName} on {$date}", 'booking');
```

## Implementation Guide

### Add Notification Badge to All Pages

Add to header/navbar:
```html
<script src="js/notification-badge.js"></script>
```

### Trigger Notifications

#### When Adding Property (Admin)
```php
// In control-room or admin property creation
require_once '../api/classes/Notification.php';
require_once '../api/config/database.php';

$db = Database::getInstance();
$notification = new Notification($db);
$result = $notification->createNotification([
    'message' => "New {$type} property in {$location}!",
    'type' => 'property'
]);
```

#### When Updating Booking Status
```php
// In admin booking management
include_once '../api/create-notification.php';
createNotification($booking['user_id'], 
    "Your booking status: {$newStatus}", 
    'booking'
);
```

#### When User Views Property
```php
// Track views and recommend similar
$_SESSION['viewed_properties'][] = $propertyId;
// Later, send recommendations
```

## Booking Management

### Display Bookings
Already exists in `user-profile/bookings.php`

### Cancel Booking
```javascript
async function cancelBooking(bookingId) {
    const response = await fetch('/loft-studio/api/index.php/cancel-booking', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({booking_id: bookingId})
    });
    const data = await response.json();
    if (data.success) {
        showToast('Booking cancelled', 'success');
        location.reload();
    }
}
```

## Similar Properties

### Load Similar Properties
```javascript
async function loadSimilarProperties(propertyId) {
    const response = await fetch(
        `/loft-studio/api/index.php/get-similar-properties?property_id=${propertyId}&limit=6`
    );
    const data = await response.json();
    if (data.success) {
        renderSimilarProperties(data.properties);
    }
}
```

## Database Schema

### Notifications Table (Already Exists)
```sql
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    type ENUM('system','booking','payment','property','other'),
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Bookings Table (Already Exists)
```sql
CREATE TABLE bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    property_id INT NOT NULL,
    name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(255),
    booking_date DATE,
    status ENUM('pending','confirmed','cancelled'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Usage Examples

### 1. Show Notification Badge
Automatically loads on all pages where user is logged in.
Updates every 30 seconds.

### 2. Create Notification (PHP)
```php
require_once 'api/classes/Notification.php';
require_once 'api/config/database.php';

$db = Database::getInstance();
$notification = new Notification($db);

// Single user
createNotification(5, "Your booking is confirmed", 'booking');

// All users
notifyAllUsers("New luxury villa available!", 'property');
```

### 3. Cancel Booking (JavaScript)
```javascript
document.getElementById('cancelBtn').addEventListener('click', async () => {
    if (confirm('Cancel this booking?')) {
        await cancelBooking(bookingId);
    }
});
```

### 4. Load Similar Properties
```javascript
// In property-details.js
loadSimilarProperties(currentPropertyId);
```

## Integration Points

### Admin Panel
Add these calls when:
- Creating new property → `notifyAllUsers()`
- Updating booking status → `createNotification()`
- Approving/rejecting → `createNotification()`

### User Actions
- Making booking → Create confirmation notification
- Viewing property → Track for recommendations
- Favoriting → Suggest similar properties

## Features

✅ Red badge counter on notification icon
✅ Auto-updates every 30 seconds
✅ Automated notification triggers
✅ Booking cancellation
✅ Similar property recommendations
✅ Type-specific notifications (booking, property, system)
✅ Unread count tracking
✅ Toast notifications for actions

## Next Steps

1. Add `notification-badge.js` to all pages
2. Integrate notification triggers in admin panel
3. Add cancel button to bookings page
4. Load similar properties in property details
5. Test notification flow

## Testing

1. Create new property as admin → All users get notification
2. Update booking status → User gets notification
3. Check notification icon → Shows red badge with count
4. Click notification → Badge disappears
5. Cancel booking → Status updates, notification sent
