<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// OPTIONAL: Authentication check
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header("Location: index.php");
    exit();
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <title>Hauzisha - Notifications</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="icon" type="image/svg+xml" href="../images/logo.png">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="preconnect" href="https://fonts.gstatic.com/">
    <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@200;300;400;600;700&amp;display=swap"
        rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link rel="stylesheet" href="css/font-awesome.min.css">
    <link rel="stylesheet" href="css/ionicons.min.css">
    <link rel="stylesheet" href="../css/animate.css">
    <link rel="stylesheet" href="../css/flaticon.css">
    <link rel="stylesheet" href="../css/tiny-slider.css">
    <link rel="stylesheet" href="../css/glightbox.min.css">
    <link rel="stylesheet" href="../css/aos.css">
    <link rel="stylesheet" href="../css/style.css">
    <link rel="stylesheet" href="../control-room/admin.css">

    <style>
        .empty-state i {
            font-size: 3rem;
            color: #555;
            margin-bottom: 1rem;
        }

        .empty-state p {
            font-size: 0.9rem;
            color: #555;
        }
    </style>
</head>

<body style="background: #000;">

    <!-- Sidebar -->
    <?php include 'sidebar.php'; ?>
    <div class="overlay"></div>

    <?php include "header.php";
    renderDashboardHeader("Notifications");
    ?>

    <main class="main-content px-3 py-0" style="padding-left: 2rem; padding-right: 2rem;">
        <div class="container">

            <!-- Example Notification (dynamic later) -->
            <div class="notification-card mb-3">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="d-flex align-items-center">
                        <div class="notification-icon">
                            <i class="fa-solid fa-calendar-check"></i>
                        </div>
                        <div>
                            <p class="mb-1 fw-semibold">Your viewing at Skyline Loft has been confirmed.</p>
                            <small class="text-muted">15 Aug 2025 • 3:00 PM</small>
                        </div>
                    </div>
                    <span class="badge bg-warning text-dark">New</span>
                </div>
            </div>

            <!-- Another Example -->
            <div class="notification-card mb-3">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="d-flex align-items-center">
                        <div class="notification-icon">
                            <i class="fa-solid fa-key"></i>
                        </div>
                        <div>
                            <p class="mb-1 fw-semibold">Agent Sarah Johnson shared a property key update.</p>
                            <small class="text-muted">12 Aug 2025 • 11:45 AM</small>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Empty State -->
            <div class="no-notifications text-center p-5 empty-state">
                <i class="fa-regular fa-bell-slash fa-2x mb-3"></i>
                <p class="mb-0">You currently have no new notifications.</p>
            </div>
        </div>
    </main>

    <?php include 'footer2.php'; ?>

    <script src="../js/logout.js" defer></script>
    <script src="../js/toast.js" defer></script>
    <script src="sidebar.js" defer></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

</body>

</html>