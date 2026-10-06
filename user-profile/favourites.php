<?php
require_once '../api/helpers/security.php';

// Require authentication and prevent caching
Security::requireAuth();
?>

<!DOCTYPE html>
<html lang="en">
<head>
	<title>HAUZISHA - Favourites</title>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
	<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
	<meta http-equiv="Pragma" content="no-cache">
	<meta http-equiv="Expires" content="0">
	<link rel="icon" type="image/svg+xml" href="../images/logo.png">
	<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css" rel="stylesheet">
	<link rel="preconnect" href="https://fonts.gstatic.com/">
	<link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@200;300;400;600;700&amp;display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <link rel="stylesheet" href="css/font-awesome.min.css">
  <link rel="stylesheet" href="css/ionicons.min.css">
	<link rel="stylesheet" href="../css/animate.css">
	<link rel="stylesheet" href="../css/flaticon.css">
	<link rel="stylesheet" href="../css/tiny-slider.css">
	<link rel="stylesheet" href="../css/glightbox.min.css">
	<link rel="stylesheet" href="../css/aos.css">
	<link rel="stylesheet" href="../css/style.css">
  <link rel="stylesheet" href="../css/mobile-modals.css">
  <link rel="stylesheet" href="../control-room/admin.css">
  <link rel="stylesheet" href="css/footer-fix.css">

  <style>
    .featured-container {
      position: relative;
      width: 100%;
      max-width: 100%;
      overflow: hidden;
      padding-bottom: 1.5rem;
      /* margin-bottom: 2rem; */
    }

    .featured-scroll {
      display: flex;
      overflow-x: auto;
      scroll-behavior: smooth;
      gap: 15px;
      padding: 10px 0;
    }

    /* Square card */
    .favorite-card {
      position: relative;
      width: 150px;
      height: 180px;
      border-radius: 12px;
      background-size: cover;
      background-position: center;
      text-align: center;
      cursor: pointer;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      display: flex;
      flex-direction: column;
      justify-content: flex-end; /* push content to bottom */
      align-items: center;       /* center horizontally */
      color: white;
      text-shadow: 0 1px 2px rgba(0,0,0,0.6);
      overflow: hidden; 
    }

    /* the overlay layer */
    .favorite-card::before {
      content: "";
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.4); /* adjust darkness here */
      transition: background 0.3s ease;
    }

    /* make it a little darker on hover for effect */
    .favorite-card:hover::before {
      background: rgba(0, 0, 0, 0.6);
    }

    .favorite-card > div {
      position: relative; /* keeps text above overlay */
      z-index: 2;
    }

    .favorite-icon {
      color: #ffd700;
      font-size: 1.3rem;
      /* margin-bottom: 5px; */
    }

    .favorite-title {
      font-weight: bold;
      margin-bottom: 8px;
    }



  </style>
</head>
<body class="d-flex flex-column min-vh-100" style="background: #000">
    
  <main class="pl-2 py-5 flex-fill container-xl">
  <h6 class="mb-5 text-light" style="font-weight: 900; cursor: pointer;" onclick="window.history.back()"><span><i class="fa fa-angle-left" aria-hidden="true"></i></span>&nbsp;&nbsp;&nbsp;Favourites</h6>

  </main>

  <?php include 'footer2.php'; ?>

  <script src="../js/logout-handler.js" defer></script>
  <script src="../js/toast.js" defer></script>
  <script src="../js/profile-dropdown.js" defer></script>
  <script src="js/footer2.js"></script>
  <script src="js/favourites.js"></script>
</body>
</html>