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
    <title>HAUZISHA - Admin Users</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="icon" type="image/svg+xml" href="../images/logo.png">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="preconnect" href="https://fonts.gstatic.com/">
    <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@200;300;400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link rel="stylesheet" href="../css/style.css">
    <link rel="stylesheet" href="admin.css">
    <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />
    <!-- DataTables Export Buttons -->
    <link rel="stylesheet" href="https://cdn.datatables.net/buttons/2.3.6/css/buttons.dataTables.min.css">
    
    <!-- jQuery and DataTables Scripts -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js"></script>
    <script src="https://cdn.datatables.net/buttons/2.3.6/js/dataTables.buttons.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/pdfmake.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/vfs_fonts.js"></script>
    <script src="https://cdn.datatables.net/buttons/2.3.6/js/buttons.html5.min.js"></script>
    <script src="https://cdn.datatables.net/buttons/2.3.6/js/buttons.print.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <!-- Include html2canvas & jsPDF for PDF generation -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>

    <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
</head>
<body style="background: #000">

    <!-- Sidebar -->
    <?php include 'sidebar.php'; ?>
    <div class="overlay"></div>

    <?php include "header.php";
    renderDashboardHeader("Users");
    ?>

    <main class="main-content px-3 py-0" style="padding-left: 2rem; padding-right: 2rem;">  
        <!-- KPI Cards -->
        <div class="container-fluid mt-4">
            <div class="row g-3" id="kpiCards">
                <div class="col-12 col-md-6 col-lg-3">
                    <div class="dash-card">
                        <h5>Total Users</h5>
                        <h2 id="kpiTotal">0</h2>
                        <small><span id="kpiNewThisMonth">0</span> joined this month</small>
                    </div>
                </div>
                <div class="col-12 col-md-6 col-lg-3">
                    <div class="dash-card">
                        <h5>Active</h5>
                        <h2 id="kpiActive">0</h2>
                        <small><span id="kpiActivePercent">0</span>% of total</small>
                    </div>
                </div>
                <div class="col-12 col-md-6 col-lg-3">
                    <div class="dash-card">
                        <h5>Suspended</h5>
                        <h2 id="kpiSuspended">0</h2>
                        <small>Admins excluded</small>
                    </div>
                </div>
                <div class="col-12 col-md-6 col-lg-3">
                    <div class="dash-card">
                        <h5>New This Month</h5>
                        <h2 id="kpiNewThisMonth2">0</h2>
                        <small><span id="kpiNewPercent">0</span>% of total</small>
                    </div>
                </div>
            </div>
        </div>

        <!-- Charts Section -->
        <section class="mt-4">
            <h6 class="text-white mb-4 mt-5" style="font-weight: 700;">Analytics Overview</h6>
            <div class="row g-3">
                <div class="col-12 col-md-6">
                    <div class="chart-card">
                        <h6>Users Joined Over Time</h6>
                        <canvas id="usersOverTimeChart"></canvas>
                    </div>
                </div>
                <div class="col-12 col-md-6">
                    <div class="chart-card">
                        <h6>Users by Role</h6>
                        <canvas id="userRoleChart"></canvas>
                    </div>
                </div>
            </div>
        </section>

        <!-- Users Table -->
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h6 class="text-white mb-1 mt-5" style="font-weight: 700;">All Users</h6>
        </div>

        <div class="table-responsive px-2 py-5" style="background-color: #000; border: 1px solid #121212; border-radius: 5px;">
            <table id="userTable" class="display table nowrap" style="width:100%">
                <thead>
                <tr>
                    <th>Avatar</th>
                    <th>ID</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
                </thead>
            </table>
        </div>

    </main>

    <script src="sidebar.js" defer></script>
    <script src="js/users.js" defer></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

</body>
</html>
