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
    <title>Hauzisha - Admin Reports</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="icon" type="image/svg+xml" href="../images/logo.png">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="preconnect" href="https://fonts.gstatic.com/">
    <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@200;300;400;600;700&display=swap"
        rel="stylesheet">
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
    renderDashboardHeader("Agents");
    ?>

    <main class="main-content px-3 py-0" style="padding-left: 2rem; padding-right: 2rem;">
        <!-- KPI Cards -->
        <div class="container-fluid mt-4">
            <div class="row g-3" id="kpiCards">
                <div class="col-12 col-md-6 col-lg-3">
                    <div class="dash-card">
                        <h5>Total Agents</h5>
                        <h2 id="kpiTotalAgents">0</h2>
                        <small><span id="kpiNewAgentsThisMonth">0</span> added this month</small>
                    </div>
                </div>
                <div class="col-12 col-md-6 col-lg-3">
                    <div class="dash-card">
                        <h5>Active</h5>
                        <h2 id="kpiActiveAgents">0</h2>
                        <small><span id="kpiActiveAgentsPercent">0</span>% of total</small>
                    </div>
                </div>
                <div class="col-12 col-md-6 col-lg-3">
                    <div class="dash-card">
                        <h5>Deleted</h5>
                        <h2 id="kpiDeletedAgents">0</h2>
                        <small>Soft-deleted from system</small>
                    </div>
                </div>
                <div class="col-12 col-md-6 col-lg-3">
                    <div class="dash-card">
                        <h5>New This Month</h5>
                        <h2 id="kpiNewAgentsThisMonth2">0</h2>
                        <small><span id="kpiNewAgentsPercent">0</span>% of total</small>
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
                        <h6>Agents Added Over Time</h6>
                        <canvas id="agentsOverTimeChart"></canvas>
                    </div>
                </div>
                <div class="col-12 col-md-6">
                    <div class="chart-card">
                        <h6>Agents Status</h6>
                        <canvas id="agentsStatusChart"></canvas>
                    </div>
                </div>
            </div>
        </section>

        <!-- Agents Table -->
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h6 class="text-white mb-4 mt-5" style="font-weight: 700;">All Agents</h6>
            <button class="btn text-dark mb-0" data-bs-toggle="modal" data-bs-target="#addAgentModal"
                style="background: #ffd700;">
                <i class="fa fa-plus"></i> Add Agent
            </button>
        </div>

        <div class="table-responsive px-2 py-5"
            style="background-color: #000; border: 1px solid #121212; border-radius: 5px;">
            <table id="agentTable" class="display table nowrap" style="width:100%">
                <thead>
                    <tr>
                        <th>Avatar</th>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>WhatsApp</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
            </table>
        </div>
    </main>

    <!-- Add Agent Modal -->
    <div class="modal fade" id="addAgentModal" tabindex="-1" aria-labelledby="addAgentModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">

                <div class="modal-header">
                    <h5 class="modal-title font-weight-bold">
                        <img src="../images/logo.png" style="height: 40px; width: 40px; " />
                        <strong style="color: #000;">ADD AGENT</strong>
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>

                <div class="modal-body">
                    <form id="addAgentForm" method="POST" enctype="multipart/form-data">
                        <div class="row g-3">
                            <div class="col-md-6">
                                <label class="form-label">First Name</label>
                                <input type="text" class="form-control" name="firstname" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Last Name</label>
                                <input type="text" class="form-control" name="lastname" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Email</label>
                                <input type="email" class="form-control" name="email">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Phone</label>
                                <input type="number" class="form-control" name="phone">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">WhatsApp</label>
                                <input type="number" class="form-control" name="whatsapp_no">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Profile Image</label>
                                <input type="file" class="form-control" name="image">
                            </div>
                        </div>
                        <div class="mt-4 text-end">
                            <button type="submit" class="btn btn-warning">Save Agent</button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    </div>

    <!-- Edit Agent Modal -->
    <div class="modal fade" id="editAgentModal" tabindex="-1" aria-labelledby="editAgentModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">

                <div class="modal-header">
                    <h5 class="modal-title font-weight-bold">
                        <img src="../images/logo.png" style="height: 40px; width: 40px;" />
                        <strong style="color: #000;">EDIT AGENT</strong>
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>

                <div class="modal-body">
                    <form id="editAgentForm" method="POST" enctype="multipart/form-data">
                        <input type="hidden" name="id">

                        <div class="row g-3">
                            <div class="col-md-6">
                                <label class="form-label">First Name</label>
                                <input type="text" class="form-control" name="firstname" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Last Name</label>
                                <input type="text" class="form-control" name="lastname" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Email</label>
                                <input type="email" class="form-control" name="email">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Phone</label>
                                <input type="number" class="form-control" name="phone">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">WhatsApp</label>
                                <input type="number" class="form-control" name="whatsapp_no">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Profile Image</label>
                                <input type="file" class="form-control" name="image">
                            </div>
                        </div>
                        <div class="mt-4 text-end">
                            <button type="submit" class="btn btn-warning">Update Agent</button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    </div>

    <script src="sidebar.js" defer></script>
    <script src="js/agents.js" defer></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/js/bootstrap.bundle.min.js"></script>

</body>

</html>