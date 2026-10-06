<?php
if (session_status() == PHP_SESSION_NONE) {
  session_start();
}

if (isset($_SESSION['user_id'])) {
  $loggedIn = true;
  $userId = $_SESSION['user_id']; // use this if you need it
} else {
  $loggedIn = false;
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
  <title>Hauzisha - Property Details</title>
  <meta charset="utf-8">
  <meta name="viewport"
    content="width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=no, maximum-scale=1">

  <!-- Open Graph Meta Tags for Social Media Sharing -->
  <meta property="og:title" content="Property Details - HAUZISHA">
  <meta property="og:description"
    content="Discover amazing properties with immersive virtual tours and detailed information.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="">
  <meta property="og:image" content="">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="HAUZISHA">

  <!-- Twitter Card Meta Tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Property Details - HAUZISHA">
  <meta name="twitter:description"
    content="Discover amazing properties with immersive virtual tours and detailed information.">
  <meta name="twitter:image" content="">

  <link rel="icon" type="image/svg+xml" href="images/logo.png">
  <link rel="preconnect" href="https://fonts.gstatic.com/">
  <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@200;300;400;600;700&amp;display=swap"
    rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <link rel="stylesheet" href="path/to/font-awesome/css/font-awesome.min.css">
  <link rel="stylesheet" href="css/font-awesome.min.css">
  <link rel="stylesheet" href="css/ionicons.min.css">
  <link rel="stylesheet" href="css/animate.css">
  <link rel="stylesheet" href="css/flaticon.css">
  <link rel="stylesheet" href="css/tiny-slider.css">
  <link rel="stylesheet" href="css/glightbox.min.css">
  <link rel="stylesheet" href="css/aos.css">
  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="css/property-gallery.css">
  <link rel="stylesheet" href="css/mobile-modals.css">
  <link rel="stylesheet" href="css/modal-backdrop.css">
  <link rel="stylesheet" href="css/property-units.css">

  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      overflow-x: hidden;
      background: linear-gradient(to bottom, #000, #282828);
    }

    /* HERO SECTION - Back to original relative positioning */
    .property-hero {
      position: relative;
      width: 100%;
      height: 65vh;
      /* background: url('images/work-1.jpg') center/cover no-repeat; */
      display: flex;
      align-items: flex-end;
      justify-content: center;
      text-align: center;
      color: white;
      overflow: hidden;
      /* Ensure iframe stays behind the sliding content */
      z-index: 1;
    }

    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.8));
      z-index: 1;
      pointer-events: none;
    }

    .hero-content {
      position: relative;
      z-index: 2;
      margin-bottom: 3rem;
      animation: fadeInUp 1.5s ease;
      text-align: center;
    }

    .hero-icons {
      position: absolute;
      top: 1.5rem;
      left: 1.5rem;
      right: 1.5rem;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .hero-icons2 {
      z-index: 9999;
      position: absolute;
      top: 1.5rem;
      left: 1.5rem;
      right: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      pointer-events: none;
    }

    .back-btn {
      font-size: 1rem;
      cursor: pointer;
      transition: 0.3s;
      color: #fff;
      background: rgba(255, 255, 255, 0.15);
      padding: 0.7rem 1rem;
      border-radius: 50%;
      backdrop-filter: blur(7px);
    }

    .fav-btn {
      background: rgba(255, 255, 255, 0.15);
      padding: 0.3rem 0.8rem;
      border-radius: 50%;
      backdrop-filter: blur(7px);
      transition: 0.3s;
      cursor: pointer;
    }

    .fav-btn:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .hero-title {
      font-size: 2rem;
      font-weight: 900;
      margin-bottom: 0.5rem;
      color: #fff;
    }

    .hero-subtitle {
      color: #ddd;
      font-size: 0.95rem;
    }

    /* MAIN SECTION - Back to original */
    .property-info {
      background-color: #000;
      padding-top: 2rem;
      padding-bottom: 2rem;
      margin: 0 auto;
      position: relative;
      z-index: 10;
      transition: transform 0.3s ease-out;
      /* Default: no overlap, no curves for desktop/laptop */
      margin-top: 0;
      border-top-left-radius: 0;
      border-top-right-radius: 0;
    }

    /* Smooth sliding effect styles */
    .property-details-container {
      position: relative;
    }

    /* Mobile: Enable overlapping, curves, and sliding behavior */
    @media (max-width: 768px) {
      .property-info {
        /* Mobile-only: overlapping and curved edges */
        margin-top: -9vh;
        border-top-left-radius: 30px;
        border-top-right-radius: 30px;
      }

      /* Add shadow to property-info when sliding (mobile only) */
      .property-info::before {
        content: '';
        position: absolute;
        top: -20px;
        left: 0;
        right: 0;
        height: 20px;
        background: linear-gradient(to bottom, transparent, rgba(10, 10, 10, 0.1));
        pointer-events: none;
      }

      .property-hero {
        height: 85vh;
        /* Slightly shorter on mobile for better UX */
      }
    }

    /* Desktop/Laptop: Clean layout, no overlap, no curves */
    @media (min-width: 769px) {
      .property-info {
        /* Reset any transforms that might be applied */
        transform: none !important;
        box-shadow: none !important;
        /* Clean separation from hero - no overlap */
        margin-top: 0;
        /* No curved edges on desktop */
        border-top-left-radius: 0;
        border-top-right-radius: 0;
      }

      /* Remove shadow effect on desktop */
      .property-info::before {
        display: none;
      }
    }

    /* Large screens get even taller iframe */
    @media (min-width: 1200px) {
      .property-hero {
        height: 95vh;
        /* Maximum height on large screens */
      }
    }

    .property-card {
      background: #141414;
      border-radius: 20px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      transition: all 0.4s ease;
    }

    .property-card.glass {
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .property-card h2 {
      font-size: 1.3rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }

    .prop-details {
      display: flex;
      gap: 1.5rem;
      margin-top: 1rem;
    }

    .prop-details div {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      color: #bbb;
    }

    .agent-img {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      padding: 0;
      object-fit: cover;
      /* ✅ crop & fill nicely */
      display: block;
    }



    .map-frame iframe {
      width: 100%;
      height: 300px;
      border: 0;
      border-radius: 15px;
    }


    /* ANIMATIONS */
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .comment-textarea::placeholder {
      color: #999999;
      opacity: 1;
      /* ensures full visibility */
    }

    .lightbox-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }

    .lightbox-image {
      max-width: 90%;
      max-height: 90%;
    }

    .lightbox-close,
    .lightbox-prev,
    .lightbox-next {
      position: absolute;
      color: white;
      font-size: 2rem;
      cursor: pointer;
      user-select: none;
    }

    .lightbox-close {
      top: 20px;
      right: 30px;
    }

    .lightbox-prev {
      top: 50%;
      left: 15px;
      transform: translateY(-50%);
    }

    .lightbox-next {
      top: 50%;
      right: 15px;
      transform: translateY(-50%);
    }

    .share-bubble {
      position: fixed;
      bottom: -200px;
      /* hidden by default */
      left: 50%;
      transform: translateX(-50%);
      background: #fff;
      width: 90%;
      max-width: 350px;
      border-radius: 20px 20px 10px 10px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      padding: 15px 20px;
      text-align: center;
      z-index: 10000;
      /* Higher than booking bar */
      transition: bottom 0.3s ease;
      font-family: sans-serif;
    }

    .share-bubble.active {
      bottom: 85px;
      /* Position just above the booking bar */
    }

    /* Add a small arrow pointing down to the booking bar */
    .share-bubble::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-top: 8px solid #fff;
    }

    .share-bubble-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      font-weight: bold;
      font-size: 1rem;
    }

    .share-bubble .share-close {
      cursor: pointer;
      font-size: 1.3rem;
      transition: color 0.2s;
    }

    .share-bubble .share-close:hover {
      color: #000;
    }

    .share-icons {
      display: flex;
      justify-content: space-around;
      gap: 10px;
    }

    .share-icons a {
      width: 45px;
      height: 45px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 1.2rem;
      transition: all 0.2s ease;
    }

    /* Brand colors */
    /* .share-icons a.share-whatsapp { background: #25D366; }
    .share-icons a.share-facebook { background: #1877F2; }
    .share-icons a.share-twitter  { background: #1DA1F2; }
    .share-icons a.share-email    { background: #FF8C00; } */

    .share-icons a.share-whatsapp {
      background: #000;
    }

    .share-icons a.share-facebook {
      background: #000;
    }

    .share-icons a.share-twitter {
      background: #000;
    }

    .share-icons a.share-email {
      background: #000;
    }

    .share-icons a.share-copy {
      background: #000;
    }

    /* Hover effect */
    .share-icons a:hover {
      transform: translateY(-5px) scale(1.1);
      filter: brightness(1.1);
    }


    /* Optional: animate heart on click */
    .fav-btn.hearted i {
      color: #ff4757;
      /* filled heart color */
      animation: pop 0.3s ease;
    }

    @keyframes pop {
      0% {
        transform: scale(1);
      }

      50% {
        transform: scale(1.4);
      }

      100% {
        transform: scale(1);
      }
    }

    .agent-icons i {
      transition: all 0.3s ease;
      cursor: pointer;
      font-size: 1.3rem;
      margin-right: 1rem;
      color: #555;
    }

    .agent-icons i:hover {
      transform: scale(1.2);
    }

    /* WhatsApp (chat icon) glow */
    .agent-icons .fa-whatsapp:hover {
      color: #25D366;
      /* WhatsApp green */
      text-shadow: 0 0 10px rgba(37, 211, 102, 0.8);
    }

    /* Call (phone icon) glow */
    .agent-icons .fa-phone:hover {
      color: #007AFF;
      /* iOS blue */
      text-shadow: 0 0 10px rgba(0, 122, 255, 0.8);
    }

    .agent-icons i:active {
      transform: scale(1.05);
      opacity: 0.9;
    }

    .facility-icon {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin: 0.5rem;
      cursor: pointer;
    }

    .facility-label {
      position: absolute;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      background: #111;
      color: #fff;
      padding: 4px 8px;
      font-size: 0.8rem;
      border-radius: 4px;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease, transform 0.2s ease;
    }

    .facility-icon.show-label .facility-label {
      opacity: 1;
      transform: translateX(-50%) translateY(2px);
    }

    /* Enhanced recommendations styling */
    .furniture-item {
      position: relative;
      border-radius: 8px;
      overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .furniture-item:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    }

    .showroom-tag {
      position: absolute;
      top: 8px;
      left: 8px;
      background: rgba(255, 215, 0, 0.9);
      color: #000;
      padding: 2px 6px;
      border-radius: 2px;
      font-size: 0.7rem;
      /* font-weight: bold; */
      z-index: 2;
      backdrop-filter: blur(5px);
    }

    /* .showroom-tag {
      position: absolute;
      top: 8px;
      left: 8px;
      background: rgba(255, 215, 0, 0.9);
      color: #000;
      padding: 3px 10px;
      border-radius: 30px;
      font-size: 0.65rem;
      z-index: 2;
      backdrop-filter: blur(5px);
  } */

    .furniture-item img {
      width: 100%;
      height: 200px;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .furniture-item:hover img {
      transform: scale(1.05);
    }

    .overlay-btn {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .furniture-item:hover .overlay-btn {
      opacity: 1;
    }

    .view-btn {
      background: #ffd700;
      color: #000;
      border: none;
      padding: 8px 16px;
      /* border-radius: 20px; */
      font-weight: bold;
      font-size: 0.7rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .view-btn:hover {
      background: #e6c200;
      color: #000;
      /* transform: scale(1.02); */
    }

    /* Floating Booking Bar */
    .floating-booking-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      width: 100%;
      max-width: 100vw;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(10px);
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding: 1rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 9999;
      box-sizing: border-box;
    }

    .price-info span {
      color: #999;
      font-size: 0.9rem;
      display: block;
    }

    .price-info h4 {
      margin: 0;
      font-weight: bold;
      font-size: 1.2rem;
      white-space: nowrap;
      color: white !important;
    }



    /* Mobile adjustments for booking bar */
    @media (max-width: 768px) {
      .floating-booking-bar {
        padding: 0.75rem 1rem;
      }

      .price-info h4 {
        font-size: 1rem;
        white-space: nowrap;
        color: white !important;
      }


    }

    /* Fix gap between verified stamp and recommendations */
    .verified-container {
      margin-bottom: 0.5rem;
      margin-top: 1rem;
    }

    .property-recommendations {
      margin-top: 0.5rem;
      padding-bottom: 0rem;
      /* Add space for floating booking bar */
    }
  </style>
</head>

<body data-logged-in="<?= isset($_SESSION['user_id']) ? 'true' : 'false' ?>"
  style="background: linear-gradient(to bottom, #000, #282828);">

  <section style="background: linear-gradient(to bottom, #000, #282828);">
    <div class="pview-sidebar"></div>
    <div id="property-details" style="background: linear-gradient(to bottom, #000, #282828);"></div>

    <style>
      /* OTP Input Circles */
      .otp-input {
        width: 45px;
        height: 45px;
        border: 2px solid #ddd;
        border-radius: 50%;
        text-align: center;
        font-size: 1.5rem;
        font-weight: 600;
        transition: all 0.3s ease;
        outline: none;
      }

      .otp-input:focus {
        border-color: #ffd700;
        box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.1);
        transform: scale(1.05);
      }

      .otp-input.filled {
        border-color: #ffd700;
        background: rgba(255, 215, 0, 0.05);
      }

      /* Smart input with country code */
      .phone-email-input.phone-mode {
        padding-left: 45px !important;
      }

      @media (max-width: 480px) {
        .otp-input {
          width: 40px;
          height: 40px;
          font-size: 1.3rem;
        }
      }
    </style>

    <div class="modal fade" id="authModal" tabindex="-1" aria-labelledby="authModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content py-2 px-1">
          <div class="modal-header">
            <h5 class="modal-title font-weight-bold" id="authModalLabel"><img src="images/logo.png"
                style="height: 40px; width: 40px; " /> <strong style="color: #000; ">HAUZISHA</strong></h5>

            <button type="button" class="btn-close" style="font-size: 0.7rem;" data-bs-dismiss="modal"
              aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <!-- Nav Tabs -->
            <ul class="nav nav-tabs" id="authTabs" role="tablist">
              <li class="nav-item" role="presentation">
                <button class="nav-link active" id="login-tab" data-bs-toggle="tab" data-bs-target="#login"
                  type="button" role="tab" aria-controls="login" aria-selected="true">Login</button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" id="register-tab" data-bs-toggle="tab" data-bs-target="#register" type="button"
                  role="tab" aria-controls="register" aria-selected="false">Register</button>
              </li>
            </ul>
            <!-- Tab Content -->
            <div class="tab-content" id="authTabsContent">

              <!-- Login Tab -->
              <div class="tab-pane fade show active" id="login" role="tabpanel" aria-labelledby="login-tab">

                <!-- Step 1: Contact Input -->
                <form class="mt-4" id="login-form" style="display: block;">
                  <!-- Email or Phone -->
                  <div class="mb-4">
                    <label for="loginEmail" class="form-label">Email or Phone number</label>
                    <div style="position: relative;">
                      <div id="loginCountryCode"
                        style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); display: none; align-items: center; gap: 6px; pointer-events: none; z-index: 2;">
                        <span style="font-size: 1.2rem;">🇰🇪</span>
                      </div>
                      <input type="text" class="form-control phone-email-input" id="loginEmail"
                        placeholder="Enter your phone number or email" autocomplete="tel email"
                        style="padding-left: 12px;">
                    </div>
                    <small id="loginEmailError" class="text-danger"></small>
                    <small id="loginInputType" class="text-muted" style="font-size: 0.75rem;"></small>
                  </div>

                  <!-- Remember Me & Forgot Password -->
                  <div class="d-flex justify-content-between align-items-center mt-1" style="font-size: 0.9rem;">
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" id="rememberMe">
                      <label class="form-check-label" for="rememberMe">Remember Me</label>
                    </div>
                    <!-- <a href="forgot-password.php" class="tc-mail">Forgot Password?</a> -->
                  </div>

                  <!-- Login Button -->
                  <button type="submit" class="btn btn-primary w-100 mt-3" id="loginSubmit">Continue</button>
                </form>

                <!-- Step 2: OTP Verification -->
                <div id="login-otp-step" style="display: none;">
                  <div class="mb-4">
                    <label for="loginOTP" class="form-label text-center d-block">Enter OTP</label>
                    <div class="otp-input-container"
                      style="display: flex; gap: 8px; justify-content: center; margin: 1.5rem 0;">
                      <input type="text" class="otp-input" maxlength="1" data-index="0" autocomplete="off">
                      <input type="text" class="otp-input" maxlength="1" data-index="1" autocomplete="off">
                      <input type="text" class="otp-input" maxlength="1" data-index="2" autocomplete="off">
                      <input type="text" class="otp-input" maxlength="1" data-index="3" autocomplete="off">
                      <input type="text" class="otp-input" maxlength="1" data-index="4" autocomplete="off">
                      <input type="text" class="otp-input" maxlength="1" data-index="5" autocomplete="off">
                    </div>
                    <!-- Hidden input for compatibility -->
                    <input type="hidden" id="loginOTP">
                    <small class="form-text text-muted text-center d-block">Enter the 6-digit code sent to <span
                        id="loginSentToContact"></span></small>
                    <small id="loginOTPError" class="text-danger text-center d-block"></small>
                  </div>

                  <!-- Timer and Resend -->
                  <div class="text-center mb-3">
                    <small class="text-muted">
                      <span id="loginOtpTimer">Resend OTP in <span id="loginCountdown">60</span>s</span>
                      <button type="button" class="btn btn-link btn-sm p-0" id="resendLoginOTPBtn"
                        style="display: none;">Resend OTP</button>
                    </small>
                  </div>

                  <!-- Verify OTP Button (Hidden - auto-submits) -->
                  <button type="button" class="btn btn-primary w-100" id="verifyLoginOTPBtn"
                    style="display: none;">Verify OTP</button>

                  <!-- Back Button -->
                  <button type="button" class="btn btn-outline-secondary w-100 mt-2"
                    id="backToLoginContactBtn">Back</button>
                </div>

                <!-- Social Login Buttons -->
                <div class="text-center mt-4" id="social-login-section">
                  <div class="d-flex align-items-center my-3">
                    <hr style="flex:1; border-top:1px solid #000; margin-right:10px;">
                    <p class="mb-0" style="font-size:0.9rem; white-space: nowrap;">Or login with</p>
                    <hr style="flex:1; border-top:1px solid #000; margin-left:10px;">
                  </div>

                  <div class="d-flex justify-content-center gap-2">
                    <button id="googleLogin" class="btn w-100 h-14" style="background: #000; color: #fff;">
                      <i class="fab fa-google me-2" aria-hidden="true"></i> Google
                    </button>
                  </div>
                </div>

                <!-- Signup Link -->
                <div class="mt-3 text-center" id="signup-link-section">
                  <p style="font-size: 0.9rem;">Don't have an account? <span class="tc-mail signup-link"
                      style="color: #ffd700; cursor: pointer;">Signup</span></p>
                </div>
              </div>


              <!-- Register Tab -->
              <div class="tab-pane fade" id="register" role="tabpanel" aria-labelledby="register-tab">

                <!-- Step 1: Contact Input -->
                <form class="mt-3" id="register-form" style="display: block;">
                  <div class="mb-3">
                    <label for="registerEmail" class="form-label">Email or Phone number</label>
                    <div style="position: relative;">
                      <div id="registerCountryCode"
                        style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); display: none; align-items: center; gap: 6px; pointer-events: none; z-index: 2;">
                        <span style="font-size: 1.2rem;">🇰🇪</span>
                      </div>
                      <input type="text" class="form-control phone-email-input" id="registerEmail" name="email"
                        placeholder="Enter email or phone number" aria-describedby="registerEmailError"
                        autocomplete="tel email" style="padding-left: 12px;">
                    </div>
                    <small id="registerEmailError" class="text-danger"></small>
                    <small id="registerInputType" class="text-muted" style="font-size: 0.75rem;"></small>
                  </div>

                  <!-- Terms & Conditions -->
                  <div class="form-check mb-3" style="font-size: 0.9rem;">
                    <input class="form-check-input" type="checkbox" id="termsCheck">
                    <label class="form-check-label" for="termsCheck">
                      I agree to the <a href="t&c.php" class="tc-mail">Terms & Conditions</a>
                    </label>
                  </div>

                  <button type="submit" class="btn btn-primary w-100 mb-3" id="registerSubmit" disabled>Send
                    OTP</button>
                </form>

                <!-- Step 2: OTP Verification -->
                <div id="register-otp-step" style="display: none;">
                  <div class="mb-4">
                    <label for="registerOTP" class="form-label text-center d-block">Enter OTP</label>
                    <div class="otp-input-container"
                      style="display: flex; gap: 8px; justify-content: center; margin: 1.5rem 0;">
                      <input type="text" class="otp-input" maxlength="1" data-index="0" autocomplete="off">
                      <input type="text" class="otp-input" maxlength="1" data-index="1" autocomplete="off">
                      <input type="text" class="otp-input" maxlength="1" data-index="2" autocomplete="off">
                      <input type="text" class="otp-input" maxlength="1" data-index="3" autocomplete="off">
                      <input type="text" class="otp-input" maxlength="1" data-index="4" autocomplete="off">
                      <input type="text" class="otp-input" maxlength="1" data-index="5" autocomplete="off">
                    </div>
                    <!-- Hidden input for compatibility -->
                    <input type="hidden" id="registerOTP">
                    <small class="form-text text-muted text-center d-block">Enter the 6-digit code sent to <span
                        id="regSentToContact"></span></small>
                    <small id="registerOTPError" class="text-danger text-center d-block"></small>
                  </div>

                  <!-- Timer and Resend -->
                  <div class="text-center mb-3">
                    <small class="text-muted">
                      <span id="regOtpTimer">Resend OTP in <span id="regCountdown">60</span>s</span>
                      <button type="button" class="btn btn-link btn-sm p-0" id="resendRegOTPBtn"
                        style="display: none;">Resend OTP</button>
                    </small>
                  </div>

                  <!-- Verify OTP Button (Hidden - auto-submits) -->
                  <button type="button" class="btn btn-primary w-100" id="verifyRegOTPBtn" style="display: none;">Verify
                    OTP</button>

                  <!-- Back Button -->
                  <button type="button" class="btn btn-outline-secondary w-100 mt-2"
                    id="backToRegContactBtn">Back</button>
                </div>

                <!-- Step 3: Complete Registration -->
                <div id="register-complete-step" style="display: none;">
                  <div class="alert alert-success">
                    <strong>Verification Successful!</strong><br>
                    Please provide additional details to complete your registration.
                  </div>

                  <div class="mb-3">
                    <label for="phoneRegFn" class="form-label">First Name</label>
                    <input type="text" class="form-control" id="phoneRegFn" placeholder="Enter your first name">
                  </div>

                  <div class="mb-3">
                    <label for="phoneRegLn" class="form-label">Last Name</label>
                    <input type="text" class="form-control" id="phoneRegLn" placeholder="Enter your last name">
                  </div>

                  <div class="mb-3">
                    <label for="phoneRegEmailOpt" class="form-label">Email (Optional)</label>
                    <input type="email" class="form-control" id="phoneRegEmailOpt"
                      placeholder="Enter your email (optional)">
                  </div>

                  <!-- Terms & Conditions -->
                  <div class="form-check mb-3" style="font-size: 0.9rem;">
                    <input class="form-check-input" type="checkbox" id="phoneRegTermsCheck">
                    <label class="form-check-label" for="phoneRegTermsCheck">
                      I agree to the <a href="t&c.php" class="tc-mail">Terms & Conditions</a>
                    </label>
                  </div>

                  <button type="button" class="btn btn-primary w-100" id="completePhoneRegistrationBtn"
                    disabled>Complete Registration</button>
                </div>

                <!-- OR Separator -->
                <div class="d-flex align-items-center my-3" id="social-register-separator">
                  <hr style="flex:1; border-top:1px solid #000; margin-right:10px;">
                  <p class="mb-0" style="font-size:0.9rem; white-space: nowrap;">Or register with</p>
                  <hr style="flex:1; border-top:1px solid #000; margin-left:10px;">
                </div>

                <!-- Social Login Buttons -->
                <div class="d-flex justify-content-center gap-2 m-0 p-0" id="social-register-buttons">
                  <button class="btn w-100 h-14" id="googleRegister" style="background: #000; color: #fff;"><i
                      class="fab fa-google me-2" aria-hidden="true"></i> Google</button>
                </div>

                <div class="mt-3 text-center" id="login-link-section">
                  <p style="font-size: 0.9rem;">Already have an account? <span class="tc-mail login-link"
                      style="color: #ffd700; cursor:pointer;" data-bs-toggle="tab" data-bs-target="#login">Login</span>
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Floating Share Bubble -->

    <div id="share-bubble" class="share-bubble">

      <div class="share-bubble-header">

        <span>Share</span>

        <span class="share-close">&times;</span>

      </div>

      <div class="share-icons">

        <a href="#" class="share-whatsapp" target="_blank" rel="noopener noreferrer" title="Share on WhatsApp">

          <i class="fab fa-whatsapp"></i>

        </a>

        <a href="#" class="share-facebook" target="_blank" rel="noopener noreferrer" title="Share on Facebook">

          <i class="fab fa-facebook-f"></i>

        </a>

        <a href="#" class="share-twitter" target="_blank" rel="noopener noreferrer" title="Share on Twitter">

          <i class="fab fa-twitter"></i>

        </a>

        <a href="#" class="share-email" title="Share via Email">

          <i class="fas fa-envelope"></i>

        </a>

        <a href="#" class="share-copy" id="copyLinkBtn" title="Copy Link">

          <i class="fas fa-link"></i>

        </a>

      </div>

    </div>

  </section>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/js/all.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <script src="js/config.js"></script>
  <script src="js/price-formatter.js"></script>
  <script src="js/smart-property-distribution.js"></script>
  <script src="js/smart-recommendations.js"></script>
  <script src="js/loading-manager.js"></script>
  <script src="js/rate-limiter.js"></script>
  <script src="js/bootstrap.bundle.min.js"></script>
  <script src="js/tiny-slider.js"></script>
  <script src="js/glightbox.min.js"></script>
  <script src="js/aos.js"></script>
  <script src="js/main.js"></script>
  <script src="js/toast.js"></script>
  <script src="js/logout-handler.js"></script>
  <script src="js/favorites-handler.js"></script>
  <script src="js/update-property-rating.js"></script>
  <script src="js/property-reviews.js"></script>
  <script src="js/property-gallery.js"></script>
  <script src="js/explore.js"></script>
  <script src="js/property-details.js"></script>
  <script src="js/property-units-bidirectional.js"></script>
  <script src="js/mobile-modals.js"></script>
  <script type="module" src="js/login-register.js"></script>
  <script type="module" src="js/firebase.js"></script>

</body>

</html>