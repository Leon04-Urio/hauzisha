# Quick Reference: Booking Cancellation

## ✅ NEW ENDPOINT (Use This)

```
POST /loft-studio/api/index.php/cancel-booking
```

### Request
```json
{
  "booking_id": 123
}
```

### Response
```json
{
  "success": true,
  "message": "Booking cancelled successfully."
}
```

## JavaScript Example

```javascript
async function cancelBooking(bookingId) {
    const response = await fetch('/loft-studio/api/index.php/cancel-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId })
    });
    
    const data = await response.json();
    return data;
}
```

## Implementation Details

- **Class:** `Booking` (api/classes/Booking.php)
- **Method:** `cancelBooking($bookingId)`
- **Route:** api/index.php (line 1786)
- **Action:** Updates status to 'cancelled' (doesn't delete)
- **Security:** Verifies user ownership
- **Logging:** Automatic activity log entry

## ❌ OLD ENDPOINT (Removed)

```
❌ api/cancel-booking.php - DELETED
```

This file has been removed. Use the new endpoint above.
