# Notification API Reference

## Overview
All notification operations are handled through the `Notification` class in `api/classes/Notification.php` and routed through `api/index.php`.

## Endpoints

### 1. Get User Notifications
**Endpoint:** `GET /loft-studio/api/index.php/get-notifications`

**Description:** Get all notifications for the logged-in user

**Authentication:** Required (session-based)

**Response:**
```json
{
  "success": true,
  "notifications": [
    {
      "id": 1,
      "user_id": 10,
      "message": "Your booking has been confirmed",
      "type": "booking",
      "is_read": 0,
      "created_at": "2025-11-19 10:30:00"
    },
    {
      "id": 2,
      "user_id": 10,
      "message": "New property available in your area",
      "type": "property",
      "is_read": 1,
      "created_at": "2025-11-18 15:20:00"
    }
  ]
}
```

**Error Response:**
```json
{
  "error": "Unauthorized"
}
```

**Class Method:** `Notification::getUserNotifications()`

**Features:**
- Returns up to 50 most recent notifications
- Ordered by created_at DESC
- Requires user to be logged in
- Only returns notifications for the logged-in user

---

### 2. Get Unread Count
**Endpoint:** `GET /loft-studio/api/index.php/get-unread-count`

**Description:** Get count of unread notifications for the logged-in user

**Authentication:** Optional (returns 0 if not logged in)

**Response:**
```json
{
  "success": true,
  "count": 5
}
```

**Response (Not Logged In):**
```json
{
  "count": 0
}
```

**Error Response:**
```json
{
  "success": false,
  "count": 0,
  "error": "Database error message"
}
```

**Class Method:** `Notification::getUnreadCount()`

**Features:**
- Returns integer count of unread notifications
- Returns 0 if user not logged in
- Used for badge counter display
- Lightweight query for frequent polling

---

### 3. Mark Notification as Read
**Endpoint:** `POST /loft-studio/api/index.php/mark-notification-read`

**Description:** Mark a specific notification as read

**Authentication:** Required (session-based)

**Request Body:**
```json
{
  "notification_id": 123
}
```

**Alternative Request Body:**
```json
{
  "id": 123
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read."
}
```

**Error Responses:**
```json
{
  "error": "Unauthorized"
}
```

```json
{
  "error": "Notification ID required"
}
```

```json
{
  "success": false,
  "message": "Notification not found or not accessible."
}
```

**Class Method:** `Notification::markAsRead($notificationId)`

**Security:**
- Requires user to be logged in
- Verifies notification belongs to the user
- Cannot mark other users' notifications as read

---

### 4. Create Notification
**Endpoint:** `POST /loft-studio/api/index.php/create-notification`

**Description:** Create a new notification for a user or broadcast to all users

**Authentication:** Required (session-based)

**Request Body (Single User):**
```json
{
  "user_id": 10,
  "message": "Your booking has been confirmed",
  "type": "booking"
}
```

**Request Body (Broadcast to All Users):**
```json
{
  "message": "New property available in Nairobi!",
  "type": "property",
  "notify_all": true
}
```

**Request Body (Broadcast - Alternative):**
```json
{
  "message": "System maintenance scheduled",
  "type": "system"
}
```
*Note: Omitting `user_id` triggers broadcast to all users*

**Response:**
```json
{
  "success": true,
  "message": "Notification created successfully."
}
```

**Error Responses:**
```json
{
  "error": "Unauthorized"
}
```

```json
{
  "success": false,
  "error": "Notification message is required."
}
```

```json
{
  "success": false,
  "error": "User ID required"
}
```

```json
{
  "success": false,
  "message": "Only admin can create broadcast notifications."
}
```

**Class Method:** `Notification::createNotification($data)`

**Notification Types:**
- `system` - System notifications (default)
- `booking` - Booking-related notifications
- `payment` - Payment-related notifications
- `property` - Property-related notifications
- `other` - Other notifications

**Features:**
- Can send to single user or broadcast to all
- Automatically sends email notification (if PHPMailer configured)
- Admin-only for broadcast notifications
- Supports custom notification types

---

### 5. Delete Notification (Admin Only)
**Endpoint:** `POST /loft-studio/api/index.php/delete-notification`

**Description:** Delete a notification (admin only)

**Authentication:** Required (admin role)

**Request Body:**
```json
{
  "id": 123
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification deleted successfully."
}
```

**Error Responses:**
```json
{
  "success": false,
  "message": "Unauthorized. Admins only."
}
```

```json
{
  "success": false,
  "message": "Notification ID is required."
}
```

**Class Method:** `Notification::deleteNotification($notificationId)`

**Security:**
- Requires admin role
- Permanently deletes notification from database

---

## Frontend Integration Examples

### JavaScript

#### Load Notifications
```javascript
async function loadNotifications() {
    try {
        const response = await fetch('/loft-studio/api/index.php/get-notifications');
        const data = await response.json();
        
        if (data.success && data.notifications) {
            renderNotifications(data.notifications);
        } else {
            showEmptyState();
        }
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}
```

#### Get Unread Count
```javascript
async function updateBadge() {
    try {
        const response = await fetch('/loft-studio/api/index.php/get-unread-count');
        const data = await response.json();
        
        if (data.count > 0) {
            showBadge(data.count);
        } else {
            hideBadge();
        }
    } catch (error) {
        console.error('Error fetching count:', error);
    }
}

// Poll every 30 seconds
setInterval(updateBadge, 30000);
```

#### Mark as Read
```javascript
async function markAsRead(notificationId) {
    try {
        const response = await fetch('/loft-studio/api/index.php/mark-notification-read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notification_id: notificationId })
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('Marked as read');
            updateBadge(); // Refresh badge count
        }
    } catch (error) {
        console.error('Error marking as read:', error);
    }
}
```

#### Create Notification (Admin)
```javascript
async function createNotification(userId, message, type = 'system') {
    try {
        const response = await fetch('/loft-studio/api/index.php/create-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: userId,
                message: message,
                type: type
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('Notification created');
        }
    } catch (error) {
        console.error('Error creating notification:', error);
    }
}
```

---

## Backend Integration Examples

### PHP

#### Create Notification (Single User)
```php
require_once 'api/classes/Notification.php';
require_once 'api/config/database.php';

$db = Database::getInstance();
$notification = new Notification($db);

try {
    $result = $notification->createNotification([
        'user_id' => 10,
        'message' => 'Your booking has been confirmed',
        'type' => 'booking'
    ]);
    
    if ($result['success']) {
        echo "Notification sent!";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
```

#### Create Notification (Broadcast)
```php
require_once 'api/classes/Notification.php';
require_once 'api/config/database.php';

$db = Database::getInstance();
$notification = new Notification($db);

try {
    // Omit user_id to broadcast to all users
    $result = $notification->createNotification([
        'message' => 'New property available in Nairobi!',
        'type' => 'property'
    ]);
    
    if ($result['success']) {
        echo "Broadcast sent to all users!";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
```

#### In Property Creation
```php
// After creating a new property
require_once '../api/classes/Notification.php';
require_once '../api/config/database.php';

$db = Database::getInstance();
$notification = new Notification($db);

$propertyName = $_POST['name'];
$location = $_POST['location'];

$notification->createNotification([
    'message' => "New {$propertyName} available in {$location}!",
    'type' => 'property'
]);
```

#### In Booking Status Update
```php
// After updating booking status
require_once '../api/classes/Notification.php';
require_once '../api/config/database.php';

$db = Database::getInstance();
$notification = new Notification($db);

$userId = $booking['user_id'];
$status = $_POST['status'];

$notification->createNotification([
    'user_id' => $userId,
    'message' => "Your booking status has been updated to: {$status}",
    'type' => 'booking'
]);
```

---

## Database Schema

### notifications table
```sql
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'system',
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_read (user_id, is_read),
  INDEX idx_created (created_at)
);
```

---

## Error Handling

All methods throw exceptions that are caught by the route handlers:

```php
try {
    $result = $notification->getUserNotifications();
    echo json_encode($result);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
```

---

## Email Notifications

The `Notification` class includes built-in email support using PHPMailer.

### Configuration
Edit `api/classes/Notification.php`:

```php
private function sendNotificationEmail($userId, $message) {
    $mail = new PHPMailer(true);
    
    // SMTP Configuration
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'your_email@gmail.com';
    $mail->Password   = 'your_app_password';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;
    
    // Sender
    $mail->setFrom('your_email@gmail.com', 'LOFT STUDIO');
    
    // ... rest of configuration
}
```

### Disable Email Notifications
To disable email notifications, comment out the email sending line in `createNotification()`:

```php
// $this->sendNotificationEmail($data['user_id'], $data['message']);
```

---

## Best Practices

1. **Use Appropriate Types** - Use specific notification types for better organization
2. **Keep Messages Concise** - Notification messages should be brief and clear
3. **Mark as Read** - Always mark notifications as read when user views them
4. **Poll Responsibly** - Don't poll unread count too frequently (30s recommended)
5. **Handle Errors** - Always wrap API calls in try-catch blocks
6. **Verify Permissions** - Check user roles before creating broadcast notifications
7. **Clean Up Old Notifications** - Consider implementing a cleanup job for old notifications

---

## Performance Tips

1. **Limit Results** - The API already limits to 50 notifications
2. **Use Indexes** - Database indexes on user_id and is_read improve performance
3. **Cache Count** - Consider caching unread count for high-traffic sites
4. **Batch Operations** - When creating multiple notifications, use transactions
5. **Async Email** - Consider using a queue for email notifications

---

## Security Considerations

1. **Session Validation** - All endpoints validate user session
2. **Ownership Verification** - Users can only access their own notifications
3. **Admin-Only Broadcasts** - Only admins can send broadcast notifications
4. **SQL Injection Protection** - All queries use prepared statements
5. **XSS Protection** - Sanitize notification messages before display

---

## Troubleshooting

### Notifications Not Loading
- Check if user is logged in
- Verify session is active
- Check browser console for errors
- Test API endpoint directly

### Badge Not Updating
- Check if polling is running
- Verify API endpoint returns correct count
- Check for JavaScript errors
- Ensure user is logged in

### Email Not Sending
- Verify PHPMailer configuration
- Check SMTP credentials
- Enable error logging
- Test email configuration separately

### Cannot Create Notifications
- Verify user is logged in
- Check if admin role required
- Verify message is not empty
- Check database connection

---

## Related Files

- `api/classes/Notification.php` - Notification class
- `api/index.php` - API routes
- `js/notification-badge.js` - Badge counter
- `user-profile/js/notifications.js` - Notifications page
- `user-profile/notifications.php` - Notifications UI

---

**Last Updated:** 2025-11-19  
**Version:** 2.0 (Refactored)  
**Status:** Production Ready ✅
