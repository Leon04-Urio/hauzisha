<?php
require_once '../api/helpers/security.php';

// Require authentication and prevent caching
Security::requireAuth();
?>

<!DOCTYPE html>
<html lang="en">

<head>
  <title>HAUZISHA - Dashboard</title>
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
  <link rel="stylesheet" href="../control-room/admin.css">
  <link rel="stylesheet" href="css/footer-fix.css">
  <script type="module" src="https://unpkg.com/@google/model-viewer"></script>

  <style>
    /* Mobile */
    ..main-box {
      width: 80vw;
      margin-left: 0vw;
    }

    @media (max-width: 768px) {
      .main-box {
        width: 90vw;
        margin-left: 0;
      }

      .explore-page {
        /* padding: 0.7rem; */
      }
    }

    .mobile-bottom-nav .nav-item.active i {
      color: #ffd700
    }

    .search-bar-container {
      margin: 2rem 0;
    }

    .toggle-slider:hover {
      text-decoration: none;
      color: #ffd700;
      background: none;
    }

    .toggle-slider .btn {
      color: #999999;
      /* default look for all */
    }

    .toggle-slider .btn:focus,
    .toggle-slider .btn:active {
      outline: none !important;
      color: #fff;
      box-shadow: 0 0 0 0.1rem rgba(255, 215, 0, 0.9) !important;
      /* golden yellow glow */
    }
  </style>
</head>

<body class="d-flex flex-column min-vh-100 m-0 p-0" style="background: linear-gradient(to bottom, #000, #121212);"
  data-logged-in="<?php echo isset($_SESSION['user_id']) ? 'true' : 'false'; ?>">

  <?php include 'header.php'; ?>

  <?php include 'mobile-nav.php'; ?>

  <main class="user-main-content px-2 flex-fill">
    <!-- <div class="dashboard-toggle text-center my-2 mb-3">
      <div class="btn-group toggle-slider" role="group">
        <button type="button" class="btn active" id="btn-properties">P o r t f o l i o</button>
        <button type="button" class="btn" id="btn-showroom">S h o w r o o m</button>
      </div>
    </div> -->

    <!-- Property Section -->
    <section>
      <div class="explore-layout">
        <div class="explore-page">
          <!-- Airbnb-style Search Bar -->
          <div class="search-bar-container" style="margin: 0rem 0;">
            <div class="search-bar">
              <div class="search-item">
                <label>Location</label>
                <input type="text" placeholder="Where?" />
              </div>
              <div class="divider"></div>
              <div class="search-item">
                <label>Max Price</label>
                <input type="number" placeholder="Add Max Price" />
              </div>
              <div class="divider"></div>
              <div class="search-item">
                <label>Bedrooms</label>
                <input type="number" placeholder="Add Bedrooms" />
              </div>
              <div class="divider"></div>
              <div class="search-item">
                <label>Type</label>
                <input type="text" placeholder="Add Type" />
              </div>

              <button class="search-button">
                <i class="fa fa-search"></i>
              </button>
              <button id="filterBtn" class="filter-button" data-bs-toggle="modal" data-bs-target="#filterModal">
                <i class="fa-solid fa-sliders"></i>
              </button>

              <!-- Filter Modal -->
              <div class="modal fade" id="filterModal" tabindex="-1" aria-labelledby="filterModalLabel"
                aria-hidden="true">
                <div class="modal-dialog modal-bottom-sheet">
                  <div class="modal-content p-3">

                    <!-- Header -->
                    <div class="modal-header1 d-flex justify-content-between align-items-center border-0">
                      <h5 class="modal-title" id="filterModalLabel">Filters</h5>
                      <button type="button" class="filter-close-btn btn-close" style="color: #000;"
                        data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>

                    <!-- Body -->
                    <div class="modal-body1">
                      <!-- Location -->
                      <div class="mb-3">
                        <label class="form-label">Location</label>
                        <input id="locationInput" type="text" class="form-control" placeholder="Enter location">
                      </div>

                      <!-- Price Range -->
                      <div class="mb-3">
                        <label class="form-label">Price Range (Ksh)</label>
                        <div class="d-flex gap-2">
                          <input type="number" class="form-control" placeholder="Min">
                          <input type="number" class="form-control" placeholder="Max">
                        </div>
                        <!-- Keep your original range slider too -->
                        <!-- <input type="range" min="0" max="10000" step="100" class="w-100 mt-2"> -->
                      </div>

                      <!-- Property Type -->
                      <div class="mb-3">
                        <label class="form-label">Property Type</label>
                        <select class="form-select">
                          <option>Any</option>
                          <option>Apartment</option>
                          <option>Bungalow</option>
                          <option>Villa</option>
                          <option>Mansion</option>
                        </select>
                      </div>

                      <!-- Bedrooms -->
                      <div class="mb-3">
                        <label class="form-label">Bedrooms</label>
                        <select class="form-select mb-2">
                          <option>Any</option>
                          <option>1+</option>
                          <option>2+</option>
                          <option>3+</option>
                        </select>
                        <div class="d-flex flex-wrap gap-2">
                          <button class="btn btn-outline-secondary btn-sm">1</button>
                          <button class="btn btn-outline-secondary btn-sm">2</button>
                          <button class="btn btn-outline-secondary btn-sm">3</button>
                          <button class="btn btn-outline-secondary btn-sm">4+</button>
                        </div>
                      </div>

                      <!-- Amenities -->
                      <div class="mb-3">
                        <label class="form-label">Amenities</label>
                        <div class="d-flex flex-wrap gap-2">
                          <button class="btn btn-outline-secondary btn-sm">Pool</button>
                          <button class="btn btn-outline-secondary btn-sm">Parking</button>
                          <button class="btn btn-outline-secondary btn-sm">Balcony</button>
                          <button class="btn btn-outline-secondary btn-sm">Gym</button>
                        </div>
                      </div>
                    </div>

                    <!-- Footer -->
                    <div class="modal-footer1 border-0 d-flex gap-2">
                      <!-- <button type="button" class="btn btn-outline-secondary w-50" data-bs-dismiss="modal">Clear</button> -->
                      <button type="button" class="apply-btn w-100">Apply</button>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="explore-intro">
            <div class="section-header">
              <h4 class="mt-0" style="font-weight: bolder; color: white;">
                Featured
                <i class="fa fa-angle-right ml-2" aria-hidden="true"></i>
              </h4>
              <!-- <a href="#" class="mt-1 mr-4" style="font-weight: bolder; text-decoration: none; color: white;">See All</a> -->
            </div>
          </div>

          <div class="FL" id="featured-list">
            <!-- Featured List will go here -->
            <div class="featured-container">
              <i class="fa fa-angle-left scroll-btn left" id="scroll-left" aria-hidden="true"></i>
              <div class="featured-scroll" id="featured-scroll"></div>
              <i class="fa fa-angle-right scroll-btn right" id="scroll-right" aria-hidden="true"></i>
            </div>

            <div id="featured-loading" style="text-align: center; display: none;">
              <div class="spinner-border" role="status">
              </div>
            </div>
          </div>

          <div class="section-header">
            <h4 class="mb-4" style="font-weight: bolder; color: white; margin-bottom: 2rem;">Our Recommendation</h4>
            <!-- <a href="#"  class="mt-1 mr-4" style="font-weight: bolder; text-decoration: none; color: white;">See All</a> -->
          </div>

          <div class="filters">
            <button data-type="All">All</button>
            <button data-type="House">Houses</button>
            <button data-type="Mansion">Mansions</button>
            <button data-type="Studio">Studios</button>
            <button data-type="Villa">Villas</button>
            <button data-type="Apartment">Apartments</button>
            <button data-type="Duplex">Duplexes</button>
            <button data-type="Bungalow">Bungalows</button>
            <button data-type="Condo">Condos</button>
            <button data-type="AirBnB">AirBnB</button>
            <button data-type="Hotel">Hotels</button>
            <button data-type="Office">Offices</button>
          </div>

          <div class="main-box">
            <!-- ExploreLanding: property cards go here -->
            <div class="property-section">
              <div class="property-masonry" id="explore-landing">
              </div>
            </div>
          </div>

          <div class="pagination-controls" id="pagination" style="margin-top: 2rem; text-align: center;">
            <!-- Pagination will be injected here -->
          </div>
        </div>
      </div>
    </section>

    <!-- Showroom Section -->
    <!-- <section id="showroom-section" style="display:none;">
      <section class="ar-section">
      <div class="showroom">
        <h3 style="color: white; font-weight: bold; margin-top: 4rem;">Showroom</h3>
        <p>Select a furniture model from the catalogue to get started.</p>
      </div>
      <div class="container-xl ar-studio-container">
          <model-viewer 
              id="ar-viewer"
              src="../models/chair.glb" 
              ios-src="../assets/models/chair.usdz"
              ar
              ar-modes="scene-viewer webxr quick-look"
              ar-placement="floor"
              camera-controls
              camera-target="auto"
              autoplay
              environment-image="neutral"
              shadow-intensity="1"
              ar-camera-controls
              scale="5 5 5"
              position="0 -2 0">
          </model-viewer>
          <div id="qrContainer2" style="text-align:center; margin-top:15px; display:none;">
            <canvas id="qrCode2" title="Scan the QR code on mobile to view the model"></canvas>
            <div style="font-size:12px; margin-top:4px;">Scan on mobile to view</div>
          </div>
      </div>
      </div>

      <div class="furniture-meta">
        <div class="furniture-info">
          <h5 style="color: white; font-weight: bold;">Overview</h5>
          <p>Discover the perfect blend of comfort and style with our Modern Luxe Sofa. Crafted with premium materials and a timeless design, this sofa instantly elevates any living space. Its plush cushions, sturdy frame, and elegant silhouette make it the ideal centerpiece for cozy nights in or stylish entertaining. Upholstered in soft, durable fabric with a choice of colors to match your décor, the Modern Luxe Sofa offers generous seating without compromising on sleek design. Relax, unwind, and make a statement — all in one piece.</p>
          <div class="ar-fav-icon">
            <span style="gap: 1rem;" class="ar-favorite-icon">
              <p><i class="mini far fa-heart"></i><strong style="color: #fff; font-size: small;">114</strong></p>
              <i class="mini fas fa-share-alt"></i>
            </span>
          </div>
        </div>

        <div class="furniture-info">
          <h5 style="color: white; font-weight: bold;">Details</h5>
          <p>Name: <strong>Modern Sofa</strong></p>
          <p>Size: <strong>210cm x 100cm x 80cm</strong></p>
          <p>Material: <strong>Leather</strong></p>
          <p>Seater: <strong>3</strong></p>
          <p>Units: <strong>1</strong></p>
          <p>Store: <strong>House Of Leather</strong></p>
          <div class="piece-price">
            <p>Price: <strong>KSH 299000</strong></p>
            <button class="btn btn-primary px-4 py-2">Buy Now</button>
          </div>
        </div>
      </div>

      <div style="padding: 0.5rem;">
        <div class="filters">
          <button class="category-btn active" data-category="sofas">Sofas</button>
          <button class="category-btn" data-category="beds">Beds</button>
          <button class="category-btn" data-category="tables">Tables</button>
          <button class="category-btn" data-category="carpets">Carpets</button>
          <button>Lighting</button>
          <button>Cushions</button>
          <button>Flooring</button>
          <button>Dining Sets</button>
          <button>Chairs</button>
          <button>Decor</button>
        </div>

        <div class="furniture-container">
          <i class="fa fa-angle-left furn-scroll-btn-reco left" id="furniture-scroll-left"></i>
          <div class="furniture-grid" id="furniture-list"></div>
          <i class="fa fa-angle-right furn-scroll-btn-reco right" id="furniture-scroll-right"></i>
        </div>
      </div> 
      </section>
    </section> -->

    <!-- Toast container -->
    <div id="toastContainer" style="position: fixed; top: 20px; right: 20px; z-index: 9999;"></div>
  </main>

  <?php include 'footer2.php'; ?>

  <script src="../js/config.js"></script>
  <script src="../js/notification-badge.js"></script>
  <script src="../js/logout-handler.js" defer></script>
  <script src="../js/toast.js" defer></script>
  <script src="../js/profile-dropdown.js" defer></script>
  <script src="../js/toggle-sections.js" defer></script>
  <script src="../js/favorites-handler.js" defer></script>
  <script src="js/dashboard-profile.js" defer></script>
  <script src="../js/explore.js"></script>
  <script src="../js/showroom.js"></script>
  <script src="../js/index.js"></script>
  <script src="js/footer2.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="../js/bootstrap.bundle.min.js"></script>
  <script src="./js/tiny-slider.js"></script>
  <script src="../js/glightbox.min.js"></script>
  <script src="../js/aos.js"></script>
  <script src="../js/google-map.js"></script>
  <script src="../js/main.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

</body>

</html>