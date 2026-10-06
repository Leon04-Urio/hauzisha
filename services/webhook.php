<?php
// Payment Gateway Webhook Handler
// This handles callbacks from IntaSend, Paystack, or other payment gateways

header('Content-Type: application/json');
require_once '../api/config/database.php';

// Log all webhook requests for debugging
$logData = [
    'timestamp' => date('Y-m-d H:i:s'),
    'method' => $_SERVER['REQUEST_METHOD'],
    'headers' => getallheaders(),
    'body' => file_get_contents('php://input'),
    'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
];

error_log('Webhook received: ' . json_encode($logData), 3, '/tmp/loft_webhooks.log');

try {
    // Get the raw POST data
    $payload = file_get_contents('php://input');
    $data = json_decode($payload, true);
    
    if (!$data) {
        throw new Exception('Invalid JSON payload');
    }
    
    // Determine the payment gateway based on the payload structure
    $gateway = detectGateway($data);
    
    // Process based on gateway
    switch ($gateway) {
        case 'intasend':
            handleIntaSendWebhook($data);
            break;
        case 'paystack':
            handlePaystackWebhook($data);
            break;
        case 'mpesa':
            handleMpesaWebhook($data);
            break;
        default:
            throw new Exception('Unknown payment gateway');
    }
    
    // Return success response
    echo json_encode(['status' => 'success', 'message' => 'Webhook processed']);
    
} catch (Exception $e) {
    error_log('Webhook error: ' . $e->getMessage(), 3, '/tmp/loft_webhooks.log');
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

function detectGateway($data) {
    // IntaSend webhook detection
    if (isset($data['invoice_id']) || isset($data['api_ref'])) {
        return 'intasend';
    }
    
    // Paystack webhook detection
    if (isset($data['event']) && isset($data['data']['reference'])) {
        return 'paystack';
    }
    
    // M-Pesa webhook detection
    if (isset($data['Body']['stkCallback'])) {
        return 'mpesa';
    }
    
    return 'unknown';
}

function handleIntaSendWebhook($data) {
    // IntaSend webhook handling
    $reference = $data['api_ref'] ?? null;
    $status = $data['state'] ?? null;
    $amount = $data['value'] ?? null;
    
    if (!$reference) {
        throw new Exception('Missing reference in IntaSend webhook');
    }
    
    // Map IntaSend status to our status
    $ourStatus = 'pending';
    switch (strtolower($status)) {
        case 'complete':
        case 'completed':
            $ourStatus = 'completed';
            break;
        case 'failed':
        case 'cancelled':
            $ourStatus = 'failed';
            break;
    }
    
    updatePaymentStatus($reference, $ourStatus, $data);
}

function handlePaystackWebhook($data) {
    // Paystack webhook handling
    $event = $data['event'] ?? null;
    $reference = $data['data']['reference'] ?? null;
    $status = $data['data']['status'] ?? null;
    $amount = $data['data']['amount'] ?? null;
    
    if (!$reference) {
        throw new Exception('Missing reference in Paystack webhook');
    }
    
    // Only process charge success events
    if ($event !== 'charge.success') {
        return;
    }
    
    // Map Paystack status to our status
    $ourStatus = 'pending';
    switch (strtolower($status)) {
        case 'success':
            $ourStatus = 'completed';
            break;
        case 'failed':
            $ourStatus = 'failed';
            break;
    }
    
    updatePaymentStatus($reference, $ourStatus, $data);
}

function handleMpesaWebhook($data) {
    // M-Pesa STK Push callback handling
    $callback = $data['Body']['stkCallback'] ?? null;
    
    if (!$callback) {
        throw new Exception('Invalid M-Pesa callback structure');
    }
    
    $resultCode = $callback['ResultCode'] ?? null;
    $merchantRequestID = $callback['MerchantRequestID'] ?? null;
    $checkoutRequestID = $callback['CheckoutRequestID'] ?? null;
    
    // Extract reference from callback items
    $reference = null;
    if (isset($callback['CallbackMetadata']['Item'])) {
        foreach ($callback['CallbackMetadata']['Item'] as $item) {
            if ($item['Name'] === 'AccountReference') {
                $reference = $item['Value'];
                break;
            }
        }
    }
    
    if (!$reference) {
        throw new Exception('Missing reference in M-Pesa callback');
    }
    
    // Map M-Pesa result code to our status
    $ourStatus = $resultCode == 0 ? 'completed' : 'failed';
    
    updatePaymentStatus($reference, $ourStatus, $data);
}

function updatePaymentStatus($reference, $status, $gatewayResponse) {
    $database = new Database();
    $conn = $database->getConnection();
    
    // Update payment record
    $stmt = $conn->prepare("
        UPDATE payment_records 
        SET status = :status, 
            gateway_response = :gateway_response,
            completed_at = CASE WHEN :status = 'completed' THEN NOW() ELSE completed_at END
        WHERE reference = :reference
    ");
    
    $stmt->execute([
        ':status' => $status,
        ':gateway_response' => json_encode($gatewayResponse),
        ':reference' => $reference
    ]);
    
    if ($stmt->rowCount() > 0) {
        // Get payment details for notifications
        $paymentStmt = $conn->prepare("SELECT * FROM payment_records WHERE reference = :reference");
        $paymentStmt->execute([':reference' => $reference]);
        $payment = $paymentStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($payment && $status === 'completed') {
            // Send success notification to customer
            sendPaymentSuccessNotification($payment);
            
            // Notify admin of new completed payment
            notifyAdminOfPayment($payment);
        }
        
        error_log("Payment status updated: {$reference} -> {$status}", 3, '/tmp/loft_webhooks.log');
    } else {
        error_log("Payment record not found for reference: {$reference}", 3, '/tmp/loft_webhooks.log');
    }
}

function sendPaymentSuccessNotification($payment) {
    // Send SMS to customer
    $message = "Payment confirmed! Your {$payment['service_type']} service for {$payment['property_name']} has been received. We'll contact you within 24 hours. Ref: {$payment['reference']}";
    
    // Here you would integrate with your SMS service
    // sendSMS($payment['payer_phone'], $message);
    
    // Send email confirmation
    $subject = "Payment Confirmed - HAUZISHA Services";
    $emailMessage = "
        Dear {$payment['payer_name']},
        
        Your payment has been successfully processed!
        
        Reference: {$payment['reference']}
        Service: {$payment['service_type']}
        Amount: KES " . number_format($payment['amount']) . "
        Property: {$payment['property_name']}
        
        Our team will contact you within 24 hours to schedule your service.
        
        Thank you for choosing HAUZISHA!
        
        Best regards,
        HAUZISHA Team
        +254 791 488 881
    ";
    
    $headers = "From: services@hauzisha.com\r\n";
    $headers .= "Reply-To: services@hauzisha.com\r\n";
    
    mail($payment['payer_email'], $subject, $emailMessage, $headers);
}

function notifyAdminOfPayment($payment) {
    // Send notification to admin about new payment
    $adminMessage = "New payment received: KES " . number_format($payment['amount']) . " for {$payment['service_type']} service. Customer: {$payment['payer_name']} ({$payment['payer_phone']})";
    
    // Here you would send SMS/email to admin
    // sendSMS('+254791488881', $adminMessage);
}
?>
