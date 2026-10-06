<?php
require_once '../api/helpers/security.php';

// Require admin authentication and prevent caching
Security::requireAdmin();
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <title>Hauzisha - Admin Dashboard</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <link rel="icon" type="image/svg+xml" href="../images/logo.png">

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css" rel="stylesheet">

    <link rel="preconnect" href="https://fonts.gstatic.com/">
    <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@200;300;400;600;700&amp;display=swap"
        rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

    <link rel="stylesheet" href="../css/font-awesome.min.css">
    <link rel="stylesheet" href="../css/ionicons.min.css">

    <link rel="stylesheet" href="../css/animate.css">
    <link rel="stylesheet" href="../css/flaticon.css">
    <link rel="stylesheet" href="../css/tiny-slider.css">
    <link rel="stylesheet" href="../css/glightbox.min.css">
    <link rel="stylesheet" href="../css/aos.css">
    <link rel="stylesheet" href="../css/style.css">
    <link rel="stylesheet" href="../css/mobile-modals.css">
    <link rel="stylesheet" href="admin.css">
</head>

<body style="background: #000">

    <!-- Sidebar -->
    <?php include 'sidebar.php'; ?>
    <div class="overlay"></div>

    <?php include "header.php";
    renderDashboardHeader("Dashboard");
    ?>

    <main class="main-content px-3 py-0" style="padding-left: 2rem; padding-right: 2rem;">
        <!-- KPI Cards -->
        <div class="container-fluid">
            <div class="row g-3">
                <div class="col-12 col-md-6 col-lg-3">
                    <div class="dash-card" id="properties-card">
                        <h5>Total Properties</h5>
                        <h2>0</h2>
                        <small>Inactive: 0</small>
                    </div>
                </div>
                <div class="col-12 col-md-6 col-lg-3">
                    <div class="dash-card" id="users-card">
                        <h5>Total Users</h5>
                        <h2>0</h2>
                        <small>Inactive: 0</small>
                    </div>
                </div>
                <div class="col-12 col-md-6 col-lg-3">
                    <div class="dash-card" id="agents-card">
                        <h5>Total Agents</h5>
                        <h2>0</h2>
                        <small>Inactive: 0</small>
                    </div>
                </div>

            </div>
        </div>

        <section class="mt-4">
            <h6 class="text-white mb-4 mt-5" style="color:#fff; margin-bottom: 1rem; font-weight: 700;">Analytics
                Overview</h6>
            <div class="row g-3">
                <div class="col-12 col-md-6">
                    <div class="chart-card">
                        <h6>Monthly Bookings</h6>
                        <canvas id="bookingsChart"></canvas>
                    </div>
                </div>

                <div class="col-12 col-md-6">
                    <div class="chart-card">
                        <h6>Property Types</h6>
                        <canvas id="propertyChart"></canvas>
                    </div>
                </div>
                <div class="col-12 col-md-6">
                    <div class="chart-card">
                        <h6>User Growth</h6>
                        <canvas id="usersChart"></canvas>
                    </div>
                </div>
            </div>
        </section>

        <!-- Popular Section -->
        <div class="popular-section">
            <!-- Popular Properties -->
            <div class="popular-card">
                <h6 style="color: #fff;">Popular Properties</h6>
                <div class="popular-list" id="popular-properties">
                    <div class="popular-item">
                        <img src="../images/work-7.jpg" alt="Property">
                        <div class="popular-info">
                            <h6>Loading...</h6>
                            <p>Please wait</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Popular Furniture Models -->
            <div class="popular-card">
                <h6 style="color: #fff;">Popular Furniture Models</h6>
                <div class="popular-list" id="popular-models">
                    <div class="popular-item">
                        <img src="../images/sofa2.jpeg" alt="Model">
                        <div class="popular-info">
                            <h6>Loading...</h6>
                            <p>Please wait</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <hr class="mt-5 mb-4" />

        <!-- Recent Activities -->
        <div class="row">
            <div class="col-12">
                <section>
                    <h6 class="text-white fw-bold mb-2">Recent Activities</h6>
                    <div class="card bg-transparent border-0 shadow-sm activities-card w-100">
                        <div class="card-body px-1">
                            <!-- Scrollable wrapper -->
                            <div class="activities-scroll" style="max-height: 360px; overflow-y: auto;">
                                <ul class="list-group list-group-flush" id="activities-list">
                                    <li class="list-group-item bg-transparent d-flex">
                                        <div>
                                            <div>Loading activities...</div>
                                            <small class="text-warning">Please wait</small>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>

    </main>

    <script src="../js/toast.js"></script>
    <script src="../js/mobile-modals.js"></script>
    <script src="sidebar.js" defer></script>
    <script src="js/dashboard.js" defer></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

</body>

</html>