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
    <title>HAUZISHA - Admin Stores</title>
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
</head>
<body style="background: #000">

    <!-- Sidebar -->
    <?php include 'sidebar.php'; ?>
    <div class="overlay"></div>

    <?php include "header.php";
    renderDashboardHeader("Stores");
    ?>

    <main class="main-content px-3 py-0" style="padding-left: 2rem; padding-right: 2rem;">
        <!-- KPI Cards -->
        <div class="container-fluid mt-4">
            <div class="row g-3" id="kpiCards">
                <div class="col-12 col-md-6 col-lg-3">
                    <div class="dash-card">
                        <h5>Total Stores</h5>
                        <h2 id="kpiTotalStores">0</h2>
                        <small><span id="kpiNewStoresThisMonth">0</span> added this month</small>
                    </div>
                </div>
                <div class="col-12 col-md-6 col-lg-3">
                    <div class="dash-card">
                        <h5>Active</h5>
                        <h2 id="kpiActiveStores">0</h2>
                        <small><span id="kpiActiveStoresPercent">0</span>% of total</small>
                    </div>
                </div>
                <div class="col-12 col-md-6 col-lg-3">
                    <div class="dash-card">
                        <h5>Deleted</h5>
                        <h2 id="kpiDeletedStores">0</h2>
                        <small>Soft-deleted from system</small>
                    </div>
                </div>
                <div class="col-12 col-md-6 col-lg-3">
                    <div class="dash-card">
                        <h5>New This Month</h5>
                        <h2 id="kpiNewStoresThisMonth2">0</h2>
                        <small><span id="kpiNewStoresPercent">0</span>% of total</small>
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
                        <h6>Stores Added Over Time</h6>
                        <canvas id="storesOverTimeChart"></canvas>
                    </div>
                </div>
                <div class="col-12 col-md-6">
                    <div class="chart-card">
                        <h6>Stores Status</h6>
                        <canvas id="storesStatusChart"></canvas>
                    </div>
                </div>
            </div>
        </section>

        <!-- Stores Table -->
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h6 class="text-white mb-4 mt-5" style="font-weight: 700;">All Stores</h6>
            <button class="btn text-dark mb-0" data-bs-toggle="modal" data-bs-target="#addStoreModal" style="background: #ffd700;">
                <i class="fa fa-plus"></i> Add Store
            </button>
        </div>

        <div class="table-responsive px-2 py-5" style="background-color: #000; border: 1px solid #121212; border-radius: 5px;">
            <table id="storeTable" class="display table nowrap" style="width:100%">
                <thead>
                <tr>
                    <th>Logo</th>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Website</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
                </thead>
            </table>
        </div>
    </main>

    <!-- Add Store Modal -->
    <div class="modal fade" id="addStoreModal" tabindex="-1" aria-labelledby="addStoreModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">

            <div class="modal-header">
                <h5 class="modal-title font-weight-bold">
                    <img src="../images/logo.png" style="height: 40px; width: 40px; "/>
                    <strong style="color: #000;">ADD STORE</strong>
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body">
                <form id="addStoreForm" method="POST" enctype="multipart/form-data">
                <div class="row g-3">
                    <div class="col-md-6">
                        <label class="form-label">Store Name</label>
                        <input type="text" class="form-control" name="name" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Website</label>
                        <input type="url" class="form-control" name="website">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-control" name="contact_email">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Phone</label>
                        <input type="text" class="form-control" name="contact_phone">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Logo Image</label>
                        <input type="file" class="form-control" name="logo_image">
                    </div>
                </div>
                <div class="mt-4 text-end">
                    <button type="submit" class="btn btn-warning">Save Store</button>
                </div>
                </form>
            </div>

            </div>
        </div>
    </div>

    <!-- Edit Store Modal -->
    <div class="modal fade" id="editStoreModal" tabindex="-1" aria-labelledby="editStoreModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">

            <div class="modal-header">
                <h5 class="modal-title font-weight-bold">
                    <img src="../images/logo.png" style="height: 40px; width: 40px;" />
                    <strong style="color: #000;">EDIT STORE</strong>
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body">
                <form id="editStoreForm" method="POST" enctype="multipart/form-data">
                <input type="hidden" name="id">

                <div class="row g-3">
                    <div class="col-md-6">
                        <label class="form-label">Store Name</label>
                        <input type="text" class="form-control" name="name" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Website</label>
                        <input type="url" class="form-control" name="website">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-control" name="contact_email">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Phone</label>
                        <input type="text" class="form-control" name="contact_phone">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Logo Image</label>
                        <input type="file" class="form-control" name="logo_image">
                    </div>
                </div>
                <div class="mt-4 text-end">
                    <button type="submit" class="btn btn-warning">Update Store</button>
                </div>
                </form>
            </div>

            </div>
        </div>
    </div>    

    <script src="sidebar.js" defer></script>
    <script src="js/stores.js" defer></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/js/bootstrap.bundle.min.js"></script>

</body>
</html>
