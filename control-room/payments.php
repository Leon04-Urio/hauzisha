<?php
session_start();

// Check if user is logged in and is admin
if (!isset($_SESSION['user_id']) || !isset($_SESSION['admin_logged_in'])) {
    header('Location: ../index.php');
    exit();
}

require_once '../api/config/database.php';

// Get payment records
try {
    $database = new Database();
    $conn = $database->getConnection();
    
    // Get filter parameters
    $status_filter = $_GET['status'] ?? '';
    $service_filter = $_GET['service'] ?? '';
    $date_from = $_GET['date_from'] ?? '';
    $date_to = $_GET['date_to'] ?? '';
    
    // Build query
    $query = "SELECT * FROM payment_records WHERE 1=1";
    $params = [];
    
    if (!empty($status_filter)) {
        $query .= " AND status = :status";
        $params[':status'] = $status_filter;
    }
    
    if (!empty($service_filter)) {
        $query .= " AND service_type = :service_type";
        $params[':service_type'] = $service_filter;
    }
    
    if (!empty($date_from)) {
        $query .= " AND DATE(created_at) >= :date_from";
        $params[':date_from'] = $date_from;
    }
    
    if (!empty($date_to)) {
        $query .= " AND DATE(created_at) <= :date_to";
        $params[':date_to'] = $date_to;
    }
    
    $query .= " ORDER BY created_at DESC";
    
    $stmt = $conn->prepare($query);
    $stmt->execute($params);
    $payments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get summary statistics
    $statsQuery = "SELECT 
        COUNT(*) as total_payments,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_revenue,
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_amount,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_payments,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments
        FROM payment_records";
    
    $statsStmt = $conn->prepare($statsQuery);
    $statsStmt->execute();
    $stats = $statsStmt->fetch(PDO::FETCH_ASSOC);
    
} catch (Exception $e) {
    $error = "Error fetching payment records: " . $e->getMessage();
}

// Package names mapping
$packageNames = [
    'listing' => 'Basic Listing',
    'basic' => 'Basic Package',
    'premium' => 'Premium Package',
    'featured' => 'Featured Placement'
];

// Status colors
$statusColors = [
    'pending' => 'warning',
    'completed' => 'success',
    'failed' => 'danger',
    'refunded' => 'info'
];
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Service Payments - HAUZISHA Admin</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="admin.css">
    
    <style>
        .stats-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 20px;
        }
        
        .stats-card h3 {
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .stats-card p {
            margin: 0;
            opacity: 0.9;
        }
        
        .payment-card {
            border: none;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 15px;
            transition: transform 0.2s ease;
        }
        
        .payment-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        
        .payment-header {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 12px 12px 0 0;
            padding: 15px 20px;
            border-bottom: 1px solid #dee2e6;
        }
        
        .payment-body {
            padding: 20px;
        }
        
        .reference-badge {
            background: #007bff;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-family: monospace;
            font-size: 0.9rem;
        }
        
        .amount-display {
            font-size: 1.5rem;
            font-weight: bold;
            color: #28a745;
        }
        
        .property-info {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 12px;
            margin: 10px 0;
        }
        
        .filter-section {
            background: white;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <div class="container-fluid">
        <div class="row">
            <!-- Sidebar -->
            <?php include 'sidebar.php'; ?>
            
            <!-- Main Content -->
            <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
                <?php include 'header.php'; ?>
                
                <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                    <h1 class="h2"><i class="fas fa-credit-card me-2"></i>Service Payments</h1>
                    <div class="btn-toolbar mb-2 mb-md-0">
                        <button class="btn btn-outline-secondary" onclick="exportPayments()">
                            <i class="fas fa-download me-1"></i>Export
                        </button>
                    </div>
                </div>

                <?php if (isset($error)): ?>
                    <div class="alert alert-danger"><?php echo $error; ?></div>
                <?php endif; ?>

                <!-- Statistics Cards -->
                <div class="row mb-4">
                    <div class="col-md-3">
                        <div class="stats-card">
                            <h3><?php echo number_format($stats['total_payments'] ?? 0); ?></h3>
                            <p>Total Payments</p>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stats-card" style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);">
                            <h3>KES <?php echo number_format($stats['total_revenue'] ?? 0); ?></h3>
                            <p>Total Revenue</p>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stats-card" style="background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); color: #333;">
                            <h3><?php echo number_format($stats['pending_payments'] ?? 0); ?></h3>
                            <p>Pending Payments</p>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stats-card" style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: #333;">
                            <h3>KES <?php echo number_format($stats['pending_amount'] ?? 0); ?></h3>
                            <p>Pending Amount</p>
                        </div>
                    </div>
                </div>

                <!-- Filters -->
                <div class="filter-section">
                    <form method="GET" class="row g-3">
                        <div class="col-md-2">
                            <label class="form-label">Status</label>
                            <select name="status" class="form-select">
                                <option value="">All Status</option>
                                <option value="pending" <?php echo $status_filter == 'pending' ? 'selected' : ''; ?>>Pending</option>
                                <option value="completed" <?php echo $status_filter == 'completed' ? 'selected' : ''; ?>>Completed</option>
                                <option value="failed" <?php echo $status_filter == 'failed' ? 'selected' : ''; ?>>Failed</option>
                                <option value="refunded" <?php echo $status_filter == 'refunded' ? 'selected' : ''; ?>>Refunded</option>
                            </select>
                        </div>
                        <div class="col-md-2">
                            <label class="form-label">Service</label>
                            <select name="service" class="form-select">
                                <option value="">All Services</option>
                                <option value="listing" <?php echo $service_filter == 'listing' ? 'selected' : ''; ?>>Basic Listing</option>
                                <option value="basic" <?php echo $service_filter == 'basic' ? 'selected' : ''; ?>>Basic Package</option>
                                <option value="premium" <?php echo $service_filter == 'premium' ? 'selected' : ''; ?>>Premium Package</option>
                                <option value="featured" <?php echo $service_filter == 'featured' ? 'selected' : ''; ?>>Featured Placement</option>
                            </select>
                        </div>
                        <div class="col-md-2">
                            <label class="form-label">From Date</label>
                            <input type="date" name="date_from" class="form-control" value="<?php echo $date_from; ?>">
                        </div>
                        <div class="col-md-2">
                            <label class="form-label">To Date</label>
                            <input type="date" name="date_to" class="form-control" value="<?php echo $date_to; ?>">
                        </div>
                        <div class="col-md-2">
                            <label class="form-label">&nbsp;</label>
                            <div>
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-filter me-1"></i>Filter
                                </button>
                                <a href="payments.php" class="btn btn-outline-secondary">Clear</a>
                            </div>
                        </div>
                    </form>
                </div>

                <!-- Payment Records -->
                <div class="row">
                    <?php if (empty($payments)): ?>
                        <div class="col-12">
                            <div class="text-center py-5">
                                <i class="fas fa-receipt fa-3x text-muted mb-3"></i>
                                <h4 class="text-muted">No payment records found</h4>
                                <p class="text-muted">Payment records will appear here once customers start purchasing services.</p>
                            </div>
                        </div>
                    <?php else: ?>
                        <?php foreach ($payments as $payment): ?>
                            <div class="col-md-6 col-lg-4">
                                <div class="card payment-card">
                                    <div class="payment-header">
                                        <div class="d-flex justify-content-between align-items-center">
                                            <span class="reference-badge"><?php echo $payment['reference']; ?></span>
                                            <span class="badge bg-<?php echo $statusColors[$payment['status']]; ?>">
                                                <?php echo ucfirst($payment['status']); ?>
                                            </span>
                                        </div>
                                    </div>
                                    <div class="payment-body">
                                        <div class="d-flex justify-content-between align-items-center mb-3">
                                            <h5 class="mb-0"><?php echo $packageNames[$payment['service_type']] ?? ucfirst($payment['service_type']); ?></h5>
                                            <span class="amount-display">KES <?php echo number_format($payment['amount']); ?></span>
                                        </div>
                                        
                                        <div class="property-info">
                                            <h6 class="mb-2"><i class="fas fa-home me-1"></i><?php echo htmlspecialchars($payment['property_name']); ?></h6>
                                            <small class="text-muted">
                                                <i class="fas fa-map-marker-alt me-1"></i><?php echo htmlspecialchars($payment['property_location']); ?><br>
                                                <i class="fas fa-tag me-1"></i><?php echo ucfirst($payment['property_type']); ?> - KES <?php echo number_format($payment['property_price']); ?>
                                            </small>
                                        </div>
                                        
                                        <div class="mt-3">
                                            <small class="text-muted">
                                                <strong>Customer:</strong> <?php echo htmlspecialchars($payment['payer_name']); ?><br>
                                                <strong>Phone:</strong> <?php echo $payment['payer_phone']; ?><br>
                                                <strong>Email:</strong> <?php echo htmlspecialchars($payment['payer_email']); ?><br>
                                                <strong>Payment Method:</strong> <?php echo ucfirst($payment['payment_method']); ?><br>
                                                <strong>Date:</strong> <?php echo date('M j, Y g:i A', strtotime($payment['created_at'])); ?>
                                            </small>
                                        </div>
                                        
                                        <?php if (!empty($payment['notes'])): ?>
                                            <div class="mt-2">
                                                <small><strong>Notes:</strong> <?php echo htmlspecialchars($payment['notes']); ?></small>
                                            </div>
                                        <?php endif; ?>
                                        
                                        <div class="mt-3 d-flex gap-2">
                                            <?php if ($payment['status'] == 'pending'): ?>
                                                <button class="btn btn-sm btn-success" onclick="updatePaymentStatus('<?php echo $payment['reference']; ?>', 'completed')">
                                                    <i class="fas fa-check me-1"></i>Mark Completed
                                                </button>
                                                <button class="btn btn-sm btn-danger" onclick="updatePaymentStatus('<?php echo $payment['reference']; ?>', 'failed')">
                                                    <i class="fas fa-times me-1"></i>Mark Failed
                                                </button>
                                            <?php endif; ?>
                                            <button class="btn btn-sm btn-outline-primary" onclick="viewPaymentDetails('<?php echo $payment['reference']; ?>')">
                                                <i class="fas fa-eye me-1"></i>Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </main>
        </div>
    </div>

    <!-- Payment Details Modal -->
    <div class="modal fade" id="paymentDetailsModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Payment Details</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body" id="paymentDetailsContent">
                    <!-- Content loaded via JavaScript -->
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        function updatePaymentStatus(reference, status) {
            if (confirm(`Are you sure you want to mark this payment as ${status}?`)) {
                fetch('update-payment-status.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        reference: reference,
                        status: status
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        location.reload();
                    } else {
                        alert('Error updating payment status: ' + data.message);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('An error occurred while updating the payment status.');
                });
            }
        }

        function viewPaymentDetails(reference) {
            fetch(`payment-details.php?reference=${reference}`)
                .then(response => response.text())
                .then(html => {
                    document.getElementById('paymentDetailsContent').innerHTML = html;
                    new bootstrap.Modal(document.getElementById('paymentDetailsModal')).show();
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Error loading payment details.');
                });
        }

        function exportPayments() {
            const params = new URLSearchParams(window.location.search);
            params.set('export', '1');
            window.location.href = 'export-payments.php?' + params.toString();
        }
    </script>
</body>
</html>