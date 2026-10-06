<?php
session_start();

// Get package from URL parameter
$package = $_GET['package'] ?? '';

// Define package details
$packages = [
    'listing' => [
        'name' => 'Basic Listing',
        'price' => 2500,
        'description' => 'Get your property online with essential features',
        'features' => [
            'Property listing for 60 days',
            'High-quality photo upload',
            'Search engine optimization',
            'Mobile-responsive display',
            'Contact form integration',
            'Basic analytics dashboard'
        ]
    ],
    'basic' => [
        'name' => 'Professional Package',
        'price' => 8500,
        'description' => 'Professional photography and enhanced marketing',
        'features' => [
            'Professional photography session',
            'Property verification badge',
            'Enhanced listing visibility',
            'Professional image editing',
            'Social media ready images',
            'Priority customer support'
        ]
    ],
    'premium' => [
        'name' => 'Premium 3D Experience',
        'price' => 25000,
        'description' => 'Complete immersive experience with 3D virtual tours',
        'features' => [
            'Matterport 3D virtual tour',
            'Professional photography',
            'Interactive floor plans',
            'Virtual reality compatibility',
            'Property verification badge',
            'Featured placement boost',
            'Advanced analytics',
            'Dedicated account manager'
        ]
    ]
];

// Redirect if invalid package
if (!isset($packages[$package])) {
    header('Location: index.php');
    exit;
}

$selectedPackage = $packages[$package];
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <title>Payment - <?php echo $selectedPackage['name']; ?> | HAUZISHA</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="icon" type="image/svg+xml" href="../images/logo.png">
    <link rel="preconnect" href="https://fonts.gstatic.com/">
    <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@200;300;400;600;700&amp;display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link rel="stylesheet" href="../css/style.css">

    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        /* Override navbar styling for payment page */
        nav.navbar {
            background: #000 !important;
            /* margin-bottom: 12rem !important; */
        }
        
        body {
            font-family: 'Nunito Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #f5f5f5;
            min-height: 100vh;
            padding-bottom: 30px;
            padding-top: 0;
        }
        
        .payment-header {
            background: #fff;
            border-bottom: 1px solid #e5e5e5;
            padding: 20px 0;
            position: sticky;
            top: 0;
            z-index: 99;
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        
        .payment-header .container {
            max-width: 1200px;
            margin: 5rem auto;
            padding: 0 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        
        .payment-logo {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 1.5rem;
            font-weight: 700;
            color: #000;
            text-decoration: none;
        }
        
        .payment-logo img {
            height: 40px;
            width: 40px;
        }
        
        .secure-badge {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #52c41a;
            font-size: 0.9rem;
            font-weight: 600;
        }
        
        .payment-container {
            max-width: 1200px;
            margin: 150px auto;
            padding: 0 20px;
            display: grid;
            grid-template-columns: 1fr 400px;
            gap: 24px;
        }
        
        .payment-main {
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        
        .payment-sidebar {
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            height: fit-content;
            position: sticky;
            top: 100px;
        }
        
        .section-header {
            padding: 24px;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .section-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: #000;
            margin: 0;
        }
        
        .section-subtitle {
            font-size: 0.85rem;
            color: #8c8c8c;
            margin-top: 4px;
        }
        
        .section-body {
            padding: 24px;
        }
        
        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 20px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group.full-width {
            grid-column: 1 / -1;
        }
        
        .form-label {
            display: block;
            font-size: 0.9rem;
            font-weight: 600;
            color: #262626;
            margin-bottom: 8px;
        }
        
        .form-label .required {
            color: #ff4d4f;
            margin-left: 2px;
        }
        
        .form-control {
            width: 100%;
            padding: 12px 16px;
            border: 1px solid #d9d9d9;
            border-radius: 6px;
            font-size: 0.95rem;
            color: #262626;
            background: #fff;
            transition: all 0.3s;
        }
        
        .form-control:hover {
            border-color: #ffd700;
        }
        
        .form-control:focus {
            outline: none;
            border-color: #ffd700;
            box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.1);
        }
        
        .form-control::placeholder {
            color: #bfbfbf;
        }
        
        select.form-control {
            cursor: pointer;
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23595959' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 12px center;
            padding-right: 36px;
        }
        
        textarea.form-control {
            resize: vertical;
            min-height: 80px;
        }
        
        .payment-methods {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
        }
        
        .payment-method {
            border: 2px solid #e5e5e5;
            border-radius: 8px;
            padding: 20px 16px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s;
            background: #fafafa;
        }
        
        .payment-method:hover {
            border-color: #ffd700;
            background: #fffef0;
            transform: translateY(-2px);
        }
        
        .payment-method.selected {
            border-color: #ffd700;
            background: #fffef0;
            box-shadow: 0 4px 12px rgba(255, 215, 0, 0.15);
        }
        
        .payment-method i {
            font-size: 2rem;
            color: #262626;
            margin-bottom: 12px;
            display: block;
        }
        
        .payment-method.selected i {
            color: #ffd700;
        }
        
        .payment-method-name {
            font-size: 0.95rem;
            font-weight: 600;
            color: #262626;
            margin-bottom: 4px;
        }
        
        .payment-method-desc {
            font-size: 0.8rem;
            color: #8c8c8c;
        }
        
        /* Order Summary Sidebar */
        .order-summary {
            padding: 24px;
        }
        
        .summary-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: #000;
            margin-bottom: 20px;
        }
        
        .package-info {
            background: #fafafa;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 20px;
        }
        
        .package-name {
            font-size: 1rem;
            font-weight: 600;
            color: #000;
            margin-bottom: 8px;
        }
        
        .package-features {
            list-style: none;
            padding: 0;
            margin: 12px 0 0 0;
        }
        
        .package-features li {
            font-size: 0.85rem;
            color: #595959;
            padding: 6px 0;
            padding-left: 20px;
            position: relative;
        }
        
        .package-features li::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #52c41a;
            font-weight: 600;
        }
        
        .price-breakdown {
            border-top: 1px solid #f0f0f0;
            padding-top: 16px;
            margin-top: 16px;
        }
        
        .price-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            font-size: 0.9rem;
        }
        
        .price-label {
            color: #595959;
        }
        
        .price-value {
            font-weight: 600;
            color: #262626;
        }
        
        .price-row.total {
            margin-top: 16px;
            padding-top: 16px;
            border-top: 2px solid #f0f0f0;
            font-size: 1.2rem;
        }
        
        .price-row.total .price-value {
            color: #ffd700;
            font-size: 1.5rem;
        }
        
        .pay-btn {
            width: 100%;
            background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
            color: #000;
            border: none;
            padding: 16px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s;
            margin-top: 20px;
            box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
        }
        
        .pay-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(255, 215, 0, 0.4);
        }
        
        .pay-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        
        .security-note {
            text-align: center;
            color: #8c8c8c;
            font-size: 0.8rem;
            margin-top: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
        }
        
        .error-message, .success-message {
            padding: 12px 16px;
            border-radius: 6px;
            margin-bottom: 20px;
            font-size: 0.9rem;
            display: none;
        }
        
        .error-message {
            background: #fff2f0;
            border: 1px solid #ffccc7;
            color: #cf1322;
        }
        
        .success-message {
            background: #f6ffed;
            border: 1px solid #b7eb8f;
            color: #389e0d;
        }
        
        .back-link {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: #595959;
            text-decoration: none;
            font-size: 0.9rem;
            margin-bottom: 20px;
            transition: color 0.3s;
        }
        
        .back-link:hover {
            color: #ffd700;
        }
        
        @media (max-width: 992px) {
            .payment-container {
                grid-template-columns: 1fr;
            }
            
            .payment-sidebar {
                position: static;
                order: -1;
            }
            
            .payment-methods {
                grid-template-columns: 1fr;
            }
            
            .form-row {
                grid-template-columns: 1fr;
            }
        }
        
        @media (max-width: 768px) {
            .payment-header .container {
                flex-direction: column;
                gap: 12px;
            }
            
            .payment-container {
                margin: 20px auto;
                padding: 0 12px;
            }
            
            .section-body {
                padding: 16px;
            }
        }
    </style>
</head>
<body>

    <?php include '../navbar.php'; ?>

    <div class="payment-container">
        <!-- Main Payment Form -->
        <div class="payment-main">
            <a href="index.php" class="back-link" style="display: inline-flex; margin: 24px 0 0 24px;">
                <i class="fas fa-arrow-left"></i> Back to Services
            </a>

            <!-- Error/Success Messages -->
            <div style="padding: 0 24px;">
                <div id="error-message" class="error-message"></div>
                <div id="success-message" class="success-message"></div>
            </div>

            <!-- Payment Form -->
            <form id="payment-form">
                <input type="hidden" name="package" value="<?php echo $package; ?>">
                <input type="hidden" name="amount" value="<?php echo $selectedPackage['price']; ?>">

                <!-- Contact Information -->
                <div class="section-header">
                    <h3 class="section-title">Contact Information</h3>
                    <p class="section-subtitle">We'll use this to contact you about your service</p>
                </div>
                <div class="section-body">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Full Name <span class="required">*</span></label>
                            <input type="text" name="full_name" class="form-control" placeholder="John Doe" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Phone Number <span class="required">*</span></label>
                            <input type="tel" name="phone" class="form-control" placeholder="254712345678" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Email Address <span class="required">*</span></label>
                        <input type="email" name="email" class="form-control" placeholder="john@example.com" required>
                    </div>
                </div>

                <!-- Property Information -->
                <div class="section-header">
                    <h3 class="section-title">Property Details</h3>
                    <p class="section-subtitle">Tell us about the property you want to list</p>
                </div>
                <div class="section-body">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Property Name <span class="required">*</span></label>
                            <input type="text" name="property_name" class="form-control" placeholder="e.g., 3BR Apartment" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Property Type <span class="required">*</span></label>
                            <select name="property_type" class="form-control" required>
                                <option value="">Select type</option>
                                <option value="apartment">Apartment</option>
                                <option value="house">House</option>
                                <option value="villa">Villa</option>
                                <option value="office">Office</option>
                                <option value="commercial">Commercial</option>
                                <option value="land">Land</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Location <span class="required">*</span></label>
                            <input type="text" name="location" class="form-control" placeholder="e.g., Kilimani, Nairobi" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Property Price (KES) <span class="required">*</span></label>
                            <input type="number" name="property_price" class="form-control" placeholder="5000000" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Additional Notes</label>
                        <textarea name="notes" class="form-control" rows="3" placeholder="Any special requirements or additional information..."></textarea>
                    </div>
                </div>

                <!-- Payment Method -->
                <div class="section-header">
                    <h3 class="section-title">Payment Method</h3>
                    <p class="section-subtitle">Choose how you'd like to pay</p>
                </div>
                <div class="section-body">
                    <div class="payment-methods">
                        <div class="payment-method selected" data-method="mpesa">
                            <i class="fas fa-mobile-alt"></i>
                            <div class="payment-method-name">M-Pesa</div>
                            <div class="payment-method-desc">Mobile Money</div>
                        </div>
                        <div class="payment-method" data-method="card">
                            <i class="fas fa-credit-card"></i>
                            <div class="payment-method-name">Card</div>
                            <div class="payment-method-desc">Visa, Mastercard</div>
                        </div>
                        <div class="payment-method" data-method="bank">
                            <i class="fas fa-university"></i>
                            <div class="payment-method-name">Bank</div>
                            <div class="payment-method-desc">Bank Transfer</div>
                        </div>
                    </div>
                    <input type="hidden" name="payment_channel" id="payment_channel" value="mpesa">
                </div>
            </form>
        </div>

        <!-- Order Summary Sidebar -->
        <div class="payment-sidebar">
            <div class="order-summary">
                <h3 class="summary-title">Order Summary</h3>
                
                <div class="package-info">
                    <div class="package-name"><?php echo $selectedPackage['name']; ?></div>
                    <ul class="package-features">
                        <?php foreach (array_slice($selectedPackage['features'], 0, 4) as $feature): ?>
                            <li><?php echo $feature; ?></li>
                        <?php endforeach; ?>
                        <?php if (count($selectedPackage['features']) > 4): ?>
                            <li>+<?php echo count($selectedPackage['features']) - 4; ?> more features</li>
                        <?php endif; ?>
                    </ul>
                </div>

                <div class="price-breakdown">
                    <div class="price-row">
                        <span class="price-label">Service Package</span>
                        <span class="price-value">KES <?php echo number_format($selectedPackage['price']); ?></span>
                    </div>
                    <div class="price-row">
                        <span class="price-label">Processing Fee</span>
                        <span class="price-value">KES 0</span>
                    </div>
                    <div class="price-row total">
                        <span class="price-label">Total</span>
                        <span class="price-value">KES <?php echo number_format($selectedPackage['price']); ?></span>
                    </div>
                </div>

                <button type="submit" form="payment-form" class="pay-btn" id="pay-btn">
                    <i class="fas fa-lock"></i> Pay with M-Pesa
                </button>
                
                <div class="security-note">
                    <i class="fas fa-shield-alt"></i>
                    <span>Secured by Paystack</span>
                </div>
            </div>
        </div>
    </div>

    <script src="../js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/js/bootstrap.bundle.min.js"></script>
    <!-- Paystack Inline JS -->
    <script src="https://js.paystack.co/v1/inline.js"></script>

    <script>
        // Payment method selection
        document.querySelectorAll('.payment-method').forEach(method => {
            method.addEventListener('click', function() {
                // Remove selected class from all methods
                document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('selected'));
                
                // Add selected class to clicked method
                this.classList.add('selected');
                
                // Set hidden input value
                document.getElementById('payment_channel').value = this.dataset.method;
                
                // Update button text based on method
                const payBtn = document.getElementById('pay-btn');
                const amount = '<?php echo number_format($selectedPackage['price']); ?>';
                const methodName = this.querySelector('.payment-method-name').textContent;
                
                payBtn.innerHTML = `<i class="fas fa-lock"></i> Pay with ${methodName} - KES ${amount}`;
            });
        });

        // Form submission with Paystack
        document.getElementById('payment-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const payBtn = document.getElementById('pay-btn');
            const errorDiv = document.getElementById('error-message');
            const successDiv = document.getElementById('success-message');
            
            // Hide previous messages
            errorDiv.style.display = 'none';
            successDiv.style.display = 'none';
            
            // Disable button and show loading
            payBtn.disabled = true;
            payBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Initializing Payment...';
            
            // Initialize payment with Paystack
            fetch('paystack-process.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Get selected payment channel
                    const channel = document.getElementById('payment_channel').value;
                    
                    // Redirect to Paystack with preferred channel
                    let paymentUrl = data.authorization_url;
                    
                    // Paystack will show the selected method first
                    if (channel === 'mpesa') {
                        paymentUrl += '?channel=mobile_money';
                    } else if (channel === 'card') {
                        paymentUrl += '?channel=card';
                    } else if (channel === 'bank') {
                        paymentUrl += '?channel=bank';
                    }
                    
                    window.location.href = paymentUrl;
                } else {
                    errorDiv.innerHTML = data.message;
                    errorDiv.style.display = 'block';
                    
                    // Re-enable button
                    payBtn.disabled = false;
                    const methodName = document.querySelector('.payment-method.selected .payment-method-name').textContent;
                    payBtn.innerHTML = `<i class="fas fa-lock"></i> Pay with ${methodName} - KES <?php echo number_format($selectedPackage['price']); ?>`;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                errorDiv.innerHTML = 'An error occurred. Please try again.';
                errorDiv.style.display = 'block';
                
                // Re-enable button
                payBtn.disabled = false;
                const methodName = document.querySelector('.payment-method.selected .payment-method-name').textContent;
                payBtn.innerHTML = `<i class="fas fa-lock"></i> Pay with ${methodName} - KES <?php echo number_format($selectedPackage['price']); ?>`;
            });
        });

        // Phone number formatting
        document.querySelector('input[name="phone"]').addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            // Auto-add 254 if starts with 7 or 1
            if (value.length > 0 && (value.startsWith('7') || value.startsWith('1'))) {
                value = '254' + value;
            }
            
            e.target.value = value;
        });
        
        // Auto-enable submit button when form is filled
        const form = document.getElementById('payment-form');
        const submitBtn = document.getElementById('pay-btn');
        
        form.addEventListener('input', function() {
            const requiredFields = form.querySelectorAll('[required]');
            let allFilled = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    allFilled = false;
                }
            });
            
            submitBtn.disabled = !allFilled;
        });
        
        // Initialize button text with default method
        window.addEventListener('DOMContentLoaded', function() {
            const defaultMethod = document.querySelector('.payment-method.selected .payment-method-name').textContent;
            const payBtn = document.getElementById('pay-btn');
            payBtn.innerHTML = `<i class="fas fa-lock"></i> Pay with ${defaultMethod} - KES <?php echo number_format($selectedPackage['price']); ?>`;
        });
    </script>

</body>
</html>