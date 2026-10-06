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
    <title>Hauzisha - Admin Models</title>
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

    <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
</head>

<body style="background: #000">

    <!-- Sidebar -->
    <?php include 'sidebar.php'; ?>
    <div class="overlay"></div>

    <?php include "header.php";
    renderDashboardHeader("Models");
    ?>

    <main class="main-content px-3 py-0" style="padding-left: 2rem; padding-right: 2rem;">
        <!-- KPI Cards -->
        <div class="container-fluid mt-4">
            <div class="row g-3" id="kpiCards">
                <div class="col-12 col-md-6 col-lg-3">
                    <div class="dash-card">
                        <h5>Total Models</h5>
                        <h2 id="kpiTotal">0</h2>
                        <small><span id="kpiNewThisMonth">0</span> added this month</small>
                    </div>
                </div>
                <div class="col-12 col-md-6 col-lg-3">
                    <div class="dash-card">
                        <h5>Inactive Models</h5>
                        <h2 id="kpiActive">0</h2>
                        <small><span id="kpiActivePercent">0</span>% of total</small>
                    </div>
                </div>
                <div class="col-12 col-md-6 col-lg-3">
                    <div class="dash-card">
                        <h5>Total Stores</h5>
                        <h2 id="kpiInactive">0</h2>
                        <small>Pending: <span id="kpiPending">0</span></small>
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
                        <h6>Models Added Over Time</h6>
                        <canvas id="modelsOverTimeChart"></canvas>
                    </div>
                </div>
                <div class="col-12 col-md-6">
                    <div class="chart-card">
                        <h6>Model Types</h6>
                        <canvas id="modelTypeChart"></canvas>
                    </div>
                </div>
            </div>
        </section>

        <!-- Models Table -->
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h6 class="text-white mb-4 mt-5" style="font-weight: 700;">All Models</h6>
            <button class="btn text-dark mb-0" data-bs-toggle="modal" data-bs-target="#addModelModal"
                style="background: #ffd700;">
                <i class="fa fa-plus"></i> Add Model
            </button>
        </div>

        <div class="table-responsive px-2 py-5"
            style="background-color: #000; border: 1px solid #121212; border-radius: 5px;">
            <table id="modelTable" class="display table nowrap" style="width:100%">
                <thead>
                    <tr>
                        <th>Thumbnail</th>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Material</th>
                        <th>Size</th>
                        <th>Units</th>
                        <th>Store</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
            </table>
        </div>

    </main>

    <!-- Add Model Modal -->
    <div class="modal fade" id="addModelModal" tabindex="-1" aria-labelledby="addModelModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-centered">
            <div class="modal-content">

                <div class="modal-header">
                    <h5 class="modal-title font-weight-bold" id="addModelModalLabel">
                        <img src="../images/logo.png" style="height: 40px; width: 40px;" />
                        <strong style="color: #000;">ADD MODEL</strong>
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>

                <div class="modal-body">
                    <form id="addModelForm" method="POST" enctype="multipart/form-data">
                        <div class="row g-3">

                            <!-- Name -->
                            <div class="col-md-6">
                                <label class="form-label">Name</label>
                                <input type="text" class="form-control" name="name" required>
                            </div>

                            <!-- Image Upload -->
                            <div class="col-md-6">
                                <label class="form-label">Upload Image</label>
                                <input type="file" class="form-control" name="image" accept="image/*">
                            </div>

                            <!-- Description -->
                            <div class="col-12">
                                <label class="form-label">Description</label>
                                <textarea class="form-control" name="description" rows="3" required></textarea>
                            </div>

                            <!-- Size -->
                            <div class="col-md-4">
                                <label class="form-label">Size</label>
                                <input type="text" class="form-control" name="size" required>
                            </div>

                            <!-- Material -->
                            <div class="col-md-4">
                                <label class="form-label">Material</label>
                                <input type="text" class="form-control" name="material" required>
                            </div>

                            <!-- Units -->
                            <div class="col-md-4">
                                <label class="form-label">Units</label>
                                <input type="number" class="form-control" name="units" required>
                            </div>

                            <!-- Seater -->
                            <div class="col-md-4">
                                <label class="form-label">Seater</label>
                                <input type="number" class="form-control" name="seater">
                            </div>

                            <!-- Price -->
                            <div class="col-md-4">
                                <label class="form-label">Price</label>
                                <input type="number" step="0.01" class="form-control" name="price" required>
                            </div>

                            <!-- Purchase Link -->
                            <div class="col-md-4">
                                <label class="form-label">Purchase Link</label>
                                <input type="url" class="form-control" name="purchase_link">
                            </div>

                            <!-- Category -->
                            <div class="col-md-6">
                                <label class="form-label">Category</label>
                                <input type="text" class="form-control" name="category" required>
                            </div>

                            <!-- Cloud Link -->
                            <div class="col-md-6">
                                <label class="form-label">Cloud Link</label>
                                <input type="url" class="form-control" name="cloud_link">
                            </div>

                            <!-- Store ID -->
                            <div class="col-md-6">
                                <label class="form-label">Store</label>
                                <select class="form-select" name="store_id" id="storeSelect" required>
                                    <option value="">Select Store</option>
                                </select>
                            </div>

                            <!-- In Stock -->
                            <div class="col-md-6">
                                <label class="form-label">Stock Status</label>
                                <select class="form-select" name="in_stock" required>
                                    <option value="In Stock">In Stock</option>
                                    <option value="Out of Stock">Out of Stock</option>
                                </select>
                            </div>

                        </div>

                        <div class="mt-4 text-end">
                            <button type="submit" class="btn btn-warning">Add Model</button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    </div>

    <!-- Edit Model Modal -->
    <div class="modal fade" id="editModelModal" tabindex="-1" aria-labelledby="editModelModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-centered">
            <div class="modal-content">

                <div class="modal-header">
                    <h5 class="modal-title font-weight-bold" id="editModelModalLabel">
                        <img src="../images/logo.png" style="height: 40px; width: 40px;" />
                        <strong style="color: #000;">EDIT MODEL</strong>
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>

                <div class="modal-body">
                    <form id="editModelForm" method="POST" enctype="multipart/form-data">
                        <input type="hidden" name="id" id="editModelId">

                        <div class="row g-3">

                            <!-- Name -->
                            <div class="col-md-6">
                                <label class="form-label">Name</label>
                                <input type="text" class="form-control" name="name" id="editName" required>
                            </div>

                            <!-- Image Upload -->
                            <div class="col-md-6">
                                <label class="form-label">Change Image</label>
                                <input type="file" class="form-control" name="image" id="editImage" accept="image/*">
                                <div class="mt-2">
                                    <img id="currentImagePreview" src="" alt="Current Image"
                                        style="max-height: 120px; border: 1px solid #ddd; border-radius: 6px; padding: 4px;">
                                </div>
                            </div>


                            <!-- Description -->
                            <div class="col-12">
                                <label class="form-label">Description</label>
                                <textarea class="form-control" name="description" id="editDescription" rows="3"
                                    required></textarea>
                            </div>

                            <!-- Size -->
                            <div class="col-md-4">
                                <label class="form-label">Size</label>
                                <input type="text" class="form-control" name="size" id="editSize" required>
                            </div>

                            <!-- Material -->
                            <div class="col-md-4">
                                <label class="form-label">Material</label>
                                <input type="text" class="form-control" name="material" id="editMaterial" required>
                            </div>

                            <!-- Units -->
                            <div class="col-md-4">
                                <label class="form-label">Units</label>
                                <input type="number" class="form-control" name="units" id="editUnits" required>
                            </div>

                            <!-- Seater -->
                            <div class="col-md-4">
                                <label class="form-label">Seater</label>
                                <input type="number" class="form-control" name="seater" id="editSeater">
                            </div>

                            <!-- Price -->
                            <div class="col-md-4">
                                <label class="form-label">Price</label>
                                <input type="number" step="0.01" class="form-control" name="price" id="editPrice"
                                    required>
                            </div>

                            <!-- Purchase Link -->
                            <div class="col-md-4">
                                <label class="form-label">Purchase Link</label>
                                <input type="url" class="form-control" name="purchase_link" id="editPurchaseLink">
                            </div>

                            <!-- Category -->
                            <div class="col-md-6">
                                <label class="form-label">Category</label>
                                <input type="text" class="form-control" name="category" id="editCategory" required>
                            </div>

                            <!-- Cloud Link -->
                            <div class="col-md-6">
                                <label class="form-label">Cloud Link</label>
                                <input type="url" class="form-control" name="cloud_link" id="editCloudLink">
                            </div>

                            <!-- Store ID -->
                            <div class="col-md-6">
                                <label class="form-label">Store</label>
                                <select class="form-select" name="store_id" id="editStoreSelect" required>
                                    <option value="">Select Store</option>
                                </select>
                            </div>

                            <!-- In Stock -->
                            <div class="col-md-6">
                                <label class="form-label">Stock Status</label>
                                <select class="form-select" name="in_stock" id="editInStock" required>
                                    <option value="In Stock">In Stock</option>
                                    <option value="Out of Stock">Out of Stock</option>
                                </select>
                            </div>

                        </div>

                        <div class="mt-4 text-end">
                            <button type="submit" class="btn btn-warning">Update Model</button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    </div>

    <script src="sidebar.js" defer></script>
    <script src="js/models.js" defer></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        $(document).ready(function () {
            // Function to initialize Select2 inside a given modal
            function initSelect2(selector, modalId) {
                $(selector).select2({
                    placeholder: "-- Select a Store --",
                    dropdownParent: $(modalId)
                });
            }

            // Load agents via AJAX
            $.ajax({
                url: 'http://localhost/hauzisha/api/index.php/stores',
                method: 'GET',
                success: function (res) {
                    if (res.success) {
                        res.data.forEach(store => {
                            // Append agents to BOTH dropdowns
                            $('#storeSelect').append(`<option value="${store.id}">${store.name}</option>`);
                            $('#editStoreSelect').append(`<option value="${store.id}">${store.name}</option>`);
                        });

                        // Initialize Select2 for both modals
                        initSelect2('#storeSelect', '#addModelModal');
                        initSelect2('#editStoreSelect', '#editModelModal');
                    } else {
                        console.error('Failed to load agents:', res.message);
                    }
                },
                error: function (err) {
                    console.error('AJAX error:', err);
                }
            });
        });
    </script>

</body>

</html>