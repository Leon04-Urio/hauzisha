<?php
/**
 * Paystack Payment Processing
 * This file handles payment initialization with Paystack
 */

header('Content-Type: application/json');
session_start();

require_once '../api/config/database.php';
require_once 'paystack-config.php';

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
    $payment_channel = $_POST['payment_channel'] ?? 'mpesa';

    // Validate required fields
    $errors = [];
    if (empty($full_name)) $errors[] = 'Full name is required';
    if (empty($phone)) $errors[] = 'Phone number is required';
    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Valid email is required';
    if (empty($property_name)) $errors[] = 'Property name is required';
    if (empty($property_type)) $errors[] = 'Property type is required';
    if (empty($location)) $errors[] = 'Location is required';
    if ($property_price <= 0) $errors[] = 'Valid property price is required';

    if (!empty($errors)) {
        throw new Exception(implode(', ', $errors));
    }

    // Validate package and amount
    $packages = [
        'listing' => 2500,
        'basic' => 8500,
        'premium' => 25000
    ];

    if (!isset($packages[$package]) || $packages[$package] != $amount) {
        throw new Exception('Invalid package or amount');
    }

    // Generate unique reference
    $reference = 'LOFT_' . strtoupper(uniqid());

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
            payment_method VARCHAR(50) DEFAULT 'paystack',
            gateway_reference VARCHAR(255),
            gateway_response JSON,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            completed_at TIMESTAMP NULL,
            INDEX idx_reference (reference),
            INDEX idx_email (payer_email),
            INDEX idx_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
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
            :property_price, :notes, 'paystack', 'pending'
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
        ':notes' => $notes
    ]);

    // Initialize Paystack payment
    $paystack = new PaystackAPI();
    
    // Prepare metadata
    $metadata = [
        'custom_fields' => [
            [
                'display_name' => 'Customer Name',
                'variable_name' => 'customer_name',
                'value' => $full_name
            ],
            [
                'display_name' => 'Phone Number',
                'variable_name' => 'phone_number',
                'value' => $phone
            ],
            [
                'display_name' => 'Property Name',
                'variable_name' => 'property_name',
                'value' => $property_name
            ],
            [
                'display_name' => 'Property Type',
                'variable_name' => 'property_type',
                'value' => $property_type
            ],
            [
                'display_name' => 'Location',
                'variable_name' => 'location',
                'value' => $location
            ],
            [
                'display_name' => 'Service Package',
                'variable_name' => 'service_package',
                'value' => ucfirst($package)
            ],
            [
                'display_name' => 'Preferred Payment Method',
                'variable_name' => 'payment_channel',
                'value' => ucfirst($payment_channel)
            ]
        ]
    ];

    // Map payment channel to Paystack channels
    $channels = [];
    if ($payment_channel === 'mpesa') {
        $channels = ['mobile_money'];
    } elseif ($payment_channel === 'card') {
        $channels = ['card'];
    } elseif ($payment_channel === 'bank') {
        $channels = ['bank', 'bank_transfer'];
    } else {
        // Allow all channels if not specified
        $channels = ['card', 'bank', 'ussd', 'mobile_money', 'bank_transfer'];
    }

    $result = $paystack->initializeTransaction($email, $amount, $reference, $metadata, $channels);

    if ($result['success']) {
        // Update payment record with Paystack reference
        $updateStmt = $conn->prepare("
            UPDATE payment_records 
            SET gateway_reference = :gateway_ref, gateway_response = :gateway_response
            WHERE reference = :reference
        ");
        
        $updateStmt->execute([
            ':gateway_ref' => $result['data']['reference'] ?? $reference,
            ':gateway_response' => json_encode($result['data']),
            ':reference' => $reference
        ]);

        // Return success with payment URL
        echo json_encode([
            'success' => true,
            'message' => 'Payment initialized successfully',
            'reference' => $reference,
            'authorization_url' => $result['data']['authorization_url'],
            'access_code' => $result['data']['access_code']
        ]);
    } else {
        // Update payment record as failed
        $updateStmt = $conn->prepare("
            UPDATE payment_records 
            SET status = 'failed', gateway_response = :gateway_response
            WHERE reference = :reference
        ");
        
        $updateStmt->execute([
            ':gateway_response' => json_encode($result),
            ':reference' => $reference
        ]);

        throw new Exception($result['message'] ?? 'Failed to initialize payment');
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
