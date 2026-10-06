<?php
session_start();

// Get reference from URL
$reference = $_GET['ref'] ?? '';

if (empty($reference)) {
    header('Location: index.php');
    exit;
}

// Get payment details from database
require_once '../api/config/database.php';

try {
    $database = new Database();
    $conn = $database->getConnection();
    
    $stmt = $conn->prepare("SELECT * FROM payment_records WHERE reference = :reference");
    $stmt->execute([':reference' => $reference]);
    $payment = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$payment) {
        header('Location: index.php');
        exit;
    }
} catch (Exception $e) {
    header('Location: index.php');
    exit;
}

// Package names mapping
$packageNames = [
    'listing' => 'Basic Listing',
    'basic' => 'Basic Package',
    'premium' => 'Premium Package',
    'featured' => 'Featured Placement'
];
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <title>Payment Successful | HAUZISHA</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="icon" type="image/svg+xml" href="../images/logo.png">
    <link rel="preconnect" href="https://fonts.gstatic.com/">
    <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@200;300;400;600;700&amp;display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link rel="stylesheet" href="../css/style.css">

    <style>
        body {
            font-family: 'Nunito Sans', sans-serif;
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            min-height: 100vh;
        }
        
        .success-container {
            max-width: 700px;
            margin: 0 auto;
            padding: 100px 20px 50px;
            text-align: center;
        }
        
        .success-card {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(40, 167, 69, 0.3);
            border-radius: 16px;
            padding: 50px 40px;
            backdrop-filter: blur(10px);
        }
        
        .success-icon {
            font-size: 4rem;
            color: #51cf66;
            margin-bottom: 30px;
            animation: bounce 1s ease-in-out;
        }
        
        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
        }
        
        .success-title {
            font-size: 2.5rem;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 20px;
        }
        
        .success-message {
            font-size: 1.2rem;
            color: #cccccc;
            margin-bottom: 40px;
            line-height: 1.6;
        }
        
        .payment-details {
            background: rgba(255, 215, 0, 0.1);
            border: 1px solid rgba(255, 215, 0, 0.3);
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 40px;
            text-align: left;
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .detail-row:last-child {
            border-bottom: none;
        }
        
        .detail-label {
            color: #cccccc;
            font-weight: 500;
        }
        
        .detail-value {
            color: #ffffff;
            font-weight: 600;
        }
        
        .reference-number {
            background: rgba(255, 215, 0, 0.2);
            color: #ffd700;
            padding: 8px 15px;
            border-radius: 20px;
            font-family: monospace;
            font-size: 1.1rem;
        }
        
        .next-steps {
            background: rgba(255, 255, 255, 0.03);
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 30px;
            text-align: left;
        }
        
        .next-steps h4 {
            color: #ffd700;
            margin-bottom: 20px;
            font-weight: 600;
        }
        
        .next-steps ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .next-steps li {
            color: #e0e0e0;
            margin-bottom: 12px;
            padding-left: 25px;
            position: relative;
        }
        
        .next-steps li::before {
            content: "→";
            color: #ffd700;
            font-weight: bold;
            position: absolute;
            left: 0;
        }
        
        .action-buttons {
            display: flex;
            gap: 20px;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
            color: #000;
            border: none;
            padding: 12px 30px;
            border-radius: 25px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.3s ease;
        }
        
        .btn-primary:hover {
            transform: scale(1.05);
            box-shadow: 0 10px 20px rgba(255, 215, 0, 0.3);
            color: #000;
        }
        
        .btn-secondary {
            background: rgba(255, 255, 255, 0.1);
            color: #ffffff;
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 12px 30px;
            border-radius: 25px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.3s ease;
        }
        
        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.2);
            color: #ffffff;
        }
        
        .contact-info {
            margin-top: 40px;
            padding-top: 30px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .contact-info h5 {
            color: #ffffff;
            margin-bottom: 15px;
        }
        
        .contact-item {
            color: #ffd700;
            margin-bottom: 8px;
        }
        
        @media (max-width: 768px) {
            .success-container {
                padding: 80px 15px 30px;
            }
            
            .success-card {
                padding: 30px 20px;
            }
            
            .success-title {
                font-size: 2rem;
            }
            
            .action-buttons {
                flex-direction: column;
                align-items: center;
            }
            
            .btn-primary, .btn-secondary {
                width: 100%;
                max-width: 250px;
            }
        }
    </style>
</head>
<body>

    <?php include '../navbar.php'; ?>

    <div class="success-container">
        <div class="success-card">
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            
            <h1 class="success-title">Payment Successful!</h1>
            <p class="success-message">
                Thank you for choosing HAUZISHA! Your payment has been processed successfully and we've received your service request.
            </p>

            <!-- Payment Details -->
            <div class="payment-details">
                <div class="detail-row">
                    <span class="detail-label">Reference Number:</span>
                    <span class="detail-value reference-number"><?php echo $payment['reference']; ?></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Service Package:</span>
                    <span class="detail-value"><?php echo $packageNames[$payment['service_type']] ?? ucfirst($payment['service_type']); ?></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Amount Paid:</span>
                    <span class="detail-value">KES <?php echo number_format($payment['amount']); ?></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Property:</span>
                    <span class="detail-value"><?php echo htmlspecialchars($payment['property_name']); ?></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Location:</span>
                    <span class="detail-value"><?php echo htmlspecialchars($payment['property_location']); ?></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Payment Date:</span>
                    <span class="detail-value"><?php echo date('F j, Y \a\t g:i A', strtotime($payment['created_at'])); ?></span>
                </div>
            </div>

            <!-- Next Steps -->
            <div class="next-steps">
                <h4><i class="fas fa-clipboard-list"></i> What Happens Next?</h4>
                <ul>
                    <li>Our team will contact you within 24 hours to schedule your service</li>
                    <li>We'll coordinate the property visit and photography/scanning session</li>
                    <li>Professional content will be created and processed within 3-5 business days</li>
                    <li>Your property will be published on our platform with verification badges</li>
                    <li>You'll receive analytics and performance reports for your listing</li>
                </ul>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons">
                <a href="../index.php" class="btn-primary">
                    <i class="fas fa-home"></i> Back to Home
                </a>
                <a href="index.php" class="btn-secondary">
                    <i class="fas fa-plus"></i> Order Another Service
                </a>
            </div>

            <!-- Contact Information -->
            <div class="contact-info">
                <h5>Need Help? Contact Us:</h5>
                <div class="contact-item">
                    <i class="fas fa-phone"></i> +254 791 488 881
                </div>
                <div class="contact-item">
                    <i class="fas fa-envelope"></i> services@hauzisha.com
                </div>
                <div class="contact-item">
                    <i class="fab fa-whatsapp"></i> WhatsApp Support Available
                </div>
            </div>
        </div>
    </div>

    <script src="../js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/js/bootstrap.bundle.min.js"></script>

    <script>
        // Auto-copy reference number when clicked
        document.querySelector('.reference-number').addEventListener('click', function() {
            navigator.clipboard.writeText(this.textContent).then(function() {
                // Show temporary feedback
                const original = this.textContent;
                this.textContent = 'Copied!';
                setTimeout(() => {
                    this.textContent = original;
                }, 1000);
            }.bind(this));
        });
    </script>

</body>
</html>
