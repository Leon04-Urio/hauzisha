<?php
session_start();
header('Content-Type: application/json');

// Check if user is logged in and is admin
if (!isset($_SESSION['user_id']) || !isset($_SESSION['admin_logged_in'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

require_once '../api/config/database.php';

try {
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['reference']) || !isset($input['status'])) {
        throw new Exception('Invalid input data');
    }
    
    $reference = $input['reference'];
    $status = $input['status'];
    
    // Validate status
    $validStatuses = ['pending', 'completed', 'failed', 'refunded'];
    if (!in_array($status, $validStatuses)) {
        throw new Exception('Invalid status');
    }
    
    // Update payment status
    $database = new Database();
    $conn = $database->getConnection();
    
    $stmt = $conn->prepare("
        UPDATE payment_records 
        SET status = :status, completed_at = CASE WHEN :status = 'completed' THEN NOW() ELSE completed_at END
        WHERE reference = :reference
    ");
    
    $stmt->execute([
        ':status' => $status,
        ':reference' => $reference
    ]);
    
    if ($stmt->rowCount() > 0) {
        // Log the status change
        error_log("Payment status updated: {$reference} -> {$status} by admin user {$_SESSION['user_id']}");
        
        echo json_encode([
            'success' => true,
            'message' => 'Payment status updated successfully'
        ]);
    } else {
        throw new Exception('Payment record not found');
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>