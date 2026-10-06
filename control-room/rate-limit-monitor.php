<?php
session_start();
require_once '../api/middleware/RateLimiter.php';
require_once '../api/helpers/rate_limit_cleanup.php';

// Check if user is admin (you may need to adjust this based on your auth system)
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    header('Location: ../auth/login.php');
    exit;
}

$rateLimiter = new RateLimiter();
$cleanup = new RateLimitCleanup();

// Handle actions
if ($_POST['action'] ?? '' === 'cleanup') {
    $cleanup->run();
    $message = "Cleanup completed successfully!";
}

$stats = $cleanup->getStats();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rate Limit Monitor - Hauzisha</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        body { background-color: #f8f9fa; }
        .card { box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075); }
        .stat-card { transition: transform 0.2s; }
        .stat-card:hover { transform: translateY(-2px); }
        .log-container { max-height: 400px; overflow-y: auto; background: #f8f9fa; }
        .violation-entry { font-family: monospace; font-size: 0.85rem; }
    </style>
</head>
<body>
    <div class="container-fluid py-4">
        <div class="row">
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h1><i class="fas fa-shield-alt text-primary"></i> Rate Limit Monitor</h1>
                    <a href="index.php" class="btn btn-outline-secondary">
                        <i class="fas fa-arrow-left"></i> Back to Control Room
                    </a>
                </div>

                <?php if (isset($message)): ?>
                    <div class="alert alert-success alert-dismissible fade show" role="alert">
                        <?= htmlspecialchars($message) ?>
                        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    </div>
                <?php endif; ?>

                <!-- Statistics Cards -->
                <div class="row mb-4">
                    <div class="col-md-3">
                        <div class="card stat-card text-center">
                            <div class="card-body">
                                <i class="fas fa-file-alt fa-2x text-primary mb-2"></i>
                                <h5 class="card-title"><?= $stats['cache_files'] ?></h5>
                                <p class="card-text text-muted">Cache Files</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card stat-card text-center">
                            <div class="card-body">
                                <i class="fas fa-hdd fa-2x text-info mb-2"></i>
                                <h5 class="card-title"><?= number_format($stats['cache_size'] / 1024, 1) ?> KB</h5>
                                <p class="card-text text-muted">Cache Size</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card stat-card text-center">
                            <div class="card-body">
                                <i class="fas fa-exclamation-triangle fa-2x text-warning mb-2"></i>
                                <h5 class="card-title"><?= $stats['violation_entries'] ?></h5>
                                <p class="card-text text-muted">Violations</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card stat-card text-center">
                            <div class="card-body">
                                <i class="fas fa-clock fa-2x text-success mb-2"></i>
                                <h5 class="card-title"><?= $stats['last_cleanup'] ? date('H:i', strtotime($stats['last_cleanup'])) : 'Never' ?></h5>
                                <p class="card-text text-muted">Last Cleanup</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Rate Limit Configuration -->
                <div class="row mb-4">
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">
                                <h5><i class="fas fa-cog"></i> Rate Limit Configuration</h5>
                            </div>
                            <div class="card-body">
                                <div class="table-responsive">
                                    <table class="table table-sm">
                                        <thead>
                                            <tr>
                                                <th>Endpoint</th>
                                                <th>Limit</th>
                                                <th>Window</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td><span class="badge bg-primary">Default</span></td>
                                                <td>100 requests</td>
                                                <td>1 hour</td>
                                            </tr>
                                            <tr>
                                                <td><span class="badge bg-warning">Auth</span></td>
                                                <td>10 requests</td>
                                                <td>15 minutes</td>
                                            </tr>
                                            <tr>
                                                <td><span class="badge bg-info">Search</span></td>
                                                <td>200 requests</td>
                                                <td>1 hour</td>
                                            </tr>
                                            <tr>
                                                <td><span class="badge bg-success">Upload</span></td>
                                                <td>20 requests</td>
                                                <td>1 hour</td>
                                            </tr>
                                            <tr>
                                                <td><span class="badge bg-danger">Strict</span></td>
                                                <td>30 requests</td>
                                                <td>1 hour</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">
                                <h5><i class="fas fa-tools"></i> Actions</h5>
                            </div>
                            <div class="card-body">
                                <form method="POST" class="mb-3">
                                    <input type="hidden" name="action" value="cleanup">
                                    <button type="submit" class="btn btn-primary">
                                        <i class="fas fa-broom"></i> Run Cleanup Now
                                    </button>
                                </form>
                                
                                <div class="alert alert-info">
                                    <i class="fas fa-info-circle"></i>
                                    <strong>Automatic Cleanup:</strong> Set up a cron job to run cleanup automatically:
                                    <code class="d-block mt-2">*/5 * * * * php <?= __DIR__ ?>/../api/helpers/rate_limit_cleanup.php</code>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Recent Violations -->
                <div class="card">
                    <div class="card-header">
                        <h5><i class="fas fa-exclamation-triangle"></i> Recent Rate Limit Violations</h5>
                    </div>
                    <div class="card-body">
                        <div class="log-container p-3 border rounded">
                            <?php
                            $violationLogFile = '../api/cache/rate_limit_violations.log';
                            if (file_exists($violationLogFile)) {
                                $lines = file($violationLogFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
                                $recentLines = array_slice(array_reverse($lines), 0, 50); // Show last 50 entries
                                
                                if (empty($recentLines)) {
                                    echo '<p class="text-muted">No violations recorded.</p>';
                                } else {
                                    foreach ($recentLines as $line) {
                                        echo '<div class="violation-entry text-danger">' . htmlspecialchars($line) . '</div>';
                                    }
                                }
                            } else {
                                echo '<p class="text-muted">No violation log file found.</p>';
                            }
                            ?>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Auto-refresh every 30 seconds
        setTimeout(() => {
            location.reload();
        }, 30000);
    </script>
</body>
</html>