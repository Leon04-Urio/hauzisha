<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// // OPTIONAL: Authentication check
if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
  header("Location: /hauzisha/index.php");
  exit();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
	<title>HAUZISHA - Notifications</title>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
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
  <link rel="stylesheet" href="../control-room/admin.css">
  <link rel="stylesheet" href="css/footer-fix.css">

  <style>
    .empty-state i {
        font-size: 3rem;
        color: #555;
        margin-bottom: 1rem;
        }
        .empty-state p {
        font-size: 0.9rem;
        color: #555;
        }
  </style>
</head>
<body class="d-flex flex-column min-vh-100" style="background: linear-gradient(to bottom, #000, #121212); height: 100vh;">
    

  <main class="user-main-content container-sm px-2 py-3 flex-fill">
    <div class="container-sm">
      <h6 class="mb-5 mt-5 text-light" style="font-weight: 900; cursor: pointer;" onclick="window.history.back()">
          <span><i class="fa fa-angle-left" aria-hidden="true"></i></span>&nbsp;&nbsp;&nbsp;Notifications
      </h6>

      <!-- Dynamic notifications will be rendered here by JS -->
      <div id="notifications-container"></div>

    </div>
  </main>

  <!-- Notification Modal -->
  <div class="modal fade" id="notificationModal" tabindex="-1" aria-labelledby="notificationModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content bg-light text-dark">
        <div class="modal-header">
          <h6 class="modal-title" id="notificationModalLabel">Notification</h6>
          <button type="button" class="btn-close btn-close-dark" style="font-size: 0.5rem;" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body" id="notificationModalBody">
          <!-- Notification text will be inserted here -->
        </div>
        <!-- <div class="modal-footer">
          <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Close</button>
        </div> -->
      </div>
    </div>
  </div>

  <?php include 'footer2.php'; ?>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/js/bootstrap.bundle.min.js"></script>
  <script src="../js/notification-badge.js"></script>
  <script src="../js/logout-handler.js" defer></script>
  <script src="../js/toast.js" defer></script>
  <script src="../js/profile-dropdown.js" defer></script>
  <script src="js/footer2.js"></script>
  <script src="js/notifications.js"></script>

</body>
</html>