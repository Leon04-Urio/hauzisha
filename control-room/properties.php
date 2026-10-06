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
    <title>HAUZISHA - Admin Properties</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="icon" type="image/svg+xml" href="../images/logo.png">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="preconnect" href="https://fonts.gstatic.com/">
    <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@200;300;400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link rel="stylesheet" href="../css/style.css">
    <link rel="stylesheet" href="../css/mobile-modals.css">
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
    renderDashboardHeader("Properties");
    ?>

    <main class="main-content px-3 py-0" style="padding-left: 2rem; padding-right: 2rem;">
        <!-- KPI Cards -->
        <div class="container-fluid mt-4">
            <div class="row g-3" id="kpiCards">
                <div class="col-12 col-md-6 col-lg-3">
                    <div class="dash-card">
                        <h5>Total Properties</h5>
                        <h2 id="kpiTotal">0</h2>
                        <small><span id="kpiNewThisMonth">0</span> added this month</small>
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
                        <h5>Inactive</h5>
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
                        <h6>Properties Added Over Time</h6>
                        <canvas id="propertiesOverTimeChart"></canvas>
                    </div>
                </div>
                <!-- <div class="col-12 col-md-6">
                    <div class="chart-card">
                        <h6>Active vs Inactive</h6>
                        <canvas id="activeInactiveChart"></canvas>
                    </div>
                </div> -->
                <div class="col-12 col-md-6">
                    <div class="chart-card">
                        <h6>Property Types</h6>
                        <canvas id="propertyTypeChart"></canvas>
                    </div>
                </div>
            </div>
        </section>

            <!-- Properties Table -->
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="text-white mb-4 mt-5" style="font-weight: 700;">All Properties</h6>
                <button class="btn text-dark mb-0" data-bs-toggle="modal" data-bs-target="#addPropertyModal" style="background: #ffd700;">
                    <i class="fa fa-plus"></i> Add Property
                </button>
            </div>

            <div class="table-responsive px-2 py-5" style="background-color: #000; border: 1px solid #121212; border-radius: 5px;">
                <table id="propertyTable" class="display table nowrap" style="width:100%">
                    <thead>
                    <tr>
                        <th>Image</th>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Agent ID</th>
                        <th>Type</th>
                        <th>Location</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                    </thead>
                </table>
            </div>


    </main>

    <!-- Add Property Modal -->
    <div class="modal fade" id="addPropertyModal" tabindex="-1" aria-labelledby="addPropertyModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-centered">
            <div class="modal-content">
            
            <div class="modal-header">
                <h5 class="modal-title font-weight-bold" id="authModalLabel"><img src="../images/logo.png" style="height: 40px; width: 40px; "/> <strong style="color: #000; ">ADD PROPERTY</strong></h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body">
                <form id="addPropertyForm" method="POST" enctype="multipart/form-data">
                <div class="row g-3">

                    <!-- Name -->
                    <div class="col-md-6">
                    <label class="form-label">Property Name</label>
                    <input type="text" class="form-control" name="name" required>
                    </div>

                    <!-- Type -->
                    <div class="col-md-6">
                    <label class="form-label">Type</label>
                    <select class="form-select" name="type" required>
                        <option value="apartment">Apartment</option>
                        <option value="villa">Villa</option>
                        <option value="studio">Studio</option>
                        <option value="office">Office</option>
                    </select>
                    </div>

                    <!-- Beds -->
                    <div class="col-md-4">
                    <label class="form-label">Beds</label>
                    <input type="number" class="form-control" name="beds" required>
                    </div>

                    <!-- Baths -->
                    <div class="col-md-4">
                    <label class="form-label">Baths</label>
                    <input type="number" class="form-control" name="baths" required>
                    </div>

                    <!-- Size -->
                    <div class="col-md-4">
                    <label class="form-label">Size (sqft)</label>
                    <input type="number" class="form-control" name="size" required>
                    </div>

                    <!-- Description -->
                    <div class="col-12">
                    <label class="form-label">Description</label>
                    <textarea class="form-control" name="description" rows="3" required></textarea>
                    </div>

                    <!-- Agent ID -->
                    <div class="col-md-6">
                    <label class="form-label">Agent</label>
                    <select class="form-select" name="agent_id" id="agentSelect" required>
                        <option value="">Select an Agent</option>
                    </select>
                    </div>

                    <!-- Facilities -->
                    <div class="col-12">
                    <label class="form-label">Facilities</label>
                    <div class="d-flex flex-wrap gap-1 mb-2">
                        <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" name="facilities[]" value="WiFi" id="wifi">
                        <label class="form-check-label" for="wifi">WiFi</label>
                        </div>
                        <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" name="facilities[]" value="Pool" id="pool">
                        <label class="form-check-label" for="pool">Pool</label>
                        </div>
                        <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" name="facilities[]" value="Gym" id="gym">
                        <label class="form-check-label" for="gym">Gym</label>
                        </div>
                        <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" name="facilities[]" value="Parking" id="parking">
                        <label class="form-check-label" for="parking">Parking</label>
                        </div>
                        <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" name="facilities[]" value="Air Conditioning" id="air_conditioning">
                        <label class="form-check-label" for="air_conditioning">AC</label>
                        </div>
                        <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" name="facilities[]" value="Security" id="security">
                        <label class="form-check-label" for="security">Security</label>
                        </div>
                        <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" name="facilities[]" value="Pets" id="pets">
                        <label class="form-check-label" for="pets">Pets</label>
                        </div>
                        <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" name="facilities[]" value="Garden" id="garden">
                        <label class="form-check-label" for="garden">Garden</label>
                        </div>
                        <!-- add more as needed -->
                    </div>
                    </div>

                    <!-- Units Configuration -->
                    <div class="col-12">
                        <label class="form-label">Units Available (for multi-unit buildings)</label>
                        <div class="card bg-light text-dark p-3">
                            <div class="row g-2" id="unitsContainer">
                                <div class="col-12">
                                    <small class="text-muted">Configure different unit types available in this building (e.g., 1BR, 2BR, Studio)</small>
                                </div>
                            </div>
                            <div class="mt-2">
                                <button type="button" class="btn btn-sm btn-outline-primary" onclick="addUnitRow()">
                                    <i class="fa fa-plus"></i> Add Unit Type
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Gallery Management -->
                    <div class="col-12">
                        <label class="form-label">Property Images</label>
                        <div class="card bg-light text-dark p-3">
                            <div class="alert alert-info mb-0" role="alert">
                                <i class="fa fa-info-circle"></i> 
                                <strong>Image Management:</strong> Save the property first, then edit it to add images with our advanced WebP image system.
                            </div>
                        </div>
                    </div>

                    <!-- Tour Link -->
                    <div class="col-md-12">
                    <label class="form-label">Virtual Tour Link</label>
                    <input type="url" class="form-control" name="tour_link">
                    </div>

                    <!-- Location -->
                    <div class="col-md-6">
                    <label class="form-label">Location</label>
                    <input type="text" class="form-control" name="location" required>
                    </div>

                    <!-- Address -->
                    <div class="col-md-6">
                    <label class="form-label">Address</label>
                    <input type="text" class="form-control" name="address" required>
                    </div>

                    <!-- Price -->
                    <div class="col-md-4">
                    <label class="form-label">Price</label>
                    <input type="number" step="0.01" class="form-control" name="price" required>
                    </div>

                    <!-- Rating -->
                    <div class="col-md-4">
                    <label class="form-label">Rating</label>
                    <input type="number" step="0.1" max="5" class="form-control" name="rating">
                    </div>

                    <!-- Tags -->
                    <div class="col-md-4">
                    <label class="form-label">Tags</label>
                    <input type="text" class="form-control" name="tags">
                    </div>

                    <!-- Floor Plan -->
                    <div class="col-md-6">
                    <label class="form-label">Floor Plan</label>
                    <input type="file" class="form-control" name="floor_plan">
                    </div>

                    <!-- Featured -->
                    <div class="col-md-6">
                    <label class="form-label">Featured</label>
                    <select class="form-select" name="featured">
                        <option value="0">No</option>
                        <option value="1">Yes</option>
                    </select>
                    </div>

                    <!-- Status (is_suspended) -->
                    <!-- <div class="col-md-3">
                    <label class="form-label">Suspended</label>
                    <select class="form-select" name="is_suspended">
                        <option value="0">No</option>
                        <option value="1">Yes</option>
                    </select>
                    </div> -->

                    <!-- Suspension Reason -->
                    <!-- <div class="col-12">
                    <label class="form-label">Suspension Reason</label>
                    <textarea class="form-control" name="sus_reason" rows="2"></textarea>
                    </div> -->

                </div>
                <div class="mt-4 text-end">
                    <button type="submit" class="btn btn-warning">Save Property</button>
                </div>
                </form>
            </div>

            </div>
        </div>
    </div>

    <!-- Edit Property Modal -->
    <div class="modal fade" id="editPropertyModal" tabindex="-1" aria-labelledby="editPropertyModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-centered">
            <div class="modal-content">

            <div class="modal-header">
                <h5 class="modal-title font-weight-bold" id="editPropertyModalLabel">
                <img src="../images/logo.png" style="height: 40px; width: 40px;" />
                <strong style="color: #000;">EDIT PROPERTY</strong>
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body">
                <form id="editPropertyForm" method="POST" enctype="multipart/form-data">
                <input type="hidden" name="id" id="editPropertyId">

                <div class="row g-3">

                    <!-- Name -->
                    <div class="col-md-6">
                    <label class="form-label">Property Name</label>
                    <input type="text" class="form-control" name="name" id="editName" required>
                    </div>

                    <!-- Type -->
                    <div class="col-md-6">
                    <label class="form-label">Type</label>
                    <select class="form-select" name="type" id="editType" required>
                        <option value="apartment">Apartment</option>
                        <option value="villa">Villa</option>
                        <option value="studio">Studio</option>
                        <option value="office">Office</option>
                    </select>
                    </div>

                    <!-- Beds -->
                    <div class="col-md-4">
                    <label class="form-label">Beds</label>
                    <input type="number" class="form-control" name="beds" id="editBeds" required>
                    </div>

                    <!-- Baths -->
                    <div class="col-md-4">
                    <label class="form-label">Baths</label>
                    <input type="number" class="form-control" name="baths" id="editBaths" required>
                    </div>

                    <!-- Size -->
                    <div class="col-md-4">
                    <label class="form-label">Size (sqft)</label>
                    <input type="number" class="form-control" name="size" id="editSize" required>
                    </div>

                    <!-- Description -->
                    <div class="col-12">
                    <label class="form-label">Description</label>
                    <textarea class="form-control" name="description" id="editDescription" rows="3" required></textarea>
                    </div>

                    <!-- Agent ID -->
                    <div class="col-md-6">
                    <label class="form-label">Agent</label>
                    <select class="form-select" name="agent_id" id="editAgentSelect" required>
                        <option value="">Select an Agent</option>
                    </select>
                    </div>

                    <!-- Facilities -->
                    <div class="col-12">
                    <label class="form-label">Facilities</label>
                    <div class="d-flex flex-wrap gap-1 mb-2" id="editFacilities">
                        <!-- checkboxes same as Add, but with "edit" ids -->
                        <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" name="facilities[]" value="WiFi" id="edit_wifi">
                        <label class="form-check-label" for="edit_wifi">WiFi</label>
                        </div>
                        <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" name="facilities[]" value="Pool" id="edit_pool">
                        <label class="form-check-label" for="edit_pool">Pool</label>
                        </div>
                        <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" name="facilities[]" value="Gym" id="edit_gym">
                        <label class="form-check-label" for="edit_gym">Gym</label>
                        </div>
                        <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" name="facilities[]" value="Parking" id="edit_parking">
                        <label class="form-check-label" for="edit_parking">Parking</label>
                        </div>
                        <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" name="facilities[]" value="Air Conditioning" id="edit_air_conditioning">
                        <label class="form-check-label" for="edit_air_conditioning">AC</label>
                        </div>
                        <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" name="facilities[]" value="Security" id="edit_security">
                        <label class="form-check-label" for="edit_security">Security</label>
                        </div>
                        <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" name="facilities[]" value="Pets" id="edit_pets">
                        <label class="form-check-label" for="edit_pets">Pets</label>
                        </div>
                        <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" name="facilities[]" value="Garden" id="edit_garden">
                        <label class="form-check-label" for="edit_garden">Garden</label>
                        </div>
                    </div>
                    </div>

                    <!-- Units Configuration -->
                    <div class="col-12">
                        <label class="form-label">Units Available (for multi-unit buildings)</label>
                        <div class="card bg-light text-dark p-3">
                            <div class="row g-2" id="editUnitsContainer">
                                <div class="col-12">
                                    <small class="text-muted">Configure different unit types available in this building (e.g., 1BR, 2BR, Studio)</small>
                                </div>
                            </div>
                            <div class="mt-2">
                                <button type="button" class="btn btn-sm btn-outline-primary" onclick="addEditUnitRow()">
                                    <i class="fa fa-plus"></i> Add Unit Type
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Gallery Management -->
                    <div class="col-12">
                        <label class="form-label">Property Images</label>
                        <div class="card bg-dark text-white p-3">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <small class="text-muted">Manage property images with automatic WebP conversion</small>
                                <button type="button" class="btn btn-sm btn-warning" onclick="openImageUploadForEdit()">
                                    <i class="fa fa-plus"></i> Add More Images
                                </button>
                            </div>
                            <div id="editPropertyImagePreview" class="row g-2">
                                <!-- Images will be loaded here -->
                            </div>
                        </div>
                    </div>

                    <!-- Tour Link -->
                    <div class="col-md-12">
                    <label class="form-label">Virtual Tour Link</label>
                    <input type="url" class="form-control" name="tour_link" id="editTourLink">
                    </div>

                    <!-- Location -->
                    <div class="col-md-6">
                    <label class="form-label">Location</label>
                    <input type="text" class="form-control" name="location" id="editLocation" required>
                    </div>

                    <!-- Address -->
                    <div class="col-md-6">
                    <label class="form-label">Address</label>
                    <input type="text" class="form-control" name="address" id="editAddress" required>
                    </div>

                    <!-- Price -->
                    <div class="col-md-4">
                    <label class="form-label">Price</label>
                    <input type="number" step="0.01" class="form-control" name="price" id="editPrice" required>
                    </div>

                    <!-- Rating -->
                    <div class="col-md-4">
                    <label class="form-label">Rating</label>
                    <input type="number" step="0.1" max="5" class="form-control" name="rating" id="editRating">
                    </div>

                    <!-- Tags -->
                    <div class="col-md-4">
                    <label class="form-label">Tags</label>
                    <input type="text" class="form-control" name="tags" id="editTags">
                    </div>

                    <!-- Floor Plan -->
                    <div class="col-md-6">
                    <label class="form-label">Floor Plan</label>
                    <input type="file" class="form-control" name="floor_plan" id="editFloorPlan">
                    </div>

                    <!-- Featured -->
                    <div class="col-md-6">
                    <label class="form-label">Featured</label>
                    <select class="form-select" name="featured" id="editFeatured">
                        <option value="0">No</option>
                        <option value="1">Yes</option>
                    </select>
                    </div>

                </div>

                <div class="mt-4 text-end">
                    <button type="submit" class="btn btn-warning">Update Property</button>
                </div>
                </form>
            </div>

            </div>
        </div>
    </div>

    <!-- Image Upload Modal -->
    <?php include 'modals/image-upload-modal.php'; ?>

    <script src="sidebar.js" defer></script>
    <script src="js/properties.js" defer></script>
    <script src="js/property-image-upload.js" defer></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        $(document).ready(function () {
            // Function to initialize Select2 inside a given modal
            function initSelect2(selector, modalId) {
                $(selector).select2({
                    placeholder: "-- Select an Agent --",
                    dropdownParent: $(modalId)
                });
            }

            // Load agents via AJAX
            $.ajax({
                url: 'http://localhost/hauzisha/api/index.php/agents',
                method: 'GET',
                success: function (res) {
                    if (res.success) {
                        res.data.forEach(agent => {
                            // Append agents to BOTH dropdowns
                            $('#agentSelect').append(`<option value="${agent.id}">${agent.firstname} ${agent.lastname}</option>`);
                            $('#editAgentSelect').append(`<option value="${agent.id}">${agent.firstname} ${agent.lastname}</option>`);
                        });

                        // Initialize Select2 for both modals
                        initSelect2('#agentSelect', '#addPropertyModal');
                        initSelect2('#editAgentSelect', '#editPropertyModal');
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
    
    <script src="../js/toast.js"></script>
    <script src="../js/mobile-modals.js"></script>
    <script src="js/property-units-admin.js"></script>

</body>
</html>
