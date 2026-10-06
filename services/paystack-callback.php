<?php
/**
 * Paystack Payment Callback
 * This page is shown after user completes payment on Paystack
 */

session_start();
require_once '../api/config/database.php';
require_once 'paystack-config.php';

// Get reference from URL
$reference = $_GET['reference'] ?? '';

if (empty($reference)) {
    header('Location: index.php');
    exit;
}

try {
    // Verify transaction with Paystack
    $paystack = new PaystackAPI();
    $result = $paystack->verifyTransaction($reference);
    
    if (!$result['success']) {
        throw new Exception('Failed to verify payment');
    }
    
    $transaction = $result['data'];
    
    // Get payment record from database
    $database = new Database();
    $conn = $database->getConnection();
    
    $stmt = $conn->prepare("SELECT * FROM payment_records WHERE reference = :reference OR gateway_reference = :reference");
    $stmt->execute([':reference' => $reference]);
    $payment = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$payment) {
        throw new Exception('Payment record not found');
    }
    
    // Update payment status based on Paystack response
    $status = 'pending';
    if ($transaction['status'] === 'success') {
        $status = 'completed';
    } elseif ($transaction['status'] === 'failed') {
        $status = 'failed';
    }
    
    // Update payment record
    $updateStmt = $conn->prepare("
        UPDATE payment_records 
        SET status = :status, 
            gateway_response = :gateway_response,
            completed_at = CASE WHEN :status = 'completed' THEN NOW() ELSE completed_at END
        WHERE reference = :reference
    ");
    
    $updateStmt->execute([
        ':status' => $status,
        ':gateway_response' => json_encode($transaction),
        ':reference' => $payment['reference']
    ]);
    
    // Send confirmation email if payment successful
    if ($status === 'completed') {
        sendPaymentConfirmation($payment);
    }
    
    // Redirect to success or failure page
    if ($status === 'completed') {
        header('Location: success.php?ref=' . $payment['reference']);
    } else {
        header('Location: payment-failed.php?ref=' . $payment['reference']);
    }
    exit;
    
} catch (Exception $e) {
    // Log error and redirect to failure page
    error_log('Paystack callback error: ' . $e->getMessage());
    header('Location: payment-failed.php?error=' . urlencode($e->getMessage()));
    exit;
}

function sendPaymentConfirmation($payment) {
    $to = $payment['payer_email'];
    $subject = "Payment Confirmed - HAUZISHA Services";
    
    $packageNames = [
        'listing' => 'Basic Listing',
        'basic' => 'Professional Package',
        'premium' => 'Premium 3D Experience'
    ];
    
    $packageName = $packageNames[$payment['service_type']] ?? ucfirst($payment['service_type']);
    
    $message = "
Dear {$payment['payer_name']},

Your payment has been successfully processed!

Payment Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Reference: {$payment['reference']}
Service: {$packageName}
Amount: KES " . number_format($payment['amount']) . "
Property: {$payment['property_name']}
Location: {$payment['property_location']}
Date: " . date('F j, Y \a\t g:i A', strtotime($payment['created_at'])) . "
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

What Happens Next?
• Our team will contact you within 24 hours
• We'll schedule your property visit and photography session
• Professional content will be created within 3-5 business days
• Your property will be published with verification badges

Need Help?
📞 +254 791 488 881
📧 services@hauzisha.com
💬 WhatsApp Support Available

Thank you for choosing HAUZISHA!

Best regards,
HAUZISHA Team
    ";
    
    $headers = "From: HAUZISHA <services@hauzisha.com>\r\n";
    $headers .= "Reply-To: services@hauzisha.com\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();
    
    mail($to, $subject, $message, $headers);
}
?>

