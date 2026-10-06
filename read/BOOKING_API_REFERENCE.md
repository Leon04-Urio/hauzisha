# Booking API Reference

## Overview
All booking operations are handled through the `Booking` class in `api/classes/Booking.php` and routed through `api/index.php`.

## Endpoints

### 1. Create Booking
**Endpoint:** `POST /loft-studio/api/index.php/create-booking/{propertyId}`

**Description:** Book a property viewing

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "booking_date": "2025-12-25 14:00:00"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Property booked successfully."
}
```

**Class Method:** `Booking::addBooking($propertyId, $data)`

---

### 2. Get My Bookings
**Endpoint:** `GET /loft-studio/api/index.php/my-bookings`

**Description:** Get all bookings for the logged-in user

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "property_id": 5,
      "name": "Luxury Villa",
      "booking_date": "2025-12-25 14:00:00",
      "status": "pending"
    }
  ]
}
```

**Class Method:** `Booking::getPropertyBookings()`

---

### 3. Cancel Booking ✅ REFACTORED
**Endpoint:** `POST /loft-studio/api/index.php/cancel-booking`

**Description:** Cancel a booking (updates status to 'cancelled')

**Request Body:**
```json
{
  "booking_id": 123
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking cancelled successfully."
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Booking not found or not accessible."
}
```

**Class Method:** `Booking::cancelBooking($bookingId)`

**Security:**
- Requires user to be logged in
- Verifies booking belongs to the user
- Updates status instead of deleting record

---

### 4. Update Booking Status (Admin Only)
**Endpoint:** `PUT /loft-studio/api/index.php/change-booking-status/{bookingId}`

**Description:** Update booking status (admin only)

**Request Body:**
```json
{
  "status": "confirmed"
}
```

**Allowed Statuses:**
- `pending`
- `confirmed`
- `cancelled`

**Response:**
```json
{
  "success": true,
  "message": "Booking #123 status updated to confirmed."
}
```

**Class Method:** `Booking::updateBookingStatus($bookingId, $status)`

---

### 5. Get All Bookings (Admin Only)
**Endpoint:** `GET /loft-studio/api/index.php/all-bookings`

**Description:** Get all bookings in the system (admin only)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 10,
      "property_id": 5,
      "firstname": "John",
      "lastname": "Doe",
      "property_title": "Luxury Villa",
      "booking_date": "2025-12-25 14:00:00",
      "status": "pending"
    }
  ]
}
```

**Class Method:** `Booking::getAllBookings()`

---

### 6. Get Booking KPIs (Admin Only)
**Endpoint:** `GET /loft-studio/api/index.php/booking-kpis`

**Description:** Get booking statistics

**Response:**
```json
{
  "total": 150,
  "pending": 25,
  "confirmed": 100,
  "cancelled": 25,
  "newThisMonth": 15,
  "confirmedPercent": 66.7,
  "pendingPercent": 16.7,
  "newPercent": "10.0"
}
```

**Class Method:** `Booking::getBookingKPIs()`

---

## Database Schema

### bookings table
```sql
CREATE TABLE bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  property_id INT NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  booking_date DATETIME,
  status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (property_id) REFERENCES properties(id)
);
```

## Error Handling

All methods throw exceptions that are caught by the route handlers:

```php
try {
    $result = $booking->cancelBooking($bookingId);
    echo json_encode($result);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
```

## Activity Logging

All booking operations are logged using the Activity class:

```php
$activity = new Activity($conn);
$activity->logActivity("Cancelled booking", $bookingId, "booking");
```

## Frontend Integration Example

```javascript
// Cancel a booking
async function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
        return;
    }
    
    try {
        const response = await fetch('/loft-studio/api/index.php/cancel-booking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ booking_id: bookingId })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Booking cancelled successfully', 'success');
            // Refresh bookings list
            loadBookings();
        } else {
            showToast(data.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Failed to cancel booking', 'error');
    }
}

// Load user's bookings
async function loadBookings() {
    try {
        const response = await fetch('/loft-studio/api/index.php/my-bookings');
        const data = await response.json();
        
        if (data.success) {
            renderBookings(data.data);
        }
    } catch (error) {
        console.error('Error loading bookings:', error);
    }
}
```

## Notes

- All endpoints require session authentication (except admin endpoints which also require admin role)
- Booking cancellation updates the status field rather than deleting the record
- Activity logging is automatic for all booking operations
- Email notifications are sent to admin on new bookings (configurable)
