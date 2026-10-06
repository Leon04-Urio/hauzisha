<?php
session_start();

// Check if user is logged in and is admin
if (!isset($_SESSION['user_id']) || !isset($_SESSION['admin_logged_in'])) {
    echo '<div class="alert alert-danger">Unauthorized access</div>';
    exit();
}

require_once '../api/config/database.php';

$reference = $_GET['reference'] ?? '';

if (empty($reference)) {
    echo '<div class="alert alert-danger">Invalid reference number</div>';
    exit();
}

try {
    $database = new Database();
    $conn = $database->getConnection();

    $stmt = $conn->prepare("SELECT * FROM payment_records WHERE reference = :reference");
    $stmt->execute([':reference' => $reference]);
    $payment = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$payment) {
        echo '<div class="alert alert-danger">Payment record not found</div>';
        exit();
    }

    // Package names mapping
    $packageNames = [
        'listing' => 'Basic Listing',
        'basic' => 'Basic Package',
        'premium' => 'Premium Package',
        'featured' => 'Featured Placement'
    ];

    // Decode gateway response if it exists
    $gatewayResponse = null;
    if (!empty($payment['gateway_response'])) {
        $gatewayResponse = json_decode($payment['gateway_response'], true);
    }

} catch (Exception $e) {
    echo '<div class="alert alert-danger">Error: ' . $e->getMessage() . '</div>';
    exit();
}
?>

<div class="row">
    <div class="col-md-6">
        <h6 class="text-primary mb-3">Payment Information</h6>
        <table class="table table-sm">
            <tr>
                <td><strong>Reference:</strong></td>
                <td><span class="badge bg-primary"><?php echo $payment['reference']; ?></span></td>
            </tr>
            <tr>
                <td><strong>Status:</strong></td>
                <td>
                    <?php
                    $statusColors = [
                        'pending' => 'warning',
                        'completed' => 'success',
                        'failed' => 'danger',
                        'refunded' => 'info'
                    ];
                    ?>
                    <span class="badge bg-<?php echo $statusColors[$payment['status']]; ?>">
                        <?php echo ucfirst($payment['status']); ?>
                    </span>
                </td>
            </tr>
            <tr>
                <td><strong>Service:</strong></td>
                <td><?php echo $packageNames[$payment['service_type']] ?? ucfirst($payment['service_type']); ?></td>
            </tr>
            <tr>
                <td><strong>Amount:</strong></td>
                <td><strong class="text-success">KES <?php echo number_format($payment['amount']); ?></strong></td>
            </tr>
            <tr>
                <td><strong>Payment Method:</strong></td>
                <td><?php echo ucfirst($payment['payment_method']); ?></td>
            </tr>
            <tr>
                <td><strong>Created:</strong></td>
                <td><?php echo date('F j, Y \a\t g:i A', strtotime($payment['created_at'])); ?></td>
            </tr>
            <?php if ($payment['completed_at']): ?>
                <tr>
                    <td><strong>Completed:</strong></td>
                    <td><?php echo date('F j, Y \a\t g:i A', strtotime($payment['completed_at'])); ?></td>
                </tr>
            <?php endif; ?>
        </table>
    </div>

    <div class="col-md-6">
        <h6 class="text-primary mb-3">Customer Information</h6>
        <table class="table table-sm">
            <tr>
                <td><strong>Name:</strong></td>
                <td><?php echo htmlspecialchars($payment['payer_name']); ?></td>
            </tr>
            <tr>
                <td><strong>Phone:</strong></td>
                <td>
                    <a href="tel:<?php echo $payment['payer_phone']; ?>" class="text-decoration-none">
                        <?php echo $payment['payer_phone']; ?>
                    </a>
                </td>
            </tr>
            <tr>
                <td><strong>Email:</strong></td>
                <td>
                    <a href="mailto:<?php echo $payment['payer_email']; ?>" class="text-decoration-none">
                        <?php echo htmlspecialchars($payment['payer_email']); ?>
                    </a>
                </td>
            </tr>
        </table>

        <h6 class="text-primary mb-3 mt-4">Property Information</h6>
        <table class="table table-sm">
            <tr>
                <td><strong>Property Name:</strong></td>
                <td><?php echo htmlspecialchars($payment['property_name']); ?></td>
            </tr>
            <tr>
                <td><strong>Type:</strong></td>
                <td><?php echo ucfirst($payment['property_type']); ?></td>
            </tr>
            <tr>
                <td><strong>Location:</strong></td>
                <td><?php echo htmlspecialchars($payment['property_location']); ?></td>
            </tr>
            <tr>
                <td><strong>Property Price:</strong></td>
                <td>KES <?php echo number_format($payment['property_price']); ?></td>
            </tr>
        </table>
    </div>
</div>

<?php if (!empty($payment['notes'])): ?>
    <div class="row mt-3">
        <div class="col-12">
            <h6 class="text-primary mb-3">Additional Notes</h6>
            <div class="alert alert-light">
                <?php echo nl2br(htmlspecialchars($payment['notes'])); ?>
            </div>
        </div>
    </div>
<?php endif; ?>

<?php if ($gatewayResponse): ?>
    <div class="row mt-3">
        <div class="col-12">
            <h6 class="text-primary mb-3">Gateway Response</h6>
            <div class="alert alert-info">
                <pre class="mb-0"><?php echo json_encode($gatewayResponse, JSON_PRETTY_PRINT); ?></pre>
            </div>
        </div>
    </div>
<?php endif; ?>

<div class="row mt-4">
    <div class="col-12">
        <div class="d-flex gap-2">
            <?php if ($payment['status'] == 'pending'): ?>
                <button class="btn btn-success btn-sm"
                    onclick="updatePaymentStatus('<?php echo $payment['reference']; ?>', 'completed')">
                    <i class="fas fa-check me-1"></i>Mark as Completed
                </button>
                <button class="btn btn-danger btn-sm"
                    onclick="updatePaymentStatus('<?php echo $payment['reference']; ?>', 'failed')">
                    <i class="fas fa-times me-1"></i>Mark as Failed
                </button>
            <?php elseif ($payment['status'] == 'completed'): ?>
                <button class="btn btn-warning btn-sm"
                    onclick="updatePaymentStatus('<?php echo $payment['reference']; ?>', 'refunded')">
                    <i class="fas fa-undo me-1"></i>Process Refund
                </button>
            <?php endif; ?>

            <button class="btn btn-outline-primary btn-sm"
                onclick="contactCustomer('<?php echo $payment['payer_phone']; ?>', '<?php echo htmlspecialchars($payment['payer_name']); ?>')">
                <i class="fas fa-phone me-1"></i>Contact Customer
            </button>

            <button class="btn btn-outline-secondary btn-sm" onclick="window.print()">
                <i class="fas fa-print me-1"></i>Print Receipt
            </button>
        </div>
    </div>
</div>

<script>
    function contactCustomer(phone, name) {
        const message = `Hello ${name}, this is HAUZISHA regarding your recent service payment. How can we assist you?`;
        const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }
</script>