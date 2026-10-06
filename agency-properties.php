<?php
if (session_status() == PHP_SESSION_NONE) {
  session_start();
}

if (isset($_SESSION['user_id'])) {
  $loggedIn = true;
  $userId = $_SESSION['user_id'];
} else {
  $loggedIn = false;
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
  <title>Hauzisha - Agency Properties</title>
  <meta charset="utf-8">
  <meta name="viewport"
    content="width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=no, maximum-scale=1">
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
  <link rel="stylesheet" href="css/new-label.css">
  <link rel="stylesheet" href="css/modal-backdrop.css">

  <style>
    .ap-details {
      padding-top: 4rem;
    }

    @media (max-width: 992px) {
      .ap-details {
        padding-top: 1rem;
      }
    }

    /* Dynamic heart styling for favorites */
    .property-card .fa-heart {
      transition: all 0.3s ease;
      cursor: pointer;
    }

    /* Default heart colors */
    .property-card .fa-heart {
      color: #ffd700 !important;
      /* Cards section hearts stay gold */
    }

    /* Favorited hearts are gold */
    .fa-heart.fas {
      color: #ffd700 !important;
    }

    /* Hover effects */
    .fa-heart:hover {
      transform: scale(1.1);
    }

    /* Price suffix styling for rentals */
    #price .price-suffix {
      font-size: 0.9em;
      color: inherit;
      margin-left: 4px;
      font-weight: inherit;
    }

    /* Price text overflow handling */
    #price {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 100%;
    }
  </style>
</head>

<body class="d-flex flex-column min-vh-100 flex-fill" style="background: linear-gradient(to bottom, #000, #121212);"
  data-logged-in="<?= isset($_SESSION['user_id']) ? 'true' : 'false' ?>">

  <main class="user-main-content px-0 py-0 flex-fill">
    <div class="hero-icons2">
      <i class="fa fa-angle-left" onclick="window.history.back()"
        style="cursor: pointer; margin-top: 2rem; margin-left: 1.7rem; color: #fff; font-size: 1.7rem;"></i>
    </div>

    <div id="agency-details"></div>

    <div class="explore-layout">
      <div class="explore-page">

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
  </main>

  <!-- Auth Modal and Bottom Nav -->
  <?php include 'auth-modal.php'; ?>

  <?php include 'footer.php'; ?>


  <!-- <p class="mt-0" style="font-size: 0.75rem; color: #bbb; display: flex; align-items: center; justify-content: center; gap: 4px;">
              <i class="fas fa-certificate" style="color: #ffd700; font-size: 0.7rem;"></i>
              EARB: ${agentData.earb_number || 'REA/2024/001234'}
            </p> -->

  <script src="js/config.js"></script>
  <script src="js/price-formatter.js"></script>
  <script src="js/smart-property-distribution.js"></script>
  <script src="js/smart-property-distribution.js"></script>
  <script src="js/bootstrap.bundle.min.js"></script>
  <script src="js/tiny-slider.js"></script>
  <script src="js/glightbox.min.js"></script>
  <script src="js/aos.js"></script>
  <script src="js/main.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/js/bootstrap.bundle.min.js"></script>
  <script src="js/toast.js" defer></script>
  <script src="js/favorites-handler.js" defer></script>
  <script src="js/agency-properties.js"></script>
  <script src="js/mobile-modals.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <script src="js/footer.js"></script>

  <script type="module" src="js/login-register.js"></script>
  <script type="module" src="js/firebase.js"></script>

  <script>
    // Fix double modal backdrop issue
    document.addEventListener('DOMContentLoaded', () => {
      const authModal = document.getElementById('authModal');
      if (authModal) {
        authModal.addEventListener('hidden.bs.modal', () => {
          // Remove all backdrops
          document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
          // Restore body scroll
          document.body.classList.remove('modal-open');
          document.body.style.overflow = '';
          document.body.style.paddingRight = '';
        });
      }
    });
  </script>
  <!-- <script src="js/footer.js"></script> -->

</body>

</html>