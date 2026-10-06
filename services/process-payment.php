<?php
header('Content-Type: application/json');
session_start();

// Include database connection
require_once '../api/config/database.php';

try {
    // Validate request method
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method');
    }

    // Get form data
    $package = $_POST['package'] ?? '';
    $amount = (float)($_POST['amount'] ?? 0);
    $full_name = trim($_POST['full_name'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $property_name = trim($_POST['property_name'] ?? '');
    $property_type = $_POST['property_type'] ?? '';
    $location = trim($_POST['location'] ?? '');
    $property_price = (float)($_POST['property_price'] ?? 0);
    $notes = trim($_POST['notes'] ?? '');
    $payment_method = $_POST['payment_method'] ?? '';

    // Validate required fields
    $errors = [];
    if (empty($full_name)) $errors[] = 'Full name is required';
    if (empty($phone)) $errors[] = 'Phone number is required';
    if (empty($email)) $errors[] = 'Email address is required';
    if (empty($property_name)) $errors[] = 'Property name is required';
    if (empty($property_type)) $errors[] = 'Property type is required';
    if (empty($location)) $errors[] = 'Location is required';
    if ($property_price <= 0) $errors[] = 'Valid property price is required';
    if (empty($payment_method)) $errors[] = 'Payment method is required';

    if (!empty($errors)) {
        throw new Exception(implode(', ', $errors));
    }

    // Validate package and amount
    $packages = [
        'listing' => 1000,
        'basic' => 5000,
        'premium' => 15000,
        'featured' => 3000
    ];

    if (!isset($packages[$package]) || $packages[$package] != $amount) {
        throw new Exception('Invalid package or amount');
    }

    // Generate unique reference
    $reference = 'LOFT' . date('Ymd') . strtoupper(substr(uniqid(), -6));

    // Create database connection
    $database = new Database();
    $conn = $database->getConnection();

    // Create payment_records table if it doesn't exist
    $createTableSQL = "
        CREATE TABLE IF NOT EXISTS payment_records (
            id INT PRIMARY KEY AUTO_INCREMENT,
            reference VARCHAR(100) UNIQUE NOT NULL,
            payer_name VARCHAR(255) NOT NULL,
            payer_phone VARCHAR(15) NOT NULL,
            payer_email VARCHAR(255) NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            currency VARCHAR(3) DEFAULT 'KES',
            service_type VARCHAR(50) NOT NULL,
            property_name VARCHAR(255),
            property_type VARCHAR(50),
            property_location VARCHAR(255),
            property_price DECIMAL(15,2),
            notes TEXT,
            status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
            payment_method VARCHAR(50),
            gateway_reference VARCHAR(255),
            gateway_response JSON,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            completed_at TIMESTAMP NULL
        )
    ";
    
    $conn->exec($createTableSQL);

    // Insert payment record
    $stmt = $conn->prepare("
        INSERT INTO payment_records (
            reference, payer_name, payer_phone, payer_email, amount, currency,
            service_type, property_name, property_type, property_location, 
            property_price, notes, payment_method, status
        ) VALUES (
            :reference, :payer_name, :payer_phone, :payer_email, :amount, 'KES',
            :service_type, :property_name, :property_type, :property_location,
            :property_price, :notes, :payment_method, 'pending'
        )
    ");

    $stmt->execute([
        ':reference' => $reference,
        ':payer_name' => $full_name,
        ':payer_phone' => $phone,
        ':payer_email' => $email,
        ':amount' => $amount,
        ':service_type' => $package,
        ':property_name' => $property_name,
        ':property_type' => $property_type,
        ':property_location' => $location,
        ':property_price' => $property_price,
        ':notes' => $notes,
        ':payment_method' => $payment_method
    ]);

    // Process payment based on method
    $paymentResult = processPayment($payment_method, $amount, $phone, $reference, $full_name, $email);

    if ($paymentResult['success']) {
        // Update payment record with gateway response
        $updateStmt = $conn->prepare("
            UPDATE payment_records 
            SET gateway_reference = :gateway_ref, gateway_response = :gateway_response, status = :status
            WHERE reference = :reference
        ");
        
        $updateStmt->execute([
            ':gateway_ref' => $paymentResult['gateway_reference'] ?? null,
            ':gateway_response' => json_encode($paymentResult['gateway_response'] ?? []),
            ':status' => $paymentResult['status'] ?? 'pending',
            ':reference' => $reference
        ]);

        // Send confirmation email
        sendConfirmationEmail($email, $full_name, $reference, $package, $amount);

        echo json_encode([
            'success' => true,
            'message' => $paymentResult['message'],
            'reference' => $reference,
            'payment_url' => $paymentResult['payment_url'] ?? null
        ]);
    } else {
        // Update payment record as failed
        $updateStmt = $conn->prepare("
            UPDATE payment_records 
            SET status = 'failed', gateway_response = :gateway_response
            WHERE reference = :reference
        ");
        
        $updateStmt->execute([
            ':gateway_response' => json_encode($paymentResult['gateway_response'] ?? []),
            ':reference' => $reference
        ]);

        throw new Exception($paymentResult['message']);
    }

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

function processPayment($method, $amount, $phone, $reference, $name, $email) {
    switch ($method) {
        case 'mpesa':
            return processMpesaPayment($amount, $phone, $reference, $name);
        case 'card':
            return processCardPayment($amount, $reference, $name, $email);
        case 'bank':
            return processBankTransfer($amount, $reference, $name, $email);
        default:
            return ['success' => false, 'message' => 'Invalid payment method'];
    }
}

function processMpesaPayment($amount, $phone, $reference, $name) {
    // For now, simulate M-Pesa STK Push
    // In production, integrate with IntaSend or Paystack M-Pesa API
    
    // Simulate processing delay
    sleep(1);
    
    // For demo purposes, randomly succeed or fail
    $success = rand(1, 10) > 2; // 80% success rate
    
    if ($success) {
        return [
            'success' => true,
            'message' => 'M-Pesa STK Push sent to your phone. Please complete the payment.',
            'status' => 'pending',
            'gateway_reference' => 'MPESA' . time(),
            'gateway_response' => [
                'provider' => 'mpesa',
                'phone' => $phone,
                'amount' => $amount,
                'reference' => $reference
            ]
        ];
    } else {
        return [
            'success' => false,
            'message' => 'M-Pesa payment failed. Please try again.',
            'gateway_response' => ['error' => 'STK Push failed']
        ];
    }
}

function processCardPayment($amount, $reference, $name, $email) {
    // For now, simulate card payment
    // In production, integrate with IntaSend or Paystack card processing
    
    return [
        'success' => true,
        'message' => 'Redirecting to secure card payment...',
        'status' => 'pending',
        'payment_url' => 'https://checkout.intasend.com/pay/' . $reference, // Example URL
        'gateway_reference' => 'CARD' . time(),
        'gateway_response' => [
            'provider' => 'card',
            'amount' => $amount,
            'reference' => $reference
        ]
    ];
}

function processBankTransfer($amount, $reference, $name, $email) {
    // Generate bank transfer instructions
    return [
        'success' => true,
        'message' => 'Bank transfer instructions sent to your email.',
        'status' => 'pending',
        'gateway_reference' => 'BANK' . time(),
        'gateway_response' => [
            'provider' => 'bank_transfer',
            'amount' => $amount,
            'reference' => $reference,
            'bank_details' => [
                'bank' => 'KCB Bank',
                'account_name' => 'HAUZISHA LIMITED',
                'account_number' => '1234567890',
                'branch' => 'Westlands Branch'
            ]
        ]
    ];
}

function sendConfirmationEmail($email, $name, $reference, $package, $amount) {
    // Simple email confirmation
    $subject = "Payment Confirmation - HAUZISHA Services";
    $message = "
        Dear $name,
        
        Thank you for your payment! Here are your payment details:
        
        Reference: $reference
        Package: " . ucfirst($package) . " Package
        Amount: KES " . number_format($amount) . "
        
        We will contact you within 24 hours to schedule your service.
        
        Best regards,
        HAUZISHA Team
        +254 791 488 881
    ";
    
    $headers = "From: services@hauzisha.com\r\n";
    $headers .= "Reply-To: services@hauzisha.com\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();
    
    mail($email, $subject, $message, $headers);
}
?>
