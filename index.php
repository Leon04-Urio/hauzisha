<?php
session_start();
$isLoggedIn = isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
$userRole = $_SESSION['role'] ?? 'guest';
$userId = $_SESSION['user_id'] ?? null;
?>

<!DOCTYPE html>
<html lang="en">

<head>
  <title>Hauzisha -
    <?php echo $isLoggedIn ? 'Dashboard' : 'Explore Page'; ?>
  </title>
  <meta charset="utf-8">
  <meta name="viewport"
    content="width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=no, maximum-scale=1">
  <?php if ($isLoggedIn): ?>
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
  <?php endif; ?>
  <link rel="icon" type="image/svg+xml" href="images/logo.png">
  <link rel="preconnect" href="https://fonts.gstatic.com/">
  <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@200;300;400;600;700&amp;display=swap"
    rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <link rel="stylesheet" href="css/font-awesome.min.css">
  <link rel="stylesheet" href="css/ionicons.min.css">
  <link rel="stylesheet" href="css/animate.css">
  <link rel="stylesheet" href="css/flaticon.css">
  <link rel="stylesheet" href="css/tiny-slider.css">
  <link rel="stylesheet" href="css/glightbox.min.css">
  <link rel="stylesheet" href="css/aos.css">
  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="css/smart-search-professional.css">
  <link rel="stylesheet" href="css/mobile-modals.css">
  <link rel="stylesheet" href="css/skeleton-loading.css">
  <link rel="stylesheet" href="css/cookie-consent.css">
  <link rel="stylesheet" href="css/advanced-filters.css">
  <link rel="stylesheet" href="css/new-label.css">
  <link rel="stylesheet" href="css/modal-backdrop.css">
  <?php if ($isLoggedIn): ?>
    <link rel="stylesheet" href="control-room/admin.css">
    <link rel="stylesheet" href="user-profile/css/footer-fix.css">
    <script type="module" src="https://unpkg.com/@google/model-viewer"></script>
  <?php endif; ?>

  <style>
    /* Dynamic heart styling for favorites */
    .property-card .fa-heart {
      transition: all 0.3s ease;
      cursor: pointer;
    }

    /* Price suffix styling for rentals */
    #price .price-suffix,
    .featured-price .price-suffix {
      font-size: 0.9em;
      color: inherit;
      margin-left: 4px;
      font-weight: inherit;
    }

    /* Promotional Carousel Styles */
    .promo-carousel-container {
      position: relative;
      overflow: hidden;
      border-radius: 20px;
    }

    .promo-carousel-track {
      display: flex;
      width: 400%;
      /* 4 slides × 100% */
      height: 100%;
      transition: transform 0.8s ease-in-out;
    }

    .promo-slide {
      width: 25%;
      /* Each slide takes 1/4 of track width */
      height: 100%;
      background-size: cover;
      background-position: center;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .promo-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.3);
      /* Dark overlay */
      z-index: 1;
    }

    .promo-content {
      position: relative;
      z-index: 2;
      text-align: center;
      color: white;
      padding: 1rem;
    }

    .promo-content h3 {
      font-size: 1.2rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
      color: #fff;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    }

    .promo-content p {
      font-size: 0.9rem;
      margin: 0;
      opacity: 0.9;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    }

    /* Progress Bar */
    .promo-progress-container {
      position: absolute;
      bottom: 10px;
      left: 50%;
      transform: translateX(-50%);
      width: 80%;
      height: 1px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 2px;
      overflow: hidden;
      z-index: 3;
    }

    .promo-progress-bar {
      height: 100%;
      background: #ffd700;
      border-radius: 2px;
      width: 0%;
      transition: width 0.1s linear;
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .promo-content h3 {
        font-size: 1rem;
      }

      .promo-content p {
        font-size: 0.8rem;
      }
    }

    .filters button.active {
      border: 1px solid #999999;
      color: #fff;
      font-weight: bold;
    }

    /* Inline override for filters button active state */
    .filters button.active {
      border: 1px solid #999999 !important;
      color: #fff !important;
      font-weight: bold !important;
      background: transparent !important;
    }


    /* Price text overflow handling */
    #price,
    .featured-price {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 100%;
    }

    /* Preserve original heart colors for non-logged-in users */
    body[data-logged-in="false"] .featured-section .fa-heart {
      color: white !important;
      /* Featured section hearts stay white */
    }

    body[data-logged-in="false"] .property-card .fa-heart {
      color: #ffd700 !important;
      /* Cards section hearts stay gold */
    }

    /* Logged-in users - dynamic hearts based on favorite status */
    body[data-logged-in="true"] .fa-heart.fas {
      color: #ffd700 !important;
      /* Favorited hearts are gold */
    }

    /* Preserve original colors for unfavorited hearts when logged in */
    body[data-logged-in="true"] .featured-section .fa-heart.far {
      color: white !important;
      /* Featured section unfavorited hearts stay white */
    }

    body[data-logged-in="true"] .property-card .fa-heart.far {
      color: #ffd700 !important;
      /* Cards section unfavorited hearts stay gold */
    }

    /* Hover effects */
    .fa-heart:hover {
      transform: scale(1.1);
    }

    /* Fix header background for logged-in users - comprehensive fix */
    <?php if ($isLoggedIn): ?>
      /* Target all possible elements that might have white backgrounds */
      body[data-logged-in="true"] .user-main-content,
      body[data-logged-in="true"] .user-main-content *,
      body[data-logged-in="true"] main.user-main-content,
      body[data-logged-in="true"] .header-icons,
      body[data-logged-in="true"] .user-profile,
      body[data-logged-in="true"] .d-flex.title-collapse,
      body[data-logged-in="true"] .text-white.mb-0.header-icons {
        background: transparent !important;
        background-color: transparent !important;
        background-image: none !important;
      }

      /* Remove any padding/margin that might create white space */
      body[data-logged-in="true"] .user-main-content {
        padding: 0 !important;
        margin: 0 !important;
        box-shadow: none !important;
        border: none !important;
      }

      /* Ensure the header area blends with the page */
      body[data-logged-in="true"] main.user-main-content {
        position: relative;
        z-index: 10;
      }

    <?php endif; ?>

    /* Add space between header and search bar for logged-in users */
    body[data-logged-in="true"] .explore-layout {
      padding-top: 70px !important;
      /* Space for header on both mobile and desktop */
      /* background: #000; */
    }

    /* Smart search suggestions styling */
    .location-suggestions,
    .type-dropdown {
      font-family: 'Nunito Sans', sans-serif;
    }

    .suggestion-item,
    .type-item {
      font-size: 0.95rem;
      color: #333;
    }

    .suggestion-item:hover,
    .suggestion-item.active,
    .type-item:hover {
      background-color: #f8f9fa !important;
    }

    .type-item:last-child,
    .suggestion-item:last-child {
      border-bottom: none !important;
    }

    /* Ensure search items have proper positioning for dropdowns */
    .search-item {
      position: relative;
    }

    /* Mobile responsive adjustments for logged-in users */
    <?php if ($isLoggedIn): ?>
      @media (max-width: 768px) {
        .explore-page {
          /* padding: 0.7rem; */
        }

        .location-suggestions,
        .type-dropdown {
          font-size: 0.9rem;
        }

        .suggestion-item,
        .type-item {
          padding: 10px 14px;
        }
      }

    <?php endif; ?>
  </style>
</head>

<body data-logged-in="<?php echo $isLoggedIn ? 'true' : 'false'; ?>" data-user-id="<?php echo $userId; ?>"
  data-user-role="<?php echo $userRole; ?>" style="background-color: #000;">

  <?php if ($isLoggedIn): ?>
    <!-- Custom header without main wrapper for index.php -->
    <?php
    // Include the header logic but not the wrapper
    error_reporting(E_ALL);
    ini_set('display_errors', 1);

    require_once __DIR__ . '/api/config/database.php';
    require_once __DIR__ . '/api/classes/User.php';

    $conn = Database::getInstance();
    $userProfile = null;

    if (!empty($_SESSION['user_id'])) {
      $userObj = new User($conn);
      $userProfile = $userObj->getUserProfile($_SESSION['user_id']);
    }

    // fallback values
    $firstname = $userProfile['firstname'] ?? 'User';
    $lastname = $userProfile['lastname'] ?? '';
    $email = $userProfile['email'] ?? '';
    $image = $userProfile['image'] ?? 'images/male_cv.jpg';

    // Dynamically set greeting
    date_default_timezone_set('Africa/Nairobi');
    $hour = (int) date('H');

    if ($hour >= 5 && $hour < 12) {
      $greeting = "Good Morning";
    } elseif ($hour >= 12 && $hour < 18) {
      $greeting = "Good Afternoon";
    } else {
      $greeting = "Good Evening";
    }
    ?>

    <!-- Header content without main wrapper -->
    <div class="d-flex justify-content-between align-items-center text-white mb-0 header-icons"
      style="position: absolute; top: 2px; left: 0px; right: 0px; z-index: 1000; background: transparent;">
      <a href="user-profile/profile.php">
        <div class="user-profile mb-3" id="userProfile">
          <div class="d-flex title-collapse">
            <img src="<?= htmlspecialchars($image) ?>" alt="Profile Picture" class="rounded-circle mr-2"
              style="width:45px; height:45px; object-fit:cover;" onerror="this.src='images/male_cv.jpg'">
            <div>
              <p class="mb-0" style="font-size: 0.8rem; color: #ccc;"><?= $greeting ?></p>
              <h6 class="text-white"><?= htmlspecialchars("$firstname $lastname") ?></h6>
            </div>
          </div>
        </div>
      </a>
      <div>
        <a href="user-profile/notifications.php"><i class="fa fa-bell text-warning"></i></a>
      </div>
    </div>
  <?php else: ?>
    <?php include 'navbar.php'; ?>
  <?php endif; ?>

  <!-- <section class="hero-wrap hero-wrap-2" style="background-image: url('images/bg_4.jpg');">
    <div class="overlay"></div>
    <div class="container">
      <div class="row no-gutters slider-text align-items-center justify-content-center">
        <div class="col-md-9 pt-5 text-center">
          <p class="breadcrumbs"><span class="mr-2"><a href="index.php">Home <i class="fa fa-chevron-right"></i></a></span> <span>Explore <i class="fa fa-chevron-right"></i></span></p>
          <h1 class="mb-0 bread">Explore</h1>
        </div>
      </div>
    </div>
  </section> -->

  <div class="explore-layout">
    <div class="explore-page">
      <!-- Airbnb-style Search Bar -->
      <div class="search-bar-container">
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
          <div class="modal fade" id="filterModal" tabindex="-1" aria-labelledby="filterModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-bottom-sheet">
              <div class="modal-content p-3">

                <!-- Header -->
                <div class="modal-header1 d-flex justify-content-between align-items-center border-0">
                  <h5 class="modal-title" id="filterModalLabel">Filters</h5>
                  <button type="button" class="filter-close-btn btn-close" style="color: #000;" data-bs-dismiss="modal"
                    aria-label="Close"></button>
                </div>

                <!-- Body -->
                <div class="modal-body1">

                  <!-- Status (For Sale / For Rent) -->
                  <div class="mb-3">
                    <label class="form-label">Listing Type</label>
                    <div class="d-flex gap-2">
                      <button type="button" class="btn btn-outline-dark flex-fill filter-toggle-btn"
                        data-filter="status" data-value="For Sale">
                        For Sale
                      </button>
                      <button type="button" class="btn btn-outline-dark flex-fill filter-toggle-btn"
                        data-filter="status" data-value="For Rent">
                        For Rent
                      </button>
                    </div>
                  </div>

                  <!-- Location -->
                  <div class="mb-3">
                    <label class="form-label">Location</label>
                    <input id="locationInput" type="text" class="form-control"
                      placeholder="e.g., Nairobi, Westlands, Karen">
                  </div>

                  <!-- Property Type -->
                  <div class="mb-3">
                    <label class="form-label">Property Type</label>
                    <select id="propertyTypeSelect" class="form-select">
                      <option value="">Any Type</option>
                    </select>
                  </div>

                  <!-- Price Range -->
                  <div class="mb-3">
                    <label class="form-label">Price Range (KES)</label>
                    <div class="d-flex gap-2 mb-2">
                      <input id="minPriceInput" type="number" class="form-control" placeholder="Min" min="0"
                        step="10000">
                      <input id="maxPriceInput" type="number" class="form-control" placeholder="Max" min="0"
                        step="10000">
                    </div>
                    <div class="d-flex flex-wrap gap-2 mt-2">
                      <button type="button" class="btn btn-sm btn-outline-secondary price-preset" data-min="0"
                        data-max="5000000">Under 5M</button>
                      <button type="button" class="btn btn-sm btn-outline-secondary price-preset" data-min="5000000"
                        data-max="15000000">5M - 15M</button>
                      <button type="button" class="btn btn-sm btn-outline-secondary price-preset" data-min="15000000"
                        data-max="30000000">15M - 30M</button>
                      <button type="button" class="btn btn-sm btn-outline-secondary price-preset" data-min="30000000"
                        data-max="999999999">30M+</button>
                    </div>
                  </div>

                  <!-- Bedrooms -->
                  <div class="mb-3">
                    <label class="form-label">Bedrooms</label>
                    <div class="d-flex flex-wrap gap-2">
                      <button type="button" class="btn btn-outline-dark filter-toggle-btn" data-filter="beds"
                        data-value="1">1</button>
                      <button type="button" class="btn btn-outline-dark filter-toggle-btn" data-filter="beds"
                        data-value="2">2</button>
                      <button type="button" class="btn btn-outline-dark filter-toggle-btn" data-filter="beds"
                        data-value="3">3</button>
                      <button type="button" class="btn btn-outline-dark filter-toggle-btn" data-filter="beds"
                        data-value="4">4</button>
                      <button type="button" class="btn btn-outline-dark filter-toggle-btn" data-filter="beds"
                        data-value="5">5+</button>
                    </div>
                  </div>

                  <!-- Bathrooms -->
                  <div class="mb-3">
                    <label class="form-label">Bathrooms</label>
                    <div class="d-flex flex-wrap gap-2">
                      <button type="button" class="btn btn-outline-dark filter-toggle-btn" data-filter="baths"
                        data-value="1">1</button>
                      <button type="button" class="btn btn-outline-dark filter-toggle-btn" data-filter="baths"
                        data-value="2">2</button>
                      <button type="button" class="btn btn-outline-dark filter-toggle-btn" data-filter="baths"
                        data-value="3">3</button>
                      <button type="button" class="btn btn-outline-dark filter-toggle-btn" data-filter="baths"
                        data-value="4">4+</button>
                    </div>
                  </div>

                  <!-- Size (Square Feet) -->
                  <div class="mb-3">
                    <label class="form-label">Size (sq ft)</label>
                    <div class="d-flex gap-2 mb-2">
                      <input id="minSizeInput" type="number" class="form-control" placeholder="Min" min="0" step="100">
                      <input id="maxSizeInput" type="number" class="form-control" placeholder="Max" min="0" step="100">
                    </div>
                    <div class="d-flex flex-wrap gap-2 mt-2">
                      <button type="button" class="btn btn-sm btn-outline-secondary size-preset" data-min="0"
                        data-max="1000">Under 1000</button>
                      <button type="button" class="btn btn-sm btn-outline-secondary size-preset" data-min="1000"
                        data-max="2500">1000-2500</button>
                      <button type="button" class="btn btn-sm btn-outline-secondary size-preset" data-min="2500"
                        data-max="5000">2500-5000</button>
                      <button type="button" class="btn btn-sm btn-outline-secondary size-preset" data-min="5000"
                        data-max="999999">5000+</button>
                    </div>
                  </div>

                  <!-- Facilities/Amenities -->
                  <div class="mb-3">
                    <label class="form-label">Facilities & Amenities</label>
                    <div class="d-flex flex-wrap gap-2">
                      <button type="button" class="btn btn-sm btn-outline-dark filter-multi-btn"
                        data-filter="facilities" data-value="Pool">
                        <i class="fas fa-swimmer"></i> Pool
                      </button>
                      <button type="button" class="btn btn-sm btn-outline-dark filter-multi-btn"
                        data-filter="facilities" data-value="Parking">
                        <i class="fas fa-parking"></i> Parking
                      </button>
                      <button type="button" class="btn btn-sm btn-outline-dark filter-multi-btn"
                        data-filter="facilities" data-value="Gym">
                        <i class="fas fa-dumbbell"></i> Gym
                      </button>
                      <button type="button" class="btn btn-sm btn-outline-dark filter-multi-btn"
                        data-filter="facilities" data-value="Garden">
                        <i class="fas fa-seedling"></i> Garden
                      </button>
                      <button type="button" class="btn btn-sm btn-outline-dark filter-multi-btn"
                        data-filter="facilities" data-value="Security">
                        <i class="fas fa-shield-alt"></i> Security
                      </button>
                      <button type="button" class="btn btn-sm btn-outline-dark filter-multi-btn"
                        data-filter="facilities" data-value="Air Conditioning">
                        <i class="fas fa-fan"></i> AC
                      </button>
                      <button type="button" class="btn btn-sm btn-outline-dark filter-multi-btn"
                        data-filter="facilities" data-value="Pets">
                        <i class="fas fa-paw"></i> Pet Friendly
                      </button>
                      <button type="button" class="btn btn-sm btn-outline-dark filter-multi-btn"
                        data-filter="facilities" data-value="Furnished">
                        <i class="fas fa-couch"></i> Furnished
                      </button>
                      <button type="button" class="btn btn-sm btn-outline-dark filter-multi-btn"
                        data-filter="facilities" data-value="Elevator">
                        <i class="fas fa-sort-circle-up"></i> Elevator
                      </button>
                      <button type="button" class="btn btn-sm btn-outline-dark filter-multi-btn"
                        data-filter="facilities" data-value="WiFi">
                        <i class="fas fa-wifi"></i> WiFi
                      </button>
                    </div>
                  </div>

                  <!-- Verified Agent -->
                  <div class="mb-3">
                    <label class="form-label">Agent Verification</label>
                    <div class="d-flex gap-2">
                      <button type="button" class="btn btn-sm btn-outline-success filter-toggle-btn"
                        data-filter="verified_agent" data-value="true">
                        <i class="fas fa-check-circle"></i> Verified Agents Only
                      </button>
                    </div>
                  </div>

                  <!-- Featured Properties -->
                  <div class="mb-3">
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" id="featuredOnlyCheck">
                      <label class="form-check-label fw-bold" for="featuredOnlyCheck">
                        <i class="fas fa-star text-warning"></i> Featured Properties Only
                      </label>
                    </div>
                  </div>

                  <!-- Rating -->
                  <div class="mb-3">
                    <label class="form-label">Minimum Rating</label>
                    <div class="d-flex gap-2">
                      <button type="button" class="btn btn-sm btn-outline-dark filter-toggle-btn" data-filter="rating"
                        data-value="3">
                        3+ <i class="fas fa-star text-warning"></i>
                      </button>
                      <button type="button" class="btn btn-sm btn-outline-dark filter-toggle-btn" data-filter="rating"
                        data-value="4">
                        4+ <i class="fas fa-star text-warning"></i>
                      </button>
                      <button type="button" class="btn btn-sm btn-outline-dark filter-toggle-btn" data-filter="rating"
                        data-value="4.5">
                        4.5+ <i class="fas fa-star text-warning"></i>
                      </button>
                    </div>
                  </div>

                </div>

                <!-- Footer -->
                <div class="modal-footer1 border-0">
                  <button type="button" class="apply-btn w-100" id="applyFiltersBtn">Apply Filters</button>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="">
        <div class="explore-intro">
          <div class="d-flex justify-content-center mb-4">
            <!-- Progress Bar -->
            <div style="width: 98%; position: relative;">
              <div class="promo-progress-container">
                <div class="promo-progress-bar" id="promoProgressBar"></div>
              </div>
            </div>
          </div>
          <div class="section-header">
            <h6 class="mt-0" style="font-weight: 900; font-size: 1.8rem; color: white;">
              Featured
              <i class="fa fa-angle-right ml-1" aria-hidden="true"></i>
            </h6>

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

        <div class="d-flex justify-content-center mb-4 mt-5">
          <div style="width: 98%; position: relative;">
            <div class="promo-progress-container">
              <div class="promo-progress-bar"></div>
            </div>
          </div>
        </div>

        <div class="section-header">
          <h4 class="mb-2 mt-4"
            style="font-weight: 900; font-size: 1.8rem; color: white; margin-bottom: 2rem; padding-bottom: 1rem;">
            More to Explore
            <button id="refreshPropertiesBtn"
              style="background: none; color: #fff; border: none; border-radius: 4px; font-size: 1rem; font-weight: 100; margin-left: 0px; cursor: pointer;"
              title="Refresh property order">
              <i class="fa fa-refresh"></i>
            </button>
          </h4>
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
      </div>

      <div>
        <div class="main-box">
          <!-- ExploreLanding: property cards go here -->
          <div class="property-section">
            <div class="property-masonry" id="explore-landing">
            </div>
          </div>
        </div>
      </div>

      <div class="pagination-controls" id="pagination" style="margin-top: 2rem; text-align: center;">
        <!-- Pagination will be injected here -->
      </div>
    </div>
  </div>

  <?php if ($isLoggedIn): ?>
    <!-- Toast container for logged-in users -->
    <div id="toastContainer" style="position: fixed; top: 20px; right: 20px; z-index: 9999;"></div>
    <?php include 'user-profile/footer2.php'; ?>
  <?php else: ?>
    <?php include 'footer.php'; ?>
  <?php endif; ?>

  <script>
    // Handle authentication-required actions for non-logged-in users
    function requireAuth(action) {
      if (!isLoggedIn) {
        const authModal = document.getElementById('authModal');
        if (authModal) {
          const modal = new bootstrap.Modal(authModal);
          modal.show();
        } else {
          showToast('Please log in to ' + action, 'warning');
        }
        return false;
      }
      return true;
    }

    // Make requireAuth globally available
    window.requireAuth = requireAuth;
  </script>

  <script>
    const isLoggedIn = <?php echo $isLoggedIn ? 'true' : 'false'; ?>;
    const userId = <?php echo $userId ? $userId : 'null'; ?>;
    const userRole = '<?php echo $userRole; ?>';
  </script>

  <?php if ($isLoggedIn): ?>
    <!-- Scripts for logged-in users -->
    <script src="js/notification-badge.js"></script>
    <script src="js/profile-dropdown.js" defer></script>
    <script src="js/toggle-sections.js" defer></script>
    <script src="user-profile/js/dashboard-profile.js" defer></script>
    <script src="user-profile/js/footer2.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <?php endif; ?>

  <!-- Common scripts for all users -->
  <script src="js/config.js?v=<?php echo time(); ?>"></script>
  <script src="js/toast.js"></script>
  <script src="js/advanced-filters.js"></script>
  <script src="js/cookie-consent.js"></script>
  <script src="js/loading-manager.js"></script>
  <script src="js/smart-property-distribution.js"></script>
  <script src="js/rate-limiter.js"></script>
  <script src="js/bootstrap.bundle.min.js"></script>
  <script src="js/tiny-slider.js"></script>
  <script src="js/glightbox.min.js"></script>
  <script src="js/aos.js"></script>
  <script src="js/google-map.js"></script>
  <script src="js/main.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <script src="js/logout-handler.js" defer></script>
  <script src="js/favorites-handler.js" defer></script>
  <script src="js/price-formatter.js"></script>
  <script src="js/index.js"></script>
  <script src="js/mobile-modals.js"></script>
  <script type="module" src="js/login-register.js"></script>
  <script type="module" src="js/firebase.js"></script>
  <script src="js/explore.js"></script>
  <script src="js/smart-search-fixed.js"></script>

  <!-- Promotional Carousel Script -->
  <script>
    document.addEventListener('DOMContentLoaded', function () {
      const track = document.getElementById('promoCarouselTrack');
      const progressBar = document.getElementById('promoProgressBar');
      const slides = document.querySelectorAll('.promo-slide');

      if (!track || !progressBar || slides.length === 0) return;

      let currentSlide = 0;
      const totalSlides = slides.length;
      const slideInterval = 4000; // 4 seconds per slide
      let progressInterval;
      let slideTimer;

      function updateSlide() {
        // Move to next slide
        const translateX = -(currentSlide * (100 / totalSlides));
        track.style.transform = `translateX(${translateX}%)`;

        // Update active slide
        slides.forEach((slide, index) => {
          slide.classList.toggle('active', index === currentSlide);
        });
      }

      function startProgress() {
        let progress = 0;
        const progressStep = 100 / (slideInterval / 50); // Calculate exact step size
        progressBar.style.width = '0%';

        // Clear any existing interval
        if (progressInterval) {
          clearInterval(progressInterval);
        }

        progressInterval = setInterval(() => {
          progress += progressStep;
          progressBar.style.width = Math.min(progress, 100) + '%';

          // Stop progress when it reaches 100%
          if (progress >= 100) {
            clearInterval(progressInterval);
            progressBar.style.width = '100%';
          }
        }, 50);
      }

      function nextSlide() {
        // Clear current progress
        if (progressInterval) {
          clearInterval(progressInterval);
        }

        // Move to next slide
        currentSlide = (currentSlide + 1) % totalSlides;
        updateSlide();

        // Start progress for new slide
        startProgress();
      }

      function startCarousel() {
        // Start progress for first slide
        startProgress();

        // Set up timer for slide changes
        slideTimer = setInterval(nextSlide, slideInterval);
      }

      function stopCarousel() {
        if (slideTimer) {
          clearInterval(slideTimer);
        }
        if (progressInterval) {
          clearInterval(progressInterval);
        }
      }

      // Pause on hover
      track.addEventListener('mouseenter', stopCarousel);
      track.addEventListener('mouseleave', startCarousel);

      // Initialize first slide
      updateSlide();

      // Start the carousel
      startCarousel();
    });
  </script>

  <!-- Featured Filters Functionality -->
  <script>
    document.addEventListener('DOMContentLoaded', function () {
      // Load property types into the filter modal select from the API
      fetch('api/search-suggestions.php?type=property-types')
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            const select = document.getElementById('propertyTypeSelect');
            if (select) {
              data.data.forEach(t => {
                const opt = document.createElement('option');
                opt.value = t.value;
                opt.textContent = t.value + ' (' + t.count + ')';
                select.appendChild(opt);
              });
            }
          }
        })
        .catch(() => { });

      const filterButtons = document.querySelectorAll('.featured-filters button');
      const featuredContainer = document.getElementById('featured-scroll');

      // Set "All" as active by default
      if (filterButtons.length > 0) {
        filterButtons[0].classList.add('active');
      }

      // Add click event listeners to filter buttons
      filterButtons.forEach(button => {
        button.addEventListener('click', function () {
          const filterType = this.getAttribute('data-type');

          // Remove active class from all buttons
          filterButtons.forEach(btn => btn.classList.remove('active'));

          // Add active class to clicked button
          this.classList.add('active');

          // Filter the featured properties
          filterFeaturedProperties(filterType);
        });
      });

      function filterFeaturedProperties(type) {
        if (!featuredContainer) return;

        const propertyCards = featuredContainer.querySelectorAll('.property-card, .featured-item');

        propertyCards.forEach(card => {
          if (type === 'All') {
            // Show all properties
            card.style.display = 'block';
          } else {
            // Get property type from data attribute or text content
            const propertyType = card.getAttribute('data-type') ||
              card.querySelector('.property-type')?.textContent?.trim() ||
              card.querySelector('.type')?.textContent?.trim() ||
              '';

            // Show/hide based on filter
            if (propertyType.toLowerCase().includes(type.toLowerCase()) ||
              propertyType === type) {
              card.style.display = 'block';
            } else {
              card.style.display = 'none';
            }
          }
        });

        // Trigger a custom event for other scripts that might need to know about filtering
        document.dispatchEvent(new CustomEvent('featuredFiltered', {
          detail: { filterType: type }
        }));
      }
    });
  </script>

  <?php if (!$isLoggedIn): ?>
    <script src="js/footer.js"></script>
  <?php endif; ?>
</body>

</html>