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
	<title>HAUZISHA - My Profile</title>
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

  <style>

    .profile-container {
      margin: 3rem;
    }

    @media (max-width: 768px) {
        .profile-container {
        margin: 1rem;
        }
    }

    .edit-card {
      background: #fff;
      border-radius: 5px;
      padding: 2rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
    }

    .profile-card {
      background: #fff;
      border-radius: 5px;
      overflow: hidden;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
    }

    .profile-header {
      background: url('../images/bg_4.jpg') center/cover no-repeat;
      height: 120px;
    }

    .profile-avatar {
      margin-top: -50px;
      border: 1px solid #ccc;
      border-radius: 50%;
      width: 100px;
      height: 100px;
      object-fit: cover;
      position: relative;
      display: block;
      margin-left: auto;
      margin-right: auto; /* <-- centers it */
    }

    .profile-card h4 {
      margin-top: 0.75rem;
      font-weight: 700;
      /* color: #ffd700; */
    }

    .profile-card p {
      font-size: 0.9rem;
      color: #aaa;
    }

    .btn-save {
      background: #ffd700;
      color: #000;
      font-weight: 600;
      transition: 0.2s ease-in-out;
    }

    .btn-save:hover {
      background: #e6c200;
    }

    .social-links i {
      font-size: 0.8rem;
      margin: 0 0.5rem;
      color: #282828;
      cursor: pointer;
    }

    .social-links i:hover {
      color: #ffd700;
    }
  </style>
</head>
<body style="background: #000;">

   <!-- Sidebar -->
    <?php include 'sidebar.php'; ?>
    <div class="overlay"></div>

    <?php include "header.php";
    renderDashboardHeader("Profile");
    ?>

    <main class="main-content px-3 py-0" style="padding-left: 2rem; padding-right: 2rem;">
        <div class="profile-container">
        <div class="row g-4">
            <!-- Edit Profile Form -->
            <div class="col-md-8 mb-3">
            <div class="edit-card">
            <h5 class="modal-title font-weight-bold mb-4" id="authModalLabel"><img src="../images/logo.png" style="height: 40px; width: 40px; "/> <strong style="color: #000; ">EDIT PROFILE</strong></h5>
                <!-- <h3 class="mb-4">Edit Profile</h3> -->
                <form>
                <div class="row g-3">
                    <div class="col-md-6">
                    <label class="form-label">First Name</label>
                    <input type="text" class="form-control" value="Leon">
                    </div>
                    <div class="col-md-6">
                    <label class="form-label">Last Name</label>
                    <input type="text" class="form-control" value="Urio">
                    </div>
                    <div class="col-md-12">
                    <label class="form-label">Email Address</label>
                    <input type="email" class="form-control" value="leonurio@gmail.com">
                    </div>
                    <div class="col-md-12">
                    <label class="form-label">Address</label>
                    <input type="text" class="form-control" placeholder="Enter your address">
                    </div>
                    <div class="col-md-4">
                    <label class="form-label">City</label>
                    <input type="text" class="form-control">
                    </div>
                    <div class="col-md-4">
                    <label class="form-label">Country</label>
                    <input type="text" class="form-control">
                    </div>
                    <div class="col-md-4">
                    <label class="form-label">ZIP Code</label>
                    <input type="text" class="form-control">
                    </div>
                    <div class="col-md-12">
                    <label class="form-label">About Me</label>
                    <textarea class="form-control" rows="3" placeholder="Tell us something about yourself..."></textarea>
                    </div>
                </div>
                <button type="submit" class="btn btn-save mt-3">Save Changes</button>
                </form>
            </div>
            </div>

            <!-- Profile Card -->
            <div class="col-md-4 mb-5">
            <div class="profile-card pb-3">
                <div class="profile-header"></div>
                <div>
                <img src="../images/male_cv.jpg" alt="Profile Picture" class="profile-avatar">
                </div>
                <h4 class="mb-0">Leon Urio</h4>
                <p class="mt-0">@leonurio</p>
                <p>"Exploring space. Reimagining real estate."</p>
            </div>
            </div>
        </div>
        </div>
    </main>

    <?php include 'footer2.php'; ?>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="../js/toast.js" defer></script>
    <script src="sidebar.js" defer></script>

</body>
</html>