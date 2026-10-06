<?php
/**
 * Paystack Webhook Handler
 * This receives real-time payment notifications from Paystack
 * 
 * Configure this URL in your Paystack Dashboard:
 * Settings > Webhooks > Add Webhook URL
 */

header('Content-Type: application/json');
require_once '../api/config/database.php';
require_once 'paystack-config.php';

// Log webhook for debugging
$logFile = __DIR__ . '/../logs/paystack-webhooks.log';
$logDir = dirname($logFile);
if (!is_dir($logDir)) {
    mkdir($logDir, 0755, true);
}

try {
    // Get the raw POST data
    $input = file_get_contents('php://input');
    
    // Log the webhook
    file_put_contents($logFile, date('Y-m-d H:i:s') . " - Webhook received\n" . $input . "\n\n", FILE_APPEND);
    
    // Verify webhook signature
    $signature = $_SERVER['HTTP_X_PAYSTACK_SIGNATURE'] ?? '';
    
    if (empty($signature)) {
        throw new Exception('No signature provided');
    }
    
    $paystack = new PaystackAPI();
    if (!$paystack->verifyWebhookSignature($input, $signature)) {
        throw new Exception('Invalid signature');
    }
    
    // Parse the webhook data
    $event = json_decode($input, true);
    
    if (!$event) {
        throw new Exception('Invalid JSON payload');
    }
    
    // Log event type
    file_put_contents($logFile, "Event: " . ($event['event'] ?? 'unknown') . "\n", FILE_APPEND);
    
    // Handle different event types
    switch ($event['event']) {
        case 'charge.success':
            handleChargeSuccess($event['data']);
            break;
            
        case 'charge.failed':
            handleChargeFailed($event['data']);
            break;
            
        case 'transfer.success':
            // Handle successful transfer (if you implement payouts)
            break;
            
        case 'transfer.failed':
            // Handle failed transfer
            break;
            
        default:
            file_put_contents($logFile, "Unhandled event type: " . $event['event'] . "\n", FILE_APPEND);
    }
    
    // Return 200 OK to Paystack
    http_response_code(200);
    echo json_encode(['status' => 'success']);
    
} catch (Exception $e) {
    file_put_contents($logFile, "Error: " . $e->getMessage() . "\n\n", FILE_APPEND);
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

function handleChargeSuccess($data) {
    global $logFile;
    
    try {
        $reference = $data['reference'] ?? null;
        $amount = ($data['amount'] ?? 0) / 100; // Convert from kobo to KES
        $status = $data['status'] ?? '';
        
        if (!$reference) {
            throw new Exception('No reference in charge success event');
        }
        
        file_put_contents($logFile, "Processing charge success for: {$reference}\n", FILE_APPEND);
        
        // Update database
        $database = new Database();
        $conn = $database->getConnection();
        
        $stmt = $conn->prepare("
            UPDATE payment_records 
            SET status = 'completed',
                gateway_response = :gateway_response,
                completed_at = NOW()
            WHERE reference = :reference OR gateway_reference = :reference
        ");
        
        $stmt->execute([
            ':gateway_response' => json_encode($data),
            ':reference' => $reference
        ]);
        
        if ($stmt->rowCount() > 0) {
            file_put_contents($logFile, "Payment updated successfully: {$reference}\n", FILE_APPEND);
            
            // Get payment details for notification
            $paymentStmt = $conn->prepare("
                SELECT * FROM payment_records 
                WHERE reference = :reference OR gateway_reference = :reference
            ");
            $paymentStmt->execute([':reference' => $reference]);
            $payment = $paymentStmt->fetch(PDO::FETCH_ASSOC);
            
            if ($payment) {
                // Send notifications
                sendSuccessNotifications($payment);
            }
        } else {
            file_put_contents($logFile, "No payment record found for: {$reference}\n", FILE_APPEND);
        }
        
    } catch (Exception $e) {
        file_put_contents($logFile, "Error in handleChargeSuccess: " . $e->getMessage() . "\n", FILE_APPEND);
    }
}

function handleChargeFailed($data) {
    global $logFile;
    
    try {
        $reference = $data['reference'] ?? null;
        
        if (!$reference) {
            return;
        }
        
        file_put_contents($logFile, "Processing charge failed for: {$reference}\n", FILE_APPEND);
        
        // Update database
        $database = new Database();
        $conn = $database->getConnection();
        
        $stmt = $conn->prepare("
            UPDATE payment_records 
            SET status = 'failed',
                gateway_response = :gateway_response
            WHERE reference = :reference OR gateway_reference = :reference
        ");
        
        $stmt->execute([
            ':gateway_response' => json_encode($data),
            ':reference' => $reference
        ]);
        
        file_put_contents($logFile, "Payment marked as failed: {$reference}\n", FILE_APPEND);
        
    } catch (Exception $e) {
        file_put_contents($logFile, "Error in handleChargeFailed: " . $e->getMessage() . "\n", FILE_APPEND);
    }
}

function sendSuccessNotifications($payment) {
    // Send email to customer
    $packageNames = [
        'listing' => 'Basic Listing',
        'basic' => 'Professional Package',
        'premium' => 'Premium 3D Experience'
    ];
    
    $packageName = $packageNames[$payment['service_type']] ?? ucfirst($payment['service_type']);
    
    $to = $payment['payer_email'];
    $subject = "Payment Confirmed - HAUZISHA";
    
    $message = "
Dear {$payment['payer_name']},

Your payment has been confirmed!

Reference: {$payment['reference']}
Service: {$packageName}
Amount: KES " . number_format($payment['amount']) . "
Property: {$payment['property_name']}

Our team will contact you within 24 hours.

Best regards,
HAUZISHA Team
+254 791 488 881
    ";
    
    $headers = "From: HAUZISHA <services@hauzisha.com>\r\n";
    mail($to, $subject, $message, $headers);
    
    // Notify admin (optional)
    $adminEmail = "admin@hauzisha.com";
    $adminSubject = "New Payment Received - KES " . number_format($payment['amount']);
    $adminMessage = "
New payment received:

Customer: {$payment['payer_name']}
Phone: {$payment['payer_phone']}
Email: {$payment['payer_email']}
Service: {$packageName}
Amount: KES " . number_format($payment['amount']) . "
Property: {$payment['property_name']}
Location: {$payment['property_location']}
Reference: {$payment['reference']}
    ";
    
    mail($adminEmail, $adminSubject, $adminMessage, $headers);
}
?>

