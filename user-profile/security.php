<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
    header("Location: /hauzisha/index.php");
    exit();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <title>HAUZISHA - Security</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="icon" type="image/svg+xml" href="images/logo.png">
    <link rel="preconnect" href="https://fonts.gstatic.com/">
    <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@200;300;400;600;700&amp;display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" integrity="sha512-SfTiTlX6kk+qitfevl/7LibUOeJWlt9rbyDn92a1DqWOw9vWG2MFoays0sgObmWazO5BQPiFucnnEAjpAB+/Sw==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css" rel="stylesheet">
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
    <style>
        body {
            background-color: #000;
            color: #fff;
            min-height: 100vh;
        }

        .security-section {
            background: #000;
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 1rem;
        }

        .security-section h6 {
            color: #ffd700;
            margin-bottom: 2rem;
        }

        #changePasswordForm label{
            color: #fff;
        }

        .form-control, .form-select {
            background: #000;
            color: #999;
            border: 1px solid #222;
        }

        .form-control:focus, .form-select:focus {
            background: #121212;
            color: #fff;
            border-color: #282828;
            box-shadow: 0 0 0 0.2rem rgba(255, 215, 0, 0.85);
        }

        .btn-primary {
            background: #ffd700;
            color: #000;
            border: none;
            font-weight: 600;
            
        }

        .btn-primary:hover {
            background: #ffed4e;
            color: #000;
        }

        .toggle-switch {
            position: relative;
            display: inline-block;
            width: 50px;
            height: 24px;
        }

        .toggle-switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }

        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #444;
            transition: .4s;
            border-radius: 24px;
        }

        .slider:before {
            position: absolute;
            content: "";
            height: 18px;
            width: 18px;
            left: 3px;
            bottom: 3px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
        }

        input:checked + .slider {
            background-color: #ffd700;
        }

        input:checked + .slider:before {
            transform: translateX(26px);
        }
    </style>
</head>
<body style="background: linear-gradient(to bottom, #000, #121212); height: 100vh;">

<section class="container-sm">
    <h6 class="mt-5" style="font-weight: 900; cursor: pointer;" onclick="window.history.back()">
        <span><i class="fa fa-angle-left" aria-hidden="true"></i></span>&nbsp;&nbsp;&nbsp;Security
    </h6>

    <!-- Change Password Section -->
    <div class="security-section mt-4">
        <h6><i class="fa fa-lock"></i> Change Password</h6>
        <form id="changePasswordForm">
            <div class="mb-3">
                <label for="currentPassword" class="form-label">Current Password</label>
                <input type="password" class="form-control" id="currentPassword" name="current_password" required>
            </div>
            <div class="mb-3">
                <label for="newPassword" class="form-label">New Password</label>
                <input type="password" class="form-control" id="newPassword" name="new_password" required>
                <small class="" style="color: #444;">Minimum 8 characters</small>
            </div>
            <div class="mb-3">
                <label for="confirmPassword" class="form-label">Confirm New Password</label>
                <input type="password" class="form-control" id="confirmPassword" name="confirm_password" required>
            </div>
            <div id="passwordMessage" class="alert d-none" role="alert"></div>
            <button type="submit" class="btn btn-primary mt-2">Update Password</button>
        </form>
    </div>

    <!-- Two-Factor Authentication Section -->
    <div class="security-section">
        <h6><i class="fa fa-shield"></i> Two-Factor Authentication</h6>
        <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
                <p class="mb-0">Enable 2FA for extra security</p>
                <small class="" style="color: #444;">Receive a code via email when logging in</small>
            </div>
            <label class="toggle-switch">
                <input type="checkbox" id="twoFactorToggle">
                <span class="slider"></span>
            </label>
        </div>
        <div id="twoFactorMessage" class="alert d-none" role="alert"></div>
    </div>

    <div class="mb-5"></div>
</section>

<?php include 'footer2.php'; ?>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
<script src="../js/logout-handler.js" defer></script>
<script src="js/security.js"></script>
<script src="js/footer2.js"></script>

</body>
</html>
