# Dual Booking System Implementation Plan
## Traditional Real Estate + Airbnb-Style Bookings

### 1. Database Schema Extensions

#### 1.1 Property Type Enhancement
```sql
-- Add property category to distinguish booking types
ALTER TABLE `properties` ADD COLUMN `property_category` ENUM('sale', 'long_term_rental', 'short_term_rental') DEFAULT 'sale' AFTER `transaction_type`;

-- Add short-term rental specific fields
ALTER TABLE `properties` ADD COLUMN `max_guests` INT DEFAULT NULL AFTER `property_category`;
ALTER TABLE `properties` ADD COLUMN `min_stay_nights` INT DEFAULT 1 AFTER `max_guests`;
ALTER TABLE `properties` ADD COLUMN `check_in_time` TIME DEFAULT '15:00:00' AFTER `min_stay_nights`;
ALTER TABLE `properties` ADD COLUMN `check_out_time` TIME DEFAULT '11:00:00' AFTER `check_in_time`;
ALTER TABLE `properties` ADD COLUMN `instant_booking` BOOLEAN DEFAULT FALSE AFTER `check_out_time`;
```

#### 1.2 Airbnb-Style Booking System
```sql
-- Create short-term rental bookings table
CREATE TABLE `short_term_bookings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `property_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `check_in_date` DATE NOT NULL,
  `check_out_date` DATE NOT NULL,
  `guests_count` INT NOT NULL,
  `total_nights` INT NOT NULL,
  `price_per_night` DECIMAL(10,2) NOT NULL,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `booking_status` ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
  `payment_status` ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
  `payment_reference` VARCHAR(100) UNIQUE DEFAULT NULL,
  `special_requests` TEXT DEFAULT NULL,
  `host_notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_property_dates` (`property_id`, `check_in_date`, `check_out_date`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_booking_status` (`booking_status`),
  CONSTRAINT `fk_stb_property` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_stb_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

-- Create availability calendar table
CREATE TABLE `property_availability` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `property_id` int(11) NOT NULL,
  `date` DATE NOT NULL,
  `is_available` BOOLEAN DEFAULT TRUE,
  `price_per_night` DECIMAL(10,2) DEFAULT NULL,
  `minimum_stay` INT DEFAULT NULL,
  `notes` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_property_date` (`property_id`, `date`),
  KEY `idx_date_available` (`date`, `is_available`),
  CONSTRAINT `fk_availability_property` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE
);
```

### 2. Backend Implementation

#### 2.1 Property Category Detection System
```php
// services/PropertyCategoryService.php
class PropertyCategoryService {
    public static function getBookingInterface($propertyId) {
        $property = Property::getById($propertyId);
        
        switch($property['property_category']) {
            case 'short_term_rental':
                return 'airbnb_style';
            case 'long_term_rental':
                return 'traditional_rental';
            case 'sale':
                return 'traditional_sale';
            default:
                return 'traditional_sale';
        }
    }
    
    public static function getRequiredFields($category) {
        $baseFields = ['title', 'description', 'price', 'location'];
        
        switch($category) {
            case 'short_term_rental':
                return array_merge($baseFields, [
                    'max_guests', 'min_stay_nights', 
                    'check_in_time', 'check_out_time'
                ]);
            case 'long_term_rental':
                return array_merge($baseFields, ['lease_terms', 'deposit_amount']);
            default:
                return $baseFields;
        }
    }
}
```

#### 2.2 Airbnb-Style Booking API
```php
// api/short-term-booking.php
class ShortTermBookingAPI {
    public function checkAvailability($propertyId, $checkIn, $checkOut, $guests) {
        // Check property capacity
        $property = Property::getById($propertyId);
        if ($guests > $property['max_guests']) {
            return ['available' => false, 'reason' => 'Exceeds guest capacity'];
        }
        
        // Check date availability
        $unavailableDates = $this->getUnavailableDates($propertyId, $checkIn, $checkOut);
        if (!empty($unavailableDates)) {
            return ['available' => false, 'reason' => 'Dates not available'];
        }
        
        // Calculate pricing
        $pricing = $this->calculatePricing($propertyId, $checkIn, $checkOut);
        
        return [
            'available' => true,
            'pricing' => $pricing,
            'total_nights' => $pricing['nights'],
            'total_amount' => $pricing['total']
        ];
    }
    
    public function createBooking($data) {
        // Validate availability again
        $availability = $this->checkAvailability(
            $data['property_id'], 
            $data['check_in_date'], 
            $data['check_out_date'], 
            $data['guests_count']
        );
        
        if (!$availability['available']) {
            throw new Exception('Property not available for selected dates');
        }
        
        // Create booking record
        $bookingId = ShortTermBooking::create([
            'property_id' => $data['property_id'],
            'user_id' => $data['user_id'],
            'check_in_date' => $data['check_in_date'],
            'check_out_date' => $data['check_out_date'],
            'guests_count' => $data['guests_count'],
            'total_nights' => $availability['pricing']['nights'],
            'price_per_night' => $availability['pricing']['per_night'],
            'total_amount' => $availability['pricing']['total'],
            'special_requests' => $data['special_requests'] ?? null
        ]);
        
        // Block dates in availability calendar
        $this->blockDates($data['property_id'], $data['check_in_date'], $data['check_out_date']);
        
        // Send notifications
        $this->sendBookingNotifications($bookingId);
        
        return $bookingId;
    }
}
```

### 3. Frontend Implementation

#### 3.1 Dynamic Property Details Interface
```javascript
// js/property-booking-interface.js
class PropertyBookingInterface {
    constructor(propertyData) {
        this.property = propertyData;
        this.bookingType = this.determineBookingType();
        this.initializeInterface();
    }
    
    determineBookingType() {
        switch(this.property.property_category) {
            case 'short_term_rental':
                return 'airbnb';
            case 'long_term_rental':
                return 'rental';
            case 'sale':
                return 'sale';
            default:
                return 'sale';
        }
    }
    
    initializeInterface() {
        const container = document.getElementById('booking-interface');
        
        switch(this.bookingType) {
            case 'airbnb':
                this.renderAirbnbInterface(container);
                break;
            case 'rental':
                this.renderRentalInterface(container);
                break;
            case 'sale':
                this.renderSaleInterface(container);
                break;
        }
    }
    
    renderAirbnbInterface(container) {
        container.innerHTML = `
            <div class="airbnb-booking-card">
                <div class="price-display">
                    <span class="price">KES ${this.property.price}</span>
                    <span class="per-night">per night</span>
                </div>
                
                <div class="date-selection">
                    <div class="date-input-group">
                        <div class="date-input">
                            <label>Check-in</label>
                            <input type="date" id="checkin-date" min="${this.getTodayDate()}">
                        </div>
                        <div class="date-input">
                            <label>Check-out</label>
                            <input type="date" id="checkout-date" min="${this.getTomorrowDate()}">
                        </div>
                    </div>
                </div>
                
                <div class="guests-selection">
                    <label>Guests</label>
                    <select id="guests-count">
                        ${this.generateGuestOptions()}
                    </select>
                </div>
                
                <div class="booking-summary" id="booking-summary" style="display: none;">
                    <div class="summary-line">
                        <span>Nights: <span id="total-nights">0</span></span>
                        <span id="nights-cost">KES 0</span>
                    </div>
                    <div class="summary-total">
                        <strong>Total: <span id="total-cost">KES 0</span></strong>
                    </div>
                </div>
                
                <button class="btn-book-now" id="book-now-btn" disabled>
                    Check Availability
                </button>
                
                <div class="property-rules">
                    <small>
                        • Check-in: ${this.property.check_in_time}<br>
                        • Check-out: ${this.property.check_out_time}<br>
                        • Minimum stay: ${this.property.min_stay_nights} night(s)
                    </small>
                </div>
            </div>
        `;
        
        this.attachAirbnbEventListeners();
    }
    
    renderRentalInterface(container) {
        container.innerHTML = `
            <div class="rental-booking-card">
                <div class="price-display">
                    <span class="price">KES ${this.property.price}</span>
                    <span class="per-month">per month</span>
                </div>
                
                <div class="rental-details">
                    <p><strong>Deposit:</strong> KES ${this.property.deposit_amount || 'Contact agent'}</p>
                    <p><strong>Lease Terms:</strong> ${this.property.lease_terms || 'Flexible'}</p>
                </div>
                
                <button class="btn-inquire" id="rental-inquire-btn">
                    Schedule Viewing
                </button>
                
                <button class="btn-contact-agent" id="contact-agent-btn">
                    Contact Agent
                </button>
            </div>
        `;
        
        this.attachRentalEventListeners();
    }
    
    renderSaleInterface(container) {
        container.innerHTML = `
            <div class="sale-booking-card">
                <div class="price-display">
                    <span class="price">KES ${this.property.price}</span>
                </div>
                
                <button class="btn-schedule-viewing" id="schedule-viewing-btn">
                    Schedule Viewing
                </button>
                
                <button class="btn-contact-agent" id="contact-agent-btn">
                    Contact Agent
                </button>
                
                <button class="btn-make-offer" id="make-offer-btn">
                    Make an Offer
                </button>
            </div>
        `;
        
        this.attachSaleEventListeners();
    }
}
```

#### 3.2 Airbnb-Style Booking Flow
```javascript
// js/airbnb-booking-flow.js
class AirbnbBookingFlow {
    constructor(propertyId) {
        this.propertyId = propertyId;
        this.selectedDates = null;
        this.selectedGuests = 1;
        this.availabilityData = null;
    }
    
    async checkAvailability() {
        const checkinDate = document.getElementById('checkin-date').value;
        const checkoutDate = document.getElementById('checkout-date').value;
        const guestsCount = document.getElementById('guests-count').value;
        
        if (!checkinDate || !checkoutDate) {
            this.showError('Please select check-in and check-out dates');
            return;
        }
        
        try {
            const response = await fetch('/api/short-term-booking.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'check_availability',
                    property_id: this.propertyId,
                    check_in_date: checkinDate,
                    check_out_date: checkoutDate,
                    guests_count: parseInt(guestsCount)
                })
            });
            
            const data = await response.json();
            
            if (data.available) {
                this.availabilityData = data;
                this.showBookingSummary(data);
                this.enableBookingButton();
            } else {
                this.showError(data.reason || 'Property not available for selected dates');
            }
        } catch (error) {
            this.showError('Error checking availability. Please try again.');
        }
    }
    
    showBookingSummary(data) {
        document.getElementById('total-nights').textContent = data.pricing.nights;
        document.getElementById('nights-cost').textContent = `KES ${data.pricing.total}`;
        document.getElementById('total-cost').textContent = `KES ${data.pricing.total}`;
        document.getElementById('booking-summary').style.display = 'block';
    }
    
    async createBooking() {
        if (!this.availabilityData) {
            this.showError('Please check availability first');
            return;
        }
        
        // Check if user is logged in
        if (!this.isUserLoggedIn()) {
            this.showAuthModal();
            return;
        }
        
        try {
            const response = await fetch('/api/short-term-booking.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'create_booking',
                    property_id: this.propertyId,
                    check_in_date: document.getElementById('checkin-date').value,
                    check_out_date: document.getElementById('checkout-date').value,
                    guests_count: parseInt(document.getElementById('guests-count').value),
                    special_requests: document.getElementById('special-requests')?.value || null
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showBookingConfirmation(data.booking_id);
                // Redirect to payment if needed
                if (data.payment_required) {
                    this.redirectToPayment(data.payment_link);
                }
            } else {
                this.showError(data.message || 'Booking failed. Please try again.');
            }
        } catch (error) {
            this.showError('Error creating booking. Please try again.');
        }
    }
}
```

### 4. Property Details Page Enhancement

#### 4.1 Update property-details.php
```php
// Add this after the property data fetch
$bookingInterface = PropertyCategoryService::getBookingInterface($propertyId);
$requiredFields = PropertyCategoryService::getRequiredFields($property['property_category']);
```

#### 4.2 Dynamic Interface Container
```html
<!-- Add this to property-details.php in the property info section -->
<div class="property-card glass">
    <div id="booking-interface">
        <!-- Dynamic booking interface will be rendered here -->
    </div>
</div>

<script>
// Initialize the appropriate booking interface
document.addEventListener('DOMContentLoaded', function() {
    const propertyData = <?php echo json_encode($property); ?>;
    new PropertyBookingInterface(propertyData);
});
</script>
```

### 5. Search and Filtering Enhancement

#### 5.1 Category-Specific Search
```javascript
// js/property-search.js - Add category filtering
class PropertySearch {
    addCategoryFilters() {
        const categoryFilter = `
            <div class="filter-group">
                <label>Property Type</label>
                <select id="property-category-filter">
                    <option value="">All Properties</option>
                    <option value="sale">For Sale</option>
                    <option value="long_term_rental">Long-term Rental</option>
                    <option value="short_term_rental">Short-term Rental</option>
                </select>
            </div>
        `;
        
        // Add Airbnb-specific filters when short-term rental is selected
        const airbnbFilters = `
            <div id="airbnb-filters" style="display: none;">
                <div class="filter-group">
                    <label>Check-in Date</label>
                    <input type="date" id="search-checkin">
                </div>
                <div class="filter-group">
                    <label>Check-out Date</label>
                    <input type="date" id="search-checkout">
                </div>
                <div class="filter-group">
                    <label>Guests</label>
                    <select id="search-guests">
                        <option value="1">1 Guest</option>
                        <option value="2">2 Guests</option>
                        <option value="3">3 Guests</option>
                        <option value="4">4+ Guests</option>
                    </select>
                </div>
            </div>
        `;
    }
}
```

### 6. Implementation Priority

1. **Phase 1: Database Schema** (1-2 days)
   - Add property category fields
   - Create short-term booking tables
   - Create availability calendar

2. **Phase 2: Backend API** (3-4 days)
   - Property category service
   - Airbnb booking API
   - Availability checking system

3. **Phase 3: Frontend Interface** (3-4 days)
   - Dynamic booking interfaces
   - Airbnb-style booking flow
   - Date picker and availability calendar

4. **Phase 4: Integration** (2-3 days)
   - Update property details page
   - Enhance search functionality
   - Testing and refinement

### 7. Revenue Model Integration

- **Traditional Properties**: Contact agent → Service packages (photography, verification)
- **Airbnb Properties**: Instant booking → Commission per booking + listing fees
- **Dual Approach**: Maximize market coverage and revenue streams

This plan builds on your existing excellent foundation while adding the Airbnb-style functionality as a separate, parallel system. The beauty is that properties can be categorized appropriately, and users get the right experience for each property type.

Would you like me to start implementing any specific part of this plan?